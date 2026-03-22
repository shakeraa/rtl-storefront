import type { CacheStore } from "./types";

export interface RedisStoreConfig {
  url: string;
  prefix?: string;
  defaultTtlSeconds?: number;
  token?: string;
}

/**
 * Redis cache implementation using Upstash-compatible HTTP API.
 * Gracefully returns null / false on connection errors instead of throwing.
 */
export class RedisCacheStore implements CacheStore {
  private readonly url: string;
  private readonly prefix: string;
  private readonly defaultTtlSeconds: number;
  private readonly headers: Record<string, string>;

  constructor(config: RedisStoreConfig) {
    this.url = config.url.replace(/\/$/, "");
    this.prefix = config.prefix ?? "rtl:";
    this.defaultTtlSeconds = config.defaultTtlSeconds ?? 3600;

    this.headers = {
      "Content-Type": "application/json",
    };
    if (config.token) {
      this.headers["Authorization"] = `Bearer ${config.token}`;
    }
  }

  private prefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private async command<T>(args: string[]): Promise<T | null> {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        console.error(`[RedisCacheStore] HTTP ${response.status}: ${response.statusText}`);
        return null;
      }

      const data = (await response.json()) as { result: T };
      return data.result ?? null;
    } catch (error) {
      console.error("[RedisCacheStore] Connection error:", error);
      return null;
    }
  }

  private async pipeline<T>(commands: string[][]): Promise<Array<T | null>> {
    try {
      const response = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(commands),
      });

      if (!response.ok) {
        console.error(`[RedisCacheStore] Pipeline HTTP ${response.status}: ${response.statusText}`);
        return commands.map(() => null);
      }

      const data = (await response.json()) as Array<{ result: T }>;
      return data.map((d) => d.result ?? null);
    } catch (error) {
      console.error("[RedisCacheStore] Pipeline connection error:", error);
      return commands.map(() => null);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.command<string>(["GET", this.prefixedKey(key)]);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    const serialized = JSON.stringify(value);
    const prefixed = this.prefixedKey(key);

    if (ttl > 0) {
      await this.command(["SET", prefixed, serialized, "EX", String(ttl)]);
    } else {
      await this.command(["SET", prefixed, serialized]);
    }
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.command<number>(["DEL", this.prefixedKey(key)]);
    return result !== null && result > 0;
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.command<number>(["EXISTS", this.prefixedKey(key)]);
    return result !== null && result > 0;
  }

  async flush(): Promise<void> {
    // Scan and delete all keys with our prefix.
    // For safety, we use SCAN instead of FLUSHDB.
    let cursor = "0";
    do {
      const result = await this.command<[string, string[]]>([
        "SCAN",
        cursor,
        "MATCH",
        `${this.prefix}*`,
        "COUNT",
        "100",
      ]);
      if (!result) break;

      const [nextCursor, keys] = result;
      cursor = nextCursor;

      if (keys.length > 0) {
        await this.command(["DEL", ...keys]);
      }
    } while (cursor !== "0");
  }

  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    if (keys.length === 0) return new Map();

    const commands = keys.map((k) => ["GET", this.prefixedKey(k)]);
    const results = await this.pipeline<string>(commands);
    const map = new Map<string, T>();

    for (let i = 0; i < keys.length; i++) {
      const raw = results[i];
      if (raw !== null) {
        try {
          map.set(keys[i], JSON.parse(raw) as T);
        } catch {
          // Skip unparseable entries
        }
      }
    }

    return map;
  }

  async setMany<T>(entries: Array<{ key: string; value: T; ttlSeconds?: number }>): Promise<void> {
    if (entries.length === 0) return;

    const commands = entries.map((entry) => {
      const ttl = entry.ttlSeconds ?? this.defaultTtlSeconds;
      const serialized = JSON.stringify(entry.value);
      const prefixed = this.prefixedKey(entry.key);

      if (ttl > 0) {
        return ["SET", prefixed, serialized, "EX", String(ttl)];
      }
      return ["SET", prefixed, serialized];
    });

    await this.pipeline(commands);
  }
}
