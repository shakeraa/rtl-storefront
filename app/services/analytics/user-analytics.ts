/**
 * User Analytics - T0255 + T0256: Language Preferences & Geolocation
 * Tracks visitor language preferences and geolocation data.
 */

import type { LanguagePreference, GeolocationEntry } from "./types";

// In-memory tracking: shop -> locale -> { visitors, sources }
const preferenceStore = new Map<
  string,
  Map<string, { visitors: number; sources: Map<string, number> }>
>();

// In-memory geolocation: shop -> country -> GeolocationEntry
const geolocationStore = new Map<string, Map<string, GeolocationEntry>>();

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  EG: "Egypt",
  IL: "Israel",
  IR: "Iran",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  JP: "Japan",
  CN: "China",
  KR: "South Korea",
  BR: "Brazil",
  IN: "India",
  TR: "Turkey",
  RU: "Russia",
  CA: "Canada",
  AU: "Australia",
  MX: "Mexico",
  PK: "Pakistan",
  BD: "Bangladesh",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
  JO: "Jordan",
  LB: "Lebanon",
  MA: "Morocco",
  DZ: "Algeria",
};

/**
 * Track a visitor's language preference.
 */
export function trackLanguagePreference(
  shop: string,
  locale: string,
  source: "browser" | "cookie" | "url" | "geolocation",
): void {
  if (!preferenceStore.has(shop)) {
    preferenceStore.set(shop, new Map());
  }
  const shopPrefs = preferenceStore.get(shop)!;

  if (!shopPrefs.has(locale)) {
    shopPrefs.set(locale, { visitors: 0, sources: new Map() });
  }
  const localeData = shopPrefs.get(locale)!;
  localeData.visitors += 1;
  localeData.sources.set(
    source,
    (localeData.sources.get(source) || 0) + 1,
  );
}

/**
 * Get language preference breakdown for a shop.
 */
export function getLanguagePreferences(shop: string): LanguagePreference[] {
  const shopPrefs = preferenceStore.get(shop);
  if (!shopPrefs) return [];

  let totalVisitors = 0;
  for (const data of shopPrefs.values()) {
    totalVisitors += data.visitors;
  }

  if (totalVisitors === 0) return [];

  const results: LanguagePreference[] = [];

  for (const [locale, data] of shopPrefs.entries()) {
    // Find the dominant source for this locale
    let topSource: "browser" | "cookie" | "url" | "geolocation" = "browser";
    let topCount = 0;
    for (const [source, count] of data.sources.entries()) {
      if (count > topCount) {
        topCount = count;
        topSource = source as "browser" | "cookie" | "url" | "geolocation";
      }
    }

    results.push({
      locale,
      visitors: data.visitors,
      percentage: Math.round((data.visitors / totalVisitors) * 10000) / 100,
      source: topSource,
    });
  }

  return results.sort((a, b) => b.visitors - a.visitors);
}

/**
 * Track a visitor's geolocation.
 */
export function trackGeolocation(
  shop: string,
  country: string,
  locale: string,
): void {
  if (!geolocationStore.has(shop)) {
    geolocationStore.set(shop, new Map());
  }
  const shopGeo = geolocationStore.get(shop)!;

  const existing = shopGeo.get(country);
  if (existing) {
    existing.visitors += 1;
  } else {
    shopGeo.set(country, {
      country,
      countryName: COUNTRY_NAMES[country] || country,
      visitors: 1,
      preferredLocale: locale,
    });
  }
}

/**
 * Get geolocation breakdown for a shop.
 */
export function getGeolocationBreakdown(shop: string): GeolocationEntry[] {
  const shopGeo = geolocationStore.get(shop);
  if (!shopGeo) return [];

  return Array.from(shopGeo.values()).sort((a, b) => b.visitors - a.visitors);
}

/**
 * Get top countries by visitor count.
 */
export function getTopCountries(
  shop: string,
  limit: number = 10,
): GeolocationEntry[] {
  return getGeolocationBreakdown(shop).slice(0, limit);
}
