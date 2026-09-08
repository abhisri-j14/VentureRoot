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
    if (DATA_SOURCE === "database" && businessId) {
      financeApi
        .getRepayment({ businessId } as any)
        .then((res: any) => {
          const schedule =
            res?.data?.repaymentSchedule ||
            res?.data?.data?.repaymentSchedule ||
            res?.data ||
            res;
          setData(Array.isArray(schedule) ? schedule : financeData.repaymentSchedule);
          setIsLoading(false);
        })
        .catch((err: any) => {
          setError(err);
          setData(financeData.repaymentSchedule);
          setIsLoading(false);
        });
    }
  }, [businessId]);

  return { data, isLoading, error };
};
