import { describe, it, expect } from 'vitest';
import {
  CLOTHING_MEASUREMENTS,
  ABAYA_SIZE_GUIDE,
  HIJAB_SIZE_GUIDE,
  SHOE_SIZE_GUIDE,
  SIZE_CONVERSION,
  findSizeByMeasurement,
  recommendSize,
  convertMeasurement,
  getSizeGuideByCategory,
} from '../../app/services/size-guide/index';

describe('Size Guide Service', () => {
  describe('Clothing Measurements', () => {
    it('should have standard measurements', () => {
      expect(CLOTHING_MEASUREMENTS).toHaveLength(6);
      expect(CLOTHING_MEASUREMENTS.map((m) => m.id)).toContain('bust');
      expect(CLOTHING_MEASUREMENTS.map((m) => m.id)).toContain('waist');
      expect(CLOTHING_MEASUREMENTS.map((m) => m.id)).toContain('hips');
    });

    it('should have Arabic names', () => {
      const bust = CLOTHING_MEASUREMENTS.find((m) => m.id === 'bust');
      expect(bust?.nameAr).toBe('الصدر');
    });
  });

  describe('Abaya Size Guide', () => {
    it('should have GCC sizes', () => {
      expect(ABAYA_SIZE_GUIDE.category).toBe('clothing');
      expect(ABAYA_SIZE_GUIDE.sizes).toHaveLength(8);
      expect(ABAYA_SIZE_GUIDE.sizes[0].size).toBe('XS');
      expect(ABAYA_SIZE_GUIDE.sizes[7].size).toBe('4XL');
    });

    it('should have measurements for each size', () => {
      const sizeM = ABAYA_SIZE_GUIDE.sizes.find((s) => s.size === 'M');
      expect(sizeM?.measurements.bust).toBe(98);
      expect(sizeM?.measurements.waist).toBe(82);
      expect(sizeM?.measurements.length).toBe(142);
    });

    it('should have Arabic notes', () => {
      expect(ABAYA_SIZE_GUIDE.notesAr).toContain('عبايات');
    });
  });

  describe('Hijab Size Guide', () => {
    it('should have hijab-specific sizes', () => {
      expect(HIJAB_SIZE_GUIDE.category).toBe('hijab');
      expect(HIJAB_SIZE_GUIDE.sizes).toHaveLength(4);
    });

    it('should have length and width measurements', () => {
      const small = HIJAB_SIZE_GUIDE.sizes[0];
      expect(small.measurements.length).toBe(110);
      expect(small.measurements.width).toBe(110);
    });
  });

  describe('Size Conversion', () => {
    it('should have GCC to US conversion', () => {
      const conversion = SIZE_CONVERSION['abaya-gcc'];
      expect(conversion.GCC).toContain('S');
      expect(conversion.US).toContain('0-2');
    });
  });

  describe('Size Finding', () => {
    it('should find size by bust measurement', () => {
      const size = findSizeByMeasurement(ABAYA_SIZE_GUIDE, 'bust', 98);
      expect(size).toBe('M');
    });

    it('should return null for no match', () => {
      const size = findSizeByMeasurement(ABAYA_SIZE_GUIDE, 'bust', 200);
      expect(size).toBeNull();
    });
  });

  describe('Size Recommendation', () => {
    it('should recommend size with high confidence', () => {
      const result = recommendSize(ABAYA_SIZE_GUIDE, {
        bust: 98,
        waist: 82,
        hips: 104,
      });
      expect(result.size).toBe('M');
      expect(result.confidence).toBe('high');
    });

    it('should recommend with lower confidence for partial match', () => {
      const result = recommendSize(ABAYA_SIZE_GUIDE, {
        bust: 95, // Between S and M
        waist: 80,
        hips: 100,
      });
      expect(['S', 'M']).toContain(result.size);
    });
  });

  describe('Measurement Conversion', () => {
    it('should convert cm to inch', () => {
      expect(convertMeasurement(100, 'cm', 'inch')).toBe(39.4);
    });

    it('should convert inch to cm', () => {
      const result = convertMeasurement(39.4, 'inch', 'cm');
      expect(result).toBeGreaterThan(99);
      expect(result).toBeLessThan(101);
    });

    it('should return same value for same units', () => {
      expect(convertMeasurement(100, 'cm', 'cm')).toBe(100);
    });
  });

  describe('Category Filtering', () => {
    it('should get guides by category', () => {
      const clothing = getSizeGuideByCategory('clothing');
      expect(clothing).toContain(ABAYA_SIZE_GUIDE);

      const hijab = getSizeGuideByCategory('hijab');
      expect(hijab).toContain(HIJAB_SIZE_GUIDE);

      const shoes = getSizeGuideByCategory('shoes');
      expect(shoes).toContain(SHOE_SIZE_GUIDE);
    });
  });
});
