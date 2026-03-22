/**
 * T0015 — Cache middleware for Remix loaders.
 *
 * withCache() wraps any async function with a read-through cache pattern:
 * on a cache hit the serialised value is returned immediately; on a miss
 * the wrapped function is called, its result stored, then returned.
 *
 * The backing store is the singleton CacheClient created by
 * createCacheClient() (Redis when REDIS_URL is set, in-memory otherwise).
 */

import { createCacheClient } from "../services/cache/redis";

// Re-export so callers can get the client directly if they need it.
export { createCacheClient };

const client = createCacheClient();

/**
 * Wraps an async factory function with a read-through cache.
 *
 * @param key  Cache key.  Should be unique and deterministic for the data
 *             being cached (e.g. `translations:ar:products`).
 * @param ttl  Time-to-live in seconds.  0 means no expiry.
 * @param fn   Factory that produces the value when there is a cache miss.
 * @returns    The cached or freshly computed value.
 *
 * @example
 * ```ts
 * const translations = await withCache(
 *   `translations:${locale}:${resourceType}`,
 *   3600,
 *   () => fetchTranslationsFromDB(locale, resourceType),
 * );
 * ```
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T> {
  // Attempt cache read
  const cached = await client.get(key);
  if (cached !== null) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // Corrupt entry — fall through to re-fetch
    }
  }

  // Cache miss: execute the factory
  const value = await fn();

  // Persist the result (best-effort; do not let cache errors surface to callers)
  try {
    await client.set(key, JSON.stringify(value), ttl > 0 ? ttl : undefined);
  } catch (err) {
    console.error("[withCache] Failed to persist cache entry:", err);
  }

  return value;
}

/**
 * Invalidates a single cache entry.
 */
export async function invalidateCache(key: string): Promise<void> {
  await client.del(key);
}

/**
 * Convenience wrapper that caches the result of a Remix loader data fetch
 * and attaches standard cache metadata to the returned object.
 *
 * The returned object merges the original data with:
 *   - `_cachedAt`:  ISO timestamp of when the value was first cached.
 *   - `_cacheKey`:  The cache key used.
 */
export async function withLoaderCache<T extends object>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T & { _cachedAt: string; _cacheKey: string }> {
  const cached = await client.get(key);
  if (cached !== null) {
    try {
      return JSON.parse(cached) as T & {
        _cachedAt: string;
        _cacheKey: string;
      };
    } catch {
      // Fall through
    }
  }

  const value = await fn();
  const enriched = {
    ...value,
    _cachedAt: new Date().toISOString(),
    _cacheKey: key,
  };

  try {
    await client.set(key, JSON.stringify(enriched), ttl > 0 ? ttl : undefined);
  } catch (err) {
    console.error("[withLoaderCache] Failed to persist cache entry:", err);
  }

  return enriched;
}
