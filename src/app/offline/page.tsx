"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setChecking(false);
      }
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-[#f4fce8] text-[#200813] flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full text-center bg-white/90 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-soft border border-[#1E6702]/15 flex flex-col items-center">
        {/* App Icon */}
        <div className="w-20 h-20 relative rounded-2xl overflow-hidden shadow-md mb-6 ring-4 ring-[#C8F89B]/50">
          <Image
            src="/icons/icon-192x192.png"
            alt="VentureRoot"
            width={80}
            height={80}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Offline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Offline Mode Active
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#200813] mb-3">
          No Internet Connection
        </h1>

        <p className="text-secondary-muted text-sm leading-relaxed mb-8">
          You are currently browsing offline. Previously viewed business plans and dashboard modules remain accessible in your device cache.
        </p>

        {/* Status card */}
        <div className="w-full bg-[#f4fce8]/80 border border-[#1E6702]/20 rounded-2xl p-4 mb-6 text-left text-xs space-y-2 text-[#200813]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-secondary-muted">Network Status:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-md ${
                isOnline
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {isOnline ? "Back Online" : "Disconnected"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-secondary-muted">Cached Workspace:</span>
            <span className="font-semibold text-[#1E6702]">Ready</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={handleRetry}
            disabled={checking}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-[#1E6702] hover:bg-[#144801] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {checking ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking Connection...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Reconnecting
              </>
            )}
          </button>

          <Link
            href="/"
            className="block w-full py-2.5 px-4 text-sm font-medium text-secondary-muted hover:text-[#1E6702] transition-colors text-center"
          >
            Return to Home Screen
          </Link>
        </div>
      </div>
    </main>
  );
}
