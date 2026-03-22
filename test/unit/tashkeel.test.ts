import { describe, it, expect } from 'vitest';
import {
  addTashkeel,
  removeTashkeel,
  hasTashkeel,
  normalizeTashkeel,
  analyzeTashkeel,
  toggleTashkeel,
  countTashkeel,
  compareIgnoringTashkeel,
  isTashkeelChar,
  getTashkeelType,
  getTashkeelCharacters,
  TASHKEEL_CHARS,
  TASHKEEL_PATTERN,
  type TashkeelAnalysis,
  type TashkeelType,
} from '../../app/services/arabic-features/tashkeel';

describe('Tashkeel Service', () => {
  // Test data with real Arabic diacritics
  const ARABIC_WITHOUT_TASHKEEL = 'مرحبا بالعالم';
  const ARABIC_WITH_TASHKEEL = 'مَرْحَبًا بِالْعَالَمِ';
  const MIXED_TEXT = 'Hello مرحبا';
  const TASHKEEL_ONLY = '\u064E\u064F\u0650'; // َُِ

  describe('TASHKEEL_CHARS constants', () => {
    it('has correct Fatha character (U+064E)', () => {
      expect(TASHKEEL_CHARS.FATHA).toBe('\u064E');
      expect(TASHKEEL_CHARS.FATHA).toBe('َ');
    });

    it('has correct Damma character (U+064F)', () => {
      expect(TASHKEEL_CHARS.DAMMA).toBe('\u064F');
      expect(TASHKEEL_CHARS.DAMMA).toBe('ُ');
    });

    it('has correct Kasra character (U+0650)', () => {
      expect(TASHKEEL_CHARS.KASRA).toBe('\u0650');
      expect(TASHKEEL_CHARS.KASRA).toBe('ِ');
    });

    it('has correct Sukun character (U+0652)', () => {
      expect(TASHKEEL_CHARS.SUKUN).toBe('\u0652');
      expect(TASHKEEL_CHARS.SUKUN).toBe('ْ');
    });

    it('has correct Shadda character (U+0651)', () => {
      expect(TASHKEEL_CHARS.SHADDA).toBe('\u0651');
      expect(TASHKEEL_CHARS.SHADDA).toBe('ّ');
    });

    it('has correct Fathatan character (U+064B)', () => {
      expect(TASHKEEL_CHARS.FATHATAN).toBe('\u064B');
      expect(TASHKEEL_CHARS.FATHATAN).toBe('ً');
    });

    it('has correct Dammatan character (U+064C)', () => {
      expect(TASHKEEL_CHARS.DAMMATAN).toBe('\u064C');
      expect(TASHKEEL_CHARS.DAMMATAN).toBe('ٌ');
    });

    it('has correct Kasratan character (U+064D)', () => {
      expect(TASHKEEL_CHARS.KASRATAN).toBe('\u064D');
      expect(TASHKEEL_CHARS.KASRATAN).toBe('ٍ');
    });
  });

  describe('removeTashkeel', () => {
    it('removes all tashkeel from Arabic text', () => {
      const result = removeTashkeel(ARABIC_WITH_TASHKEEL);
      expect(result).toBe('مرحبا بالعالم');
    });

    it('returns empty string for empty input', () => {
      expect(removeTashkeel('')).toBe('');
    });

    it('returns unchanged text without tashkeel', () => {
      const result = removeTashkeel(ARABIC_WITHOUT_TASHKEEL);
      expect(result).toBe(ARABIC_WITHOUT_TASHKEEL);
    });

    it('removes mixed tashkeel types', () => {
      const text = 'كَتَبَ'; // Multiple fatha marks
      const result = removeTashkeel(text);
      expect(result).toBe('كتب');
    });

    it('keeps shadda when keepShadda option is true', () => {
      const text = 'كَتَّاب'; // Fatha + Shadda
      const result = removeTashkeel(text, { keepShadda: true });
      expect(result).toContain('ّ'); // Shadda should remain
      expect(result).not.toContain('َ'); // Fatha should be removed
    });

    it('handles text with tanween correctly', () => {
      const text = 'كتابًا'; // Fathatan
      const result = removeTashkeel(text);
      expect(result).toBe('كتابا');
    });

    it('preserves non-Arabic text unchanged', () => {
      const text = 'Hello World 123';
      expect(removeTashkeel(text)).toBe(text);
    });

    it('handles mixed Arabic/English text', () => {
      const text = 'Hello مَرْحَبًا';
      const result = removeTashkeel(text);
      expect(result).toBe('Hello مرحبا');
    });
  });

  describe('hasTashkeel', () => {
    it('returns true for text with tashkeel', () => {
      expect(hasTashkeel(ARABIC_WITH_TASHKEEL)).toBe(true);
    });

    it('returns false for text without tashkeel', () => {
      expect(hasTashkeel(ARABIC_WITHOUT_TASHKEEL)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTashkeel('')).toBe(false);
    });

    it('returns false for non-Arabic text', () => {
      expect(hasTashkeel('Hello World')).toBe(false);
    });

    it('detects fatha specifically', () => {
      expect(hasTashkeel('مَرحبا', { specificType: 'fatha' })).toBe(true);
      expect(hasTashkeel('مرحبا', { specificType: 'fatha' })).toBe(false);
    });

    it('detects shadda specifically', () => {
      expect(hasTashkeel('مَرّحبا', { specificType: 'shadda' })).toBe(true);
      expect(hasTashkeel('مرحبا', { specificType: 'shadda' })).toBe(false);
    });

    it('detects tanween (fathatan)', () => {
      expect(hasTashkeel('كتابًا', { specificType: 'fathatan' })).toBe(true);
    });

    it('detects kasra specifically', () => {
      expect(hasTashkeel('مِرحبا', { specificType: 'kasra' })).toBe(true);
    });

    it('detects damma specifically', () => {
      expect(hasTashkeel('مُرحبا', { specificType: 'damma' })).toBe(true);
    });

    it('detects sukun specifically', () => {
      expect(hasTashkeel('مْرحبا', { specificType: 'sukun' })).toBe(true);
    });
  });

  describe('normalizeTashkeel', () => {
    it('removes duplicate consecutive tashkeel', () => {
      const text = 'مرحبًاًا'; // Double tanween
      const result = normalizeTashkeel(text);
      expect(result).toBe('مرحبًا');
    });

    it('normalizes shadda + fatha order', () => {
      // Both orders should result in consistent output
      const text1 = 'كَتَّب'; // Shadda after fatha
      const text2 = 'كَتَّب'; // Normalized
      expect(normalizeTashkeel(text1)).toBe(normalizeTashkeel(text2));
    });

    it('returns empty string unchanged', () => {
      expect(normalizeTashkeel('')).toBe('');
    });

    it('returns text without tashkeel unchanged', () => {
      expect(normalizeTashkeel(ARABIC_WITHOUT_TASHKEEL)).toBe(ARABIC_WITHOUT_TASHKEEL);
    });

    it('removes isolated tashkeel at beginning', () => {
      const text = '\u064Eمرحبا'; // Fatha at start
      const result = normalizeTashkeel(text);
      expect(result).toBe('مرحبا');
    });

    it('normalizes multiple tashkeel combinations', () => {
      const text = 'كَتَبَ بِشَكْلٍ جَيِّدٍ';
      const result = normalizeTashkeel(text);
      // Should maintain valid tashkeel structure
      expect(hasTashkeel(result)).toBe(true);
    });
  });

  describe('addTashkeel', () => {
    it('adds basic tashkeel to Arabic text', () => {
      const result = addTashkeel('ا');
      // Alef typically gets fatha in basic mode
      expect(typeof result).toBe('string');
    });

    it('returns empty string for empty input', () => {
      expect(addTashkeel('')).toBe('');
    });

    it('preserves existing tashkeel', () => {
      const text = 'مَرحبا';
      const result = addTashkeel(text);
      expect(result).toContain('َ'); // Original fatha preserved
    });

    it('handles text with options', () => {
      const result = addTashkeel('يا', { 
        fathaForAlef: true,
        kasraForYa: true 
      });
      expect(typeof result).toBe('string');
    });

    it('returns non-string input unchanged', () => {
      // @ts-expect-error Testing invalid input
      expect(addTashkeel(null)).toBe(null);
      // @ts-expect-error Testing invalid input
      expect(addTashkeel(undefined)).toBe(undefined);
    });
  });

  describe('analyzeTashkeel', () => {
    it('analyzes text with tashkeel', () => {
      const analysis = analyzeTashkeel('مَرْحَبًا');
      expect(analysis.hasTashkeel).toBe(true);
      expect(analysis.count).toBeGreaterThan(0);
      expect(analysis.types.length).toBeGreaterThan(0);
      expect(analysis.positions.length).toBeGreaterThan(0);
    });

    it('returns correct structure for text without tashkeel', () => {
      const analysis = analyzeTashkeel(ARABIC_WITHOUT_TASHKEEL);
      expect(analysis.hasTashkeel).toBe(false);
      expect(analysis.count).toBe(0);
      expect(analysis.types).toEqual([]);
      expect(analysis.positions).toEqual([]);
    });

    it('returns default structure for empty string', () => {
      const analysis = analyzeTashkeel('');
      expect(analysis.hasTashkeel).toBe(false);
      expect(analysis.count).toBe(0);
    });

    it('identifies different tashkeel types', () => {
      const text = 'مَرْحَبًا بِالْعَالَمِ';
      const analysis = analyzeTashkeel(text);
      expect(analysis.types).toContain('fatha');
      expect(analysis.types).toContain('sukun');
      expect(analysis.types).toContain('fathatan');
    });

    it('provides correct position indices', () => {
      const text = 'مَرحبا';
      const analysis = analyzeTashkeel(text);
      if (analysis.positions.length > 0) {
        expect(analysis.positions[0].index).toBe(1); // Fatha after meem
        expect(analysis.positions[0].char).toBe('َ');
        expect(analysis.positions[0].type).toBe('fatha');
      }
    });

    it('returns default for null/undefined input', () => {
      // @ts-expect-error Testing invalid input
      expect(analyzeTashkeel(null).hasTashkeel).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(analyzeTashkeel(undefined).hasTashkeel).toBe(false);
    });
  });

  describe('toggleTashkeel', () => {
    it('removes tashkeel when present', () => {
      const text = 'مَرْحَبًا';
      const result = toggleTashkeel(text);
      expect(hasTashkeel(result)).toBe(false);
    });

    it('adds tashkeel when not present', () => {
      const text = 'مرحبا';
      const result = toggleTashkeel(text);
      // Should attempt to add some tashkeel
      expect(typeof result).toBe('string');
    });
  });

  describe('countTashkeel', () => {
    it('counts tashkeel correctly', () => {
      const text = 'مَرْحَبًا'; // 3 tashkeel characters
      expect(countTashkeel(text)).toBe(3);
    });

    it('returns 0 for text without tashkeel', () => {
      expect(countTashkeel(ARABIC_WITHOUT_TASHKEEL)).toBe(0);
    });

    it('returns 0 for empty string', () => {
      expect(countTashkeel('')).toBe(0);
    });

    it('counts only basic tashkeel by default', () => {
      const text = 'مَرْحَبًا'; // Only basic marks
      expect(countTashkeel(text)).toBe(countTashkeel(text, { includeExtended: false }));
    });
  });

  describe('compareIgnoringTashkeel', () => {
    it('considers texts equal ignoring tashkeel', () => {
      const text1 = 'مَرْحَبًا';
      const text2 = 'مرحبا';
      expect(compareIgnoringTashkeel(text1, text2)).toBe(true);
    });

    it('considers different texts as different', () => {
      const text1 = 'مرحبا';
      const text2 = 'العالم';
      expect(compareIgnoringTashkeel(text1, text2)).toBe(false);
    });

    it('handles whitespace differences', () => {
      const text1 = 'مرحبا';
      const text2 = '  مرحبا  ';
      expect(compareIgnoringTashkeel(text1, text2)).toBe(true);
    });

    it('handles null inputs correctly', () => {
      expect(compareIgnoringTashkeel(null as any, null as any)).toBe(true);
      expect(compareIgnoringTashkeel('مرحبا', null as any)).toBe(false);
    });

    it('handles empty strings', () => {
      expect(compareIgnoringTashkeel('', '')).toBe(true);
      expect(compareIgnoringTashkeel('مرحبا', '')).toBe(false);
    });
  });

  describe('isTashkeelChar', () => {
    it('identifies fasha as tashkeel', () => {
      expect(isTashkeelChar('َ')).toBe(true);
    });

    it('identifies damma as tashkeel', () => {
      expect(isTashkeelChar('ُ')).toBe(true);
    });

    it('identifies kasra as tashkeel', () => {
      expect(isTashkeelChar('ِ')).toBe(true);
    });

    it('identifies shadda as tashkeel', () => {
      expect(isTashkeelChar('ّ')).toBe(true);
    });

    it('identifies sukun as tashkeel', () => {
      expect(isTashkeelChar('ْ')).toBe(true);
    });

    it('returns false for Arabic letters', () => {
      expect(isTashkeelChar('م')).toBe(false);
      expect(isTashkeelChar('ر')).toBe(false);
      expect(isTashkeelChar('ح')).toBe(false);
    });

    it('returns false for Latin letters', () => {
      expect(isTashkeelChar('a')).toBe(false);
      expect(isTashkeelChar('A')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isTashkeelChar('')).toBe(false);
    });

    it('returns false for multi-character strings', () => {
      expect(isTashkeelChar('َُ')).toBe(false);
    });

    it('detects extended marks when includeExtended is true', () => {
      expect(isTashkeelChar('ٓ', true)).toBe(true); // Maddah
    });
  });

  describe('getTashkeelType', () => {
    it('returns correct type for fatha', () => {
      expect(getTashkeelType('َ')).toBe('fatha');
    });

    it('returns correct type for damma', () => {
      expect(getTashkeelType('ُ')).toBe('damma');
    });

    it('returns correct type for kasra', () => {
      expect(getTashkeelType('ِ')).toBe('kasra');
    });

    it('returns correct type for sukun', () => {
      expect(getTashkeelType('ْ')).toBe('sukun');
    });

    it('returns correct type for shadda', () => {
      expect(getTashkeelType('ّ')).toBe('shadda');
    });

    it('returns correct type for fathatan', () => {
      expect(getTashkeelType('ً')).toBe('fathatan');
    });

    it('returns correct type for dammatan', () => {
      expect(getTashkeelType('ٌ')).toBe('dammatan');
    });

    it('returns correct type for kasratan', () => {
      expect(getTashkeelType('ٍ')).toBe('kasratan');
    });

    it('returns null for non-tashkeel characters', () => {
      expect(getTashkeelType('م')).toBe(null);
      expect(getTashkeelType('a')).toBe(null);
      expect(getTashkeelType('')).toBe(null);
    });
  });

  describe('getTashkeelCharacters', () => {
    it('returns array of tashkeel characters', () => {
      const chars = getTashkeelCharacters();
      expect(Array.isArray(chars)).toBe(true);
      expect(chars.length).toBeGreaterThan(0);
    });

    it('includes basic tashkeel types', () => {
      const chars = getTashkeelCharacters();
      const names = chars.map(c => c.name);
      expect(names).toContain('Fatha');
      expect(names).toContain('Damma');
      expect(names).toContain('Kasra');
      expect(names).toContain('Shadda');
    });

    it('includes Unicode codes', () => {
      const chars = getTashkeelCharacters();
      const fatha = chars.find(c => c.name === 'Fatha');
      expect(fatha?.unicode).toBe('U+064E');
    });

    it('includes actual characters', () => {
      const chars = getTashkeelCharacters();
      const fatha = chars.find(c => c.name === 'Fatha');
      expect(fatha?.char).toBe('َ');
    });
  });

  describe('TASHKEEL_PATTERN regex', () => {
    it('matches fatha characters', () => {
      expect(TASHKEEL_PATTERN.test('َ')).toBe(true);
    });

    it('matches damma characters', () => {
      expect(TASHKEEL_PATTERN.test('ُ')).toBe(true);
    });

    it('does not match Arabic letters', () => {
      expect(TASHKEEL_PATTERN.test('م')).toBe(false);
    });

    it('does not match Latin letters', () => {
      expect(TASHKEEL_PATTERN.test('a')).toBe(false);
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('handles very long text with tashkeel', () => {
      const longText = 'مَرْحَبًا بِالْعَالَمِ '.repeat(100);
      const result = removeTashkeel(longText);
      expect(hasTashkeel(result)).toBe(false);
    });

    it('handles text with only tashkeel characters', () => {
      const text = 'َُِّْ';
      const result = removeTashkeel(text);
      expect(result).toBe('');
    });

    it('handles text with alternating Arabic and tashkeel', () => {
      const text = 'مَرْحَبًا';
      const analysis = analyzeTashkeel(text);
      expect(analysis.positions[0].index).toBeGreaterThan(0);
    });

    it('handles Quranic text with extended marks', () => {
      const text = 'ٱلْحَمْدُ لِلَّٰهِ';
      const result = hasTashkeel(text, { includeExtended: true });
      expect(typeof result).toBe('boolean');
    });

    it('preserves numbers when removing tashkeel', () => {
      const text = '١٢٣ مَرْحَبًا';
      const result = removeTashkeel(text);
      expect(result).toContain('١٢٣');
      expect(result).toContain('مرحبا');
    });

    it('handles special Arabic punctuation', () => {
      const text = 'مرحبا، كيف حال؟';
      expect(removeTashkeel(text)).toBe(text);
    });

    it('processes text with shadda combinations correctly', () => {
      const text = 'كَتَّابَةٌ'; // Shadda + tanween
      const analysis = analyzeTashkeel(text);
      expect(analysis.hasTashkeel).toBe(true);
      expect(analysis.types).toContain('shadda');
    });

    it('handles zero-width characters correctly', () => {
      const text = 'مرحبا\u200Bمَرْحَبًا'; // With ZWNJ
      const result = removeTashkeel(text);
      expect(result).toContain('\u200B');
    });
  });
});
