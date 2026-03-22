import { describe, it, expect } from 'vitest';
import {
  convertDimension,
  convertDimensionDetailed,
  convertDimensions,
  formatDimensions,
  formatDimension,
  getDimensionUnitLabel,
  getDimensionName,
  suggestUnit,
  autoConvertDimensions,
  compareDimensions,
  areDimensionsEqual,
  parseDimension,
  parseDimensions,
  getSupportedUnits,
  isSupportedUnit,
  getConversionRate,
  formatDimensionSpec,
  batchConvertDimensions,
  getPreferredUnit,
} from '../../app/services/translation-features/dimension-conversion';

describe('Dimension Conversion Service', () => {
  describe('convertDimension', () => {
    it('converts cm to inches correctly', () => {
      const result = convertDimension(10, 'cm', 'in');
      expect(result).toBeCloseTo(3.94, 2);
    });

    it('converts inches to cm correctly', () => {
      const result = convertDimension(10, 'in', 'cm');
      expect(result).toBeCloseTo(25.4, 2);
    });

    it('converts meters to feet correctly', () => {
      const result = convertDimension(2, 'm', 'ft');
      expect(result).toBeCloseTo(6.56, 2);
    });

    it('converts feet to meters correctly', () => {
      const result = convertDimension(10, 'ft', 'm');
      expect(result).toBeCloseTo(3.05, 2);
    });

    it('returns same value when converting to same unit', () => {
      const result = convertDimension(50, 'cm', 'cm');
      expect(result).toBe(50);
    });

    it('handles zero values', () => {
      const result = convertDimension(0, 'cm', 'in');
      expect(result).toBe(0);
    });
  });

  describe('convertDimensionDetailed', () => {
    it('returns full conversion result with metadata', () => {
      const result = convertDimensionDetailed(100, 'cm', 'm', 2);
      expect(result.originalValue).toBe(100);
      expect(result.originalUnit).toBe('cm');
      expect(result.convertedValue).toBe(1);
      expect(result.targetUnit).toBe('m');
      expect(result.rounded).toBe(1);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('rounds to specified decimal places', () => {
      const result = convertDimensionDetailed(1, 'in', 'cm', 1);
      expect(result.rounded).toBe(2.5);
    });
  });

  describe('convertDimensions', () => {
    it('converts all dimensions in object', () => {
      const dims = { length: 100, width: 50, height: 25, unit: 'cm' as const };
      const result = convertDimensions(dims, 'in');
      expect(result.unit).toBe('in');
      expect(result.length).toBeCloseTo(39.37, 2);
      expect(result.width).toBeCloseTo(19.69, 2);
      expect(result.height).toBeCloseTo(9.84, 2);
    });

    it('preserves original when converting to same unit', () => {
      const dims = { length: 10, width: 20, height: 30, unit: 'cm' as const };
      const result = convertDimensions(dims, 'cm');
      expect(result).toEqual(dims);
    });
  });

  describe('formatDimensions', () => {
    it('formats dimensions in English', () => {
      const result = formatDimensions(10, 20, 30, 'cm', 'en');
      expect(result.width).toBe('10');
      expect(result.height).toBe('20');
      expect(result.length).toBe('30');
      expect(result.unit).toBe('cm');
      expect(result.fullFormat).toContain('10');
      expect(result.fullFormat).toContain('cm');
    });

    it('formats dimensions in Arabic', () => {
      const result = formatDimensions(15, 25, 35, 'cm', 'ar');
      expect(result.unit).toBe('سم');
      expect(result.fullFormat).toContain('سم');
    });

    it('formats dimensions in Hebrew', () => {
      const result = formatDimensions(12, 24, 36, 'cm', 'he');
      expect(result.unit).toBe('ס"מ');
      expect(result.fullFormat).toContain('ס"מ');
    });

    it('respects decimal places option', () => {
      const result = formatDimensions(10.555, 20.333, 30.111, 'cm', 'en', { decimals: 2 });
      expect(result.width).toBe('10.56');
    });

    it('can exclude unit from full format', () => {
      const result = formatDimensions(10, 20, 30, 'cm', 'en', { includeUnit: false });
      expect(result.fullFormat).not.toContain('cm');
    });

    it('uses full unit name when specified', () => {
      const result = formatDimensions(10, 20, 30, 'cm', 'en', { useFullUnitName: true });
      expect(result.unit).toBe('centimeters');
    });
  });

  describe('getDimensionUnitLabel', () => {
    it('returns English labels correctly', () => {
      expect(getDimensionUnitLabel('cm', 'en')).toBe('cm');
      expect(getDimensionUnitLabel('m', 'en')).toBe('m');
      expect(getDimensionUnitLabel('in', 'en')).toBe('in');
      expect(getDimensionUnitLabel('ft', 'en')).toBe('ft');
    });

    it('returns Arabic labels correctly', () => {
      expect(getDimensionUnitLabel('cm', 'ar')).toBe('سم');
      expect(getDimensionUnitLabel('m', 'ar')).toBe('م');
      expect(getDimensionUnitLabel('in', 'ar')).toBe('بوصة');
      expect(getDimensionUnitLabel('ft', 'ar')).toBe('قدم');
    });

    it('returns Hebrew labels correctly', () => {
      expect(getDimensionUnitLabel('cm', 'he')).toBe('ס"מ');
      expect(getDimensionUnitLabel('m', 'he')).toBe('מ"');
      expect(getDimensionUnitLabel('in', 'he')).toBe('"');
      expect(getDimensionUnitLabel('ft', 'he')).toBe('רגל');
    });

    it('falls back to English for unknown locale', () => {
      expect(getDimensionUnitLabel('cm', 'fr')).toBe('cm');
    });

    it('returns full names when requested', () => {
      expect(getDimensionUnitLabel('cm', 'en', true)).toBe('centimeters');
      expect(getDimensionUnitLabel('in', 'ar', true)).toBe('بوصات');
    });
  });

  describe('getDimensionName', () => {
    it('returns localized dimension names', () => {
      expect(getDimensionName('length', 'en')).toBe('Length');
      expect(getDimensionName('width', 'ar')).toBe('العرض');
      expect(getDimensionName('height', 'he')).toBe('גובה');
    });

    it('falls back to English', () => {
      expect(getDimensionName('length', 'fr')).toBe('Length');
    });
  });

  describe('formatDimension', () => {
    it('formats single dimension with unit', () => {
      const result = formatDimension(15.5, 'cm', 'en', 1);
      expect(result).toBe('15.5 cm');
    });

    it('formats in Arabic', () => {
      const result = formatDimension(20, 'm', 'ar', 0);
      expect(result).toBe('20 م');
    });

    it('removes trailing zeros', () => {
      const result = formatDimension(10.0, 'in', 'en', 1);
      expect(result).toBe('10 in');
    });
  });

  describe('suggestUnit', () => {
    it('suggests meters for large values', () => {
      expect(suggestUnit(150)).toBe('m');
    });

    it('suggests feet for medium-large values', () => {
      expect(suggestUnit(50)).toBe('ft');
    });

    it('suggests inches for medium values', () => {
      expect(suggestUnit(10)).toBe('in');
    });

    it('suggests cm for small values', () => {
      expect(suggestUnit(1)).toBe('cm');
    });
  });

  describe('autoConvertDimensions', () => {
    it('auto-converts to appropriate unit', () => {
      const dims = { length: 200, width: 150, height: 100, unit: 'cm' as const };
      const result = autoConvertDimensions(dims, 'en');
      expect(result.unit).toBe('m');
    });

    it('formats the converted dimensions', () => {
      const dims = { length: 10, width: 5, height: 2, unit: 'cm' as const };
      const result = autoConvertDimensions(dims, 'en');
      expect(result.fullFormat).toBeDefined();
      expect(result.width).toBeDefined();
    });
  });

  describe('compareDimensions', () => {
    it('returns -1 when first is smaller', () => {
      const result = compareDimensions({ value: 10, unit: 'cm' }, { value: 5, unit: 'in' });
      expect(result).toBe(-1);
    });

    it('returns 1 when first is larger', () => {
      const result = compareDimensions({ value: 30, unit: 'cm' }, { value: 10, unit: 'cm' });
      expect(result).toBe(1);
    });

    it('returns 0 when equal', () => {
      const result = compareDimensions({ value: 10, unit: 'cm' }, { value: 10, unit: 'cm' });
      expect(result).toBe(0);
    });

    it('handles different units correctly', () => {
      const result = compareDimensions({ value: 2.54, unit: 'cm' }, { value: 1, unit: 'in' });
      expect(result).toBe(0);
    });
  });

  describe('areDimensionsEqual', () => {
    it('returns true for equal dimensions', () => {
      const result = areDimensionsEqual({ value: 10, unit: 'cm' }, { value: 10, unit: 'cm' });
      expect(result).toBe(true);
    });

    it('returns true for equivalent dimensions in different units', () => {
      const result = areDimensionsEqual({ value: 1, unit: 'in' }, { value: 2.54, unit: 'cm' });
      expect(result).toBe(true);
    });

    it('returns false for different dimensions', () => {
      const result = areDimensionsEqual({ value: 10, unit: 'cm' }, { value: 20, unit: 'cm' });
      expect(result).toBe(false);
    });

    it('respects tolerance parameter', () => {
      const result = areDimensionsEqual({ value: 10, unit: 'cm' }, { value: 10.005, unit: 'cm' }, 0.01);
      expect(result).toBe(true);
    });
  });

  describe('parseDimension', () => {
    it('parses simple dimension with unit', () => {
      const result = parseDimension('10 cm');
      expect(result).toEqual({ value: 10, unit: 'cm' });
    });

    it('parses dimension with decimal', () => {
      const result = parseDimension('5.5 inches');
      expect(result).toEqual({ value: 5.5, unit: 'in' });
    });

    it('parses various unit formats', () => {
      expect(parseDimension('10 cm')).toEqual({ value: 10, unit: 'cm' });
      expect(parseDimension('10 centimeter')).toEqual({ value: 10, unit: 'cm' });
      expect(parseDimension('10 m')).toEqual({ value: 10, unit: 'm' });
      expect(parseDimension('10 ft')).toEqual({ value: 10, unit: 'ft' });
      expect(parseDimension('10 feet')).toEqual({ value: 10, unit: 'ft' });
    });

    it('defaults to cm when no unit specified', () => {
      const result = parseDimension('25');
      expect(result).toEqual({ value: 25, unit: 'cm' });
    });

    it('returns null for invalid input', () => {
      const result = parseDimension('invalid');
      expect(result).toBeNull();
    });
  });

  describe('parseDimensions', () => {
    it('parses LxWxH format with unit', () => {
      const result = parseDimensions('10 x 20 x 30 cm');
      expect(result).toEqual({ length: 10, width: 20, height: 30, unit: 'cm' });
    });

    it('parses with multiplication symbol', () => {
      const result = parseDimensions('10 × 20 × 30 in');
      expect(result).toEqual({ length: 10, width: 20, height: 30, unit: 'in' });
    });

    it('defaults to cm when no unit', () => {
      const result = parseDimensions('5 x 10 x 15');
      expect(result).toEqual({ length: 5, width: 10, height: 15, unit: 'cm' });
    });

    it('returns null for invalid format', () => {
      const result = parseDimensions('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getSupportedUnits', () => {
    it('returns all supported units', () => {
      const units = getSupportedUnits();
      expect(units).toContain('cm');
      expect(units).toContain('m');
      expect(units).toContain('in');
      expect(units).toContain('ft');
      expect(units).toHaveLength(4);
    });
  });

  describe('isSupportedUnit', () => {
    it('returns true for supported units', () => {
      expect(isSupportedUnit('cm')).toBe(true);
      expect(isSupportedUnit('m')).toBe(true);
      expect(isSupportedUnit('in')).toBe(true);
      expect(isSupportedUnit('ft')).toBe(true);
    });

    it('returns false for unsupported units', () => {
      expect(isSupportedUnit('mm')).toBe(false);
      expect(isSupportedUnit('yd')).toBe(false);
      expect(isSupportedUnit('km')).toBe(false);
    });
  });

  describe('getConversionRate', () => {
    it('returns 1 for same unit', () => {
      expect(getConversionRate('cm', 'cm')).toBe(1);
    });

    it('returns correct cm to in rate', () => {
      const rate = getConversionRate('cm', 'in');
      expect(rate).toBeCloseTo(0.394, 3);
    });

    it('returns correct ft to m rate', () => {
      const rate = getConversionRate('ft', 'm');
      expect(rate).toBeCloseTo(0.305, 3);
    });
  });

  describe('formatDimensionSpec', () => {
    it('formats spec in English', () => {
      const dims = { length: 10, width: 20, height: 30, unit: 'cm' as const };
      const result = formatDimensionSpec(dims, 'en');
      expect(result).toContain('10');
      expect(result).toContain('cm');
    });

    it('formats spec in Arabic', () => {
      const dims = { length: 10, width: 20, height: 30, unit: 'cm' as const };
      const result = formatDimensionSpec(dims, 'ar');
      expect(result).toContain('سم');
    });
  });

  describe('batchConvertDimensions', () => {
    it('converts multiple dimensions', () => {
      const values = [
        { value: 10, unit: 'cm' as const },
        { value: 20, unit: 'cm' as const },
        { value: 30, unit: 'cm' as const },
      ];
      const result = batchConvertDimensions(values, 'in');
      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(3.94, 2);
    });

    it('handles mixed units', () => {
      const values = [
        { value: 10, unit: 'cm' as const },
        { value: 1, unit: 'ft' as const },
      ];
      const result = batchConvertDimensions(values, 'm');
      expect(result[0]).toBeCloseTo(0.1, 2);
      expect(result[1]).toBeCloseTo(0.305, 3);
    });
  });

  describe('getPreferredUnit', () => {
    it('returns cm for all locales', () => {
      expect(getPreferredUnit('en')).toBe('cm');
      expect(getPreferredUnit('ar')).toBe('cm');
      expect(getPreferredUnit('he')).toBe('cm');
    });
  });
});
