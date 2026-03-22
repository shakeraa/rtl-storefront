import { describe, it, expect } from 'vitest';
import {
  getSizeLabel,
  getSizeChartLabels,
  convertSize,
  getAvailableSizes,
  getPlusSizeOptions,
  convertMeasurement,
  getSizeRecommendation,
  isValidSize,
  Locale,
  CLOTHING_SIZES,
  PLUS_SIZE_MAP,
  SIZE_TRANSLATIONS,
  SHOE_SIZE_CONVERSIONS,
  WOMEN_SHOE_SIZE_CONVERSIONS,
} from '../../app/services/translation-features/size-localization';

describe('Size Localization Service', () => {
  describe('getSizeLabel', () => {
    it('returns English label for standard clothing sizes', () => {
      expect(getSizeLabel('S', 'en', 'clothing')).toBe('Small');
      expect(getSizeLabel('M', 'en', 'clothing')).toBe('Medium');
      expect(getSizeLabel('L', 'en', 'clothing')).toBe('Large');
      expect(getSizeLabel('XL', 'en', 'clothing')).toBe('Extra Large');
    });

    it('returns Arabic label for standard clothing sizes', () => {
      expect(getSizeLabel('S', 'ar', 'clothing')).toBe('صغير');
      expect(getSizeLabel('M', 'ar', 'clothing')).toBe('متوسط');
      expect(getSizeLabel('L', 'ar', 'clothing')).toBe('كبير');
      expect(getSizeLabel('XL', 'ar', 'clothing')).toBe('كبير جداً');
    });

    it('returns Hebrew label for standard clothing sizes', () => {
      expect(getSizeLabel('S', 'he', 'clothing')).toBe('קטן');
      expect(getSizeLabel('M', 'he', 'clothing')).toBe('בינוני');
      expect(getSizeLabel('L', 'he', 'clothing')).toBe('גדול');
      expect(getSizeLabel('XL', 'he', 'clothing')).toBe('גדול מאוד');
    });

    it('returns Arabic labels for plus sizes', () => {
      expect(getSizeLabel('2XL', 'ar', 'clothing')).toBe('كبير مضاعف ×2');
      expect(getSizeLabel('3XL', 'ar', 'clothing')).toBe('كبير مضاعف ×3');
      expect(getSizeLabel('4XL', 'ar', 'clothing')).toBe('كبير مضاعف ×4');
    });

    it('returns Hebrew labels for plus sizes', () => {
      expect(getSizeLabel('2XL', 'he', 'clothing')).toBe('גדול כפול ×2');
      expect(getSizeLabel('3XL', 'he', 'clothing')).toBe('גדול כפול ×3');
    });

    it('returns plus size notation labels (1X, 2X, etc.)', () => {
      expect(getSizeLabel('1X', 'en', 'clothing')).toBe('1X Plus');
      expect(getSizeLabel('2X', 'en', 'clothing')).toBe('2X Plus');
      expect(getSizeLabel('1X', 'ar', 'clothing')).toBe('مقاس خاص +1');
      expect(getSizeLabel('2X', 'he', 'clothing')).toBe('מידה פלוס +2');
    });

    it('returns shoe size with region indicator', () => {
      expect(getSizeLabel('9', 'en', 'shoes')).toBe('Size 9 US');
      expect(getSizeLabel('9', 'ar', 'shoes')).toBe('مقاس 9 أمريكي');
      expect(getSizeLabel('9', 'he', 'shoes')).toBe('מידה 9 ארה"ב');
    });

    it('handles case insensitivity', () => {
      expect(getSizeLabel('s', 'en', 'clothing')).toBe('Small');
      expect(getSizeLabel('xl', 'en', 'clothing')).toBe('Extra Large');
    });

    it('returns empty string for empty size', () => {
      expect(getSizeLabel('', 'en', 'clothing')).toBe('');
    });

    it('returns original size if no translation found', () => {
      expect(getSizeLabel('UNKNOWN', 'en', 'clothing')).toBe('UNKNOWN');
    });
  });

  describe('getSizeChartLabels', () => {
    it('returns English size chart labels', () => {
      const labels = getSizeChartLabels('en');
      expect(labels.title).toBe('Size Guide');
      expect(labels.sizeColumn).toBe('Size');
      expect(labels.usColumn).toBe('US');
      expect(labels.ukColumn).toBe('UK');
      expect(labels.euColumn).toBe('EU');
      expect(labels.notes).toBe('Sizes may vary by brand and style');
    });

    it('returns Arabic size chart labels', () => {
      const labels = getSizeChartLabels('ar');
      expect(labels.title).toBe('دليل المقاسات');
      expect(labels.sizeColumn).toBe('المقاس');
      expect(labels.usColumn).toBe('أمريكي');
      expect(labels.ukColumn).toBe('بريطاني');
      expect(labels.euColumn).toBe('أوروبي');
      expect(labels.chestColumn).toBe('الصدر (سم)');
      expect(labels.waistColumn).toBe('الخصر (سم)');
      expect(labels.hipsColumn).toBe('الورك (سم)');
    });

    it('returns Hebrew size chart labels', () => {
      const labels = getSizeChartLabels('he');
      expect(labels.title).toBe('מדריך מידות');
      expect(labels.sizeColumn).toBe('מידה');
      expect(labels.usColumn).toBe('ארה"ב');
      expect(labels.ukColumn).toBe('בריטניה');
      expect(labels.euColumn).toBe('אירופה');
    });

    it('defaults to English for unknown locale', () => {
      const labels = getSizeChartLabels('unknown' as Locale);
      expect(labels.title).toBe('Size Guide');
    });
  });

  describe('convertSize', () => {
    it('converts clothing sizes from US to UK', () => {
      expect(convertSize('S', 'US', 'UK', 'clothing')).toBe('S');
      expect(convertSize('M', 'US', 'UK', 'clothing')).toBe('M');
      expect(convertSize('L', 'US', 'UK', 'clothing')).toBe('L');
      expect(convertSize('XL', 'US', 'UK', 'clothing')).toBe('XL');
    });

    it('converts clothing sizes from US to EU', () => {
      expect(convertSize('S', 'US', 'EU', 'clothing')).toBe('44');
      expect(convertSize('M', 'US', 'EU', 'clothing')).toBe('48');
      expect(convertSize('L', 'US', 'EU', 'clothing')).toBe('52');
      expect(convertSize('XL', 'US', 'EU', 'clothing')).toBe('56');
      expect(convertSize('2XL', 'US', 'EU', 'clothing')).toBe('60');
    });

    it('converts numeric clothing sizes (US to UK/EU)', () => {
      expect(convertSize('6', 'US', 'UK', 'clothing')).toBe(10);
      expect(convertSize('8', 'US', 'EU', 'clothing')).toBe(40);
      expect(convertSize('12', 'US', 'UK', 'clothing')).toBe(16);
      expect(convertSize('14', 'US', 'EU', 'clothing')).toBe(46);
    });

    it('converts men shoe sizes US to UK/EU', () => {
      expect(convertSize('8', 'US', 'UK', 'shoes')).toBe(7.5);
      expect(convertSize('9', 'US', 'EU', 'shoes')).toBe(42.5);
      expect(convertSize('10', 'US', 'UK', 'shoes')).toBe(9.5);
      expect(convertSize('11', 'US', 'EU', 'shoes')).toBe(45);
    });

    it('converts women shoe sizes US to UK/EU', () => {
      expect(convertSize('7', 'US', 'UK', 'shoes', { gender: 'women' })).toBe(4.5);
      expect(convertSize('8', 'US', 'EU', 'shoes', { gender: 'women' })).toBe(38.5);
      expect(convertSize('9', 'US', 'UK', 'shoes', { gender: 'women' })).toBe(6.5);
      expect(convertSize('10', 'US', 'EU', 'shoes', { gender: 'women' })).toBe(41);
    });

    it('returns same size when converting within same region', () => {
      expect(convertSize('M', 'US', 'US', 'clothing')).toBe('M');
      expect(convertSize('9', 'UK', 'UK', 'shoes')).toBe('9');
      expect(convertSize('42', 'EU', 'EU', 'shoes')).toBe('42');
    });

    it('returns null for invalid clothing size conversions', () => {
      expect(convertSize('INVALID', 'US', 'EU', 'clothing')).toBeNull();
      expect(convertSize('ZZZ', 'US', 'UK', 'clothing')).toBeNull();
    });

    it('handles accessory sizes', () => {
      expect(convertSize('S', 'US', 'EU', 'accessories')).toBe('S');
      expect(convertSize('M', 'US', 'UK', 'accessories')).toBe('M');
      expect(convertSize('One Size', 'US', 'EU', 'accessories')).toBe('One Size');
    });
  });

  describe('getAvailableSizes', () => {
    it('returns clothing sizes', () => {
      const sizes = getAvailableSizes('clothing');
      expect(sizes).toContain('XS');
      expect(sizes).toContain('S');
      expect(sizes).toContain('M');
      expect(sizes).toContain('L');
      expect(sizes).toContain('XL');
      expect(sizes).toContain('2XL');
      expect(sizes).toContain('3XL');
    });

    it('returns shoe sizes', () => {
      const sizes = getAvailableSizes('shoes');
      expect(sizes).toContain('8');
      expect(sizes).toContain('9');
      expect(sizes).toContain('10');
      expect(sizes).toContain('11');
    });

    it('returns accessory sizes', () => {
      const sizes = getAvailableSizes('accessories');
      expect(sizes).toContain('S');
      expect(sizes).toContain('M');
      expect(sizes).toContain('L');
      expect(sizes).toContain('One Size');
    });
  });

  describe('getPlusSizeOptions', () => {
    it('returns plus size options for XL', () => {
      const options = getPlusSizeOptions('XL');
      expect(options).toContain('1X');
      expect(options).toContain('2X');
      expect(options).toContain('3X');
      expect(options).toContain('4X');
    });

    it('returns plus size options for 2XL', () => {
      const options = getPlusSizeOptions('2XL');
      expect(options).toContain('1X');
      expect(options).toContain('2X');
    });

    it('returns empty array for smaller sizes', () => {
      expect(getPlusSizeOptions('S')).toEqual([]);
      expect(getPlusSizeOptions('M')).toEqual([]);
      expect(getPlusSizeOptions('L')).toEqual([]);
    });
  });

  describe('convertMeasurement', () => {
    it('converts inches to centimeters', () => {
      expect(convertMeasurement(10, 'in', 'cm')).toBe(25.4);
      expect(convertMeasurement(32, 'in', 'cm')).toBe(81.3);
      expect(convertMeasurement(36, 'in', 'cm')).toBe(91.4);
    });

    it('converts centimeters to inches', () => {
      expect(convertMeasurement(25.4, 'cm', 'in')).toBe(10);
      expect(convertMeasurement(81, 'cm', 'in')).toBeCloseTo(31.9, 1);
    });

    it('returns same value when units match', () => {
      expect(convertMeasurement(32, 'in', 'in')).toBe(32);
      expect(convertMeasurement(81, 'cm', 'cm')).toBe(81);
    });
  });

  describe('getSizeRecommendation', () => {
    it('recommends correct size based on chest measurement', () => {
      expect(getSizeRecommendation(32, 28).size).toBe('XS');
      expect(getSizeRecommendation(35, 30).size).toBe('S');
      expect(getSizeRecommendation(38, 32).size).toBe('M');
      expect(getSizeRecommendation(42, 36).size).toBe('L');
      expect(getSizeRecommendation(46, 40).size).toBe('XL');
    });

    it('recommends plus sizes for larger measurements', () => {
      expect(getSizeRecommendation(50, 44).size).toBe('2XL');
      expect(getSizeRecommendation(54, 48).size).toBe('3XL');
      expect(getSizeRecommendation(58, 52).size).toBe('4XL');
    });

    it('returns localized label for recommendation', () => {
      const result = getSizeRecommendation(38, 32, undefined, 'ar');
      expect(result.size).toBe('M');
      expect(result.label).toBe('متوسط');
    });
  });

  describe('isValidSize', () => {
    it('validates standard clothing sizes', () => {
      expect(isValidSize('S', 'clothing')).toBe(true);
      expect(isValidSize('M', 'clothing')).toBe(true);
      expect(isValidSize('L', 'clothing')).toBe(true);
      expect(isValidSize('XL', 'clothing')).toBe(true);
      expect(isValidSize('2XL', 'clothing')).toBe(true);
    });

    it('validates plus size notation', () => {
      expect(isValidSize('1X', 'clothing')).toBe(true);
      expect(isValidSize('2X', 'clothing')).toBe(true);
      expect(isValidSize('3X', 'clothing')).toBe(true);
    });

    it('validates numeric clothing sizes', () => {
      expect(isValidSize('6', 'clothing')).toBe(true);
      expect(isValidSize('10', 'clothing')).toBe(true);
      expect(isValidSize('14', 'clothing')).toBe(true);
    });

    it('validates shoe sizes', () => {
      expect(isValidSize('8', 'shoes')).toBe(true);
      expect(isValidSize('9.5', 'shoes')).toBe(true);
      expect(isValidSize('10', 'shoes')).toBe(true);
    });

    it('validates accessory sizes', () => {
      expect(isValidSize('S', 'accessories')).toBe(true);
      expect(isValidSize('M', 'accessories')).toBe(true);
      expect(isValidSize('One Size', 'accessories')).toBe(true);
    });

    it('rejects invalid sizes', () => {
      expect(isValidSize('INVALID', 'clothing')).toBe(false);
      expect(isValidSize('ZZZ', 'shoes')).toBe(false);
      expect(isValidSize('', 'accessories')).toBe(false);
    });
  });

  describe('constants', () => {
    it('exports CLOTHING_SIZES array', () => {
      expect(CLOTHING_SIZES).toBeDefined();
      expect(CLOTHING_SIZES.length).toBeGreaterThan(0);
      expect(CLOTHING_SIZES).toContain('S');
    });

    it('exports SIZE_TRANSLATIONS for all locales', () => {
      expect(SIZE_TRANSLATIONS.en).toBeDefined();
      expect(SIZE_TRANSLATIONS.ar).toBeDefined();
      expect(SIZE_TRANSLATIONS.he).toBeDefined();
    });

    it('exports PLUS_SIZE_MAP', () => {
      expect(PLUS_SIZE_MAP['1X']).toBe('2XL');
      expect(PLUS_SIZE_MAP['2X']).toBe('3XL');
    });
  });
});
