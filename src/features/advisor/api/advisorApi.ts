import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  evidence?: {
    sources: string[];
    type: "FACT" | "ESTIMATE" | "PREDICTION" | "UNKNOWN";
    confidence?: number;
  };
}

// TODO: BACKEND CONFIRMATION REQUIRED
export type ChatResponse = unknown;
export type BusinessAnalysisResponse = unknown;
export type RecommendationsResponse = unknown;

export const advisorApi = {
  chat: async (payload: { message: string; businessId?: string; context?: any }): Promise<ChatResponse> => {
    // TODO: Connect to actual streaming POST /api/v1/ai/advisor/chat if required.
    const response = await apiClient.post("/ai/advisor/chat", payload);
    return response.data;
  },

  analyzeBusiness: async (businessId: string): Promise<BusinessAnalysisResponse> => {
    const response = await apiClient.post("/ai/business/analyze", { businessId });
    return response.data;
  },

  getRecommendations: async (businessId: string): Promise<RecommendationsResponse> => {
    const response = await apiClient.post("/ai/business/recommend", { businessId });
    return response.data;
  },
};

// ── Legacy Hooks ──
export const useChatMutation = () => {
  return useMutation({
    mutationFn: (payload: { message: string; businessId?: string; context?: any }) => advisorApi.chat(payload),
  });
};
