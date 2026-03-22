/**
 * CSRF Protection Service (T0185)
 *
 * Token-based CSRF protection with in-memory store.
 */

import type { CSRFToken } from "./types";

/** In-memory token store: session key -> CSRFToken */
const tokenStore = new Map<string, CSRFToken>();

/** Token expiry duration: 1 hour */
const TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Generates a new CSRF token with 1-hour expiry.
 */
export function generateCSRFToken(): CSRFToken {
  const token: CSRFToken = {
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  };

  tokenStore.set(token.token, token);
  return token;
}

/**
 * Validates a CSRF token against the stored version.
 * Returns true only if the token matches and has not expired.
 */
export function validateCSRFToken(token: string, stored: CSRFToken): boolean {
  if (!token || !stored) return false;

  // Constant-time-ish comparison (both are UUIDs so same length)
  if (token.length !== stored.token.length) return false;

  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ stored.token.charCodeAt(i);
  }

  if (mismatch !== 0) return false;

  // Check expiry
  if (new Date() > stored.expiresAt) {
    tokenStore.delete(stored.token);
    return false;
  }

  return true;
}

/**
 * Returns the standard CSRF cookie name.
 */
export function getCSRFCookieName(): string {
  return "_csrf";
}

/**
 * Builds a Set-Cookie header string for the CSRF token.
 */
export function buildCSRFCookie(token: string): string {
  const maxAge = Math.floor(TOKEN_TTL_MS / 1000);
  return `${getCSRFCookieName()}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${maxAge}`;
}

/**
 * Retrieves a stored token by its value.
 */
export function getStoredToken(token: string): CSRFToken | undefined {
  return tokenStore.get(token);
}

/**
 * Cleans up all expired tokens from the in-memory store.
 */
export function cleanupExpiredTokens(): number {
  const now = new Date();
  let removed = 0;

  for (const [key, value] of tokenStore) {
    if (now > value.expiresAt) {
      tokenStore.delete(key);
      removed++;
    }
  }

  return removed;
}
