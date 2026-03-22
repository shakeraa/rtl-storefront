import { describe, it, expect } from 'vitest';
import {
  convertTemperature,
  convertTemperatureWithResult,
  formatTemperature,
  getTemperatureUnitLabel,
  getTemperatureUnitSymbol,
  getTemperatureShortLabel,
  getAllTemperatureUnits,
  getSupportedLocales,
  isValidTemperature,
  detectUnitFromLocale,
  batchConvertTemperatures,
  compareTemperatures,
  formatTemperatureRange,
  calculateAverageTemperature,
  parseTemperature,
  ABSOLUTE_ZERO,
  TEMPERATURE_REFERENCE_POINTS,
  type TemperatureUnit,
  type TemperatureLocale,
} from '../../app/services/translation-features/temperature-conversion';

describe('Temperature Conversion Service', () => {
  describe('convertTemperature', () => {
    it('converts Celsius to Fahrenheit correctly', () => {
      expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
      expect(convertTemperature(100, 'celsius', 'fahrenheit')).toBe(212);
      expect(convertTemperature(-40, 'celsius', 'fahrenheit')).toBe(-40);
      expect(convertTemperature(37, 'celsius', 'fahrenheit')).toBeCloseTo(98.6, 1);
    });

    it('converts Fahrenheit to Celsius correctly', () => {
      expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBe(0);
      expect(convertTemperature(212, 'fahrenheit', 'celsius')).toBe(100);
      expect(convertTemperature(-40, 'fahrenheit', 'celsius')).toBe(-40);
      expect(convertTemperature(98.6, 'fahrenheit', 'celsius')).toBeCloseTo(37, 1);
    });

    it('converts Celsius to Kelvin correctly', () => {
      expect(convertTemperature(0, 'celsius', 'kelvin')).toBe(273.15);
      expect(convertTemperature(100, 'celsius', 'kelvin')).toBe(373.15);
      expect(convertTemperature(-273.15, 'celsius', 'kelvin')).toBe(0);
      expect(convertTemperature(-100, 'celsius', 'kelvin')).toBe(173.15);
    });

    it('converts Kelvin to Celsius correctly', () => {
      expect(convertTemperature(273.15, 'kelvin', 'celsius')).toBe(0);
      expect(convertTemperature(373.15, 'kelvin', 'celsius')).toBe(100);
      expect(convertTemperature(0, 'kelvin', 'celsius')).toBe(-273.15);
      expect(convertTemperature(173.15, 'kelvin', 'celsius')).toBe(-100);
    });

    it('converts Fahrenheit to Kelvin correctly', () => {
      expect(convertTemperature(32, 'fahrenheit', 'kelvin')).toBeCloseTo(273.15, 2);
      expect(convertTemperature(212, 'fahrenheit', 'kelvin')).toBeCloseTo(373.15, 2);
      expect(convertTemperature(-459.67, 'fahrenheit', 'kelvin')).toBeCloseTo(0, 2);
    });

    it('converts Kelvin to Fahrenheit correctly', () => {
      expect(convertTemperature(273.15, 'kelvin', 'fahrenheit')).toBeCloseTo(32, 2);
      expect(convertTemperature(373.15, 'kelvin', 'fahrenheit')).toBeCloseTo(212, 2);
      expect(convertTemperature(0, 'kelvin', 'fahrenheit')).toBeCloseTo(-459.67, 2);
    });

    it('returns same value when converting to same unit', () => {
      expect(convertTemperature(25, 'celsius', 'celsius')).toBe(25);
      expect(convertTemperature(77, 'fahrenheit', 'fahrenheit')).toBe(77);
      expect(convertTemperature(300, 'kelvin', 'kelvin')).toBe(300);
    });

    it('handles decimal values accurately', () => {
      expect(convertTemperature(36.6, 'celsius', 'fahrenheit')).toBeCloseTo(97.88, 1);
      expect(convertTemperature(25.5, 'celsius', 'kelvin')).toBe(298.65);
    });
  });

  describe('convertTemperatureWithResult', () => {
    it('returns complete conversion result object', () => {
      const result = convertTemperatureWithResult(100, 'celsius', 'fahrenheit', 'en');
      expect(result.value).toBe(212);
      expect(result.fromUnit).toBe('celsius');
      expect(result.toUnit).toBe('fahrenheit');
      expect(result.formatted).toContain('212');
      expect(result.formatted).toContain('°F');
    });

    it('formats result in specified locale', () => {
      const resultAr = convertTemperatureWithResult(100, 'celsius', 'fahrenheit', 'ar');
      expect(resultAr.formatted).toContain('°F');
      
      const resultHe = convertTemperatureWithResult(100, 'celsius', 'fahrenheit', 'he');
      expect(resultHe.formatted).toContain('°F');
    });
  });

  describe('formatTemperature', () => {
    it('formats Celsius with symbol for English locale', () => {
      const formatted = formatTemperature(25, 'celsius', 'en');
      expect(formatted).toContain('25');
      expect(formatted).toContain('°C');
    });

    it('formats Fahrenheit with symbol for English locale', () => {
      const formatted = formatTemperature(77, 'fahrenheit', 'en');
      expect(formatted).toContain('77');
      expect(formatted).toContain('°F');
    });

    it('formats Kelvin for English locale', () => {
      const formatted = formatTemperature(300, 'kelvin', 'en');
      expect(formatted).toContain('300');
      expect(formatted).toContain('K');
    });

    it('places unit before number for Arabic locale (RTL)', () => {
      const formatted = formatTemperature(25, 'celsius', 'ar');
      expect(formatted).toContain('°C');
      expect(formatted).toContain('25');
    });

    it('places unit before number for Hebrew locale (RTL)', () => {
      const formatted = formatTemperature(25, 'celsius', 'he');
      expect(formatted).toContain('°C');
      expect(formatted).toContain('25');
    });

    it('respects decimal places option', () => {
      const formatted2 = formatTemperature(25.567, 'celsius', 'en', { decimalPlaces: 2 });
      expect(formatted2).toContain('25.57');
      
      const formatted0 = formatTemperature(25.567, 'celsius', 'en', { decimalPlaces: 0 });
      expect(formatted0).toContain('26');
    });

    it('excludes unit when includeUnit is false', () => {
      const formatted = formatTemperature(25, 'celsius', 'en', { includeUnit: false });
      expect(formatted).toBe('25.0');
      expect(formatted).not.toContain('°C');
    });
  });

  describe('getTemperatureUnitLabel', () => {
    it('returns English labels correctly', () => {
      expect(getTemperatureUnitLabel('celsius', 'en')).toBe('Celsius');
      expect(getTemperatureUnitLabel('fahrenheit', 'en')).toBe('Fahrenheit');
      expect(getTemperatureUnitLabel('kelvin', 'en')).toBe('Kelvin');
    });

    it('returns Arabic labels correctly', () => {
      expect(getTemperatureUnitLabel('celsius', 'ar')).toBe('درجة مئوية');
      expect(getTemperatureUnitLabel('fahrenheit', 'ar')).toBe('فهرنهايت');
      expect(getTemperatureUnitLabel('kelvin', 'ar')).toBe('كلفن');
    });

    it('returns Hebrew labels correctly', () => {
      expect(getTemperatureUnitLabel('celsius', 'he')).toBe('צלזיוס');
      expect(getTemperatureUnitLabel('fahrenheit', 'he')).toBe('פרנהייט');
      expect(getTemperatureUnitLabel('kelvin', 'he')).toBe('קלווין');
    });

    it('defaults to English when locale not specified', () => {
      expect(getTemperatureUnitLabel('celsius')).toBe('Celsius');
    });
  });

  describe('getTemperatureUnitSymbol', () => {
    it('returns correct symbols for all units', () => {
      expect(getTemperatureUnitSymbol('celsius')).toBe('°C');
      expect(getTemperatureUnitSymbol('fahrenheit')).toBe('°F');
      expect(getTemperatureUnitSymbol('kelvin')).toBe('K');
    });
  });

  describe('getTemperatureShortLabel', () => {
    it('returns Arabic short labels correctly', () => {
      expect(getTemperatureShortLabel('celsius', 'ar')).toBe('°م');
      expect(getTemperatureShortLabel('fahrenheit', 'ar')).toBe('°ف');
      expect(getTemperatureShortLabel('kelvin', 'ar')).toBe('ك');
    });

    it('returns standard symbols for English and Hebrew', () => {
      expect(getTemperatureShortLabel('celsius', 'en')).toBe('°C');
      expect(getTemperatureShortLabel('celsius', 'he')).toBe('°C');
      expect(getTemperatureShortLabel('fahrenheit', 'en')).toBe('°F');
      expect(getTemperatureShortLabel('kelvin', 'en')).toBe('K');
    });
  });

  describe('getAllTemperatureUnits', () => {
    it('returns all three temperature units', () => {
      const units = getAllTemperatureUnits();
      expect(units).toHaveLength(3);
      expect(units).toContain('celsius');
      expect(units).toContain('fahrenheit');
      expect(units).toContain('kelvin');
    });
  });

  describe('getSupportedLocales', () => {
    it('returns all supported locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toHaveLength(3);
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
    });
  });

  describe('isValidTemperature', () => {
    it('returns true for temperatures above absolute zero', () => {
      expect(isValidTemperature(0, 'celsius')).toBe(true);
      expect(isValidTemperature(-100, 'celsius')).toBe(true);
      expect(isValidTemperature(32, 'fahrenheit')).toBe(true);
      expect(isValidTemperature(300, 'kelvin')).toBe(true);
    });

    it('returns true for temperature at absolute zero', () => {
      expect(isValidTemperature(-273.15, 'celsius')).toBe(true);
      expect(isValidTemperature(-459.67, 'fahrenheit')).toBe(true);
      expect(isValidTemperature(0, 'kelvin')).toBe(true);
    });

    it('returns false for temperatures below absolute zero', () => {
      expect(isValidTemperature(-300, 'celsius')).toBe(false);
      expect(isValidTemperature(-500, 'fahrenheit')).toBe(false);
      expect(isValidTemperature(-1, 'kelvin')).toBe(false);
    });
  });

  describe('detectUnitFromLocale', () => {
    it('detects Fahrenheit for US locale', () => {
      expect(detectUnitFromLocale('en-US')).toBe('fahrenheit');
      expect(detectUnitFromLocale('us')).toBe('fahrenheit');
    });

    it('detects Fahrenheit for other Fahrenheit countries', () => {
      expect(detectUnitFromLocale('bz')).toBe('fahrenheit'); // Belize
      expect(detectUnitFromLocale('bs')).toBe('fahrenheit'); // Bahamas
      expect(detectUnitFromLocale('ky')).toBe('fahrenheit'); // Cayman Islands
    });

    it('defaults to Celsius for most countries', () => {
      expect(detectUnitFromLocale('en-GB')).toBe('celsius');
      expect(detectUnitFromLocale('ar-SA')).toBe('celsius');
      expect(detectUnitFromLocale('he-IL')).toBe('celsius');
      expect(detectUnitFromLocale('de-DE')).toBe('celsius');
    });
  });

  describe('batchConvertTemperatures', () => {
    it('converts multiple temperatures', () => {
      const items = [
        { value: 0, fromUnit: 'celsius' as TemperatureUnit, toUnit: 'fahrenheit' as TemperatureUnit },
        { value: 100, fromUnit: 'celsius' as TemperatureUnit, toUnit: 'fahrenheit' as TemperatureUnit },
        { value: 37, fromUnit: 'celsius' as TemperatureUnit, toUnit: 'kelvin' as TemperatureUnit },
      ];
      
      const results = batchConvertTemperatures(items, 'en');
      expect(results).toHaveLength(3);
      expect(results[0].value).toBe(32);
      expect(results[1].value).toBe(212);
      expect(results[2].value).toBe(310.15);
    });

    it('preserves IDs in results', () => {
      const items = [
        { value: 0, fromUnit: 'celsius' as TemperatureUnit, toUnit: 'fahrenheit' as TemperatureUnit, id: 'temp1' },
        { value: 100, fromUnit: 'celsius' as TemperatureUnit, toUnit: 'fahrenheit' as TemperatureUnit, id: 'temp2' },
      ];
      
      const results = batchConvertTemperatures(items, 'en');
      expect(results[0].id).toBe('temp1');
      expect(results[1].id).toBe('temp2');
    });
  });

  describe('compareTemperatures', () => {
    it('compares temperatures in same unit', () => {
      const diff = compareTemperatures(
        { value: 100, unit: 'celsius' },
        { value: 50, unit: 'celsius' },
        'celsius'
      );
      expect(diff).toBe(50);
    });

    it('compares temperatures in different units', () => {
      const diff = compareTemperatures(
        { value: 100, unit: 'celsius' },
        { value: 212, unit: 'fahrenheit' },
        'celsius'
      );
      expect(diff).toBeCloseTo(0, 1); // 212°F = 100°C
    });

    it('returns negative when first is colder', () => {
      const diff = compareTemperatures(
        { value: 0, unit: 'celsius' },
        { value: 100, unit: 'fahrenheit' },
        'celsius'
      );
      expect(diff).toBeLessThan(0); // 0°C < 100°F (37.78°C)
    });
  });

  describe('formatTemperatureRange', () => {
    it('formats temperature range with same unit', () => {
      const range = formatTemperatureRange(20, 30, 'celsius', 'en');
      expect(range).toContain('20');
      expect(range).toContain('30');
    });

    it('returns single value when min equals max', () => {
      const range = formatTemperatureRange(25, 25, 'celsius', 'en');
      expect(range).toBe('25.0°C');
    });
  });

  describe('calculateAverageTemperature', () => {
    it('calculates average of multiple temperatures', () => {
      const temps = [
        { value: 0, unit: 'celsius' as TemperatureUnit },
        { value: 100, unit: 'celsius' as TemperatureUnit },
      ];
      
      const avg = calculateAverageTemperature(temps, 'celsius');
      expect(avg.value).toBe(50);
    });

    it('calculates average across different units', () => {
      const temps = [
        { value: 0, unit: 'celsius' as TemperatureUnit },
        { value: 212, unit: 'fahrenheit' as TemperatureUnit }, // 100°C
      ];
      
      const avg = calculateAverageTemperature(temps, 'celsius');
      expect(avg.value).toBe(50); // (0 + 100) / 2
    });

    it('returns zero for empty array', () => {
      const avg = calculateAverageTemperature([], 'celsius');
      expect(avg.value).toBe(0);
    });
  });

  describe('parseTemperature', () => {
    it('parses simple temperature value', () => {
      const parsed = parseTemperature('25°C');
      expect(parsed).not.toBeNull();
      expect(parsed?.value).toBe(25);
      expect(parsed?.unit).toBe('celsius');
    });

    it('parses Fahrenheit temperature', () => {
      const parsed = parseTemperature('77°F');
      expect(parsed?.value).toBe(77);
      expect(parsed?.unit).toBe('fahrenheit');
    });

    it('parses Kelvin temperature', () => {
      const parsed = parseTemperature('300K');
      expect(parsed?.value).toBe(300);
      expect(parsed?.unit).toBe('kelvin');
    });

    it('uses default unit when not specified', () => {
      const parsed = parseTemperature('25');
      expect(parsed?.value).toBe(25);
      expect(parsed?.unit).toBe('celsius');
    });

    it('handles negative temperatures', () => {
      const parsed = parseTemperature('-10°C');
      expect(parsed?.value).toBe(-10);
    });

    it('handles decimal values', () => {
      const parsed = parseTemperature('36.6°C');
      expect(parsed?.value).toBe(36.6);
    });

    it('returns null for invalid input', () => {
      const parsed = parseTemperature('not a temperature');
      expect(parsed).toBeNull();
    });
  });

  describe('Constants', () => {
    it('has correct absolute zero values', () => {
      expect(ABSOLUTE_ZERO.celsius).toBe(-273.15);
      expect(ABSOLUTE_ZERO.fahrenheit).toBe(-459.67);
      expect(ABSOLUTE_ZERO.kelvin).toBe(0);
    });

    it('has correct water freezing point values', () => {
      expect(TEMPERATURE_REFERENCE_POINTS.waterFreezing.celsius).toBe(0);
      expect(TEMPERATURE_REFERENCE_POINTS.waterFreezing.fahrenheit).toBe(32);
      expect(TEMPERATURE_REFERENCE_POINTS.waterFreezing.kelvin).toBe(273.15);
    });

    it('has correct water boiling point values', () => {
      expect(TEMPERATURE_REFERENCE_POINTS.waterBoiling.celsius).toBe(100);
      expect(TEMPERATURE_REFERENCE_POINTS.waterBoiling.fahrenheit).toBe(212);
      expect(TEMPERATURE_REFERENCE_POINTS.waterBoiling.kelvin).toBe(373.15);
    });

    it('has correct room temperature values', () => {
      expect(TEMPERATURE_REFERENCE_POINTS.roomTemperature.celsius).toBe(20);
      expect(TEMPERATURE_REFERENCE_POINTS.roomTemperature.fahrenheit).toBe(68);
      expect(TEMPERATURE_REFERENCE_POINTS.roomTemperature.kelvin).toBe(293.15);
    });

    it('has correct body temperature values', () => {
      expect(TEMPERATURE_REFERENCE_POINTS.bodyTemperature.celsius).toBe(37);
      expect(TEMPERATURE_REFERENCE_POINTS.bodyTemperature.fahrenheit).toBe(98.6);
      expect(TEMPERATURE_REFERENCE_POINTS.bodyTemperature.kelvin).toBe(310.15);
    });
  });
});
