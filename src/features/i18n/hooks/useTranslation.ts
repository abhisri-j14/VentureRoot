import { useUIStore } from "@/stores/useUIStore";
import { translations, SupportedLanguage } from "../translations";

export type TranslationKey = keyof typeof translations.en;

export const useTranslation = () => {
  const language = useUIStore((state) => state.language) as SupportedLanguage;

  const t = (key: TranslationKey): string => {
    // Graceful fallback: If current language missing key, fallback to English. If English missing, return raw key.
    const currentDict = translations[language];
    const enDict = translations.en;
    
    return (currentDict as any)[key] || enDict[key] || key;
  };

  return { t, language };
};
