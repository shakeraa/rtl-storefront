import { describe, it, expect } from 'vitest';
import {
  translateVendor,
  translateProductType,
  translateTag,
  translateTags,
  getTagStyle,
  hasVendorTranslation,
  addVendorTranslation,
  addProductTypeTranslation,
  addTagTranslation,
  VENDOR_TRANSLATIONS,
  PRODUCT_TYPE_TRANSLATIONS,
  TAG_TRANSLATIONS,
} from '../../app/services/product-translation';

describe('Product Translation Service', () => {
  describe('Vendor Translation (T0093)', () => {
    it('should translate vendor name to Arabic', () => {
      const result = translateVendor('Nike', 'ar');
      expect(result).toBe('نايك');
    });

    it('should translate vendor name to Hebrew', () => {
      const result = translateVendor('Nike', 'he');
      expect(result).toBe('נייק');
    });

    it('should return original for unknown vendor', () => {
      const result = translateVendor('UnknownBrand', 'ar');
      expect(result).toBe('UnknownBrand');
    });

    it('should include original name when requested', () => {
      const result = translateVendor('Nike', 'ar', { includeOriginal: true });
      expect(result).toBe('نايك (Nike)');
    });

    it('should check if vendor has translation', () => {
      expect(hasVendorTranslation('Nike', 'ar')).toBe(true);
      expect(hasVendorTranslation('Nike', 'jp')).toBe(false);
    });

    it('should add custom vendor translation', () => {
      addVendorTranslation('NewBrand', { ar: 'براند جديد', he: 'מותג חדש' });
      expect(translateVendor('NewBrand', 'ar')).toBe('براند جديد');
    });
  });

  describe('Product Type Translation (T0094)', () => {
    it('should translate product type to Arabic', () => {
      const result = translateProductType('Clothing', 'ar');
      expect(result).toBe('ملابس');
    });

    it('should translate product type to Hebrew', () => {
      const result = translateProductType('Shoes', 'he');
      expect(result).toBe('נעליים');
    });

    it('should translate modest fashion types', () => {
      expect(translateProductType('Abaya', 'ar')).toBe('عباية');
      expect(translateProductType('Hijab', 'ar')).toBe('حجاب');
    });

    it('should return original for unknown type', () => {
      const result = translateProductType('UnknownType', 'ar');
      expect(result).toBe('UnknownType');
    });

    it('should add custom product type', () => {
      addProductTypeTranslation('NewType', { ar: 'نوع جديد' }, 'custom');
      expect(translateProductType('NewType', 'ar')).toBe('نوع جديد');
    });
  });

  describe('Tag Translation (T0095)', () => {
    it('should translate tag to Arabic', () => {
      const result = translateTag('New', 'ar');
      expect(result).toBe('جديد');
    });

    it('should translate tag to Hebrew', () => {
      const result = translateTag('Sale', 'he');
      expect(result).toBe('מבצע');
    });

    it('should translate multiple tags', () => {
      const results = translateTags(['New', 'Sale', 'Premium'], 'ar');
      expect(results).toEqual(['جديد', 'تخفيض', 'ممتاز']);
    });

    it('should get tag style', () => {
      const style = getTagStyle('Sale');
      expect(style.color).toBe('#FF1744');
      expect(style.category).toBe('promotion');
    });

    it('should return original for unknown tag', () => {
      const result = translateTag('UnknownTag', 'ar');
      expect(result).toBe('UnknownTag');
    });

    it('should add custom tag', () => {
      addTagTranslation('CustomTag', { ar: 'وسم مخصص' }, { category: 'custom', color: '#123456' });
      expect(translateTag('CustomTag', 'ar')).toBe('وسم مخصص');
    });
  });

  describe('Translation Dictionaries', () => {
    it('should have vendor translations', () => {
      expect(Object.keys(VENDOR_TRANSLATIONS).length).toBeGreaterThan(0);
      expect(VENDOR_TRANSLATIONS['Nike']).toBeDefined();
    });

    it('should have product type translations', () => {
      expect(Object.keys(PRODUCT_TYPE_TRANSLATIONS).length).toBeGreaterThan(0);
      expect(PRODUCT_TYPE_TRANSLATIONS['Clothing']).toBeDefined();
    });

    it('should have tag translations', () => {
      expect(Object.keys(TAG_TRANSLATIONS).length).toBeGreaterThan(0);
      expect(TAG_TRANSLATIONS['New']).toBeDefined();
    });
  });
});
