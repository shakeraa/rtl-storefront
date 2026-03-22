import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateCacheHeaders,
  generateETag,
  generateTranslationETag,
  generateStaticAssetHeaders,
  generateTranslationHeaders,
  generateDynamicHeaders,
  generateImmutableHeaders,
  buildCacheControlHeader,
  parseCacheControlHeader,
  getCacheDuration,
  getStaleWhileRevalidateDuration,
  getCacheDurationByExtension,
  isETagMatch,
  createNotModifiedResponse,
  shouldCacheResource,
  calculateCacheHitRatio,
  generateContentHash,
  setCacheVersion,
  getCacheVersion,
  CACHE_DURATIONS,
  STALE_WHILE_REVALIDATE_DURATIONS,
  type AssetType,
  type CacheHeadersConfig,
} from '../../app/services/performance/cache-headers';

describe('Cache Headers', () => {
  describe('getCacheDuration', () => {
    it('returns 1 year for immutable assets', () => {
      const duration = getCacheDuration('immutable');
      expect(duration).toBe(365 * 24 * 60 * 60);
    });

    it('returns 30 days for static assets', () => {
      const duration = getCacheDuration('static');
      expect(duration).toBe(30 * 24 * 60 * 60);
    });

    it('returns 5 minutes for dynamic assets', () => {
      const duration = getCacheDuration('dynamic');
      expect(duration).toBe(5 * 60);
    });

    it('returns 24 hours for translation assets', () => {
      const duration = getCacheDuration('translation');
      expect(duration).toBe(24 * 60 * 60);
    });

    it('returns dynamic duration as fallback for unknown type', () => {
      const duration = getCacheDuration('unknown' as AssetType);
      expect(duration).toBe(CACHE_DURATIONS.dynamic);
    });
  });

  describe('getStaleWhileRevalidateDuration', () => {
    it('returns 0 for immutable assets', () => {
      const duration = getStaleWhileRevalidateDuration('immutable');
      expect(duration).toBe(0);
    });

    it('returns 7 days for static assets', () => {
      const duration = getStaleWhileRevalidateDuration('static');
      expect(duration).toBe(7 * 24 * 60 * 60);
    });

    it('returns 1 minute for dynamic assets', () => {
      const duration = getStaleWhileRevalidateDuration('dynamic');
      expect(duration).toBe(60);
    });

    it('returns 24 hours for translation assets', () => {
      const duration = getStaleWhileRevalidateDuration('translation');
      expect(duration).toBe(24 * 60 * 60);
    });
  });

  describe('buildCacheControlHeader', () => {
    it('builds header with public and max-age', () => {
      const config: CacheHeadersConfig = {
        maxAge: 3600,
      };
      const header = buildCacheControlHeader(config);
      expect(header).toBe('public, max-age=3600');
    });

    it('builds header with private directive', () => {
      const config: CacheHeadersConfig = {
        maxAge: 3600,
        private: true,
      };
      const header = buildCacheControlHeader(config);
      expect(header).toBe('private, max-age=3600');
    });

    it('builds header with immutable directive', () => {
      const config: CacheHeadersConfig = {
        maxAge: 31536000,
        immutable: true,
      };
      const header = buildCacheControlHeader(config);
      expect(header).toBe('public, max-age=31536000, immutable');
    });

    it('builds header with stale-while-revalidate', () => {
      const config: CacheHeadersConfig = {
        maxAge: 3600,
        staleWhileRevalidate: 86400,
      };
      const header = buildCacheControlHeader(config);
      expect(header).toBe('public, max-age=3600, stale-while-revalidate=86400');
    });

    it('builds header with must-revalidate', () => {
      const config: CacheHeadersConfig = {
        maxAge: 300,
        mustRevalidate: true,
      };
      const header = buildCacheControlHeader(config);
      expect(header).toBe('public, max-age=300, must-revalidate');
    });

    it('builds header with no-cache', () => {
      const config: CacheHeadersConfig = {
        maxAge: 0,
        noCache: true,
      };
      const header = buildCacheControlHeader(config);
      expect(header).toBe('public, max-age=0, no-cache');
    });

    it('builds complete header with all directives', () => {
      const config: CacheHeadersConfig = {
        maxAge: 3600,
        staleWhileRevalidate: 86400,
        immutable: true,
        mustRevalidate: true,
      };
      const header = buildCacheControlHeader(config);
      expect(header).toBe('public, max-age=3600, immutable, stale-while-revalidate=86400, must-revalidate');
    });
  });

  describe('parseCacheControlHeader', () => {
    it('parses public directive', () => {
      const config = parseCacheControlHeader('public, max-age=3600');
      expect(config.private).toBe(false);
      expect(config.maxAge).toBe(3600);
    });

    it('parses private directive', () => {
      const config = parseCacheControlHeader('private, max-age=3600');
      expect(config.private).toBe(true);
    });

    it('parses immutable directive', () => {
      const config = parseCacheControlHeader('public, max-age=31536000, immutable');
      expect(config.immutable).toBe(true);
    });

    it('parses stale-while-revalidate directive', () => {
      const config = parseCacheControlHeader('public, max-age=3600, stale-while-revalidate=86400');
      expect(config.staleWhileRevalidate).toBe(86400);
    });

    it('parses must-revalidate directive', () => {
      const config = parseCacheControlHeader('public, max-age=300, must-revalidate');
      expect(config.mustRevalidate).toBe(true);
    });

    it('parses no-cache directive', () => {
      const config = parseCacheControlHeader('public, max-age=0, no-cache');
      expect(config.noCache).toBe(true);
    });
  });

  describe('generateETag', () => {
    it('generates strong ETag by default', () => {
      const etag = generateETag('test content');
      expect(etag).toMatch(/^"[a-f0-9]+"$/);
    });

    it('generates weak ETag when specified', () => {
      const etag = generateETag('test content', { weak: true });
      expect(etag).toMatch(/^W\/"[a-f0-9]+"$/);
    });

    it('includes locale when specified', () => {
      const etag = generateETag('test content', { locale: 'ar' });
      expect(etag).toContain('ar');
    });

    it('includes prefix when specified', () => {
      const etag = generateETag('test content', { prefix: 'translation' });
      expect(etag).toContain('translation');
    });

    it('generates different ETags for different content', () => {
      const etag1 = generateETag('content A');
      const etag2 = generateETag('content B');
      expect(etag1).not.toBe(etag2);
    });

    it('generates same ETag for same content', () => {
      const etag1 = generateETag('same content');
      const etag2 = generateETag('same content');
      expect(etag1).toBe(etag2);
    });

    it('handles Buffer content', () => {
      const buffer = Buffer.from('buffer content');
      const etag = generateETag(buffer);
      expect(etag).toMatch(/^"[a-f0-9]+"$/);
    });
  });

  describe('generateTranslationETag', () => {
    it('generates ETag with locale prefix', () => {
      const etag = generateTranslationETag('translation content', 'ar');
      expect(etag).toContain('ar');
      expect(etag).toMatch(/^"ar-[a-z0-9-]+"$/i);
    });

    it('generates ETag with correct format', () => {
      const etag = generateTranslationETag('translation content', 'ar');
      expect(etag.startsWith('"ar-')).toBe(true);
      expect(etag.endsWith('"')).toBe(true);
    });

    it('includes version when specified', () => {
      const etag = generateTranslationETag('translation content', 'he', 'v1.2.3');
      expect(etag).toContain('v1.2.3');
    });

    it('generates different ETags for different locales', () => {
      const etag1 = generateTranslationETag('content', 'ar');
      const etag2 = generateTranslationETag('content', 'he');
      expect(etag1).not.toBe(etag2);
    });
  });

  describe('generateCacheHeaders', () => {
    it('generates headers for immutable assets', () => {
      const headers = generateCacheHeaders('immutable');
      expect(headers['Cache-Control']).toContain('immutable');
      expect(headers['Cache-Control']).toContain('max-age=31536000');
    });

    it('generates headers for static assets', () => {
      const headers = generateCacheHeaders('static');
      expect(headers['Cache-Control']).toContain('max-age=2592000');
      expect(headers['Cache-Control']).toContain('stale-while-revalidate=604800');
    });

    it('generates headers for dynamic assets', () => {
      const headers = generateCacheHeaders('dynamic');
      expect(headers['Cache-Control']).toContain('max-age=300');
      expect(headers['Cache-Control']).toContain('must-revalidate');
    });

    it('generates headers for translation assets', () => {
      const headers = generateCacheHeaders('translation', 'ar', { content: 'test' });
      expect(headers['Cache-Control']).toContain('max-age=86400');
      expect(headers.ETag).toBeDefined();
    });

    it('includes ETag when content is provided', () => {
      const headers = generateCacheHeaders('static', undefined, { content: 'test content' });
      expect(headers.ETag).toBeDefined();
      expect(headers.ETag).toMatch(/^"static:[a-f0-9]+"$/);
    });

    it('includes Vary header for locale-aware caching', () => {
      const headers = generateCacheHeaders('translation', 'ar', { content: 'test' });
      expect(headers.Vary).toBe('Accept-Language');
    });

    it('uses custom max-age when specified', () => {
      const headers = generateCacheHeaders('static', undefined, { customMaxAge: 600 });
      expect(headers['Cache-Control']).toContain('max-age=600');
    });

    it('omits Vary header when varyByLocale is false', () => {
      const headers = generateCacheHeaders('translation', 'ar', { 
        content: 'test',
        varyByLocale: false 
      });
      expect(headers.Vary).toBeUndefined();
    });
  });

  describe('generateStaticAssetHeaders', () => {
    it('detects versioned assets by hash in filename', () => {
      const headers = generateStaticAssetHeaders('/assets/app.abc123def.js');
      expect(headers['Cache-Control']).toContain('immutable');
    });

    it('uses static cache for non-versioned assets', () => {
      const headers = generateStaticAssetHeaders('/assets/app.js');
      expect(headers['Cache-Control']).not.toContain('immutable');
      expect(headers['Cache-Control']).toContain('max-age=2592000');
    });

    it('uses immutable cache when isVersioned is explicitly true', () => {
      const headers = generateStaticAssetHeaders('/assets/style.css', { isVersioned: true });
      expect(headers['Cache-Control']).toContain('immutable');
    });

    it('includes ETag when content is provided', () => {
      const headers = generateStaticAssetHeaders('/assets/app.js', { content: 'test' });
      expect(headers.ETag).toBeDefined();
    });

    it('detects hash with hyphen separator', () => {
      const headers = generateStaticAssetHeaders('/assets/app-abc123def456.js');
      expect(headers['Cache-Control']).toContain('immutable');
    });
  });

  describe('generateTranslationHeaders', () => {
    it('generates translation-specific headers', () => {
      const headers = generateTranslationHeaders('ar', 'translation content');
      expect(headers['Cache-Control']).toContain('max-age=86400');
      expect(headers.ETag).toBeDefined();
      expect(headers.Vary).toBe('Accept-Language');
    });

    it('includes version in ETag when specified', () => {
      const headers = generateTranslationHeaders('he', 'content', { version: 'v2.0' });
      expect(headers.ETag).toContain('v2.0');
    });

    it('omits Vary header when varyByLocale is false', () => {
      const headers = generateTranslationHeaders('ar', 'content', { varyByLocale: false });
      expect(headers.Vary).toBeUndefined();
    });
  });

  describe('generateDynamicHeaders', () => {
    it('generates dynamic response headers', () => {
      const headers = generateDynamicHeaders();
      expect(headers['Cache-Control']).toContain('max-age=300');
      expect(headers['Cache-Control']).toContain('must-revalidate');
    });

    it('uses custom max-age when specified', () => {
      const headers = generateDynamicHeaders({ maxAge: 600 });
      expect(headers['Cache-Control']).toContain('max-age=600');
    });

    it('uses custom stale-while-revalidate when specified', () => {
      const headers = generateDynamicHeaders({ staleWhileRevalidate: 120 });
      expect(headers['Cache-Control']).toContain('stale-while-revalidate=120');
    });

    it('sets private directive when specified', () => {
      const headers = generateDynamicHeaders({ private: true });
      expect(headers['Cache-Control']).toContain('private');
    });
  });

  describe('generateImmutableHeaders', () => {
    it('generates immutable asset headers', () => {
      const headers = generateImmutableHeaders();
      expect(headers['Cache-Control']).toContain('immutable');
      expect(headers['Cache-Control']).toContain('max-age=31536000');
    });

    it('includes ETag when content is provided', () => {
      const headers = generateImmutableHeaders({ content: 'immutable content' });
      expect(headers.ETag).toBeDefined();
    });
  });

  describe('isETagMatch', () => {
    it('returns true when If-None-Match matches ETag', () => {
      const headers = new Headers({ 'if-none-match': '"abc123"' });
      expect(isETagMatch(headers, '"abc123"')).toBe(true);
    });

    it('returns false when If-None-Match does not match', () => {
      const headers = new Headers({ 'if-none-match': '"abc123"' });
      expect(isETagMatch(headers, '"def456"')).toBe(false);
    });

    it('returns false when If-None-Match header is missing', () => {
      const headers = new Headers();
      expect(isETagMatch(headers, '"abc123"')).toBe(false);
    });

    it('handles weak ETag comparison', () => {
      const headers = new Headers({ 'if-none-match': 'W/"abc123"' });
      expect(isETagMatch(headers, '"abc123"')).toBe(true);
    });

    it('handles wildcard match', () => {
      const headers = new Headers({ 'if-none-match': '*' });
      expect(isETagMatch(headers, '"anything"')).toBe(true);
    });

    it('handles multiple ETags in If-None-Match', () => {
      const headers = new Headers({ 'if-none-match': '"abc123", "def456"' });
      expect(isETagMatch(headers, '"def456"')).toBe(true);
    });
  });

  describe('createNotModifiedResponse', () => {
    it('returns 304 response when ETag matches', () => {
      const requestHeaders = new Headers({ 'if-none-match': '"abc123"' });
      const responseHeaders = new Headers({
        'etag': '"abc123"',
        'cache-control': 'max-age=3600',
      });
      
      const response = createNotModifiedResponse(requestHeaders, responseHeaders);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(304);
    });

    it('returns null when ETag does not match', () => {
      const requestHeaders = new Headers({ 'if-none-match': '"abc123"' });
      const responseHeaders = new Headers({
        'etag': '"def456"',
        'cache-control': 'max-age=3600',
      });
      
      const response = createNotModifiedResponse(requestHeaders, responseHeaders);
      
      expect(response).toBeNull();
    });

    it('returns null when response has no ETag', () => {
      const requestHeaders = new Headers({ 'if-none-match': '"abc123"' });
      const responseHeaders = new Headers({
        'cache-control': 'max-age=3600',
      });
      
      const response = createNotModifiedResponse(requestHeaders, responseHeaders);
      
      expect(response).toBeNull();
    });

    it('includes Last-Modified in 304 response if present', () => {
      const requestHeaders = new Headers({ 'if-none-match': '"abc123"' });
      const responseHeaders = new Headers({
        'etag': '"abc123"',
        'cache-control': 'max-age=3600',
        'last-modified': 'Wed, 21 Oct 2025 07:28:00 GMT',
      });
      
      const response = createNotModifiedResponse(requestHeaders, responseHeaders);
      
      expect(response?.headers.get('Last-Modified')).toBe('Wed, 21 Oct 2025 07:28:00 GMT');
    });
  });

  describe('shouldCacheResource', () => {
    it('returns true for normal requests', () => {
      const request = new Request('https://example.com/api/data');
      expect(shouldCacheResource(request)).toBe(true);
    });

    it('returns false when Cache-Control: no-cache is set', () => {
      const request = new Request('https://example.com/api/data', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      expect(shouldCacheResource(request)).toBe(false);
    });

    it('returns false when Pragma: no-cache is set', () => {
      const request = new Request('https://example.com/api/data', {
        headers: { 'Pragma': 'no-cache' },
      });
      expect(shouldCacheResource(request)).toBe(false);
    });
  });

  describe('calculateCacheHitRatio', () => {
    it('calculates correct ratio', () => {
      expect(calculateCacheHitRatio(80, 20)).toBe(0.8);
    });

    it('returns 0 when no requests', () => {
      expect(calculateCacheHitRatio(0, 0)).toBe(0);
    });

    it('returns 1 for all hits', () => {
      expect(calculateCacheHitRatio(100, 0)).toBe(1);
    });

    it('returns 0 for all misses', () => {
      expect(calculateCacheHitRatio(0, 100)).toBe(0);
    });
  });

  describe('generateContentHash', () => {
    it('generates consistent hash for same content', () => {
      const hash1 = generateContentHash('test content');
      const hash2 = generateContentHash('test content');
      expect(hash1).toBe(hash2);
    });

    it('generates different hashes for different content', () => {
      const hash1 = generateContentHash('content A');
      const hash2 = generateContentHash('content B');
      expect(hash1).not.toBe(hash2);
    });

    it('generates 16-character hash', () => {
      const hash = generateContentHash('test');
      expect(hash.length).toBe(16);
    });

    it('handles Buffer input', () => {
      const hash = generateContentHash(Buffer.from('buffer test'));
      expect(hash.length).toBe(16);
    });
  });

  describe('getCacheDurationByExtension', () => {
    it('returns immutable duration for JS files', () => {
      expect(getCacheDurationByExtension('.js')).toBe(CACHE_DURATIONS.immutable);
      expect(getCacheDurationByExtension('js')).toBe(CACHE_DURATIONS.immutable);
    });

    it('returns immutable duration for CSS files', () => {
      expect(getCacheDurationByExtension('.css')).toBe(CACHE_DURATIONS.immutable);
    });

    it('returns static duration for image files', () => {
      expect(getCacheDurationByExtension('.png')).toBe(CACHE_DURATIONS.static);
      expect(getCacheDurationByExtension('.jpg')).toBe(CACHE_DURATIONS.static);
      expect(getCacheDurationByExtension('.svg')).toBe(CACHE_DURATIONS.static);
    });

    it('returns static duration for font files', () => {
      expect(getCacheDurationByExtension('.woff')).toBe(CACHE_DURATIONS.static);
      expect(getCacheDurationByExtension('.woff2')).toBe(CACHE_DURATIONS.static);
    });

    it('returns dynamic duration for JSON files', () => {
      expect(getCacheDurationByExtension('.json')).toBe(CACHE_DURATIONS.dynamic);
    });

    it('returns dynamic duration for HTML files', () => {
      expect(getCacheDurationByExtension('.html')).toBe(CACHE_DURATIONS.dynamic);
    });

    it('returns dynamic duration for unknown extensions', () => {
      expect(getCacheDurationByExtension('.unknown')).toBe(CACHE_DURATIONS.dynamic);
    });
  });

  describe('Cache Version Management', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset cache version before each test
      setCacheVersion('');
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('sets and gets cache version', () => {
      setCacheVersion('v1.2.3');
      expect(getCacheVersion()).toBe('v1.2.3');
    });

    it('returns fallback when version is not set', () => {
      setCacheVersion('');
      const version = getCacheVersion();
      // Should return a daily rotation string
      expect(typeof version).toBe('string');
      expect(version.length).toBeGreaterThan(0);
    });
  });

  describe('Cache Constants', () => {
    it('has correct immutable duration', () => {
      expect(CACHE_DURATIONS.immutable).toBe(365 * 24 * 60 * 60);
    });

    it('has correct static duration', () => {
      expect(CACHE_DURATIONS.static).toBe(30 * 24 * 60 * 60);
    });

    it('has correct dynamic duration', () => {
      expect(CACHE_DURATIONS.dynamic).toBe(5 * 60);
    });

    it('has correct translation duration', () => {
      expect(CACHE_DURATIONS.translation).toBe(24 * 60 * 60);
    });

    it('has correct stale-while-revalidate durations', () => {
      expect(STALE_WHILE_REVALIDATE_DURATIONS.immutable).toBe(0);
      expect(STALE_WHILE_REVALIDATE_DURATIONS.static).toBe(7 * 24 * 60 * 60);
      expect(STALE_WHILE_REVALIDATE_DURATIONS.dynamic).toBe(60);
      expect(STALE_WHILE_REVALIDATE_DURATIONS.translation).toBe(24 * 60 * 60);
    });
  });
});
