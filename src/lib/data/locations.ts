"use client";
import { useState, useEffect } from "react";
import { DATA_SOURCE } from "./source";
import locationsData from "@/data/locations.json";
import { locationApi } from "@/features/location/api/locationApi";

// The UI expects a complete hierarchy object tree. 
// Since the backend only provides granular traversal (getStates, getDistricts, etc.), 
// we keep the JSON hierarchy as the canonical source for the current UI implementation
// to avoid redesigning the location selector components.
export const getLocationHierarchy = () => {
  return locationsData.hierarchy;
};

export const useLocationSearch = (query: string) => {
  const [data, setData] = useState<any[]>(
    DATA_SOURCE === "json" ? locationsData.searchResults : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database" && query.trim().length > 0) {
      setIsLoading(true);
      locationApi.search(query)
        .then((res) => {
          setData(res as any);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    } else if (DATA_SOURCE === "json") {
      // In JSON mode, we could filter the mock results if we wanted, 
      // but returning the static mock array matches the previous behavior.
      setData(locationsData.searchResults);
    }
  }, [query]);

  return { data, isLoading, error };
};
