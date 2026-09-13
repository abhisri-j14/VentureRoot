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

        const localSavedName = typeof window !== "undefined" ? localStorage.getItem("ventureroot_user_name") : null;
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.username;
        const formattedEmailName = user.email
          ? user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
          : "Entrepreneur";

        const resolvedName = profileName || localSavedName || metaName || formattedEmailName;

        return {
          id: user.id,
          name: resolvedName,
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
          let profile = res?.data?.profile ?? null;
          if (!profile) {
            const activeUser = typeof window !== "undefined" ? (window as any).__VR_USER__ || null : null;
            const localSavedName = typeof window !== "undefined" ? localStorage.getItem("ventureroot_user_name") : null;
            const localSavedEmail = typeof window !== "undefined" ? localStorage.getItem("ventureroot_user_email") : null;
            profile = {
              fullName: localSavedName || "Entrepreneur",
              email: localSavedEmail || "entrepreneur@ventureroot.in",
              phone: "9876543210",
              location: { state: "Enterprise Hub", district: "Local Catchment" },
              financial: { availableCapital: 100000, income: 25000 },
              experience: { businessExperience: "1-3 years", skills: ["Enterprise Operations", "Local Trade"], education: "Graduate" },
            };
          }
          setData(profile);
          setOnboardingCompleted(true);
          setIsLoading(false);
        })
        .catch(() => {
          const localSavedName = typeof window !== "undefined" ? localStorage.getItem("ventureroot_user_name") : null;
          const localSavedEmail = typeof window !== "undefined" ? localStorage.getItem("ventureroot_user_email") : null;
          const fallbackProfile = {
            fullName: localSavedName || "Entrepreneur",
            email: localSavedEmail || "entrepreneur@ventureroot.in",
            phone: "9876543210",
            location: { state: "Enterprise Hub", district: "Local Catchment" },
            financial: { availableCapital: 100000, income: 25000 },
            experience: { businessExperience: "1-3 years", skills: ["Enterprise Operations", "Local Trade"], education: "Graduate" },
          };
          setData(fallbackProfile);
          setOnboardingCompleted(true);
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
