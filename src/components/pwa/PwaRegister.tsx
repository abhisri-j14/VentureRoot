"use client";

import { useEffect, useState } from "react";

export default function PwaRegister() {
  const [offlineToast, setOfflineToast] = useState<"offline" | "online" | null>(
    null
  );

  useEffect(() => {
    // 1. Service Worker Registration
    if ("serviceWorker" in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          // Check for service worker updates periodically (every 1 hour)
          const interval = setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          return () => clearInterval(interval);
        } catch (error) {
          console.warn("[PWA] Service Worker registration failed:", error);
        }
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW, { once: true });
      }
    }

    // 2. Online / Offline status notification
    const handleOnline = () => {
      setOfflineToast("online");
      const timer = setTimeout(() => setOfflineToast(null), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setOfflineToast("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offlineToast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      {offlineToast === "offline" && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#200813] text-white text-xs sm:text-sm font-medium shadow-2xl border border-rose-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>You are currently offline. Viewing cached data.</span>
        </div>
      )}

      {offlineToast === "online" && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1E6702] text-white text-xs sm:text-sm font-medium shadow-2xl border border-emerald-400/40">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C8F89B]" />
          <span>Connection restored. You are back online!</span>
        </div>
      )}
    </div>
  );
}
