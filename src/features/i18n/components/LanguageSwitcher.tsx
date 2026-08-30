"use client";

import React from "react";
import { useUIStore } from "@/stores/useUIStore";
import { Globe, ChevronDown } from "lucide-react";

const LABELS = {
  en: "English",
  bn: "বাংলা",
  hi: "हिन्दी",
};

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useUIStore();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "en" | "bn" | "hi");
  };

  return (
    <div className="relative flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
      <div className="flex items-center gap-2 pointer-events-none">
        <Globe className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium text-secondary">{LABELS[language]}</span>
      </div>
      <ChevronDown className="w-4 h-4 text-slate-500 pointer-events-none" />
      
      <select
        id="language-switcher"
        value={language}
        onChange={handleLanguageChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 text-black"
        aria-label="Select Language"
      >
        <option value="en" className="text-black bg-white">English</option>
        <option value="bn" className="text-black bg-white">বাংলা</option>
        <option value="hi" className="text-black bg-white">हिन्दी</option>
      </select>
    </div>
  );
};
