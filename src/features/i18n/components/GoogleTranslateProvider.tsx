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

/**
 * Headless Google Translate Provider for whole-site automated translation.
 * Translates all pages, cards, paragraphs, and dynamic content automatically
 * while keeping VentureRoot's custom UI, styles, and LanguageSwitcher.
 */
export const GoogleTranslateProvider = () => {
  const language = useUIStore((s) => s.language);
  const pathname = usePathname();
  const isInitialized = useRef(false);

  /**
   * Try to apply the language to the Google Translate combo.
   * Polls every 150ms for up to 5 seconds until the combo element is ready.
   */
  const applyLanguage = (lang: Language) => {
    if (typeof window === "undefined") return;

    // Set / clear the googtrans cookie
    if (lang === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    } else {
      const cookieValue = `/en/${lang}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/;`;
    }

    // Poll for the combo element — it appears asynchronously after the Google script loads
    let attempts = 0;
    const maxAttempts = 33; // ~5 seconds at 150ms intervals
    const interval = setInterval(() => {
      attempts++;
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;

      if (combo) {
        clearInterval(interval);
        // Set the value only if it's a valid option in the combo
        const validOption = Array.from(combo.options).some((o) => o.value === lang);
        if (validOption && combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event("change"));
        } else if (!validOption && lang !== "en") {
          // Language not in widget options — fall back to page reload with cookie
          window.location.reload();
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        // Combo never appeared — reload to let Google Translate init from cookie
        if (lang !== "en") {
          window.location.reload();
        }
      }
    }, 150);
  };

  // Re-apply translation when language or route changes
  useEffect(() => {
    applyLanguage(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, pathname]);

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
