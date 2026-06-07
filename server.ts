import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Agent, setGlobalDispatcher } from "undici";

dotenv.config();

// Configure global undici fetch dispatcher with a 5-minute timeout.
// This prevents "HeadersTimeoutError: Headers Timeout Error" during long-running complex JSON generations with base64 photos.
const globalDispatcher = new Agent({
  headersTimeout: 300000,
  bodyTimeout: 300000,
  connectTimeout: 300000,
  keepAliveTimeout: 300000,
});
setGlobalDispatcher(globalDispatcher);

const app = express();
const PORT = 3000;

// Set up JSON payload limit to handle base64 images elegantly
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini AI client instance
const initGemini = (): GoogleGenAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
      timeout: 300000,
    },
  });
};

const ai = initGemini();

// API endpoint to analyze real property inputs and images
app.post("/api/analyze", async (req, res) => {
  try {
    const { input, photos, floorPlan } = req.body;
    
    if (!input) {
      return res.status(400).json({ error: "Missing input properties" });
    }

    const {
      address = "N/D",
      comune = "N/D",
      cap = "N/D",
      price = 0,
      sqm = 0,
      rooms = "N/D",
      energyClass = "N/D",
      quickNotes = "",
      targets = [],
      renovationComplexity = 1,
      renovationWorkTypes = "",
      renovationDocsCount = 0
    } = input;

    const estimatedMonthlyRent = Math.round((price * 0.048) / 12);
    const roiPercentage = ((estimatedMonthlyRent * 12) / (price || 1) * 100).toFixed(1);

    const derivedTargets = Array.from(new Set([
      "Proposta Schematica",
      "Proposta Descrittiva",
      ...targets
    ]));

    // Build model parameters
    const promptParts: any[] = [];
    
    // 1. Text metadata prompt instruction
    const metadataInstruction = `
Sei VESTA AI (v5.0), un consulente immobiliare d'élite, copywriter esperto e stimatore immobiliare professionista operante sul territorio italiano. Devi analizzare l'immobile descritto di seguito e le immagini fornite, integrando i dati fisici con un rilevamento ottico e spaziale realistico, dettagliato e professionale basato sulle fotografie e sulla planimetria catastale riscontrate. 

Devi redigere un report strutturato ad altissima precisione in lingua italiana e compilare un formato JSON valido.

DATI TECNICI DELL'IMMOBILE:
- Indirizzo: ${address}
- Comune: ${comune} (CAP: ${cap})
- Prezzo richiesto: €${price.toLocaleString("it-IT")}
- Superficie: ${sqm} mq
- Locali / Consistenza: ${rooms}
- Classe Energetica: ${energyClass}
- Target Richiesti: ${derivedTargets.join(", ")}
- Note d'agenzia / Ulteriori Caratteristiche dell'Immobile scritte a mano dall'utente: ${quickNotes}
- Stato dell'immobile & Ristrutturazioni:
  * Complessità lavori programmata (da 1 a 5, dove 1 è ottimale/nessun lavoro e 5 è da ristrutturare completamente): ${renovationComplexity}
  * Tipologia lavori specificati dall'utente: ${renovationWorkTypes}
  * Quantità di file allegati relativi ai lavori: ${renovationDocsCount}

LINEE GUIDA RIGIDE PER IL RICONOSCIMENTO DELLE IMMAGINI E DELLA PLANIMETRIA (IMPORTANTE):
1. Rilevamento Ottico Meticoloso: Se l'utente ha caricato delle fotografie (che trovi allegate come parti di dati inline), esegui un'analisi visiva reale ed estremamente accurata del locale riprodotto. Identifica e menziona nel testo elementi concreti riscontrabili nelle immagini: tipologia e colore del pavimento (es. parquet in legno chiaro/scuro, piastrelle in ceramica beige, marmo lucido, listoni moderni in gres porcellanato), finitura e colore delle pareti, infissi/serramenti (es. legno classico, PVC bianco moderno con vetrocamera), stato d'usura o conservazione delle superfici, intensità d'illuminazione naturale, ingombri e radiatori presenti. Evita commenti generici o ripetitivi. Per ogni immagine scansionata, scrivi una descrizione tecnica, ricca e specifica per quel locale.
2. Analisi d'Ingegneria Spaziale della Planimetria (SENZA SPECULAZIONI STRUTTURALI NON VERIFICATE): Se l'utente ha caricato una planimetria cartacea o catastale, esegui un esame descrittivo del layout complessivo in relazione ai ${sqm} mq e alla dispositione esistente dei vani. È ASSOLUTAMENTE VIETATO proporre modifiche strutturali, abbattimenti di muri/tramezzi, o speculare sulla rimozione di pareti basandoti solo sulle immagini o sulla planimetria. NON suggerire cambiamenti e non fare commenti su fattibilità di demolizioni, tranne se espressamente indicato dall'agente immobiliare nel campo delle "Note d'agenzia" (in quel caso valorizzalo molto). Se non è espressamente citato nelle note, limitati a descrivere la distribuzione funzionale attuale dell'immobile senza proporre ristrutturazioni fisiche o alterazioni dei tramezzi.
3. Assenza di Immagini: Se non è stata fornita alcuna immagine in allegato, genera comunque descrizioni dei vani plausibili, eleganti e coerenti con la Classe Energetica ("${energyClass}") e con le Note d'agenzia dell'utente.
4. Integrazione Caratteristiche Manuali Scritte a Mano: Le caratteristiche inserite dall'utente nel campo "Note d'agenzia / Ulteriori Caratteristiche" (come balconi, terrazze, cantina, ascensore, riscaldamento autonomo, ristrutturazioni o finiture speciali) rappresentano informazioni reali ad altissima priorità. Devi integrarle, citarle e valorizzarle esplicitamente all'interno di tutte le schede target di marketing e nei testi formattati per i vari canali (Immobiliare.it, Idealista, Facebook, Instagram) affinché non vadano mai perse.

PROPRIETÀ DI ANALISI DELL'IMMOBILE ("analysis") - DETTAGLI CHIAVE:
Devi generare un'analisi approfondita del livello manutentivo dell'asset e della sua redditività finanziaria. Compila l'oggetto JSON di analisi rispettando fedelmente queste regole:
- conditionRating: Un numero da 1 a 10 impostato dall'IA valutando lo stato globale dell'immobile ("quanto è tenuta bene, quanto è nuova"). Se la complessità delle ristrutturazioni fornite dall'utente è alta (es. 4 o 5), questo rating dovrà attestarsi su valori bassi (es. da 2 a 5). Se la complessità è bassa (es. 1 o 2), il rating si attesterà su ottimi livelli (es. da 7 a 10).
- renovationCostEstimate: Costo monetario reale di ristrutturazione in Euro (numero puro, es. 25000). Utilizza un computo metrico plausibile in base alla metratura (${sqm} mq) e alla complessità indicata (es. complessità 1 costa €100-200/mq di manutenzione ordinaria / rinfresco; complessità 5 costa €800-1200/mq per ristrutturazione integrale strutturale ed impianti). Se l'utente ha specificato tipi di lavori nel relativo campo, adatta la stima dei costi.
- rentalYieldAnalysis: Testo descrittivo discorsivo ed elegante (almeno 3-4 frasi) che analizza la resa locativa dell'immobile in base alla locazione geografica, alla consistenza catastale, alle finiture rilevate e alle condizioni, spiegando come è possibile ricavare un rendimento passivo o turistico ottimale, considerando anche i fattori di guadagno ROI.
- estimatedMonthlyRentMin: Canone mensile minimo ordinario stimato a lungo termine (es. 4+4).
- estimatedMonthlyRentMax: Canone mensile massimo ordinario stimato a lungo termine.
- shortTermRateMin: Costo notte minimo stimato per locazione turistica breve.
- shortTermRateMax: Costo notte massimo stimato per locazione turistica breve.
- maintenanceCosts: Costi annuali stimati per spese condominiali (condoFees), IMU/TARI (taxes), assicurazione (insurance) e manutenzione ordinaria programmata (ordinaryMaintenance).
- roiPercentage: Percentuale di rendimento lordo/netto o potenziale ROI atteso espresso come numero decimale (es. 5.8).

LINEE GUIDA DI COPYWRITING E MASSIMA PERSONALIZZAZIONE DEL TARGET (ATTENZIONE: devi generare una scheda di marketing per ciascuna chiave presente in "Target Richiesti"):
Il testo di marketing di ciascuna chiave ("marketingTexts") deve essere scritto in un italiano prestigioso, fluido, persuasivo ed estremamente mirato. Non usare frasi fatte, abbreviazioni o un linguaggio robotico e distaccato. Modella la psicologia d'acquisto, la struttura o il lessico in modo radicalmente personalizzato per ciascun segmento:

- PROPOSTA SCHEMATICA (MANDATORIA):
  * Tono: Tecnico, immediato, schematico.
  * Struttura: Una presentazione sintetica strutturata rigorosamente in punti elenco (bullet points) e sezioni chiare, ricca di dati strutturali ed economici:
    - **Highlights dell'Immobile**: sintesi delle caratteristiche chiave (superficie, vani, classe energetica).
    - **Punti di Forza fisici**: elenco puntato riassuntivo (esposizione, stato materiali, finiture).
    - **Proiezioni Finanziarie**: prezzo totale, prezzo al mq stimato, stima canone di locazione (€${estimatedMonthlyRent}/mese) e ROI lordo annuo stimato (${roiPercentage}%).
  * Scopo: Fornire una sintesi fulminea adatta per un foglio illustrativo o un annuncio rapido.

- PROPOSTA DESCRITTIVA (MANDATORIA):
  * Tono: Coinvolgente, narrativo, completo ed emozionale.
  * Struttura: Una descrizione strutturata in paragrafi fluidi, esaustivi e continuativi. Narra l'atmosfera dei locali, descrivendo minuziosamente l'ingresso, la zona giorno, la zona notte, la luminosità basandoti sulle foto (o note), i serramenti e il potenziale abitativo d'uso complessivo.
  * Scopo: Creare una narrazione avvolgente e completa che descriva compiutamente l'essenza dell'immobile in tutti i suoi aspetti fisici e tecnici.

- GIOVANI COPPIE (Young Couples - Se richiesto):
  * Tono: Caldo, evocativo, proiettato al futuro, fresco ed emozionale.
  * Leve: Condivisione, comfort del nido familiare, risparmio nei consumi energetici, vicinanza ai servizi (supermercati, bar, mezzi pubblici, parchi). Spiega come i ${sqm} mq e i ${rooms} locali di questa soluzione a ${comune} rispondano armonicamente al nido familiare di una giovane coppia dinamica.

- INVESTITORI / AFFITTI BREVI (Investors & Yield Buyers - Se richiesto):
  * Tono: Sharp, analitico, focalizzato sul profitto, pragmatico, finanziario e orientato alle metriche.
  * Leve: Redditività d'arredo, rivalutazione nel tempo, estrema facilità di locazione grazie al posizionamento strategico, ed efficacia della pianta per ricavare più vani o ottimizzare i posti letto.
  * Dati finanziari reali (Obbligatorio citarli esplicitamente nel testo):
    - Canone mensile stimato: circa €${estimatedMonthlyRent} (derivante da una proiezione annua prudente del 4.8%).
    - ROI Lordo Annuo stimato: ${roiPercentage}%.
    - Recupero Fiscale: Se l'immobile necessita di interventi (note d'agenzia), spiega esplicitamente come il ricorso ai bonus ristrutturazione si traduca in un incremento automatico del ROI effettivo.

- GRANDI FAMIGLIE (Large Families - Se richiesto):
  * Tono: Rassicurante, incentrato su ampiezza, funzionalità, organizzazione e quiete.
  * Leve: Indipendenza per ciascun membro, ampiezza degli ambienti di ritrovo, vicinanza a scuole e asili. Illustra come la consistenza strutturale di ${rooms} locali su ${sqm} mq consenta un perfetto bilanciamento.

- LUXURY BUYERS (Elite Residenziale - Se richiesto):
  * Tono: Esclusivo, prestigioso, colto, sensoriale, maestoso ed evocativo.
  * Leve: Unicità dell'asset nel panorama di ${comune}, nobiltà dei materiali di finitura, luminosità zenitale, isolamento climatico garantito dalla Classe Energetica "${energyClass}".

- ALTRE CATEGORIE PERSONALIZZATE (Se presenti in "Target Richiesti"):
  * Analizza attentamente la chiave richiesta e sviluppa una descrizione di marketing ricca ed originale che si allinei perfettamente allo stile di vita e alle motivazioni di quel profilo.

ANALISI DI GEOLOCALIZZAZIONE METICOLOSA ("geoAnalysisDetails"):
Esegui uno studio geopolitico e territoriale dettagliato in base all'indirizzo "${address}", al comune "${comune}" e al CAP "${cap}", suddividendo l'analisi nei seguenti campi JSON:
- connections: Descrizione accurata di trasporti, stazioni, metropolitane, fermate dei bus e snodi autostradali/statali vicini.
- services: Analisi di nidi/scuole/asili, centri sportivi, parchi, supermercati, farmacie ed ospedali d'area.
- marketTrend: Studio dei trend immobiliari d'area, la liquidità della zona, l'appeal del quartiere rispetto al resto di ${comune}, e il posizionamento di valore per un immobile di ${sqm} mq.

COPYWRITING DEI PORTALI E SOCIAL MULTI-FORMATO ("portalTexts"):
Genera testi con copywriting specifico adattato in modo millimetrico per i seguenti canali, integrando l'analisi geopolitica locale e i dati fisici ed economici dell'immobile:
- immobiliareIt: Annuncio strutturato in sezioni chiare ed eleganti per Immobiliare.it, valorizzando la vivibilità del bene, l'efficienza energetica (Classe "${energyClass}") e la vicinanza a scuole e trasporti.
- idealista: Testo d'annuncio per Idealista, conciso, molto scorrevole e ordinato, che utilizza elenchi puntati con asterischi per descrivere la consistenza e i parametri finanziari (€${price.toLocaleString("it-IT")}, ROI ${roiPercentage}%).
- facebook: Post promozionale persuasivo per pagine Facebook, con l'uso sapiente di emoji ad inizio paragrafo, inviti ad un sopralluogo esclusivo e una Call to Action (CTA) memorabile.
- instagram: Post accattivante per Instagram con descrizioni sensoriali ed un layout a blocchi visivi, tag di geolocalizzazione incluso nel testo, hashtags strategici selezionati.

LINEE GUIDA PER IL FORMATO JSON DELLA RISPOSTA:
L'array "visualAnalysisItems" DEVE contenere esattamente uno e un solo oggetto per ciascuna immagine allegata come inlineData nel messaggio dell'utente (sia foto dei vani che planimetria), rispettando gli indici d'input per favorire la corretta associazione lato client:
- Se ci sono foto dei locali (photos): l'id deve essere nel formato "photo-INDEX-1718000000" (dove INDEX corrisponde esattamente all'indice 0, 1, 2... della foto nel relativo array di input). Esempio: prima foto avrà "id": "photo-0-1718000000", la seconda "photo-1-1718000000". Il "name" deve riprendere il nome originale del file foto ricevuto (es. foto_soggiorno.jpg).
- Se c'è una planimetria (floorPlan): l'id deve essere "floorplan-1718000000", ed il "name" deve riprendere il nome originale del file planimetria (es. planimetria_catastale.pdf).
- La descrizione ("description") per ciascun elemento deve essere una recensione visiva dettagliata, non generica, che dimostri di aver veramente scansionato l'immagine per fini strutturali, materiali ed illuminotecnici.
`;

    promptParts.push({ text: metadataInstruction });

    // 2. Room Photos analysis if supplied
    if (photos && Array.isArray(photos)) {
      photos.forEach((photoObj: { mimeType: string; base64: string; name: string }, index: number) => {
        if (photoObj && photoObj.base64 && photoObj.mimeType) {
          promptParts.push({
            inlineData: {
              mimeType: photoObj.mimeType,
              data: photoObj.base64
            }
          });
          promptParts.push({ text: `Immagine camera scansionata identificata come: "${photoObj.name}". Analizza questa stanza per valutare volumi, finiture e illuminazione.` });
        }
      });
    }

    // 3. Planimetry mapping if supplied
    if (floorPlan && floorPlan.base64 && floorPlan.mimeType) {
      promptParts.push({
        inlineData: {
          mimeType: floorPlan.mimeType,
          data: floorPlan.base64
        }
      });
      promptParts.push({ text: `Grafico planimetrico catastale caricato denominato: "${floorPlan.name}". Esegui una scansione vettoriale delle pareti interne per identificarne la portanza (tramezzi demolibili o pilastri) in relazione ai ${sqm} mq.` });
    }

    // Call Gemini 3.5-flash with structured JSON response schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptParts,
      config: {
        systemInstruction: "Sei VESTA AI v5.0, un copilot AI per agenti immobiliari ad altissima precisione e lusso. Ragioni in modo logico e rispondi sempre e solo in lingua italiana compilando un formato JSON valido.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            geoAnalysis: { type: Type.STRING, description: "Descrizione macro-territoriale ed economica dettagliata della zona." },
            geoAnalysisDetails: {
              type: Type.OBJECT,
              properties: {
                connections: { type: Type.STRING, description: "Analisi meticolosa dei collegamenti e dei trasporti pubblici locali (stazioni, metro, bus, treni, arterie)." },
                services: { type: Type.STRING, description: "Analisi di nidi, scuole, asili, centri sportivi, parchi, supermercati, farmacie e sanità di prossimità." },
                marketTrend: { type: Type.STRING, description: "Analisi approfondita dell'andamento dei prezzi al mq, liquidità d'area, appeal e domanda d'acquisto di questo quartiere." }
              },
              required: ["connections", "services", "marketTrend"]
            },
            portalTexts: {
              type: Type.OBJECT,
              properties: {
                immobiliareIt: { type: Type.STRING, description: "Annuncio immobiliare professionale per Immobiliare.it, diviso in sezioni con spaziosità, che integra i punti forza fisici, energetici e i servizi geolocalizzati vicini." },
                idealista: { type: Type.STRING, description: "Annuncio eccellente per Idealista, molto pulito con elenchi puntati con asterischi adatti per i motori di ricerca." },
                facebook: { type: Type.STRING, description: "Post persuasivo per Facebook con emoji iconiche dell'edilizia ad inizio paragrafo, evidenziando geolocalizzazione, servizi e invito esclusivo a visitare l'immobile." },
                instagram: { type: Type.STRING, description: "Post di lusso per Instagram con frasi emozionali, spaziatura elegante, tag geografico inserito nel testo, hashtags mirati." }
              },
              required: ["immobiliareIt", "idealista", "facebook", "instagram"]
            },
            marketingTexts: { 
              type: Type.OBJECT, 
              description: "Chiavi corrispondenti ai target richiesti (es. Giovani Coppie, Grandi Famiglie, Investitori/Affitti Brevi, Luxury Buyers) valorizzate con testi di marketing persuasivi e dettagliati con riferimenti reali ai dati forniti."
            },
            visualAnalysisItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Deve rispettare il formato 'photo-INDEX-TIMESTAMP' per le foto caricate (es: 'photo-0-12345' per la prima foto, 'photo-1-12345' per la seconda) ed 'floorplan-TIMESTAMP' per la planimetria catastale per consentire la corretta associazione lato client." },
                  name: { type: Type.STRING, description: "Nome identificativo dell'immagine o file analizzato." },
                  url: { type: Type.STRING, description: "Lasciare stringa vuota o 'placeholder'" },
                  description: { type: Type.STRING, description: "Analisi tecnica approfondita del locale o disegno planimetrico scansionato." }
                },
                required: ["id", "name", "url", "description"]
              }
            },
            seoPortals: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                bullets: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                hashtags: { type: Type.STRING }
              },
              required: ["title", "bullets", "hashtags"]
            },
            visitGuide: {
              type: Type.OBJECT,
              properties: {
                strengths: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Almeno 4 punti di forza reali ricavati dai dati e dalle immagini scorporando le caratteristiche positive."
                },
                objections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING, description: "Un'obiezione reale che un potenziale cliente solleverebbe sui costi, riscaldamento, o lavori di ristrutturazione." },
                      answer: { type: Type.STRING, description: "La risposta strategico-finanziaria suggerita per l'agente immobiliare per ribaltare l'ostracismo." }
                    },
                    required: ["text", "answer"]
                  }
                }
              },
              required: ["strengths", "objections"]
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                conditionRating: { type: Type.INTEGER, description: "Rating da 1 a 10 di quanto è tenuta bene/nuova la casa." },
                renovationCostEstimate: { type: Type.NUMBER, description: "Valore reale in Euro di quello che potrebbero costare i lavori di ristrutturazione." },
                rentalYieldAnalysis: { type: Type.STRING, description: "Analisi dettagliata del rendimento basata su locazione, descrizione, foto e planimetria." },
                estimatedMonthlyRentMin: { type: Type.NUMBER, description: "Stima canone mensile minimo." },
                estimatedMonthlyRentMax: { type: Type.NUMBER, description: "Stima canone mensile massimo." },
                shortTermRateMin: { type: Type.NUMBER, description: "Costo notte minimo per affitto breve." },
                shortTermRateMax: { type: Type.NUMBER, description: "Costo notte massimo per affitto breve." },
                maintenanceCosts: {
                  type: Type.OBJECT,
                  properties: {
                    condoFees: { type: Type.NUMBER, description: "Spese condominiali annue stimate." },
                    taxes: { type: Type.NUMBER, description: "Tasse annuali stimate (IMU, TARI, ecc.)." },
                    insurance: { type: Type.NUMBER, description: "Assicurazione annuale stimata." },
                    ordinaryMaintenance: { type: Type.NUMBER, description: "Manutenzione ordinaria annuale stimata." }
                  },
                  required: ["condoFees", "taxes", "insurance", "ordinaryMaintenance"]
                },
                roiPercentage: { type: Type.NUMBER, description: "Percentuale di guadagno ROI annua stimata." }
              },
              required: ["conditionRating", "renovationCostEstimate", "rentalYieldAnalysis", "estimatedMonthlyRentMin", "estimatedMonthlyRentMax", "shortTermRateMin", "shortTermRateMax", "maintenanceCosts", "roiPercentage"]
            }
          },
          required: ["id", "geoAnalysis", "geoAnalysisDetails", "portalTexts", "marketingTexts", "visualAnalysisItems", "seoPortals", "visitGuide", "analysis"]
        },
      }
    });

    const val = response.text;
    if (!val) {
      throw new Error("Empty response from Gemini API");
    }

    const reportJson = JSON.parse(val.trim());
    return res.json(reportJson);

  } catch (error: any) {
    console.error("❌ Error in Vesta AI analysis route:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Setup Vite middleware or static files serving based on NODE_ENV
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Vesta AI Server listening on port ${PORT}`);
  });
}

startServer();
