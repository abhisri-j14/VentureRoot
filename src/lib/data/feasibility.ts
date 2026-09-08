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
    if (DATA_SOURCE === "database" && businessId) {
      feasibilityApi
        .getFeasibility(businessId)
        .then((res: any) => {
          const report =
            res?.data?.feasibility ||
            res?.data?.data?.feasibility ||
            res?.data ||
            res;
          setData(report || feasibilityData);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setData(feasibilityData);
          setIsLoading(false);
        });
    }
  }, [businessId]);

  return { data, isLoading, error };
};
