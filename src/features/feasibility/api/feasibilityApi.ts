import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export type FeasibilityGenerateResponse = ApiResponse<any>;
export type FeasibilityAggregateResponse = ApiResponse<any>;

export const feasibilityApi = {
  /**
   * Generates or starts the generation job for feasibility.
   */
  generateFeasibility: async (businessId: string): Promise<FeasibilityGenerateResponse> => {
    const response = await apiClient.post(`/feasibility/${businessId}/generate`);
    return response.data;
  },

  /**
   * Fetches the complete feasibility report/context for a business.
   */
  getFeasibility: async (businessId: string): Promise<FeasibilityAggregateResponse> => {
    const response = await apiClient.get(`/feasibility/${businessId}`);
    return response.data;
  },
};

// ── Hooks ──

export const useFeasibilityData = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId],
    queryFn: () => feasibilityApi.getFeasibility(businessId),
    enabled: !!businessId,
  });
};

export const useGenerateFeasibility = () => {
  return useMutation({
    mutationFn: (businessId: string) => feasibilityApi.generateFeasibility(businessId),
  });
};
