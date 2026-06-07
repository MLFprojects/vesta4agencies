export interface TargetProfile {
  id: string;
  name: string;
  isCustom: boolean;
}

export interface GoogleMapsSettings {
  apiKey: string;
  isLoaded: boolean;
}

export interface VestaInputState {
  address: string;
  comune: string;
  cap: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  price: number;
  sqm: number;
  rooms: string;
  energyClass: string;
  quickNotes: string;
  hasFloorPlan: boolean;
  targets: string[];
  clientName: string;
  agentName: string;
  visitDate: string;
  renovationComplexity?: number;
  renovationWorkTypes?: string;
  renovationDocsCount?: number;
}

export interface VisualAnalysisItem {
  id: string;
  name: string;
  url: string; // will store an objectURL or dataURI of the image
  description: string;
}

export interface ObjectionItem {
  text: string;
  answer: string;
}

export interface GeoAnalysisDetails {
  connections: string;
  services: string;
  marketTrend: string;
}

export interface PortalTexts {
  immobiliareIt: string;
  idealista: string;
  facebook: string;
  instagram: string;
}

export interface VestaReport {
  id: string;
  geoAnalysis: string;
  geoAnalysisDetails: GeoAnalysisDetails;
  portalTexts: PortalTexts;
  marketingTexts: Record<string, string>; // Maps target profile name to customized copy
  visualAnalysisItems: VisualAnalysisItem[];
  seoPortals: {
    title: string;
    bullets: string[];
    hashtags: string;
  };
  visitGuide: {
    strengths: string[];
    objections: ObjectionItem[];
  };
  analysis?: PropertyAnalysis;
}

export interface PropertyAnalysis {
  conditionRating: number;         // 1 to 10
  renovationCostEstimate: number;   // Estimato in EUR
  rentalYieldAnalysis: string;     // Analisi del rendimento basato su locazione...
  estimatedMonthlyRentMin: number;
  estimatedMonthlyRentMax: number;
  shortTermRateMin: number;
  shortTermRateMax: number;
  maintenanceCosts: {
    condoFees: number;
    taxes: number;
    insurance: number;
    ordinaryMaintenance: number;
  };
  roiPercentage: number;           // ROI % e.g. 7.5
}
