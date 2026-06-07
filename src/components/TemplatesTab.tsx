import { useState } from 'react';
import { FileText, Copy, Check, Info } from 'lucide-react';

interface TemplateItem {
  id: string;
  title: string;
  description: string;
  tone: string;
  body: string;
}

export default function TemplatesTab() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates: TemplateItem[] = [
    {
      id: "t1",
      title: "Annuncio Persuasivo Classico (Luxury / Premium)",
      description: "Struttura d'annuncio elegante mirata a esaltare la storicità, finiture sartoriali e la luminosità zenitale delle camere.",
      tone: "Sofisticato / Rappresentanza",
      body: `Incantevole dimora di alta rappresentanza inserita nel cuore pulsante della zona d'elezione. 
L'asset si inserisce in un contesto architettonico raffinato, dove volumetria e luce naturale si fondono in un perfetto equilibrio.

CARATTERISTICHE DI SPICCO:
📐 Superficie commerciale ottimizzata per un respiro spaziale fluente.
🚪 Salone monumentale con superfici vetrate ad ampio raggio espositivo.
✨ Materiali nobili e rivestimenti d'arredo sartoriali a taglio millimetrico.

Ideale per palati esigenti che cercano un connubio indissolubile tra prestigio formale e comfort tecnologico all'avanguardia.`
    },
    {
      id: "t2",
      title: "Analisi Finanziaria Speculativa (Profilo Investitore)",
      description: "Testo di marketing mirato ad investitori istituzionali, fondi esteri e gestori di locazione breve ad alta rotazione.",
      tone: "Tecnico-Finanziario / ROI-focused",
      body: `ASSET IMMOBILIARE AD ALTA PRODUTTIVITÀ TRANSATTIVA
Proponiamo eccezionale opportunità di posizionamento patrimoniale a salvaguardia del capitale.

METRICHE DI RESILIENZA FINANZIARIA:
📊 Redditività lorda teorica stimata superiore al 4.8% annuo.
💵 Canone mensile di locazione stimabile in base all'analisi dei micro-comparti di zona.
🛠️ Potenziale moltiplicatore di valore latente sfruttando i vigenti sgravi fiscali di ripristino edilizio.

Un'operazione difensiva, esente da oscillazioni di mercato volatili, configurata nel segmento locativo d'eccellenza.`
    },
    {
      id: "t3",
      title: "Storytelling Familiare Empatico (Comfort di Vita)",
      description: "Focus sulla qualità dei flussi d'uso quotidiani, privacy, spazi comuni ampi e vicinanza alle infrastrutture primarie.",
      tone: "Caldo / Accogliente",
      body: `Il luogo dove sognare, crescere e progettare la quotidianità più memorabile.
Questo appartamento è stato ripensato per accogliere la vivacità e le esigenze di una famiglia moderna.

IL COMFORT DELLA TUA DOMUS:
🏡 Camere ampie e luminose, pronte a mutare assecondando ogni fascia di età.
🌳 Posizionamento in un distretto sereno e dotato di ogni comfort logistico primario.
🧘 Spazi di distensione e relax da condividere in armonia senza rinunciare alla privacy individuale.

Una cornice protetta che aspetta solo di essere vissuta e riempita di nuovi progetti comuni.`
    }
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div id="templates-tab-view" className="max-w-4xl mx-auto py-8 px-6 antialiased font-sans space-y-6">
      
      {/* Templates Header */}
      <div className="border-b border-[#F5EFEB] pb-4">
        <div className="flex items-center space-x-2 text-[#1B3B2B]">
          <FileText className="w-5 h-5 text-[#1B3B2B]" />
          <span className="font-bold text-xs tracking-wider uppercase text-[#2C3E35]">Vesta Modelli Scrittura</span>
        </div>
        <h3 className="text-xl font-bold text-[#1B3B2B] mt-1" style={{ fontFamily: 'var(--font-display), serif' }}>Libreria Tonalità & Copywriting</h3>
        <p className="text-xs text-[#1B3B2B]/80">
          Usa i modelli di base per personalizzare manualmente i toni della dialettica di agenzia.
        </p>
      </div>

      {/* Templates Grid Grid */}
      <div className="grid grid-cols-1 gap-6">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm space-y-4 hover-lift transition-all">
            
            {/* Template Header block */}
            <div className="flex justify-between items-start border-b border-[#F5EFEB] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#072814]">{tpl.title}</h4>
                <p className="text-[11px] text-[#0C4A26]/75 mt-0.5 max-w-xl">{tpl.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-[#FAF6F0] border border-[#F5EFEB] text-[#072814] text-[10px] font-mono rounded uppercase tracking-wider font-semibold">
                  Tono: {tpl.tone}
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(tpl.id, tpl.body)}
                  className="p-1.5 hover:bg-slate-100 rounded transition text-[#0C4A26]/70 hover:text-[#0C4A26] border border-transparent hover:border-[#F5EFEB]"
                  title="Copia negli appunti"
                >
                  {copiedId === tpl.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Template body panel in monospaced layout */}
            <div className="bg-[#FAF6F0]/60 rounded-lg p-4 border border-[#F5EFEB] font-serif text-[#072814] text-xs leading-relaxed whitespace-pre-line max-h-52 overflow-y-auto">
              {tpl.body}
            </div>
          </div>
        ))}
      </div>

      {/* Informative advice foot */}
      <div className="bg-[#E8F5E9]/50 p-4 border border-green-200 rounded-xl flex items-start space-x-3">
        <Info className="w-5 h-5 text-[#0C4A26] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#072814]/80 leading-normal font-sans">
          <strong>PRO TIP:</strong> Nel modulo principale <span className="font-semibold uppercase text-xs">"Nuovo Annuncio"</span>, puoi aggiungere qualunque target di clientela personalizzato cliccando sulla barra dei tag. Gemini adatterà automaticamente le tonalità persuasive integrando i principi geometrici, materiali ed economici ricavati dai file d'immagine!
        </p>
      </div>

    </div>
  );
}
