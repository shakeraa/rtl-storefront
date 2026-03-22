/**
 * T0162 — Translation result caching strategy
 *
 * Multi-tier caching (memory -> Redis -> CDN) with deterministic
 * cache keys and content-type-aware TTLs.
 */

import { createHash } from "node:crypto";

export interface CacheStrategy {
  tier: "memory" | "redis" | "cdn";
  ttlSeconds: number;
  maxEntries: number;
}

/** Content types that change rarely and can be cached aggressively */
const STATIC_CONTENT_TYPES = new Set([
  "product-title",
  "product-description",
  "collection-title",
  "policy",
  "static-page",
  "navigation",
  "footer",
]);

/**
 * Return the appropriate cache strategy for a content type.
 * Static / rarely-changing content gets a long TTL.
 * Dynamic content (e.g. reviews, user-generated) gets a short TTL.
 */
export function getCacheStrategy(contentType: string): CacheStrategy {
  if (STATIC_CONTENT_TYPES.has(contentType)) {
    return { tier: "cdn", ttlSeconds: 86_400, maxEntries: 50_000 };
  }
  return { tier: "memory", ttlSeconds: 300, maxEntries: 5_000 };
}

/**
 * Generate a deterministic cache key from locale pair and content hash.
 * Uses SHA-256 to keep the key a fixed length regardless of input.
 */
export function generateCacheKey(
  sourceLocale: string,
  targetLocale: string,
  contentHash: string,
): string {
  const raw = `${sourceLocale.toLowerCase()}:${targetLocale.toLowerCase()}:${contentHash}`;
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Determine whether a cached entry should be invalidated based on
 * its last-modified timestamp and the configured TTL.
 */
export function shouldInvalidate(lastModified: Date, cacheTtl: number): boolean {
  const ageSeconds = (Date.now() - lastModified.getTime()) / 1_000;
  return ageSeconds >= cacheTtl;
}

/**
 * Return the three-tier caching hierarchy used for translation results.
 *
 * - L1: in-process memory — very fast, small, short-lived (60 s)
 * - L2: Redis — shared across workers, medium TTL (1 h)
 * - L3: CDN edge cache — highest capacity, long TTL (24 h)
 */
export function getCacheTiers(): CacheStrategy[] {
  return [
    { tier: "memory", ttlSeconds: 60, maxEntries: 1_000 },
    { tier: "redis", ttlSeconds: 3_600, maxEntries: 100_000 },
    { tier: "cdn", ttlSeconds: 86_400, maxEntries: 1_000_000 },
  ];
}
