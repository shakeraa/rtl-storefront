/**
 * Shared hreflang URL builder.
 *
 * Centralises the logic for building hreflang alternate URLs so that
 * meta-tags, sitemap, SEO hreflang, and URL-slug services all share
 * the same URL-construction rules.
 */

export interface HreflangEntry {
  locale: string;
  url: string;
}

/**
 * Build hreflang URL entries for every locale plus an x-default entry.
 *
 * The default locale lives at the bare path (no prefix); non-default
 * locales are placed under their language subfolder
 * (e.g., `https://example.com/ar/products/dress`).
 *
 * @param baseUrl       - Origin without trailing slash (e.g. `https://example.com`)
 * @param path          - Path starting with `/` (e.g. `/products/dress`)
 * @param locales       - All supported locale codes
 * @param defaultLocale - The locale that maps to the bare (unprefixed) path
 */
export function buildHreflangUrls(
  baseUrl: string,
  path: string,
  locales: string[],
  defaultLocale: string,
): HreflangEntry[] {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path === "/" ? "" : path;

  const entries: HreflangEntry[] = locales.map((locale) => ({
    locale,
    url:
      locale === defaultLocale
        ? `${normalizedBase}${normalizedPath || "/"}`
        : `${normalizedBase}/${locale}${normalizedPath}`,
  }));

  // x-default always points at the default-locale (unprefixed) URL
  entries.push({
    locale: "x-default",
    url: `${normalizedBase}${normalizedPath || "/"}`,
  });

  return entries;
}

/**
 * Format hreflang entries as HTML `<link>` elements suitable for `<head>`.
 */
export function formatAsHtmlLinks(entries: HreflangEntry[]): string {
  return entries
    .map(
      (e) =>
        `<link rel="alternate" hreflang="${e.locale}" href="${e.url}" />`,
    )
    .join("\n");
}

/**
 * Format hreflang entries as `<xhtml:link>` elements for XML sitemaps.
 */
export function formatAsSitemapLinks(entries: HreflangEntry[]): string {
  return entries
    .map(
      (e) =>
        `<xhtml:link rel="alternate" hreflang="${e.locale}" href="${e.url}" />`,
    )
    .join("\n");
}
