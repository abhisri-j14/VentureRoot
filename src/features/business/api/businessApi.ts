import apiClient from "@/lib/api/client";
import { BusinessFormValues } from "../schemas/businessSchema";
import { ApiResponse, PaginatedData, PaginationParams } from "@/types/api";

export interface BusinessListParams extends PaginationParams {
  status?: "DRAFT" | "ANALYZING" | "READY";
  categoryId?: string;
  search?: string;
}

export type BusinessListResponse = ApiResponse<PaginatedData<any>>; // Replace any with Business type if available
export type BusinessDetailResponse = ApiResponse<any>;
export type CreateBusinessResponse = ApiResponse<any>;

export const businessApi = {
  list: async (params?: BusinessListParams): Promise<BusinessListResponse> => {
    const response = await apiClient.get("/businesses", { params });
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
