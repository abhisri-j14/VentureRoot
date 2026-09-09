"use client";
import { useState, useEffect } from "react";
import { DATA_SOURCE } from "./source";
import reportsData from "@/data/reports.json";
import { reportApi } from "@/features/reports/api/reportApi";

export const useReports = () => {
  const [data, setData] = useState<any[]>(
    DATA_SOURCE === "json" ? reportsData : []
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      reportApi
        .list()
        .then((res: any) => {
          const list =
            res?.data?.reports ||
            res?.data?.data?.reports ||
            res?.data?.items ||
            res?.items ||
            [];
          setData(list);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setData([]);
          setIsLoading(false);
        });
    }
  }, []);

  return { data, isLoading, error };
};

export const useReportDetails = (id: string) => {
  const [data, setData] = useState<any | null>(
    DATA_SOURCE === "json" ? (reportsData.find((r) => r.id === id) || null) : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database" && id) {
      if (id === "123") {
        setData(null);
        setIsLoading(false);
        return;
      }
      reportApi
        .get(id)
        .then((res: any) => {
          const report =
            res?.data?.report ||
            res?.data?.data?.report ||
            res?.data ||
            res;
          setData(report || reportsData.find((r) => r.id === id) || null);
          setIsLoading(false);
        })
        .catch((err) => {
          const fallback = reportsData.find((r) => r.id === id);
          if (fallback) {
            setData(fallback);
          } else {
            setError(err);
            setData(null);
          }
          setIsLoading(false);
        });
    }
  }, [id]);

  return { data, isLoading, error };
};

export const getReportDetails = async (id: string): Promise<any | null> => {
  if (DATA_SOURCE === "database") {
    try {
      const res: any = await reportApi.get(id);
      const report =
        res?.data?.report ||
        res?.data?.data?.report ||
        res?.data ||
        res;
      return report || reportsData.find((r) => r.id === id) || null;
    } catch (e) {
      const fallback = reportsData.find((r) => r.id === id);
      if (fallback) {
        return fallback;
      }
      console.error("[getReportDetails] Report error:", e);
      return null;
    }
  }
  return reportsData.find((r) => r.id === id) || null;
};
