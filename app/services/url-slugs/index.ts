/**
 * URL Slug Translation Service
 * T0038: Translated URL Slugs
 */

export interface SlugTranslation {
  original: string;
  translations: Record<string, string>;
  resourceType: 'product' | 'collection' | 'page' | 'blog' | 'article';
}

export interface TranslatedUrl {
  path: string;
  locale: string;
  originalSlug: string;
  translatedSlug: string;
}

// Slug translation storage
const slugTranslations: Map<string, SlugTranslation> = new Map();

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate Arabic slug
 */
export function generateArabicSlug(text: string): string {
  const arabicSlug = text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\w\-]/g, '');

  if (arabicSlug.length > 0) {
    return arabicSlug;
  }

  return generateSlug(text);
}

/**
 * Generate Hebrew slug
 */
export function generateHebrewSlug(text: string): string {
  const hebrewSlug = text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0590-\u05FF\w\-]/g, '');

  if (hebrewSlug.length > 0) {
    return hebrewSlug;
  }

  return generateSlug(text);
}

/**
 * Register a slug translation
 */
export function registerSlugTranslation(
  originalSlug: string,
  locale: string,
  translatedSlug: string,
  resourceType: SlugTranslation['resourceType']
): void {
  const key = `${resourceType}:${originalSlug}`;
  const existing = slugTranslations.get(key);

  if (existing) {
    existing.translations[locale] = translatedSlug;
  } else {
    slugTranslations.set(key, {
      original: originalSlug,
      translations: { [locale]: translatedSlug },
      resourceType,
    });
  }
}

/**
 * Get translated slug
 */
export function getTranslatedSlug(
  originalSlug: string,
  locale: string,
  resourceType: SlugTranslation['resourceType']
): string {
  const key = `${resourceType}:${originalSlug}`;
  const translation = slugTranslations.get(key);

  if (translation?.translations[locale]) {
    return translation.translations[locale];
  }

  return generateLocalizedSlug(originalSlug, locale);
}

/**
 * Generate localized slug based on locale
 */
export function generateLocalizedSlug(text: string, locale: string): string {
  switch (locale) {
    case 'ar':
      return generateArabicSlug(text);
    case 'he':
      return generateHebrewSlug(text);
    case 'fa':
    case 'ur':
      return generateArabicSlug(text);
    default:
      return generateSlug(text);
  }
}

/**
 * Build translated URL path
 */
export function buildTranslatedUrl(
  resourceType: SlugTranslation['resourceType'],
  slug: string,
  locale: string,
  basePath?: string
): string {
  const translatedSlug = getTranslatedSlug(slug, locale, resourceType);
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  
  const paths: Record<SlugTranslation['resourceType'], string> = {
    product: `${localePrefix}/products/${translatedSlug}`,
    collection: `${localePrefix}/collections/${translatedSlug}`,
    page: `${localePrefix}/pages/${translatedSlug}`,
    blog: `${localePrefix}/blogs/${translatedSlug}`,
    article: `${localePrefix}/blogs/${basePath || 'news'}/${translatedSlug}`,
  };

  return paths[resourceType];
}

/**
 * Parse translated URL
 */
export function parseTranslatedUrl(url: string): {
  locale: string;
  resourceType: SlugTranslation['resourceType'] | null;
  slug: string;
} {
  const parts = url.split('/').filter(Boolean);
  
  const locales = ['en', 'ar', 'he', 'fr', 'de', 'es'];
  let locale = 'en';
  let startIndex = 0;

  if (parts.length > 0 && locales.includes(parts[0])) {
    locale = parts[0];
    startIndex = 1;
  }

  const resourceType = parts[startIndex] as SlugTranslation['resourceType'];
  const slug = parts[startIndex + 1];

  const validTypes: SlugTranslation['resourceType'][] = ['products', 'collections', 'pages', 'blogs'];
  
  if (!validTypes.includes(resourceType as SlugTranslation['resourceType'])) {
    return { locale, resourceType: null, slug: '' };
  }

  const typeMap: Record<string, SlugTranslation['resourceType']> = {
    products: 'product',
    collections: 'collection',
    pages: 'page',
    blogs: 'blog',
  };

  return {
    locale,
    resourceType: typeMap[resourceType] || null,
    slug: slug || '',
  };
}

/**
 * Get all translations for a slug
 */
export function getAllSlugTranslations(
  originalSlug: string,
  resourceType: SlugTranslation['resourceType']
): Record<string, string> {
  const key = `${resourceType}:${originalSlug}`;
  return slugTranslations.get(key)?.translations || {};
}

/**
 * Check if slug has translation
 */
export function hasSlugTranslation(
  originalSlug: string,
  locale: string,
  resourceType: SlugTranslation['resourceType']
): boolean {
  const key = `${resourceType}:${originalSlug}`;
  const translation = slugTranslations.get(key);
  return !!translation?.translations[locale];
}

/**
 * Generate hreflang URLs for a resource
 */
export function generateHreflangUrls(
  originalSlug: string,
  resourceType: SlugTranslation['resourceType'],
  supportedLocales: string[],
  baseUrl: string
): Array<{ locale: string; url: string }> {
  return supportedLocales.map((locale) => ({
    locale,
    url: `${baseUrl}${buildTranslatedUrl(resourceType, originalSlug, locale)}`,
  }));
}
