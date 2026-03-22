/**
 * T0015 — Redis cache client with in-memory fallback.
 *
 * Exposes a simple CacheClient interface that callers can use without
 * caring whether the backing store is Redis or an in-process Map.
 * When REDIS_URL is present in the environment a thin HTTP client
 * (compatible with the Upstash REST API) is used; otherwise an
 * in-memory store is returned so the app works with zero external deps.
 */

export interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

interface MemEntry {
  value: string;
  expiresAt: number | null;
}

class MemoryCacheClient implements CacheClient {
  private readonly store = new Map<string, MemEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt =
      ttlSeconds != null && ttlSeconds > 0
        ? Date.now() + ttlSeconds * 1000
        : null;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Redis / Upstash HTTP client
// ---------------------------------------------------------------------------

class RedisCacheClient implements CacheClient {
  private readonly url: string;
  private readonly headers: Record<string, string>;

  constructor(url: string, token?: string) {
    this.url = url.replace(/\/$/, "");
    this.headers = { "Content-Type": "application/json" };
    if (token) {
      this.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  private async command<T>(args: (string | number)[]): Promise<T | null> {
    try {
      const res = await fetch(this.url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(args),
      });
      if (!res.ok) {
        console.error(`[RedisCacheClient] HTTP ${res.status}: ${res.statusText}`);
        return null;
      }
      const body = (await res.json()) as { result: T };
      return body.result ?? null;
    } catch (err) {
      console.error("[RedisCacheClient] Connection error:", err);
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.command<string>(["GET", key]);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds != null && ttlSeconds > 0) {
      await this.command(["SET", key, value, "EX", ttlSeconds]);
    } else {
      await this.command(["SET", key, value]);
    }
  }

  async del(key: string): Promise<void> {
    await this.command(["DEL", key]);
  }
}

// ---------------------------------------------------------------------------
// Singleton instance (module-level, safe in Node server environments)
// ---------------------------------------------------------------------------

let _instance: CacheClient | null = null;

/**
 * Returns a CacheClient backed by Redis when REDIS_URL is set, or an
 * in-memory store otherwise.  The same instance is reused on subsequent
 * calls so callers can import createCacheClient() freely.
 */
export function createCacheClient(): CacheClient {
  if (_instance) return _instance;

  const redisUrl =
    typeof process !== "undefined" ? process.env.REDIS_URL : undefined;
  const redisToken =
    typeof process !== "undefined" ? process.env.REDIS_TOKEN : undefined;

  if (redisUrl) {
    _instance = new RedisCacheClient(redisUrl, redisToken);
  } else {
    _instance = new MemoryCacheClient();
  }

  return _instance;
}

/** Reset the singleton (useful in tests). */
export function resetCacheClient(): void {
  _instance = null;
}
