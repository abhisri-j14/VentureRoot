import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

// TODO: BACKEND CONFIRMATION REQUIRED
// The consolidated feasibility response format is pending.
export type FeasibilityGenerateResponse = unknown;
export type FeasibilityAggregateResponse = unknown;

export const feasibilityApi = {
  /**
   * Generates or starts the generation job for feasibility.
   * TODO: Need backend confirmation on whether this returns a job_id or streams.
   */
  generateFeasibility: async (businessId: string): Promise<FeasibilityGenerateResponse> => {
    const response = await apiClient.post(`/feasibility/${businessId}/generate`);
    return response.data;
  },

  /**
   * Fetches the complete, aggregated feasibility report for a business.
   * Replaces the 8 separate network calls previously assumed.
   */
  getFeasibility: async (businessId: string): Promise<FeasibilityAggregateResponse> => {
    // We request the root endpoint. If the backend requires separate calls, 
    // we would handle a Promise.all() here, so the frontend API stays clean.
    const response = await apiClient.get(`/feasibility/${businessId}`);
    return response.data;
  },
  
  // Exposing the separate endpoints in the API object as well, just in case
  // the backend enforces a fragmented architecture.
  getMarket: async (businessId: string) => (await apiClient.get(`/feasibility/${businessId}/market`)).data,
  getOpportunities: async (businessId: string) => (await apiClient.get(`/feasibility/${businessId}/opportunities`)).data,
  getSwot: async (businessId: string) => (await apiClient.get(`/feasibility/${businessId}/swot`)).data,
  getThreats: async (businessId: string) => (await apiClient.get(`/feasibility/${businessId}/threats`)).data,
  getCompetitors: async (businessId: string) => (await apiClient.get(`/feasibility/${businessId}/competitors`)).data,
  getPricing: async (businessId: string) => (await apiClient.get(`/feasibility/${businessId}/pricing`)).data,
  getScore: async (businessId: string) => (await apiClient.get(`/feasibility/${businessId}/score`)).data,
};

// ── Legacy Hooks (To be refactored to use consolidated `getFeasibility` once schemas are confirmed) ──

export const useFeasibilityData = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId],
    queryFn: () => feasibilityApi.getFeasibility(businessId),
    enabled: !!businessId,
  });
};

export const useFeasibilityMarket = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId, "market"],
    queryFn: () => feasibilityApi.getMarket(businessId),
    enabled: !!businessId,
  });
};

export const useFeasibilityOpportunities = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId, "opportunities"],
    queryFn: () => feasibilityApi.getOpportunities(businessId),
    enabled: !!businessId,
  });
};

export const useFeasibilitySwot = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId, "swot"],
    queryFn: () => feasibilityApi.getSwot(businessId),
    enabled: !!businessId,
  });
};

export const useFeasibilityThreats = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId, "threats"],
    queryFn: () => feasibilityApi.getThreats(businessId),
    enabled: !!businessId,
  });
};

export const useFeasibilityCompetitors = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId, "competitors"],
    queryFn: () => feasibilityApi.getCompetitors(businessId),
    enabled: !!businessId,
  });
};

export const useFeasibilityPricing = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId, "pricing"],
    queryFn: () => feasibilityApi.getPricing(businessId),
    enabled: !!businessId,
  });
};

export const useFeasibilityScore = (businessId: string) => {
  return useQuery({
    queryKey: ["feasibility", businessId, "score"],
    queryFn: () => feasibilityApi.getScore(businessId),
    enabled: !!businessId,
  });
};

export const useGenerateFeasibility = () => {
  return useMutation({
    mutationFn: (businessId: string) => feasibilityApi.generateFeasibility(businessId),
  });
};
