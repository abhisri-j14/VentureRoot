"use client";
import { useState, useEffect } from "react";
import { DATA_SOURCE } from "./source";
import feasibilityData from "@/data/feasibility.json";
import { feasibilityApi } from "@/features/feasibility/api/feasibilityApi";

export const useFeasibility = (businessId: string) => {
  const [data, setData] = useState<any | null>(
    DATA_SOURCE === "json" ? feasibilityData : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE !== "database" || !businessId) return;

    setIsLoading(true);
    setError(null);

    feasibilityApi
      .getFeasibility(businessId)
      .then((res: any) => {
        // API response shape: { success, message, data: { feasibility: { business, profile, mlStatus, feasibility } } }
        const payload =
          res?.data?.feasibility?.feasibility ||   // nested: data.feasibility.feasibility (the FeasibilityData)
          res?.data?.feasibility ||                 // flat: data.feasibility
          res?.data ||
          res;

        setData(payload || null);
        setIsLoading(false);
      })
      .catch((err: any) => {
        // Do NOT fall back to mock JSON — show the real error state
        setError(err instanceof Error ? err : new Error(err?.message || "Failed to load feasibility data"));
        setData(null);
        setIsLoading(false);
      });
  }, [businessId]);

  return { data, isLoading, error };
};
