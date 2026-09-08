import enDict from "@/locales/en.json";
import bnDict from "@/locales/bn.json";
import hiDict from "@/locales/hi.json";

export type SupportedLanguage = "en" | "bn" | "hi";

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: enDict as Record<string, string>,
  bn: bnDict as Record<string, string>,
  hi: hiDict as Record<string, string>,
};
