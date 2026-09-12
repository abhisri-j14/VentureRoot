"use client";
import { useState, useEffect, useCallback } from "react";
import { DATA_SOURCE } from "./source";
import businessesData from "@/data/businesses.json";
import { businessApi } from "@/features/business/api/businessApi";
import { BusinessDetails } from "@/features/business/components/BusinessDetailsView";

export const useBusinessesComparison = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await businessApi.list();
      const list =
        res?.data?.businesses ||
        res?.data?.data?.businesses ||
        res?.data?.items ||
        res?.items ||
        [];
      setData(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err: any) {
      console.warn("[useBusinessesComparison] Database fetch failed:", err);
      setError(err);
      // Only fallback to json if DATA_SOURCE is strictly explicitly set to json
      if (DATA_SOURCE === "json") {
        setData(businessesData.comparison);
      } else {
        setData([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();

    // Listen for custom event when business is created or updated
    const handleBusinessUpdate = () => {
      fetchBusinesses();
    };
    window.addEventListener("business-updated", handleBusinessUpdate);
    return () => window.removeEventListener("business-updated", handleBusinessUpdate);
  }, [fetchBusinesses]);

  return { data, isLoading, error, refetch: fetchBusinesses };
};

export const useBusinessDetails = (id: string) => {
  const [data, setData] = useState<BusinessDetails | null>(
    DATA_SOURCE === "json" ? (businessesData.details as BusinessDetails) : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      if (!id || id === "123") {
        setData(businessesData.details as BusinessDetails);
        setIsLoading(false);
        return;
      }
      businessApi
        .get(id)
        .then((res: any) => {
          const details =
            res?.data?.business ||
            res?.data?.data?.business ||
            res?.data ||
            res;
          setData(details as BusinessDetails);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setData(null);
          setIsLoading(false);
        });
    }
  }, [id]);

  return { data, isLoading, error };
};
