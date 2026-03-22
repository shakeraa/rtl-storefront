import { describe, it, expect } from 'vitest';
import {
  MODESTY_LEVELS,
  REGIONAL_SIZES,
  convertSize,
  getRecommendationsForBodyType,
  HIJAB_STYLES,
  ABAYA_CUSTOMIZATIONS,
  calculateSize,
  getFittingRecommendation,
} from '../../app/services/fashion/index';

describe('RTL Fashion Service', () => {
  describe('Modesty Levels', () => {
    it('should have 3 modesty levels', () => {
      expect(MODESTY_LEVELS).toHaveLength(3);
      expect(MODESTY_LEVELS.map((m) => m.id)).toContain('conservative');
      expect(MODESTY_LEVELS.map((m) => m.id)).toContain('moderate');
      expect(MODESTY_LEVELS.map((m) => m.id)).toContain('casual');
    });

    it('should have Arabic names', () => {
      expect(MODESTY_LEVELS[0].nameArabic).toBe('محافظ');
      expect(MODESTY_LEVELS[1].nameArabic).toBe('معتدل');
      expect(MODESTY_LEVELS[2].nameArabic).toBe('عصري');
    });
  });

  describe('Regional Sizes', () => {
    it('should have sizes for all regions', () => {
      expect(REGIONAL_SIZES.GCC).toContain('XS');
      expect(REGIONAL_SIZES.GCC).toContain('4XL');
      expect(REGIONAL_SIZES.MENA).toContain('36');
      expect(REGIONAL_SIZES.US).toContain('0');
    });
  });

  describe('Size Conversion', () => {
    it('should convert US to GCC sizes', () => {
      expect(convertSize('0', 'US', 'GCC')).toBe('XS');
      expect(convertSize('4', 'US', 'GCC')).toBe('XS');
      expect(convertSize('8', 'US', 'GCC')).toBe('M');
    });

    it('should convert GCC to US sizes', () => {
      expect(convertSize('XS', 'GCC', 'US')).toBe('0-2');
      expect(convertSize('M', 'GCC', 'US')).toBe('8-10');
    });

    it('should return null for unsupported conversion', () => {
      expect(convertSize('S', 'EU', 'GCC')).toBeNull();
    });
  });

  describe('Body Type Recommendations', () => {
    it('should return recommendations for all body types', () => {
      const bodyTypes = ['pear', 'apple', 'hourglass', 'rectangle', 'inverted-triangle'] as const;
      
      for (const type of bodyTypes) {
        const rec = getRecommendationsForBodyType(type, 'moderate');
        expect(rec.forBodyType).toBe(type);
      }
    });
  });

  describe('Hijab Styles', () => {
    it('should have defined hijab styles', () => {
      expect(HIJAB_STYLES).toHaveLength(3);
      expect(HIJAB_STYLES.map((s) => s.id)).toContain('classic');
      expect(HIJAB_STYLES.map((s) => s.id)).toContain('turban');
    });

    it('should have styling steps', () => {
      for (const style of HIJAB_STYLES) {
        expect(style.steps.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Abaya Customization', () => {
    it('should have fabric options', () => {
      const fabricCat = ABAYA_CUSTOMIZATIONS.find((c) => c.id === 'fabric');
      expect(fabricCat).toBeDefined();
      expect(fabricCat?.options).toHaveLength(4);
    });

    it('should have color options', () => {
      const colorCat = ABAYA_CUSTOMIZATIONS.find((c) => c.id === 'color');
      expect(colorCat).toBeDefined();
      expect(colorCat?.options.some((o) => o.id === 'black')).toBe(true);
    });
  });

  describe('Size Calculator', () => {
    it('should calculate size from measurements', () => {
      const size = calculateSize(
        { bust: 90, waist: 70, hips: 95 },
        'GCC'
      );
      expect(['S', 'M', 'L']).toContain(size);
    });
  });
});
