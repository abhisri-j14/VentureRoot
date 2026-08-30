import { Report } from "../types";
import { 
  MOCK_MARKET_DATA, 
  MOCK_OPPORTUNITY_DATA, 
  MOCK_COMPETITION_DATA, 
  MOCK_SWOT_DATA, 
  MOCK_RISK_DATA, 
  MOCK_PRICING_DATA 
} from "@/features/feasibility/constants/mockData";

export const MOCK_REPORTS: Report[] = [
  {
    id: "rep-101",
    title: "Dairy Farming Comprehensive Analysis",
    businessId: "biz-01",
    businessName: "Sanjay Dairy & Co",
    location: "Kolhapur District, Maharashtra",
    status: "READY",
    createdAt: "2026-08-28T10:00:00Z",
    type: "Business Advisory",
    feasibilityData: {
      status: "SUCCESS",
      market: MOCK_MARKET_DATA,
      opportunity: MOCK_OPPORTUNITY_DATA,
      competition: MOCK_COMPETITION_DATA,
      swot: MOCK_SWOT_DATA,
      risks: MOCK_RISK_DATA,
      pricing: MOCK_PRICING_DATA
    }
  },
  {
    id: "rep-102",
    title: "Retail Store Feasibility Check",
    businessId: "biz-02",
    businessName: "Entrepreneur Mart",
    location: "Rural Hub, Block A",
    status: "DRAFT",
    createdAt: "2026-08-25T14:30:00Z",
    type: "Initial Feasibility"
  },
  {
    id: "rep-103",
    title: "Poultry Farm Setup Risk Assessment",
    businessId: "biz-03",
    businessName: "Fresh Eggs Farm",
    location: "Sector 4, Outskirts",
    status: "FAILED",
    createdAt: "2026-08-20T09:15:00Z",
    type: "Risk Assessment"
  }
];

export const MOCK_GENERATION_STAGES = [
  { id: "stage-1", label: "reports.stage.preparing", status: "PENDING" },
  { id: "stage-2", label: "reports.stage.analyzing", status: "PENDING" },
  { id: "stage-3", label: "reports.stage.compiling", status: "PENDING" },
  { id: "stage-4", label: "reports.stage.building", status: "PENDING" }
];
