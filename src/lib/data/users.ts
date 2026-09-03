"use client";
import { useState, useEffect } from "react";
import { DATA_SOURCE } from "./source";
import usersData from "@/data/users.json";
import { profileApi } from "@/features/profile/api/profileApi";
import { authApi } from "@/features/auth/api/authApi";

export const getCurrentUser = async (): Promise<any | null> => {
  if (DATA_SOURCE === "database") {
    try {
      const res = await authApi.me();
      return res;
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
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      profileApi.getProfile()
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, []);

  return { data, isLoading, error };
};
