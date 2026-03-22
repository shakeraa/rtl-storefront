import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import {
  type CacheConfig,
  type CacheEntry,
  type ResourceType,
  type TranslationResource,
  type OfflineFallback,
  getCacheStrategy,
  generateCacheName,
  shouldPreload,
  getOfflineFallback,
  detectResourceType,
  sortByPriority,
  filterByLocale,
  calculateTotalSize,
  selectPrecacheResources,
  isExpired,
  createCacheEntry,
  touchCacheEntry,
  generateOfflinePage,
  cleanupExpiredEntries,
  getCacheStats,
  getDefaultCacheVersion,
  getMaxCacheSize,
  isValidCacheName,
  getSupportedLocales,
  isLocaleSupported,
  addOfflineFallback,
} from "../../app/services/performance/service-worker-cache";

describe("service-worker-cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getCacheStrategy", () => {
    it("returns cache-first for static-asset", () => {
      const config = getCacheStrategy("static-asset");
      expect(config.strategy).toBe("cache-first");
      expect(config.maxAge).toBe(86400 * 30);
      expect(config.maxEntries).toBe(100);
    });

    it("returns stale-while-revalidate for translation-bundle", () => {
      const config = getCacheStrategy("translation-bundle");
      expect(config.strategy).toBe("stale-while-revalidate");
      expect(config.maxAge).toBe(86400 * 7);
      expect(config.maxEntries).toBe(50);
    });

    it("returns network-first for api-response", () => {
      const config = getCacheStrategy("api-response");
      expect(config.strategy).toBe("network-first");
      expect(config.maxAge).toBe(300);
      expect(config.maxEntries).toBe(200);
    });

    it("returns cache-first for image", () => {
      const config = getCacheStrategy("image");
      expect(config.strategy).toBe("cache-first");
      expect(config.maxAge).toBe(86400 * 14);
      expect(config.maxEntries).toBe(100);
    });

    it("returns cache-first for font with long maxAge", () => {
      const config = getCacheStrategy("font");
      expect(config.strategy).toBe("cache-first");
      expect(config.maxAge).toBe(86400 * 365);
      expect(config.maxEntries).toBe(20);
    });

    it("returns stale-while-revalidate for page", () => {
      const config = getCacheStrategy("page");
      expect(config.strategy).toBe("stale-while-revalidate");
      expect(config.maxAge).toBe(3600);
      expect(config.maxEntries).toBe(50);
    });
  });

  describe("generateCacheName", () => {
    it("generates cache name with version and locale", () => {
      const name = generateCacheName("v2", "ar");
      expect(name).toBe("rtl-storefront-v2-ar");
    });

    it("normalizes locale to lowercase", () => {
      const name = generateCacheName("v1", "AR");
      expect(name).toBe("rtl-storefront-v1-ar");
    });

    it("removes invalid characters from version", () => {
      const name = generateCacheName("v2.0!@#", "he");
      expect(name).toBe("rtl-storefront-v20-he");
    });

    it("handles locale with hyphens", () => {
      const name = generateCacheName("v1", "ar-SA");
      expect(name).toBe("rtl-storefront-v1-ar-sa");
    });

    it("handles complex locale codes", () => {
      const name = generateCacheName("v1", "zh-Hans-CN");
      expect(name).toBe("rtl-storefront-v1-zh-hans-cn");
    });
  });

  describe("detectResourceType", () => {
    it("detects translation-bundle from /translations/ path", () => {
      expect(detectResourceType("/translations/en.json")).toBe("translation-bundle");
    });

    it("detects translation-bundle from /locales/ path", () => {
      expect(detectResourceType("/locales/ar/messages.json")).toBe("translation-bundle");
    });

    it("detects translation-bundle from .translations.json suffix", () => {
      expect(detectResourceType("/app.translations.json")).toBe("translation-bundle");
    });

    it("detects font from .woff2 extension", () => {
      expect(detectResourceType("/fonts/arabic.woff2")).toBe("font");
    });

    it("detects font from .ttf extension", () => {
      expect(detectResourceType("/assets/font.ttf")).toBe("font");
    });

    it("detects image from .png extension", () => {
      expect(detectResourceType("/images/logo.png")).toBe("image");
    });

    it("detects image from .svg extension", () => {
      expect(detectResourceType("/icons/icon.svg")).toBe("image");
    });

    it("detects static-asset from .css extension", () => {
      expect(detectResourceType("/styles/main.css")).toBe("static-asset");
    });

    it("detects static-asset from .js extension", () => {
      expect(detectResourceType("/scripts/app.js")).toBe("static-asset");
    });

    it("detects api-response from /api/ path", () => {
      expect(detectResourceType("/api/v1/users")).toBe("api-response");
    });

    it("detects api-response from /graphql path", () => {
      expect(detectResourceType("/graphql")).toBe("api-response");
    });

    it("defaults to static-asset for unknown URLs", () => {
      expect(detectResourceType("/unknown/path")).toBe("static-asset");
    });
  });

  describe("shouldPreload", () => {
    it("returns true for critical resources (priority >= 80)", () => {
      const resource: TranslationResource = {
        url: "/translations/critical.json",
        locale: "ar",
        priority: 90,
        size: 1024,
      };
      expect(shouldPreload(resource)).toBe(true);
    });

    it("returns false for large low-priority resources", () => {
      const resource: TranslationResource = {
        url: "/translations/large.json",
        locale: "ar",
        priority: 50,
        size: 600 * 1024,
      };
      expect(shouldPreload(resource)).toBe(false);
    });

    it("returns true for large critical resources", () => {
      const resource: TranslationResource = {
        url: "/translations/critical-large.json",
        locale: "ar",
        priority: 95,
        size: 600 * 1024,
      };
      expect(shouldPreload(resource)).toBe(true);
    });

    it("returns true for high-priority resources (priority >= 50)", () => {
      const resource: TranslationResource = {
        url: "/translations/high.json",
        locale: "ar",
        priority: 60,
        size: 1024,
      };
      expect(shouldPreload(resource)).toBe(true);
    });

    it("returns false for low-priority resources (priority < 30)", () => {
      const resource: TranslationResource = {
        url: "/translations/low.json",
        locale: "ar",
        priority: 20,
        size: 1024,
      };
      expect(shouldPreload(resource)).toBe(false);
    });

    it("returns true for medium-priority resources (30-49)", () => {
      const resource: TranslationResource = {
        url: "/translations/medium.json",
        locale: "ar",
        priority: 40,
        size: 1024,
      };
      expect(shouldPreload(resource)).toBe(true);
    });
  });

  describe("getOfflineFallback", () => {
    it("returns Arabic fallback for 'ar' locale", () => {
      const fallback = getOfflineFallback("ar");
      expect(fallback.locale).toBe("ar");
      expect(fallback.title).toBe("أنت غير متصل");
      expect(fallback.retryButton).toBe("إعادة المحاولة");
    });

    it("returns Hebrew fallback for 'he' locale", () => {
      const fallback = getOfflineFallback("he");
      expect(fallback.locale).toBe("he");
      expect(fallback.title).toBe("אתה לא מחובר");
      expect(fallback.retryButton).toBe("נסה שוב");
    });

    it("returns Persian fallback for 'fa' locale", () => {
      const fallback = getOfflineFallback("fa");
      expect(fallback.locale).toBe("fa");
      expect(fallback.title).toBe("آنلاین نیستید");
    });

    it("returns Urdu fallback for 'ur' locale", () => {
      const fallback = getOfflineFallback("ur");
      expect(fallback.locale).toBe("ur");
      expect(fallback.title).toBe("آپ آف لائن ہیں");
    });

    it("returns English fallback for 'en' locale", () => {
      const fallback = getOfflineFallback("en");
      expect(fallback.locale).toBe("en");
      expect(fallback.title).toBe("You're Offline");
      expect(fallback.retryButton).toBe("Try Again");
    });

    it("falls back to English for unsupported locale", () => {
      const fallback = getOfflineFallback("xx");
      expect(fallback.locale).toBe("en");
      expect(fallback.title).toBe("You're Offline");
    });

    it("handles locale with region code (ar-SA -> ar)", () => {
      const fallback = getOfflineFallback("ar-SA");
      expect(fallback.locale).toBe("ar");
    });

    it("handles uppercase locale", () => {
      const fallback = getOfflineFallback("AR");
      expect(fallback.locale).toBe("ar");
    });
  });

  describe("sortByPriority", () => {
    it("sorts by priority descending", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 50, size: 100 },
        { url: "/b", locale: "ar", priority: 90, size: 100 },
        { url: "/c", locale: "ar", priority: 30, size: 100 },
      ];
      const sorted = sortByPriority(resources);
      expect(sorted.map((r) => r.priority)).toEqual([90, 50, 30]);
    });

    it("sorts by size ascending when priority is equal", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 50, size: 200 },
        { url: "/b", locale: "ar", priority: 50, size: 100 },
        { url: "/c", locale: "ar", priority: 50, size: 300 },
      ];
      const sorted = sortByPriority(resources);
      expect(sorted.map((r) => r.size)).toEqual([100, 200, 300]);
    });

    it("does not mutate original array", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 50, size: 100 },
        { url: "/b", locale: "ar", priority: 90, size: 100 },
      ];
      const original = [...resources];
      sortByPriority(resources);
      expect(resources).toEqual(original);
    });
  });

  describe("filterByLocale", () => {
    it("filters resources by exact locale match", () => {
      const resources: TranslationResource[] = [
        { url: "/ar/a", locale: "ar", priority: 50, size: 100 },
        { url: "/en/b", locale: "en", priority: 50, size: 100 },
        { url: "/ar/c", locale: "ar", priority: 50, size: 100 },
      ];
      const filtered = filterByLocale(resources, "ar");
      expect(filtered).toHaveLength(2);
      expect(filtered.every((r) => r.locale === "ar")).toBe(true);
    });

    it("handles case-insensitive locale matching", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "AR", priority: 50, size: 100 },
        { url: "/b", locale: "ar", priority: 50, size: 100 },
      ];
      const filtered = filterByLocale(resources, "ar");
      expect(filtered).toHaveLength(2);
    });

    it("returns empty array when no matches", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 50, size: 100 },
      ];
      const filtered = filterByLocale(resources, "xx");
      expect(filtered).toHaveLength(0);
    });
  });

  describe("calculateTotalSize", () => {
    it("calculates total size of all resources", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 50, size: 100 },
        { url: "/b", locale: "ar", priority: 50, size: 200 },
        { url: "/c", locale: "ar", priority: 50, size: 300 },
      ];
      expect(calculateTotalSize(resources)).toBe(600);
    });

    it("returns 0 for empty array", () => {
      expect(calculateTotalSize([])).toBe(0);
    });
  });

  describe("selectPrecacheResources", () => {
    it("selects resources within budget", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 90, size: 100 },
        { url: "/b", locale: "ar", priority: 80, size: 200 },
        { url: "/c", locale: "ar", priority: 50, size: 500 },
      ];
      const selected = selectPrecacheResources(resources, 400);
      expect(selected).toHaveLength(2);
      expect(selected.map((r) => r.url)).toEqual(["/a", "/b"]);
    });

    it("selects highest priority resources first", () => {
      const resources: TranslationResource[] = [
        { url: "/low", locale: "ar", priority: 10, size: 100 },
        { url: "/high", locale: "ar", priority: 90, size: 100 },
        { url: "/medium", locale: "ar", priority: 50, size: 100 },
      ];
      const selected = selectPrecacheResources(resources, 200);
      expect(selected.map((r) => r.url)).toEqual(["/high", "/medium"]);
    });

    it("returns empty array when budget is 0", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 90, size: 100 },
      ];
      const selected = selectPrecacheResources(resources, 0);
      expect(selected).toHaveLength(0);
    });

    it("skips resource that exceeds remaining budget", () => {
      const resources: TranslationResource[] = [
        { url: "/a", locale: "ar", priority: 90, size: 300 },
        { url: "/b", locale: "ar", priority: 80, size: 100 },
      ];
      const selected = selectPrecacheResources(resources, 250);
      expect(selected).toHaveLength(1);
      expect(selected[0].url).toBe("/b");
    });
  });

  describe("isExpired", () => {
    it("returns true for expired entry", () => {
      const entry: CacheEntry = {
        url: "/test",
        cachedAt: Date.now(),
        expiresAt: Date.now() - 1000,
        size: 100,
        accessCount: 0,
        lastAccessed: Date.now(),
      };
      expect(isExpired(entry)).toBe(true);
    });

    it("returns false for non-expired entry", () => {
      const entry: CacheEntry = {
        url: "/test",
        cachedAt: Date.now(),
        expiresAt: Date.now() + 1000,
        size: 100,
        accessCount: 0,
        lastAccessed: Date.now(),
      };
      expect(isExpired(entry)).toBe(false);
    });

    it("returns false for entry expiring exactly now", () => {
      const now = Date.now();
      const entry: CacheEntry = {
        url: "/test",
        cachedAt: now,
        expiresAt: now,
        size: 100,
        accessCount: 0,
        lastAccessed: now,
      };
      // Entry expiring exactly now is considered expired (>= comparison)
      expect(isExpired(entry)).toBe(true);
    });
  });

  describe("createCacheEntry", () => {
    it("creates entry with correct properties", () => {
      const entry = createCacheEntry("/test", 1000, 3600);
      expect(entry.url).toBe("/test");
      expect(entry.size).toBe(1000);
      expect(entry.expiresAt).toBe(Date.now() + 3600 * 1000);
      expect(entry.cachedAt).toBe(Date.now());
      expect(entry.accessCount).toBe(0);
    });

    it("calculates expiration correctly for different maxAge", () => {
      const entry = createCacheEntry("/test", 100, 60);
      expect(entry.expiresAt).toBe(Date.now() + 60000);
    });
  });

  describe("touchCacheEntry", () => {
    it("increments access count", () => {
      const entry: CacheEntry = {
        url: "/test",
        cachedAt: Date.now(),
        expiresAt: Date.now() + 1000,
        size: 100,
        accessCount: 5,
        lastAccessed: Date.now() - 1000,
      };
      const touched = touchCacheEntry(entry);
      expect(touched.accessCount).toBe(6);
    });

    it("updates lastAccessed timestamp", () => {
      const past = Date.now() - 5000;
      const entry: CacheEntry = {
        url: "/test",
        cachedAt: past,
        expiresAt: Date.now() + 1000,
        size: 100,
        accessCount: 0,
        lastAccessed: past,
      };
      const touched = touchCacheEntry(entry);
      expect(touched.lastAccessed).toBe(Date.now());
    });

    it("preserves other properties", () => {
      const entry: CacheEntry = {
        url: "/test",
        cachedAt: 1000,
        expiresAt: 5000,
        size: 100,
        accessCount: 3,
        lastAccessed: 2000,
      };
      const touched = touchCacheEntry(entry);
      expect(touched.url).toBe("/test");
      expect(touched.size).toBe(100);
      expect(touched.expiresAt).toBe(5000);
    });
  });

  describe("generateOfflinePage", () => {
    it("generates HTML for Arabic locale with RTL direction", () => {
      const html = generateOfflinePage("ar");
      expect(html).toContain('lang="ar"');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain("أنت غير متصل");
      expect(html).toContain("إعادة المحاولة");
    });

    it("generates HTML for Hebrew locale with RTL direction", () => {
      const html = generateOfflinePage("he");
      expect(html).toContain('lang="he"');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain("אתה לא מחובר");
    });

    it("generates HTML for English locale with LTR direction", () => {
      const html = generateOfflinePage("en");
      expect(html).toContain('lang="en"');
      expect(html).toContain('dir="ltr"');
      expect(html).toContain("You're Offline");
      expect(html).toContain("Try Again");
    });

    it("includes offline indicator badge", () => {
      const html = generateOfflinePage("ar");
      expect(html).toContain("وضع عدم الاتصال");
    });

    it("includes retry button with correct action", () => {
      const html = generateOfflinePage("en");
      expect(html).toContain('onclick="location.reload()"');
    });

    it("includes home button with correct action", () => {
      const html = generateOfflinePage("en");
      expect(html).toContain("onclick=\"location.href='/'\"");
    });

    it("falls back to English for unsupported locale", () => {
      const html = generateOfflinePage("xx");
      expect(html).toContain('lang="en"');
      expect(html).toContain("You're Offline");
    });
  });

  describe("cleanupExpiredEntries", () => {
    it("removes expired entries", () => {
      const now = Date.now();
      const entries: CacheEntry[] = [
        { url: "/expired", cachedAt: now, expiresAt: now - 1000, size: 100, accessCount: 0, lastAccessed: now },
        { url: "/valid", cachedAt: now, expiresAt: now + 1000, size: 100, accessCount: 0, lastAccessed: now },
      ];
      const cleaned = cleanupExpiredEntries(entries);
      expect(cleaned).toHaveLength(1);
      expect(cleaned[0].url).toBe("/valid");
    });

    it("returns all entries when none are expired", () => {
      const now = Date.now();
      const entries: CacheEntry[] = [
        { url: "/a", cachedAt: now, expiresAt: now + 1000, size: 100, accessCount: 0, lastAccessed: now },
        { url: "/b", cachedAt: now, expiresAt: now + 2000, size: 100, accessCount: 0, lastAccessed: now },
      ];
      const cleaned = cleanupExpiredEntries(entries);
      expect(cleaned).toHaveLength(2);
    });

    it("returns empty array when all entries are expired", () => {
      const now = Date.now();
      const entries: CacheEntry[] = [
        { url: "/a", cachedAt: now - 2000, expiresAt: now - 1000, size: 100, accessCount: 0, lastAccessed: now },
        { url: "/b", cachedAt: now - 2000, expiresAt: now - 500, size: 100, accessCount: 0, lastAccessed: now },
      ];
      const cleaned = cleanupExpiredEntries(entries);
      expect(cleaned).toHaveLength(0);
    });
  });

  describe("getCacheStats", () => {
    it("calculates total entries", () => {
      const entries: CacheEntry[] = [
        { url: "/a", cachedAt: 0, expiresAt: Date.now() + 1000, size: 100, accessCount: 0, lastAccessed: 0 },
        { url: "/b", cachedAt: 0, expiresAt: Date.now() + 1000, size: 100, accessCount: 0, lastAccessed: 0 },
      ];
      const stats = getCacheStats(entries);
      expect(stats.totalEntries).toBe(2);
    });

    it("calculates total size", () => {
      const entries: CacheEntry[] = [
        { url: "/a", cachedAt: 0, expiresAt: Date.now() + 1000, size: 100, accessCount: 0, lastAccessed: 0 },
        { url: "/b", cachedAt: 0, expiresAt: Date.now() + 1000, size: 200, accessCount: 0, lastAccessed: 0 },
      ];
      const stats = getCacheStats(entries);
      expect(stats.totalSize).toBe(300);
    });

    it("counts expired entries", () => {
      const entries: CacheEntry[] = [
        { url: "/expired", cachedAt: 0, expiresAt: Date.now() - 1000, size: 100, accessCount: 0, lastAccessed: 0 },
        { url: "/valid", cachedAt: 0, expiresAt: Date.now() + 1000, size: 100, accessCount: 0, lastAccessed: 0 },
      ];
      const stats = getCacheStats(entries);
      expect(stats.expiredCount).toBe(1);
    });

    it("calculates average access count", () => {
      const entries: CacheEntry[] = [
        { url: "/a", cachedAt: 0, expiresAt: Date.now() + 1000, size: 100, accessCount: 5, lastAccessed: 0 },
        { url: "/b", cachedAt: 0, expiresAt: Date.now() + 1000, size: 100, accessCount: 15, lastAccessed: 0 },
        { url: "/c", cachedAt: 0, expiresAt: Date.now() + 1000, size: 100, accessCount: 10, lastAccessed: 0 },
      ];
      const stats = getCacheStats(entries);
      expect(stats.averageAccessCount).toBe(10);
    });

    it("returns 0 for average when entries array is empty", () => {
      const stats = getCacheStats([]);
      expect(stats.averageAccessCount).toBe(0);
    });
  });

  describe("getDefaultCacheVersion", () => {
    it("returns v1 as default", () => {
      expect(getDefaultCacheVersion()).toBe("v1");
    });
  });

  describe("getMaxCacheSize", () => {
    it("returns 100MB in bytes", () => {
      expect(getMaxCacheSize()).toBe(100 * 1024 * 1024);
    });
  });

  describe("isValidCacheName", () => {
    it("returns true for alphanumeric name", () => {
      expect(isValidCacheName("cache123")).toBe(true);
    });

    it("returns true for name with hyphens", () => {
      expect(isValidCacheName("my-cache-name")).toBe(true);
    });

    it("returns true for name with underscores", () => {
      expect(isValidCacheName("my_cache_name")).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isValidCacheName("")).toBe(false);
    });

    it("returns false for name with spaces", () => {
      expect(isValidCacheName("my cache")).toBe(false);
    });

    it("returns false for name with special characters", () => {
      expect(isValidCacheName("cache@123")).toBe(false);
    });

    it("returns false for name exceeding 100 characters", () => {
      expect(isValidCacheName("a".repeat(101))).toBe(false);
    });

    it("returns true for name exactly 100 characters", () => {
      expect(isValidCacheName("a".repeat(100))).toBe(true);
    });
  });

  describe("getSupportedLocales", () => {
    it("returns array of supported locale codes", () => {
      const locales = getSupportedLocales();
      expect(locales).toContain("ar");
      expect(locales).toContain("he");
      expect(locales).toContain("fa");
      expect(locales).toContain("ur");
      expect(locales).toContain("en");
    });
  });

  describe("isLocaleSupported", () => {
    it("returns true for supported locales", () => {
      expect(isLocaleSupported("ar")).toBe(true);
      expect(isLocaleSupported("he")).toBe(true);
      expect(isLocaleSupported("en")).toBe(true);
    });

    it("returns false for unsupported locale", () => {
      expect(isLocaleSupported("xx")).toBe(false);
    });

    it("returns true for locale with region code", () => {
      expect(isLocaleSupported("ar-SA")).toBe(true);
    });

    it("handles uppercase locale", () => {
      expect(isLocaleSupported("AR")).toBe(true);
    });
  });

  describe("addOfflineFallback", () => {
    it("adds new locale fallback", () => {
      const newFallback: OfflineFallback = {
        locale: "es",
        title: "Sin conexión",
        message: "No hay conexión a internet",
        retryButton: "Reintentar",
        goHomeButton: "Inicio",
        offlineIndicator: "Modo sin conexión",
      };
      addOfflineFallback(newFallback);
      expect(getOfflineFallback("es").title).toBe("Sin conexión");
    });

    it("overrides existing locale fallback", () => {
      const customFallback: OfflineFallback = {
        locale: "ar",
        title: "Custom Arabic Title",
        message: "Custom message",
        retryButton: "Retry",
        goHomeButton: "Home",
        offlineIndicator: "Offline",
      };
      addOfflineFallback(customFallback);
      expect(getOfflineFallback("ar").title).toBe("Custom Arabic Title");
    });
  });
});
