import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NewListingForm from './components/NewListingForm';
import ResultsDashboard from './components/ResultsDashboard';
import CatalogTab from './components/CatalogTab';
import TemplatesTab from './components/TemplatesTab';
import SettingsTab from './components/SettingsTab';
import AuthScreen, { VestaUser } from './components/auth/AuthScreen';
import { VestaReport, VestaInputState } from './types';
import { runComprehensiveAIEngine, runRealAIEngine } from './utils/aiEngine';
import { compressImage } from './utils/imageCompressor';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { collection, query, where, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

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

export default function App() {
  const [user, setUser] = useState<VestaUser | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('new-listing');
  const [report, setReport] = useState<VestaReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  // Local state reference of active inputs (necessary for legal sheets sync)
  const [activeFormState, setActiveFormState] = useState<VestaInputState>({
    address: '',
    comune: '',
    cap: '',
    coordinates: { lat: 41.9027835, lng: 12.4963655 },
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
  });

  // Load initial session on startup
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('vesta_active_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load active auth session", e);
    }
  }, []);

  // Load user-bound listings from Firestore or localized cache fallback
  useEffect(() => {
    if (!user) {
      setCatalogItems([]);
      return;
    }

    if (user.isDemo || user.uid === 'vesta-demo-agency') {
      try {
        const userListingsKey = `vesta_listings_${user.uid}`;
        let stored = localStorage.getItem(userListingsKey);
        
        // Migration from legacy global list to the corresponding Demo Account if first login
        if (!stored) {
          const legacyGlobal = localStorage.getItem('vesta_synthesized_listings');
          if (legacyGlobal) {
            stored = legacyGlobal;
            localStorage.setItem(userListingsKey, legacyGlobal);
          }
        }
        
        if (stored) {
          setCatalogItems(JSON.parse(stored));
        } else {
          setCatalogItems([]);
        }
      } catch (e) {
        console.error("Failed loading account-bound listings from local storage", e);
      }
      return;
    }

    const loadCloudListings = async () => {
      try {
        const colRef = collection(db, 'listings');
        const q = query(colRef, where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const cloudItems: CatalogItem[] = [];
        
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          cloudItems.push({
            id: data.id || docSnap.id,
            address: data.address || '',
            comune: data.comune || '',
            cap: data.cap || '',
            price: Number(data.price) || 0,
            sqm: Number(data.sqm) || 0,
            rooms: data.rooms || '',
            report: data.report || null,
            timestamp: data.timestamp || new Date().toISOString()
          });
        });

        // Sort chronologically descending
        cloudItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setCatalogItems(cloudItems);

        // Update local cache
        try {
          const userListingsKey = `vesta_listings_${user.uid}`;
          localStorage.setItem(userListingsKey, JSON.stringify(cloudItems));
        } catch (localErr) {
          console.warn("Could not cache listing results locally.");
        }
      } catch (err) {
        console.warn("Could not fetch cloud listings from Firestore. Resorting to local cache...", err);
        try {
          const userListingsKey = `vesta_listings_${user.uid}`;
          const stored = localStorage.getItem(userListingsKey);
          if (stored) {
            setCatalogItems(JSON.parse(stored));
          }
        } catch (localErr) {
          console.error(localErr);
        }
      }
    };

    loadCloudListings();
  }, [user]);

  // Sync to account catalog helper (both local localCache and Firestore cloud)
  const saveToCatalog = async (item: CatalogItem) => {
    if (!user) return;
    const updated = [item, ...catalogItems];
    setCatalogItems(updated);
    try {
      const userListingsKey = `vesta_listings_${user.uid}`;
      localStorage.setItem(userListingsKey, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage quota limit exceeded. Saving state globally on cloud only.");
    }

    if (user.isDemo || user.uid === 'vesta-demo-agency') {
      return;
    }

    try {
      const listingDocRef = doc(db, 'listings', item.id);
      await setDoc(listingDocRef, {
        id: item.id,
        userId: user.uid,
        address: item.address,
        comune: item.comune,
        cap: item.cap,
        price: item.price,
        sqm: item.sqm,
        rooms: item.rooms,
        timestamp: item.timestamp,
        report: item.report,
      });
    } catch (err) {
      console.error("Cloud persistence error: ", err);
      handleFirestoreError(err, OperationType.WRITE, `listings/${item.id}`);
    }
  };

  // Delete matching listing from active account dataset (local cache + Firestore cloud)
  const handleDeleteItem = async (id: string) => {
    if (!user) return;
    const updated = catalogItems.filter(item => item.id !== id);
    setCatalogItems(updated);
    try {
      const userListingsKey = `vesta_listings_${user.uid}`;
      localStorage.setItem(userListingsKey, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (user.isDemo || user.uid === 'vesta-demo-agency') {
      return;
    }

    try {
      const listingDocRef = doc(db, 'listings', id);
      await deleteDoc(listingDocRef);
    } catch (err) {
      console.error("Cloud deletion error: ", err);
      handleFirestoreError(err, OperationType.DELETE, `listings/${id}`);
    }
  };

  // Auth helper methods
  const handleLoginSuccess = (authenticatedUser: VestaUser) => {
    setUser(authenticatedUser);
    try {
      localStorage.setItem('vesta_active_user', JSON.stringify(authenticatedUser));
    } catch (e) {
      console.error("Failed to persist auth session", e);
    }
  };

  const handleLogOut = async () => {
    setUser(null);
    try {
      localStorage.removeItem('vesta_active_user');
      await auth.signOut();
    } catch (e) {
      console.error("Auth signOut error: ", e);
    }
  };

  // Re-load generated report from archive list item
  const handleSelectReport = (
    selectedReport: VestaReport,
    address: string,
    comune: string,
    cap: string,
    price: number,
    sqm: number,
    rooms: string
  ) => {
    setReport(selectedReport);
    setActiveFormState(prev => ({
      ...prev,
      address,
      comune,
      cap,
      price,
      sqm,
      rooms
    }));
    setCurrentTab('results');
  };

  // Orchestrate the 3-second simulation, image compression pipeline and invoke GenAI endpoints
  const handleGenerateReport = async (
    state: VestaInputState,
    photoFiles: File[],
    floorPlanFile: File | null
  ) => {
    setLoading(true);
    setStatusLogs([]);
    setActiveFormState(state);

    const logSteps = [
      { t: 0, msg: "[VISION MODULE] Ingestione file multimediali e scansione della planimetria volumetrica..." },
      { t: 600, msg: "[VISION MODULE] Rilevamento finiture materiali, tracciamento infissi e vettorializzazione punti luce..." },
      { t: 1200, msg: "[VISION MODULE] Ottimizzazione d'immagine e compressione ad alta densità per archiviazione permanente..." },
      { t: 1800, msg: "[GEOPOLITICAL CORE] Analisi economica macro-territoriale tramite Google Maps API sulla posizione..." },
      { t: 2500, msg: "[SATELLITE FUSION] Sintesi dei dati, calcolo ROI finanziario ed elaborazione documentazione Vesta..." }
    ];

    // Trigger timer steps loggers
    logSteps.forEach(step => {
      setTimeout(() => {
        setStatusLogs(prev => [...prev, step.msg]);
      }, step.t);
    });

    const minimumDelay = new Promise(resolve => setTimeout(resolve, 3100));

    try {
      // 1. Perform client-side compression on the uploaded media files so they can be securely saved in localStorage/Firestore without exceeding boundaries.
      const compressedPhotosPromises = photoFiles.map(file => {
        // Suppress placeholder error on mock files
        if (file.size === 0) return Promise.resolve('');
        return compressImage(file);
      });
      
      let compressedPlan: string | null = null;
      if (floorPlanFile && floorPlanFile.size > 0) {
        compressedPlan = await compressImage(floorPlanFile);
      }
      
      const compressedPhotos = await Promise.all(compressedPhotosPromises);

      // 2. Query Gemini vision model pipeline
      const apiCallPromise = runRealAIEngine(state, photoFiles, floorPlanFile);

      // Await both the minimum high aesthetic delay overlay and real API responses
      const [generatedReport] = await Promise.all([apiCallPromise, minimumDelay]);

      // 3. Intercept the short-term blob URLs and replace them with our durable compressed JPEG base64 strings
      const persistentVisualItems = generatedReport.visualAnalysisItems.map(item => {
        if (item.id.startsWith("photo-")) {
          const matchIndex = parseInt(item.id.split("-")[1]);
          if (compressedPhotos[matchIndex]) {
            return { ...item, url: compressedPhotos[matchIndex] };
          }
        } else if (item.id.startsWith("floorplan-") && compressedPlan) {
          return { ...item, url: compressedPlan };
        }
        return item;
      });

      const finalReport: VestaReport = {
        ...generatedReport,
        visualAnalysisItems: persistentVisualItems
      };

      // Set state and save to user's localized catalog
      setReport(finalReport);
      
      const newCatalogItem: CatalogItem = {
        id: finalReport.id,
        address: state.address || "Via Centrale",
        comune: state.comune || "Roma",
        cap: state.cap || "00100",
        price: state.price,
        sqm: state.sqm,
        rooms: state.rooms,
        report: finalReport,
        timestamp: new Date().toISOString()
      };
      saveToCatalog(newCatalogItem);

      // Transition to results cockpit
      setCurrentTab('results');

    } catch (err: any) {
      console.warn("⚠️ True Gemini pipeline crashed or key missing. Falling back gracefully to Rules Synthesis engine...", err);
      
      // Print error diagnostics to terminal before fallback
      setStatusLogs(prev => [
        ...prev,
        `[⚠️ WARNING] Connessione al Cognitive Core interrotta o API Key mancante nei segreti.`,
        `[⚠️ WARNING] Attivazione motore deterministico di sintesi Vesta AI Core fallback...`
      ]);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const fallbackReport = runComprehensiveAIEngine(state, photoFiles, floorPlanFile);
      
      // Perform fallback-bound image compression attachment
      const compressedPhotosFallback = await Promise.all(
        photoFiles.map(file => (file.size > 0 ? compressImage(file) : Promise.resolve('')))
      );
      let compressedPlanFallback: string | null = null;
      if (floorPlanFile && floorPlanFile.size > 0) {
        compressedPlanFallback = await compressImage(floorPlanFile);
      }

      const fallbackPersistentItems = fallbackReport.visualAnalysisItems.map(item => {
        if (item.id.startsWith("photo-")) {
          const matchIndex = parseInt(item.id.split("-")[1]);
          if (compressedPhotosFallback[matchIndex]) {
            return { ...item, url: compressedPhotosFallback[matchIndex] };
          }
        } else if (item.id.startsWith("floorplan-") && compressedPlanFallback) {
          return { ...item, url: compressedPlanFallback };
        }
        return item;
      });

      const finalFallbackReport: VestaReport = {
        ...fallbackReport,
        visualAnalysisItems: fallbackPersistentItems
      };

      setReport(finalFallbackReport);

      const newCatalogItem: CatalogItem = {
        id: finalFallbackReport.id,
        address: state.address || "Via Centrale",
        comune: state.comune || "Roma",
        cap: state.cap || "00100",
        price: state.price,
        sqm: state.sqm,
        rooms: state.rooms,
        report: finalFallbackReport,
        timestamp: new Date().toISOString()
      };
      saveToCatalog(newCatalogItem);

      setCurrentTab('results');
    } finally {
      setLoading(false);
    }
  };

  // Guard routing display for unauthenticated users
  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="w-full h-screen bg-[#FDFBF7] flex overflow-hidden font-sans text-[#072814]">
      
      {/* Sidebar navigation commander - Hidden on print layout stream */}
      <div className="no-print shrink-0">
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          user={user}
          onLogOut={handleLogOut}
        />
      </div>

      {/* Main Viewport Content Panel */}
      <main className="flex-1 overflow-y-auto relative print:overflow-visible bg-[#FDFBF7] pb-24 md:pb-6">
        
        {/* Floating results quick navigation helper (shown on results tab) (no-print) */}
        {currentTab === 'results' && (
          <div className="sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#F5EFEB] z-30 py-3 px-6 flex items-center justify-between no-print shadow-sm">
            <button
              onClick={() => setCurrentTab('new-listing')}
              className="px-3 py-1.5 bg-[#FAF6F0] border border-[#F5EFEB] hover:bg-[#F5EFEB]/50 text-xs font-semibold rounded-lg flex items-center space-x-1 transition text-[#072814]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Torna al Cockpit Input</span>
            </button>

            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0C4A26]" />
              <span className="text-xs font-mono font-bold text-[#0C4A26] tracking-wider uppercase">Vesta AI Cognitive Outputs</span>
            </div>
          </div>
        )}

        {/* View Switch routing */}
        <div className="w-full">
          {currentTab === 'catalog' && (
            <CatalogTab 
              catalogItems={catalogItems}
              onSelectReport={handleSelectReport}
              onDeleteItem={handleDeleteItem}
              onNavigateToCreate={() => setCurrentTab('new-listing')}
            />
          )}

          {currentTab === 'new-listing' && (
            <NewListingForm 
              onGenerate={handleGenerateReport}
              loading={loading}
              statusLogs={statusLogs}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesTab />
          )}

          {currentTab === 'settings' && (
            <SettingsTab />
          )}

          {currentTab === 'results' && report && (
            <ResultsDashboard 
              report={report}
              formState={activeFormState}
              setFormState={setActiveFormState}
            />
          )}
        </div>
      </main>
    </div>
  );
}
