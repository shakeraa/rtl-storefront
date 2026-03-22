import { describe, it, expect } from 'vitest';
import {
  getSizeChartLabels, getSizeLabel, getSizeTypeLabel, getMeasurementGuide,
  getSizeOptions, getMeasurementFields, getSizeChartHeader,
  isLocaleSupported, getSupportedLocales, getSizeAbbreviationMap, translateSizeAbbreviation,
  ARABIC_LABELS, HEBREW_LABELS, ENGLISH_LABELS,
} from '../../app/services/ui-labels/size-chart';

describe('Size Chart Label Translation Service - T0145', () => {
  describe('Locale Detection', () => {
    it('should return Arabic labels for ar locale', () => {
      const labels = getSizeChartLabels('ar');
      expect(labels.labels.sizeChart).toBe('جدول المقاسات');
      expect(labels.labels.chest).toBe('الصدر');
    });

    it('should return Hebrew labels for he locale', () => {
      const labels = getSizeChartLabels('he');
      expect(labels.labels.sizeChart).toBe('טבלת מידות');
      expect(labels.labels.chest).toBe('חזה');
    });

    it('should return English labels for en locale', () => {
      const labels = getSizeChartLabels('en');
      expect(labels.labels.sizeChart).toBe('Size Chart');
      expect(labels.labels.chest).toBe('Chest');
    });

    it('should handle locale with region code', () => {
      expect(getSizeChartLabels('ar-SA').labels.sizeChart).toBe('جدول المقاسات');
    });

    it('should handle Hebrew with region code', () => {
      expect(getSizeChartLabels('he-IL').labels.sizeChart).toBe('טבלת מידות');
    });

    it('should default to English for unknown locale', () => {
      expect(getSizeChartLabels('fr').labels.sizeChart).toBe('Size Chart');
    });

    it('should default to English for empty locale', () => {
      expect(getSizeChartLabels('').labels.sizeChart).toBe('Size Chart');
    });
  });

  describe('getSizeLabel', () => {
    it('should get Arabic size chart label', () => {
      expect(getSizeLabel('sizeChart', 'ar')).toBe('جدول المقاسات');
    });

    it('should get Hebrew size guide label', () => {
      expect(getSizeLabel('sizeGuide', 'he')).toBe('מדריך מידות');
    });

    it('should get English how to measure label', () => {
      expect(getSizeLabel('howToMeasure', 'en')).toBe('How to Measure');
    });

    it('should get all measurement labels in Arabic', () => {
      expect(getSizeLabel('chest', 'ar')).toBe('الصدر');
      expect(getSizeLabel('waist', 'ar')).toBe('الخصر');
      expect(getSizeLabel('hips', 'ar')).toBe('الورك');
      expect(getSizeLabel('inseam', 'ar')).toBe('طول الساق الداخلي');
      expect(getSizeLabel('length', 'ar')).toBe('الطول');
    });

    it('should get all measurement labels in Hebrew', () => {
      expect(getSizeLabel('chest', 'he')).toBe('חזה');
      expect(getSizeLabel('waist', 'he')).toBe('מותן');
      expect(getSizeLabel('hips', 'he')).toBe('ירכיים');
      expect(getSizeLabel('inseam', 'he')).toBe('אורך פנימי');
      expect(getSizeLabel('length', 'he')).toBe('אורך');
    });

    it('should get all measurement labels in English', () => {
      expect(getSizeLabel('chest', 'en')).toBe('Chest');
      expect(getSizeLabel('waist', 'en')).toBe('Waist');
      expect(getSizeLabel('hips', 'en')).toBe('Hips');
      expect(getSizeLabel('inseam', 'en')).toBe('Inseam');
      expect(getSizeLabel('length', 'en')).toBe('Length');
    });
  });

  describe('getSizeTypeLabel', () => {
    it('should get Arabic size type labels', () => {
      expect(getSizeTypeLabel('small', 'ar')).toBe('صغير');
      expect(getSizeTypeLabel('medium', 'ar')).toBe('متوسط');
      expect(getSizeTypeLabel('large', 'ar')).toBe('كبير');
      expect(getSizeTypeLabel('xLarge', 'ar')).toBe('كبير جداً');
      expect(getSizeTypeLabel('xxLarge', 'ar')).toBe('كبير جداً جداً');
    });

    it('should get Hebrew size type labels', () => {
      expect(getSizeTypeLabel('small', 'he')).toBe('קטן');
      expect(getSizeTypeLabel('medium', 'he')).toBe('בינוני');
      expect(getSizeTypeLabel('large', 'he')).toBe('גדול');
      expect(getSizeTypeLabel('xLarge', 'he')).toBe('גדול מאוד');
      expect(getSizeTypeLabel('xxLarge', 'he')).toBe('גדול מאוד מאוד');
    });

    it('should get English size type labels', () => {
      expect(getSizeTypeLabel('small', 'en')).toBe('Small');
      expect(getSizeTypeLabel('medium', 'en')).toBe('Medium');
      expect(getSizeTypeLabel('large', 'en')).toBe('Large');
      expect(getSizeTypeLabel('xLarge', 'en')).toBe('X-Large');
      expect(getSizeTypeLabel('xxLarge', 'en')).toBe('XX-Large');
    });
  });

  describe('getMeasurementGuide', () => {
    it('should return Arabic measurement guide', () => {
      const guide = getMeasurementGuide('ar');
      expect(guide.title).toBe('دليل القياس');
      expect(guide.chestDescription).toContain('الجزء الأكبر');
    });

    it('should return Hebrew measurement guide', () => {
      const guide = getMeasurementGuide('he');
      expect(guide.title).toBe('מדריך מדידה');
      expect(guide.chestDescription).toContain('החלק הרחב ביותר');
    });

    it('should return English measurement guide', () => {
      const guide = getMeasurementGuide('en');
      expect(guide.title).toBe('Measurement Guide');
      expect(guide.chestDescription).toContain('fullest part');
    });

    it('should have all measurement descriptions defined', () => {
      const guide = getMeasurementGuide('ar');
      expect(guide.chestDescription).toBeDefined();
      expect(guide.waistDescription).toBeDefined();
      expect(guide.hipsDescription).toBeDefined();
      expect(guide.inseamDescription).toBeDefined();
      expect(guide.lengthDescription).toBeDefined();
    });
  });

  describe('getSizeOptions', () => {
    it('should return size options in Arabic', () => {
      const options = getSizeOptions('ar');
      expect(options).toHaveLength(5);
      expect(options[0]).toEqual({ value: 'S', label: 'صغير' });
      expect(options[4]).toEqual({ value: 'XXL', label: 'كبير جداً جداً' });
    });

    it('should return size options in Hebrew', () => {
      const options = getSizeOptions('he');
      expect(options).toHaveLength(5);
      expect(options[0]).toEqual({ value: 'S', label: 'קטן' });
      expect(options[4]).toEqual({ value: 'XXL', label: 'גדול מאוד מאוד' });
    });

    it('should return size options in English', () => {
      const options = getSizeOptions('en');
      expect(options).toHaveLength(5);
      expect(options[0]).toEqual({ value: 'S', label: 'Small' });
      expect(options[4]).toEqual({ value: 'XXL', label: 'XX-Large' });
    });

    it('should return correct value-label pairs', () => {
      const options = getSizeOptions('en');
      expect(options.map((o) => o.value)).toEqual(['S', 'M', 'L', 'XL', 'XXL']);
    });
  });

  describe('getMeasurementFields', () => {
    it('should return measurement fields in Arabic', () => {
      const fields = getMeasurementFields('ar');
      expect(fields).toHaveLength(5);
      expect(fields[0]).toEqual({ key: 'chest', label: 'الصدر' });
    });

    it('should return measurement fields in Hebrew', () => {
      const fields = getMeasurementFields('he');
      expect(fields).toHaveLength(5);
      expect(fields[0]).toEqual({ key: 'chest', label: 'חזה' });
    });

    it('should return correct keys for all fields', () => {
      const fields = getMeasurementFields('en');
      expect(fields.map((f) => f.key)).toEqual(['chest', 'waist', 'hips', 'inseam', 'length']);
    });
  });

  describe('getSizeChartHeader', () => {
    it('should return Arabic header labels', () => {
      const header = getSizeChartHeader('ar');
      expect(header.title).toBe('جدول المقاسات');
      expect(header.subtitle).toBe('دليل المقاسات');
      expect(header.howToMeasure).toBe('كيفية القياس');
    });

    it('should return Hebrew header labels', () => {
      const header = getSizeChartHeader('he');
      expect(header.title).toBe('טבלת מידות');
      expect(header.subtitle).toBe('מדריך מידות');
      expect(header.howToMeasure).toBe('כיצד למדוד');
    });

    it('should return English header labels', () => {
      const header = getSizeChartHeader('en');
      expect(header.title).toBe('Size Chart');
      expect(header.subtitle).toBe('Size Guide');
      expect(header.howToMeasure).toBe('How to Measure');
    });
  });

  describe('isLocaleSupported', () => {
    it('should return true for supported locales', () => {
      expect(isLocaleSupported('ar')).toBe(true);
      expect(isLocaleSupported('he')).toBe(true);
      expect(isLocaleSupported('en')).toBe(true);
    });

    it('should return true for supported locales with region codes', () => {
      expect(isLocaleSupported('ar-SA')).toBe(true);
      expect(isLocaleSupported('he-IL')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(isLocaleSupported('fr')).toBe(false);
      expect(isLocaleSupported('de')).toBe(false);
    });

    it('should return true for empty locale (defaults to en)', () => {
      expect(isLocaleSupported('')).toBe(true);
    });
  });

  describe('getSupportedLocales', () => {
    it('should return all supported locale codes', () => {
      const locales = getSupportedLocales();
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
      expect(locales).toHaveLength(3);
    });
  });

  describe('getSizeAbbreviationMap', () => {
    it('should return Arabic size abbreviation map', () => {
      const map = getSizeAbbreviationMap('ar');
      expect(map.S).toBe('صغير');
      expect(map.XXL).toBe('كبير جداً جداً');
    });

    it('should return Hebrew size abbreviation map', () => {
      const map = getSizeAbbreviationMap('he');
      expect(map.S).toBe('קטן');
      expect(map.XXL).toBe('גדול מאוד מאוד');
    });

    it('should return English size abbreviation map', () => {
      const map = getSizeAbbreviationMap('en');
      expect(map.S).toBe('Small');
      expect(map.XXL).toBe('XX-Large');
    });
  });

  describe('translateSizeAbbreviation', () => {
    it('should translate size abbreviations to Arabic', () => {
      expect(translateSizeAbbreviation('S', 'ar')).toBe('صغير');
      expect(translateSizeAbbreviation('XXL', 'ar')).toBe('كبير جداً جداً');
    });

    it('should translate size abbreviations to Hebrew', () => {
      expect(translateSizeAbbreviation('S', 'he')).toBe('קטן');
      expect(translateSizeAbbreviation('XXL', 'he')).toBe('גדול מאוד מאוד');
    });

    it('should handle lowercase abbreviations', () => {
      expect(translateSizeAbbreviation('s', 'ar')).toBe('صغير');
      expect(translateSizeAbbreviation('xl', 'en')).toBe('X-Large');
    });

    it('should return original abbreviation for unknown sizes', () => {
      expect(translateSizeAbbreviation('XXXL', 'ar')).toBe('XXXL');
      expect(translateSizeAbbreviation('XS', 'he')).toBe('XS');
    });
  });

  describe('Complete Label Sets', () => {
    it('should have all required size chart labels in Arabic', () => {
      const labels = ARABIC_LABELS.labels;
      expect(labels.sizeChart).toBeDefined();
      expect(labels.sizeGuide).toBeDefined();
      expect(labels.howToMeasure).toBeDefined();
      expect(labels.chest).toBeDefined();
      expect(labels.waist).toBeDefined();
      expect(labels.hips).toBeDefined();
      expect(labels.inseam).toBeDefined();
      expect(labels.length).toBeDefined();
    });

    it('should have all required size type labels in Hebrew', () => {
      const labels = HEBREW_LABELS.sizeTypes;
      expect(labels.small).toBeDefined();
      expect(labels.medium).toBeDefined();
      expect(labels.large).toBeDefined();
      expect(labels.xLarge).toBeDefined();
      expect(labels.xxLarge).toBeDefined();
    });

    it('should have all required measurement guide labels in English', () => {
      const guide = ENGLISH_LABELS.measurementGuide;
      expect(guide.title).toBeDefined();
      expect(guide.chestDescription).toBeDefined();
      expect(guide.waistDescription).toBeDefined();
      expect(guide.hipsDescription).toBeDefined();
      expect(guide.inseamDescription).toBeDefined();
      expect(guide.lengthDescription).toBeDefined();
    });

    it('should use real Arabic text (not stubs)', () => {
      const labels = ARABIC_LABELS.labels;
      expect(labels.sizeChart).toBe('جدول المقاسات');
      expect(labels.chest).toBe('الصدر');
      expect(labels.sizeChart).not.toContain('TODO');
      expect(labels.sizeChart).not.toContain('STUB');
    });

    it('should use real Hebrew text (not stubs)', () => {
      const labels = HEBREW_LABELS.labels;
      expect(labels.sizeChart).toBe('טבלת מידות');
      expect(labels.chest).toBe('חזה');
      expect(labels.sizeChart).not.toContain('TODO');
      expect(labels.sizeChart).not.toContain('STUB');
    });
  });
});
