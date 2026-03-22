import { describe, it, expect } from 'vitest';
import {
  COMMON_OPTIONS,
  generateVariants,
  generateSKU,
  selectVariant,
  isVariantAvailable,
  getAvailableOptions,
  getPriceRange,
  getTotalInventory,
  isLowStock,
  isOutOfStock,
  getSwatchColor,
} from '../../app/services/variants/index';

describe('Product Variants Service', () => {
  describe('Common Options', () => {
    it('should have size option', () => {
      const sizeOption = COMMON_OPTIONS.find((o) => o.id === 'size');
      expect(sizeOption).toBeDefined();
      expect(sizeOption?.values).toHaveLength(8);
      expect(sizeOption?.values.map((v) => v.value)).toContain('S');
      expect(sizeOption?.values.map((v) => v.value)).toContain('4XL');
    });

    it('should have color option with swatches', () => {
      const colorOption = COMMON_OPTIONS.find((o) => o.id === 'color');
      expect(colorOption?.swatchType).toBe('color');
      expect(colorOption?.values[0].swatch).toMatch(/^#/);
    });

    it('should have modesty level option', () => {
      const modestyOption = COMMON_OPTIONS.find((o) => o.id === 'modesty');
      expect(modestyOption?.nameAr).toBe('مستوى الاحتشام');
    });
  });

  describe('Variant Generation', () => {
    it('should generate variant combinations', () => {
      const sizeOption = COMMON_OPTIONS.find((o) => o.id === 'size')!;
      const colorOption = COMMON_OPTIONS.find((o) => o.id === 'color')!;
      
      const variants = generateVariants([sizeOption, colorOption]);
      expect(variants).toHaveLength(48); // 8 sizes * 6 colors
    });

    it('should handle single option', () => {
      const sizeOption = COMMON_OPTIONS.find((o) => o.id === 'size')!;
      const variants = generateVariants([sizeOption]);
      expect(variants).toHaveLength(8);
    });

    it('should handle empty options', () => {
      const variants = generateVariants([]);
      expect(variants).toHaveLength(0);
    });
  });

  describe('SKU Generation', () => {
    it('should generate SKU with options', () => {
      const sku = generateSKU('ABAYA-001', { Size: 'L', Color: 'Black' });
      expect(sku).toBe('ABAYA-001-L-BL');
    });
  });

  describe('Variant Selection', () => {
    const mockVariants = [
      {
        id: 'v1',
        sku: 'TEST-S-RED',
        title: 'Small Red',
        price: 100,
        inventory: 5,
        options: { Size: 'S', Color: 'Red' },
        images: [],
        weightUnit: 'kg' as const,
        requiresShipping: true,
        taxable: true,
      },
      {
        id: 'v2',
        sku: 'TEST-M-RED',
        title: 'Medium Red',
        price: 100,
        inventory: 0,
        options: { Size: 'M', Color: 'Red' },
        images: [],
        weightUnit: 'kg' as const,
        requiresShipping: true,
        taxable: true,
      },
    ];

    it('should select matching variant', () => {
      const variant = selectVariant(mockVariants, { Size: 'S', Color: 'Red' });
      expect(variant?.id).toBe('v1');
    });

    it('should return null for non-matching variant', () => {
      const variant = selectVariant(mockVariants, { Size: 'L', Color: 'Red' });
      expect(variant).toBeNull();
    });

    it('should check variant availability', () => {
      expect(isVariantAvailable(mockVariants[0], { Size: 'S' })).toBe(true);
      expect(isVariantAvailable(mockVariants[1], { Size: 'M' })).toBe(false);
    });

    it('should get available options', () => {
      const sizes = getAvailableOptions(mockVariants, { Color: 'Red' }, 'Size');
      expect(sizes).toContain('S');
      expect(sizes).not.toContain('M'); // Out of stock
    });
  });

  describe('Pricing & Inventory', () => {
    const mockVariants = [
      { id: 'v1', price: 100, inventory: 5, options: {}, sku: '', title: '', images: [], weightUnit: 'kg' as const, requiresShipping: true, taxable: true },
      { id: 'v2', price: 150, inventory: 3, options: {}, sku: '', title: '', images: [], weightUnit: 'kg' as const, requiresShipping: true, taxable: true },
      { id: 'v3', price: 200, inventory: 0, options: {}, sku: '', title: '', images: [], weightUnit: 'kg' as const, requiresShipping: true, taxable: true },
    ];

    it('should calculate price range', () => {
      const range = getPriceRange(mockVariants);
      expect(range).toEqual({ min: 100, max: 200 });
    });

    it('should calculate total inventory', () => {
      const total = getTotalInventory(mockVariants);
      expect(total).toBe(8);
    });

    it('should detect low stock', () => {
      expect(isLowStock(mockVariants[1])).toBe(true); // 3 in stock
      expect(isLowStock(mockVariants[0])).toBe(false); // 5 in stock (at threshold)
    });

    it('should detect out of stock', () => {
      expect(isOutOfStock(mockVariants[2])).toBe(true);
      expect(isOutOfStock(mockVariants[0])).toBe(false);
    });
  });

  describe('Swatch Helpers', () => {
    it('should get swatch color', () => {
      const colorOption = COMMON_OPTIONS.find((o) => o.id === 'color')!;
      const color = getSwatchColor(colorOption, 'black');
      expect(color).toBe('#000000');
    });
  });
});
