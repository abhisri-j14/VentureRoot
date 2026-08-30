import apiClient from "@/lib/api/client";

// TODO: BACKEND CONFIRMATION REQUIRED
export type ReportListResponse = unknown;
export type ReportDetailResponse = unknown;
export type ReportGenerateResponse = unknown;

export const reportApi = {
  list: async (): Promise<ReportListResponse> => {
    const response = await apiClient.get("/reports");
    return response.data;
  },

  get: async (id: string): Promise<ReportDetailResponse> => {
    const response = await apiClient.get(`/reports/${id}`);
    return response.data;
  },

  generate: async (businessId: string): Promise<ReportGenerateResponse> => {
    // TODO: BACKEND CONFIRMATION REQUIRED (Is this streaming, async job polling, etc?)
    const response = await apiClient.post("/reports/generate", { businessId });
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
