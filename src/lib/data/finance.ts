"use client";
import { useState, useEffect } from "react";
import { DATA_SOURCE } from "./source";
import financeData from "@/data/finance.json";
import { financeApi } from "@/features/finance/api/financeApi";

export const useRepaymentSchedule = (businessId: string) => {
  const [data, setData] = useState<any[]>(
    DATA_SOURCE === "json" ? financeData.repaymentSchedule : []
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      financeApi.getRepaymentSchedule(businessId)
        .then((res) => {
          // Assuming backend returns an array mapped to RepaymentResponse
          setData(res as any);
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
