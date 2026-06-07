import { Layers, MapPin, Eye, Trash2, Home } from 'lucide-react';
import { VestaReport } from '../types';

interface CatalogItem {
  id: string;
  address: string;
  comune: string;
  cap: string;
  price: number;
  sqm: number;
  rooms: string;
  report: VestaReport;
  timestamp: string;
}

interface CatalogTabProps {
  catalogItems: CatalogItem[];
  onSelectReport: (report: VestaReport, address: string, comune: string, cap: string, price: number, sqm: number, rooms: string) => void;
  onDeleteItem: (id: string) => void;
  onNavigateToCreate: () => void;
}

export default function CatalogTab({ catalogItems, onSelectReport, onDeleteItem, onNavigateToCreate }: CatalogTabProps) {
  return (
    <div id="catalog-tab-view" className="max-w-5xl mx-auto py-8 px-6 antialiased font-sans space-y-6">
      
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F5EFEB] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-[#1B3B2B]">
            <Layers className="w-5 h-5 text-[#1B3B2B]" />
            <span className="font-bold text-xs tracking-wider uppercase text-[#2C3E35]">Vesta Proprietà Archivio</span>
          </div>
          <h3 className="text-xl font-bold text-[#1B3B2B] mt-1" style={{ fontFamily: 'var(--font-display), serif' }}>Archivio Rapporti</h3>
          <p className="text-xs text-[#1B3B2B]/80">
            Consulta e ripristina la cronologia di tutti i patrimoni analizzati e sintetizzati dal cognitive core.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToCreate}
          className="mt-4 md:mt-0 flex items-center space-x-1.5 px-4 py-2.5 bg-[#1B3B2B] hover:bg-[#2C3E35] text-white text-xs font-semibold rounded-lg hover-lift transition font-mono active:scale-95 shadow-sm shadow-[#1B3B2B]/10"
        >
          <span>+ NUOVA ANALISI</span>
        </button>
      </div>

      {catalogItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {catalogItems.map((item) => {
            // Find active visual item preview if available
            const previewItem = item.report.visualAnalysisItems.find(i => i.id.startsWith("photo-") && i.url);
            const previewUrl = previewItem ? previewItem.url : null;
            const cardDate = new Date(item.timestamp).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div 
                key={item.id} 
                className="bg-white border border-[#F5EFEB] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover-lift transition-all duration-300"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="h-44 w-full bg-[#2C3E35] relative overflow-hidden flex items-center justify-center">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt={item.address} 
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-[#FAF6F0]">
                        <Home className="w-8 h-8 text-[#1B3B2B] mb-2 animate-pulse" />
                        <span className="font-mono text-[9px] uppercase tracking-wide">SCANSIONE MULTIMEDIALE PRONTA</span>
                      </div>
                    )}
                    
                    {/* Timestamp Badge */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono uppercase tracking-widest text-[#FAF6F0] px-2 py-0.5 rounded shadow">
                      {cardDate}
                    </div>

                    <div className="absolute top-3 right-3 bg-[#1B3B2B] text-white font-mono text-[9px] px-2 py-0.5 rounded tracking-widest uppercase">
                      SECURE VA-V5
                    </div>
                  </div>

                  {/* Card Content parameters */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <div className="flex items-center space-x-1.5 text-[#1B3B2B]/80 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </div>
                      <h4 className="font-bold text-base text-[#2C3E35] mt-1 leading-snug">
                        {item.rooms} a {item.comune} ({item.cap})
                      </h4>
                    </div>

                    {/* Numeric info lines */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-[#F5EFEB] py-3 text-center">
                      <div>
                        <span className="block text-[8px] font-mono tracking-wider text-[#1B3B2B]/80 uppercase">SUPERFICIE</span>
                        <strong className="text-sm font-extrabold text-[#2C3E35] font-mono">{item.sqm} mq</strong>
                      </div>
                      <div className="border-l border-[#F5EFEB]">
                        <span className="block text-[8px] font-mono tracking-wider text-[#1B3B2B]/80 uppercase">POSIZIONAMENTO PREZZO</span>
                        <strong className="text-sm font-extrabold text-[#1B3B2B] font-mono">€{item.price.toLocaleString('it-IT')}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#F5EFEB] bg-[#FAF6F0]/40">
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="flex items-center space-x-1 px-3 py-2 border border-[#F5EFEB] hover:bg-red-50 hover:border-red-200 hover:text-red-600 rounded-lg text-[10px] font-semibold tracking-wider text-[#1B3B2B]/70 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ELIMINA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectReport(item.report, item.address, item.comune, item.cap, item.price, item.sqm, item.rooms)}
                    className="flex items-center space-x-1 px-4 py-2 bg-[#2C3E35] hover:bg-[#1B3B2B] text-white rounded-lg text-[10px] font-bold tracking-widest transition hover-lift animate-pulse"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>VISUALIZZA REPORT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#F5EFEB] rounded-xl p-16 text-center shadow-sm max-w-lg mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#1B3B2B]/10 flex items-center justify-center text-[#1B3B2B] mb-4">
            <Home className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="font-bold text-sm text-[#2C3E35] uppercase tracking-wider mb-1">Archivio Filtri Vuoto</h4>
          <p className="text-xs text-[#1B3B2B]/80 leading-relaxed mb-6">
            Non è stato ancora effettuato nessun ciclo di elaborazione cognitiva. Carica foto d'interni, planimetrie reali o l'asset demo per lanciare la tua prima diagnostica!
          </p>
          <button
            type="button"
            onClick={onNavigateToCreate}
            className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#2C3E35] text-[#FBFBFA] text-xs font-bold font-mono tracking-widest rounded-lg transition-all hover-lift active:scale-95 shadow-sm shadow-[#1B3B2B]/10"
          >
            AVVIA ORA
          </button>
        </div>
      )}

    </div>
  );
}
