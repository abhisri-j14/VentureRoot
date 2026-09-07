import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

import { ApiResponse } from "@/types/api";

export type LocationHierarchyResponse = ApiResponse<any>;
export type LocationSearchResponse = ApiResponse<any>;

export const locationApi = {
  getStates: async (): Promise<LocationHierarchyResponse> => {
    const response = await apiClient.get("/locations/states");
    return response.data;
  },

  getDistricts: async (stateId: string): Promise<LocationHierarchyResponse> => {
    const response = await apiClient.get(`/locations/districts?state_id=${stateId}`);
    return response.data;
  },

  getBlocks: async (districtId: string): Promise<LocationHierarchyResponse> => {
    const response = await apiClient.get(`/locations/blocks?district_id=${districtId}`);
    return response.data;
  },

  getVillages: async (blockId: string): Promise<LocationHierarchyResponse> => {
    const response = await apiClient.get(`/locations/villages?block_id=${blockId}`);
    return response.data;
  },

  search: async (query: string): Promise<LocationSearchResponse> => {
    const response = await apiClient.get(`/locations/search?q=${query}`);
    return response.data;
  },

  getDetails: async (locationId: string) => {
    const response = await apiClient.get(`/locations/${locationId}`);
    return response.data;
  },

  // ── DEFERRED ENDPOINTS ──
  // The following endpoints are currently deferred in the Phase 17 backend contract.
  getStatistics: async (locationId: string) => {
    const response = await apiClient.get(`/locations/${locationId}/statistics`);
    return response.data;
  },

  getMarkets: async (locationId: string) => {
    const response = await apiClient.get(`/locations/${locationId}/markets`);
    return response.data;
  },

  getCompetitors: async (locationId: string) => {
    const response = await apiClient.get(`/locations/${locationId}/competitors`);
    return response.data;
  },
};

// Legacy Hooks (To be refactored after backend schemas are confirmed)
export const useLocationDetails = (locationId: string) => {
  return useQuery({
    queryKey: ["location", locationId],
    queryFn: () => locationApi.getDetails(locationId),
    enabled: !!locationId,
  });
};

export const useLocationStatistics = (locationId: string) => {
  return useQuery({
    queryKey: ["location", locationId, "statistics"],
    queryFn: () => locationApi.getStatistics(locationId),
    enabled: !!locationId,
  });
};

export const useLocationMarkets = (locationId: string) => {
  return useQuery({
    queryKey: ["location", locationId, "markets"],
    queryFn: () => locationApi.getMarkets(locationId),
    enabled: !!locationId,
  });
};

export const useLocationCompetitors = (locationId: string) => {
  return useQuery({
    queryKey: ["location", locationId, "competitors"],
    queryFn: () => locationApi.getCompetitors(locationId),
    enabled: !!locationId,
  });
};
