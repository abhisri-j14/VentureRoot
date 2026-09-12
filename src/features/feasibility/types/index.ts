export type EvidenceType = "FACT" | "ESTIMATE" | "PREDICTION" | "UNKNOWN";

export interface Evidence {
  type: EvidenceType;
  label: string;
  source: string;
  confidenceScore?: number;
}

export interface Confidence {
  score: number; // 0-100
  level: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
}

export interface WhyExplanation {
  summary: string;
  factors: string[];
}

export interface IntelligenceData {
  evidence: Evidence[];
  confidence?: Confidence;
  why?: WhyExplanation;
}

export interface MarketAnalysis extends IntelligenceData {
  reach: {
    radius5km: number;
    radius10km: number;
    radius20km?: number;
  };
  demandIndicators: string[];
  localObservations: string[];
  customerSegments: string[];
  marketSizeValue?: number;
  marketTrends: string[];
  evidenceSources: string[];
}

export interface OpportunityAnalysis extends IntelligenceData {
  summary: string;
  demandOpportunity: string;
  unmetNeed: string;
  localBusinessOpportunity: string;
  keyDrivers: string[];
  observations: string[];
}

export interface Competitor {
  id: string;
  name: string;
  type: "Direct" | "Indirect";
  location: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  positioning: string;
  distanceKm?: number;
  position?: [number, number];
  sectorType?: "Govt / Public Sector" | "Private Sector" | string;
  ownership?: "Government" | "Private" | "Co-operative" | string;
  facilityType?: string;
  source?: string;
  businessImpact?: string;
}

export interface CompetitionAnalysis extends IntelligenceData {
  overview: string;
  competitors: Competitor[];
  observations: string[];
}

export interface SWOTAnalysis extends IntelligenceData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RiskItem {
  id: string;
  title: string;
  category: "Market" | "Financial" | "Operational" | "Environmental" | "Competition";
  severity: "Low" | "Medium" | "High" | "Critical";
  explanation: string;
  potentialImpact: string;
  mitigationAdvisory?: string;
  evidence?: Evidence[];
}

export interface PricingAnalysis extends IntelligenceData {
  expectedLocalPrice: number;
  observedMarketPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketValue: string;
  observations: string[];
  pricingFactors: string[];
}

export interface FeasibilityData {
  status: "LOADING" | "SUCCESS" | "ERROR" | "EMPTY";
  market?: MarketAnalysis;
  opportunity?: OpportunityAnalysis;
  competition?: CompetitionAnalysis;
  swot?: SWOTAnalysis;
  risks?: RiskItem[];
  pricing?: PricingAnalysis;
}
