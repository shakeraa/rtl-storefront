import { getTextDirection } from "../../utils/rtl";
import type { MetaTagSet, MetaTranslationInput, TranslatedMetaTags } from "./types";
import { calculateSEOScore, validateMetaTags } from "./validator";

/**
 * Translate a set of meta tags for the target locale.
 * Translations for the actual text should be provided via the translatedFields param;
 * this function handles structural assembly, validation, and scoring.
 */
export function assembleTranslatedMeta(
  input: MetaTranslationInput,
  translatedFields: Partial<MetaTagSet>,
): TranslatedMetaTags {
  const translated: MetaTagSet = {
    title: translatedFields.title ?? input.meta.title,
    description: translatedFields.description ?? input.meta.description,
    ogTitle: translatedFields.ogTitle ?? translatedFields.title ?? input.meta.ogTitle,
    ogDescription: translatedFields.ogDescription ?? translatedFields.description ?? input.meta.ogDescription,
    ogImage: input.meta.ogImage, // images don't get translated
    ogType: input.meta.ogType,
    twitterTitle: translatedFields.twitterTitle ?? translatedFields.title ?? input.meta.twitterTitle,
    twitterDescription: translatedFields.twitterDescription ?? translatedFields.description ?? input.meta.twitterDescription,
    twitterImage: input.meta.twitterImage, // images don't get translated
    twitterCard: input.meta.twitterCard,
    canonicalUrl: input.meta.canonicalUrl,
    alternateUrls: input.meta.alternateUrls,
  };

  const warnings = validateMetaTags(translated);
  const seoBreakdown = calculateSEOScore(translated);

  return {
    original: input.meta,
    translated,
    locale: input.targetLocale,
    direction: getTextDirection(input.targetLocale),
    warnings,
    seoScore: seoBreakdown.totalScore,
  };
}

/**
 * Generate hreflang link tags for alternate language versions.
 */
export function generateHreflangTags(
  alternates: Array<{ locale: string; url: string }>,
  defaultLocale: string,
): string[] {
  const tags: string[] = [];

  for (const alt of alternates) {
    tags.push(`<link rel="alternate" hreflang="${alt.locale}" href="${escapeHtml(alt.url)}" />`);
  }

  // Add x-default pointing to default locale
  const defaultUrl = alternates.find((a) => a.locale === defaultLocale)?.url;
  if (defaultUrl) {
    tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(defaultUrl)}" />`);
  }

  return tags;
}

/**
 * Generate Open Graph meta tags as HTML strings.
 */
export function generateOGTags(meta: MetaTagSet, locale: string): string[] {
  const tags: string[] = [];

  if (meta.ogTitle) tags.push(`<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`);
  if (meta.ogDescription) tags.push(`<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`);
  if (meta.ogImage) tags.push(`<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`);
  if (meta.ogType) tags.push(`<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`);
  tags.push(`<meta property="og:locale" content="${escapeHtml(locale)}" />`);

  if (meta.alternateUrls) {
    for (const alt of meta.alternateUrls) {
      tags.push(`<meta property="og:locale:alternate" content="${escapeHtml(alt.locale)}" />`);
    }
  }

  return tags;
}

/**
 * Generate Twitter Card meta tags as HTML strings.
 */
export function generateTwitterTags(meta: MetaTagSet): string[] {
  const tags: string[] = [];

  if (meta.twitterCard) tags.push(`<meta name="twitter:card" content="${escapeHtml(meta.twitterCard)}" />`);
  if (meta.twitterTitle) tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.twitterTitle)}" />`);
  if (meta.twitterDescription) tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.twitterDescription)}" />`);
  if (meta.twitterImage) tags.push(`<meta name="twitter:image" content="${escapeHtml(meta.twitterImage)}" />`);

  return tags;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
