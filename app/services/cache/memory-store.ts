import type { CacheConfig, CacheMetrics, CacheStore } from "./types";

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number | null;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTtlSeconds: 3600,
  prefix: "mem:",
  maxMemoryMB: 64,
};

/**
 * Approximate max entries based on maxMemoryMB.
 * Assumes ~1KB per entry as a rough proxy.
 */
function maxEntriesFromMB(mb: number): number {
  return mb * 1024;
}

export class MemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, CacheEntry>();
  private readonly config: CacheConfig;
  private metrics: Omit<CacheMetrics, "hitRate"> = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private prefixedKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt;
  }

  private evictIfNeeded(): void {
    const maxEntries = maxEntriesFromMB(this.config.maxMemoryMB ?? 64);
    if (this.store.size <= maxEntries) return;

    // Evict expired entries first
    for (const [k, entry] of this.store) {
      if (this.isExpired(entry)) {
        this.store.delete(k);
      }
    }

    // If still over limit, evict oldest entries (insertion order)
    if (this.store.size > maxEntries) {
      const toRemove = this.store.size - maxEntries;
      let removed = 0;
      for (const k of this.store.keys()) {
        if (removed >= toRemove) break;
        this.store.delete(k);
        removed++;
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const prefixed = this.prefixedKey(key);
    const entry = this.store.get(prefixed);

    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.store.delete(prefixed);
      this.metrics.misses++;
      return null;
    }

    this.metrics.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const prefixed = this.prefixedKey(key);
    const ttl = ttlSeconds ?? this.config.defaultTtlSeconds;
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : null;

    this.store.set(prefixed, { value, expiresAt });
    this.metrics.sets++;
    this.evictIfNeeded();
  }

  async delete(key: string): Promise<boolean> {
    const prefixed = this.prefixedKey(key);
    const existed = this.store.delete(prefixed);
    if (existed) this.metrics.deletes++;
    return existed;
  }

  async exists(key: string): Promise<boolean> {
    const prefixed = this.prefixedKey(key);
    const entry = this.store.get(prefixed);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.store.delete(prefixed);
      return false;
    }
    return true;
  }

  async flush(): Promise<void> {
    this.store.clear();
  }

  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }
    return result;
  }

  async setMany<T>(entries: Array<{ key: string; value: T; ttlSeconds?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttlSeconds);
    }
  }

  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
    };
  }
}
