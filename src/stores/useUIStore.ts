import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "bn" | "hi" | "pa" | "mr" | "ta" | "te";

export const SUPPORTED_LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "hi", label: "Hindi",   nativeLabel: "हिन्दी" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "ta", label: "Tamil",   nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu",  nativeLabel: "తెలుగు" },
];

export const detectBrowserLanguage = (): Language => {
  if (typeof window === "undefined" || !navigator?.language) return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("bn")) return "bn";
  if (lang.startsWith("hi")) return "hi";
  if (lang.startsWith("pa")) return "pa";
  if (lang.startsWith("mr")) return "mr";
  if (lang.startsWith("ta")) return "ta";
  if (lang.startsWith("te")) return "te";
  return "en";
};

interface UIState {
  isSidebarOpen: boolean;
  language: Language;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (language: Language) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      language: "en",

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setLanguage: (language: Language) => {
        if (typeof document !== "undefined") {
          document.documentElement.lang = language;
          document.cookie = `ventureroot_locale=${language}; path=/; max-age=31536000; SameSite=Lax`;
        }
        set({ language });
      },
    }),
    {
      name: "ventureroot_ui_storage",
      onRehydrateStorage: () => (state) => {
        if (state?.language && typeof document !== "undefined") {
          document.documentElement.lang = state.language;
        }
      },
    }
  )
);

