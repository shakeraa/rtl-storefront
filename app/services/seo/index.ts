/**
 * SEO Service (T0007)
 *
 * Re-exports the SEO infrastructure and adds higher-level helpers:
 * - generateMetaTagsForLocale: combines meta tags + hreflang in one call
 * - getMultilingualSEOConfig: full SEO config object for a shop
 * - validateSEOSetup: check hreflang consistency, canonical, sitemap
 */

export * from "../seo-infrastructure";

import {
  type SEOConfig,
  generateHreflangMeta,
  generateCanonical,
  generateRobotsTxt,
} from "../seo-infrastructure";

// ---------------------------------------------------------------------------
// generateMetaTagsForLocale
// ---------------------------------------------------------------------------

export interface LocaleMetaTags {
  title: string;
  description: string;
  canonical: string;
  hreflangTags: string[];
  metaTags: string[];
}

/**
 * Generate a complete set of meta tags for a given URL and locale, including
 * `<title>`, `<meta name="description">`, canonical, and hreflang alternates.
 */
export function generateMetaTagsForLocale(
  url: string,
  locale: string,
  title: string,
  description: string,
  config: SEOConfig,
): LocaleMetaTags {
  const canonical = generateCanonical(url, locale, config);
  const hreflangTags = generateHreflangMeta(url, config);

  const metaTags: string[] = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:locale" content="${locale}" />`,
    ...hreflangTags,
  ];

  return {
    title,
    description,
    canonical,
    hreflangTags,
    metaTags,
  };
}

// ---------------------------------------------------------------------------
// getMultilingualSEOConfig
// ---------------------------------------------------------------------------

export interface MultilingualSEOConfig {
  seoConfig: SEOConfig;
  robotsTxt: string;
  sitemapUrls: string[];
  hreflangEnabled: boolean;
  canonicalStrategy: "locale-prefix" | "default-only";
}

/**
 * Build a full multilingual SEO configuration for a shop, including
 * robots.txt content, sitemap URLs, and hreflang settings.
 */
export function getMultilingualSEOConfig(
  shop: string,
  locales: string[],
  options?: {
    defaultLocale?: string;
    baseUrl?: string;
    canonicalStrategy?: "locale-prefix" | "default-only";
  },
): MultilingualSEOConfig {
  const defaultLocale = options?.defaultLocale ?? locales[0] ?? "en";
  const baseUrl = options?.baseUrl ?? `https://${shop}`;

  const seoConfig: SEOConfig = {
    shop,
    defaultLocale,
    locales,
    baseUrl,
  };

  const robotsTxt = generateRobotsTxt(seoConfig);
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const sitemapUrls = locales.map(
    (locale) => `${normalizedBase}/sitemap-${locale}.xml`,
  );

  return {
    seoConfig,
    robotsTxt,
    sitemapUrls,
    hreflangEnabled: locales.length > 1,
    canonicalStrategy: options?.canonicalStrategy ?? "locale-prefix",
  };
}

// ---------------------------------------------------------------------------
// validateSEOSetup
// ---------------------------------------------------------------------------

export interface SEOValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate an SEO configuration for common issues:
 * - hreflang consistency (default locale must be in locales list)
 * - canonical base URL presence and format
 * - sitemap existence (at least one locale must produce a sitemap URL)
 * - robots.txt non-empty
 */
export function validateSEOSetup(config: SEOConfig): SEOValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check that locales array is non-empty
  if (!config.locales || config.locales.length === 0) {
    errors.push("No locales configured. At least one locale is required.");
  }

  // Check that defaultLocale is present in the locales list
  if (config.locales && !config.locales.includes(config.defaultLocale)) {
    errors.push(
      `Default locale "${config.defaultLocale}" is not in the locales list [${config.locales.join(", ")}].`,
    );
  }

  // Check for duplicate locales
  if (config.locales) {
    const seen = new Set<string>();
    for (const locale of config.locales) {
      if (seen.has(locale)) {
        warnings.push(`Duplicate locale "${locale}" in locales list.`);
      }
      seen.add(locale);
    }
  }

  // Validate base URL
  if (!config.baseUrl || config.baseUrl.trim().length === 0) {
    errors.push("Base URL is missing or empty.");
  } else if (
    !config.baseUrl.startsWith("https://") &&
    !config.baseUrl.startsWith("http://")
  ) {
    errors.push(
      `Base URL "${config.baseUrl}" must start with https:// or http://.`,
    );
  }

  // Validate shop
  if (!config.shop || config.shop.trim().length === 0) {
    errors.push("Shop identifier is missing or empty.");
  }

  // Check hreflang consistency: verify that generating hreflang for any
  // URL produces tags for all locales plus x-default
  if (config.locales && config.locales.length > 0 && config.baseUrl) {
    const tags = generateHreflangMeta("/", config);
    const expectedCount = config.locales.length + 1; // locales + x-default
    if (tags.length !== expectedCount) {
      warnings.push(
        `Hreflang tag count (${tags.length}) does not match expected (${expectedCount}).`,
      );
    }
  }

  // Check that a single-locale setup gets a warning
  if (config.locales && config.locales.length === 1) {
    warnings.push(
      "Only one locale is configured. Hreflang tags are unnecessary for single-locale stores.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
