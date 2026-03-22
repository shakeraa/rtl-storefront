import { describe, it, expect } from 'vitest';
import {
  generateHreflangTags,
  generateBreadcrumbSchema,
  generateProductSchema,
  generateMetaTags,
  localizeUrl,
  extractLocaleFromUrl,
} from '../../app/services/seo/index';

describe('SEO Service', () => {
  describe('Hreflang Tags', () => {
    it('should generate hreflang for all locales', () => {
      const tags = generateHreflangTags('/products/abaya', ['en', 'ar', 'he'], 'en');
      expect(tags).toHaveLength(4); // 3 locales + x-default
      expect(tags.some((t) => t.hreflang === 'en')).toBe(true);
      expect(tags.some((t) => t.hreflang === 'ar')).toBe(true);
      expect(tags.some((t) => t.hreflang === 'x-default')).toBe(true);
    });

    it('should include locale in href', () => {
      const tags = generateHreflangTags('/products', ['en', 'ar'], 'en');
      const arTag = tags.find((t) => t.hreflang === 'ar');
      expect(arTag?.href).toBe('/ar/products');
    });
  });

  describe('Breadcrumb Schema', () => {
    it('should generate valid schema', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
        { name: 'Abayas', nameAr: 'عبايات', item: '/abayas', position: 2 },
      ];
      
      const schema = generateBreadcrumbSchema(items, 'en');
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
    });

    it('should use Arabic names when locale is ar', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
      ];
      
      const schema = generateBreadcrumbSchema(items, 'ar');
      const element = schema.itemListElement[0] as { name: string };
      expect(element.name).toBe('الرئيسية');
    });
  });

  describe('Product Schema', () => {
    it('should generate product structured data', () => {
      const product = {
        name: 'Elegant Abaya',
        nameAr: 'عباية أنيقة',
        description: 'Black crepe abaya',
        descriptionAr: 'عباية كريب سوداء',
        image: ['https://example.com/abaya.jpg'],
        sku: 'ABY-001',
        brand: 'Luxury Brand',
        offers: {
          price: 299,
          priceCurrency: 'USD',
          availability: 'InStock',
        },
      };
      
      const schema = generateProductSchema(product, 'en');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('Elegant Abaya');
    });

    it('should use Arabic product name for ar locale', () => {
      const product = {
        name: 'Elegant Abaya',
        nameAr: 'عباية أنيقة',
        description: 'Black abaya',
        descriptionAr: 'عباية سوداء',
        image: [],
        sku: 'ABY-001',
        offers: { price: 299, priceCurrency: 'USD', availability: 'InStock' },
      };
      
      const schema = generateProductSchema(product, 'ar');
      expect(schema.name).toBe('عباية أنيقة');
    });
  });

  describe('Meta Tags', () => {
    it('should generate basic meta tags', () => {
      const tags = generateMetaTags({
        title: 'RTL Store',
        description: 'Best RTL store',
      });
      
      expect(tags.title).toBe('RTL Store');
      expect(tags.description).toBe('Best RTL store');
      expect(tags['og:title']).toBe('RTL Store');
    });

    it('should add RTL direction for Arabic', () => {
      const tags = generateMetaTags(
        { title: 'متجر', description: 'وصف' },
        'ar'
      );
      expect(tags.dir).toBe('rtl');
      expect(tags.lang).toBe('ar');
    });

    it('should add RTL direction for Hebrew', () => {
      const tags = generateMetaTags(
        { title: 'חנות', description: 'תיאור' },
        'he'
      );
      expect(tags.dir).toBe('rtl');
      expect(tags.lang).toBe('he');
    });
  });

  describe('URL Localization', () => {
    it('should add locale prefix', () => {
      expect(localizeUrl('/products', 'ar', 'en')).toBe('/ar/products');
    });

    it('should not add prefix for default locale', () => {
      expect(localizeUrl('/products', 'en', 'en')).toBe('/products');
    });
  });

  describe('Locale Extraction', () => {
    it('should extract locale from URL', () => {
      const result = extractLocaleFromUrl('/ar/products', ['en', 'ar', 'he']);
      expect(result.locale).toBe('ar');
      expect(result.path).toBe('/products');
    });

    it('should default to en for unknown locale', () => {
      const result = extractLocaleFromUrl('/products', ['en', 'ar']);
      expect(result.locale).toBe('en');
      expect(result.path).toBe('/products');
    });
  });
});
