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
      financeApi.getRepayment({ businessId } as any)
        .then((res: any) => {
          setData(res.data as any);
          setIsLoading(false);
        })
        .catch((err: any) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [businessId]);

  return { data, isLoading, error };
};
