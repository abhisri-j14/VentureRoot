import apiClient from "@/lib/api/client";

// TODO: BACKEND CONFIRMATION REQUIRED
// Replace `unknown` with exact backend schemas
export type SimulateResponse = unknown;
export type FinancialPlanResponse = unknown;
export type SchemeMatchResponse = unknown;
export type RepaymentResponse = unknown;

export interface SimulationInput {
  loanAmount: number;
  interestRate: number;
  tenure: number;
  moratorium: number;
  revenue: number;
  expenses: number;
}

export interface SchemeMatchInput {
  availableMargin: number;
  businessCategory: string;
  locationId: string;
}

export const financeApi = {
  simulate: async (data: SimulationInput): Promise<SimulateResponse> => {
    const response = await apiClient.post("/finance/simulate", data);
    return response.data;
  },

  getPlan: async (businessId: string): Promise<FinancialPlanResponse> => {
    const response = await apiClient.get(`/finance/${businessId}`);
    return response.data;
  },

  getSchemeOptions: async (data: SchemeMatchInput): Promise<SchemeMatchResponse> => {
    const response = await apiClient.post("/finance/structure", data);
    return response.data;
  },

  getRepaymentSchedule: async (businessId: string): Promise<RepaymentResponse> => {
    const response = await apiClient.post("/finance/repayment", { businessId });
    return response.data;
  },
};
