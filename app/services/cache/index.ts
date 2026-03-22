export type { CacheConfig, CacheMetrics, CacheStore } from "./types";
export { MemoryCacheStore } from "./memory-store";
export { RedisCacheStore } from "./redis-store";
export type { RedisStoreConfig } from "./redis-store";
export { TranslationCache } from "./translation-cache";

import type { CacheConfig, CacheStore } from "./types";
import { MemoryCacheStore } from "./memory-store";
import { RedisCacheStore } from "./redis-store";

/**
 * Factory that returns a CacheStore instance.
 * Uses RedisCacheStore if REDIS_URL is set in environment, otherwise MemoryCacheStore.
 */
export function createCacheStore(config?: Partial<CacheConfig>): CacheStore {
  const redisUrl = typeof process !== "undefined" ? process.env.REDIS_URL : undefined;
  const redisToken = typeof process !== "undefined" ? process.env.REDIS_TOKEN : undefined;

  if (redisUrl) {
    return new RedisCacheStore({
      url: redisUrl,
      prefix: config?.prefix ?? "rtl:",
      defaultTtlSeconds: config?.defaultTtlSeconds ?? 3600,
      token: redisToken,
    });
  }

  return new MemoryCacheStore(config);
}
