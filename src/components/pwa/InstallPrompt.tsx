"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default true until verified on client

  useEffect(() => {
    // 1. Check if already installed / running as standalone
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // 2. Check dismissal cooldown (dismiss for 7 days if user closed it)
    const dismissedTime = localStorage.getItem("vr_pwa_install_dismissed");
    if (dismissedTime) {
      const elapsed = Date.now() - parseInt(dismissedTime, 10);
      if (elapsed < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    setDismissed(false);

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("fxios");

    if (isIosDevice && isSafari && !isRunningStandalone) {
      setIsIOS(true);
    }

    // 4. Listen for beforeinstallprompt event (Chromium browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIOSPrompt(false);
    localStorage.setItem("vr_pwa_install_dismissed", Date.now().toString());
  };

  if (isStandalone || dismissed) {
    return null;
  }

  // Chromium / Android native prompt available
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#1E6702]/20 p-4 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 relative rounded-xl overflow-hidden shadow-sm flex-shrink-0 ring-2 ring-[#C8F89B]">
            <Image
              src="/icons/icon-192x192.png"
              alt="VentureRoot"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[#200813] leading-snug">
              Install VentureRoot App
            </h4>
            <p className="text-xs text-secondary-muted mt-0.5 leading-relaxed">
              Install on your device for instant launch, offline reports, and fullscreen experience.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-lg bg-[#1E6702] hover:bg-[#144801] text-white text-xs font-semibold shadow transition-colors cursor-pointer"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 rounded-lg text-secondary-muted hover:text-[#200813] text-xs font-medium transition-colors cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari specific guide
  if (isIOS) {
    return (
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#1E6702]/20 p-4 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 relative rounded-xl overflow-hidden shadow-sm flex-shrink-0 ring-2 ring-[#C8F89B]">
            <Image
              src="/icons/icon-192x192.png"
              alt="VentureRoot"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-[#200813]">
              Install VentureRoot on iOS
            </h4>
            <p className="text-[11px] text-secondary-muted mt-1 leading-normal">
              Tap the <span className="font-semibold text-[#1E6702]">Share button</span>{" "}
              <span className="inline-block px-1 bg-gray-100 rounded text-gray-700">⎋</span>{" "}
              in Safari, then select{" "}
              <span className="font-semibold text-[#1E6702]">&ldquo;Add to Home Screen&rdquo;</span>.
            </p>

            <button
              onClick={handleDismiss}
              className="mt-2.5 text-[11px] font-medium text-secondary-muted hover:text-[#1E6702]"
            >
              Got it
            </button>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
