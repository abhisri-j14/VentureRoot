"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUIStore, SUPPORTED_LANGUAGES, Language } from "@/stores/useUIStore";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "compact" | "minimal";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "default",
}) => {
  const { language, setLanguage } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);

    if (typeof window !== "undefined") {
      // Store user preference in clean, standards-compliant cookie
      document.cookie = `ventureroot_locale=${code}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = code;

      // Keep single, consistent googtrans cookie without duplicate host/domain entries
      if (code === "en") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } else {
        document.cookie = `googtrans=/en/${code}; path=/;`;
      }

      // If Google Translate combo is loaded in DOM, synchronize it quietly and dispatch change
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (combo) {
        combo.value = code;
        try {
          combo.dispatchEvent(new Event("change"));
        } catch (_) {}
      }
    }
  };

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${className}`}>
        {SUPPORTED_LANGUAGES.map((lang, idx) => (
          <React.Fragment key={lang.code}>
            <button
              onClick={() => handleSelect(lang.code)}
              className={`px-2 py-1 rounded transition-colors ${
                language === lang.code
                  ? "bg-[#1E6702]/15 text-[#1E6702] font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {lang.nativeLabel}
            </button>
            {idx < SUPPORTED_LANGUAGES.length - 1 && <span className="text-slate-300">|</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={
          variant === "compact"
            ? "h-8 flex items-center justify-between gap-1.5 bg-[#FFFBE7] hover:bg-white text-[#200813] border border-black/5 rounded-full px-2.5 py-1 text-xs font-bold shadow-[inset_0_-1px_2px_rgba(0,0,0,0.05),0_2px_5px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-[0.98] focus:outline-none cursor-pointer"
            : "flex items-center justify-between gap-2.5 bg-white/90 hover:bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1E6702]/25 cursor-pointer"
        }
      >
        <div className="flex items-center gap-1.5">
          <Globe className={`text-[#1E6702] shrink-0 ${variant === "compact" ? "w-3.5 h-3.5" : "w-4 h-4"}`} aria-hidden="true" />
          <span className="font-bold text-xs tracking-wider uppercase text-[#200813]">
            {currentLang.code}
          </span>
          {variant !== "compact" && (
            <span className="text-slate-700 hidden sm:inline text-xs font-medium">
              {currentLang.nativeLabel}
            </span>
          )}
        </div>
        <ChevronDown
          className={`text-[#200813]/50 transition-transform duration-200 ${variant === "compact" ? "w-3 h-3" : "w-3.5 h-3.5"} ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] border border-black/5 py-1.5 z-50 overflow-hidden"
            role="listbox"
          >
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Select Language
            </div>
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-[#1E6702]/10 text-[#1E6702] font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{item.nativeLabel}</span>
                    <span className="text-[11px] text-slate-500">{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#1E6702] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

