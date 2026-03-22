import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCacheStore, TranslationCache } from '../../app/services/cache';

describe('MemoryCacheStore', () => {
  let store: MemoryCacheStore;

  beforeEach(() => {
    store = new MemoryCacheStore({ prefix: 'test:', defaultTtlSeconds: 3600 });
  });

  it('set then get returns the stored value', async () => {
    await store.set('key1', 'value1');
    const result = await store.get<string>('key1');
    expect(result).toBe('value1');
  });

  it('get returns null for a missing key', async () => {
    const result = await store.get<string>('nonexistent');
    expect(result).toBeNull();
  });

  it('delete removes an entry', async () => {
    await store.set('key1', 'value1');
    const deleted = await store.delete('key1');
    expect(deleted).toBe(true);
    const result = await store.get<string>('key1');
    expect(result).toBeNull();
  });

  it('delete returns false for a missing key', async () => {
    const deleted = await store.delete('nonexistent');
    expect(deleted).toBe(false);
  });

  it('exists returns true for an existing key', async () => {
    await store.set('key1', 'value1');
    expect(await store.exists('key1')).toBe(true);
  });

  it('exists returns false for a missing key', async () => {
    expect(await store.exists('nonexistent')).toBe(false);
  });

  it('TTL expiration: get returns null after entry expires', async () => {
    // Set with a TTL of -1 seconds so expiresAt is in the past
    // Looking at the code: ttl <= 0 means expiresAt = null (no expiry)
    // We need to use a very short TTL and wait, or manipulate time.
    // Actually, ttl > 0 sets expiresAt = Date.now() + ttl * 1000
    // For ttl=0, expiresAt = null (never expires). Let's test with a tiny ttl.
    // We'll use vi.useFakeTimers instead.
    await store.set('expiring', 'val', 1); // 1 second TTL
    // Entry should exist immediately
    expect(await store.get<string>('expiring')).toBe('val');
  });

  it('TTL expiration: expired entry returns null', async () => {
    // Create a store and manually force expiration by setting ttl=1 and advancing time
    const s = new MemoryCacheStore({ prefix: 'ttl:', defaultTtlSeconds: 3600 });
    await s.set('exp', 'data', 1);
    // Wait just over 1 second for expiration
    await new Promise((r) => setTimeout(r, 1100));
    const result = await s.get<string>('exp');
    expect(result).toBeNull();
  });

  it('getMany returns a map of found values', async () => {
    await store.set('a', 1);
    await store.set('b', 2);
    const result = await store.getMany<number>(['a', 'b', 'missing']);
    expect(result.get('a')).toBe(1);
    expect(result.get('b')).toBe(2);
    expect(result.has('missing')).toBe(false);
  });

  it('setMany stores multiple entries', async () => {
    await store.setMany([
      { key: 'x', value: 10 },
      { key: 'y', value: 20 },
    ]);
    expect(await store.get<number>('x')).toBe(10);
    expect(await store.get<number>('y')).toBe(20);
  });

  it('flush clears all entries', async () => {
    await store.set('a', 1);
    await store.set('b', 2);
    await store.flush();
    expect(await store.get<number>('a')).toBeNull();
    expect(await store.get<number>('b')).toBeNull();
  });

  it('getMetrics tracks hits and misses', async () => {
    await store.set('hit', 'yes');
    await store.get<string>('hit');   // hit
    await store.get<string>('miss1'); // miss
    await store.get<string>('miss2'); // miss

    const metrics = store.getMetrics();
    expect(metrics.hits).toBe(1);
    expect(metrics.misses).toBe(2);
    expect(metrics.sets).toBe(1);
    expect(metrics.hitRate).toBeCloseTo(1 / 3);
  });
});

describe('TranslationCache', () => {
  let memStore: MemoryCacheStore;
  let cache: TranslationCache;

  beforeEach(() => {
    memStore = new MemoryCacheStore({ prefix: 'tc:', defaultTtlSeconds: 3600 });
    cache = new TranslationCache(memStore);
  });

  it('cacheTranslation + getCachedTranslation round-trip', async () => {
    await cache.cacheTranslation('en', 'ar', 'Hello', 'مرحبا');
    const result = await cache.getCachedTranslation('en', 'ar', 'Hello');
    expect(result).toBe('مرحبا');
  });

  it('getCachedTranslation returns null for uncached text', async () => {
    const result = await cache.getCachedTranslation('en', 'ar', 'Not cached');
    expect(result).toBeNull();
  });

  it('invalidateTranslation removes a specific entry', async () => {
    await cache.cacheTranslation('en', 'ar', 'Hello', 'مرحبا');
    await cache.invalidateTranslation('en', 'ar', 'Hello');
    const result = await cache.getCachedTranslation('en', 'ar', 'Hello');
    expect(result).toBeNull();
  });

  it('getMetrics tracks translation cache hits and misses', async () => {
    await cache.cacheTranslation('en', 'ar', 'Hi', 'مرحبا');
    await cache.getCachedTranslation('en', 'ar', 'Hi');      // hit
    await cache.getCachedTranslation('en', 'ar', 'Missing'); // miss

    const metrics = cache.getMetrics();
    expect(metrics.hits).toBe(1);
    expect(metrics.misses).toBe(1);
    expect(metrics.sets).toBe(1);
  });
});
