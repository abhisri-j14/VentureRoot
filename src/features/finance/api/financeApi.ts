import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export type SimulateResponse = ApiResponse<any>;
export type RepaymentResponse = ApiResponse<any>;
export type FinanceStructureResponse = ApiResponse<any>;

export interface SimulationInput {
  loanAmount: number;
  interestRate: number;
  tenure: number;
  moratorium: number;
  revenue: number;
  expenses: number;
}

export interface RepaymentInput {
  businessId: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  moratorium: number;
}

export interface FinanceStructureInput {
  businessId: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  moratorium: number;
  revenue: number;
  expenses: number;
}

export const financeApi = {
  simulate: async (data: SimulationInput): Promise<SimulateResponse> => {
    const response = await apiClient.post("/finance/simulate", data);
    return response.data;
  },

  getRepayment: async (data: RepaymentInput): Promise<RepaymentResponse> => {
    const response = await apiClient.post("/finance/repayment", data);
    return response.data;
  },

  getStructure: async (data: FinanceStructureInput): Promise<FinanceStructureResponse> => {
    const response = await apiClient.post("/finance/structure", data);
    return response.data;
  },
};

