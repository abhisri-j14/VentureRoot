import { Confidence, Evidence, WhyExplanation } from "@/features/feasibility/types";

export type ActionStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ActionPriority = "HIGH" | "MEDIUM" | "LOW";
export type ActionCategory = "MARKET" | "FINANCE" | "OPERATIONS" | "COMPLIANCE" | "MARKETING" | "SUPPLY" | "OTHER";

export interface ActionItem {
  id: string;
  order: number;
  title: string;
  description: string;
  whatToDo: string;
  expectedOutcome: string;
  timeframe: string;
  priority: ActionPriority;
  category: ActionCategory;
  status: ActionStatus;
  
  // Optional intelligence integrations
  why?: WhyExplanation;
  confidence?: Confidence;
  evidence?: Evidence[];
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  badge: string;
  summary: string;
  actions: string[];
  financialTarget: string;
  riskMitigation: string;
  milestoneKpi: string;
}

export interface Roadmap {
  id: string;
  businessId: string;
  businessName: string;
  location?: string;
  actions: ActionItem[];
  phases?: RoadmapPhase[];
}
