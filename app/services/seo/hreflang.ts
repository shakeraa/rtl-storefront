/**
 * Hreflang tag generation for multilingual pages (T0007).
 *
 * Produces `<link rel="alternate" hreflang="...">` tags for every
 * configured locale plus an `x-default` pointing at the canonical
 * default-locale URL.
 *
 * Delegates URL construction to the shared hreflang builder in
 * `app/utils/hreflang.server.ts`.
 */

import {
  buildHreflangUrls,
  type HreflangEntry,
} from "../../utils/hreflang.server";

export interface HreflangTag {
  locale: string;
  url: string;
}

/**
 * Generate hreflang link tags for all given locales.
 *
 * The `baseUrl` is expected to be the canonical URL for the current page
 * WITHOUT any locale prefix (e.g. `https://example.com/products/dress`).
 * Non-default locales are placed under their subfolder
 * (e.g. `https://example.com/ar/products/dress`).
 *
 * The first entry in `locales` is treated as the default locale and
 * receives no subfolder prefix. An extra `x-default` tag is appended
 * pointing at the same URL as the default locale.
 */
export function generateHreflangTags(
  baseUrl: string,
  locales: string[],
  currentLocale: string,
): HreflangTag[] {
  if (!locales || locales.length === 0) {
    return [];
  }

  const defaultLocale = locales[0];
  const { origin, pathname } = parseUrl(baseUrl);

  // Strip any existing locale prefix so we work from a clean path.
  const cleanPath = stripLocalePrefix(pathname, locales);

  // Use the shared builder for URL construction
  const entries: HreflangEntry[] = buildHreflangUrls(
    origin,
    cleanPath,
    locales,
    defaultLocale,
  );

  return entries.map((e) => ({ locale: e.locale, url: e.url }));
}

/**
 * Return the x-default URL for a given base URL.
 *
 * The x-default URL is the URL without any locale prefix — it signals to
 * search engines which page to show when no locale preference is known.
 */
export function getXDefaultUrl(baseUrl: string): string {
  const { origin, pathname } = parseUrl(baseUrl);
  // We cannot know the locales list here, so we just return the URL as-is
  // (the caller should pass in an already-stripped base URL).
  return `${origin}${pathname === "/" ? "" : pathname}` || origin;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function stripLocalePrefix(pathname: string, locales: string[]): string {
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

function parseUrl(url: string): { origin: string; pathname: string } {
  try {
    const parsed = new URL(url);
    return { origin: parsed.origin, pathname: parsed.pathname };
  } catch {
    // Fallback for relative paths or malformed URLs.
    const match = url.match(/^(https?:\/\/[^/]+)(\/.*)?$/);
    if (match) {
      return { origin: match[1], pathname: match[2] ?? "/" };
    }
    return { origin: url, pathname: "/" };
  }
}
