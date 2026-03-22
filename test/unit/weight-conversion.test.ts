import { describe, it, expect } from 'vitest';
import {
  convertWeight,
  formatWeight,
  getWeightUnitLabel,
  getConversionFactor,
  roundWeight,
  parseWeight,
  convertAndFormatWeight,
  batchConvertWeights,
  compareWeights,
  maxWeight,
  minWeight,
  sumWeights,
  averageWeight,
  formatWeightRange,
  suggestUnit,
  convertToPreferredUnit,
  getSupportedWeightUnits,
  isSupportedWeightUnit,
} from '../../app/services/translation-features/weight-conversion';

describe('Weight Conversion Service', () => {
  describe('convertWeight', () => {
    it('converts kg to lb accurately', () => {
      const result = convertWeight(1, 'kg', 'lb');
      expect(result.value).toBeCloseTo(2.205, 3);
      expect(result.fromUnit).toBe('kg');
      expect(result.toUnit).toBe('lb');
      expect(result.originalValue).toBe(1);
    });

    it('converts lb to kg accurately', () => {
      const result = convertWeight(1, 'lb', 'kg');
      expect(result.value).toBeCloseTo(0.454, 3);
    });

    it('converts kg to g', () => {
      const result = convertWeight(2.5, 'kg', 'g');
      expect(result.value).toBe(2500);
    });

    it('converts g to kg', () => {
      const result = convertWeight(500, 'g', 'kg');
      expect(result.value).toBe(0.5);
    });

    it('converts lb to oz', () => {
      const result = convertWeight(1, 'lb', 'oz');
      expect(result.value).toBeCloseTo(16, 1);
    });

    it('converts oz to lb', () => {
      const result = convertWeight(16, 'oz', 'lb');
      expect(result.value).toBeCloseTo(1, 3);
    });

    it('handles same unit conversion', () => {
      const result = convertWeight(100, 'kg', 'kg');
      expect(result.value).toBe(100);
    });

    it('handles zero value', () => {
      const result = convertWeight(0, 'kg', 'lb');
      expect(result.value).toBe(0);
    });

    it('handles negative values', () => {
      const result = convertWeight(-5, 'kg', 'lb');
      expect(result.value).toBeCloseTo(-11.023, 3);
    });

    it('converts oz to g', () => {
      const result = convertWeight(1, 'oz', 'g');
      expect(result.value).toBeCloseTo(28.35, 2);
    });

    it('converts g to oz', () => {
      const result = convertWeight(100, 'g', 'oz');
      expect(result.value).toBeCloseTo(3.527, 3);
    });
  });

  describe('getConversionFactor', () => {
    it('returns 1 for same units', () => {
      expect(getConversionFactor('kg', 'kg')).toBe(1);
    });

    it('returns correct kg to lb factor', () => {
      expect(getConversionFactor('kg', 'lb')).toBeCloseTo(2.205, 3);
    });

    it('returns correct lb to kg factor', () => {
      expect(getConversionFactor('lb', 'kg')).toBeCloseTo(0.454, 3);
    });
  });

  describe('roundWeight', () => {
    it('rounds kg to 3 decimal places', () => {
      expect(roundWeight(1.23456, 'kg')).toBe(1.235);
    });

    it('rounds g to 1 decimal place', () => {
      expect(roundWeight(123.45, 'g')).toBe(123.5);
    });

    it('rounds lb to 3 decimal places', () => {
      expect(roundWeight(2.20462, 'lb')).toBe(2.205);
    });

    it('rounds oz to 2 decimal places', () => {
      expect(roundWeight(16.123, 'oz')).toBe(16.12);
    });
  });

  describe('formatWeight', () => {
    it('formats weight in English', () => {
      const formatted = formatWeight(5.5, 'kg', 'en');
      expect(formatted).toContain('5.5');
      expect(formatted).toContain('kg');
    });

    it('formats weight in Arabic', () => {
      const formatted = formatWeight(5.5, 'kg', 'ar');
      expect(formatted).toContain('كجم');
    });

    it('formats weight in Hebrew', () => {
      const formatted = formatWeight(5.5, 'kg', 'he');
      expect(formatted).toContain('ק"ג');
    });

    it('formats without unit when specified', () => {
      const formatted = formatWeight(5.5, 'kg', 'en', { includeUnit: false });
      expect(formatted).toBe('5.5');
      expect(formatted).not.toContain('kg');
    });

    it('formats with full unit name', () => {
      const formatted = formatWeight(1, 'kg', 'en', { useFullName: true });
      expect(formatted).toContain('kilogram');
    });

    it('formats plural with full unit name', () => {
      const formatted = formatWeight(5, 'kg', 'en', { useFullName: true });
      expect(formatted).toContain('kilograms');
    });

    it('formats with custom decimals', () => {
      const formatted = formatWeight(5.555, 'kg', 'en', { decimals: 1 });
      expect(formatted).toContain('5.6');
    });

    it('uses RTL format for Arabic', () => {
      const formatted = formatWeight(10, 'kg', 'ar');
      // In RTL, unit comes first
      expect(formatted.indexOf('كجم')).toBeLessThan(formatted.indexOf('10'));
    });
  });

  describe('getWeightUnitLabel', () => {
    it('returns English labels', () => {
      expect(getWeightUnitLabel('kg', 'en')).toBe('kg');
      expect(getWeightUnitLabel('lb', 'en')).toBe('lb');
    });

    it('returns Arabic labels', () => {
      expect(getWeightUnitLabel('kg', 'ar')).toBe('كجم');
      expect(getWeightUnitLabel('g', 'ar')).toBe('غرام');
    });

    it('returns Hebrew labels', () => {
      expect(getWeightUnitLabel('kg', 'he')).toBe('ק"ג');
      expect(getWeightUnitLabel('g', 'he')).toBe('גרם');
    });

    it('returns full names when requested', () => {
      expect(getWeightUnitLabel('kg', 'en', true)).toBe('kilogram');
      expect(getWeightUnitLabel('kg', 'ar', true)).toBe('كيلوغرام');
    });
  });

  describe('parseWeight', () => {
    it('parses simple number', () => {
      expect(parseWeight('5.5')).toBe(5.5);
    });

    it('parses number with unit', () => {
      expect(parseWeight('5.5 kg')).toBe(5.5);
      expect(parseWeight('10lb')).toBe(10);
    });

    it('parses number with thousands separator', () => {
      expect(parseWeight('1,000.5 kg')).toBe(1000.5);
    });

    it('returns null for invalid input', () => {
      expect(parseWeight('invalid')).toBeNull();
      expect(parseWeight('')).toBeNull();
    });

    it('parses Arabic unit labels', () => {
      expect(parseWeight('5 كجم')).toBe(5);
    });
  });

  describe('convertAndFormatWeight', () => {
    it('converts and formats in one operation', () => {
      const result = convertAndFormatWeight(1, 'kg', 'lb', 'en');
      expect(result).toContain('2.2');
      expect(result).toContain('lb');
    });

    it('converts and formats for Arabic locale', () => {
      const result = convertAndFormatWeight(1, 'lb', 'kg', 'ar');
      expect(result).toContain('كجم');
    });
  });

  describe('batchConvertWeights', () => {
    it('converts multiple weights', () => {
      const items = [
        { value: 1, unit: 'kg' as const, id: '1' },
        { value: 2, unit: 'kg' as const, id: '2' },
      ];
      const results = batchConvertWeights(items, 'lb');
      expect(results).toHaveLength(2);
      expect(results[0].value).toBeCloseTo(2.205, 3);
      expect(results[1].value).toBeCloseTo(4.409, 3);
    });

    it('preserves IDs in results', () => {
      const items = [{ value: 1, unit: 'kg' as const, id: 'item-1' }];
      const results = batchConvertWeights(items, 'lb');
      expect(results[0].id).toBe('item-1');
    });
  });

  describe('compareWeights', () => {
    it('returns 0 for equal weights', () => {
      expect(compareWeights({ value: 1, unit: 'kg' }, { value: 1, unit: 'kg' })).toBe(0);
    });

    it('returns -1 when first is lighter', () => {
      expect(compareWeights({ value: 500, unit: 'g' }, { value: 1, unit: 'kg' })).toBe(-1);
    });

    it('returns 1 when first is heavier', () => {
      expect(compareWeights({ value: 2, unit: 'kg' }, { value: 1, unit: 'kg' })).toBe(1);
    });

    it('compares different units correctly', () => {
      expect(compareWeights({ value: 1, unit: 'lb' }, { value: 500, unit: 'g' })).toBe(-1);
    });
  });

  describe('maxWeight', () => {
    it('returns first weight when heavier', () => {
      const result = maxWeight({ value: 2, unit: 'kg' }, { value: 1, unit: 'kg' });
      expect(result.value).toBe(2);
    });

    it('returns second weight when heavier', () => {
      const result = maxWeight({ value: 1, unit: 'kg' }, { value: 2, unit: 'kg' });
      expect(result.value).toBe(2);
    });

    it('handles different units', () => {
      const result = maxWeight({ value: 1, unit: 'kg' }, { value: 1000, unit: 'g' });
      expect(result.value).toBe(1);
      expect(result.unit).toBe('kg');
    });
  });

  describe('minWeight', () => {
    it('returns lighter weight', () => {
      const result = minWeight({ value: 2, unit: 'kg' }, { value: 1, unit: 'kg' });
      expect(result.value).toBe(1);
    });

    it('handles different units', () => {
      const result = minWeight({ value: 500, unit: 'g' }, { value: 2, unit: 'kg' });
      expect(result.value).toBe(500);
      expect(result.unit).toBe('g');
    });
  });

  describe('sumWeights', () => {
    it('sums weights in same unit', () => {
      const weights = [
        { value: 1, unit: 'kg' as const },
        { value: 2, unit: 'kg' as const },
      ];
      expect(sumWeights(weights, 'kg')).toBe(3);
    });

    it('sums weights in different units', () => {
      const weights = [
        { value: 500, unit: 'g' as const },
        { value: 1, unit: 'kg' as const },
      ];
      expect(sumWeights(weights, 'kg')).toBe(1.5);
    });

    it('returns 0 for empty array', () => {
      expect(sumWeights([], 'kg')).toBe(0);
    });
  });

  describe('averageWeight', () => {
    it('calculates average of weights', () => {
      const weights = [
        { value: 1, unit: 'kg' as const },
        { value: 3, unit: 'kg' as const },
      ];
      expect(averageWeight(weights, 'kg')).toBe(2);
    });

    it('handles different units', () => {
      const weights = [
        { value: 500, unit: 'g' as const },
        { value: 2, unit: 'kg' as const },
      ];
      expect(averageWeight(weights, 'kg')).toBe(1.25);
    });

    it('returns null for empty array', () => {
      expect(averageWeight([], 'kg')).toBeNull();
    });
  });

  describe('formatWeightRange', () => {
    it('formats range with different values', () => {
      const result = formatWeightRange(1, 5, 'kg', 'en');
      expect(result).toContain('1');
      expect(result).toContain('5');
      expect(result).toContain('kg');
    });

    it('returns single value when min equals max', () => {
      const result = formatWeightRange(5, 5, 'kg', 'en');
      expect(result).toBe(formatWeight(5, 'kg', 'en'));
    });

    it('formats range in Arabic', () => {
      const result = formatWeightRange(1, 5, 'kg', 'ar');
      expect(result).toContain('كجم');
    });
  });

  describe('suggestUnit', () => {
    it('suggests kg for metric system with large values', () => {
      expect(suggestUnit(1500, 'metric')).toBe('kg');
    });

    it('suggests g for metric system with small values', () => {
      expect(suggestUnit(500, 'metric')).toBe('g');
    });

    it('suggests lb for imperial system with large values', () => {
      expect(suggestUnit(500, 'imperial')).toBe('lb');
    });

    it('suggests oz for imperial system with small values', () => {
      expect(suggestUnit(100, 'imperial')).toBe('oz');
    });
  });

  describe('convertToPreferredUnit', () => {
    it('converts to metric when appropriate', () => {
      const result = convertToPreferredUnit(1500, 'g', 'metric');
      expect(result.unit).toBe('kg');
      expect(result.value).toBe(1.5);
    });

    it('keeps unit when already appropriate', () => {
      const result = convertToPreferredUnit(5, 'kg', 'metric');
      expect(result.unit).toBe('kg');
      expect(result.value).toBe(5);
    });

    it('converts to imperial when requested', () => {
      const result = convertToPreferredUnit(500, 'g', 'imperial');
      expect(result.unit).toBe('lb');
    });
  });

  describe('getSupportedWeightUnits', () => {
    it('returns all supported units', () => {
      const units = getSupportedWeightUnits();
      expect(units).toContain('kg');
      expect(units).toContain('g');
      expect(units).toContain('lb');
      expect(units).toContain('oz');
      expect(units).toHaveLength(4);
    });
  });

  describe('isSupportedWeightUnit', () => {
    it('returns true for supported units', () => {
      expect(isSupportedWeightUnit('kg')).toBe(true);
      expect(isSupportedWeightUnit('g')).toBe(true);
      expect(isSupportedWeightUnit('lb')).toBe(true);
      expect(isSupportedWeightUnit('oz')).toBe(true);
    });

    it('returns false for unsupported units', () => {
      expect(isSupportedWeightUnit('ton')).toBe(false);
      expect(isSupportedWeightUnit('mg')).toBe(false);
      expect(isSupportedWeightUnit('')).toBe(false);
    });

    it('is case sensitive', () => {
      expect(isSupportedWeightUnit('KG')).toBe(false);
      expect(isSupportedWeightUnit('Kg')).toBe(false);
    });
  });
});
