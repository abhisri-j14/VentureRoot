import apiClient from "@/lib/api/client";
import { LoginFormValues, RegisterFormValues } from "../schemas/authSchema";

// TODO: BACKEND CONFIRMATION REQUIRED
// Replace `unknown` with the exact backend schema once confirmed
export type LoginResponse = unknown;
export type RegisterResponse = unknown;
export type RefreshResponse = unknown;
export type UserResponse = unknown;

export const authApi = {
  register: async (data: RegisterFormValues): Promise<RegisterResponse> => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginFormValues): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  refresh: async (): Promise<RefreshResponse> => {
    // TODO: BACKEND CONFIRMATION REQUIRED (Does refresh use cookie or body?)
    const response = await apiClient.post("/auth/refresh");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  me: async (): Promise<UserResponse> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
