import { describe, it, expect } from 'vitest';
import {
  generateCDNHeaders,
  generateCacheKey,
  generateCacheKeyFromUrl,
  getEdgeTTL,
  generateSurrogateKeys,
  generatePurgeCommand,
  getCacheStatus,
  createCDNCacheMiddleware,
  normalizeLocale,
  isCacheableAtEdge,
  CDNProvider,
} from '../../app/services/performance/cdn-cache';

describe('CDN Cache Service', () => {
  describe('generateCDNHeaders', () => {
    it('generates Cloudflare headers with default TTL', () => {
      const headers = generateCDNHeaders('cloudflare', 'ar');
      
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cache-Control']).toContain('max-age=3600');
      expect(headers['Cloudflare-CDN-Cache-Control']).toBe('max-age=3600');
    });

    it('generates Fastly headers with Surrogate-Control', () => {
      const headers = generateCDNHeaders('fastly', 'he');
      
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Surrogate-Control']).toBe('max-age=3600, stale-while-revalidate=86400');
    });

    it('generates CloudFront headers', () => {
      const headers = generateCDNHeaders('cloudfront', 'ar-SA');
      
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cache-Control']).toContain('max-age=3600');
    });

    it('generates Akamai headers', () => {
      const headers = generateCDNHeaders('akamai', 'en');
      
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cache-Control']).toContain('max-age=3600');
    });

    it('generates universal headers for auto provider', () => {
      const headers = generateCDNHeaders('auto', 'ar');
      
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['CDN-Cache-Control']).toBe('max-age=3600');
    });

    it('includes Surrogate-Key header when tags are provided', () => {
      const headers = generateCDNHeaders('cloudflare', 'ar', {
        tags: ['products', 'homepage'],
      });
      
      expect(headers['Surrogate-Key']).toContain('products');
      expect(headers['Surrogate-Key']).toContain('homepage');
      expect(headers['Surrogate-Key']).toContain('locale:ar');
    });

    it('sets private cache for authenticated content', () => {
      const headers = generateCDNHeaders('cloudflare', 'ar', {
        isPrivate: true,
      });
      
      expect(headers['Cache-Control']).toContain('private');
      expect(headers['Cache-Control']).toContain('must-revalidate');
    });

    it('includes immutable directive for long TTLs', () => {
      const headers = generateCDNHeaders('cloudflare', 'ar', {
        ttl: 86400 * 30, // 30 days
      });
      
      expect(headers['Cache-Control']).toContain('immutable');
    });

    it('respects custom TTL values', () => {
      const headers = generateCDNHeaders('fastly', 'he', {
        ttl: 1800,
        staleWhileRevalidate: 3600,
      });
      
      expect(headers['Cache-Control']).toContain('max-age=1800');
      expect(headers['Surrogate-Control']).toBe('max-age=1800, stale-while-revalidate=3600');
    });
  });

  describe('generateCacheKey', () => {
    it('generates basic cache key with URL and locale', () => {
      const key = generateCacheKey({ url: '/products/shoes', locale: 'ar' });
      
      expect(key).toBe('ar|/products/shoes');
    });

    it('includes device type in cache key when provided', () => {
      const key = generateCacheKey({
        url: '/products/shoes',
        locale: 'ar',
        deviceType: 'mobile',
      });
      
      expect(key).toBe('ar|mobile|/products/shoes');
    });

    it('includes currency in cache key when provided', () => {
      const key = generateCacheKey({
        url: '/products/shoes',
        locale: 'ar',
        currency: 'SAR',
      });
      
      expect(key).toBe('ar|sar|/products/shoes');
    });

    it('includes region in cache key when provided', () => {
      const key = generateCacheKey({
        url: '/products/shoes',
        locale: 'ar',
        region: 'MENA',
      });
      
      expect(key).toBe('ar|mena|/products/shoes');
    });

    it('includes variant in cache key when provided', () => {
      const key = generateCacheKey({
        url: '/products/shoes',
        locale: 'ar',
        variant: 'sale',
      });
      
      expect(key).toBe('ar|sale|/products/shoes');
    });

    it('combines all optional parameters correctly', () => {
      const key = generateCacheKey({
        url: '/products/shoes',
        locale: 'ar',
        deviceType: 'mobile',
        currency: 'SAR',
        region: 'MENA',
        variant: 'sale',
      });
      
      expect(key).toBe('ar|mobile|sar|mena|sale|/products/shoes');
    });

    it('includes translation-related query parameters', () => {
      const key = generateCacheKey({
        url: '/products/shoes?lang=ar&t=1&other=value',
        locale: 'ar',
      });
      
      expect(key).toContain('/products/shoes');
      expect(key).toContain('lang=ar');
      expect(key).toContain('t=1');
      expect(key).not.toContain('other=value');
    });
  });

  describe('generateCacheKeyFromUrl', () => {
    it('provides simplified interface for URL and locale', () => {
      const key = generateCacheKeyFromUrl('/products/shoes', 'he');
      
      expect(key).toBe('he|/products/shoes');
    });
  });

  describe('getEdgeTTL', () => {
    it('returns 0 for authenticated content', () => {
      const ttl = getEdgeTTL({ contentType: 'text/html', isAuthenticated: true });
      
      expect(ttl).toBe(0);
    });

    it('returns short TTL for dynamic content', () => {
      const ttl = getEdgeTTL({ contentType: 'text/html', isDynamic: true });
      
      expect(ttl).toBe(60);
    });

    it('returns correct TTL for CSS content', () => {
      const ttl = getEdgeTTL({ contentType: 'text/css' });
      
      expect(ttl).toBe(86400 * 30); // 30 days
    });

    it('returns correct TTL for JavaScript content', () => {
      const ttl = getEdgeTTL({ contentType: 'application/javascript' });
      
      expect(ttl).toBe(86400 * 30); // 30 days
    });

    it('returns correct TTL for images', () => {
      const ttl = getEdgeTTL({ contentType: 'image/png' });
      
      expect(ttl).toBe(86400 * 7); // 7 days
    });

    it('returns correct TTL for fonts', () => {
      const ttl = getEdgeTTL({ contentType: 'font/woff2' });
      
      expect(ttl).toBe(86400 * 365); // 1 year
    });

    it('returns correct TTL for HTML content', () => {
      const ttl = getEdgeTTL({ contentType: 'text/html' });
      
      expect(ttl).toBe(300); // 5 minutes
    });

    it('returns correct TTL for JSON content', () => {
      const ttl = getEdgeTTL({ contentType: 'application/json' });
      
      expect(ttl).toBe(60); // 1 minute
    });

    it('returns correct TTL for translation content', () => {
      const ttl = getEdgeTTL({ contentType: 'application/translation+json' });
      
      expect(ttl).toBe(3600); // 1 hour
    });

    it('falls back based on content type prefix', () => {
      expect(getEdgeTTL({ contentType: 'image/webp' })).toBe(86400 * 7);
      expect(getEdgeTTL({ contentType: 'font/otf' })).toBe(86400 * 365);
      expect(getEdgeTTL({ contentType: 'application/json+ld' })).toBe(60);
    });
  });

  describe('generateSurrogateKeys', () => {
    it('joins tags with spaces', () => {
      const keys = generateSurrogateKeys(['products', 'homepage', 'footer']);
      
      expect(keys).toBe('products homepage footer');
    });

    it('adds locale prefix to translation-related tags', () => {
      const keys = generateSurrogateKeys(['translation-products', 'static-assets'], 'ar');
      
      expect(keys).toContain('ar:translation-products');
      expect(keys).toContain('static-assets');
      expect(keys).toContain('locale:ar');
    });

    it('adds locale tag when locale is provided', () => {
      const keys = generateSurrogateKeys(['products'], 'he');
      
      expect(keys).toContain('locale:he');
    });

    it('handles empty tags array', () => {
      const keys = generateSurrogateKeys([], 'ar');
      
      expect(keys).toBe('locale:ar');
    });

    it('handles tags starting with "trans" prefix', () => {
      const keys = generateSurrogateKeys(['trans-homepage'], 'ar');
      
      expect(keys).toContain('ar:trans-homepage');
    });

    it('handles tags containing "locale"', () => {
      const keys = generateSurrogateKeys(['locale-specific'], 'he');
      
      expect(keys).toContain('he:locale-specific');
    });
  });

  describe('generatePurgeCommand', () => {
    it('generates Cloudflare purge command for tags', () => {
      const command = generatePurgeCommand('cloudflare', { tags: ['products'] });
      
      expect(command.method).toBe('POST');
      expect(command.headers?.['Content-Type']).toBe('application/json');
      expect(JSON.parse(command.body!)).toEqual({ tags: ['products'] });
    });

    it('generates Cloudflare purge command for URL', () => {
      const command = generatePurgeCommand('cloudflare', { url: '/products/shoes' });
      
      expect(command.method).toBe('POST');
      expect(JSON.parse(command.body!)).toEqual({ files: ['/products/shoes'] });
    });

    it('generates Cloudflare soft purge command', () => {
      const command = generatePurgeCommand('cloudflare', { tags: ['products'], soft: true });
      
      expect(JSON.parse(command.body!)).toHaveProperty('soft', true);
    });

    it('generates Fastly purge command for tags', () => {
      const command = generatePurgeCommand('fastly', { tags: ['products'] });
      
      expect(command.method).toBe('POST');
      expect(command.headers?.['Surrogate-Key']).toBe('products');
      expect(command.headers?.['Fastly-Soft-Purge']).toBe('0');
    });

    it('generates Fastly purge command for URL', () => {
      const command = generatePurgeCommand('fastly', { url: '/products/shoes' });
      
      expect(command.method).toBe('PURGE');
      expect(command.url).toBe('/products/shoes');
    });

    it('generates Fastly soft purge command', () => {
      const command = generatePurgeCommand('fastly', { url: '/products', soft: true });
      
      expect(command.headers?.['Fastly-Soft-Purge']).toBe('1');
    });

    it('generates CloudFront purge command', () => {
      const command = generatePurgeCommand('cloudfront', { url: '/products/shoes' });
      
      expect(command.method).toBe('POST');
      const body = JSON.parse(command.body!);
      expect(body.Paths.Items).toContain('/products/shoes');
      expect(body.Paths.Quantity).toBe(1);
    });

    it('generates CloudFront wildcard purge for tags', () => {
      const command = generatePurgeCommand('cloudfront', { tags: ['products'] });
      
      const body = JSON.parse(command.body!);
      expect(body.Paths.Items).toContain('/*');
    });

    it('generates Akamai purge command for URL', () => {
      const command = generatePurgeCommand('akamai', { url: '/products/shoes' });
      
      expect(command.method).toBe('POST');
      expect(JSON.parse(command.body!)).toEqual({ objects: ['/products/shoes'] });
    });

    it('generates Akamai tag-based purge command', () => {
      const command = generatePurgeCommand('akamai', { tags: ['products', 'homepage'] });
      
      expect(command.method).toBe('POST');
      expect(JSON.parse(command.body!)).toEqual({ tags: ['products', 'homepage'] });
    });
  });

  describe('getCacheStatus', () => {
    it('detects Cloudflare cache hit', () => {
      const status = getCacheStatus({
        'cf-cache-status': 'HIT',
        'cf-ray': '123456789-IAD',
      });
      
      expect(status.hit).toBe(true);
      expect(status.provider).toBe('cloudflare');
    });

    it('detects Cloudflare cache miss', () => {
      const status = getCacheStatus({
        'cf-cache-status': 'MISS',
      });
      
      expect(status.hit).toBe(false);
      expect(status.provider).toBe('cloudflare');
    });

    it('detects Fastly cache hit', () => {
      const status = getCacheStatus({
        'x-served-by': 'cache-iad-fastly',
        'x-cache': 'HIT',
        'surrogate-key': 'products locale:ar',
      });
      
      expect(status.hit).toBe(true);
      expect(status.provider).toBe('fastly');
      expect(status.tags).toEqual(['products', 'locale:ar']);
    });

    it('detects CloudFront cache hit', () => {
      const status = getCacheStatus({
        'x-cache': 'Hit from cloudfront',
      });
      
      expect(status.hit).toBe(true);
      expect(status.provider).toBe('cloudfront');
    });

    it('detects Akamai cache hit', () => {
      const status = getCacheStatus({
        'x-akamai-transformed': '9 12345 0 pmb=mRUM,1',
        'x-cache': 'TCP_HIT',
      });
      
      expect(status.hit).toBe(true);
      expect(status.provider).toBe('akamai');
    });

    it('returns false for unknown CDN', () => {
      const status = getCacheStatus({});
      
      expect(status.hit).toBe(false);
      expect(status.provider).toBeUndefined();
    });
  });

  describe('createCDNCacheMiddleware', () => {
    it('creates middleware that generates headers', () => {
      const middleware = createCDNCacheMiddleware('cloudflare', 'ar');
      const request = new Request('https://example.com/products');
      
      const headers = middleware(request);
      
      expect(headers['Cache-Control']).toContain('public');
      expect(headers['Cloudflare-CDN-Cache-Control']).toBeDefined();
    });

    it('extracts locale from query params', () => {
      const middleware = createCDNCacheMiddleware('cloudflare', 'en', {
        getTags: () => ['test'],
      });
      const request = new Request('https://example.com/products?locale=he');
      
      const headers = middleware(request);
      
      expect(headers['Surrogate-Key']).toContain('locale:he');
    });

    it('uses custom TTL function', () => {
      const middleware = createCDNCacheMiddleware('cloudflare', 'ar', {
        getTTL: () => 7200,
      });
      const request = new Request('https://example.com/products');
      
      const headers = middleware(request);
      
      expect(headers['Cache-Control']).toContain('max-age=7200');
    });

    it('uses custom tags function', () => {
      const middleware = createCDNCacheMiddleware('cloudflare', 'ar', {
        getTags: (req) => [new URL(req.url).pathname],
      });
      const request = new Request('https://example.com/products');
      
      const headers = middleware(request);
      
      expect(headers['Surrogate-Key']).toContain('/products');
    });

    it('uses custom isPrivate function', () => {
      const middleware = createCDNCacheMiddleware('cloudflare', 'ar', {
        isPrivate: () => true,
      });
      const request = new Request('https://example.com/account');
      
      const headers = middleware(request);
      
      expect(headers['Cache-Control']).toContain('private');
    });
  });

  describe('normalizeLocale', () => {
    it('lowercases locale', () => {
      expect(normalizeLocale('AR')).toBe('ar');
      expect(normalizeLocale('HE')).toBe('he');
    });

    it('replaces underscores with hyphens', () => {
      expect(normalizeLocale('ar_SA')).toBe('ar-sa');
      expect(normalizeLocale('he_IL')).toBe('he-il');
    });

    it('handles already normalized locales', () => {
      expect(normalizeLocale('ar')).toBe('ar');
      expect(normalizeLocale('ar-sa')).toBe('ar-sa');
    });
  });

  describe('isCacheableAtEdge', () => {
    it('returns false for authenticated content', () => {
      expect(isCacheableAtEdge('text/html', true)).toBe(false);
    });

    it('returns true for public HTML', () => {
      expect(isCacheableAtEdge('text/html', false)).toBe(true);
    });

    it('returns true for static assets', () => {
      expect(isCacheableAtEdge('image/png', false)).toBe(true);
      expect(isCacheableAtEdge('text/css', false)).toBe(true);
      expect(isCacheableAtEdge('application/javascript', false)).toBe(true);
    });

    it('returns false for form data content types', () => {
      expect(isCacheableAtEdge('application/x-www-form-urlencoded', false)).toBe(false);
      expect(isCacheableAtEdge('multipart/form-data', false)).toBe(false);
    });

    it('is case insensitive for non-cacheable types', () => {
      expect(isCacheableAtEdge('APPLICATION/X-WWW-FORM-URLENCODED', false)).toBe(false);
    });
  });
});
