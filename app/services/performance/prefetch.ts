/**
 * T0154 — Translation prefetching service
 *
 * Determines which locale translations to prefetch based on popularity,
 * connection quality, and user preferences.
 */

/** Popular RTL locales ordered by global usage */
const POPULAR_RTL_LOCALES = ["ar", "he", "fa", "ur", "ps", "ku", "sd"];

/** Popular LTR locales ordered by global usage */
const POPULAR_LTR_LOCALES = ["en", "es", "fr", "de", "pt", "ja", "zh", "ko", "it", "nl"];

export interface PrefetchConfig {
  /** Maximum number of locales to prefetch ahead of time */
  maxPrefetchLocales: number;
  /** Whether to defer prefetching until the browser is idle */
  prefetchOnIdle: boolean;
  /** Network priority for prefetch requests */
  priority: "high" | "low";
}

const DEFAULT_CONFIG: PrefetchConfig = {
  maxPrefetchLocales: 3,
  prefetchOnIdle: true,
  priority: "low",
};

/**
 * Return the top locales to prefetch, excluding the current locale.
 * Prefers popular RTL languages first, then popular LTR languages.
 */
export function getPrefetchLocales(
  currentLocale: string,
  availableLocales: string[],
  config: PrefetchConfig = DEFAULT_CONFIG,
): string[] {
  const normalised = currentLocale.toLowerCase().split("-")[0];
  const available = new Set(availableLocales.map((l) => l.toLowerCase()));
  available.delete(normalised);

  const ranked = [...POPULAR_RTL_LOCALES, ...POPULAR_LTR_LOCALES].filter((l) =>
    available.has(l),
  );

  // Append any remaining available locales not already ranked
  for (const locale of available) {
    if (!ranked.includes(locale)) {
      ranked.push(locale);
    }
  }

  return ranked.slice(0, config.maxPrefetchLocales);
}

export interface PrefetchPlanEntry {
  page: string;
  locale: string;
  priority: number;
}

/**
 * Build a prioritised prefetch plan for the given pages and locales.
 * RTL locales receive a priority boost. Entries are sorted descending by priority.
 */
export function createPrefetchPlan(
  pages: string[],
  locales: string[],
): PrefetchPlanEntry[] {
  const rtlSet = new Set(POPULAR_RTL_LOCALES);
  const entries: PrefetchPlanEntry[] = [];

  for (const locale of locales) {
    const base = locale.toLowerCase().split("-")[0];
    const isRTL = rtlSet.has(base);

    for (let i = 0; i < pages.length; i++) {
      // Higher priority for earlier pages and RTL locales
      const pagePriority = pages.length - i;
      const rtlBoost = isRTL ? 10 : 0;
      entries.push({
        page: pages[i],
        locale,
        priority: pagePriority + rtlBoost,
      });
    }
  }

  return entries.sort((a, b) => b.priority - a.priority);
}

export interface ConnectionInfo {
  /** User opted in to reduced data usage */
  saveData?: boolean;
  /** Effective connection type (e.g. "4g", "3g", "2g", "slow-2g") */
  effectiveType?: string;
}

const SLOW_CONNECTIONS = new Set(["slow-2g", "2g"]);

/**
 * Determine whether prefetching should proceed given the current connection.
 * Respects the Save-Data header and avoids prefetching on very slow connections.
 */
export function shouldPrefetch(connection: ConnectionInfo): boolean {
  if (connection.saveData) {
    return false;
  }
  if (connection.effectiveType && SLOW_CONNECTIONS.has(connection.effectiveType)) {
    return false;
  }
  return true;
}
