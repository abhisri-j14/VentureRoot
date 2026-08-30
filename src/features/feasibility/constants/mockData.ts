import { 
  MarketAnalysis, 
  OpportunityAnalysis, 
  CompetitionAnalysis, 
  SWOTAnalysis, 
  RiskItem, 
  PricingAnalysis 
} from "../types";

export const MOCK_MARKET_DATA: MarketAnalysis = {
  evidence: [
    { type: "FACT", label: "District Population Data", source: "Census 2021", confidenceScore: 98 },
    { type: "ESTIMATE", label: "Local Consumption Rate", source: "FMCG Sales Proxy", confidenceScore: 85 }
  ],
  confidence: {
    score: 88,
    level: "HIGH",
    reasons: ["Data corroborated across 3 local government records", "Clear demographic trends"]
  },
  why: {
    summary: "High population density in this specific radius creates a strong base market.",
    factors: ["Urban migration", "High concentration of retail points"]
  },
  reach: {
    radius5km: 12450,
    radius10km: 48200,
  },
  demandIndicators: [
    "High local consumption of dairy products",
    "Absence of large-scale cooperative collection centers nearby",
  ],
  localObservations: [
    "Most households purchase unbranded local milk",
    "Increased awareness of quality and hygiene",
  ],
  customerSegments: ["Local households", "Tea stalls", "Sweet shops"],
  marketSizeValue: 2500000,
  marketTrends: ["Shift towards branded/quality-assured milk", "Rising daily consumption per capita"],
  evidenceSources: ["Block Panchayat Records", "Local Market Survey 2025"],
};

export const MOCK_OPPORTUNITY_DATA: OpportunityAnalysis = {
  evidence: [
    { type: "PREDICTION", label: "Demand Growth", source: "AI Trend Analysis", confidenceScore: 75 }
  ],
  confidence: {
    score: 75,
    level: "MEDIUM",
    reasons: ["Emerging middle class in the locality", "Limited historical data on premium segment"]
  },
  why: {
    summary: "The gap between raw milk supply and premium demand is widening.",
    factors: ["Changing consumer preferences", "Increased disposable income"]
  },
  summary: "Strong potential to capture the local premium milk segment by ensuring consistent supply and hygiene.",
  demandOpportunity: "Unmet demand for unadulterated, farm-fresh milk in the 5km radius.",
  unmetNeed: "Lack of reliable daily delivery for premium households.",
  localBusinessOpportunity: "Establishing a direct-to-consumer delivery model can bypass middlemen and increase margins.",
  keyDrivers: ["High trust in local farms", "Willingness to pay a 10% premium for quality"],
  observations: ["Local sweet shops face shortages during festival seasons.", "Families prefer A2/buffalo milk over packet milk."],
};

export const MOCK_COMPETITION_DATA: CompetitionAnalysis = {
  evidence: [
    { type: "FACT", label: "Competitor Presence", source: "Google Maps Data", confidenceScore: 95 },
    { type: "ESTIMATE", label: "Competitor Pricing", source: "Local Survey", confidenceScore: 80 }
  ],
  confidence: {
    score: 90,
    level: "HIGH",
    reasons: ["Direct observation of local shops", "Confirmed by multiple residents"]
  },
  why: {
    summary: "Incumbent players are unorganized and lack modern delivery infrastructure.",
    factors: ["No digital presence", "Inconsistent quality control"]
  },
  overview: "Market is fragmented with several small unorganized players and two mid-sized regional brands.",
  competitors: [
    {
      id: "comp-1",
      name: "Raju Dairy Farms",
      type: "Direct",
      location: "2km North",
      pricing: "₹50/liter",
      strengths: ["Established customer base", "Low overhead"],
      weaknesses: ["Inconsistent quality", "No delivery network"],
      positioning: "Budget local supplier",
    },
    {
      id: "comp-2",
      name: "Gokul Packaged Milk",
      type: "Indirect",
      location: "Available in all grocery stores",
      pricing: "₹54/liter",
      strengths: ["Standardized quality", "High availability"],
      weaknesses: ["Lacks farm-fresh appeal", "Packaged taste"],
      positioning: "Mass-market convenience",
    }
  ],
  observations: ["No competitor currently offers a subscription-based home delivery in this block."],
};

export const MOCK_SWOT_DATA: SWOTAnalysis = {
  evidence: [],
  confidence: {
    score: 82,
    level: "HIGH",
    reasons: ["Based on verified user profile inputs", "Standard industry risk models"]
  },
  why: {
    summary: "Internal strengths align well with the external market gap.",
    factors: ["Pre-existing resources", "Favorable market timing"]
  },
  strengths: [
    "Proximity to target market (within 5km)",
    "Existing land ownership reduces capital expenditure",
    "Family experience in basic livestock management"
  ],
  weaknesses: [
    "Limited initial working capital for marketing",
    "Lack of commercial cold-storage infrastructure",
  ],
  opportunities: [
    "Direct-to-home subscription model",
    "Expansion into value-added products (Paneer, Ghee)",
  ],
  threats: [
    "Fluctuating cattle feed prices",
    "Aggressive pricing from regional cooperatives",
  ],
};

export const MOCK_RISK_DATA: RiskItem[] = [
  {
    id: "risk-1",
    title: "Feed Cost Volatility",
    category: "Financial",
    severity: "High",
    explanation: "Fodder prices fluctuate heavily during dry seasons, impacting monthly margins.",
    potentialImpact: "Margin reduction of up to 15% during summer.",
    mitigationAdvisory: "Enter into forward contracts with local farmers for dry fodder.",
    evidence: [{ type: "FACT", label: "Historical Price Data", source: "Mandi Prices 2023-2024", confidenceScore: 99 }]
  },
  {
    id: "risk-2",
    title: "Disease Outbreak (Cattle)",
    category: "Operational",
    severity: "Critical",
    explanation: "Foot and mouth disease or mastitis can halt production entirely.",
    potentialImpact: "Total loss of production for 2-4 weeks; potential loss of livestock.",
    mitigationAdvisory: "Ensure strict vaccination schedules and veterinary insurance.",
    evidence: [{ type: "ESTIMATE", label: "Regional Disease Incidence", source: "Veterinary Dept Report", confidenceScore: 70 }]
  },
  {
    id: "risk-3",
    title: "Competition from Cooperatives",
    category: "Competition",
    severity: "Medium",
    explanation: "Large cooperatives might launch aggressive price-cut campaigns in the village.",
    potentialImpact: "Loss of price-sensitive customers.",
    mitigationAdvisory: "Focus on the premium 'farm-fresh' USP rather than competing on price.",
  }
];

export const MOCK_PRICING_DATA: PricingAnalysis = {
  evidence: [
    { type: "ESTIMATE", label: "Willingness to Pay", source: "Comparable Markets Analysis", confidenceScore: 82 }
  ],
  confidence: {
    score: 85,
    level: "HIGH",
    reasons: ["Consistent pricing across 5 local vendors", "Clear premium bracket definition"]
  },
  why: {
    summary: "Premium pricing is justified by direct delivery and unadulterated quality guarantees.",
    factors: ["Convenience premium", "Health consciousness"]
  },
  expectedLocalPrice: 55,
  observedMarketPrice: 52,
  priceRange: {
    min: 48,
    max: 60,
  },
  marketValue: "Premium",
  observations: [
    "Customers are willing to pay ₹55-60 for guaranteed unadulterated milk.",
    "Bulk buyers (sweet shops) expect prices around ₹48-50.",
  ],
  pricingFactors: [
    "Delivery convenience",
    "Fat content / purity guarantee",
    "Packaging (glass bottles vs plastic)",
  ],
};
