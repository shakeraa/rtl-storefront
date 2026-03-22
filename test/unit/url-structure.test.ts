import { describe, it, expect } from 'vitest';
import {
  resolveLocaleFromPath,
  buildLocalizedPath,
  getAlternateUrls,
  generateRedirectRules,
} from '../../app/services/url-structure/resolver';
import type { SubfolderConfig } from '../../app/services/url-structure/types';

const testConfig: SubfolderConfig = {
  defaultLocale: 'en',
  locales: [
    { locale: 'en', prefix: '/en', isDefault: true },
    { locale: 'ar', prefix: '/ar', isDefault: false },
    { locale: 'he', prefix: '/he', isDefault: false },
  ],
  includeDefaultPrefix: false,
};

describe('URL Structure — resolveLocaleFromPath', () => {
  it('extracts locale "ar" and strips prefix from /ar/products/dress', () => {
    const result = resolveLocaleFromPath('/ar/products/dress', testConfig);
    expect(result.locale).toBe('ar');
    expect(result.path).toBe('/products/dress');
    expect(result.isDefault).toBe(false);
  });

  it('returns default locale "en" for path without a prefix', () => {
    const result = resolveLocaleFromPath('/products/dress', testConfig);
    expect(result.locale).toBe('en');
    expect(result.path).toBe('/products/dress');
    expect(result.isDefault).toBe(true);
  });

  it('extracts locale "he" from /he/about', () => {
    const result = resolveLocaleFromPath('/he/about', testConfig);
    expect(result.locale).toBe('he');
    expect(result.path).toBe('/about');
    expect(result.isDefault).toBe(false);
  });

  it('resolves root path "/" to default locale', () => {
    const result = resolveLocaleFromPath('/', testConfig);
    expect(result.locale).toBe('en');
    expect(result.path).toBe('/');
    expect(result.isDefault).toBe(true);
  });

  it('resolves bare locale prefix "/ar" to locale root', () => {
    const result = resolveLocaleFromPath('/ar', testConfig);
    expect(result.locale).toBe('ar');
    expect(result.path).toBe('/');
  });

  it('preserves the fullPath as the normalized original path', () => {
    const result = resolveLocaleFromPath('/ar/products/dress', testConfig);
    expect(result.fullPath).toBe('/ar/products/dress');
  });

  it('returns empty prefix for default locale when includeDefaultPrefix is false', () => {
    const result = resolveLocaleFromPath('/products/dress', testConfig);
    expect(result.prefix).toBe('');
  });
});

describe('URL Structure — buildLocalizedPath', () => {
  it('prepends /ar prefix for Arabic locale', () => {
    const result = buildLocalizedPath('/products/dress', 'ar', testConfig);
    expect(result).toBe('/ar/products/dress');
  });

  it('returns path without prefix for default locale when includeDefaultPrefix is false', () => {
    const result = buildLocalizedPath('/products/dress', 'en', testConfig);
    expect(result).toBe('/products/dress');
  });

  it('prepends /he prefix for Hebrew locale', () => {
    const result = buildLocalizedPath('/about', 'he', testConfig);
    expect(result).toBe('/he/about');
  });

  it('strips existing locale prefix before rebuilding', () => {
    const result = buildLocalizedPath('/ar/products/dress', 'he', testConfig);
    expect(result).toBe('/he/products/dress');
  });

  it('handles root path for non-default locale', () => {
    const result = buildLocalizedPath('/', 'ar', testConfig);
    expect(result).toBe('/ar');
  });

  it('returns clean path for an unknown locale', () => {
    const result = buildLocalizedPath('/products/dress', 'fr', testConfig);
    expect(result).toBe('/products/dress');
  });

  it('includes default prefix when includeDefaultPrefix is true', () => {
    const configWithPrefix: SubfolderConfig = {
      ...testConfig,
      includeDefaultPrefix: true,
    };
    const result = buildLocalizedPath('/products/dress', 'en', configWithPrefix);
    expect(result).toBe('/en/products/dress');
  });
});

describe('URL Structure — getAlternateUrls', () => {
  it('returns one entry per configured locale', () => {
    const alternates = getAlternateUrls('/products/dress', 'https://example.com', testConfig);
    expect(alternates).toHaveLength(3);
  });

  it('includes en, ar, and he locales', () => {
    const alternates = getAlternateUrls('/products/dress', 'https://example.com', testConfig);
    const locales = alternates.map((a) => a.locale);
    expect(locales).toEqual(['en', 'ar', 'he']);
  });

  it('builds correct URLs for each locale', () => {
    const alternates = getAlternateUrls('/products/dress', 'https://example.com', testConfig);
    const urlMap = Object.fromEntries(alternates.map((a) => [a.locale, a.url]));
    expect(urlMap.en).toBe('https://example.com/products/dress');
    expect(urlMap.ar).toBe('https://example.com/ar/products/dress');
    expect(urlMap.he).toBe('https://example.com/he/products/dress');
  });

  it('strips trailing slash from base URL', () => {
    const alternates = getAlternateUrls('/about', 'https://example.com/', testConfig);
    const enUrl = alternates.find((a) => a.locale === 'en')!.url;
    expect(enUrl).toBe('https://example.com/about');
  });
});

describe('URL Structure — generateRedirectRules', () => {
  it('generates redirect rules for non-default locales', () => {
    const rules = generateRedirectRules(['/products/dress'], testConfig);
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((r) => r.statusCode === 301)).toBe(true);
  });

  it('does not generate a rule for default locale when includeDefaultPrefix is false', () => {
    const rules = generateRedirectRules(['/products/dress'], testConfig);
    const defaultRules = rules.filter((r) => r.locale === 'en');
    expect(defaultRules).toHaveLength(0);
  });

  it('generates rules pointing to locale-prefixed paths', () => {
    const rules = generateRedirectRules(['/products/dress'], testConfig);
    const arRule = rules.find((r) => r.locale === 'ar');
    expect(arRule).toBeDefined();
    expect(arRule!.from).toBe('/products/dress');
    expect(arRule!.to).toBe('/ar/products/dress');
  });

  it('generates rules for multiple paths', () => {
    const rules = generateRedirectRules(['/products/dress', '/about'], testConfig);
    // 2 non-default locales * 2 paths = 4 rules
    expect(rules).toHaveLength(4);
  });

  it('includes default locale rules when includeDefaultPrefix is true', () => {
    const configWithPrefix: SubfolderConfig = {
      ...testConfig,
      includeDefaultPrefix: true,
    };
    const rules = generateRedirectRules(['/products/dress'], configWithPrefix);
    const enRule = rules.find((r) => r.locale === 'en');
    expect(enRule).toBeDefined();
    expect(enRule!.to).toBe('/en/products/dress');
  });
});
