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
      businessApi.list()
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

export const useBusinessDetails = (id: string) => {
  const [data, setData] = useState<BusinessDetails | null>(
    DATA_SOURCE === "json" ? (businessesData.details as BusinessDetails) : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      businessApi.get(id)
        .then((res) => {
          setData(res as BusinessDetails);
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
