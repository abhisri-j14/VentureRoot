import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach auth token ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    // Prevent token leakage: only attach to relative paths or the configured baseURL
    const isRelativeUrl = !config.url?.startsWith("http://") && !config.url?.startsWith("https://");
    const isApiUrl = config.url?.startsWith(config.baseURL || "");
    
    if (token && (isRelativeUrl || isApiUrl)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Auto-logout on 401 if refresh logic fails or is not implemented
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // TODO: BACKEND CONFIRMATION REQUIRED
        // Implement refresh token flow here once backend confirms mechanism
        // DO NOT assume refresh token location (cookie vs body) or request schema
        
        // For now, auto logout
        useAuthStore.getState().logout();
      } catch (refreshError) {
        useAuthStore.getState().logout();
      }
    }
    
    // Normalize Error
    // TODO: BACKEND CONFIRMATION REQUIRED (Exact error response schema)
    const normalizedError: ApiError = {
      message: error.response?.data?.message || error.message || "An unexpected error occurred",
      code: error.response?.data?.error_code || "UNKNOWN",
      details: error.response?.data?.errors,
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
