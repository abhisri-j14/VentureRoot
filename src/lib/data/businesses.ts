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
      const items = Array.isArray(list) ? list : [];

      // Check user-scoped client cache
      let combined = [...items];
      if (typeof window !== "undefined") {
        const userId = localStorage.getItem("ventureroot_user_id");
        const cached = localStorage.getItem(`ventureroot_businesses_${userId || "default"}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const b of parsed) {
                if (!combined.some((c) => c.id === b.id || (c.name && c.name === b.name))) {
                  combined.push(b);
                }
              }
            }
          } catch (_) {}
        }
        if (combined.length > 0) {
          localStorage.setItem(`ventureroot_businesses_${userId || "default"}`, JSON.stringify(combined));
        }
      }

      const normalizedList = combined.map(normalizeBusinessLocation);
      setData(normalizedList);
      setError(null);
    } catch (err: any) {
      console.warn("[useBusinessesComparison] Database fetch failed:", err);
      setError(err);

      // Check user-scoped client cache on fetch error
      let foundCached = false;
      if (typeof window !== "undefined") {
        const userId = localStorage.getItem("ventureroot_user_id");
        const cached = localStorage.getItem(`ventureroot_businesses_${userId || "default"}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setData(parsed);
              foundCached = true;
            }
          } catch (_) {}
        }
      }

      if (!foundCached) {
        if (DATA_SOURCE === "json") {
          setData(businessesData.comparison);
        } else {
          setData([]);
        }
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

import { resolveCoordinatesForLocation } from "@/services/location-search.service";

export function normalizeBusinessLocation(biz: any) {
  if (!biz) return biz;
  if (!biz.location) return biz;
  const loc = biz.location;
  const resolved = resolveCoordinatesForLocation(loc);
  return {
    ...biz,
    location: {
      ...loc,
      lat: resolved.lat,
      lon: resolved.lon,
      latitude: resolved.lat,
      longitude: resolved.lon,
      subdistrict: loc.subdistrict || loc.block || loc.district || "",
      block: loc.block || loc.subdistrict || "",
      district: loc.district || "",
      state: loc.state || "",
      formatted: resolved.label,
    },
  };
}

export const useBusinessDetails = (id: string) => {
  const [data, setData] = useState<BusinessDetails | null>(
    DATA_SOURCE === "json" ? (businessesData.details as BusinessDetails) : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (DATA_SOURCE === "database") {
      const getFromCache = () => {
        if (typeof window !== "undefined") {
          const userId = localStorage.getItem("ventureroot_user_id");
          const cached = localStorage.getItem(`ventureroot_businesses_${userId || "default"}`);
          if (cached) {
            try {
              const list = JSON.parse(cached);
              if (Array.isArray(list) && list.length > 0) {
                const found = list.find((b: any) => b.id === id) || (id === "123" || !id ? list[0] : null);
                return normalizeBusinessLocation(found);
              }
            } catch (_) {}
          }
        }
        return null;
      };

      const cachedBiz = getFromCache();
      if (cachedBiz) {
        setData(cachedBiz as BusinessDetails);
        setIsLoading(false);
      }

      if (!id || id === "123") {
        if (!cachedBiz) {
          setData(null);
        }
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
          const normalized = normalizeBusinessLocation(details);
          setData(normalized as BusinessDetails);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          if (!cachedBiz) {
            setData(null);
          }
          setIsLoading(false);
        });
    }
  }, [id]);

  return { data, isLoading, error };
};

