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
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length === 0) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/v1/locations/search?q=${encodeURIComponent(cleanQuery)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then((json) => {
          const locs = json?.data?.locations || json?.locations || [];
          setData(locs);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("[useLocationSearch] Fetch failed, using fallback:", err);
          setError(err);
          // Fallback to static results if network fails
          const fallback = (locationsData.searchResults || []).filter((r: any) =>
            r.label?.toLowerCase().includes(cleanQuery.toLowerCase())
          );
          setData(fallback);
          setIsLoading(false);
        });
    }, 150); // 150ms debounce for snappy feel

    return () => clearTimeout(timer);
  }, [query]);

  return { data, isLoading, error };
};
