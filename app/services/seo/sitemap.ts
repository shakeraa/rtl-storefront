/**
 * Multi-language XML sitemap generator (T0007).
 *
 * A thin, self-contained sitemap generator that covers the interface
 * described in the T0007 spec.  For the full-featured implementation
 * (hreflang annotations, sitemap index, priority, changefreq) see
 * `app/services/sitemap/generator.ts`.
 */

export interface SitemapUrlEntry {
  loc: string;
  /** ISO 8601 date string, e.g. "2026-01-15" */
  lastmod?: string;
  locales?: string[];
}

/**
 * Generate a minimal multi-language XML sitemap.
 *
 * Each entry in `urls` describes one canonical URL.  If `locales` are
 * supplied on an entry, an `<xhtml:link rel="alternate">` block is added
 * for every locale (plus `x-default` pointing at `loc`).
 *
 * @example
 * generateSitemap([
 *   { loc: "https://example.com/products/dress", locales: ["en", "ar"] },
 * ])
 */
export function generateSitemap(
  urls: { loc: string; locales?: string[] }[],
): string {
  const urlBlocks = urls.map((entry) => buildUrlBlock(entry));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlBlocks.join("\n"),
    "</urlset>",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildUrlBlock(entry: { loc: string; locales?: string[] }): string {
  const parts: string[] = [];
  parts.push("  <url>");
  parts.push(`    <loc>${escapeXml(entry.loc)}</loc>`);

  if (entry.locales && entry.locales.length > 0) {
    for (const locale of entry.locales) {
      const href = buildLocaleHref(entry.loc, locale);
      parts.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(href)}" />`,
      );
    }
    // x-default points at the canonical loc (first locale / base URL)
    parts.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(entry.loc)}" />`,
    );
  }

  parts.push("  </url>");
  return parts.join("\n");
}

/**
 * Derive a locale-specific URL from a canonical URL.
 *
 * Strategy: if the URL already contains the locale segment we return it
 * as-is; otherwise we insert the locale after the origin.
 *
 * For the first (default) locale we return the URL unchanged — the
 * x-default entry already handles this case.
 */
function buildLocaleHref(canonicalUrl: string, locale: string): string {
  try {
    const parsed = new URL(canonicalUrl);
    // If the path already starts with /locale return unchanged.
    if (
      parsed.pathname === `/${locale}` ||
      parsed.pathname.startsWith(`/${locale}/`)
    ) {
      return canonicalUrl;
    }
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.origin}/${locale}${path}`;
  } catch {
    // Fallback for relative URLs.
    return `/${locale}${canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`}`;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
