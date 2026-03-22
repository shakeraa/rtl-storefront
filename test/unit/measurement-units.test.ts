import { describe, it, expect } from 'vitest';
import {
  getUnit,
  areUnitsCompatible,
  getUnitCategory,
  convertUnit,
  convertTemperature,
  convertCelsiusToFahrenheit,
  convertFahrenheitToCelsius,
  convertCelsiusToKelvin,
  convertKelvinToCelsius,
  convertFahrenheitToKelvin,
  convertKelvinToFahrenheit,
  getPluralForm,
  getUnitLabel,
  getUnitSymbol,
  formatMeasurement,
  formatNumber,
  toEasternArabicNumerals,
  fromEasternArabicNumerals,
  batchConvert,
  smartConvert,
  getUnitsByCategory,
  getSupportedLocales,
  isLocaleSupported,
  parseMeasurement,
  compareMeasurements,
  calculatePercentageDifference,
} from '../../app/services/translation-features/measurement-units';

describe('Measurement Units Service', () => {
  describe('Unit Definitions', () => {
    it('has metric length units defined', () => {
      expect(getUnit('mm')).toBeDefined();
      expect(getUnit('cm')).toBeDefined();
      expect(getUnit('m')).toBeDefined();
      expect(getUnit('km')).toBeDefined();
    });

    it('has imperial length units defined', () => {
      expect(getUnit('in')).toBeDefined();
      expect(getUnit('ft')).toBeDefined();
      expect(getUnit('yd')).toBeDefined();
      expect(getUnit('mi')).toBeDefined();
    });

    it('has metric weight units defined', () => {
      expect(getUnit('mg')).toBeDefined();
      expect(getUnit('g')).toBeDefined();
      expect(getUnit('kg')).toBeDefined();
    });

    it('has imperial weight units defined', () => {
      expect(getUnit('oz')).toBeDefined();
      expect(getUnit('lb')).toBeDefined();
    });

    it('has metric volume units defined', () => {
      expect(getUnit('ml')).toBeDefined();
      expect(getUnit('cl')).toBeDefined();
      expect(getUnit('l')).toBeDefined();
    });

    it('has imperial volume units defined', () => {
      expect(getUnit('fl_oz')).toBeDefined();
      expect(getUnit('cup')).toBeDefined();
      expect(getUnit('pt')).toBeDefined();
      expect(getUnit('qt')).toBeDefined();
      expect(getUnit('gal')).toBeDefined();
    });

    it('correctly identifies unit categories', () => {
      expect(getUnitCategory('cm')).toBe('length');
      expect(getUnitCategory('kg')).toBe('weight');
      expect(getUnitCategory('l')).toBe('volume');
      expect(getUnitCategory('sq_m')).toBe('area');
    });

    it('returns undefined for unknown units', () => {
      expect(getUnit('unknown')).toBeUndefined();
      expect(getUnitCategory('unknown')).toBeUndefined();
    });
  });

  describe('Unit Compatibility', () => {
    it('identifies compatible units of same category', () => {
      expect(areUnitsCompatible('cm', 'in')).toBe(true);
      expect(areUnitsCompatible('kg', 'lb')).toBe(true);
      expect(areUnitsCompatible('l', 'gal')).toBe(true);
    });

    it('identifies incompatible units of different categories', () => {
      expect(areUnitsCompatible('cm', 'kg')).toBe(false);
      expect(areUnitsCompatible('l', 'm')).toBe(false);
      expect(areUnitsCompatible('oz', 'sq_m')).toBe(false);
    });

    it('handles case insensitivity', () => {
      expect(areUnitsCompatible('CM', 'IN')).toBe(true);
      expect(areUnitsCompatible('KG', 'lb')).toBe(true);
    });
  });

  describe('Unit Conversions - Length', () => {
    it('converts cm to inches correctly', () => {
      const result = convertUnit(10, 'cm', 'in');
      expect(result.value).toBeCloseTo(3.937, 2);
      expect(result.fromUnit).toBe('cm');
      expect(result.toUnit).toBe('in');
      expect(result.originalValue).toBe(10);
    });

    it('converts inches to cm correctly', () => {
      const result = convertUnit(12, 'in', 'cm');
      expect(result.value).toBeCloseTo(30.48, 2);
    });

    it('converts meters to feet correctly', () => {
      const result = convertUnit(2, 'm', 'ft');
      expect(result.value).toBeCloseTo(6.562, 2);
    });

    it('converts miles to kilometers correctly', () => {
      const result = convertUnit(5, 'mi', 'km');
      expect(result.value).toBeCloseTo(8.047, 2);
    });

    it('handles same unit conversion', () => {
      const result = convertUnit(100, 'cm', 'cm');
      expect(result.value).toBe(100);
    });

    it('throws error for incompatible units', () => {
      expect(() => convertUnit(10, 'cm', 'kg')).toThrow('Incompatible units');
    });

    it('throws error for unknown units', () => {
      expect(() => convertUnit(10, 'unknown', 'cm')).toThrow('Unknown unit');
    });
  });

  describe('Unit Conversions - Weight', () => {
    it('converts kg to pounds correctly', () => {
      const result = convertUnit(1, 'kg', 'lb');
      expect(result.value).toBeCloseTo(2.205, 2);
    });

    it('converts pounds to kg correctly', () => {
      const result = convertUnit(1, 'lb', 'kg');
      expect(result.value).toBeCloseTo(0.454, 2);
    });

    it('converts grams to ounces correctly', () => {
      const result = convertUnit(100, 'g', 'oz');
      expect(result.value).toBeCloseTo(3.527, 2);
    });

    it('converts ounces to grams correctly', () => {
      const result = convertUnit(16, 'oz', 'g');
      expect(result.value).toBeCloseTo(453.592, 2);
    });
  });

  describe('Unit Conversions - Volume', () => {
    it('converts liters to gallons correctly', () => {
      const result = convertUnit(1, 'l', 'gal');
      expect(result.value).toBeCloseTo(0.264, 2);
    });

    it('converts gallons to liters correctly', () => {
      const result = convertUnit(1, 'gal', 'l');
      expect(result.value).toBeCloseTo(3.785, 2);
    });

    it('converts milliliters to fluid ounces correctly', () => {
      const result = convertUnit(100, 'ml', 'fl_oz');
      expect(result.value).toBeCloseTo(3.381, 2);
    });

    it('converts quarts to liters correctly', () => {
      const result = convertUnit(2, 'qt', 'l');
      expect(result.value).toBeCloseTo(1.893, 2);
    });
  });

  describe('Temperature Conversions', () => {
    it('converts Celsius to Fahrenheit correctly', () => {
      expect(convertCelsiusToFahrenheit(0)).toBe(32);
      expect(convertCelsiusToFahrenheit(100)).toBe(212);
      expect(convertCelsiusToFahrenheit(-40)).toBe(-40);
    });

    it('converts Fahrenheit to Celsius correctly', () => {
      expect(convertFahrenheitToCelsius(32)).toBe(0);
      expect(convertFahrenheitToCelsius(212)).toBe(100);
      expect(convertFahrenheitToCelsius(-40)).toBe(-40);
    });

    it('converts Celsius to Kelvin correctly', () => {
      expect(convertCelsiusToKelvin(0)).toBe(273.15);
      expect(convertCelsiusToKelvin(100)).toBe(373.15);
    });

    it('converts Kelvin to Celsius correctly', () => {
      expect(convertKelvinToCelsius(273.15)).toBe(0);
      expect(convertKelvinToCelsius(373.15)).toBe(100);
    });

    it('converts Fahrenheit to Kelvin correctly', () => {
      expect(convertFahrenheitToKelvin(32)).toBeCloseTo(273.15, 1);
      expect(convertFahrenheitToKelvin(212)).toBeCloseTo(373.15, 1);
    });

    it('converts Kelvin to Fahrenheit correctly', () => {
      expect(convertKelvinToFahrenheit(273.15)).toBeCloseTo(32, 1);
      expect(convertKelvinToFahrenheit(373.15)).toBeCloseTo(212, 1);
    });

    it('converts temperature using convertTemperature function', () => {
      const result = convertTemperature(100, 'celsius', 'fahrenheit');
      expect(result.value).toBe(212);
      expect(result.fromUnit).toBe('celsius');
      expect(result.toUnit).toBe('fahrenheit');
    });

    it('handles same temperature scale', () => {
      const result = convertTemperature(25, 'celsius', 'celsius');
      expect(result.value).toBe(25);
    });
  });

  describe('Plural Forms', () => {
    it('returns singular for 1 in all locales', () => {
      expect(getPluralForm(1, 'en')).toBe('singular');
      expect(getPluralForm(1, 'ar')).toBe('singular');
      expect(getPluralForm(1, 'he')).toBe('singular');
    });

    it('returns plural for 0 in English and Hebrew', () => {
      expect(getPluralForm(0, 'en')).toBe('plural');
      expect(getPluralForm(0, 'he')).toBe('plural');
    });

    it('returns dual for 2 in Arabic', () => {
      expect(getPluralForm(2, 'ar')).toBe('dual');
    });

    it('returns plural for 2 in English and Hebrew', () => {
      expect(getPluralForm(2, 'en')).toBe('plural');
      expect(getPluralForm(2, 'he')).toBe('plural');
    });

    it('handles negative values', () => {
      expect(getPluralForm(-1, 'en')).toBe('singular');
      expect(getPluralForm(-2, 'ar')).toBe('dual');
      expect(getPluralForm(-5, 'en')).toBe('plural');
    });
  });

  describe('Unit Labels', () => {
    it('returns English singular label', () => {
      expect(getUnitLabel('cm', 'en', false)).toBe('centimeter');
      expect(getUnitLabel('kg', 'en', false)).toBe('kilogram');
    });

    it('returns English plural label', () => {
      expect(getUnitLabel('cm', 'en', true)).toBe('centimeters');
      expect(getUnitLabel('kg', 'en', true)).toBe('kilograms');
    });

    it('returns Arabic labels', () => {
      expect(getUnitLabel('cm', 'ar', 'singular')).toBe('سنتيمتر');
      expect(getUnitLabel('cm', 'ar', 'dual')).toBe('سنتيمتران');
      expect(getUnitLabel('cm', 'ar', 'plural')).toBe('سنتيمترات');
    });

    it('returns Hebrew labels', () => {
      expect(getUnitLabel('cm', 'he', 'singular')).toBe('סנטימטר');
      expect(getUnitLabel('cm', 'he', 'plural')).toBe('סנטימטרים');
    });

    it('handles temperature labels', () => {
      expect(getUnitLabel('celsius', 'en', 'singular')).toBe('degree Celsius');
      expect(getUnitLabel('fahrenheit', 'ar', 'plural')).toBe('درجات فهرنهايت');
    });

    it('handles special plural forms like feet', () => {
      expect(getUnitLabel('ft', 'en', 'singular')).toBe('foot');
      expect(getUnitLabel('ft', 'en', 'plural')).toBe('feet');
    });

    it('returns unit code for unknown units', () => {
      expect(getUnitLabel('unknown', 'en', false)).toBe('unknown');
    });
  });

  describe('Unit Symbols', () => {
    it('returns correct symbols for English', () => {
      expect(getUnitSymbol('cm', 'en')).toBe('cm');
      expect(getUnitSymbol('kg', 'en')).toBe('kg');
      expect(getUnitSymbol('l', 'en')).toBe('L');
    });

    it('returns correct Arabic symbols', () => {
      expect(getUnitSymbol('cm', 'ar')).toBe('سم');
      expect(getUnitSymbol('kg', 'ar')).toBe('كغ');
      expect(getUnitSymbol('l', 'ar')).toBe('ل');
    });

    it('returns correct Hebrew symbols', () => {
      expect(getUnitSymbol('cm', 'he')).toBe('ס"מ');
      expect(getUnitSymbol('kg', 'he')).toBe('ק"ג');
      expect(getUnitSymbol('l', 'he')).toBe('ל\'');
    });

    it('handles temperature symbols', () => {
      expect(getUnitSymbol('celsius', 'en')).toBe('°C');
      expect(getUnitSymbol('fahrenheit', 'ar')).toBe('°ف');
    });
  });

  describe('Format Measurement', () => {
    it('formats measurement in English', () => {
      const formatted = formatMeasurement(100, 'cm', 'en');
      expect(formatted).toContain('100');
      expect(formatted).toContain('centimeters');
    });

    it('formats measurement with symbol', () => {
      const formatted = formatMeasurement(100, 'cm', 'en', { useSymbol: true });
      expect(formatted).toContain('cm');
    });

    it('formats measurement without value', () => {
      const formatted = formatMeasurement(100, 'cm', 'en', { includeValue: false });
      expect(formatted).toBe('centimeters');
    });

    it('formats measurement in Arabic (RTL)', () => {
      const formatted = formatMeasurement(100, 'cm', 'ar');
      expect(formatted).toContain('سنتيمترات');
    });

    it('formats measurement in Hebrew (RTL)', () => {
      const formatted = formatMeasurement(100, 'cm', 'he');
      expect(formatted).toContain('סנטימטרים');
    });

    it('respects specified decimal places', () => {
      const formatted = formatMeasurement(100.567, 'cm', 'en', { decimals: 1 });
      expect(formatted).toContain('100.6');
    });

    it('handles temperature formatting', () => {
      const formatted = formatMeasurement(25, 'celsius', 'en', { useSymbol: true });
      expect(formatted).toContain('°C');
    });
  });

  describe('Format Number', () => {
    it('formats number in English', () => {
      const formatted = formatNumber(1234.56, 'en', 2);
      expect(formatted).toContain('1,234.56');
    });

    it('formats number in Hebrew', () => {
      const formatted = formatNumber(1234.56, 'he', 2);
      expect(formatted).toBeDefined();
    });

    it('formats number in Arabic with Eastern numerals', () => {
      const formatted = formatNumber(1234.56, 'ar', 2);
      expect(formatted).toContain('١');
      expect(formatted).toContain('٫');
    });
  });

  describe('Eastern Arabic Numerals', () => {
    it('converts Western to Eastern Arabic numerals', () => {
      expect(toEasternArabicNumerals('123')).toBe('١٢٣');
      expect(toEasternArabicNumerals('45.67')).toBe('٤٥٫٦٧');
    });

    it('converts Eastern to Western Arabic numerals', () => {
      expect(fromEasternArabicNumerals('١٢٣')).toBe(123);
      expect(fromEasternArabicNumerals('٤٥٫٦٧')).toBeCloseTo(45.67, 2);
    });

    it('handles comma separators', () => {
      expect(toEasternArabicNumerals('1,000')).toBe('١،٠٠٠');
    });
  });

  describe('Batch Convert', () => {
    it('converts multiple measurements', () => {
      const items = [
        { value: 10, fromUnit: 'cm', toUnit: 'in' },
        { value: 1, fromUnit: 'kg', toUnit: 'lb' },
        { value: 1, fromUnit: 'l', toUnit: 'gal' },
      ];

      const results = batchConvert(items);
      expect(results).toHaveLength(3);
      expect(results[0].value).toBeCloseTo(3.937, 2);
      expect(results[1].value).toBeCloseTo(2.205, 2);
      expect(results[2].value).toBeCloseTo(0.264, 2);
    });

    it('assigns IDs to batch results', () => {
      const items = [{ value: 10, fromUnit: 'cm', toUnit: 'in' }];
      const results = batchConvert(items);
      expect(results[0].id).toBeDefined();
    });
  });

  describe('Smart Convert', () => {
    it('converts to metric when preferred', () => {
      const result = smartConvert(12, 'in', 'metric');
      expect(result.value).toBeCloseTo(30.48, 2);
      expect(result.unit).toBe('cm');
    });

    it('converts to imperial when preferred', () => {
      const result = smartConvert(100, 'cm', 'imperial');
      expect(result.value).toBeCloseTo(39.37, 2);
      expect(result.unit).toBe('in');
    });

    it('returns as-is if already in preferred system', () => {
      const result = smartConvert(100, 'cm', 'metric');
      expect(result.value).toBe(100);
      expect(result.unit).toBe('cm');
    });
  });

  describe('Get Units by Category', () => {
    it('returns all length units', () => {
      const units = getUnitsByCategory('length');
      expect(units.length).toBeGreaterThanOrEqual(7);
      expect(units.some((u) => u.code === 'cm')).toBe(true);
      expect(units.some((u) => u.code === 'in')).toBe(true);
    });

    it('returns all weight units', () => {
      const units = getUnitsByCategory('weight');
      expect(units.length).toBeGreaterThanOrEqual(4);
      expect(units.some((u) => u.code === 'kg')).toBe(true);
      expect(units.some((u) => u.code === 'lb')).toBe(true);
    });

    it('returns all volume units', () => {
      const units = getUnitsByCategory('volume');
      expect(units.length).toBeGreaterThanOrEqual(7);
      expect(units.some((u) => u.code === 'l')).toBe(true);
      expect(units.some((u) => u.code === 'gal')).toBe(true);
    });
  });

  describe('Locale Support', () => {
    it('returns supported locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
      expect(locales).toHaveLength(3);
    });

    it('identifies supported locales', () => {
      expect(isLocaleSupported('ar')).toBe(true);
      expect(isLocaleSupported('he')).toBe(true);
      expect(isLocaleSupported('en')).toBe(true);
      expect(isLocaleSupported('fr')).toBe(false);
    });
  });

  describe('Parse Measurement', () => {
    it('parses value and unit', () => {
      const result = parseMeasurement('100 cm');
      expect(result).toEqual({ value: 100, unit: 'cm' });
    });

    it('parses with symbol', () => {
      const result = parseMeasurement('5 kg');
      expect(result?.value).toBe(5);
      expect(result?.unit).toBe('kg');
    });

    it('parses with comma separators', () => {
      const result = parseMeasurement('1,000 m');
      expect(result?.value).toBe(1000);
    });

    it('parses Eastern Arabic numerals', () => {
      const result = parseMeasurement('١٠٠ سم');
      expect(result?.value).toBe(100);
    });

    it('returns null for invalid input', () => {
      expect(parseMeasurement('abc')).toBeNull();
      expect(parseMeasurement('')).toBeNull();
    });

    it('handles value only', () => {
      const result = parseMeasurement('100');
      expect(result?.value).toBe(100);
    });
  });

  describe('Compare Measurements', () => {
    it('compares equal measurements', () => {
      const result = compareMeasurements(100, 'cm', 100, 'cm');
      expect(result).toBe(0);
    });

    it('returns positive when first is larger', () => {
      const result = compareMeasurements(100, 'cm', 50, 'cm');
      expect(result).toBeGreaterThan(0);
    });

    it('returns negative when first is smaller', () => {
      const result = compareMeasurements(50, 'cm', 100, 'cm');
      expect(result).toBeLessThan(0);
    });

    it('compares different units after conversion', () => {
      const result = compareMeasurements(12, 'in', 30, 'cm');
      expect(result).toBeGreaterThan(0);
    });

    it('throws for incompatible units', () => {
      expect(() => compareMeasurements(10, 'cm', 5, 'kg')).toThrow();
    });
  });

  describe('Calculate Percentage Difference', () => {
    it('calculates zero difference for equal values', () => {
      const result = calculatePercentageDifference(100, 'cm', 100, 'cm');
      expect(result).toBe(0);
    });

    it('calculates positive percentage increase', () => {
      const result = calculatePercentageDifference(110, 'cm', 100, 'cm');
      expect(result).toBe(10);
    });

    it('calculates negative percentage decrease', () => {
      const result = calculatePercentageDifference(90, 'cm', 100, 'cm');
      expect(result).toBe(-10);
    });

    it('handles different units', () => {
      const result = calculatePercentageDifference(12, 'in', 30, 'cm');
      expect(result).toBeGreaterThan(0);
    });

    it('handles zero reference value', () => {
      const result = calculatePercentageDifference(100, 'cm', 0, 'cm');
      expect(result).toBe(0);
    });
  });

  describe('Complete Workflow', () => {
    it('handles full conversion and formatting workflow', () => {
      const converted = convertUnit(150, 'lb', 'kg');
      expect(converted.value).toBeCloseTo(68.04, 1);

      const formatted = formatMeasurement(converted.value, 'kg', 'ar');
      expect(formatted).toContain('كيلوغرامات');
      expect(formatted).toContain('٦٨');
    });

    it('handles product dimensions workflow', () => {
      const dimensions = {
        width: convertUnit(50, 'cm', 'in'),
        height: convertUnit(100, 'cm', 'in'),
        depth: convertUnit(30, 'cm', 'in'),
        weight: convertUnit(2.5, 'kg', 'lb'),
      };

      expect(dimensions.width.value).toBeCloseTo(19.69, 1);
      expect(dimensions.height.value).toBeCloseTo(39.37, 1);
      expect(dimensions.depth.value).toBeCloseTo(11.81, 1);
      expect(dimensions.weight.value).toBeCloseTo(5.51, 1);

      const formattedWidth = formatMeasurement(dimensions.width.value, 'in', 'en', { useSymbol: true, decimals: 1 });
      expect(formattedWidth).toContain('"');
    });
  });
});
