import { Report } from "../types";

export interface GenerationStage {
  id: string;
  label: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ERROR";
}

export const MOCK_GENERATION_STAGES: GenerationStage[] = [
  { id: "analyze", label: "reports.generate.analyzing" },
  { id: "market", label: "reports.generate.market" },
  { id: "finance", label: "reports.generate.finance" },
  { id: "compile", label: "reports.generate.compile" },
];
