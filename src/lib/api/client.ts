import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") return "/api/v1";
  return "http://localhost:3000/api/v1";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach auth token ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState().token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("ventureroot_token")
        : null);

    // Prevent token leakage: only attach to relative paths or the configured baseURL
    const isRelativeUrl =
      !config.url?.startsWith("http://") && !config.url?.startsWith("https://");
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
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/register");

    // Auto-logout on 401 for authenticated endpoints
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      useAuthStore.getState().logout();
    }

    // Normalize Error
    const normalizedError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      code: error.response?.data?.error_code || "UNKNOWN",
      details: error.response?.data?.errors,
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
