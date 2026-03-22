import { describe, it, expect } from 'vitest';
import {
  getOptionNameTranslation,
  getOptionValueTranslation,
  isCommonOption,
  isCommonValue,
} from '../../app/services/product-variants/common-options';
import {
  translateVariantTitle,
  translateProductOptions,
  translateVariants,
} from '../../app/services/product-variants/translator';
import type {
  ProductOption,
  ProductVariant,
  TranslatedProductOption,
  VariantTranslationConfig,
} from '../../app/services/product-variants/types';

describe('Product Variants - Common Options', () => {
  describe('getOptionNameTranslation', () => {
    it('returns Arabic for Size', () => {
      expect(getOptionNameTranslation('Size', 'ar')).toBe('المقاس');
    });

    it('returns Hebrew for Color', () => {
      expect(getOptionNameTranslation('Color', 'he')).toBe('צבע');
    });

    it('returns null for unknown option name', () => {
      expect(getOptionNameTranslation('Unknown', 'ar')).toBeNull();
    });

    it('is case-insensitive', () => {
      expect(getOptionNameTranslation('size', 'ar')).toBe('المقاس');
      expect(getOptionNameTranslation('SIZE', 'ar')).toBe('المقاس');
    });

    it('returns null for unsupported locale', () => {
      expect(getOptionNameTranslation('Size', 'zh')).toBeNull();
    });

    it('handles locale with region subtag', () => {
      expect(getOptionNameTranslation('Size', 'ar-SA')).toBe('المقاس');
    });
  });

  describe('getOptionValueTranslation', () => {
    it('returns Arabic for Black', () => {
      expect(getOptionValueTranslation('Black', 'ar')).toBe('أسود');
    });

    it('returns Arabic for XL (size values are preserved as-is)', () => {
      expect(getOptionValueTranslation('XL', 'ar')).toBe('XL');
    });

    it('returns null for unknown value', () => {
      expect(getOptionValueTranslation('Chartreuse', 'ar')).toBeNull();
    });

    it('returns Hebrew for Cotton (material value)', () => {
      expect(getOptionValueTranslation('Cotton', 'he')).toBe('כותנה');
    });
  });

  describe('isCommonOption', () => {
    it('returns true for Size', () => {
      expect(isCommonOption('Size')).toBe(true);
    });

    it('returns true for Color (case-insensitive)', () => {
      expect(isCommonOption('color')).toBe(true);
    });

    it('returns false for Custom Thing', () => {
      expect(isCommonOption('Custom Thing')).toBe(false);
    });

    it('returns true for Material', () => {
      expect(isCommonOption('Material')).toBe(true);
    });
  });

  describe('isCommonValue', () => {
    it('returns true for Red', () => {
      expect(isCommonValue('Red')).toBe(true);
    });

    it('returns true for XL', () => {
      expect(isCommonValue('XL')).toBe(true);
    });

    it('returns false for unknown value', () => {
      expect(isCommonValue('Neon Sparkle')).toBe(false);
    });

    it('returns true for Silk (material value)', () => {
      expect(isCommonValue('Silk')).toBe(true);
    });
  });
});

describe('Product Variants - Translator', () => {
  const makeConfig = (targetLocale: string): VariantTranslationConfig => ({
    shop: 'test-shop.myshopify.com',
    sourceLocale: 'en',
    targetLocale,
    preserveSkus: true,
    preserveBarcodes: true,
    translateMetafields: false,
  });

  describe('translateVariantTitle', () => {
    it('rebuilds title from translated options', () => {
      const translatedOptions: TranslatedProductOption[] = [
        {
          id: 'opt1',
          originalName: 'Color',
          translatedName: 'اللون',
          values: [
            { original: 'Black', translated: 'أسود' },
            { original: 'White', translated: 'أبيض' },
          ],
        },
        {
          id: 'opt2',
          originalName: 'Size',
          translatedName: 'المقاس',
          values: [
            { original: 'M', translated: 'M' },
            { original: 'L', translated: 'L' },
          ],
        },
      ];

      expect(translateVariantTitle('Black / M', translatedOptions)).toBe('أسود / M');
      expect(translateVariantTitle('White / L', translatedOptions)).toBe('أبيض / L');
    });

    it('preserves segments that have no translation match', () => {
      const translatedOptions: TranslatedProductOption[] = [
        {
          id: 'opt1',
          originalName: 'Color',
          translatedName: 'اللون',
          values: [{ original: 'Black', translated: 'أسود' }],
        },
      ];

      expect(translateVariantTitle('Black / Custom', translatedOptions)).toBe('أسود / Custom');
    });
  });

  describe('translateProductOptions', () => {
    it('translates known option names and values', async () => {
      const options: ProductOption[] = [
        { id: 'opt1', name: 'Color', values: ['Red', 'Blue'] },
      ];

      const result = await translateProductOptions(options, makeConfig('ar'));

      expect(result).toHaveLength(1);
      expect(result[0].translatedName).toBe('اللون');
      expect(result[0].values[0].translated).toBe('أحمر');
      expect(result[0].values[1].translated).toBe('أزرق');
    });

    it('preserves original text for unknown options', async () => {
      const options: ProductOption[] = [
        { id: 'opt1', name: 'Flavor', values: ['Strawberry'] },
      ];

      const result = await translateProductOptions(options, makeConfig('ar'));

      expect(result[0].translatedName).toBe('Flavor');
      expect(result[0].values[0].translated).toBe('Strawberry');
    });
  });

  describe('SKU preservation', () => {
    it('never modifies SKU in translation results', async () => {
      const options: ProductOption[] = [
        { id: 'opt1', name: 'Color', values: ['Black'] },
      ];
      const translatedOptions = await translateProductOptions(options, makeConfig('ar'));

      const variants: ProductVariant[] = [
        {
          id: 'var1',
          title: 'Black',
          sku: 'SKU-BLK-001',
          barcode: '1234567890',
          price: '29.99',
          options: { Color: 'Black' },
        },
      ];

      const result = await translateVariants(variants, translatedOptions, makeConfig('ar'));

      expect(result[0].sku).toBe('SKU-BLK-001');
      expect(result[0].barcode).toBe('1234567890');
      expect(result[0].translatedTitle).toBe('أسود');
    });

    it('preserves SKU even when it looks like a translatable string', async () => {
      const options: ProductOption[] = [
        { id: 'opt1', name: 'Size', values: ['L'] },
      ];
      const translatedOptions = await translateProductOptions(options, makeConfig('ar'));

      const variants: ProductVariant[] = [
        {
          id: 'var1',
          title: 'L',
          sku: 'Large-Black-Cotton',
          price: '19.99',
          options: { Size: 'L' },
        },
      ];

      const result = await translateVariants(variants, translatedOptions, makeConfig('ar'));

      expect(result[0].sku).toBe('Large-Black-Cotton');
    });
  });
});
