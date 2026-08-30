import apiClient from "@/lib/api/client";
import { BusinessFormValues } from "../schemas/businessSchema";

// TODO: BACKEND CONFIRMATION REQUIRED
// Replace `unknown` with exact backend schemas for business resources
export type BusinessListResponse = unknown;
export type BusinessDetailResponse = unknown;
export type CreateBusinessResponse = unknown;

export const businessApi = {
  list: async (): Promise<BusinessListResponse> => {
    const response = await apiClient.get("/businesses");
    return response.data;
  },

  get: async (id: string): Promise<BusinessDetailResponse> => {
    const response = await apiClient.get(`/businesses/${id}`);
    return response.data;
  },

  create: async (data: BusinessFormValues): Promise<CreateBusinessResponse> => {
    const response = await apiClient.post("/businesses", data);
    return response.data;
  },

  update: async (id: string, data: Partial<BusinessFormValues>): Promise<BusinessDetailResponse> => {
    const response = await apiClient.put(`/businesses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/businesses/${id}`);
  },
};
