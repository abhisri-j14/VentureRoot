"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useUIStore, Language } from "@/stores/useUIStore";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
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

  // Apply translation to Google combo
  const applyLanguage = (lang: Language) => {
    if (typeof window === "undefined") return;

    // 1. Set the googtrans cookie for host and root path
    const cookieValue = `/en/${lang}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/;`;
    
    // Also clear if switching back to English
    if (lang === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    }

    // 2. Trigger the Google Translate combo select element
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      if (combo.value !== lang) {
        combo.value = lang;
        combo.dispatchEvent(new Event("change"));
      }
    }
  };

  // Re-apply translation when language or route changes
  useEffect(() => {
    applyLanguage(language);
    
    // Check again after a small delay in case DOM just mounted on route transition
    const timer = setTimeout(() => {
      applyLanguage(language);
    }, 400);

    return () => clearTimeout(timer);
  }, [language, pathname]);

  return (
    <>
      {/* Hidden mount node */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* Google Translate Init Script */}
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: 'en',
                  includedLanguages: 'en,bn,hi',
                  autoDisplay: false
                },
                'google_translate_element'
              );
            }
          `,
        }}
      />
      <Script
        id="google-translate-source"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onLoad={() => {
          isInitialized.current = true;
          // Apply active language once script is ready
          setTimeout(() => {
            const currentLang = useUIStore.getState().language;
            applyLanguage(currentLang);
          }, 300);
        }}
      />
    </>
  );
};
