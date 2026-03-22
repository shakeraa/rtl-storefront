import { describe, it, expect } from 'vitest';
import {
  generateBreadcrumbSchema,
  getTranslatedBreadcrumbName,
  generateProductBreadcrumbs,
  generateCollectionBreadcrumbs,
  generatePageBreadcrumbs,
  getBreadcrumbPath,
  BREADCRUMB_TRANSLATIONS,
} from '../../app/services/breadcrumb';

describe('Breadcrumb Service - T0075', () => {
  describe('Breadcrumb Schema Generation', () => {
    it('should generate valid schema', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
        { name: 'Products', nameAr: 'المنتجات', item: '/products', position: 2 },
      ];

      const schema = generateBreadcrumbSchema(items, 'en');
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(2);
    });

    it('should use Arabic names for ar locale', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
      ];

      const schema = generateBreadcrumbSchema(items, 'ar');
      expect(schema.itemListElement[0].name).toBe('الرئيسية');
    });

    it('should use common translations', () => {
      const items = [{ name: 'Home', item: '/', position: 1 }];
      const schema = generateBreadcrumbSchema(items, 'ar');
      expect(schema.itemListElement[0].name).toBe('الرئيسية');
    });
  });

  describe('Product Breadcrumbs', () => {
    it('should generate product breadcrumbs', () => {
      const product = {
        title: 'Elegant Abaya',
        titleAr: 'عباية أنيقة',
        collection: 'Abayas',
        collectionAr: 'عبايات',
      };

      const breadcrumbs = generateProductBreadcrumbs(product, 'en');
      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[0].name).toBe('Home');
      expect(breadcrumbs[3].name).toBe('Elegant Abaya');
    });

    it('should generate product breadcrumbs without collection', () => {
      const product = {
        title: 'Test Product',
        titleAr: 'منتج تجريبي',
      };

      const breadcrumbs = generateProductBreadcrumbs(product, 'en');
      expect(breadcrumbs).toHaveLength(3);
    });
  });

  describe('Collection Breadcrumbs', () => {
    it('should generate collection breadcrumbs', () => {
      const collection = {
        title: 'Summer Collection',
        titleAr: 'مجموعة الصيف',
      };

      const breadcrumbs = generateCollectionBreadcrumbs(collection, 'en');
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].name).toBe('Home');
      expect(breadcrumbs[1].name).toBe('Collections');
      expect(breadcrumbs[2].name).toBe('Summer Collection');
    });
  });

  describe('Page Breadcrumbs', () => {
    it('should generate page breadcrumbs', () => {
      const page = {
        title: 'About Us',
        titleAr: 'عن الشركة',
      };

      const breadcrumbs = generatePageBreadcrumbs(page, 'en');
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].name).toBe('Home');
      expect(breadcrumbs[1].name).toBe('About Us');
    });
  });

  describe('Breadcrumb Path', () => {
    it('should generate breadcrumb path from URL', () => {
      const items = getBreadcrumbPath('/products/category/item', 'en');
      expect(items).toHaveLength(4);
      expect(items[0].name).toBe('Home');
      expect(items[1].name).toBe('Products');
      expect(items[2].name).toBe('Category');
      expect(items[3].name).toBe('Item');
    });
  });

  describe('Translation Dictionary', () => {
    it('should have common breadcrumb translations', () => {
      expect(BREADCRUMB_TRANSLATIONS['Home']).toBeDefined();
      expect(BREADCRUMB_TRANSLATIONS['Home']['ar']).toBe('الرئيسية');
      expect(BREADCRUMB_TRANSLATIONS['Home']['he']).toBe('בית');
    });

    it('should have product translations', () => {
      expect(BREADCRUMB_TRANSLATIONS['Products']['ar']).toBe('المنتجات');
    });

    it('should have collection translations', () => {
      expect(BREADCRUMB_TRANSLATIONS['Collections']['ar']).toBe('المجموعات');
    });
  });
});
