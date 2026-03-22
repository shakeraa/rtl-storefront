import { describe, it, expect } from 'vitest';
import {
  getLanguageDisplay,
  getLanguageName,
  getLanguagesForDisplay,
  getRTLLanguagesNative,
  getLTRLanguagesNative,
  usesNativeScript,
  getScriptType,
  formatLanguageSelectorItem,
  getLanguageDirection,
  sortLanguagesByNativeName,
  groupLanguagesByScript,
  LANGUAGES_WITH_NATIVE_SCRIPT,
} from '../../app/services/native-script';

describe('Native Script Service - T0043', () => {
  describe('Language Display', () => {
    it('should get language display config', () => {
      const ar = getLanguageDisplay('ar');
      expect(ar?.nativeName).toBe('العربية');
      expect(ar?.direction).toBe('rtl');
      
      const he = getLanguageDisplay('he');
      expect(he?.nativeName).toBe('עברית');
    });

    it('should return undefined for unknown language', () => {
      const unknown = getLanguageDisplay('xx');
      expect(unknown).toBeUndefined();
    });
  });

  describe('Language Name Display', () => {
    it('should get native name', () => {
      expect(getLanguageName('ar', 'native')).toBe('العربية');
      expect(getLanguageName('he', 'native')).toBe('עברית');
      expect(getLanguageName('fr', 'native')).toBe('Français');
    });

    it('should get English name', () => {
      expect(getLanguageName('ar', 'english')).toBe('Arabic');
      expect(getLanguageName('fr', 'english')).toBe('French');
    });

    it('should get both names', () => {
      const name = getLanguageName('ar', 'both');
      expect(name).toContain('Arabic');
      expect(name).toContain('العربية');
    });
  });

  describe('Language Lists', () => {
    it('should get all RTL languages', () => {
      const rtl = getRTLLanguagesNative();
      expect(rtl.some((l) => l.code === 'ar')).toBe(true);
      expect(rtl.some((l) => l.code === 'he')).toBe(true);
      expect(rtl.every((l) => l.direction === 'rtl')).toBe(true);
    });

    it('should get all LTR languages', () => {
      const ltr = getLTRLanguagesNative();
      expect(ltr.some((l) => l.code === 'en')).toBe(true);
      expect(ltr.every((l) => l.direction === 'ltr')).toBe(true);
    });

    it('should filter languages by script', () => {
      const arabic = getLanguagesForDisplay('native', { script: 'arabic' });
      expect(arabic.every((l) => ['ar', 'fa', 'ur'].includes(l.code))).toBe(true);
    });
  });

  describe('Script Detection', () => {
    it('should detect native script usage', () => {
      expect(usesNativeScript('ar')).toBe(true);
      expect(usesNativeScript('he')).toBe(true);
      expect(usesNativeScript('zh')).toBe(true);
    });

    it('should get script type', () => {
      expect(getScriptType('ar')).toBe('arabic');
      expect(getScriptType('he')).toBe('hebrew');
      expect(getScriptType('zh')).toBe('cjk');
      expect(getScriptType('en')).toBe('latin');
    });
  });

  describe('Formatting', () => {
    it('should format language selector item', () => {
      const item = formatLanguageSelectorItem('ar', 'native', true);
      expect(item).toContain('🇸🇦');
      expect(item).toContain('العربية');
    });

    it('should get language direction', () => {
      expect(getLanguageDirection('ar')).toBe('rtl');
      expect(getLanguageDirection('he')).toBe('rtl');
      expect(getLanguageDirection('en')).toBe('ltr');
    });
  });

  describe('Sorting and Grouping', () => {
    it('should sort languages by native name', () => {
      const sorted = sortLanguagesByNativeName(['ar', 'he', 'en']);
      expect(sorted).toContain('ar');
      expect(sorted).toContain('he');
      expect(sorted).toContain('en');
    });

    it('should group languages by script', () => {
      const groups = groupLanguagesByScript();
      expect(groups.arabic).toBeDefined();
      expect(groups.hebrew).toBeDefined();
      expect(groups.latin).toBeDefined();
    });
  });
});
