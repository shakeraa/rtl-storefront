import { createHash } from "node:crypto";

/**
 * Asset types for cache header generation.
 * - immutable: Versioned assets that never change (hashed filenames)
 * - static: Static assets that change infrequently (images, fonts)
 * - dynamic: Content that may change periodically (translations, API responses)
 * - translation: Translation files specifically (locale-specific caching)
 */
export type AssetType = "immutable" | "static" | "dynamic" | "translation";

/**
 * Cache strategies with different directives and durations.
 */
export type CacheStrategy = "immutable" | "static" | "dynamic" | "translation";

/**
 * Configuration for cache header generation.
 */
export interface CacheHeadersConfig {
  /** Maximum age in seconds (max-age directive) */
  maxAge: number;
  /** Stale-while-revalidate duration in seconds */
  staleWhileRevalidate?: number;
  /** Whether the asset is immutable (immutable directive) */
  immutable?: boolean;
  /** Whether to include must-revalidate directive */
  mustRevalidate?: boolean;
  /** Whether to include no-cache directive */
  noCache?: boolean;
  /** Whether to include private directive (not cacheable by CDNs/proxies) */
  private?: boolean;
}

/**
 * Generated cache headers result.
 */
export interface CacheHeadersResult {
  "Cache-Control": string;
  ETag?: string;
  "Last-Modified"?: string;
  Vary?: string;
}

/**
 * Default cache durations in seconds for different asset types.
 */
export const CACHE_DURATIONS: Record<AssetType, number> = {
  immutable: 365 * 24 * 60 * 60, // 1 year
  static: 30 * 24 * 60 * 60, // 30 days
  dynamic: 5 * 60, // 5 minutes
  translation: 24 * 60 * 60, // 24 hours
};

/**
 * Stale-while-revalidate durations in seconds for different asset types.
 */
export const STALE_WHILE_REVALIDATE_DURATIONS: Record<AssetType, number> = {
  immutable: 0, // Not needed for immutable assets
  static: 7 * 24 * 60 * 60, // 7 days
  dynamic: 60, // 1 minute
  translation: 24 * 60 * 60, // 24 hours
};

/**
 * Version hash for cache busting.
 * In production, this should be set to the build version or git commit hash.
 */
let cacheVersion: string | null = null;

/**
 * Set the global cache version for cache busting.
 * Should be called during application startup with a build identifier.
 */
export function setCacheVersion(version: string): void {
  cacheVersion = version;
}

/**
 * Get the current cache version.
 * Returns a timestamp-based fallback if not explicitly set.
 */
export function getCacheVersion(): string {
  if (cacheVersion) {
    return cacheVersion;
  }
  // Fallback to a daily rotation for development
  return Math.floor(Date.now() / (24 * 60 * 60 * 1000)).toString(36);
}

/**
 * Generate a hash for cache busting based on content.
 * Uses SHA-256 to create a short, unique identifier.
 */
export function generateContentHash(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Generate an ETag for a resource.
 * ETags are used for conditional requests (If-None-Match / 304 responses).
 * 
 * For translation resources, includes locale and content hash.
 * Format: W/"<hash>" (weak ETag) or "<hash>" (strong ETag)
 */
export function generateETag(
  content: string | Buffer,
  options?: { 
    weak?: boolean; 
    locale?: string;
    prefix?: string;
  }
): string {
  const { weak = false, locale, prefix } = options ?? {};
  
  const contentHash = generateContentHash(content);
  let etag = contentHash;
  
  if (locale) {
    etag = `${locale}:${contentHash}`;
  }
  
  if (prefix) {
    etag = `${prefix}:${etag}`;
  }
  
  return weak ? `W/"${etag}"` : `"${etag}"`;
}

/**
 * Generate an ETag specifically for translation resources.
 * Includes locale and content versioning for efficient cache invalidation.
 */
export function generateTranslationETag(
  content: string | Buffer,
  locale: string,
  version?: string
): string {
  const versionSuffix = version ?? getCacheVersion();
  const contentHash = generateContentHash(content);
  
  // Format: "locale-contenthash-version"
  return `"${locale}-${contentHash}-${versionSuffix}"`;
}

/**
 * Get the cache duration in seconds for a given asset type.
 */
export function getCacheDuration(assetType: AssetType): number {
  return CACHE_DURATIONS[assetType] ?? CACHE_DURATIONS.dynamic;
}

/**
 * Get the stale-while-revalidate duration in seconds for a given asset type.
 */
export function getStaleWhileRevalidateDuration(assetType: AssetType): number {
  return STALE_WHILE_REVALIDATE_DURATIONS[assetType] ?? 0;
}

/**
 * Build a Cache-Control header value from directives.
 */
export function buildCacheControlHeader(config: CacheHeadersConfig): string {
  const directives: string[] = [];
  
  // Public/private directive
  if (config.private) {
    directives.push("private");
  } else {
    directives.push("public");
  }
  
  // Max-age directive
  directives.push(`max-age=${config.maxAge}`);
  
  // Immutable directive (for hashed assets that never change)
  if (config.immutable) {
    directives.push("immutable");
  }
  
  // Stale-while-revalidate directive
  if (config.staleWhileRevalidate && config.staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  
  // Must-revalidate directive
  if (config.mustRevalidate) {
    directives.push("must-revalidate");
  }
  
  // No-cache directive (forces revalidation)
  if (config.noCache) {
    directives.push("no-cache");
  }
  
  return directives.join(", ");
}

/**
 * Generate cache headers for an asset based on its type and locale.
 * 
 * @param assetType - Type of asset (immutable, static, dynamic, translation)
 * @param locale - Optional locale for locale-specific caching
 * @param options - Additional options for header generation
 * @returns Object containing cache-related headers
 */
export function generateCacheHeaders(
  assetType: AssetType,
  locale?: string,
  options?: {
    content?: string | Buffer;
    contentVersion?: string;
    varyByLocale?: boolean;
    customMaxAge?: number;
  }
): CacheHeadersResult {
  const result: CacheHeadersResult = {
    "Cache-Control": "",
  };
  
  const maxAge = options?.customMaxAge ?? getCacheDuration(assetType);
  const staleWhileRevalidate = getStaleWhileRevalidateDuration(assetType);
  
  const config: CacheHeadersConfig = {
    maxAge,
    staleWhileRevalidate,
    immutable: assetType === "immutable",
    mustRevalidate: assetType === "dynamic",
    private: false,
  };
  
  result["Cache-Control"] = buildCacheControlHeader(config);
  
  // Generate ETag if content is provided
  if (options?.content !== undefined) {
    if (assetType === "translation" && locale) {
      result.ETag = generateTranslationETag(
        options.content,
        locale,
        options.contentVersion
      );
    } else {
      result.ETag = generateETag(options.content, {
        locale,
        prefix: assetType,
      });
    }
  }
  
  // Set Vary header for locale-aware caching
  if (locale && options?.varyByLocale !== false) {
    result.Vary = "Accept-Language";
  }
  
  return result;
}

/**
 * Generate cache headers for static assets (images, CSS, JS, fonts).
 * Uses aggressive caching with stale-while-revalidate for optimal performance.
 */
export function generateStaticAssetHeaders(
  assetPath: string,
  options?: {
    content?: string | Buffer;
    isVersioned?: boolean;
  }
): CacheHeadersResult {
  // Check if the asset has a version hash in the filename
  // Pattern: file.[hash].ext or file-[hash].ext
  const hasHashInName = /[.\-][a-f0-9]{8,20}\./i.test(assetPath);
  const isVersioned = options?.isVersioned ?? hasHashInName;
  
  const assetType: AssetType = isVersioned ? "immutable" : "static";
  
  return generateCacheHeaders(assetType, undefined, {
    content: options?.content,
  });
}

/**
 * Generate cache headers for translation resources.
 * Uses shorter cache duration with stale-while-revalidate for freshness.
 */
export function generateTranslationHeaders(
  locale: string,
  content: string | Buffer,
  options?: {
    version?: string;
    varyByLocale?: boolean;
  }
): CacheHeadersResult {
  return generateCacheHeaders("translation", locale, {
    content,
    contentVersion: options?.version,
    varyByLocale: options?.varyByLocale,
  });
}

/**
 * Generate cache headers for dynamic API responses.
 * Uses short cache duration with must-revalidate for freshness.
 */
export function generateDynamicHeaders(
  options?: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    private?: boolean;
  }
): CacheHeadersResult {
  const config: CacheHeadersConfig = {
    maxAge: options?.maxAge ?? CACHE_DURATIONS.dynamic,
    staleWhileRevalidate: options?.staleWhileRevalidate ?? 60,
    mustRevalidate: true,
    private: options?.private ?? false,
  };
  
  return {
    "Cache-Control": buildCacheControlHeader(config),
  };
}

/**
 * Generate cache headers for immutable assets (hashed filenames).
 * Uses maximum cache duration with immutable directive.
 */
export function generateImmutableHeaders(
  options?: {
    content?: string | Buffer;
  }
): CacheHeadersResult {
  return generateCacheHeaders("immutable", undefined, {
    content: options?.content,
  });
}

/**
 * Check if a request can use a cached response based on ETag matching.
 * Returns true if the If-None-Match header matches the current ETag.
 */
export function isETagMatch(
  requestHeaders: Headers,
  currentETag: string
): boolean {
  const ifNoneMatch = requestHeaders.get("if-none-match");
  
  if (!ifNoneMatch) {
    return false;
  }
  
  // Handle wildcard match
  if (ifNoneMatch === "*") {
    return true;
  }
  
  // Handle weak ETag comparison (remove W/ prefix for comparison)
  const normalizeETag = (etag: string): string => {
    return etag.replace(/^W\//i, "").trim();
  };
  
  const currentNormalized = normalizeETag(currentETag);
  
  // Check if any of the provided ETags match
  const providedETags = ifNoneMatch.split(",").map((etag) => normalizeETag(etag));
  
  return providedETags.includes(currentNormalized);
}

/**
 * Create a 304 Not Modified response for conditional requests.
 */
export function createNotModifiedResponse(
  requestHeaders: Headers,
  responseHeaders: Headers
): Response | null {
  const etag = responseHeaders.get("etag");
  
  if (!etag) {
    return null;
  }
  
  if (!isETagMatch(requestHeaders, etag)) {
    return null;
  }
  
  // Return 304 Not Modified with cache headers
  const headers = new Headers();
  headers.set("ETag", etag);
  headers.set("Cache-Control", responseHeaders.get("cache-control") ?? "");
  
  const lastModified = responseHeaders.get("last-modified");
  if (lastModified) {
    headers.set("Last-Modified", lastModified);
  }
  
  return new Response(null, { status: 304, headers });
}

/**
 * Parse a Cache-Control header string into a config object.
 * Useful for testing and debugging.
 */
export function parseCacheControlHeader(header: string): Partial<CacheHeadersConfig> {
  const config: Partial<CacheHeadersConfig> = {};
  const directives = header.split(",").map((d) => d.trim().toLowerCase());
  
  for (const directive of directives) {
    if (directive === "public") {
      config.private = false;
    } else if (directive === "private") {
      config.private = true;
    } else if (directive === "immutable") {
      config.immutable = true;
    } else if (directive === "must-revalidate") {
      config.mustRevalidate = true;
    } else if (directive === "no-cache") {
      config.noCache = true;
    } else if (directive.startsWith("max-age=")) {
      config.maxAge = parseInt(directive.slice(8), 10);
    } else if (directive.startsWith("stale-while-revalidate=")) {
      config.staleWhileRevalidate = parseInt(directive.slice(23), 10);
    }
  }
  
  return config;
}

/**
 * Calculate the cache hit ratio from cache metrics.
 */
export function calculateCacheHitRatio(hits: number, misses: number): number {
  const total = hits + misses;
  return total > 0 ? hits / total : 0;
}

/**
 * Determine if a resource should be cached based on request headers.
 */
export function shouldCacheResource(request: Request): boolean {
  const cacheControl = request.headers.get("cache-control");
  
  // Respect no-cache request directive
  if (cacheControl?.includes("no-cache")) {
    return false;
  }
  
  // Don't cache if explicitly requested
  const pragma = request.headers.get("pragma");
  if (pragma === "no-cache") {
    return false;
  }
  
  return true;
}

/**
 * Get recommended cache duration based on file extension.
 */
export function getCacheDurationByExtension(extension: string): number {
  const ext = extension.toLowerCase().replace(/^\./, "");
  
  // Immutable assets (hashed bundles)
  if (ext === "js" || ext === "css" || ext === "mjs") {
    return CACHE_DURATIONS.immutable;
  }
  
  // Static assets
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "woff", "woff2", "ttf", "eot"].includes(ext)) {
    return CACHE_DURATIONS.static;
  }
  
  // Dynamic content
  if (["json", "xml", "html", "htm"].includes(ext)) {
    return CACHE_DURATIONS.dynamic;
  }
  
  // Default
  return CACHE_DURATIONS.dynamic;
}
