import React, { useState, useEffect } from 'react';
import { Copy, ChevronLeft, ChevronRight, CheckCircle, ShieldAlert, Award, AlertCircle, Printer, Image as ImageIcon, FileText } from 'lucide-react';
import { VestaReport, VestaInputState } from '../types';
import { exportClientReport, exportAgentGuide } from '../utils/exportPdf';
import { ClayIcon } from './ClayIcon';

interface ResultsDashboardProps {
  report: VestaReport;
  formState: VestaInputState;
  setFormState: React.Dispatch<React.SetStateAction<VestaInputState>>;
}

// Client-side copywriting adaptation based on the target audience chosen
function getAdaptedText(
  portalType: 'immobiliareIt' | 'idealista' | 'facebook' | 'instagram' | 'seo',
  targetName: string,
  originalText: string,
  formState: VestaInputState,
  report: VestaReport
): string | { title: string; bullets: string[]; hashtags: string } {
  if (!targetName || targetName === 'generale') {
    if (portalType === 'seo') {
      return {
        title: report.seoPortals?.title || "",
        bullets: report.seoPortals?.bullets || [],
        hashtags: report.seoPortals?.hashtags || ""
      };
    }
    return originalText;
  }

  const normalized = targetName.toLowerCase();
  
  let hookIntro = "";
  let toneKeywords = "";
  let emojiHeader = "";
  let ctaStr = "";
  let hashtagsStr = "";
  let extraBullets: string[] = [];
  let adaptedTitle = "";

  if (normalized.includes('luxury') || normalized.includes('luss') || normalized.includes('elite') || normalized.includes('prestigio')) {
    emojiHeader = "💎✨ [OPPORTUNITÀ ELITE — LUXURY BUYERS] ✨💎";
    hookIntro = `In una delle cornici residenziali più importanti, proponiamo un capolavoro architettonico di ${formState.rooms} vani che incarna il concetto stesso di lusso e raffinatezza. Una soluzione esclusiva, concepita per acquirenti che esigono finiture di pregio assoluto, un'eccezionale luminosità naturale e dettagli di puro design nel comune di ${formState.comune}.`;
    toneKeywords = "L'esclusività di un indirizzo di prestigio si fonde con interni dai dettagli curati, ideali per chi è abituato a standard qualitativi d'élite.";
    ctaStr = "Trattativa riservata per clientela selezionata. Contattare l'ufficio per pianificare un Private Viewing personalizzato.";
    hashtagsStr = "#LuxuryRealEstate #LuxuryDesign2026 #DreamHome #InvestimentoElite #VestaPrestige";
    extraBullets = [
      `Finiture di livello d'eccellenza e impiantistica all'avanguardia per il massimo comfort abitativo`,
      `Insolata illuminazione naturale e Classe Energetica "${formState.energyClass}" a garanzia di un investimento solido`,
      `Collocamento esclusivo nel comune di ${formState.comune} con altissimo appeal di rivendibilità`
    ];
    adaptedTitle = `👑 DIMORA ESCLUSIVA A ${formState.comune.toUpperCase()} — CAPOLAVORO PER LUXURY BUYERS`;
  } else if (normalized.includes('giovan') || normalized.includes('coppi') || normalized.includes('young') || normalized.includes('coppia')) {
    emojiHeader = "🏡💑 [IL NIDO PERFETTO — GIOVANI COPPIE] 💑🏡";
    hookIntro = `Se stai cercando la tua prima casa e sogni spazi moderni, confortevoli e facili da gestire, questo spettacolare appartamento di ${formState.sqm} mq è la scelta perfetta per iniziare il vostro percorso di vita insieme! Un layout lineare e giovanile unito a una Classe Energetica "${formState.energyClass}" d'eccellenza per ottimizzare ogni consumo nel cuore di ${formState.comune}.`;
    toneKeywords = "La vicinanza a servizi essenziali, parchi e collegamenti rapidi assicura una quotidianità dinamica, confortevole e dal valore duraturo.";
    ctaStr = "Perfetto per beneficiare del Bonus Prima Casa e mutui agevolati giovanili. Scrivici subito per non perdere questo treno!";
    hashtagsStr = "#PrimaCasa #GiovaniCoppie #NidoModerno #AbitareAutonomo #VestaModernLiving";
    extraBullets = [
      `Layout flessibile e moderno, ideale per lo smart working o per allestire una camera ospiti/studio`,
      `Zero spese per lavori straordinari imminenti grazie alle buone condizioni manutentive dell'asset`,
      `Collegamenti rapidi con i mezzi pubblici d’area e facile accesso alle principali arterie stradali`
    ];
    adaptedTitle = `✨ ACCENTI MODERNI A ${formState.comune.toUpperCase()} — IL NIDO IDEALE PER GIOVANI COPPIE`;
  } else if (normalized.includes('famigl') || normalized.includes('grandi') || normalized.includes('spazio') || normalized.includes('family')) {
    emojiHeader = "👨‍👩‍👧‍👦🍀 [DIMORA SPAZIOSA — COMPLESSO FAMIGLIE] 🍀👨‍👩‍👧‍👦";
    hookIntro = `Una residenza dalle dimensioni generose concepita per assecondare la crescita serena della tua famiglia. Con ben ${formState.rooms} vani disposti armonicamente su ${formState.sqm} mq utili, questa casa garantisce la perfetta coesistenza tra spazi di ritrovo conviviale e camere indipendenti dove ogni membro può godere della propria privacy nel comune di ${formState.comune}.`;
    toneKeywords = "Ubicato in un quartiere estremamente sicuro, silenzioso e strategicamente collegato a plessi scolastici, asili e centri sportivi per lo svago diurno.";
    ctaStr = "Fissa oggi stesso un appuntamento di visita per la tua famiglia. Contattaci e scopri la praticità di questa soluzione.";
    hashtagsStr = "#CasaPerFamiglie #SpaziGenerosi #CrescitaSerena #InfrastruttureComode #VestaFamilyHouse";
    extraBullets = [
      `Cucina abitabile e ampi saloni adatti per indimenticabili cene e ritrovi di famiglia`,
      `Tranquillità di quartiere garantita con asili, scuole elementari e aree verdi a pochi passi reali`,
      `L'ottimo isolamento termico garantisce una temperatura interna ideale e risparmio sulle bollette d'area`
    ];
    adaptedTitle = `🏠 AMPI SPAZI A ${formState.comune.toUpperCase()} — LA DIMORA PERFETTA PER LA TUA FAMIGLIA`;
  } else if (normalized.includes('invest') || normalized.includes('affitt') || normalized.includes('breve') || normalized.includes('investitori') || normalized.includes('b&b')) {
    emojiHeader = "📈💼 [REDDITIVITÀ CERTIFICATA — FOCUS INVESTITORI] 💼📈";
    hookIntro = `Interessante opportunità finanziaria ad elevate performance nel dinamico panorama immobiliare di ${formState.comune}. Questa proprietà di ${formState.sqm} mq rappresenta un perfetto veicolo d'investimento per chi desidera rendite passive certe e flussi di cassa stabili generandoli sia dal mercato turistico degli affitti brevi, sia da locazioni transitorie a professionisti e studenti d'alto livello.`;
    toneKeywords = `L'asset coniuga una forte tenuta del valore patrimoniale nel tempo con una rendita potenziale lorda stimata e rafforzata da costi d'upkeep condominiali ridotti.`;
    ctaStr = "Disponiamo di Business Plan integrato con proiezioni d'occupazione e simulazione cash flow. Contattateci per l'audit d'acquisto.";
    hashtagsStr = "#RealEstateInvestment #RenditaImmobiliare #HighYield #AffittiBreviLusso #VestaAssetManagement";
    extraBullets = [
      `ROI stimato eccellente basato sull'andamento delle transazioni locative reali della zona`,
      `Perfettamente sezionabile o posizionabile immediatamente sui principali portali del turismo internazionale`,
      `Classe Energetica efficiente che minimizza l'impatto dei costi fissi digestione condominiale`
    ];
    adaptedTitle = `📊 CHIAVI IN MANO A ${formState.comune.toUpperCase()} — ECCELLENTE VEICOLO D'INVESTIMENTO`;
  } else {
    emojiHeader = `🎯📌 [PROPOSTA MIRATA per ${targetName.toUpperCase()}] 📌🎯`;
    hookIntro = `Soluzione immobiliare esclusiva appositamente ottimizzata per rispondere alle peculiari esigenze di chi fa parte del target ${targetName}. Un immobile versatile di ${formState.rooms} vani che fa dell'eccellenza strutturale e di un posizionamento geografico imbattibile a ${formState.comune} i suoi pilastri portanti.`;
    toneKeywords = `Le caratteristiche fisiche ed energetiche dell'immobile assicurano comfort assoluto e massima aderenza alle aspettative di questa tipologia di acquirenti.`;
    ctaStr = "Non lasciarti sfuggire questa magnifica opportunità mirata. Contattaci subito per maggiori chiarimenti.";
    hashtagsStr = `#AssetMirato #VestaSpecialCustom #QualitaImmobiliare #Appartamento${formState.comune}`;
    extraBullets = [
      `Caratteristiche strutturali di ottimo livello adatte a molteplici soluzioni d'arredo personalizzate`,
      `Vicino a tutte le infrastrutture primarie e ai collegamenti strategici principali del territorio`,
      `Prezzo calibrato in modo millimetrico rispetto ai trend di mercato d'area`
    ];
    adaptedTitle = `💫 SPECIALE SELEZIONE PER ${targetName.toUpperCase()} A ${formState.comune.toUpperCase()}`;
  }

  if (portalType === 'immobiliareIt') {
    return `${emojiHeader}\n\n${hookIntro}\n\n${originalText.substring(originalText.indexOf('\n') + 1)}\n\n💡 NOTA D'APPEAL TARGETIZZATO FORNITA DA VESTA:\n* ${toneKeywords}\n* ${ctaStr}`;
  } else if (portalType === 'idealista') {
    const bulletInclusions = extraBullets.map(b => `- ${b}`).join('\n');
    return `*${adaptedTitle}*\n\n${hookIntro}\n\n${originalText.substring(originalText.indexOf('\n') + 1)}\n\n* PERCHÉ È PERFETTO PER VOI:\n${bulletInclusions}\n\n👉 NOTA: ${ctaStr}`;
  } else if (portalType === 'facebook') {
    return `📣 ${emojiHeader}\n\n${hookIntro}\n\n${originalText}\n\n✨ IL VALORE AGGIUNTO:\n✅ ${toneKeywords}\n\n📬 ${ctaStr}\n\n${hashtagsStr}`;
  } else if (portalType === 'instagram') {
    return `✨ ${adaptedTitle} ✨\n\n${hookIntro}\n\n${originalText}\n\n🎯 Ideale per chi cerca una soluzione dedicata a: ${targetName}.\n\n📍 ${formState.address}, ${formState.comune}\n${hashtagsStr} #${targetName.replace(/\s+/g, '')}`;
  } else if (portalType === 'seo') {
    const baseSeo = report.seoPortals || { title: "", bullets: [], hashtags: "" };
    return {
      title: `${adaptedTitle} | Vesta AI v5.0`,
      bullets: [
        ...extraBullets,
        ...(baseSeo.bullets || []).slice(0, 3)
      ],
      hashtags: `${baseSeo.hashtags || ""} ${hashtagsStr}`
    };
  }

  return originalText;
}

export default function ResultsDashboard({ report, formState, setFormState }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'visual' | 'marketing' | 'sales' | 'legal'>('analysis');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [activeYieldSubTab, setActiveYieldSubTab] = useState<'longTerm' | 'shortTerm'>('longTerm');
  
  // Carousel pointer state
  const [activeVisualIndex, setActiveVisualIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Marketing sub-target active profile state
  const availableTargetKeys = Object.keys(report.marketingTexts || {});
  const [activeMarketingCategory, setActiveMarketingCategory] = useState(
    availableTargetKeys[0] || 'Giovani Coppie'
  );

  const [activeAdTarget, setActiveAdTarget] = useState<string>('generale');

  useEffect(() => {
    setActiveAdTarget('generale');
  }, [report]);

  useEffect(() => {
    if (availableTargetKeys.length > 0) {
      if (availableTargetKeys.includes("Proposta Schematica")) {
        setActiveMarketingCategory("Proposta Schematica");
      } else {
        setActiveMarketingCategory(availableTargetKeys[0]);
      }
    }
  }, [report]);

  // Portals formatting tabs state
  const [activePortalTab, setActivePortalTab] = useState<'immobiliareIt' | 'idealista' | 'facebook' | 'instagram' | 'seo'>('immobiliareIt');
  const [portalCopyFeedback, setPortalCopyFeedback] = useState(false);

  // Trigger clipboard copy action for portals and social formats
  const handleCopyPortalText = (key: 'immobiliareIt' | 'idealista' | 'facebook' | 'instagram' | 'seo') => {
    let textToCopy = "";
    const adapted = getAdaptedText(key, activeAdTarget, report.portalTexts?.[key as 'immobiliareIt' | 'idealista' | 'facebook' | 'instagram'] || "", formState, report);
    if (key === 'seo') {
      const seoData = adapted as { title: string; bullets: string[]; hashtags: string };
      textToCopy = `TITOLO CHIAVE SEO: ${seoData.title}\n\nPUNTI SINTESI CHIAVE:\n${seoData.bullets.map(b => `• ${b}`).join('\n')}\n\nHASHTAGS AGGREGATI: ${seoData.hashtags}`;
    } else {
      textToCopy = adapted as string;
    }

    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
      setPortalCopyFeedback(true);
      setTimeout(() => setPortalCopyFeedback(false), 2000);
    });
  };

  // Carousel navigation handlers
  const handlePrevVisual = () => {
    setActiveVisualIndex((prev) => 
      prev === 0 ? report.visualAnalysisItems.length - 1 : prev - 1
    );
    setIsExpanded(false); // Reset accordion on change
  };

  const handleNextVisual = () => {
    setActiveVisualIndex((prev) => 
      prev === report.visualAnalysisItems.length - 1 ? 0 : prev + 1
    );
    setIsExpanded(false); // Reset accordion on change
  };

  // Render tabs headings
  const tabsConfig = [
    { id: 'analysis', label: 'Analisi dell\'Immobile' },
    { id: 'visual', label: 'Analisi Visiva Locali' },
    { id: 'marketing', label: 'Schede Target Marketing' },
    { id: 'sales', label: 'Guida Vendita & Obiezioni' },
    { id: 'legal', label: 'Scheda Visita Legale (A4)' },
  ];

  // Helper values for marketing texts highlighting
  const currentMarketingText = report.marketingTexts[activeMarketingCategory] || 
    "Report marketing non generato per questo segmento specifico.";

  return (
    <div id="results-dashboard-root" className="w-full py-8 px-6 antialiased font-sans flex flex-col space-y-6">
      
      {/* Dynamic Header details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F5EFEB] pb-5 no-print">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1B3B2B] font-mono font-bold">
            STATO GENERAZIONE: ONLINE
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[#1B3B2B]" style={{ fontFamily: 'var(--font-display), serif' }}>
            Report Cognitivo Immobiliare
          </h2>
          <p className="text-xs text-[#2C3E35]/80 mt-0.5">
            Analisi vettoriale di {formState.sqm} mq situato in {formState.address}, {formState.comune}.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            disabled={isExporting !== null}
            onClick={async () => {
              setIsExporting('client');
              try {
                await exportClientReport(report, formState);
              } catch (e) {
                console.error(e);
              } finally {
                setIsExporting(null);
              }
            }}
            className="bg-[#FAF6F0] px-4 py-2 border border-[#F5EFEB] rounded-lg text-xs font-mono flex items-center gap-2 hover:bg-[#0C4A26] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExporting === 'client' ? 'Generazione...' : 'PDF Report Cliente'}</span>
          </button>
          <button
            disabled={isExporting !== null}
            onClick={async () => {
              setIsExporting('agent');
              try {
                await exportAgentGuide(report, formState);
              } catch (e) {
                console.error(e);
              } finally {
                setIsExporting(null);
              }
            }}
            className="bg-[#FAF6F0] px-4 py-2 border border-[#F5EFEB] rounded-lg text-xs font-mono flex items-center gap-2 hover:bg-[#0C4A26] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExporting === 'agent' ? 'Generazione...' : 'PDF Guida Agente'}</span>
          </button>
        </div>
        <div className="mt-4 md:mt-0 bg-[#FAF6F0] px-4 py-2 border border-[#F5EFEB] rounded-lg text-xs font-mono flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[#072814] font-semibold">COGNITIVE INDEX: SECURE</span>
        </div>
      </div>

      {/* Horizontal Main Tab Switches (no-print) */}
      <div className="flex border-b border-[#F5EFEB] space-x-1 no-print overflow-x-auto scrollbar-none">
        {tabsConfig.map((tb) => (
          <button
            key={tb.id}
            onClick={() => {
              setActiveTab(tb.id as any);
              setIsExpanded(false);
            }}
            id={`tab-switch-${tb.id}`}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-300 shrink-0 ${
              activeTab === tb.id
                ? 'border-[#0C4A26] text-[#0C4A26] font-bold'
                : 'border-transparent text-[#0C4A26]/70 hover:text-[#072814] hover:border-[#F5EFEB]'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE VIEWPORT TABS */}
      <div className="flex-1">
        
        {/* TAB 0: PROPERTY ANALYSIS & RENOVATION ESTIMATES */}
        {activeTab === 'analysis' && (() => {
          const analysis = report.analysis || {
            conditionRating: Math.max(1, 11 - (formState.renovationComplexity || 1)),
            renovationCostEstimate: (formState.sqm || 85) * ((formState.renovationComplexity || 1) * 200),
            rentalYieldAnalysis: `L'analisi strutturata per la zona di ${formState.comune || 'Roma'} evidenzia un potenziale di posizionamento eccellente. L'immobile con superficie di ${formState.sqm || 85} mq si presta a canoni convenienti sia in regime di locazione transitoria che per locazioni brevi ad alto rendimento, beneficiando delle caratteristiche del bene e delle peculiarità fisiche rivelate.`,
            estimatedMonthlyRentMin: Math.round((((formState.price || 250000) * 0.048) / 12) * 0.9),
            estimatedMonthlyRentMax: Math.round((((formState.price || 250000) * 0.048) / 12) * 1.15),
            shortTermRateMin: Math.round(((((formState.price || 250000) * 0.048) / 12) / 30) * 1.2),
            shortTermRateMax: Math.round(((((formState.price || 250000) * 0.048) / 12) / 30) * 1.8),
            maintenanceCosts: {
              condoFees: (formState.sqm || 85) * 12,
              taxes: Math.round((formState.price || 250000) * 0.006),
              insurance: 250,
              ordinaryMaintenance: Math.round((formState.price || 250000) * 0.005)
            },
            roiPercentage: Number((((((formState.price || 250000) * 0.048) / 12) * 12) / (formState.price || 250000) * 100).toFixed(1))
          };

          const totalMaintenanceCosts = Object.values(analysis.maintenanceCosts).reduce((a, b) => a + b, 0);

          return (
            <div id="property-analysis-tab-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in text-[#072814]">
              {/* Grid 1: Conservation condition and renovation costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual score of how well-maintained the house is */}
                <div className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 border-b border-[#F5EFEB] pb-3 mb-4">
                      <span className="text-xl">🏠</span>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#072814]">Valutazione di Conservazione</h4>
                        <span className="text-[10px] text-[#0C4A26]/80 font-mono">STATO MANUTENTIVO RILEVATO</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-[#2C3E35]/80 leading-relaxed mb-6">
                      L'intelligenza artificiale di Vesta, incrociando i rilievi fotografici con i dati tecnici e la planimetria dell'immobile, assegna un punteggio allo stato di conservazione complessivo della casa.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-semibold text-[#072814]/70">Punteggio del bene:</span>
                      <span className="text-3xl font-extrabold text-[#0C4A26] font-mono leading-none">
                        {analysis.conditionRating}<span className="text-xs text-stone-400 font-normal">/10</span>
                      </span>
                    </div>

                    {/* Linear color track progress bar */}
                    <div className="w-full bg-[#FAF6F0] h-3.5 rounded-full overflow-hidden border border-[#F5EFEB] p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          analysis.conditionRating <= 4 
                            ? 'bg-red-500' 
                            : analysis.conditionRating <= 7 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${analysis.conditionRating * 10}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-[#072814]/60">
                      <span>Da ristrutturare</span>
                      <span>Ideale</span>
                      <span>Nuovo / Ottimo</span>
                    </div>
                  </div>
                </div>

                {/* Estimate Renovations cost card */}
                <div className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 border-b border-[#F5EFEB] pb-3 mb-4">
                      <span className="text-xl">🛠️</span>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#072814]">Stima dei Costi di Ristrutturazione</h4>
                        <span className="text-[10px] text-[#0C4A26]/80 font-mono">CONGRUITA COMPUTATA</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#2C3E35]/80 leading-relaxed mb-4">
                      Rappresenta una stima analitica basata su una complessità di grado <strong>{formState.renovationComplexity || 1}/5</strong> per una metratura netta di <strong>{formState.sqm} mq</strong>, considerando gli attuali prezzi medi delle materie prime e delle maestranze sul territorio nazionale.
                    </p>
                  </div>

                  <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-[#072814]/65 uppercase block">COSTO DI RISTRUTTURAZIONE STIMATO</span>
                      <span id="renovation-cost" className="text-2xl font-bold font-mono text-[#0C4A26]">
                        €{analysis.renovationCostEstimate.toLocaleString('it-IT')}
                      </span>
                    </div>
                    <div className="text-right text-[10px] text-[#0C4A26] font-semibold leading-relaxed shrink-0">
                      <span>~€{Math.round(analysis.renovationCostEstimate / (formState.sqm || 1))} / mq</span>
                      <span className="block font-normal text-[8px] text-[#072814]/60 font-mono">Costi ordinari/strutturali</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Profit/Yield analysis, mini tabs, costs list */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Financial projection mini tab */}
                <div className="bg-white border border-[#F5EFEB] rounded-xl p-5 shadow-sm space-y-4 md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">📈</span>
                        <div>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-[#072814]">Analisi del Rendimento</h4>
                          <span className="text-[10px] text-[#0C4A26]/80 font-mono">STIME DI LOCAZIONE</span>
                        </div>
                      </div>

                      {/* Mini tabs selection */}
                      <div className="flex bg-[#FAF6F0] p-0.5 rounded-lg border border-[#F5EFEB]">
                        <button
                          type="button"
                          onClick={() => setActiveYieldSubTab('longTerm')}
                          className={`text-[9px] px-2.5 py-1 font-bold uppercase rounded-md transition ${
                            activeYieldSubTab === 'longTerm' ? 'bg-[#0C4A26] text-white shadow-sm' : 'text-[#072814]/75 hover:bg-stone-200/50'
                          }`}
                        >
                          Lungo Termine
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveYieldSubTab('shortTerm')}
                          className={`text-[9px] px-2.5 py-1 font-bold uppercase rounded-md transition ${
                            activeYieldSubTab === 'shortTerm' ? 'bg-[#0C4A26] text-white shadow-sm' : 'text-[#072814]/75 hover:bg-stone-200/50'
                          }`}
                        >
                          Affitto Breve
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activeYieldSubTab === 'longTerm' ? (
                        <div className="space-y-3 animate-fade-in text-[#072814]">
                          <p className="text-xs text-[#2C3E35]/80 leading-relaxed">
                            Intervalli di locazione a lungo termine stimati in base ai canoni concordati e liberi della zona ricercata (es. contratti 3+2 o 4+4 di zona).
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] p-3 rounded-lg text-center">
                              <span className="text-[9px] font-mono text-[#072814]/70 block uppercase">Canone Minimo</span>
                              <strong className="text-xl font-bold text-[#0C4A26] font-mono">€{analysis.estimatedMonthlyRentMin.toLocaleString('it-IT')}</strong>
                              <span className="text-[8px] text-[#072814]/50 font-mono block">/ mese</span>
                            </div>
                            <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] p-3 rounded-lg text-center">
                              <span className="text-[9px] font-mono text-[#072814]/70 block uppercase">Canone Massimo</span>
                              <strong className="text-xl font-bold text-[#0C4A26] font-mono">€{analysis.estimatedMonthlyRentMax.toLocaleString('it-IT')}</strong>
                              <span className="text-[8px] text-[#072814]/50 font-mono block">/ mese</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-fade-in text-[#072814]">
                          <p className="text-xs text-[#2C3E35]/80 leading-relaxed">
                            Tariffazione consigliata per notte nel mercato degli affitti brevi turistici e locazione temporanea, considerando tassi di occupazione medi del 65-75%.
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] p-3 rounded-lg text-center">
                              <span className="text-[9px] font-mono text-[#072814]/70 block uppercase">Tariffa Notte Minima</span>
                              <strong className="text-xl font-bold text-[#0C4A26] font-mono font-mono">€{analysis.shortTermRateMin}</strong>
                              <span className="text-[8px] text-[#072814]/50 font-mono block">/ notte</span>
                            </div>
                            <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] p-3 rounded-lg text-center">
                              <span className="text-[9px] font-mono text-[#072814]/70 block uppercase">Tariffa Notte Massima</span>
                              <strong className="text-xl font-bold text-[#0C4A26] font-mono font-mono">€{analysis.shortTermRateMax}</strong>
                              <span className="text-[8px] text-[#072814]/50 font-mono block">/ notte</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Yield Text */}
                      <div className="text-xs text-[#072814]/90 bg-[#FAF6F0]/20 p-3.5 border border-[#F5EFEB] rounded-xl leading-relaxed italic whitespace-pre-line">
                        "{analysis.rentalYieldAnalysis}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Cost of upkeep and ROI % */}
                <div className="bg-white border border-[#F5EFEB] rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 border-b border-[#F5EFEB] pb-3 mb-4">
                      <span className="text-sm">🪙</span>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#072814]">Spese Gestionali & ROI</h4>
                        <span className="text-[10px] text-[#0C4A26]/80 font-mono">COSTI DI MANTENIMENTO</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center text-[#072814]/95 border-b border-[#F5EFEB] pb-1.5">
                        <span className="font-medium">Spese Condominiali:</span>
                        <span className="font-mono font-bold text-[#0C4A26]">€{analysis.maintenanceCosts.condoFees.toLocaleString('it-IT')}/anno</span>
                      </div>
                      <div className="flex justify-between items-center text-[#072814]/95 border-b border-[#F5EFEB] pb-1.5">
                        <span className="font-medium">Imposte (IMU, TARI):</span>
                        <span className="font-mono font-bold text-[#0C4A26]">€{analysis.maintenanceCosts.taxes.toLocaleString('it-IT')}/anno</span>
                      </div>
                      <div className="flex justify-between items-center text-[#072814]/95 border-b border-[#F5EFEB] pb-1.5">
                        <span className="font-medium">Polizza Assicurativa:</span>
                        <span className="font-mono font-bold text-[#0C4A26]">€{analysis.maintenanceCosts.insurance.toLocaleString('it-IT')}/anno</span>
                      </div>
                      <div className="flex justify-between items-center text-[#072814]/95">
                        <span className="font-medium">Opere di Manutenzione:</span>
                        <span className="font-mono font-bold text-[#0C4A26]">€{analysis.maintenanceCosts.ordinaryMaintenance.toLocaleString('it-IT')}/anno</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#F5EFEB]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-500 font-mono">TOTALE SPESE STIMATE</span>
                      <strong className="text-sm font-mono text-[#072814]">€{totalMaintenanceCosts.toLocaleString('it-IT')}/anno</strong>
                    </div>

                    <div className="bg-[#E8F5E9] border border-green-200 p-3 rounded-lg text-center">
                      <span className="text-[9px] font-mono text-[#0C4A26] block uppercase font-bold">Rendimento Annuo Stimato (ROI)</span>
                      <strong className="text-xl font-extrabold text-[#0C4A26] font-mono bg-white px-2 py-0.5 rounded border border-green-200 mt-1 inline-block">
                        {analysis.roiPercentage}%
                      </strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* TAB 1: VISUAL ANALYSIS & ACCORDION CAROUSEL */}
        {activeTab === 'visual' && (
          <div id="visual-tab-view" className="space-y-6 max-w-3xl mx-auto animate-fade-in">
            {report.visualAnalysisItems.length > 0 ? (
              <>
                {/* Image carousel frame */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#072814] border border-[#0C4A26] flex items-center justify-center shadow-lg group hover-lift transition-all">
                  
                  {/* Left vector arrow */}
                  <button
                    onClick={handlePrevVisual}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#0C4A26] text-white rounded-full transition-all focus:outline-none z-10 hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Active Slide image preview */}
                  {report.visualAnalysisItems[activeVisualIndex]?.url ? (
                    <img
                      src={report.visualAnalysisItems[activeVisualIndex].url}
                      alt={report.visualAnalysisItems[activeVisualIndex].name}
                      id="carousel-active-image"
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <div className="text-[#FAF6F0]/80 font-mono text-xs flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-[#0C4A26] mb-2 animate-bounce" />
                      <span>Anteprima della camera scansionata indisponibile</span>
                    </div>
                  )}

                  {/* Right vector arrow */}
                  <button
                    onClick={handleNextVisual}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-[#0C4A26] text-white rounded-full transition-all focus:outline-none z-10 hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Absolute subtle dark overlay with image count */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 py-1.5 px-4 bg-[#072814]/90 backdrop-blur-md rounded-full border border-white/10 font-mono text-[9px] text-[#FAF6F0] tracking-widest text-center shadow-md">
                    [FILE ID: {report.visualAnalysisItems[activeVisualIndex]?.name?.toUpperCase() || `IMMAGINE_${activeVisualIndex + 1}`} ({activeVisualIndex + 1} / {report.visualAnalysisItems.length})]
                  </div>
                </div>

                {/* Description block beneath & Accordion */}
                <div className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm flex flex-col space-y-4">
                  <div className="flex items-center space-x-2 text-[#0C4A26] border-b border-[#F5EFEB] pb-3">
                    <Award className="w-5 h-5" />
                    <h3 className="font-semibold text-sm tracking-tight uppercase text-[#072814]">
                      🔬 Rilevamento Ottico & Analisi Spaziale
                    </h3>
                  </div>

                  <div id="visual-desc-accordion-body" className="text-sm font-sans text-[#072814] leading-relaxed">
                    {/* Expandable Accordion Text Mechanics */}
                    {isExpanded ? (
                      <p className="whitespace-pre-line">
                        {report.visualAnalysisItems[activeVisualIndex]?.description}
                      </p>
                    ) : (
                      <p>
                        {report.visualAnalysisItems[activeVisualIndex]?.description?.substring(0, 180)}
                        {report.visualAnalysisItems[activeVisualIndex]?.description?.length > 180 ? "..." : ""}
                      </p>
                    )}
                  </div>

                  {report.visualAnalysisItems[activeVisualIndex]?.description?.length > 180 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      id="btn-accordion-toggle"
                      type="button"
                      className="self-start text-[11px] font-bold text-[#0C4A26] font-mono hover:text-[#072814] transition uppercase outline-none focus:outline-none"
                    >
                      {isExpanded ? "▲ Riduci descrizione" : "▼ Leggi tutto (Analisi Minuziosa)"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-[#FAF6F0]/40 p-12 text-center rounded-xl border border-[#F5EFEB] text-[#0C4A26] font-mono text-xs">
                🔴 Nessuna immagine scansionata pervenuta.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MARKETING CARDS & MULTI-TARGET MATRIX */}
        {activeTab === 'marketing' && (
          <div id="marketing-tab-view" className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            
            {/* SEZIONE FORMATTAZIONE PORTALI E SOCIAL */}
            <div className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F5EFEB] pb-4 gap-3">
                <div className="flex items-center space-x-3.5">
                  <ClayIcon type="cielo" size="sm" className="shrink-0" />
                  <div>
                    <span className="font-bold text-sm tracking-tight text-[#2C3E35] block uppercase">
                      Cielo d'Annunci: Copywriting Multi-Canale
                    </span>
                    <span className="text-[10px] text-[#1B3B2B]/70 font-mono block">SINTESI PROMOZIONALI PERSONALIZZATE E SOCIAL CON GEO TAGS</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleCopyPortalText(activePortalTab)}
                  id="btn-copy-portal"
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF6F0]/85 hover:bg-[#0C4A26] hover:text-white rounded-lg text-xs font-mono font-semibold border border-[#F5EFEB] transition text-[#072814] hover:border-[#0C4A26]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{portalCopyFeedback ? '✓ Copiato!' : '📋 Copia Testo Tab'}</span>
                </button>
              </div>

              {/* Selettore Target dell'Annuncio (Slider Segmentato) */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold text-[#0C4A26] uppercase tracking-wider font-mono">
                  🎯 Seleziona Target di Vendita (Adattamento Copione):
                </label>
                <div className="flex flex-wrap p-1 bg-[#FAF6F0] rounded-xl border border-[#F5EFEB] gap-1 max-w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveAdTarget('generale')}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                      activeAdTarget === 'generale'
                        ? 'bg-[#0C4A26] text-white shadow-sm'
                        : 'text-[#0C4A26]/75 hover:bg-white hover:text-[#0C4A26]'
                    }`}
                  >
                    🌐 Generale (Neutro)
                  </button>
                  {availableTargetKeys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveAdTarget(key)}
                      className={`px-4.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition shrink-0 ${
                        activeAdTarget === key
                          ? 'bg-[#0C4A26] text-white shadow-sm'
                          : 'text-[#0C4A26]/75 hover:bg-white hover:text-[#0C4A26]'
                      }`}
                    >
                      🎯 {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canali di vendita Sub tabs selectors */}
              <div className="space-y-2.5 pt-1">
                <label className="block text-[10px] font-bold text-[#0C4A26] uppercase tracking-wider font-mono">
                  🌐 Scegli Portale / Piattaforma:
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 bg-[#FAF6F0] rounded-lg max-w-fit">
                  {[
                    { id: 'immobiliareIt', label: 'Immobiliare.it', marker: '🌐' },
                    { id: 'idealista', label: 'Idealista.it', marker: '🏠' },
                    { id: 'facebook', label: 'Facebook Post', marker: '👥' },
                    { id: 'instagram', label: 'Instagram Feed', marker: '📸' },
                    { id: 'seo', label: 'SEO & Hashtags', marker: '🔍' }
                  ].map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setActivePortalTab(pt.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                        activePortalTab === pt.id
                          ? 'bg-white text-[#0C4A26] shadow-sm font-bold border border-[#F5EFEB]'
                          : 'text-[#0C4A26]/75 hover:text-[#072814] border-none bg-transparent'
                      }`}
                    >
                      <span className="mr-1">{pt.marker}</span>
                      <span>{pt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active tab content block */}
              <div className="bg-[#072814] text-white rounded-xl p-6 font-mono text-xs border border-[#0C4A26] relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-10 select-none text-[32px] font-bold">V5</div>
                
                {activePortalTab === 'seo' ? (
                  (() => {
                    const seoData = getAdaptedText('seo', activeAdTarget, '', formState, report) as { title: string; bullets: string[]; hashtags: string };
                    return (
                      <div className="space-y-4">
                        <div>
                          <span className="text-stone-300 block text-[9px] uppercase tracking-wider mb-1">TITOLO ANNUNCIO SUGGERITO:</span>
                          <p className="text-emerald-400 font-bold text-sm tracking-tight">{seoData.title}</p>
                        </div>

                        <div>
                          <span className="text-stone-300 block text-[9px] uppercase tracking-wider mb-1">BULLET POINTS SCHEDA:</span>
                          <ul className="list-disc pl-5 space-y-1 text-stone-100">
                            {(seoData.bullets || []).map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-stone-300 block text-[9px] uppercase tracking-wider mb-1 font-semibold">HASHTAGS CONSIGLIATI:</span>
                          <p className="text-emerald-400 font-semibold tracking-wide">{seoData.hashtags}</p>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div>
                    <span className="text-stone-300 block text-[9px] uppercase tracking-wider mb-2">
                      INDIRIZzO CANALE: {activePortalTab.toUpperCase()} (CON DIALETTICA PER IL TARGET: {activeAdTarget.toUpperCase()})
                    </span>
                    <p className="whitespace-pre-line text-[#FAF6F0] leading-relaxed font-sans text-sm max-w-3xl">
                      {getAdaptedText(activePortalTab, activeAdTarget, report.portalTexts?.[activePortalTab] || "", formState, report) as string}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SALES GUIDE & OBJECTIONS MATRIX */}
        {activeTab === 'sales' && (
          <div id="sales-tab-view" className="space-y-6 max-w-5xl mx-auto animate-fade-in">
            
            {/* Meticulous Geolocation Analysis Bento */}
            <div className="bg-white border border-[#F5EFEB] rounded-xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12">
              {/* Map Column (5 cols) */}
              <div className="md:col-span-5 h-64 md:h-auto min-h-[250px] relative bg-[#072814] border-r border-[#F5EFEB]">
                <iframe
                  title="Posizionamento Territoriale Meticoloso"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 opacity-80"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${formState.address || ""} ${formState.comune || ""} ${formState.cap || ""}`.trim() || "Roma")}&t=m&z=15&output=embed&iwloc=near`}
                />
                <div className="absolute top-3 left-3 bg-[#072814]/90 backdrop-blur-md border border-[#0C4A26] text-[#FAF6F0] font-mono text-[9px] px-2 py-0.5 rounded tracking-widest pointer-events-none uppercase">
                  📍 Posizionamento Attivo
                </div>
              </div>

              {/* Meticulous Text Details Column (7 cols) */}
              <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-3 text-[#1B3B2B] mb-2 border-b border-[#F5EFEB] pb-3">
                    <ClayIcon type="geolocation" size="sm" className="shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold font-mono uppercase tracking-widest block">
                        Analisi Geografica Nazionale & Servizi Vesta
                      </span>
                      <span className="text-[9px] text-[#1B3B2B]/70 block font-medium">STUDIO TERRITORIALE METICOLOSO</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#072814] tracking-tight">
                    Studio Territoriale di {formState.comune} ({formState.cap})
                  </h3>
                  <p className="text-xs text-slate-700 leading-normal mt-1 border-b border-dashed border-slate-205 border-[#F5EFEB] pb-3">
                    {report.geoAnalysis}
                  </p>
                </div>

                {/* Sub-cards connections/services/trend */}
                <div className="grid grid-cols-1 gap-3 text-xs leading-relaxed">
                  <div>
                    <span className="font-mono text-[9px] text-[#0C4A26] block uppercase font-bold tracking-wider">
                      🚌 Collegamenti & Infrastrutture:
                    </span>
                    <p className="text-slate-700">
                      {report.geoAnalysisDetails?.connections || "Rete di trasporti locali, stazioni principali e accessi stradali integrati nel report di zona."}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[9px] text-emerald-700 block uppercase font-bold tracking-wider">
                      🏫 Servizi di Prossimità & Istruzione:
                    </span>
                    <p className="text-slate-700">
                      {report.geoAnalysisDetails?.services || "Plessi scolastici, asili nido, centri ricreativi, supermercati e farmacie adiacenti all'asset."}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono text-[9px] text-emerald-800 block uppercase font-bold tracking-wider">
                      📈 Quotazione Area & Dinamica di Mercato:
                    </span>
                    <p className="text-slate-700">
                      {report.geoAnalysisDetails?.marketTrend || "Andamento medio del mercato immobiliare di quartiere, liquidità transazionale ed attrattività di collocamento."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Left Column: Strengths (2/5) */}
              <div className="md:col-span-2 bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm space-y-4">
                <div className="border-b border-[#F5EFEB] pb-3 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-650 text-emerald-700" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-[#072814]">
                    Punti di Forza dell'Asset
                  </h3>
                </div>

                <ul className="space-y-3">
                  {report.visitGuide.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed">
                      <span className="text-emerald-700 font-bold text-sm shrink-0 mt-0.5">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Objections table comparison (3/5) */}
              <div className="md:col-span-3 bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm space-y-4">
                <div className="border-b border-[#F5EFEB] pb-3 flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-xs uppercase tracking-widest text-[#072814]">
                    Tabella Tracciamento Obiezioni Cliente
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#F5EFEB] text-[10px] tracking-widest uppercase font-mono text-[#0C4A26]">
                        <th className="py-2.5 pr-4 w-2/5">[⚠️ OBIEZIONE RILEVATA]</th>
                        <th className="py-2.5 pl-4 w-3/5">[🛡️ DIALETTICA SUGGERITA]</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.visitGuide.objections.map((ob, idx) => (
                        <tr key={idx} className="border-b border-[#F5EFEB] last:border-0 hover:bg-[#FAF6F0]/40 transition-colors">
                          <td className="py-3 pr-4 font-semibold text-[#072814] leading-normal">
                            {ob.text}
                          </td>
                          <td className="py-3 pl-4 text-slate-700 font-sans leading-relaxed border-l border-[#F5EFEB]">
                            {ob.answer}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEGAL VISITATION WORKSHEET IN A4 FORMAT */}
        {activeTab === 'legal' && (
          <div id="legal-tab-view" className="space-y-6 flex flex-col items-center animate-fade-in">
            
            {/* Top printing utility action panel (no-print) */}
            <div className="w-full max-w-[210mm] bg-[#FAF6F0] p-4 border border-[#F5EFEB] rounded-xl flex items-center justify-between shadow-sm no-print">
              <div className="flex items-center space-x-3">
                <ClayIcon type="legal" size="sm" className="shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#2C3E35] block">
                    Scheda Verbale & Documentazione Legale
                  </span>
                  <span className="text-[10px] text-[#2C3E35]/70 block font-medium">
                    Verbale di sopralluogo per la stampa d'ufficio certificata A4.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                id="btn-print-visitation"
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#0C4A26] hover:bg-[#072814] text-white text-xs font-semibold rounded-lg shadow transition hover-lift font-mono"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>🖨️ Stampa Scheda di Visita</span>
              </button>
            </div>

            {/* A4 simulated sheet proportions */}
            <div className="print-page-container w-full max-w-[210mm] min-h-[297mm] bg-white border border-[#F5EFEB] rounded-lg p-12 flex flex-col justify-between shadow-xl text-[#072814] font-sans">
              <div>
                
                {/* Simulated corporate header */}
                <div className="flex justify-between items-start border-b-2 border-[#072814] pb-6 mb-8">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-2 border-[#0C4A26] flex items-center justify-center font-bold text-[#0C4A26] text-[10px] font-mono opacity-80">
                        VA
                      </div>
                      <span className="font-extrabold text-[#072814] tracking-wider text-sm font-mono">VESTA ASSOCIAZIONE IMMOBILIARE</span>
                    </div>
                    <span className="text-[9px] text-[#0C4A26]/80 font-mono block mt-1 uppercase">SISTEMA DI DIAGNOSTICA STRUTTURALE VESTA IA</span>
                  </div>
                  <div className="text-right font-mono text-[9px] text-[#0C4A26]/80">
                    <span>PROT: VA-{Math.round(formState.price / 1000)}-{formState.cap}</span>
                  </div>
                </div>

                <div className="text-center my-6">
                  <h1 className="text-xl font-bold uppercase tracking-widest text-[#1B3B2B]" style={{ letterSpacing: 'normal', fontFamily: 'var(--font-display), serif' }}>
                    Scheda Verbale di Presa Visione
                  </h1>
                  <span className="text-[10px] text-[#0C4A26]/80 font-mono">AL SOPRALLUOGO DI VERIFICA SUL POSTO</span>
                </div>

                {/* Sub-panels updating live inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF6F0]/40 border border-[#F5EFEB] p-4 rounded-lg my-6 font-mono text-[10px]">
                  <div>
                    <span className="text-[#0C4A26]/80 block uppercase mb-1">NOME SOGGETTO CLIENTE</span>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#F5EFEB] px-2 py-1 rounded text-[#072814] font-semibold text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0C4A26]"
                      value={formState.clientName}
                      onChange={(e) => setFormState(prev => ({ ...prev, clientName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <span className="text-[#0C4A26]/80 block uppercase mb-1">CONSULENTE IMMOBILIARE</span>
                    <input
                      type="text"
                      className="w-full bg-white border border-[#F5EFEB] px-2 py-1 rounded text-[#072814] font-semibold text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0C4A26]"
                      value={formState.agentName}
                      onChange={(e) => setFormState(prev => ({ ...prev, agentName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <span className="text-[#0C4A26]/80 block uppercase mb-1">DATA EFFETTIVA VISITA</span>
                    <input
                      type="date"
                      className="w-full bg-white border border-[#F5EFEB] px-2 py-1 rounded text-[#072814] font-semibold text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0C4A26]"
                      value={formState.visitDate}
                      onChange={(e) => setFormState(prev => ({ ...prev, visitDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* The Legal script interpolating values live */}
                <div className="space-y-4 my-8 text-xs text-slate-800 leading-relaxed font-sans">
                  <p>
                    Con la presente sottoscrizione, il/la sottoscritto/a <strong className="border-b border-[#072814] px-1 font-semibold">{formState.clientName}</strong>, 
                    di seguito denominato "Soggetto Visitatore", dichiara ufficialmente di aver ispezionato ed esaminato accuratamente l'immobile sito in:
                  </p>
                  
                  <div className="p-4 border-l-2 border-[#072814] bg-[#FAF6F0]/30 font-mono text-[11px] space-y-1 block">
                    <div><strong>VIA / INDIRIZZO:</strong> {formState.address}</div>
                    <div><strong>LOCALITÀ / CAP:</strong> {formState.comune} ({formState.cap})</div>
                    <div><strong>CONSISTENZA DICHIARATA:</strong> {formState.rooms} ({formState.sqm} mq utili catastali)</div>
                    <div><strong>CLASSE ENERGETICA ATTUALMENTE DEPOSITATA:</strong> CLASSE {formState.energyClass}</div>
                    <div><strong>POSIZIONAMENTO VALORE PATRIMONIALE:</strong> €{formState.price.toLocaleString('it-IT')}</div>
                  </div>

                  <p>
                    La visita conoscitiva e l'esame della conformità degli spazi è avvenuta in data odierna <strong className="border-b border-[#072814] px-1 font-semibold">{formState.visitDate}</strong>, 
                    con l'ausilio e l'accompagnamento professionale del consulente accreditato <strong className="border-b border-[#072814] px-1 font-semibold">{formState.agentName}</strong> per conto dell'agenzia licenziataria.
                  </p>

                  <p>
                    Il Visitatore riconosce che tutti i dati analitici, le perizie dimensionali e i report visuali forniti dal portale informatico 
                    sono basati sulla scansione e geolocalizzazione automatizzata di Vesta AI. Si raccomanda un controllo formale dei registri catastali e notarili prima di 
                    depositare eventuali caparre penali o procedere con compromessi e firme notarili.
                  </p>
                </div>

                {/* Signature regions */}
                <div className="grid grid-cols-2 gap-12 mt-16 font-mono text-[9px] pt-12 text-[#0C4A26]/80">
                  <div className="border-t border-[#F5EFEB] pt-3">
                    <span className="block mb-6 uppercase">Firma del Soggetto Visitatore</span>
                    <span className="text-[10px] text-[#072814] font-semibold block italic mt-4">{formState.clientName}</span>
                  </div>
                  <div className="border-t border-[#F5EFEB] pt-3">
                    <span className="block mb-6 uppercase">Firma del Consulente d'Ufficio</span>
                    <span className="text-[10px] text-[#072814] font-semibold block italic mt-4">{formState.agentName}</span>
                  </div>
                </div>
              </div>

              {/* Bottom legal page outline */}
              <div className="border-t border-[#F5EFEB] pt-4 mt-8 flex justify-between items-center text-[8px] font-mono text-[#0C4A26]/60">
                <span>VESTA CORP © ALL RIGHTS RESERVED</span>
                <span>PAGINA 1 DI 1</span>
                <span>SECURE CRYPTO PROTOCOL VA-v5</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
