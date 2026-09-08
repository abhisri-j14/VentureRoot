"use client";

import { useState, useEffect } from "react";
import { Language } from "@/stores/useUIStore";

// In-memory client cache
const clientCache = new Map<string, string>();
// Pending request promises to prevent duplicate simultaneous calls
const pendingRequests = new Map<string, Promise<string>>();

/**
 * Translates a single dynamic string on the fly using the /api/translate route
 */
export async function translateDynamicText(
  text: string,
  targetLang: Language,
  sourceLang: string = "auto"
): Promise<string> {
  if (!text || targetLang === "en" && sourceLang === "en") {
    return text;
  }

  const cacheKey = `${targetLang}:${text.trim()}`;

  // 1. Check in-memory cache
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  // 2. Check localStorage cache if available
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`vr_trans_${cacheKey}`);
      if (stored) {
        clientCache.set(cacheKey, stored);
        return stored;
      }
    } catch {
      // Storage unavailable or disabled
    }
  }

  // 3. Deduplicate concurrent requests for the same key
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang, sourceLang }),
      });

      if (!res.ok) {
        throw new Error(`Translation HTTP error: ${res.status}`);
      }

      const data = await res.json();
      const translated = data.translatedText || text;

      // Update in-memory cache
      clientCache.set(cacheKey, translated);

      // Persist in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`vr_trans_${cacheKey}`, translated);
        } catch {
          // ignore quota error
        }
      }

      return translated;
    } catch (err) {
      console.warn(`Translation request failed for "${text.slice(0, 30)}...":`, err);
      return text; // Graceful fallback to original text
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * React hook for dynamically translating text on the fly
 */
export function useDynamicTranslation(text: string, targetLang: Language) {
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text) {
      setTranslated("");
      return;
    }

    if (targetLang === "en") {
      setTranslated(text);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    translateDynamicText(text, targetLang)
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslated(text);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, targetLang]);

  return { translated, isLoading };
}
