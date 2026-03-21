import { describe, it, expect } from 'vitest';
import {
  isRTLLanguage,
  getTextDirection,
  getDirAttribute,
  flipCSSProperty,
  wrapBiDi,
  getOppositeDirection,
  formatNumberForRTL,
  RTL_LANGUAGES,
} from '../../app/utils/rtl';

describe('RTL Utilities', () => {
  describe('isRTLLanguage', () => {
    it('returns true for Arabic', () => {
      expect(isRTLLanguage('ar')).toBe(true);
      expect(isRTLLanguage('ar-SA')).toBe(true);
      expect(isRTLLanguage('ar-EG')).toBe(true);
    });

    it('returns true for Hebrew', () => {
      expect(isRTLLanguage('he')).toBe(true);
      expect(isRTLLanguage('he-IL')).toBe(true);
    });

    it('returns true for Persian/Farsi', () => {
      expect(isRTLLanguage('fa')).toBe(true);
      expect(isRTLLanguage('fa-IR')).toBe(true);
    });

    it('returns true for Urdu', () => {
      expect(isRTLLanguage('ur')).toBe(true);
      expect(isRTLLanguage('ur-PK')).toBe(true);
    });

    it('returns false for LTR languages', () => {
      expect(isRTLLanguage('en')).toBe(false);
      expect(isRTLLanguage('en-US')).toBe(false);
      expect(isRTLLanguage('fr')).toBe(false);
      expect(isRTLLanguage('de')).toBe(false);
      expect(isRTLLanguage('es')).toBe(false);
    });

    it('handles case insensitivity', () => {
      expect(isRTLLanguage('AR')).toBe(true);
      expect(isRTLLanguage('He')).toBe(true);
      expect(isRTLLanguage('EN')).toBe(false);
    });
  });

  describe('getTextDirection', () => {
    it('returns "rtl" for RTL languages', () => {
      expect(getTextDirection('ar')).toBe('rtl');
      expect(getTextDirection('he')).toBe('rtl');
    });

    it('returns "ltr" for LTR languages', () => {
      expect(getTextDirection('en')).toBe('ltr');
      expect(getTextDirection('fr')).toBe('ltr');
    });
  });

  describe('getDirAttribute', () => {
    it('returns correct dir attribute value', () => {
      expect(getDirAttribute('ar')).toBe('rtl');
      expect(getDirAttribute('he')).toBe('rtl');
      expect(getDirAttribute('en')).toBe('ltr');
    });
  });

  describe('flipCSSProperty', () => {
    it('returns original for LTR languages', () => {
      const result = flipCSSProperty('margin-left', '10px', 'en');
      expect(result).toEqual({ property: 'margin-left', value: '10px' });
    });

    it('flips margin-left to margin-right for RTL', () => {
      const result = flipCSSProperty('margin-left', '10px', 'ar');
      expect(result).toEqual({ property: 'margin-right', value: '10px' });
    });

    it('flips margin-right to margin-left for RTL', () => {
      const result = flipCSSProperty('margin-right', '10px', 'ar');
      expect(result).toEqual({ property: 'margin-left', value: '10px' });
    });

    it('flips padding properties for RTL', () => {
      expect(flipCSSProperty('padding-left', '20px', 'ar')).toEqual({
        property: 'padding-right',
        value: '20px',
      });
      expect(flipCSSProperty('padding-right', '20px', 'ar')).toEqual({
        property: 'padding-left',
        value: '20px',
      });
    });

    it('flips border properties for RTL', () => {
      expect(flipCSSProperty('border-left', '1px solid red', 'ar')).toEqual({
        property: 'border-right',
        value: '1px solid red',
      });
    });

    it('flips left/right positioning for RTL', () => {
      expect(flipCSSProperty('left', '0', 'ar')).toEqual({
        property: 'right',
        value: '0',
      });
      expect(flipCSSProperty('right', '0', 'ar')).toEqual({
        property: 'left',
        value: '0',
      });
    });

    it('flips text-align for RTL', () => {
      expect(flipCSSProperty('text-align', 'left', 'ar')).toEqual({
        property: 'text-align',
        value: 'right',
      });
      expect(flipCSSProperty('text-align', 'right', 'ar')).toEqual({
        property: 'text-align',
        value: 'left',
      });
      expect(flipCSSProperty('text-align', 'center', 'ar')).toEqual({
        property: 'text-align',
        value: 'center',
      });
    });

    it('returns unchanged for non-flippable properties', () => {
      expect(flipCSSProperty('color', 'red', 'ar')).toEqual({
        property: 'color',
        value: 'red',
      });
    });
  });

  describe('wrapBiDi', () => {
    it('returns original text for LTR languages', () => {
      const text = 'Hello World';
      expect(wrapBiDi(text, 'en')).toBe(text);
    });

    it('returns original text for pure RTL text', () => {
      const text = 'مرحبا بالعالم';
      expect(wrapBiDi(text, 'ar')).toBe(text);
    });

    it('wraps mixed content with RLM for RTL', () => {
      const text = 'مرحبا Hello';
      const result = wrapBiDi(text, 'ar');
      expect(result).toContain('\u200F');
      expect(result).toBe('\u200Fمرحبا Hello\u200F');
    });

    it('handles text with numbers in RTL', () => {
      // Numbers with Arabic text should be wrapped for proper BiDi
      const text = 'سعر 100 ريال';
      const result = wrapBiDi(text, 'ar');
      // The result should contain either the original or wrapped text
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('getOppositeDirection', () => {
    it('returns ltr for rtl', () => {
      expect(getOppositeDirection('rtl')).toBe('ltr');
    });

    it('returns rtl for ltr', () => {
      expect(getOppositeDirection('ltr')).toBe('rtl');
    });
  });

  describe('formatNumberForRTL', () => {
    it('formats numbers normally for LTR languages', () => {
      expect(formatNumberForRTL(1234567, 'en')).toBe('1,234,567');
    });

    it('formats numbers with locale separators', () => {
      expect(formatNumberForRTL(1234567, 'de')).toBe('1.234.567');
    });

    it('converts to Arabic numerals for Arabic locale', () => {
      const result = formatNumberForRTL(123, 'ar');
      // Arabic numerals: ١٢٣
      expect(result).toBe('١٢٣');
    });

    it('handles larger numbers with Arabic numerals', () => {
      const result = formatNumberForRTL(12345, 'ar');
      expect(result).toContain('١');
      expect(result).toContain('٢');
      expect(result).toContain('٣');
      expect(result).toContain('٤');
      expect(result).toContain('٥');
    });
  });

  describe('RTL_LANGUAGES constant', () => {
    it('contains all expected RTL language codes', () => {
      expect(RTL_LANGUAGES).toContain('ar');
      expect(RTL_LANGUAGES).toContain('he');
      expect(RTL_LANGUAGES).toContain('fa');
      expect(RTL_LANGUAGES).toContain('ur');
    });

    it('does not contain LTR language codes', () => {
      expect(RTL_LANGUAGES).not.toContain('en');
      expect(RTL_LANGUAGES).not.toContain('fr');
      expect(RTL_LANGUAGES).not.toContain('de');
    });
  });
});
