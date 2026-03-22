export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
  getMany<T>(keys: string[]): Promise<Map<string, T>>;
  setMany<T>(entries: Array<{ key: string; value: T; ttlSeconds?: number }>): Promise<void>;
}

export interface CacheConfig {
  defaultTtlSeconds: number;
  prefix: string;
  maxMemoryMB?: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}
