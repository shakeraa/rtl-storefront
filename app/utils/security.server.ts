/**
 * Security Middleware Utility
 *
 * Provides easy-to-use wrappers around the security service for use in route
 * loaders and actions. Import from here instead of reaching into
 * app/services/security/ directly.
 */

import { sanitizeHTML, checkForXSS, escapeForAttribute, escapeForJS } from "../services/security/xss";
import { validateCSRFToken, generateCSRFToken } from "../services/security/csrf";
import { RateLimiter } from "../services/security/rate-limiter";

export { sanitizeHTML, checkForXSS, escapeForAttribute, escapeForJS };
export { generateCSRFToken, validateCSRFToken };

// ---------------------------------------------------------------------------
// Rate Limiting
// ---------------------------------------------------------------------------

/** Default rate limiter: 60 requests per 60 seconds, keyed by IP. */
const defaultLimiter = new RateLimiter({
  windowMs: 60_000,
  maxRequests: 60,
  keyGenerator: "ip",
  skipSuccessfulRequests: false,
});

/**
 * A cache of custom limiters so we don't create a new RateLimiter instance on
 * every request when a route specifies non-default options.
 */
const customLimiters = new Map<string, RateLimiter>();

function getLimiter(maxRequests: number, windowMs: number): RateLimiter {
  if (maxRequests === 60 && windowMs === 60_000) {
    return defaultLimiter;
  }

  const key = `${maxRequests}:${windowMs}`;
  let limiter = customLimiters.get(key);
  if (!limiter) {
    limiter = new RateLimiter({
      windowMs,
      maxRequests,
      keyGenerator: "ip",
      skipSuccessfulRequests: false,
    });
    customLimiters.set(key, limiter);
  }
  return limiter;
}

/**
 * Apply rate limiting to a request.
 * Call this at the top of actions/loaders that should be rate-limited.
 *
 * Throws a 429 Response if the limit is exceeded.
 */
export function applyRateLimit(
  request: Request,
  options: { maxRequests?: number; windowMs?: number } = {},
): void {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  const { maxRequests = 60, windowMs = 60_000 } = options;
  const limiter = getLimiter(maxRequests, windowMs);
  const result = limiter.check(ip);

  if (!result.allowed) {
    throw new Response("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter ?? 1),
      },
    });
  }
}
