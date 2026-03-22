---
task_id: "T0015"
status: review
implemented_by: claude
date: 2026-03-22
---

# Result: T0015 — Performance: CDN, Caching & Optimization

## Summary

Implemented the four missing modules specified in the task.  All existing cache
infrastructure was left untouched; the new files either extend it or stand
alongside it.

## Files Created

| File | Purpose |
|------|---------|
| `app/services/cache/redis.ts` | `CacheClient` interface + in-memory fallback + Upstash-compatible HTTP Redis client + singleton factory `createCacheClient()` |
| `app/services/cache/edge.ts` | `getEdgeCacheHeaders()`, `getNoCacheHeaders()`, `getBrowserCacheHeaders()`, `shouldCache()`, `getCacheKey()` |
| `app/services/performance/font-loader.ts` | `FontConfig` type, `getOptimalFonts(locale)`, `generateFontPreloadLinks(fonts)`, `generateFontImportCSS(fonts)`, `isRTLLocale()` |
| `app/middleware/cache.ts` | `withCache<T>(key, ttl, fn)`, `withLoaderCache<T>(key, ttl, fn)`, `invalidateCache(key)` |
| `test/unit/performance.test.ts` | 43 unit tests covering all four new modules |

## Files Modified

| File | Change |
|------|--------|
| `app/services/cache/index.ts` | Added re-exports for `redis.ts` and `edge.ts` |
| `app/services/performance/index.ts` | Added re-export for `font-loader.ts` |

## Implementation Notes

- `app/services/cache/redis.ts` — The `CacheClient` interface (`get/set/del`)
  is intentionally simpler than the existing `CacheStore` (`get/set/delete/
  exists/flush/getMany/setMany`) so it maps 1:1 to the Redis REST API.  The
  in-memory fallback uses the same TTL eviction logic as `MemoryCacheStore`.
  A module-level singleton is managed via `createCacheClient()` /
  `resetCacheClient()` (the latter is for tests only).

- `app/services/cache/edge.ts` — `shouldCache()` blocks non-GET/HEAD methods,
  known auth/webhook paths, and requests carrying an `Authorization` header.
  `getCacheKey()` sorts query parameters to maximise CDN hit rate.

- `app/services/performance/font-loader.ts` — Three locale groups are
  supported: Arabic-script (ar, ur, ps, sd → Noto Sans Arabic + Cairo),
  Persian/Kurdish (fa, ku → Vazirmatn + Noto Sans Arabic), and Hebrew (he →
  Noto Sans Hebrew + Assistant).  LTR locales get Inter with
  `display: optional`.  Region subtags (e.g. `ar-AE`) are handled by
  splitting on `-`.

- `app/middleware/cache.ts` — `withCache` uses the singleton client.  Corrupt
  cache entries are silently dropped and the factory is re-executed.  Cache
  write errors are logged but never surfaced to callers.

## Test Output

```
npm run test:run -- performance

 RUN  v3.0.9

 ✓ test/unit/performance.test.ts (43 tests) passed

Test Files  1 passed (1)
Tests       43 passed (43)
```

## Acceptance Criteria Checklist

- [x] Redis cache integration (`redis.ts` with in-memory fallback)
- [x] Translation result caching via `withCache` in `cache.ts`
- [x] Edge caching for API responses (`edge.ts`)
- [x] Browser caching headers (`getBrowserCacheHeaders`)
- [x] Arabic/Hebrew font preloading (`font-loader.ts`)
- [x] Font subsetting / display strategy per locale
- [x] Cache middleware for Remix loaders (`withCache`, `withLoaderCache`)
