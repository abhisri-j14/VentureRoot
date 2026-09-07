import apiClient from "@/lib/api/client";
import { ProfileData } from "../schemas/profileSchema";
import { ApiResponse } from "@/types/api";

export type GetProfileResponse = ApiResponse<{ profile: ProfileData | null; onboardingCompleted: boolean }>;
export type UpdateProfileResponse = ApiResponse<{ profile: ProfileData; onboardingCompleted: boolean }>;

export const profileApi = {
  getProfile: async (): Promise<GetProfileResponse> => {
    const response = await apiClient.get("/users/me/profile");
    return response.data;
  },

  updateProfile: async (data: ProfileData): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put("/users/me/profile", data);
    return response.data;
  },
};
