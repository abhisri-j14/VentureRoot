import { create } from "zustand";

export type Language = "en" | "bn" | "hi";

interface UIState {
  isSidebarOpen: boolean;
  language: Language;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (language: Language) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  language: "en",

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setLanguage: (language) => set({ language }),
}));
