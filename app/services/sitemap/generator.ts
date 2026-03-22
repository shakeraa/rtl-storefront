import type { SitemapGeneratorInput, SitemapUrl } from "./types";

/**
 * Generate a full XML sitemap with hreflang alternate annotations.
 *
 * Each page gets one `<url>` entry per locale, and every entry includes
 * `<xhtml:link rel="alternate" ...>` elements for all locales plus an
 * `x-default` pointing to the default locale URL.
 */
export function generateSitemapXml(input: SitemapGeneratorInput): string {
  const { pages, config } = input;
  const baseUrl = config.baseUrl.replace(/\/+$/, "");

  const urls: SitemapUrl[] = [];

  for (const page of pages) {
    const path = normalizePath(page.path);

    // Build the set of alternate links for this page (all locales + x-default)
    const alternates: Array<{ locale: string; href: string }> = config.locales.map(
      (locale) => ({
        locale,
        href: buildLocaleUrl(baseUrl, path, locale, config.defaultLocale),
      }),
    );

    // x-default points to the default locale URL
    const defaultUrl = buildLocaleUrl(baseUrl, path, config.defaultLocale, config.defaultLocale);
    alternates.push({ locale: "x-default", href: defaultUrl });

    // Create one <url> entry per locale
    for (const locale of config.locales) {
      const loc = buildLocaleUrl(baseUrl, path, locale, config.defaultLocale);

      urls.push({
        loc,
        lastmod: page.lastmod,
        changefreq: page.changefreq,
        priority: page.priority,
        alternates,
      });
    }
  }

  return buildSitemapXml(urls);
}

/**
 * Generate a sitemap index XML that references individual sitemap files.
 */
export function generateSitemapIndex(
  sitemaps: Array<{ loc: string; lastmod?: string }>,
): string {
  const entries = sitemaps
    .map((sitemap) => {
      const lastmodTag = sitemap.lastmod
        ? `\n    <lastmod>${escapeXml(sitemap.lastmod)}</lastmod>`
        : "";
      return `  <sitemap>\n    <loc>${escapeXml(sitemap.loc)}</loc>${lastmodTag}\n  </sitemap>`;
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</sitemapindex>",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build the full XML string for a list of sitemap URL entries.
 */
function buildSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map((url) => {
    const parts: string[] = [];
    parts.push("  <url>");
    parts.push(`    <loc>${escapeXml(url.loc)}</loc>`);

    if (url.lastmod) {
      parts.push(`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`);
    }
    if (url.changefreq) {
      parts.push(`    <changefreq>${escapeXml(url.changefreq)}</changefreq>`);
    }
    if (url.priority !== undefined) {
      parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
    }

    if (url.alternates && url.alternates.length > 0) {
      for (const alt of url.alternates) {
        parts.push(
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.locale)}" href="${escapeXml(alt.href)}" />`,
        );
      }
    }

    parts.push("  </url>");
    return parts.join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urlEntries.join("\n"),
    "</urlset>",
  ].join("\n");
}

/**
 * Build a full URL for a given locale.
 *
 * The default locale lives at the root (no prefix); non-default locales
 * are placed under their language subfolder (e.g., /ar/products).
 */
function buildLocaleUrl(
  baseUrl: string,
  path: string,
  locale: string,
  defaultLocale: string,
): string {
  if (locale === defaultLocale) {
    return `${baseUrl}${path}`;
  }
  return `${baseUrl}/${locale}${path === "/" ? "" : path}`;
}

/**
 * Ensure a path starts with "/" and has no trailing slash (except root).
 */
function normalizePath(path: string): string {
  let p = path.trim();
  if (!p.startsWith("/")) {
    p = `/${p}`;
  }
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

/**
 * Escape special XML characters in a string.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
