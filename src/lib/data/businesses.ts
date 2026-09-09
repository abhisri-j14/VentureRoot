"use client";
import { useState, useEffect } from "react";
import { DATA_SOURCE } from "./source";
import businessesData from "@/data/businesses.json";
import { businessApi } from "@/features/business/api/businessApi";
import { BusinessDetails } from "@/features/business/components/BusinessDetailsView";

export const useBusinessesComparison = () => {
  const [data, setData] = useState<any[]>(
    DATA_SOURCE === "json" ? businessesData.comparison : []
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      businessApi
        .list()
        .then((res: any) => {
          const list =
            res?.data?.businesses ||
            res?.data?.data?.businesses ||
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
