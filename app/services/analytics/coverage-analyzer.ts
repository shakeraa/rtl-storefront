/**
 * Coverage Analyzer - T0252: Translation Coverage by Language
 * Analyzes translation coverage across locales and tracks coverage history.
 */

import type { CoverageByLanguage } from "./types";

// In-memory coverage history storage: shop -> locale -> daily snapshots
const coverageHistory = new Map<
  string,
  Map<string, Array<{ date: string; percent: number }>>
>();

const LOCALE_NAMES: Record<string, string> = {
  ar: "Arabic",
  he: "Hebrew",
  fa: "Persian",
  ur: "Urdu",
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  pt: "Portuguese",
  it: "Italian",
  ru: "Russian",
  tr: "Turkish",
  nl: "Dutch",
  pl: "Polish",
  sv: "Swedish",
  da: "Danish",
  fi: "Finnish",
  nb: "Norwegian",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  ms: "Malay",
  hi: "Hindi",
  bn: "Bengali",
};

/**
 * Analyze translation coverage for each locale.
 * In production, totalResources and translatedResources would come from Shopify API.
 * This returns a structured result with mock resource counts.
 */
export function analyzeCoverageByLanguage(
  shop: string,
  locales: string[],
): CoverageByLanguage[] {
  return locales.map((locale) => {
    const history = getCoverageHistory(shop, locale, 7);
    const trend = determineTrend(history.map((h) => h.percent));

    return {
      locale,
      localeName: LOCALE_NAMES[locale] || locale,
      totalResources: 0,
      translatedResources: 0,
      coveragePercent: 0,
      trend,
    };
  });
}

/**
 * Get coverage history for a specific locale over a number of days.
 */
export function getCoverageHistory(
  shop: string,
  locale: string,
  days: number,
): Array<{ date: string; percent: number }> {
  const shopHistory = coverageHistory.get(shop);
  if (!shopHistory) return [];

  const localeHistory = shopHistory.get(locale);
  if (!localeHistory) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  return localeHistory.filter((entry) => entry.date >= cutoffStr);
}

/**
 * Record a coverage snapshot for a locale.
 */
export function recordCoverageSnapshot(
  shop: string,
  locale: string,
  percent: number,
): void {
  if (!coverageHistory.has(shop)) {
    coverageHistory.set(shop, new Map());
  }
  const shopHistory = coverageHistory.get(shop)!;

  if (!shopHistory.has(locale)) {
    shopHistory.set(locale, []);
  }
  const localeHistory = shopHistory.get(locale)!;

  const today = new Date().toISOString().split("T")[0];

  // Update today's entry or add new one
  const existingIndex = localeHistory.findIndex((e) => e.date === today);
  if (existingIndex >= 0) {
    localeHistory[existingIndex].percent = percent;
  } else {
    localeHistory.push({ date: today, percent });
  }

  // Keep only last 365 days of history
  if (localeHistory.length > 365) {
    localeHistory.splice(0, localeHistory.length - 365);
  }
}

function determineTrend(
  values: number[],
): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";

  const recent = values.slice(-3);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const diff = last - first;

  if (diff > 1) return "up";
  if (diff < -1) return "down";
  return "stable";
}
