import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SORT_OPTIONS,
  FASHION_SORT_OPTIONS,
  getSortLabel,
  getSortOptionsForLocale,
  createSortOptions,
  sortProducts,
} from '../../app/services/sort-order';

describe('Sort Order Service - T0100', () => {
  describe('Default Sort Options', () => {
    it('should have default sort options', () => {
      expect(DEFAULT_SORT_OPTIONS.length).toBeGreaterThan(0);
      expect(DEFAULT_SORT_OPTIONS.some((o) => o.value === 'manual')).toBe(true);
      expect(DEFAULT_SORT_OPTIONS.some((o) => o.value === 'price-ascending')).toBe(true);
    });

    it('should have Arabic translations', () => {
      const manual = DEFAULT_SORT_OPTIONS.find((o) => o.value === 'manual');
      expect(manual?.labelAr).toBe('مميز');
    });

    it('should have Hebrew translations', () => {
      const manual = DEFAULT_SORT_OPTIONS.find((o) => o.value === 'manual');
      expect(manual?.labelHe).toBe('מומלץ');
    });
  });

  describe('Fashion Sort Options', () => {
    it('should have fashion-specific options', () => {
      expect(FASHION_SORT_OPTIONS.some((o) => o.value === 'new-arrivals')).toBe(true);
      expect(FASHION_SORT_OPTIONS.some((o) => o.value === 'modesty-level')).toBe(true);
    });
  });

  describe('Get Sort Label', () => {
    it('should return English label by default', () => {
      const label = getSortLabel('manual', 'en');
      expect(label).toBe('Featured');
    });

    it('should return Arabic label for ar locale', () => {
      const label = getSortLabel('manual', 'ar');
      expect(label).toBe('مميز');
    });

    it('should return Hebrew label for he locale', () => {
      const label = getSortLabel('manual', 'he');
      expect(label).toBe('מומלץ');
    });

    it('should return value if option not found', () => {
      const label = getSortLabel('unknown', 'en');
      expect(label).toBe('unknown');
    });
  });

  describe('Get Sort Options For Locale', () => {
    it('should return options with English labels', () => {
      const options = getSortOptionsForLocale('en');
      expect(options[0].label).toBe('Featured');
    });

    it('should return options with Arabic labels', () => {
      const options = getSortOptionsForLocale('ar');
      expect(options[0].label).toBe('مميز');
    });
  });

  describe('Create Sort Options', () => {
    it('should create custom sort options', () => {
      const labels = {
        custom: { en: 'Custom Sort', ar: 'ترتيب مخصص' },
      };

      const options = createSortOptions(labels);
      expect(options).toHaveLength(1);
      expect(options[0].label).toBe('Custom Sort');
      expect(options[0].labelAr).toBe('ترتيب مخصص');
    });
  });

  describe('Sort Products', () => {
    const products = [
      { id: 1, title: 'Zebra', price: 100, createdAt: '2024-01-01', salesCount: 5 },
      { id: 2, title: 'Apple', price: 50, createdAt: '2024-02-01', salesCount: 10 },
      { id: 3, title: 'Banana', price: 75, createdAt: '2024-01-15', salesCount: 3 },
    ];

    it('should sort by price ascending', () => {
      const sorted = sortProducts(products, 'price', 'asc');
      expect(sorted[0].price).toBe(50);
      expect(sorted[2].price).toBe(100);
    });

    it('should sort by price descending', () => {
      const sorted = sortProducts(products, 'price', 'desc');
      expect(sorted[0].price).toBe(100);
      expect(sorted[2].price).toBe(50);
    });

    it('should sort by title ascending', () => {
      const sorted = sortProducts(products, 'title', 'asc');
      expect(sorted[0].title).toBe('Apple');
      expect(sorted[2].title).toBe('Zebra');
    });

    it('should sort by best selling', () => {
      const sorted = sortProducts(products, 'best-selling');
      expect(sorted[0].salesCount).toBe(10);
      expect(sorted[2].salesCount).toBe(3);
    });

    it('should sort by modesty level', () => {
      const modestyProducts = [
        { id: 1, modestyLevel: 'casual' },
        { id: 2, modestyLevel: 'conservative' },
        { id: 3, modestyLevel: 'moderate' },
      ];

      const sorted = sortProducts(modestyProducts, 'modesty-level');
      expect(sorted[0].modestyLevel).toBe('conservative');
      expect(sorted[2].modestyLevel).toBe('casual');
    });
  });
});
