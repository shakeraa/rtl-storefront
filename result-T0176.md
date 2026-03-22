# T0176 Performance - Service Worker Caching

## Summary
Implemented service worker caching strategies for translation resources with offline support, precaching, and locale-aware fallback content.

## Files Created
- `/Users/shaker/shopify-dev/rtl-storefront/app/services/performance/service-worker-cache.ts` - Main implementation
- `/Users/shaker/shopify-dev/rtl-storefront/test/unit/service-worker-cache.test.ts` - Test suite

## Implementation Details

### Cache Strategies
- **cache-first**: For static assets, images, fonts - serves from cache, falls back to network
- **network-first**: For API responses - tries network first, falls back to cache
- **stale-while-revalidate**: For translation bundles and pages - serves cached content while updating in background

### Key Features
1. **Cache Name Generation**: Versioned cache names with locale support (`rtl-storefront-v1-ar`)
2. **Resource Type Detection**: Automatic detection from URL patterns
3. **Translation Resource Precaching**: Priority-based selection within budget constraints
4. **Offline Fallback Content**: Localized offline pages for ar, he, fa, ur, and en

### Functions Implemented
- `getCacheStrategy(resourceType)` - Returns cache config for resource type
- `generateCacheName(version, locale)` - Creates versioned cache names
- `shouldPreload(resource)` - Determines if resource should be precached
- `getOfflineFallback(locale)` - Returns localized offline content
- `detectResourceType(url)` - Auto-detects resource type from URL
- `sortByPriority(resources)` - Sorts resources by priority
- `filterByLocale(resources, locale)` - Filters resources by locale
- `calculateTotalSize(resources)` - Calculates total resource size
- `selectPrecacheResources(resources, budget)` - Selects resources within budget
- `isExpired(entry)` - Checks if cache entry is expired
- `createCacheEntry(url, size, maxAge)` - Creates cache entry with metadata
- `touchCacheEntry(entry)` - Updates access metadata
- `generateOfflinePage(locale)` - Generates HTML offline page
- `cleanupExpiredEntries(entries)` - Removes expired entries
- `getCacheStats(entries)` - Returns cache statistics
- `isValidCacheName(name)` - Validates cache name format
- `getSupportedLocales()` - Returns supported locale codes
- `isLocaleSupported(locale)` - Checks locale support
- `addOfflineFallback(fallback)` - Adds custom offline fallback

## Test Results
```
Test Files  1 passed (1)
Tests       89 passed (89)
Duration    ~770ms
```

### Test Coverage
- Cache strategy selection for all resource types
- Cache name generation with various inputs
- Resource type detection from URL patterns
- Preloading logic (priority-based, size constraints)
- Offline fallback content for all supported locales
- Resource sorting and filtering
- Cache entry lifecycle (creation, expiration, access tracking)
- Offline page generation with RTL/LTR direction
- Cache statistics calculation
- Cache name validation
- Locale support functions

## Acceptance Criteria
- [x] Feature implemented
- [x] Tests passing (89 tests)
- [x] Documentation updated (inline comments)
