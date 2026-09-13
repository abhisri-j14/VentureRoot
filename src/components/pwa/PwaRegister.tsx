"use client";

import { useEffect, useState } from "react";

export default function PwaRegister() {
  const [offlineToast, setOfflineToast] = useState<"offline" | "online" | null>(
    null
  );

  useEffect(() => {
    // Check if running on local development or local IP
    const isDev =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.startsWith("192.168.") ||
          window.location.hostname.startsWith("10.") ||
          window.location.port === "3000"));

    if (isDev) {
      // In development / local testing, purge all service worker caches so changes always appear instantly
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(async (registrations) => {
          let hadWorker = false;
          for (const reg of registrations) {
            hadWorker = true;
            await reg.unregister();
          }
          if (hadWorker) {
            const hasReloaded = sessionStorage.getItem("pwa_dev_unregistered");
            if (!hasReloaded) {
              sessionStorage.setItem("pwa_dev_unregistered", "true");
              window.location.reload();
            }
          }
        });
      }

      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        });
      }
      return;
    }

    // 1. Production Service Worker Registration
    if ("serviceWorker" in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          // Check for service worker updates immediately
          try {
            await registration.update();
          } catch (_) {}

          // Check for service worker updates periodically (every 10 minutes)
          const interval = setInterval(() => {
            registration.update();
          }, 10 * 60 * 1000);

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
