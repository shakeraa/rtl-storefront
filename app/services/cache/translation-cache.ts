import { createHash } from "node:crypto";
import type { CacheMetrics, CacheStore } from "./types";

const DEFAULT_TTL_SECONDS = 7 * 24 * 3600; // 1 week

function hashKey(sourceLocale: string, targetLocale: string, sourceText: string): string {
  return createHash("sha256")
    .update(`${sourceLocale}:${targetLocale}:${sourceText}`)
    .digest("hex");
}

function translationKey(sourceLocale: string, targetLocale: string, sourceText: string): string {
  const hash = hashKey(sourceLocale, targetLocale, sourceText);
  return `translation:${sourceLocale}:${targetLocale}:${hash}`;
}

function localePattern(locale: string): string {
  return `translation:${locale}:`;
}

/**
 * Translation-specific cache layer built on top of a generic CacheStore.
 * Uses SHA-256 hashing for cache keys, matching the existing translation engine pattern.
 */
export class TranslationCache {
  private metrics: Omit<CacheMetrics, "hitRate"> = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  /**
   * Track locale keys for invalidation.
   * Maps locale string to a set of full cache keys.
   */
  private readonly localeKeyIndex = new Map<string, Set<string>>();

  constructor(
    private readonly store: CacheStore,
    private readonly defaultTtlSeconds: number = DEFAULT_TTL_SECONDS,
  ) {}

  private trackLocaleKey(sourceLocale: string, targetLocale: string, key: string): void {
    for (const locale of [sourceLocale, targetLocale]) {
      let keys = this.localeKeyIndex.get(locale);
      if (!keys) {
        keys = new Set();
        this.localeKeyIndex.set(locale, keys);
      }
      keys.add(key);
    }
  }

  async cacheTranslation(
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
    translatedText: string,
    ttl?: number,
  ): Promise<void> {
    const key = translationKey(sourceLocale, targetLocale, sourceText);
    await this.store.set(key, translatedText, ttl ?? this.defaultTtlSeconds);
    this.trackLocaleKey(sourceLocale, targetLocale, key);
    this.metrics.sets++;
  }

  async getCachedTranslation(
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
  ): Promise<string | null> {
    const key = translationKey(sourceLocale, targetLocale, sourceText);
    const result = await this.store.get<string>(key);

    if (result !== null) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
    }

    return result;
  }

  async invalidateTranslation(
    sourceLocale: string,
    targetLocale: string,
    sourceText: string,
  ): Promise<void> {
    const key = translationKey(sourceLocale, targetLocale, sourceText);
    const deleted = await this.store.delete(key);
    if (deleted) {
      this.metrics.deletes++;
      // Remove from locale index
      for (const locale of [sourceLocale, targetLocale]) {
        this.localeKeyIndex.get(locale)?.delete(key);
      }
    }
  }

  async invalidateLocale(locale: string): Promise<void> {
    const keys = this.localeKeyIndex.get(locale);
    if (!keys || keys.size === 0) return;

    for (const key of keys) {
      const deleted = await this.store.delete(key);
      if (deleted) this.metrics.deletes++;
    }

    // Clean up the index for this locale
    this.localeKeyIndex.delete(locale);

    // Also clean references from other locales
    for (const [, otherKeys] of this.localeKeyIndex) {
      for (const key of keys) {
        otherKeys.delete(key);
      }
    }
  }

  async warmCache(
    entries: Array<{
      source: string;
      target: string;
      sourceText: string;
      translatedText: string;
    }>,
  ): Promise<void> {
    const cacheEntries = entries.map((entry) => {
      const key = translationKey(entry.source, entry.target, entry.sourceText);
      this.trackLocaleKey(entry.source, entry.target, key);
      return {
        key,
        value: entry.translatedText,
        ttlSeconds: this.defaultTtlSeconds,
      };
    });

    await this.store.setMany(cacheEntries);
    this.metrics.sets += entries.length;
  }

  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
    };
  }
}
