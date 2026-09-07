import apiClient from "@/lib/api/client";

import { ApiResponse, PaginatedData, PaginationParams } from "@/types/api";

export interface ReportListParams extends PaginationParams {
  status?: "GENERATING" | "READY" | "FAILED";
  type?: "FEASIBILITY" | "FINANCIAL" | "BUSINESS_PLAN" | "COMPREHENSIVE";
  businessId?: string;
}

export type ReportListResponse = ApiResponse<PaginatedData<any>>;
export type ReportDetailResponse = ApiResponse<any>;
export type ReportGenerateResponse = ApiResponse<any>;

export const reportApi = {
  list: async (params?: ReportListParams): Promise<ReportListResponse> => {
    const response = await apiClient.get("/reports", { params });
    return response.data;
  },

  get: async (id: string): Promise<ReportDetailResponse> => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },

  generate: async (payload: { businessId: string; type: "FEASIBILITY" | "FINANCIAL" | "BUSINESS_PLAN" | "COMPREHENSIVE" }): Promise<ReportGenerateResponse> => {
    const response = await apiClient.post("/reports/generate", payload);
    return response.data;
  },

  getStatus: async (id: string): Promise<unknown> => {
    // TODO: BACKEND CONFIRMATION REQUIRED (Exact schema for async generation status)
    const response = await apiClient.get(`/reports/${id}/status`);
    return response.data;
  },

  download: async (id: string): Promise<Blob> => {
    // TODO: BACKEND CONFIRMATION REQUIRED (Download content type, e.g., PDF)
    const response = await apiClient.get(`/reports/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },
};
