/**
 * T0015 — Edge caching strategy helpers.
 *
 * Provides utilities for setting Cache-Control / CDN headers on Remix
 * responses and for deciding at the loader level whether a request is
 * eligible for edge/CDN caching.
 */

// ---------------------------------------------------------------------------
// Header builders
// ---------------------------------------------------------------------------

/**
 * Returns Cache-Control headers suitable for edge (CDN) caching.
 *
 * @param maxAge               Seconds the CDN may serve a cached copy.
 * @param staleWhileRevalidate Seconds the CDN may serve stale content while
 *                             fetching a fresh copy in the background.
 *                             Defaults to maxAge when omitted.
 */
export function getEdgeCacheHeaders(
  maxAge: number,
  staleWhileRevalidate?: number,
): Record<string, string> {
  const swr = staleWhileRevalidate ?? maxAge;
  const cacheControl = [
    "public",
    `max-age=${maxAge}`,
    `s-maxage=${maxAge}`,
    `stale-while-revalidate=${swr}`,
  ].join(", ");

  return {
    "Cache-Control": cacheControl,
    // Hint to Cloudflare / Fastly / Vercel edge layers
    "CDN-Cache-Control": cacheControl,
    Vary: "Accept-Language, Accept-Encoding",
  };
}

/**
 * Returns Cache-Control headers that prevent any caching.
 * Use this for authenticated or user-specific responses.
 */
export function getNoCacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
  };
}

/**
 * Returns headers for browser-only caching (no shared/CDN caching).
 */
export function getBrowserCacheHeaders(maxAge: number): Record<string, string> {
  return {
    "Cache-Control": `private, max-age=${maxAge}`,
  };
}

// ---------------------------------------------------------------------------
// Request eligibility
// ---------------------------------------------------------------------------

const CACHEABLE_METHODS = new Set(["GET", "HEAD"]);

const NON_CACHEABLE_PATH_PATTERNS = [
  /^\/api\/auth/,
  /^\/auth/,
  /^\/admin\/session/,
  /^\/webhooks/,
  /^\/billing/,
];

/**
 * Returns true when the request is a candidate for edge/CDN caching:
 * - HTTP method is GET or HEAD
 * - URL does not match auth / session / webhook paths
 * - No `Authorization` header is present (indicates a user-specific call)
 * - No `Cookie` header indicates a logged-in session (heuristic)
 */
export function shouldCache(request: Request): boolean {
  if (!CACHEABLE_METHODS.has(request.method)) return false;

  const url = new URL(request.url);

  for (const pattern of NON_CACHEABLE_PATH_PATTERNS) {
    if (pattern.test(url.pathname)) return false;
  }

  // Requests carrying an Authorization header are user-specific
  if (request.headers.get("Authorization")) return false;

  return true;
}

/**
 * Returns a normalized cache key derived from the request URL.
 * Query parameters are sorted to maximise cache-hit rate.
 */
export function getCacheKey(request: Request): string {
  const url = new URL(request.url);
  // Sort search params for cache-key stability
  const sorted = [...url.searchParams.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  url.search = new URLSearchParams(sorted).toString();
  return url.toString();
}
