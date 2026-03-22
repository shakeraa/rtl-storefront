/**
 * T0176 — Service Worker Caching
 *
 * Service worker cache strategies for translation resources with
 * offline support, precaching, and locale-aware fallback content.
 */

/** Cache strategy types supported by the service worker */
export type CacheStrategyType = "cache-first" | "network-first" | "stale-while-revalidate";

/** Resource types that determine caching behavior */
export type ResourceType =
  | "translation-bundle"
  | "static-asset"
  | "api-response"
  | "image"
  | "font"
  | "page";

/** Cache configuration for a resource type */
export interface CacheConfig {
  strategy: CacheStrategyType;
  maxAge: number; // seconds
  maxEntries: number;
}

/** Translation resource for precaching */
export interface TranslationResource {
  url: string;
  locale: string;
  priority: number;
  size: number; // bytes
}

/** Cache entry metadata */
export interface CacheEntry {
  url: string;
  cachedAt: number;
  expiresAt: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

/** Offline fallback content for a locale */
export interface OfflineFallback {
  locale: string;
  title: string;
  message: string;
  retryButton: string;
  goHomeButton: string;
  offlineIndicator: string;
}

/** Default cache configurations by resource type */
const CACHE_CONFIGS: Record<ResourceType, CacheConfig> = {
  "translation-bundle": {
    strategy: "stale-while-revalidate",
    maxAge: 86400 * 7, // 7 days
    maxEntries: 50,
  },
  "static-asset": {
    strategy: "cache-first",
    maxAge: 86400 * 30, // 30 days
    maxEntries: 100,
  },
  "api-response": {
    strategy: "network-first",
    maxAge: 300, // 5 minutes
    maxEntries: 200,
  },
  image: {
    strategy: "cache-first",
    maxAge: 86400 * 14, // 14 days
    maxEntries: 100,
  },
  font: {
    strategy: "cache-first",
    maxAge: 86400 * 365, // 1 year
    maxEntries: 20,
  },
  page: {
    strategy: "stale-while-revalidate",
    maxAge: 3600, // 1 hour
    maxEntries: 50,
  },
};

/** Patterns for detecting resource types from URLs */
const RESOURCE_PATTERNS: { type: ResourceType; patterns: RegExp[] }[] = [
  {
    type: "translation-bundle",
    patterns: [
      /\/translations\//i,
      /\/locales\//i,
      /\/i18n\//i,
      /\.translations\.json$/i,
      /_translations\.json$/i,
    ],
  },
  {
    type: "font",
    patterns: [/\.woff2?$/i, /\.ttf$/i, /\.otf$/i, /\.eot$/i, /\/fonts\//i],
  },
  {
    type: "image",
    patterns: [/\.(png|jpg|jpeg|gif|webp|svg|avif)$/i, /\/images\//i],
  },
  {
    type: "static-asset",
    patterns: [/\.(css|js)$/i, /\/assets\//i, /\/static\//i],
  },
  {
    type: "api-response",
    patterns: [/\/api\//i, /\/graphql/i, /\/rest\//i],
  },
];

/** Offline fallback translations by locale */
const OFFLINE_FALLBACKS: Record<string, OfflineFallback> = {
  ar: {
    locale: "ar",
    title: "أنت غير متصل",
    message: "يبدو أنك غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.",
    retryButton: "إعادة المحاولة",
    goHomeButton: "العودة للرئيسية",
    offlineIndicator: "وضع عدم الاتصال",
  },
  he: {
    locale: "he",
    title: "אתה לא מחובר",
    message: "נראה שאתה לא מחובר לאינטרנט. אנא בדוק את החיבור שלך ונסה שוב.",
    retryButton: "נסה שוב",
    goHomeButton: "חזור לדף הבית",
    offlineIndicator: "מצב לא מקוון",
  },
  fa: {
    locale: "fa",
    title: "آنلاین نیستید",
    message: "به نظر می‌رسد به اینترنت متصل نیستید. لطفاً اتصال خود را بررسی کرده و دوباره تلاش کنید.",
    retryButton: "تلاش مجدد",
    goHomeButton: "بازگشت به صفحه اصلی",
    offlineIndicator: "حالت آفلاین",
  },
  ur: {
    locale: "ur",
    title: "آپ آف لائن ہیں",
    message: "ایسا لگتا ہے کہ آپ انٹرنیٹ سے منسلک نہیں ہیں۔ براہ کرم اپنے کنکشن کی جانچ کریں اور دوبارہ کوشش کریں۔",
    retryButton: "دوبارہ کوشش کریں",
    goHomeButton: "ہوم پر واپس جائیں",
    offlineIndicator: "آف لائن موڈ",
  },
  en: {
    locale: "en",
    title: "You're Offline",
    message: "It seems you're not connected to the internet. Please check your connection and try again.",
    retryButton: "Try Again",
    goHomeButton: "Go Home",
    offlineIndicator: "Offline Mode",
  },
};

/** Maximum cache size in bytes (100 MB) */
const MAX_CACHE_SIZE = 100 * 1024 * 1024;

/** Default cache version */
const DEFAULT_CACHE_VERSION = "v1";

/**
 * Get the appropriate cache strategy for a resource type.
 *
 * @param resourceType - Type of resource to cache
 * @returns Cache configuration for the resource type
 */
export function getCacheStrategy(resourceType: ResourceType): CacheConfig {
  return CACHE_CONFIGS[resourceType] ?? CACHE_CONFIGS["static-asset"];
}

/**
 * Generate a versioned cache name for a locale.
 *
 * @param version - Cache version string
 * @param locale - Locale code
 * @returns Formatted cache name
 */
export function generateCacheName(version: string, locale: string): string {
  const sanitizedVersion = version.replace(/[^a-zA-Z0-9_-]/g, "");
  const sanitizedLocale = locale.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return `rtl-storefront-${sanitizedVersion}-${sanitizedLocale}`;
}

/**
 * Detect resource type from URL.
 *
 * @param url - Resource URL
 * @returns Detected resource type
 */
export function detectResourceType(url: string): ResourceType {
  for (const { type, patterns } of RESOURCE_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(url))) {
      return type;
    }
  }
  return "static-asset";
}

/**
 * Determine if a resource should be preloaded.
 * Preloading is prioritized for translation bundles and critical assets.
 *
 * @param resource - Translation resource to evaluate
 * @returns True if the resource should be preloaded
 */
export function shouldPreload(resource: TranslationResource): boolean {
  // Always preload critical translation bundles (priority >= 80)
  if (resource.priority >= 80) {
    return true;
  }

  // Skip large resources (> 500KB) unless they're critical
  if (resource.size > 500 * 1024 && resource.priority < 90) {
    return false;
  }

  // Preload high-priority resources (priority >= 50)
  if (resource.priority >= 50) {
    return true;
  }

  // Skip low-priority resources in data-saving scenarios
  if (resource.priority < 30) {
    return false;
  }

  // Default: preload medium-priority resources
  return true;
}

/**
 * Get offline fallback content for a locale.
 * Falls back to English if the locale is not supported.
 *
 * @param locale - Locale code
 * @returns Offline fallback content
 */
export function getOfflineFallback(locale: string): OfflineFallback {
  const normalizedLocale = locale.toLowerCase().split("-")[0];
  return (
    OFFLINE_FALLBACKS[normalizedLocale] ??
    OFFLINE_FALLBACKS[locale.toLowerCase()] ??
    OFFLINE_FALLBACKS.en
  );
}

/**
 * Get the default cache version.
 *
 * @returns Default cache version string
 */
export function getDefaultCacheVersion(): string {
  return DEFAULT_CACHE_VERSION;
}

/**
 * Get the maximum cache size in bytes.
 *
 * @returns Maximum cache size
 */
export function getMaxCacheSize(): number {
  return MAX_CACHE_SIZE;
}

/**
 * Sort resources by preload priority (highest first).
 *
 * @param resources - Array of translation resources
 * @returns Sorted array
 */
export function sortByPriority(resources: TranslationResource[]): TranslationResource[] {
  return [...resources].sort((a, b) => {
    // Sort by priority descending
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    // Then by size ascending (smaller files first)
    return a.size - b.size;
  });
}

/**
 * Filter resources by locale.
 *
 * @param resources - Array of translation resources
 * @param locale - Locale to filter by
 * @returns Filtered array
 */
export function filterByLocale(
  resources: TranslationResource[],
  locale: string,
): TranslationResource[] {
  const normalizedLocale = locale.toLowerCase();
  return resources.filter((r) => r.locale.toLowerCase() === normalizedLocale);
}

/**
 * Calculate total size of resources.
 *
 * @param resources - Array of translation resources
 * @returns Total size in bytes
 */
export function calculateTotalSize(resources: TranslationResource[]): number {
  return resources.reduce((sum, r) => sum + r.size, 0);
}

/**
 * Select resources to precache within size budget.
 *
 * @param resources - Available translation resources
 * @param budget - Size budget in bytes
 * @returns Selected resources within budget
 */
export function selectPrecacheResources(
  resources: TranslationResource[],
  budget: number,
): TranslationResource[] {
  const sorted = sortByPriority(resources);
  const selected: TranslationResource[] = [];
  let usedBudget = 0;

  for (const resource of sorted) {
    if (usedBudget + resource.size <= budget) {
      selected.push(resource);
      usedBudget += resource.size;
    }
  }

  return selected;
}

/**
 * Check if a cached entry is expired.
 *
 * @param entry - Cache entry to check
 * @returns True if the entry is expired
 */
export function isExpired(entry: CacheEntry): boolean {
  return Date.now() >= entry.expiresAt;
}

/**
 * Create a cache entry with metadata.
 *
 * @param url - Resource URL
 * @param size - Resource size in bytes
 * @param maxAge - Maximum age in seconds
 * @returns Cache entry
 */
export function createCacheEntry(url: string, size: number, maxAge: number): CacheEntry {
  const now = Date.now();
  return {
    url,
    cachedAt: now,
    expiresAt: now + maxAge * 1000,
    size,
    accessCount: 0,
    lastAccessed: now,
  };
}

/**
 * Update cache entry access metadata.
 *
 * @param entry - Cache entry to update
 * @returns Updated cache entry
 */
export function touchCacheEntry(entry: CacheEntry): CacheEntry {
  return {
    ...entry,
    accessCount: entry.accessCount + 1,
    lastAccessed: Date.now(),
  };
}

/**
 * Generate an HTML offline page for a locale.
 *
 * @param locale - Locale code
 * @returns HTML string for offline page
 */
export function generateOfflinePage(locale: string): string {
  const fallback = getOfflineFallback(locale);
  const isRtl = ["ar", "he", "fa", "ur"].includes(fallback.locale);
  const dir = isRtl ? "rtl" : "ltr";

  return `<!DOCTYPE html>
<html lang="${fallback.locale}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fallback.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 480px;
      text-align: center;
      background: white;
      padding: 48px 32px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      font-size: 24px;
      color: #1a1a1a;
      margin-bottom: 12px;
      font-weight: 600;
    }
    p {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .buttons {
      display: flex;
      gap: 12px;
      flex-direction: ${isRtl ? "row-reverse" : "row"};
      justify-content: center;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .retry {
      background: #008060;
      color: white;
    }
    .retry:hover {
      background: #007050;
    }
    .home {
      background: #f0f0f0;
      color: #333;
    }
    .home:hover {
      background: #e0e0e0;
    }
    .offline-badge {
      position: fixed;
      top: 16px;
      ${isRtl ? "right" : "left"}: 16px;
      background: #ff6b6b;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="offline-badge">${fallback.offlineIndicator}</div>
  <div class="container">
    <div class="icon">📡</div>
    <h1>${fallback.title}</h1>
    <p>${fallback.message}</p>
    <div class="buttons">
      <button class="retry" onclick="location.reload()">${fallback.retryButton}</button>
      <button class="home" onclick="location.href='/'">${fallback.goHomeButton}</button>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Clean up expired cache entries.
 *
 * @param entries - Array of cache entries
 * @returns Non-expired entries
 */
export function cleanupExpiredEntries(entries: CacheEntry[]): CacheEntry[] {
  const now = Date.now();
  return entries.filter((entry) => entry.expiresAt > now);
}

/**
 * Get cache statistics.
 *
 * @param entries - Array of cache entries
 * @returns Cache statistics
 */
export function getCacheStats(entries: CacheEntry[]): {
  totalEntries: number;
  totalSize: number;
  expiredCount: number;
  averageAccessCount: number;
} {
  const now = Date.now();
  const expiredCount = entries.filter((e) => e.expiresAt <= now).length;
  const totalAccessCount = entries.reduce((sum, e) => sum + e.accessCount, 0);

  return {
    totalEntries: entries.length,
    totalSize: entries.reduce((sum, e) => sum + e.size, 0),
    expiredCount,
    averageAccessCount: entries.length > 0 ? totalAccessCount / entries.length : 0,
  };
}

/**
 * Validate a cache name.
 *
 * @param name - Cache name to validate
 * @returns True if the name is valid
 */
export function isValidCacheName(name: string): boolean {
  // Cache names should be alphanumeric with hyphens and underscores
  return /^[a-zA-Z0-9_-]+$/.test(name) && name.length > 0 && name.length <= 100;
}

/**
 * Get supported locales for offline fallback.
 *
 * @returns Array of supported locale codes
 */
export function getSupportedLocales(): string[] {
  return Object.keys(OFFLINE_FALLBACKS);
}

/**
 * Check if a locale is supported for offline fallback.
 *
 * @param locale - Locale code to check
 * @returns True if the locale is supported
 */
export function isLocaleSupported(locale: string): boolean {
  const normalizedLocale = locale.toLowerCase().split("-")[0];
  return (
    normalizedLocale in OFFLINE_FALLBACKS ||
    locale.toLowerCase() in OFFLINE_FALLBACKS
  );
}

/**
 * Add a custom offline fallback for a locale.
 *
 * @param fallback - Offline fallback content
 */
export function addOfflineFallback(fallback: OfflineFallback): void {
  OFFLINE_FALLBACKS[fallback.locale.toLowerCase()] = fallback;
}
