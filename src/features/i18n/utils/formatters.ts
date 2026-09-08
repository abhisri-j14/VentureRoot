import { Language } from "@/stores/useUIStore";

export const LOCALE_MAP: Record<Language, string> = {
  en: "en-IN",
  bn: "bn-IN",
  hi: "hi-IN",
};

/**
 * Formats a monetary amount into localized currency (defaults to INR)
 * e.g., ₹1,50,000 or $150,000
 */
export function formatCurrency(
  amount: number,
  language: Language = "en",
  currency: string = "INR"
): string {
  try {
    const locale = LOCALE_MAP[language] || "en-IN";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString()}`;
  }
}

/**
 * Formats numbers according to locale conventions
 */
export function formatNumber(
  value: number,
  language: Language = "en",
  options?: Intl.NumberFormatOptions
): string {
  try {
    const locale = LOCALE_MAP[language] || "en-IN";
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return value.toLocaleString();
  }
}

/**
 * Formats date to localized string
 */
export function formatDate(
  date: Date | string | number,
  language: Language = "en",
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const locale = LOCALE_MAP[language] || "en-IN";
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
  } catch {
    return String(date);
  }
}
