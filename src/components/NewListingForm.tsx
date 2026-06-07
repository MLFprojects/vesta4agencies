import React, { useState, useRef, useEffect } from 'react';
import { Upload, Plus, Trash2, Zap, AlertTriangle, Image as ImageIcon, MapPin, Loader2 } from 'lucide-react';
import { VestaInputState, TargetProfile } from '../types';
import { ClayIcon } from './ClayIcon';

const COMUNE_TO_CAP: Record<string, string> = {
  'roma': '00100',
  'milano': '20100',
  'torino': '10100',
  'napoli': '80100',
  'firenze': '50100',
  'bologna': '40100',
  'palermo': '90100',
  'genova': '16100',
  'venezia': '30100',
  'bari': '70100',
  'catania': '95100',
  'verona': '37100',
  'messina': '98100',
  'padova': '35100',
  'trieste': '34100',
  'taranto': '74100',
  'brescia': '25100',
  'parma': '43100',
  'prato': '59100',
  'modena': '41100',
  'reggio calabria': '89100',
  'reggio emilia': '42100',
  'perugia': '06100',
  'livorno': '57100',
  'ravenna': '48100',
  'cagliari': '09100',
  'foggia': '71100',
  'rimini': '47900',
  'salerno': '84100',
  'ferrara': '44100',
  'sassari': '07100',
  'latina': '04100',
  'monza': '20900',
  'bergamo': '24100',
  'trento': '38100',
  'pescara': '65100',
  'siracusa': '96100',
  'vicenza': '36100',
  'terni': '05100',
  'bolzano': '39100',
  'novara': '28100',
  'piacenza': '29100',
  'ancona': '60100',
  'andria': '76123',
  'udine': '33100',
  'arezzo': '52100',
  'cesena': '47521',
  'lecce': '73100'
};

interface NewListingFormProps {
  onGenerate: (state: VestaInputState, photos: File[], plan: File | null) => Promise<void>;
  loading: boolean;
  statusLogs: string[];
}

export default function NewListingForm({ onGenerate, loading, statusLogs }: NewListingFormProps) {
  // Input basic form states
  const [formState, setFormState] = useState<VestaInputState>({
    address: '',
    comune: '',
    cap: '',
    coordinates: { lat: 41.9027835, lng: 12.4963655 }, // Default Roma center
    price: 250000,
    sqm: 85,
    rooms: 'Trilocale moderno',
    energyClass: 'B',
    quickNotes: '',
    hasFloorPlan: false,
    targets: ['Giovani Coppie', 'Investitori/Affitti Brevi'],
    clientName: 'Dott. Mario Rossi',
    agentName: 'Arch. Francesco Bianchi',
    visitDate: new Date().toISOString().substring(0, 10),
    renovationComplexity: 1,
    renovationWorkTypes: '',
    renovationDocsCount: 0,
  });

  // Active files state
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [floorPlanFile, setFloorPlanFile] = useState<File | null>(null);

  // File preview helper state
  const [photoPreviews, setPhotoPreviews] = useState<{ id: string; name: string; url: string }[]>([]);
  const [planPreview, setPlanPreview] = useState<{ name: string; size: string } | null>(null);

  // Active renovation files state
  const [renovationFiles, setRenovationFiles] = useState<File[]>([]);
  const [renovationPreviews, setRenovationPreviews] = useState<{ id: string; name: string; size: string }[]>([]);
  const fileInputRenovationRef = useRef<HTMLInputElement>(null);
  const [dragOverRenovation, setDragOverRenovation] = useState(false);

  // Targets state
  const [targetProfiles, setTargetProfiles] = useState<TargetProfile[]>([
    { id: '1', name: 'Giovani Coppie', isCustom: false },
    { id: '2', name: 'Investitori/Affitti Brevi', isCustom: false },
    { id: '3', name: 'Grandi Famiglie', isCustom: false },
    { id: '4', name: 'Luxury Buyers', isCustom: false },
  ]);

  const [newTargetText, setNewTargetText] = useState('');
  const [mapsKeyExists, setMapsKeyExists] = useState(false);

  // Dropzone drag highlight state
  const [dragOverPhotos, setDragOverPhotos] = useState(false);
  const [dragOverPlan, setDragOverPlan] = useState(false);

  const fileInputPhotosRef = useRef<HTMLInputElement>(null);
  const fileInputPlanRef = useRef<HTMLInputElement>(null);

  // Check if GMaps key exists in localStorage
  useEffect(() => {
    const key = localStorage.getItem('vesta_gmaps_key');
    setMapsKeyExists(!!key && key.length > 10);
  }, [loading]);

  // Handle files selection
  const handlePhotosChange = (filesList: FileList | null) => {
    if (!filesList) return;
    const files = Array.from(filesList);
    setPhotoFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const handlePlanChange = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const file = filesList[0];
    setFloorPlanFile(file);
    setPlanPreview({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    });
    setFormState(prev => ({ ...prev, hasFloorPlan: true }));
  };

  const deletePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index].url);
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deletePlan = () => {
    setFloorPlanFile(null);
    setPlanPreview(null);
    setFormState(prev => ({ ...prev, hasFloorPlan: false }));
  };

  const handleRenovationFilesChange = (filesList: FileList | null) => {
    if (!filesList) return;
    const files = Array.from(filesList);
    setRenovationFiles(prev => {
      const next = [...prev, ...files];
      setFormState(f => ({ ...f, renovationDocsCount: next.length }));
      return next;
    });

    const newPreviews = files.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    }));
    setRenovationPreviews(prev => [...prev, ...newPreviews]);
  };

  const deleteRenovationFile = (idx: number) => {
    setRenovationPreviews(prev => prev.filter((_, i) => i !== idx));
    setRenovationFiles(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setFormState(f => ({ ...f, renovationDocsCount: next.length }));
      return next;
    });
  };

  // Drag hooks
  const onDragOverP = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPhotos(true);
  };
  const onDragLeaveP = () => setDragOverPhotos(false);
  const onDropP = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPhotos(false);
    handlePhotosChange(e.dataTransfer.files);
  };

  const onDragOverF = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPlan(true);
  };
  const onDragLeaveF = () => setDragOverPlan(false);
  const onDropF = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPlan(false);
    handlePlanChange(e.dataTransfer.files);
  };

  // Autocomplete coordinates trigger on blur if comma is present
  const handleAddressBlur = () => {
    const text = formState.address;
    if (text.includes(',')) {
      const parts = text.split(',');
      const mainAdd = parts[0] ? parts[0].trim() : text;
      // Extract city (comune)
      const computedComune = parts[1] ? parts[1].trim() : formState.comune;
      // Extract CAP from third part if present, or look inside second part
      let computedCap = formState.cap;
      if (parts[2]) {
        computedCap = parts[2].trim().match(/\d{5}/)?.[0] || formState.cap;
      } else if (parts[1]) {
        const found = parts[1].match(/\d{5}/);
        if (found) {
          computedCap = found[0];
        }
      }
      
      setFormState(prev => ({
        ...prev,
        address: mainAdd,
        comune: computedComune || prev.comune,
        cap: computedCap || prev.cap
      }));
    }
  };

  // Target toggle list controller
  const toggleTarget = (name: string) => {
    const isSelected = formState.targets.includes(name);
    let newTargets = [];
    if (isSelected) {
      newTargets = formState.targets.filter(t => t !== name);
    } else {
      newTargets = [...formState.targets, name];
    }
    setFormState(prev => ({ ...prev, targets: newTargets }));
  };

  // Add custom tag target
  const handleAddCustomTarget = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    const trimmed = newTargetText.trim();
    if (!trimmed) return;
    
    // Check if target profile already exists
    const exists = targetProfiles.find(t => t.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const newTag: TargetProfile = {
        id: `custom-${Date.now()}`,
        name: trimmed,
        isCustom: true
      };
      setTargetProfiles(prev => [...prev, newTag]);
    }
    
    // Automatically select the added tag
    if (!formState.targets.includes(trimmed)) {
      setFormState(prev => ({ ...prev, targets: [...prev.targets, trimmed] }));
    }
    setNewTargetText('');
  };

  // Demoware injector trigger
  const injectDemoData = () => {
    const demoPhotos = [
      new File([""], "soggiorno_moderno.jpg", { type: "image/jpeg" }),
      new File([""], "camera_matrimoniale.jpg", { type: "image/jpeg" }),
      new File([""], "bagno_da_rifare.jpg", { type: "image/jpeg" })
    ];
    const demoPlan = new File([""], "planimetria_piano_terra.pdf", { type: "application/pdf" });

    // Previews updates
    setPhotoFiles(demoPhotos);
    setPhotoPreviews([
      { id: '1', name: 'soggiorno_moderno.jpg', url: 'placeholder-living' },
      { id: '2', name: 'camera_matrimoniale.jpg', url: 'placeholder-bed' },
      { id: '3', name: 'bagno_da_rifare.jpg', url: 'placeholder-bath' }
    ]);
    setFloorPlanFile(demoPlan);
    setPlanPreview({
      name: 'planimetria_piano_terra.pdf',
      size: '0.42 MB'
    });

    const demoRenovationDocs = [
      new File([""], "computo_metrico_ristrutturazione.pdf", { type: "application/pdf" })
    ];
    setRenovationFiles(demoRenovationDocs);
    setRenovationPreviews([
      { id: 'ren-1', name: 'computo_metrico_ristrutturazione.pdf', size: '1.24 MB' }
    ]);

    setFormState({
      address: 'Via Centrale 42',
      comune: 'Roma',
      cap: '00185',
      coordinates: { lat: 41.9012, lng: 12.5009 },
      price: 450000,
      sqm: 100,
      rooms: 'Quadrilocale strutturato',
      energyClass: 'A2',
      quickNotes: 'Luminoso, splendida esposizione a sud. Parquet in rovere autentico lucido in salone. Bagno da ristrutturare, infissi in pvc ottimali.',
      hasFloorPlan: true,
      targets: ['Giovani Coppie', 'Investitori/Affitti Brevi', 'Luxury Buyers'],
      clientName: 'Ing. Giovanni Neri',
      agentName: 'Arch. Francesco Bianchi',
      visitDate: new Date().toISOString().substring(0, 10),
      renovationComplexity: 3,
      renovationWorkTypes: 'Rifacimento completo del bagno principale con posa di nuovi sanitari, sostituzione delle tubature ammalorate, e rinfresco generale della tinteggiatura in soggiorno.',
      renovationDocsCount: 1,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formState, photoFiles, floorPlanFile);
  };

  return (
    <div id="new-listing-cockpit" className="max-w-4xl mx-auto py-8 px-6 antialiased font-sans">
      
      {/* Loading simulated backdrop overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-[#111827]/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
          <div className="relative mb-8 flex items-center justify-center">
            <svg className="animate-spin h-24 w-24 text-[#0F52BA]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="absolute font-mono text-[10px] text-[#0F52BA]">V5.0 ANALYZER</div>
          </div>
          
          <h3 className="text-xl font-semibold tracking-tight mb-2 text-[#FBFBFA]">
            Sintesi Cognitiva in Corso...
          </h3>
          <p className="text-sm text-[#6B7280] mb-6 max-w-sm text-center">
            Vesta AI sta mappando i vettori ambientali, materiali ed economici dell'asset.
          </p>

          {/* Sequential terminal log system */}
          <div id="v-status-terminal" className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-[#10B981] space-y-1 block max-h-48 overflow-y-auto shadow-2xl">
            {statusLogs.map((log, index) => (
              <div key={index} className="flex space-x-2">
                <span className="text-[#64748B] select-none">▶</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="flex space-x-2 items-center text-[#94A3B8] animate-pulse">
              <span className="text-[#64748B]">▶</span>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0C4A26]" />
              <span>Calibrazione matrici decisionali...</span>
            </div>
          </div>
        </div>
      )}

      {/* Hero section Header with dynamic demo action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-[#F5EFEB] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1B3B2B] font-mono font-bold">
            CENTRO DI INGESTIONE COGNITIVA
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#1B3B2B]" style={{ fontFamily: 'var(--font-display), serif' }}>
            Nuovo Report Immobiliare
          </h2>
          <p className="text-sm text-[#2C3E35]/80 mt-0.5">
            Vettorializza file, perizie locali e target per generare marketing, analisi d'immagine e finanza.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            type="button"
            onClick={injectDemoData}
            id="btn-load-demo"
            className="flex items-center space-x-2 px-4 py-2 bg-[#FAF6F0] border border-[#F5EFEB] text-[#072814] rounded-lg hover:bg-[#F5EFEB]/55 hover-lift transition-all text-xs font-mono font-medium shadow-sm active:scale-95"
          >
            <Zap className="w-4 h-4 text-[#0C4A26]" />
            <span>⚡ CARICA DATI DEMO</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Address and map */}
        <div className="bg-[#FAF6F0]/60 rounded-xl p-6 border border-[#F5EFEB] space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-[#F5EFEB]">
            <ClayIcon type="geolocation" size="sm" className="shrink-0" />
            <div>
              <span className="font-bold text-sm tracking-tight text-[#2C3E35] uppercase block">Localizzazione Immobile</span>
              <span className="text-[10px] text-[#1B3B2B]/70 font-medium block">Analisi macro-territoriale abilitata via Google Maps</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider mb-1">
                Via e Numero Civico
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#F5EFEB] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0C4A26] text-[#072814]"
                placeholder="Es. Via Centrale 42, Roma, 00185"
                value={formState.address}
                onChange={(e) => setFormState(prev => ({ ...prev, address: e.target.value }))}
                onBlur={handleAddressBlur}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1">
                Comune
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm focus:outline-none text-[#1E293B] font-medium"
                placeholder="Es. Roma"
                value={formState.comune}
                onChange={(e) => {
                  const val = e.target.value;
                  const normalized = val.trim().toLowerCase();
                  const foundCap = COMUNE_TO_CAP[normalized];
                  setFormState(prev => ({
                    ...prev,
                    comune: val,
                    cap: foundCap || prev.cap
                  }));
                }}
              />
            </div>
          </div>

          {/* Coordinate settings / cap rows */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1">
                Codice Postale (CAP)
              </label>
              <input
                type="text"
                required
                maxLength={5}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm tracking-wide text-[#1E293B] font-mono"
                placeholder="CAP"
                value={formState.cap}
                onChange={(e) => setFormState(prev => ({ ...prev, cap: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1">
                Classe Energetica
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#1E293B]"
                value={formState.energyClass}
                onChange={(e) => setFormState(prev => ({ ...prev, energyClass: e.target.value }))}
              >
                {['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G'].map(cl => (
                  <option key={cl} value={cl}>{cl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1">
                Latitudine
              </label>
              <input
                type="number"
                step="any"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#64748B] font-mono"
                value={formState.coordinates.lat}
                readOnly
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] uppercase tracking-wider mb-1">
                Longitudine
              </label>
              <input
                type="number"
                step="any"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#64748B] font-mono"
                value={formState.coordinates.lng}
                readOnly
              />
            </div>
          </div>

          {/* Embedded Map Indicator Placeholder */}
          <div id="embed-maps-container" className="w-full h-48 bg-[#0F172A] rounded-lg relative overflow-hidden flex flex-col justify-center items-center text-center p-4 border border-[#1E293B]">
            <iframe
              title="Vesta Positioning Vector Map"
              width="100%"
              height="100%"
              className="absolute inset-0 opacity-80 filter contrast-100"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${formState.address || ""} ${formState.comune || ""} ${formState.cap || ""}`.trim() || "Roma")}&t=m&z=15&output=embed&iwloc=near`}
            />
            <div className="absolute bottom-2 right-2 bg-[#0C4A26]/95 text-white font-mono text-[9px] px-2 py-0.5 rounded tracking-widest pointer-events-none shadow-md z-10">
              MAPPA ATTIVA
            </div>
          </div>
        </div>

        {/* Section 2: Financials & Size metric fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] rounded-xl p-5 shadow-sm">
            <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider mb-2">
              Prezzo Richiesto (€)
            </label>
            <input
              type="number"
              required
              min={1000}
              className="w-full text-lg font-bold font-mono tracking-tight px-3 py-2 rounded-lg border border-[#F5EFEB] bg-white text-[#072814] focus:ring-1 focus:ring-[#0C4A26]"
              value={formState.price}
              onChange={(e) => setFormState(prev => ({ ...prev, price: Number(e.target.value) }))}
            />
            <span className="text-[10px] text-[#0C4A26]/70 block mt-1">
              Prezzo al mq stimato: <strong>€{(formState.price / (formState.sqm || 1)).toFixed(0)}/mq</strong>
            </span>
          </div>

          <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] rounded-xl p-5 shadow-sm">
            <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider mb-2">
              Superficie Utile (mq)
            </label>
            <input
              type="number"
              required
              min={10}
              className="w-full text-lg font-bold font-mono tracking-tight px-3 py-2 rounded-lg border border-[#F5EFEB] bg-white text-[#072814] focus:ring-1 focus:ring-[#0C4A26]"
              value={formState.sqm}
              onChange={(e) => setFormState(prev => ({ ...prev, sqm: Number(e.target.value) }))}
            />
            <span className="text-[10px] text-[#0C4A26]/70 block mt-1">
              Superficie catastale netta calcolata.
            </span>
          </div>

          <div className="bg-[#FAF6F0]/40 border border-[#F5EFEB] rounded-xl p-5 shadow-sm">
            <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider mb-2">
              Locali / Consistenza
            </label>
            <input
              type="text"
              required
              className="w-full text-sm font-semibold px-3 py-2.5 rounded-lg border border-[#F5EFEB] bg-white text-[#072814] focus:ring-1 focus:ring-[#0C4A26]"
              placeholder="Es. Trilocale moderno"
              value={formState.rooms}
              onChange={(e) => setFormState(prev => ({ ...prev, rooms: e.target.value }))}
            />
            <span className="text-[10px] text-[#0C4A26]/70 block mt-1">
              Es: Monolocale, Trilocale, Loft attico.
            </span>
          </div>
        </div>

        {/* Section 3: Dual Isolated File Dropzones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Dropzone 1 - Room photos (Multiple) */}
          <div 
            className={`border-2 border-dashed rounded-xl p-5 transition-all flex flex-col justify-between ${
              dragOverPhotos ? 'border-[#1B3B2B] bg-[#E8F5E9]/30' : 'border-[#F5EFEB] bg-[#FAF6F0]/40'
            }`}
            onDragOver={onDragOverP}
            onDragLeave={onDragLeaveP}
            onDrop={onDropP}
          >
            <div>
              <div className="flex items-center space-x-3 mb-2.5">
                <ClayIcon type="media" size="sm" className="shrink-0" />
                <div>
                  <span className="font-bold text-xs tracking-wider uppercase text-[#2C3E35] block">📸 Scansione Camere & Interni</span>
                  <span className="text-[10px] text-[#1B3B2B]/60 font-mono">SUPPORTO MULTI-FILE JPG/PNG</span>
                </div>
              </div>
              <p className="text-[11px] text-[#2C3E35]/90 leading-relaxed mb-4">
                Trascina qui o seleziona più immagini d'interni contemporaneamente (Soggiorno, Camere, Bagno). Vesta AI analizzerà visivamente infissi, luce e finiture.
              </p>

              {/* Photos tiles previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {photoPreviews.map((p, idx) => (
                    <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[#F5EFEB] bg-[#072814]">
                      {!p.url.startsWith('placeholder') ? (
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center p-1 text-center bg-stone-800 text-stone-400">
                          <ImageIcon className="w-4 h-4 text-[#0C4A26] mb-1 animate-pulse" />
                          <span className="text-[7px] truncate w-full px-1">{p.name}</span>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => deletePhoto(idx)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-650 hover:bg-red-700 text-white rounded p-1 transition-opacity"
                        title="Rimuovi immagine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                multiple
                ref={fileInputPhotosRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handlePhotosChange(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputPhotosRef.current?.click()}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-white border border-[#F5EFEB] hover:bg-[#FAF6F0]/80 text-xs font-semibold rounded-lg text-[#072814]/80 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Carica Foto Locali</span>
              </button>
            </div>
          </div>

          {/* Dropzone 2 - Plannimetry (Single PDF/Image) */}
          <div 
            className={`border-2 border-dashed rounded-xl p-5 transition-all flex flex-col justify-between ${
              dragOverPlan ? 'border-[#1B3B2B] bg-[#E8F5E9]/30' : 'border-[#F5EFEB] bg-[#FAF6F0]/40'
            }`}
            onDragOver={onDragOverF}
            onDragLeave={onDragLeaveF}
            onDrop={onDropF}
          >
            <div>
              <div className="flex items-center space-x-3 mb-2.5">
                <ClayIcon type="media" size="sm" className="shrink-0" />
                <div>
                  <span className="font-bold text-xs tracking-wider uppercase text-[#2C3E35] block">📐 Architettura Planimetrica Catastale</span>
                  <span className="text-[10px] text-[#1B3B2B]/60 font-mono">PDF O GRIGLIE VETTORIALI (MAX 1)</span>
                </div>
              </div>
              <p className="text-[11px] text-[#2C3E35]/90 leading-relaxed mb-4">
                Rilascia qui la planimetria vettoriale o PDF/immagine catastale dell'asset (Max 1 file). Il Vision Core analizzerà il posizionamento spaziale dei vani forniti.
              </p>

              {/* Blueprint sheet representation if plan loaded */}
              {planPreview ? (
                <div className="p-3 bg-[#E8F5E9] border border-green-200 rounded-lg flex items-center justify-between mb-4 animate-fade-in group hover:bg-[#E8F5E9]/90 hover:border-[#0C4A26]">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-[#0C4A26] text-white rounded flex items-center justify-center font-mono font-bold text-xs shadow-md">
                      BP
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-[#072814] truncate max-w-[140px]" title={planPreview.name}>
                        {planPreview.name}
                      </span>
                      <span className="text-[10px] text-[#0C4A26]/80 font-mono leading-none">
                        {planPreview.size}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={deletePlan}
                    className="p-1 h-7 w-7 text-[#072814]/70 hover:text-red-700 rounded hover:bg-red-50 flex items-center justify-center transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border border-[#F5EFEB] h-16 rounded-lg flex justify-center items-center text-[#0C4A26]/80 text-[11px] bg-white border-dashed mb-4">
                  Nessun file catastale caricato.
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={fileInputPlanRef}
                className="hidden"
                accept=".pdf, image/*"
                onChange={(e) => handlePlanChange(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputPlanRef.current?.click()}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-white border border-[#F5EFEB] hover:bg-[#FAF6F0]/80 text-xs font-semibold rounded-lg text-[#072814]/80 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Carica Mappa Catastale</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nuovo Stato dell'immobile & Ristrutturazioni */}
        <div className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-[#F5EFEB] pb-3">
            <div className="bg-[#0C4A26] text-white p-2 rounded-lg font-bold">
              🛠️
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#072814] uppercase">Stato dell'Immobile & Ristrutturazioni</span>
              <p className="text-[10px] text-[#0C4A26]/80">
                Inserisci il livello di complessità degli interventi e descrivi le opere per calcolare i costi e il rendimento.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider mb-2">
                Complessità dei Lavori di Ristrutturazione (Scala 1 - 5)
              </label>
              
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  className="w-full h-2 bg-[#FAF6F0] rounded-lg appearance-none cursor-pointer accent-[#0C4A26] border border-[#F5EFEB]"
                  value={formState.renovationComplexity || 1}
                  onChange={(e) => setFormState(prev => ({ ...prev, renovationComplexity: Number(e.target.value) }))}
                />
                <span className="text-2xl font-bold text-[#0C4A26] bg-[#FAF6F0] px-3 py-1 rounded-lg border border-[#F5EFEB] font-mono min-w-[45px] text-center">
                  {formState.renovationComplexity || 1}
                </span>
              </div>

              {/* Slider description indicators */}
              <div className="grid grid-cols-5 text-center mt-3 text-[9px] text-[#072814]/60 gap-1 font-mono">
                <div className={formState.renovationComplexity === 1 ? "text-[#0C4A26] font-bold" : ""}>1 (Stato Ottimale)</div>
                <div className={formState.renovationComplexity === 2 ? "text-[#0C4A26] font-bold" : ""}>2 (Rinfresco Ordinario)</div>
                <div className={formState.renovationComplexity === 3 ? "text-[#0C4A26] font-bold" : ""}>3 (Manutenzione Parziale)</div>
                <div className={formState.renovationComplexity === 4 ? "text-[#0C4A26] font-bold" : ""}>4 (Ristrutturazione Consistente)</div>
                <div className={formState.renovationComplexity === 5 ? "text-[#0C4A26] font-bold" : ""}>5 (Ristrutturazione Integrale)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Opere di ristrutturazione scritte a mano */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider">
                  Tipi di Lavori e Specifiche (Campo libero)
                </label>
                <textarea
                  className="w-full h-36 px-3.5 py-3 rounded-lg border border-[#F5EFEB] bg-[#FAF6F0]/30 text-xs focus:outline-none focus:ring-1 focus:ring-[#0C4A26] text-[#072814] font-sans placeholder-slate-400 resize-none leading-relaxed"
                  placeholder="Es: Rifacimento bagno principale o pavimenti, impianto elettrico a norma, sostituzione dei corpi scaldanti, ecc."
                  value={formState.renovationWorkTypes || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, renovationWorkTypes: e.target.value }))}
                />
              </div>

              {/* Allegati per i lavori */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider">
                  Foto o Documenti Relativi ai Lavori
                </label>
                
                <div
                  className={`border border-dashed rounded-lg p-4 h-36 flex flex-col justify-between transition-colors ${
                    dragOverRenovation ? 'border-[#0C4A26] bg-[#E8F5E9]/30' : 'border-[#F5EFEB] bg-[#FAF6F0]/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverRenovation(true); }}
                  onDragLeave={() => setDragOverRenovation(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverRenovation(false);
                    handleRenovationFilesChange(e.dataTransfer.files);
                  }}
                >
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                    {renovationPreviews.length > 0 ? (
                      renovationPreviews.map((doc, index) => (
                        <div key={doc.id} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-[#F5EFEB] text-[10px] animate-fade-in text-[#072814]">
                          <span className="truncate max-w-[150px] font-medium" title={doc.name}>{doc.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[#64748B] font-mono text-[8px]">{doc.size}</span>
                            <button
                              type="button"
                              onClick={() => deleteRenovationFile(index)}
                              className="text-red-650 hover:text-red-750 hover:bg-red-50 p-0.5 rounded transition"
                              title="Elimina allegato"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center text-center py-4">
                        <ImageIcon className="w-6 h-6 text-[#0C4A26]/50 mb-1" />
                        <span className="text-[10px] text-[#072814]/65">
                          Rilascia qui o fai click sotto per caricare verbali, computi metrici o foto dei lavori.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <input
                      type="file"
                      multiple
                      ref={fileInputRenovationRef}
                      className="hidden"
                      onChange={(e) => handleRenovationFilesChange(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRenovationRef.current?.click()}
                      className="inline-flex items-center space-x-1 py-1 px-3 bg-white border border-[#F5EFEB] hover:bg-[#FAF6F0] text-[10px] font-semibold rounded text-[#072814] shadow-sm transition"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Sfoglia files</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Ulteriori Caratteristiche dell'Immobile scritte a mano */}
        <div className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#F5EFEB] pb-3">
            <Plus className="w-5 h-5 text-[#0C4A26]" />
            <div>
              <span className="font-bold text-sm tracking-tight text-[#072814] uppercase">Ulteriori Caratteristiche dell'Immobile (scritte a mano)</span>
              <p className="text-[10px] text-[#0C4A26]/80">
                Inserisci qui dettagli manuali (es. balconi, cantina, box, tipo di riscaldamento, esposizione, finiture speciali o note dell'agente) che si andranno ad aggiungere a tutte le altre informazioni fornite.
              </p>
            </div>
          </div>
          
          <div>
            <textarea
              id="input-quick-notes"
              className="w-full h-32 px-3.5 py-3 rounded-lg border border-[#F5EFEB] bg-[#FAF6F0]/30 text-sm focus:outline-none focus:ring-1 focus:ring-[#0C4A26] text-[#072814] font-sans placeholder-slate-400 resize-none leading-relaxed"
              placeholder="Es: Splendida esposizione a sud che garantisce luce naturale tutto il giorno. Presente grande balcone terrazzato di 15mq, cantina di pertinenza al piano interrato e box auto singolo. Riscaldamento autonomo con caldaia a condensazione appena sostituita..."
              value={formState.quickNotes}
              onChange={(e) => setFormState(prev => ({ ...prev, quickNotes: e.target.value }))}
            />
            <div className="flex justify-between items-center text-[10px] text-[#0C4A26]/70 mt-1">
              <span>Inserimento manuale libero</span>
              <span>{formState.quickNotes.length} caratteri</span>
            </div>
          </div>
        </div>

        {/* Section 4: Target Selection and Adder */}
        <div className="bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#F5EFEB] pb-3">
            <div>
              <span className="font-bold text-sm tracking-tight text-[#072814] uppercase">TARGET MARKETING MATRICES</span>
              <p className="text-[10px] text-[#0C4A26]/70">
                Attiva e configura i segmenti di clientela su cui l'IA indirizzerà la personalizzazione del copywriting.
              </p>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Aggiungi categoria personalizzata..."
                className="px-3 py-1.5 border border-[#F5EFEB] rounded-lg text-xs w-56 focus:outline-none focus:ring-1 focus:ring-[#0C4A26] text-[#072814]"
                value={newTargetText}
                onChange={(e) => setNewTargetText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTarget(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => handleAddCustomTarget(e)}
                className="px-2.5 py-1.5 bg-[#0C4A26] hover:bg-[#072814] text-white rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 shadow-sm shadow-[#0C4A26]/10"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {targetProfiles.map((tp) => {
              const selected = formState.targets.includes(tp.name);
              return (
                <button
                  type="button"
                  key={tp.id}
                  onClick={() => toggleTarget(tp.name)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-full transition-all duration-300 border ${
                    selected
                      ? 'bg-[#E8F5E9] border-[#0C4A26] text-[#0C4A26] font-semibold ring-1 ring-[#0C4A26]'
                      : 'bg-[#FAF6F0] border-[#F5EFEB] text-[#072814]/80 hover:bg-[#F5EFEB]'
                  }`}
                >
                  <span className="mr-1">{tp.name}</span>
                  {tp.isCustom && <span className="text-[9px] text-[#0C4A26]/50">x</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Agent signatures & dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAF6F0]/40 p-5 rounded-xl border border-[#F5EFEB]">
          <div>
            <label className="block text-xs font-semibold text-[#072814]/80 uppercase tracking-wider mb-1">
              Nome Cliente Associato
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-[#F5EFEB] bg-white rounded-lg text-xs text-[#072814]"
              value={formState.clientName}
              onChange={(e) => setFormState(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#072814]/85 uppercase tracking-wider mb-1">
              Consulente Immobiliare Responsabile
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-[#F5EFEB] bg-white rounded-lg text-xs text-[#072814]"
              value={formState.agentName}
              onChange={(e) => setFormState(prev => ({ ...prev, agentName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#072814]/85 uppercase tracking-wider mb-1">
              Data Sopralluogo Ufficiale
            </label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-[#F5EFEB] bg-white rounded-lg text-xs text-[#072814]"
              value={formState.visitDate}
              onChange={(e) => setFormState(prev => ({ ...prev, visitDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Generate triggers action */}
        <div className="pt-4 border-t border-[#F5EFEB] flex items-center justify-end space-x-4">
          <span className="text-xs text-[#0C4A26]/80 italic">
            * Cliccando, l'IA analizzerà la posizione ed i file d'interni inseriti.
          </span>
          <button
            type="submit"
            id="btn-generate-ai"
            disabled={loading}
            className="px-6 py-3 bg-[#0C4A26] hover:bg-[#072814] text-[#FBFBFA] font-bold text-sm rounded-lg hover-lift transition-all shadow-md active:scale-95 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analisi in corso...</span>
              </>
            ) : (
              <>
                <span>Genera con Vesta AI</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
