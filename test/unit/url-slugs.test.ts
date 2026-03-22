import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  generateArabicSlug,
  generateHebrewSlug,
  registerSlugTranslation,
  getTranslatedSlug,
  buildTranslatedUrl,
  parseTranslatedUrl,
  getAllSlugTranslations,
  hasSlugTranslation,
  generateHreflangUrls,
} from '../../app/services/url-slugs';

describe('URL Slugs Service - T0038', () => {
  describe('Slug Generation', () => {
    it('should generate URL-friendly slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test Product 123')).toBe('test-product-123');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Product & Collection')).toBe('product-collection');
      expect(generateSlug('Test!!!')).toBe('test');
    });

    it('should generate Arabic slug', () => {
      const slug = generateArabicSlug('منتج عربي');
      expect(slug).toContain('منتج');
    });

    it('should generate Hebrew slug', () => {
      const slug = generateHebrewSlug('מוצר עברי');
      expect(slug).toContain('מוצר');
    });
  });

  describe('Slug Translation', () => {
    it('should register and get slug translation', () => {
      registerSlugTranslation('black-dress', 'ar', 'فستان-أسود', 'product');
      const translated = getTranslatedSlug('black-dress', 'ar', 'product');
      expect(translated).toBe('فستان-أسود');
    });

    it('should check if slug has translation', () => {
      registerSlugTranslation('test-product', 'ar', 'منتج-تجريبي', 'product');
      expect(hasSlugTranslation('test-product', 'ar', 'product')).toBe(true);
      expect(hasSlugTranslation('test-product', 'fr', 'product')).toBe(false);
    });

    it('should get all translations for a slug', () => {
      registerSlugTranslation('summer-collection', 'ar', 'مجموعة-الصيف', 'collection');
      registerSlugTranslation('summer-collection', 'he', 'אוסף-קיץ', 'collection');
      
      const translations = getAllSlugTranslations('summer-collection', 'collection');
      expect(translations.ar).toBe('مجموعة-الصيف');
      expect(translations.he).toBe('אוסף-קיץ');
    });
  });

  describe('URL Building', () => {
    it('should build translated product URL', () => {
      registerSlugTranslation('elegant-abaya', 'ar', 'عباية-أنيقة', 'product');
      const url = buildTranslatedUrl('product', 'elegant-abaya', 'ar');
      expect(url).toBe('/ar/products/عباية-أنيقة');
    });

    it('should build translated collection URL', () => {
      registerSlugTranslation('modest-wear', 'ar', 'ملابس-محتشمة', 'collection');
      const url = buildTranslatedUrl('collection', 'modest-wear', 'ar');
      expect(url).toBe('/ar/collections/ملابس-محتشمة');
    });

    it('should not add locale prefix for English', () => {
      const url = buildTranslatedUrl('product', 'test-product', 'en');
      expect(url).toBe('/products/test-product');
    });
  });

  describe('URL Parsing', () => {
    it('should parse translated URL with locale', () => {
      const parsed = parseTranslatedUrl('/ar/products/فستان-أسود');
      expect(parsed.locale).toBe('ar');
      expect(parsed.resourceType).toBe('product');
      expect(parsed.slug).toBe('فستان-أسود');
    });

    it('should parse URL without locale', () => {
      const parsed = parseTranslatedUrl('/products/black-dress');
      expect(parsed.locale).toBe('en');
      expect(parsed.resourceType).toBe('product');
    });

    it('should parse collection URL', () => {
      const parsed = parseTranslatedUrl('/ar/collections/ملابس');
      expect(parsed.resourceType).toBe('collection');
    });
  });

  describe('Hreflang URLs', () => {
    it('should generate hreflang URLs', () => {
      const urls = generateHreflangUrls('summer-sale', 'collection', ['en', 'ar', 'he'], 'https://example.com');
      
      expect(urls).toHaveLength(3);
      expect(urls[0].locale).toBe('en');
      expect(urls[1].locale).toBe('ar');
      expect(urls[2].locale).toBe('he');
    });
  });
});
