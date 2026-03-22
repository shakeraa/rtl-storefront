/**
 * SEO Multilingual Service
 * T0007: SEO Multilingual
 * T0075: Breadcrumb Schema
 */

export interface SEOConfig {
  defaultLocale: string;
  locales: string[];
  hreflang: boolean;
  sitemap: boolean;
  canonicalUrls: boolean;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  robots?: string;
}

export interface HreflangTag {
  hreflang: string;
  href: string;
}

export interface BreadcrumbItem {
  name: string;
  nameAr?: string;
  item: string;
  position: number;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

// Generate hreflang tags
export function generateHreflangTags(
  path: string,
  locales: string[],
  defaultLocale: string
): HreflangTag[] {
  const tags: HreflangTag[] = locales.map((locale) => ({
    hreflang: locale,
    href: `/${locale}${path}`,
  }));
  
  // Add x-default
  tags.push({
    hreflang: 'x-default',
    href: `/${defaultLocale}${path}`,
  });
  
  return tags;
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  locale: string = 'en'
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: locale === 'ar' && item.nameAr ? item.nameAr : item.name,
      item: item.item,
    })),
  };
}

// Generate product structured data
export function generateProductSchema(
  product: {
    name: string;
    nameAr?: string;
    description: string;
    descriptionAr?: string;
    image: string[];
    sku: string;
    brand?: string;
    offers: {
      price: number;
      priceCurrency: string;
      availability: string;
    };
  },
  locale: string = 'en'
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: locale === 'ar' && product.nameAr ? product.nameAr : product.name,
    description: locale === 'ar' && product.descriptionAr ? product.descriptionAr : product.description,
    image: product.image,
    sku: product.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      ...product.offers,
      url: window?.location?.href,
    },
  };
}

// Generate multilingual sitemap URL
export function generateSitemapUrl(
  path: string,
  locales: string[],
  lastmod?: string,
  changefreq?: string,
  priority?: number
): string {
  const entries = locales.map((locale) => ({
    loc: `/${locale}${path}`,
    lastmod,
    changefreq,
    priority,
    'xhtml:link': locales.map((l) => ({
      rel: 'alternate',
      hreflang: l,
      href: `/${l}${path}`,
    })),
  }));
  
  return entries.map((e) => `<url>${JSON.stringify(e)}</url>`).join('');
}

// Meta tag generation for RTL
export function generateMetaTags(
  tags: MetaTags,
  locale: string = 'en'
): Record<string, string> {
  const meta: Record<string, string> = {
    'charset': 'utf-8',
    'viewport': 'width=device-width, initial-scale=1.0',
    'title': tags.title,
    'description': tags.description,
    'og:title': tags.ogTitle || tags.title,
    'og:description': tags.ogDescription || tags.description,
    'twitter:card': tags.twitterCard || 'summary',
    'robots': tags.robots || 'index,follow',
  };
  
  if (tags.ogImage) {
    meta['og:image'] = tags.ogImage;
  }
  
  if (tags.canonical) {
    meta['canonical'] = tags.canonical;
  }
  
  // RTL direction for Arabic/Hebrew
  if (locale === 'ar' || locale === 'he') {
    meta['dir'] = 'rtl';
    meta['lang'] = locale;
  }
  
  return meta;
}

// URL localization
export function localizeUrl(
  url: string,
  locale: string,
  defaultLocale: string
): string {
  if (locale === defaultLocale) {
    return url;
  }
  return `/${locale}${url}`;
}

// Extract locale from URL
export function extractLocaleFromUrl(
  url: string,
  supportedLocales: string[]
): { locale: string; path: string } {
  const parts = url.split('/').filter(Boolean);
  const firstPart = parts[0];
  
  if (supportedLocales.includes(firstPart)) {
    return {
      locale: firstPart,
      path: '/' + parts.slice(1).join('/'),
    };
  }
  
  return { locale: 'en', path: url };
}

// Alternate language links
export function generateAlternateLinks(
  path: string,
  locales: string[]
): Array<{ hreflang: string; href: string }> {
  return locales.map((locale) => ({
    hreflang: locale,
    href: `/${locale}${path}`,
  }));
}

// Export all
export * from './constants';
