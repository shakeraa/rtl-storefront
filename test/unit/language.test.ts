import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  getRTLLanguages,
  DEFAULT_LOCALE,
} from '../../app/services/language/index';

describe('Language Service', () => {
  describe('Supported Languages', () => {
    it('should have default locale as English', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });

    it('should include RTL languages', () => {
      const rtlCodes = getRTLLanguages().map((l) => l.code);
      expect(rtlCodes).toContain('ar');
      expect(rtlCodes).toContain('he');
      expect(rtlCodes).toContain('fa');
      expect(rtlCodes).toContain('ur');
    });

    it('should have Arabic as RTL', () => {
      const arabic = getLanguageByCode('ar');
      expect(arabic?.direction).toBe('rtl');
      expect(arabic?.nativeName).toBe('العربية');
    });

    it('should have Hebrew as RTL', () => {
      const hebrew = getLanguageByCode('he');
      expect(hebrew?.direction).toBe('rtl');
      expect(hebrew?.nativeName).toBe('עברית');
    });

    it('should have English as LTR', () => {
      const english = getLanguageByCode('en');
      expect(english?.direction).toBe('ltr');
      expect(english?.isDefault).toBe(true);
    });
  });

  describe('Language Lookup', () => {
    it('should return language by code', () => {
      const lang = getLanguageByCode('ar');
      expect(lang).toBeDefined();
      expect(lang?.code).toBe('ar');
    });

    it('should return undefined for unknown code', () => {
      const lang = getLanguageByCode('xx');
      expect(lang).toBeUndefined();
    });
  });
});
