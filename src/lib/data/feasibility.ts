"use client";
import { useState, useEffect } from "react";
import { DATA_SOURCE } from "./source";
import feasibilityData from "@/data/feasibility.json";
import { feasibilityApi } from "@/features/feasibility/api/feasibilityApi";
import { FeasibilityData } from "@/features/feasibility/types";

export const useFeasibility = (businessId: string) => {
  const [data, setData] = useState<any | null>(
    DATA_SOURCE === "json" ? feasibilityData : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      feasibilityApi.getFeasibility(businessId)
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [businessId]);

  return { data, isLoading, error };
};
