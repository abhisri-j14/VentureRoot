"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useUIStore, Language } from "@/stores/useUIStore";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
    __dom_patch_applied?: boolean;
  }
}

// Industry-standard protection against Google Translate / browser extension DOM mutation crashing React
if (typeof window !== "undefined" && !window.__dom_patch_applied && typeof Node !== "undefined" && Node.prototype) {
  window.__dom_patch_applied = true;
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child: any) {
    if (child.parentNode !== this) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("Ignored removeChild on node re-parented by translator/extension:", child, this);
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments as any);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode: any, referenceNode: any) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("Ignored insertBefore on node re-parented by translator/extension:", referenceNode, this);
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments as any);
  };
}

// Guard against external 3rd-party scripts (e.g. Google Translate) calling window.location.reload in loops
if (typeof window !== "undefined" && !(window as any).__vr_reload_guarded) {
  (window as any).__vr_reload_guarded = true;
  try {
    const originalReload = window.location.reload.bind(window.location);
    let lastReloadAttempt = 0;
    window.location.reload = function () {
      const now = Date.now();
      // Block rapid or repeated reloads within 15 seconds
      if (now - lastReloadAttempt < 15000) {
        console.warn("[VentureRoot] Suppressed automated periodic window.location.reload");
        return;
      }
      lastReloadAttempt = now;
      try {
        originalReload();
      } catch (_) {}
    };
  } catch (_) {
    // Non-fatal if browser protects window.location.reload
  }
}

/**
 * Headless Google Translate Provider for whole-site automated translation.
 * Translates all pages, cards, paragraphs, and dynamic content automatically
 * while keeping VentureRoot's custom UI, styles, and LanguageSwitcher.
 */
export const GoogleTranslateProvider = () => {
  const language = useUIStore((s) => s.language);
  const pathname = usePathname();
  const isInitialized = useRef(false);
  const lastAppliedLang = useRef<string | null>(null);

  /**
   * Try to apply the language to the Google Translate combo safely.
   */
  const applyLanguage = (lang: Language) => {
    if (typeof window === "undefined") return;

    // Synchronize HTML document language attribute
    document.documentElement.lang = lang;

    // Set / clear the googtrans cookie without duplicate host/domain clashes
    if (lang === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/;`;
    }

    // Check if the combo element is available in the DOM
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo && combo.value !== lang) {
      combo.value = lang;
      try {
        combo.dispatchEvent(new Event("change"));
      } catch (_) {}
      lastAppliedLang.current = lang;
    }
  };

  // Re-apply translation when language changes (do NOT reload on pathname changes)
  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  return (
    <>
      {/* Hidden mount node for Google Translate widget */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Google Translate Init Script — runs before the API script loads */}
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  includedLanguages: 'en,bn,hi,pa,mr,ta,te',
                  autoDisplay: false
                },
                'google_translate_element'
              );
            }
          `,
        }}
      />
      {/* Google Translate API — calls googleTranslateElementInit on load */}
      <Script
        id="google-translate-source"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onLoad={() => {
          isInitialized.current = true;
          // Trigger language immediately after widget is ready
          const currentLang = useUIStore.getState().language;
          applyLanguage(currentLang);
        }}
      />
    </>
  );
};
