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
      reportApi.list()
        .then((res) => {
          setData(res as any[]);
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

export const useReportDetails = (id: string) => {
  const [data, setData] = useState<any | null>(
    DATA_SOURCE === "json" ? (reportsData.find((r) => r.id === id) || null) : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      reportApi.get(id)
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [id]);

  return { data, isLoading, error };
};

export const getReportDetails = async (id: string): Promise<any | null> => {
  if (DATA_SOURCE === "database") {
    try {
      const res = await reportApi.get(id);
      return res;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  return reportsData.find((r) => r.id === id) || null;
};
