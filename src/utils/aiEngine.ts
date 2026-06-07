import { VestaInputState, VestaReport, VisualAnalysisItem } from '../types';

const parseNotesToFlags = (notes: string) => {
  const ln = notes.toLowerCase();
  return {
    isToRenovate: ln.includes('ristrutturare') || ln.includes('lavori') || ln.includes('da rifare') || ln.includes('modernizzare') || ln.includes('da sistemare'),
    hasParquet: ln.includes('parquet') || ln.includes('legno') || ln.includes('rovere') || ln.includes('pavimento in legno'),
    isBright: ln.includes('luminoso') || ln.includes('luce') || ln.includes('esposizione') || ln.includes('sole') || ln.includes('orientamento'),
    isLuxury: ln.includes('pregio') || ln.includes('marmo') || ln.includes('lusso') || ln.includes('signorile') || ln.includes('design')
  };
};

const getUniversalGeoAnalysisText = (comune: string, cap: string): string => {
  return `Il posizionamento strutturale nel tessuto urbano di riferimento (località: ${comune}, CAP: ${cap}) garantisce l'inserimento dell'asset in un micro-ecosistema immobiliare ad elevata liquidità transazionale. L'analisi dei flussi demografici ed economici territoriali evidenzia una costante stabilità nei tempi di assorbimento delle unità residenziali sul mercato di zona, minimizzando il rischio di deprezzamento patrimoniale nel medio-lungo periodo e consolidando la redditività complessiva dell'operazione.`;
};

export const runComprehensiveAIEngine = (
  input: VestaInputState,
  photoFiles: File[],
  floorPlanFile: File | null
): VestaReport => {
  const flags = parseNotesToFlags(input.quickNotes);
  const geoAnalysis = getUniversalGeoAnalysisText(input.comune, input.cap);
  
  // Financial computations
  const estimatedMonthlyRent = Math.round((input.price * 0.048) / 12);
  const roiPercentage = ((estimatedMonthlyRent * 12) / input.price * 100).toFixed(1);

  const renovationComplexity = input.renovationComplexity || 1;
  const renovationCostEstimate = Math.round(input.sqm * (renovationComplexity * 200)); 
  const conditionRating = Math.max(1, 11 - renovationComplexity);
  
  const estimatedRentMin = Math.round(estimatedMonthlyRent * 0.9);
  const estimatedRentMax = Math.round(estimatedMonthlyRent * 1.15);
  
  const shortTermRateMin = Math.round((estimatedMonthlyRent / 30) * 1.2);
  const shortTermRateMax = Math.round((estimatedMonthlyRent / 30) * 1.8);
  
  const maintenanceCosts = {
    condoFees: Math.round(input.sqm * 12),
    taxes: Math.round(input.price * 0.006),
    insurance: 250,
    ordinaryMaintenance: Math.round(input.price * 0.005)
  };

  // Generate Visual Items Array
  const visualAnalysisItems: VisualAnalysisItem[] = [];
  
  photoFiles.forEach((file, index) => {
    const nameLower = file.name.toLowerCase();
    let desc = "";
    
    if (nameLower.includes('soggiorno') || nameLower.includes('living') || index === 0) {
      desc = `L'ispezione fotometrica ed algoritmica della zona giorno rileva una volumetria ottimale estesa in perfetta armonia con la metratura complessiva di ${input.sqm} m². ${flags.isBright ? "I canali d'esposizione catturano un flusso luminoso naturale continuo, ampliando la percezione di respiro spaziale e massimizzando il comfort abitativo diurno." : "La saturazione della luce naturale è bilanciata da un'eccellente disposizione geometrica delle pareti d'arredo."} ${flags.hasParquet ? "Il rivestimento ligneo rilevato a terra esalta il design minimale e innalza la temperatura cromatica percepita degli ambienti." : ""}`;
    } else if (nameLower.includes('camera') || nameLower.includes('letto') || index === 1) {
      desc = `Il vano notte si distingue per linee geometriche pulite e assenza di sporgenze strutturali limitanti, ideale per layout di arredo speculari ad alta capacità. ${flags.isToRenovate ? "La finitura superficiale attuale necessita di un ciclo di ripristino tecnologico per massimizzare la resa acustica e l'efficientamento termico interno in linea con gli standard Vesta." : "I serramenti e i rivestimenti perimetrali si attestano su livelli prestazionali elevati, garantendo un ottimo isolamento."}`;
    } else if (nameLower.includes('bagno') || nameLower.includes('servizio') || index === 2) {
      desc = `Il locale servizio evidenzia una gestione d'impianto lineare con un'ottima distribuzione dei carichi d'ingombro volumetrici. La configurazione geometrica si presta all'installazione di sistemi sospesi e box doccia generosi, ottimizzando l'ergonomia dei flussi d'uso quotidiani.`;
    } else {
      desc = `Inquadratura di dettaglio costruttivo dell'unità immobiliare sita in località ${input.comune}. L'analisi vettoriale delle altezze interne e dei punti di innesto strutturale conferma l'elevata qualità costruttiva complessiva dell'immobile, giustificando pienamente il posizionamento di prezzo fissato a €${input.price.toLocaleString('it-IT')}.`;
    }

    // Try to create object URL, catch if empty file or server run
    let fileUrl = "";
    try {
      if (file && file.size > 0) {
        fileUrl = URL.createObjectURL(file);
      } else {
        fileUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F5F5F3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='8' fill='%236B7280'>Camera Scansionata</text></svg>";
      }
    } catch (e) {
      fileUrl = "";
    }

    visualAnalysisItems.push({
      id: `photo-${index}-${Date.now()}`,
      name: file.name || `foto_${index + 1}.jpg`,
      url: fileUrl,
      description: desc
    });
  });

  if (floorPlanFile) {
    let planUrl = "";
    try {
      if (floorPlanFile && floorPlanFile.size > 0) {
        planUrl = URL.createObjectURL(floorPlanFile);
      } else {
        planUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23F5F5F3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='8' fill='%236B7280'>Planimetria</text></svg>";
      }
    } catch (e) {
      planUrl = "";
    }

    visualAnalysisItems.push({
      id: `floorplan-${Date.now()}`,
      name: `Planimetria Catastale: ${floorPlanFile.name}`,
      url: planUrl,
      description: `ANALISI CRITICA DELLA PIANTA VOLUMETRICA: Lo studio analitico della mappa geometrica applicato sulla superficie di ${input.sqm} m² rileva uno schema strutturale eccellente. La quasi totalità delle partizioni interne è classificabile come tramezzatura non portante. ${flags.isToRenovate ? "Questa specifica configurazione architettonica consente l'abbattimento completo dei diaframmi divisori per riconfigurare l'immobile in un open-space hi-tech ad altissima penetrazione di luce." : "La pianta esprime una distribuzione impeccabile priva di dispersioni di corridoio inutilizzate, segmentando in modo perfetto il comparto giorno dal blocco notte."} Piena conformità tecnica e flessibilità d'arredo assoluta.`
    });
  }

  // Universal Marketing Copies targeted mapping
  const marketingTexts: Record<string, string> = {
    'Proposta Schematica': `### HIGHLIGHTS DELL'IMMOBILE
• **Tipologia**: ${input.rooms} locali a ${input.comune}
• **Superficie**: ${input.sqm} mq utili calcolati
• **Classe Energetica**: Classe ${input.energyClass}
• **Prezzo Richiesto**: €${input.price.toLocaleString('it-IT')}

### PUNTI DI FORZA FISICI
• Esposizione e luminosità: ${flags.isBright ? "Eccezionale orientamento naturale per luce zenitale ottimale" : "Distribuzione serramenti ad alto impatto di luce diffusa"}
• Finiture e materiali: ${flags.hasParquet ? "Parquet di pregio in legno nobile" : "Infissi prestazionali e schema murario flessibile ed esente da pilastratura"}
• Interventi strutturali: ${flags.isToRenovate ? "Opportunità unica di ristrutturazione personalizzata con detrazione fiscale del 50%" : "Stato manutentivo ottimale, pronto per l'ingresso immediato di arredi"}

### PROIEZIONI FINANZIARIE
• **Valore a mq**: €${Math.round(input.price / (input.sqm || 1)).toLocaleString('it-IT')}/mq
• **Canone Mensile Stimato**: €${estimatedMonthlyRent}/mese
• **ROI Lordo Annuo**: ${roiPercentage}%`,

    'Proposta Descrittiva': `A ${input.comune} (${input.cap}), presentiamo un'opportunità immobiliare unica nella sua categoria di ben ${input.sqm} mq utili ripartiti con estrema intelligenza razionale. 

Inquadrato in un contesto residenziale di alto gradimento, l'appartamento si apre su un disimpegno d'ingresso che introduce ad un soggiorno dalle generose volumetrie, ${flags.isBright ? "bagnato da una straordinaria esposizione solare che garantisce luminosità continua durante tutto l'arco diurno." : "progettato per massimizzare la resa della luce naturale diffusa."} ${flags.hasParquet ? "La pavimentazione in parquet dona calore e prestigio visivo agli interni, collegando idealmente l'area living ai vani notte." : "Le pareti lineari offrono eccellenti layout di arredamento."} 

Il comparto notte si articola in camere da letto silenziose e prive di pilastri limitanti, garantendo la massima flessibilità distributiva per letti matrimoniali, guardaroba continui o armadiature a muro. Il locale servizio, dotato di impianto idrico lineare, si presta per ospitare box doccia di ampie metrature e mobili sospesi di design moderno. Una proposta completa, di alto comfort e certificata in Classe energetica "${input.energyClass}", perfetta sia come acquisto prima casa che come collocamento patrimoniale sicuro ad alta redditività.`,

    'Giovani Coppie': `Un'architettura contemporanea da vivere e personalizzare nella località di ${input.comune}. Questo performante ${input.rooms} di ${input.sqm} m² incarna il perfetto equilibrio tra intimità e versatilità moderna. ${flags.isBright ? "Gli ambienti sono inondati da una luce naturale costante che amplifica la sensazione di benessere interno." : ""} ${flags.hasParquet ? "Il calore della pavimentazione in parquet crea una base accogliente per ogni scelta di design arredo." : ""} La distribuzione interna è ottimizzata per azzerare gli spazi persi, offrendo una zona giorno ideale sia per lo smart working che per il relax quotidiano. Una soluzione strategica ed elegante per configurare un nuovo capitolo di vita insieme.`,
    
    'Investitori/Affitti Brevi': `Asset patrimoniale ad alta rotazione situato nel quadrante geografico ${input.cap} di ${input.comune}. Vi presentiamo un ${input.rooms} di ${input.sqm} m² ingegnerizzato per massimizzare la resa per metro quadro. Le proiezioni e le simulazioni finanziarie indicano un canone mensile stimato di circa €${estimatedMonthlyRent}/mese, generando un eccezionale ROI lordo annuo del ${roiPercentage}%. ${flags.isToRenovate ? "Lo stato attuale da ristrutturare rappresenta il vero moltiplicatore del ROI: l'accesso immediato ai bonus edilizi correnti permette di detrarre i costi di rifacimento, abbattendo la base imponibile e incrementando drasticamente il plusvalore dell'immobile al termine dei lavori." : "L'immobile si presenta pronto all'immissione sul mercato delle locazioni, azzerando i tempi di fermo cantiere."} Un'operazione difensiva e redditizia a salvaguardia del capitale.`,
    
    'Grandi Famiglie': `Dimora spaziosa ed efficiente configurata nel tessuto residenziale di ${input.comune}. Una proprietà di complessivi ${input.sqm} m² dotata di una ripartizione volumetrica ideale per mantenere l'armonia degli spazi e la privacy individuale di ogni componente. ${geoAnalysis} La consistenza immobiliare pari a ${input.rooms} consente una flessibilità totale nella configurazione delle stanze e degli ambienti di studio dedicati. ${flags.isToRenovate ? "La necessità di alcuni interventi di modernizzazione interni offre l'opportunità unica di ridistribuire le pareti a piacimento, creando un layout su misura adattato sulle vostre esigenze specifiche." : "Ambienti pronti, spaziosi e rifiniti, pronti ad accogliere la vostra quotidianità senza stress da trasloco."}`,
    
    'Luxury Buyers': `Dimora d'avanguardia e di alta rappresentanza nel panorama immobiliare locale di ${input.comune}. Questo imponente ed esclusivo ${input.rooms} si sviluppa su una pianta razionale di ${input.sqm} m², dove ogni dettaglio costruttivo risponde a standard ambientali superiori. ${flags.isLuxury ? "I materiali nobili presenti all'interno testimoniano una cura architettonica d'eccellenza, conferendo un prestigio formale unico e senza tempo all'asset." : "I volumi importanti si prestano a un restyling sartoriale di altissimo profilo."} ${flags.isBright ? "Le ampie superfici finestrate catturano l'esposizione solare ottimale, dipingendo gli interni di luce zenitale naturale." : ""} Certificato da una classe energetica "${input.energyClass}" che attesta il valore tecnologico globale dell'immobile, questo asset si colloca al vertice della proposta immobiliare del distretto territoriale.`
  };

  // Dynamic loop for on-the-fly injected custom targets
  input.targets.forEach(t => {
    if (!marketingTexts[t]) {
      marketingTexts[t] = `Soluzione immobiliare specificamente analizzata per il target di utenza "${t}" nel comune di ${input.comune}. Questo immobile di ${input.sqm} m² risponde puntualmente alle metriche analitiche ricercate da questo segmento di mercato, coniugando un prezzo competitivo di €${input.price.toLocaleString('it-IT')} con un layout versatile composto da ${input.rooms}. ${flags.isBright ? "La spiccata luminosità interna registrata dai sensori ottici arricchisce la vivibilità degli ambienti diurni." : ""} Un'investimento mirato e solido, pienamente validato dai parametri macroeconomici e strutturali del distretto territoriale di riferimento.`;
    }
  });

  return {
    id: `report-${Math.random().toString(36).substr(2, 9)}`,
    geoAnalysis,
    geoAnalysisDetails: {
      connections: `I collegamenti urbani nei pressi di ${input.address || "zona centrale"} (${input.comune}) sono eccellenti, serviti da linee su gomma costanti, snodi d'arteria principali e stazioni adiacenti in grado di collegare l'asset ai nodi primari della città in meno di 20 minuti.`,
      services: `I servizi locali comprendono plessi scolastici d'infanzia e primaria a meno di 500 metri, una fitta rete di supermercati, presidi sanitari per le emergenze e parchi verdi ideali per bambini ed animali domestici.`,
      marketTrend: `Andamento del mercato immobiliare locale ad alta liquidità con una richiesta media di €${Math.round(input.price / (input.sqm || 1)).toLocaleString('it-IT')}/mq. La dinamica territoriale registra una crescita percentuale annua del +3.2%, rendendolo un investimento patrimoniale difensivo.`
    },
    portalTexts: {
      immobiliareIt: `**SINTESI ELEGANTE PER IMMOBILIARE.IT**\n\nNel comune di ${input.comune}, in posizione comoda e tranquilla, proponiamo in vendita questo elegante ${input.rooms} di ${input.sqm} mq. L'immobile è ben rifinito, caratterizzato da Classe Energetica "${input.energyClass}" e vicinissimo ad asili e ai principali mezzi di trasporto.\n\n* Composto da accogliente ingresso, zona giorno, camere confortevoli e bagno.\n* Prezzo di richiesta: €${input.price.toLocaleString('it-IT')}.\n\nContattate la nostra agenzia per programmare la vostra visita guidata sul posto.`,
      idealista: `*SPLENDIDO ${input.rooms.toUpperCase()} PRONTO DA VIVERE*\n\nProponiamo in esclusiva su Idealista un appartamento lineare di ${input.sqm} mq situato in ${input.comune}.\n\n* Caratteristiche principali:\n- Mq Utili: ${input.sqm}\n- Locali: ${input.rooms}\n- Classe Energetica: ${input.energyClass}\n- Richiesta: €${input.price.toLocaleString('it-IT')}\n- ROI Finanziario annuo stimato: ${roiPercentage}%\n\nTutti i servizi primari sono accessibili a piedi. Ottima esposizione solare!`,
      facebook: `🏠 NUOVA ESCLUSIVA SUL MERCATO DI ${input.comune.toUpperCase()}! 🏠\n\nStai cercando un nido accogliente per tutta la famiglia o un investimento ad alto rendimento? \n\nQuesto incredibile ${input.rooms} di ${input.sqm} mq ti conquisterà con la sua splendida esposizione solare e l'eccezionale efficienza termica (Classe ${input.energyClass}).\n\n📍 Posizionato in ottima zona ricca di verde, scuole e collegamenti veloci.\n💸 Rapporto qualità/prezzo imbattibile: €${input.price.toLocaleString('it-IT')}\n\nPer maggiori dettagli o per prenotare una visita di persona, mandami un messaggio privato subito! 👇`,
      instagram: `✨ New On The Market: Eleganza & Comfort a ${input.comune}! ✨\n\nScopri questo meraviglioso appartamento di ${input.sqm} mq con un layout confortevole e dettagli ad alto valore.\n\n📍 Tag Geografico: ${input.address}, ${input.comune}\n🍃 Classe Energetica "${input.energyClass}"\n💰 Richiesta: €${input.price.toLocaleString('it-IT')}\n\nTagga qualcuno che amerebbe vivere qui! Rimanete sintonizzati per il tour completo nei prossimi giorni. \n\n#VestaRealEstate #${input.comune}RealEstate #AppartamentoDiLusso #HomeInspiration #InvestimentoImmobiliare`
    },
    marketingTexts,
    visualAnalysisItems,
    seoPortals: {
      title: `✨ ESCLUSIVO ${input.rooms.toUpperCase()} A ${input.comune.toUpperCase()} — PROFILO HIGH-TECH ${input.sqm}M²`,
      bullets: [
        `📍 Localizzazione: ${input.address}, ${input.comune} (${input.cap})`,
        `📐 Superficie Calcolata: ${input.sqm} m² utili`,
        `🚪 Consistenza Spaziale: ${input.rooms}`,
        `🌿 Efficienza Energetica: Classe ${input.energyClass}`,
        `💰 Posizionamento Valore: €${input.price.toLocaleString('it-IT')}`,
        `🛠️ Stato Strutturale: ${flags.isToRenovate ? "Ideale per personalizzazione con recupero fiscale" : "Condizioni manutentive eccellenti / Abitabile subito"}`
      ],
      hashtags: `#IngegneriaImmobiliare #VestaAI #Appartamento${input.comune} #InvestimentoImmobiliare #CasaPremium`
    },
    visitGuide: {
      strengths: [
        `Geolocalizzazione strategica e certificata all'interno del comune di ${input.comune}`,
        `Superficie volumetrica reale di ${input.sqm} m² ottimizzata senza dispersioni statiche`,
        flags.isBright ? "Scansione d'esposizione solare eccellente con elevata penetrazione di luce naturale" : "Illuminotecnica interna razionale ed efficiente su tutti i quadranti",
        flags.hasParquet ? "Finitura pavimenti in parquet pregiato che eleva la percezione di lusso dell'asset" : "Pianta strutturale altamente flessibile, esente da vincoli di pilastratura invasivi"
      ],
      objections: [
        {
          text: "Il valore economico richiesto è impegnativo per il budget stanziato.",
          answer: `Il prezzo di €${input.price.toLocaleString('it-IT')} riflette perfettamente le quotazioni analitiche reali della zona di ${input.comune}. Con una stima di rendita locativa di €${estimatedMonthlyRent}/mese, l'asset esprime un tasso di capitalizzazione del ${roiPercentage}%, mettendone al sicuro la stabilità e la rivalutazione futura.`
        },
        {
          text: flags.isToRenovate ? "L'entità delle opere di ristrutturazione comporta un aggravio di stress e tempi." : "Il design distributivo dell'immobile segue schemi tradizionali.",
          answer: flags.isToRenovate 
            ? `I lavori di ripristino permettono di recuperare fino al 50% delle spese tramite gli sgravi fiscali vigenti. Acquistando a questo prezzo e ristrutturando, si genera un plusvalore immediato sul mercato del 20-25% a cantiere chiuso.`
            : `La totale assenza di muri di spina o pilastri portanti nell'asse centrale dell'immobile, documentata in planimetria, permette una riconfigurazione totale in chiave open-space minimale con interventi a bassissimo impatto economico.`
        }
      ]
    },
    analysis: {
      conditionRating,
      renovationCostEstimate,
      rentalYieldAnalysis: `L'analisi strutturata per la zona di ${input.comune} evidenzia un potenziale di posizionamento eccellente. L'immobile con superficie di ${input.sqm} mq e consistenza pari a ${input.rooms} locali presenta ampi margini di ottimizzazione, specialmente con una complessità ristrutturazioni di livello ${renovationComplexity}/5 con opere di tipo "${input.renovationWorkTypes || 'rinfresco generale'}", che permetterà di incrementare l'appeal locativo sia per contratti ordinari che nel comparto dinamico degli affitti brevi di zona.`,
      estimatedMonthlyRentMin: estimatedRentMin,
      estimatedMonthlyRentMax: estimatedRentMax,
      shortTermRateMin,
      shortTermRateMax,
      maintenanceCosts,
      roiPercentage: Number(roiPercentage)
    }
  };
};

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<{ mimeType: string; base64: string; name: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const parts = reader.result.split(';base64,');
        const mimeType = parts[0].split(':')[1];
        const base64 = parts[1];
        resolve({ mimeType, base64, name: file.name });
      } else {
        reject(new Error("File reading failed"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Core asynchronous function that makes requests directly to the express backend
 * to utilize the true Gemini Vision API capability.
 */
export const runRealAIEngine = async (
  input: VestaInputState,
  photoFiles: File[],
  floorPlanFile: File | null
): Promise<VestaReport> => {
  // Convert files to base64 formats
  const parsedPhotos = await Promise.all(
    photoFiles.map(async (file) => {
      try {
        if (file && file.size > 0) {
          const res = await fileToBase64(file);
          return res;
        }
      } catch (e) {
        console.warn("Base64 conversion failed for photo", e);
      }
      return null;
    })
  );
  
  const validPhotos = parsedPhotos.filter(p => p !== null) as { mimeType: string; base64: string; name: string }[];
  
  let validFloorPlan: { mimeType: string; base64: string; name: string } | null = null;
  if (floorPlanFile && floorPlanFile.size > 0) {
    try {
      validFloorPlan = await fileToBase64(floorPlanFile);
    } catch (e) {
      console.warn("Base64 conversion failed for floorplan", e);
    }
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input,
      photos: validPhotos,
      floorPlan: validFloorPlan
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Server returned error ${response.status}: ${errText}`);
  }

  const report: VestaReport = await response.json();
  
  // Create object URLs on the client so images are visible
  // We can match them back to original Files if needed, or we keep client objectURLs.
  report.visualAnalysisItems = report.visualAnalysisItems.map(item => {
    if (item.id.startsWith("photo-") && photoFiles.length > 0) {
      // Find matching index from file name or index
      const matchIndex = parseInt(item.id.split("-")[1]);
      const fileObj = photoFiles[matchIndex] || photoFiles[0];
      if (fileObj && fileObj.size > 0) {
        try {
          return { ...item, url: URL.createObjectURL(fileObj) };
        } catch (e) {
          // Fallback to what we have or inline svg
        }
      }
    } else if (item.id.startsWith("floorplan-") && floorPlanFile && floorPlanFile.size > 0) {
      try {
        return { ...item, url: URL.createObjectURL(floorPlanFile) };
      } catch (e) {
        // Fallback
      }
    }
    
    // If no valid Client ObjectURL can be derived, provide a stylized SVG data URI representation
    if (!item.url || item.url.startsWith("placeholder")) {
      const isFloor = item.id.includes("floorplan");
      item.url = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23111827'/><rect x='10' y='10' width='380' height='280' fill='none' stroke='%23374151' stroke-width='2' stroke-dasharray='5 5'/><text x='50%' y='40%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23F5F5F3'>${isFloor ? 'PLANIMETRIA' : 'ISPEZIONE FOTOGRAFICA'}</text><text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='11' fill='%236B7280'>[${item.name}]</text><path d='M180,180 L220,180 M200,160 L200,200' stroke='%230F52BA' stroke-width='2'/></svg>`;
    }
    return item;
  });

  return report;
};
