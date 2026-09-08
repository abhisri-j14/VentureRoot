import enDict from "@/locales/en.json";
import bnDict from "@/locales/bn.json";
import hiDict from "@/locales/hi.json";
import paDict from "@/locales/pa.json";
import mrDict from "@/locales/mr.json";
import taDict from "@/locales/ta.json";
import teDict from "@/locales/te.json";

export type SupportedLanguage = "en" | "bn" | "hi" | "pa" | "mr" | "ta" | "te";

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: enDict as Record<string, string>,
  bn: bnDict as Record<string, string>,
  hi: hiDict as Record<string, string>,
  pa: paDict as Record<string, string>,
  mr: mrDict as Record<string, string>,
  ta: taDict as Record<string, string>,
  te: teDict as Record<string, string>,
};
