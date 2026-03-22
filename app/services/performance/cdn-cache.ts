/**
 * CDN Edge Caching Service
 * 
 * Provides cache header generation for multiple CDN providers,
 * edge cache key generation with locale awareness, and cache purge helpers.
 */

export type CDNProvider = 'cloudflare' | 'fastly' | 'cloudfront' | 'akamai' | 'auto';

export interface CDNHeaders {
  'Cache-Control': string;
  'Surrogate-Control'?: string;
  'Surrogate-Key'?: string;
  'CDN-Cache-Control'?: string;
  'Cloudflare-CDN-Cache-Control'?: string;
  'Fastly-Debug'?: string;
  'Edge-Cache-Tag'?: string;
  'X-Edge-Cache-Key'?: string;
  'X-Cache-TTL'?: string;
}

export interface CacheKeyConfig {
  url: string;
  locale: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  currency?: string;
  region?: string;
  variant?: string;
}

export interface PurgeConfig {
  tags?: string[];
  url?: string;
  pattern?: string;
  soft?: boolean;
}

export interface EdgeTTLConfig {
  contentType: string;
  isDynamic?: boolean;
  isAuthenticated?: boolean;
}

// Default TTL values in seconds
const DEFAULT_TTLS = {
  // Static assets
  css: 86400 * 30, // 30 days
  js: 86400 * 30,  // 30 days
  image: 86400 * 7, // 7 days
  font: 86400 * 365, // 1 year
  static: 86400 * 30, // 30 days
  
  // Dynamic content
  html: 300, // 5 minutes
  json: 60,  // 1 minute
  api: 0,    // No cache by default for APIs
  
  // Translation-specific content
  translation: 3600, // 1 hour
  
  // Error responses
  error: 60, // 1 minute
} as const;

// Content type to TTL mapping
const CONTENT_TYPE_TTL: Record<string, number> = {
  'text/css': DEFAULT_TTLS.css,
  'text/javascript': DEFAULT_TTLS.js,
  'application/javascript': DEFAULT_TTLS.js,
  'image/png': DEFAULT_TTLS.image,
  'image/jpeg': DEFAULT_TTLS.image,
  'image/gif': DEFAULT_TTLS.image,
  'image/webp': DEFAULT_TTLS.image,
  'image/svg+xml': DEFAULT_TTLS.image,
  'font/woff2': DEFAULT_TTLS.font,
  'font/woff': DEFAULT_TTLS.font,
  'font/ttf': DEFAULT_TTLS.font,
  'text/html': DEFAULT_TTLS.html,
  'application/json': DEFAULT_TTLS.json,
  'application/translation+json': DEFAULT_TTLS.translation,
};

/**
 * Generate cache headers for a specific CDN provider
 */
export function generateCDNHeaders(
  cdnProvider: CDNProvider,
  locale: string,
  options: {
    ttl?: number;
    staleWhileRevalidate?: number;
    tags?: string[];
    isPrivate?: boolean;
    varyBy?: string[];
  } = {}
): CDNHeaders {
  const {
    ttl = 3600,
    staleWhileRevalidate = 86400,
    tags = [],
    isPrivate = false,
    varyBy = ['Accept-Language', 'Cookie'],
  } = options;

  switch (cdnProvider) {
    case 'cloudflare':
      return generateCloudflareHeaders(ttl, staleWhileRevalidate, tags, isPrivate, varyBy, locale);
    case 'fastly':
      return generateFastlyHeaders(ttl, staleWhileRevalidate, tags, isPrivate, varyBy, locale);
    case 'cloudfront':
      return generateCloudFrontHeaders(ttl, staleWhileRevalidate, tags, isPrivate, varyBy, locale);
    case 'akamai':
      return generateAkamaiHeaders(ttl, staleWhileRevalidate, tags, isPrivate, varyBy, locale);
    case 'auto':
    default:
      return generateUniversalHeaders(ttl, staleWhileRevalidate, tags, isPrivate, varyBy, locale);
  }
}

function generateCloudflareHeaders(
  ttl: number,
  staleWhileRevalidate: number,
  tags: string[],
  isPrivate: boolean,
  varyBy: string[],
  locale: string
): CDNHeaders {
  const headers: CDNHeaders = {
    'Cache-Control': buildCacheControl(ttl, staleWhileRevalidate, isPrivate, varyBy),
    'Cloudflare-CDN-Cache-Control': `max-age=${ttl}`,
  };

  if (tags.length > 0) {
    headers['Surrogate-Key'] = generateSurrogateKeys(tags, locale);
  }

  return headers;
}

function generateFastlyHeaders(
  ttl: number,
  staleWhileRevalidate: number,
  tags: string[],
  isPrivate: boolean,
  varyBy: string[],
  locale: string
): CDNHeaders {
  const headers: CDNHeaders = {
    'Cache-Control': buildCacheControl(ttl, staleWhileRevalidate, isPrivate, varyBy),
    'Surrogate-Control': `max-age=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`,
  };

  if (tags.length > 0) {
    headers['Surrogate-Key'] = generateSurrogateKeys(tags, locale);
  }

  return headers;
}

function generateCloudFrontHeaders(
  ttl: number,
  staleWhileRevalidate: number,
  tags: string[],
  isPrivate: boolean,
  varyBy: string[],
  locale: string
): CDNHeaders {
  const headers: CDNHeaders = {
    'Cache-Control': buildCacheControl(ttl, staleWhileRevalidate, isPrivate, varyBy),
  };

  if (tags.length > 0) {
    // CloudFront uses custom headers for cache tagging
    headers['Edge-Cache-Tag'] = generateSurrogateKeys(tags, locale);
  }

  return headers;
}

function generateAkamaiHeaders(
  ttl: number,
  staleWhileRevalidate: number,
  tags: string[],
  isPrivate: boolean,
  varyBy: string[],
  locale: string
): CDNHeaders {
  const headers: CDNHeaders = {
    'Cache-Control': buildCacheControl(ttl, staleWhileRevalidate, isPrivate, varyBy),
  };

  if (tags.length > 0) {
    headers['Edge-Cache-Tag'] = generateSurrogateKeys(tags, locale);
  }

  return headers;
}

function generateUniversalHeaders(
  ttl: number,
  staleWhileRevalidate: number,
  tags: string[],
  isPrivate: boolean,
  varyBy: string[],
  locale: string
): CDNHeaders {
  const headers: CDNHeaders = {
    'Cache-Control': buildCacheControl(ttl, staleWhileRevalidate, isPrivate, varyBy),
    'CDN-Cache-Control': `max-age=${ttl}`,
  };

  if (tags.length > 0) {
    headers['Surrogate-Key'] = generateSurrogateKeys(tags, locale);
  }

  return headers;
}

function buildCacheControl(
  ttl: number,
  staleWhileRevalidate: number,
  isPrivate: boolean,
  varyBy: string[]
): string {
  const directives: string[] = [];

  if (isPrivate) {
    directives.push('private');
  } else {
    directives.push('public');
  }

  directives.push(`max-age=${ttl}`);

  if (staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  // Add immutable for static assets with long TTL
  if (ttl > 86400 && !isPrivate) {
    directives.push('immutable');
  }

  // Add must-revalidate for private content
  if (isPrivate) {
    directives.push('must-revalidate');
  }

  return directives.join(', ');
}

/**
 * Generate a cache key for edge caching with locale awareness
 */
export function generateCacheKey(config: CacheKeyConfig): string {
  const { url, locale, deviceType, currency, region, variant } = config;

  const urlObj = new URL(url, 'http://localhost');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // Build cache key segments
  const segments: string[] = [locale];

  // Add optional segments
  if (deviceType) segments.push(deviceType);
  if (currency) segments.push(currency.toLowerCase());
  if (region) segments.push(region.toLowerCase());
  if (variant) segments.push(variant);

  // Include pathname
  segments.push(pathname);

  // Include relevant query parameters for translation content
  const translationParams = ['lang', 'locale', 't', 'translation'];
  const relevantParams: string[] = [];

  for (const param of translationParams) {
    if (searchParams.has(param)) {
      relevantParams.push(`${param}=${searchParams.get(param)}`);
    }
  }

  if (relevantParams.length > 0) {
    segments.push('?' + relevantParams.join('&'));
  }

  return segments.join('|');
}

/**
 * Generate cache key from URL string and locale (simplified interface)
 */
export function generateCacheKeyFromUrl(url: string, locale: string): string {
  return generateCacheKey({ url, locale });
}

/**
 * Get edge TTL based on content type
 */
export function getEdgeTTL(config: EdgeTTLConfig): number {
  const { contentType, isDynamic = false, isAuthenticated = false } = config;

  // Authenticated requests shouldn't be cached at the edge
  if (isAuthenticated) {
    return 0;
  }

  // Dynamic content gets shorter TTL
  if (isDynamic) {
    return 60; // 1 minute
  }

  // Look up content type
  const ttl = CONTENT_TYPE_TTL[contentType.toLowerCase()];
  if (ttl !== undefined) {
    return ttl;
  }

  // Default fallback based on content type prefix
  if (contentType.startsWith('image/')) return DEFAULT_TTLS.image;
  if (contentType.startsWith('font/')) return DEFAULT_TTLS.font;
  if (contentType.startsWith('text/')) return DEFAULT_TTLS.html;
  if (contentType.startsWith('application/json')) return DEFAULT_TTLS.json;

  return DEFAULT_TTLS.html;
}

/**
 * Generate Surrogate-Key header value with locale awareness
 */
export function generateSurrogateKeys(tags: string[], locale?: string): string {
  const processedTags = tags.map(tag => {
    // Add locale prefix to translation-related tags
    if (locale && (tag.startsWith('trans') || tag.includes('translation') || tag.includes('locale'))) {
      return `${locale}:${tag}`;
    }
    return tag;
  });

  // Add locale tag if provided
  if (locale && !processedTags.some(t => t === `locale:${locale}`)) {
    processedTags.push(`locale:${locale}`);
  }

  return processedTags.join(' ');
}

/**
 * Generate cache purge command/URL for different CDNs
 */
export function generatePurgeCommand(
  cdnProvider: CDNProvider,
  config: PurgeConfig
): { method: string; url?: string; headers?: Record<string, string>; body?: string } {
  const { tags, url, pattern, soft = false } = config;

  switch (cdnProvider) {
    case 'cloudflare':
      return generateCloudflarePurge(tags, url, pattern, soft);
    case 'fastly':
      return generateFastlyPurge(tags, url, pattern, soft);
    case 'cloudfront':
      return generateCloudFrontPurge(tags, url, pattern);
    case 'akamai':
      return generateAkamaiPurge(tags, url, pattern);
    default:
      return { method: 'POST', url: '/purge', body: JSON.stringify({ tags, url, pattern }) };
  }
}

function generateCloudflarePurge(
  tags?: string[],
  url?: string,
  pattern?: string,
  soft = false
): { method: string; headers: Record<string, string>; body: string } {
  const body: Record<string, unknown> = {};

  if (tags && tags.length > 0) {
    body.tags = tags;
  } else if (url) {
    body.files = [url];
  } else if (pattern) {
    body.purge_everything = true;
  }

  if (soft) {
    body.soft = true;
  }

  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function generateFastlyPurge(
  tags?: string[],
  url?: string,
  pattern?: string,
  soft = false
): { method: string; url?: string; headers: Record<string, string> } {
  const headers: Record<string, string> = {
    'Fastly-Soft-Purge': soft ? '1' : '0',
  };

  if (tags && tags.length > 0) {
    headers['Surrogate-Key'] = tags.join(' ');
    return { method: 'POST', headers };
  } else if (url) {
    return { method: 'PURGE', url, headers };
  } else if (pattern) {
    headers['Surrogate-Key'] = pattern;
    return { method: 'POST', headers };
  }

  return { method: 'POST', url: '/service/purge_all', headers };
}

function generateCloudFrontPurge(
  tags?: string[],
  url?: string,
  pattern?: string
): { method: string; headers: Record<string, string>; body: string } {
  // CloudFront uses invalidation paths
  const paths: string[] = [];

  if (url) {
    paths.push(url);
  } else if (pattern) {
    paths.push(pattern);
  } else if (tags && tags.length > 0) {
    // CloudFront doesn't support tag-based purging natively
    // Use wildcard as fallback
    paths.push('/*');
  } else {
    paths.push('/*');
  }

  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ Paths: { Items: paths, Quantity: paths.length } }),
  };
}

function generateAkamaiPurge(
  tags?: string[],
  url?: string,
  pattern?: string
): { method: string; headers: Record<string, string>; body: string } {
  const objects: string[] = [];

  if (url) {
    objects.push(url);
  } else if (pattern) {
    objects.push(pattern);
  } else if (tags && tags.length > 0) {
    // Akamai supports tag-based purging via CCU API
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    };
  }

  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ objects }),
  };
}

/**
 * Get cache status from response headers
 */
export function getCacheStatus(headers: Record<string, string | null>): {
  hit: boolean;
  provider?: CDNProvider;
  ttl?: number;
  tags?: string[];
} {
  // Check for Cloudflare
  const cfCacheStatus = headers['cf-cache-status'];
  if (cfCacheStatus) {
    return {
      hit: cfCacheStatus === 'HIT',
      provider: 'cloudflare',
      ttl: parseInt(headers['cf-ray']?.split('-')[1] || '0', 10) || undefined,
    };
  }

  // Check for Fastly
  const fastlyStatus = headers['x-served-by'];
  if (fastlyStatus && fastlyStatus.includes('fastly')) {
    return {
      hit: headers['x-cache'] === 'HIT',
      provider: 'fastly',
      tags: headers['surrogate-key']?.split(' '),
    };
  }

  // Check for CloudFront
  const cloudFrontStatus = headers['x-cache'];
  if (cloudFrontStatus && (cloudFrontStatus.includes('cloudfront') || cloudFrontStatus.includes('CloudFront'))) {
    return {
      hit: cloudFrontStatus.toLowerCase().includes('hit'),
      provider: 'cloudfront',
    };
  }

  // Check for Akamai
  const akamaiStatus = headers['x-akamai-transformed'];
  if (akamaiStatus) {
    return {
      hit: headers['x-cache'] === 'TCP_HIT',
      provider: 'akamai',
    };
  }

  return { hit: false };
}

/**
 * Create a middleware function for CDN cache headers
 */
export function createCDNCacheMiddleware(
  cdnProvider: CDNProvider,
  defaultLocale: string,
  options: {
    getTTL?: (request: Request) => number;
    getTags?: (request: Request) => string[];
    isPrivate?: (request: Request) => boolean;
  } = {}
) {
  return function cdnCacheMiddleware(request: Request): CDNHeaders {
    const url = new URL(request.url);
    const locale = url.searchParams.get('locale') || defaultLocale;

    const ttl = options.getTTL ? options.getTTL(request) : 3600;
    const tags = options.getTags ? options.getTags(request) : [];
    const isPrivate = options.isPrivate ? options.isPrivate(request) : false;

    return generateCDNHeaders(cdnProvider, locale, {
      ttl,
      tags,
      isPrivate,
    });
  };
}

/**
 * Normalize locale for cache key consistency
 */
export function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}

/**
 * Check if content type is cacheable at the edge
 */
export function isCacheableAtEdge(contentType: string, isAuthenticated: boolean): boolean {
  // Don't cache authenticated responses
  if (isAuthenticated) {
    return false;
  }

  // Don't cache these content types at edge
  const nonCacheableTypes = [
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];

  if (nonCacheableTypes.includes(contentType.toLowerCase())) {
    return false;
  }

  return true;
}
