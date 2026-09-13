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
        const rawPayload =
          res?.data?.feasibility?.feasibility ||   // nested: data.feasibility.feasibility (the FeasibilityData)
          res?.data?.feasibility ||                 // flat: data.feasibility
          res?.data ||
          res;

        const payload = (rawPayload && (rawPayload.market || rawPayload.pricing))
          ? rawPayload
          : (res?.data?.feasibility?.feasibility || feasibilityData);

        setData(payload || feasibilityData);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.warn("[useFeasibility] Falling back to baseline feasibility data:", err);
        setData(feasibilityData);
        setIsLoading(false);
      });
  }, [businessId]);

  return { data, isLoading, error };
};
