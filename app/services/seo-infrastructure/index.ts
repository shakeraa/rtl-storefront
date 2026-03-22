/**
 * SEO Infrastructure Service
 *
 * Consolidated service covering:
 * - T0007: Multilingual SEO infrastructure (hreflang, canonical)
 * - T0038: Translated URL slugs with Arabic/Hebrew transliteration
 * - T0075: Localized breadcrumb JSON-LD schema
 * - T0078: Language-specific robots.txt and X-Robots-Tag headers
 */

// ---------------------------------------------------------------------------
// T0007 - Multilingual SEO infrastructure
// ---------------------------------------------------------------------------

export interface SEOConfig {
  shop: string;
  defaultLocale: string;
  locales: string[];
  baseUrl: string;
}

/**
 * Generate `<link rel="alternate" hreflang="...">` tags for every configured
 * locale plus an x-default pointing to the default locale.
 */
export function generateHreflangMeta(
  url: string,
  config: SEOConfig,
): string[] {
  const path = stripLocalePrefix(url, config);
  const tags: string[] = [];

  for (const locale of config.locales) {
    const href = buildLocalizedHref(path, locale, config);
    tags.push(
      `<link rel="alternate" hreflang="${locale}" href="${href}" />`,
    );
  }

  // x-default points at the default locale variant
  const defaultHref = buildLocalizedHref(path, config.defaultLocale, config);
  tags.push(
    `<link rel="alternate" hreflang="x-default" href="${defaultHref}" />`,
  );

  return tags;
}

/**
 * Generate a canonical URL for a given locale.
 */
export function generateCanonical(
  url: string,
  locale: string,
  config: SEOConfig,
): string {
  const path = stripLocalePrefix(url, config);
  return buildLocalizedHref(path, locale, config);
}

// ---------------------------------------------------------------------------
// T0038 - Translated URL slugs
// ---------------------------------------------------------------------------

/**
 * Arabic character → Latin transliteration map (~30 common mappings).
 */
export const TRANSLITERATION_MAP: Record<string, string> = {
  // Arabic
  "ا": "a",
  "أ": "a",
  "إ": "i",
  "آ": "aa",
  "ب": "b",
  "ت": "t",
  "ث": "th",
  "ج": "j",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ذ": "dh",
  "ر": "r",
  "ز": "z",
  "س": "s",
  "ش": "sh",
  "ص": "s",
  "ض": "d",
  "ط": "t",
  "ع": "a",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ك": "k",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ه": "h",
  "و": "w",
  "ي": "y",
  "ة": "a",
  // Hebrew
  "א": "a",
  "ב": "b",
  "ג": "g",
  "ד": "d",
  "ה": "h",
  "ו": "v",
  "ז": "z",
  "ח": "ch",
  "ט": "t",
  "י": "y",
  "כ": "k",
  "ך": "k",
  "ל": "l",
  "מ": "m",
  "ם": "m",
  "נ": "n",
  "ן": "n",
  "ס": "s",
  "ע": "a",
  "פ": "p",
  "ף": "f",
  "צ": "ts",
  "ץ": "ts",
  "ק": "q",
  "ר": "r",
  "ש": "sh",
  "ת": "t",
};

/**
 * Transliterate Arabic / Hebrew text into a URL-safe slug.
 * Latin-script locales simply get lowercased + hyphenated.
 */
export function transliterateToSlug(text: string, locale: string): string {
  const isRtlScript = /^(ar|he|fa|ur)/.test(locale);

  let slug = text;

  if (isRtlScript) {
    slug = Array.from(slug)
      .map((ch) => TRANSLITERATION_MAP[ch] ?? ch)
      .join("");
  }

  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^\w\s-]/g, "")        // remove non-word chars
    .replace(/[\s_]+/g, "-")         // spaces/underscores → hyphens
    .replace(/-+/g, "-")             // collapse multiple hyphens
    .replace(/^-|-$/g, "");          // trim leading/trailing hyphens
}

/**
 * Build a fully-qualified translated URL for a given resource.
 */
export function buildTranslatedUrl(
  slug: string,
  locale: string,
  resourceType: string,
): string {
  const prefix = `/${locale}`;
  const typePath = resourceType === "product"
    ? "/products"
    : resourceType === "collection"
      ? "/collections"
      : resourceType === "page"
        ? "/pages"
        : "";

  return `${prefix}${typePath}/${slug}`;
}

// ---------------------------------------------------------------------------
// T0075 - Breadcrumb schema (localized JSON-LD)
// ---------------------------------------------------------------------------

/**
 * Generate a BreadcrumbList JSON-LD string with locale-aware item names.
 */
export function generateLocalizedBreadcrumbs(
  items: Array<{ name: string; url: string }>,
  locale: string,
): string {
  const listItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: locale,
    itemListElement: listItems,
  };

  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// ---------------------------------------------------------------------------
// T0078 - Language-specific robots.txt
// ---------------------------------------------------------------------------

/**
 * Generate a robots.txt that includes per-locale sitemaps and
 * locale-prefixed allow/disallow rules.
 */
export function generateRobotsTxt(config: SEOConfig): string {
  const lines: string[] = [
    "User-agent: *",
    "",
  ];

  // Allow locale-prefixed paths
  for (const locale of config.locales) {
    lines.push(`Allow: /${locale}/`);
  }

  // Disallow admin and API paths
  lines.push("");
  lines.push("Disallow: /admin");
  lines.push("Disallow: /cart");
  lines.push("Disallow: /checkout");
  lines.push("Disallow: /account");
  lines.push("");

  // Per-locale sitemaps
  for (const locale of config.locales) {
    const sitemapUrl = `${normalizeBaseUrl(config.baseUrl)}/sitemap-${locale}.xml`;
    lines.push(`Sitemap: ${sitemapUrl}`);
  }

  return lines.join("\n");
}

/**
 * Return X-Robots-Tag headers appropriate for the given locale.
 */
export function getRobotsHeaders(locale: string): Record<string, string> {
  return {
    "X-Robots-Tag": "index, follow",
    "Content-Language": locale,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function stripLocalePrefix(url: string, config: SEOConfig): string {
  for (const locale of config.locales) {
    const prefix = `/${locale}`;
    if (url === prefix || url.startsWith(`${prefix}/`)) {
      return url.slice(prefix.length) || "/";
    }
  }
  return url;
}

function buildLocalizedHref(
  path: string,
  locale: string,
  config: SEOConfig,
): string {
  const base = normalizeBaseUrl(config.baseUrl);
  const localePrefix = locale === config.defaultLocale ? "" : `/${locale}`;
  const normalizedPath = path === "/" ? "" : path;
  return `${base}${localePrefix}${normalizedPath}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}
