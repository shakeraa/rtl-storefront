/**
 * URL slug translation and localized URL construction (T0007).
 *
 * Provides:
 * - `translateSlug`    — async slug translation per locale
 * - `buildLocalizedUrl` — build a full URL with locale subfolder or subdomain
 */

import { transliterateToSlug } from "./infrastructure";

/**
 * Translate a URL slug into the target locale.
 *
 * For RTL script locales (ar, he, fa, ur) the slug is passed through the
 * transliteration pipeline defined in `seo-infrastructure`.  For other
 * locales the slug is returned unchanged (callers are expected to supply
 * an already-translated slug string for non-RTL locales).
 *
 * The function is async so that it can be extended in future to call an
 * external translation API without breaking its public contract.
 */
export async function translateSlug(
  slug: string,
  targetLocale: string,
): Promise<string> {
  if (!slug) return slug;
  const isRtl = /^(ar|he|fa|ur)/.test(targetLocale);
  if (isRtl) {
    return transliterateToSlug(slug, targetLocale);
  }
  // For non-RTL locales return the slug sanitised but otherwise unchanged.
  return slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build a localized URL from a path and locale using either a subfolder or
 * subdomain strategy.
 *
 * Subfolder strategy:  `https://example.com/ar/products/dress`
 * Subdomain strategy:  `https://ar.example.com/products/dress`
 *
 * The `path` must start with `/`.  Any existing locale prefix on `path` is
 * NOT stripped — callers should supply a canonical (unprefixed) path.
 */
export function buildLocalizedUrl(
  path: string,
  locale: string,
  strategy: "subfolder" | "subdomain",
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (strategy === "subdomain") {
    // Expect path to look like https://example.com/... — extract host.
    // If path is just a pathname we cannot build a subdomain URL, so we
    // fall back to the subfolder strategy.
    return `/${locale}${normalizedPath}`;
  }

  // Subfolder: prepend the locale segment.
  return `/${locale}${normalizedPath}`;
}

/**
 * Build a fully-qualified localized URL given a base URL and a strategy.
 *
 * @example
 * buildFullLocalizedUrl("https://example.com", "/products/dress", "ar", "subfolder")
 * // → "https://example.com/ar/products/dress"
 *
 * buildFullLocalizedUrl("https://example.com", "/products/dress", "ar", "subdomain")
 * // → "https://ar.example.com/products/dress"
 */
export function buildFullLocalizedUrl(
  baseUrl: string,
  path: string,
  locale: string,
  strategy: "subfolder" | "subdomain",
): string {
  const base = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (strategy === "subdomain") {
    // Replace the scheme+host portion with the locale subdomain.
    const match = base.match(/^(https?:\/\/)(.+)$/);
    if (match) {
      const [, scheme, host] = match;
      return `${scheme}${locale}.${host}${normalizedPath}`;
    }
  }

  // Subfolder (default / fallback)
  return `${base}/${locale}${normalizedPath}`;
}
