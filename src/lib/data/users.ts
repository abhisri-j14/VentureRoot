"use client";
import { useState, useEffect, useCallback } from "react";
import { DATA_SOURCE } from "./source";
import usersData from "@/data/users.json";
import { profileApi } from "@/features/profile/api/profileApi";
import { authApi } from "@/features/auth/api/authApi";

export const getCurrentUser = async (): Promise<any | null> => {
  if (DATA_SOURCE === "database") {
    try {
      const res: any = await authApi.me();
      const user = res?.data?.user || res?.user || res?.data;
      if (user) {
        let profileName = user.user_metadata?.full_name;
        let location = undefined;
        try {
          const pRes: any = await profileApi.getProfile();
          const pData = pRes?.data?.profile;
          if (pData?.fullName) {
            profileName = pData.fullName;
          }
          if (pData?.location?.state) {
            location = `${pData.location.district ? pData.location.district + ", " : ""}${pData.location.state}`;
          }
        } catch {
          // Profile may not exist yet for new user
        }

        return {
          id: user.id,
          name:
            profileName ||
            user.email?.split("@")[0] ||
            "User",
          email: user.email,
          roleLabel: user.user_metadata?.role || "Entrepreneur",
          location,
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
  return usersData.currentUser;
};

export const useProfile = () => {
  const [data, setData] = useState<any | null>(
    DATA_SOURCE === "json" ? usersData.profile : null
  );
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(
    DATA_SOURCE === "json" ? true : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (DATA_SOURCE === "database") {
      setIsLoading(true);
      profileApi
        .getProfile()
        .then((res: any) => {
          const profile = res?.data?.profile ?? null;
          const completed = res?.data?.onboardingCompleted ?? !!profile;
          setData(profile);
          setOnboardingCompleted(completed);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setData(null);
          setIsLoading(false);
        });
    } else {
      setData(usersData.profile);
      setOnboardingCompleted(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, onboardingCompleted, isLoading, error, refetch };
};
