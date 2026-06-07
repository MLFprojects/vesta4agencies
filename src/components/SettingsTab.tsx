import React, { useState, useEffect } from 'react';
import { Sliders, Key, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function SettingsTab() {
  const [mapsKey, setMapsKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load GMaps Key from localStorage
  useEffect(() => {
    const val = localStorage.getItem('vesta_gmaps_key') || '';
    setMapsKey(val);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vesta_gmaps_key', mapsKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isKeyActive = mapsKey.trim().length > 10;

  return (
    <div id="settings-tab-view" className="max-w-xl mx-auto py-8 px-6 antialiased font-sans space-y-6">
      
      {/* Settings Header */}
      <div className="border-b border-[#F5EFEB] pb-4">
        <div className="flex items-center space-x-2 text-[#1B3B2B]">
          <Sliders className="w-5 h-5 text-[#1B3B2B]" />
          <span className="font-bold text-xs tracking-wider uppercase text-[#2C3E35]">Vesta Console Amministrazione</span>
        </div>
        <h3 className="text-xl font-bold text-[#1B3B2B] mt-1" style={{ fontFamily: 'var(--font-display), serif' }}>Configurazione Moduli</h3>
        <p className="text-xs text-[#1B3B2B]/80">
          Configura gli accessi sicuri alle componenti esterne del core di posizionamento.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white border border-[#F5EFEB] rounded-xl p-6 shadow-sm">
        
        {/* API Key Form Header details */}
        <div>
          <label className="flex items-center space-x-2 text-xs font-bold text-[#072814] uppercase tracking-wider mb-2">
            <Key className="w-4 h-4 text-[#0C4A26]" />
            <span>Google Maps Platform API Key</span>
          </label>
          <p className="text-[11px] text-[#0C4A26]/70 leading-normal mb-4">
            Inserisci il codice API di Google Maps per caricare la mappa interattiva stradale e abilitare caroselli geo-localizzati. La chiave rimarrà salvata in locale (localStorage) nel tuo browser.
          </p>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              id="gmaps-api-key-input"
              className="w-full px-4 py-2.5 pr-10 border border-[#F5EFEB] rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#0C4A26] text-[#072814] bg-[#FAF6F0]/40"
              placeholder="AIzaSy..."
              value={mapsKey}
              onChange={(e) => setMapsKey(e.target.value)}
            />
            
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0C4A26]/80 hover:text-[#072814] transition"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Key Status Badges Section as requested in specifications */}
        <div className="flex items-center space-x-2 py-2 border-t border-b border-[#F5EFEB]">
          <span className="text-[10px] font-mono text-[#0C4A26]/70 uppercase tracking-wider mr-2">Valutazione Chiave:</span>
          {isKeyActive ? (
            <span id="badge-key-active" className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold rounded-full tracking-wider">
              🟢 COORDINATE GOOGLE MAPS ACTIVE
            </span>
          ) : (
            <span id="badge-key-inactive" className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-mono font-bold rounded-full tracking-wider">
              🔴 API KEY ASSENTE / CODICE INVALIDO
            </span>
          )}
        </div>

        {/* Save controls */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-[#0C4A26]/70 max-w-xs leading-normal">
            * Nessuno dei tuoi token di chiave viene trasmesso o registrato su server di terze parti.
          </span>
          
          <button
            type="submit"
            id="btn-save-settings"
            className="px-4 py-2 bg-[#0C4A26] hover:bg-[#072814] text-white text-xs font-bold rounded-lg hover-lift transition font-mono whitespace-nowrap active:scale-95 flex items-center space-x-1.5 shadow-sm shadow-[#0C4A26]/10"
          >
            {saved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Modifiche Salvate!</span>
              </>
            ) : (
              <span>Ricarica Collegamenti</span>
            )}
          </button>
        </div>
      </form>

      {/* Static Info Block regarding Gemini key */}
      <div className="bg-[#072814] border border-[#0C4A26] rounded-xl p-5 text-white space-y-3 shadow-md">
        <div className="flex items-center space-x-2 text-[#FAF6F0]">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span className="text-[10px] font-mono tracking-widest uppercase">COGNITIVE SERVICE: GEMINI AI</span>
        </div>
        <p className="text-xs text-[#FAF6F0]/80 leading-relaxed">
          Il modulo cognitivo server-side di <strong>Gemini AI</strong> è già integrato e configurato in modo predefinito sul container di esecuzione tramite le variabili d'ambiente protette del pannello <strong>Settings &gt; Secrets</strong> del tuo workspace. Non è richiesta alcuna chiave manuale cliente.
        </p>
      </div>

    </div>
  );
}
