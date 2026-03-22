import { describe, it, expect } from 'vitest';
import {
  addTashkeel, removeTashkeel, hasTashkeel, normalizeTashkeel,
  analyzeTashkeel, toggleTashkeel, countTashkeel, compareIgnoringTashkeel,
  isTashkeelChar, getTashkeelType, getTashkeelCharacters,
  TASHKEEL_CHARS
} from '../../app/services/arabic-features/tashkeel';

describe('Tashkeel Service', () => {
  const ARABIC_WITHOUT_TASHKEEL = 'مرحبا بالعالم';
  const ARABIC_WITH_TASHKEEL = 'مَرْحَبًا بِالْعَالَمِ';

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
      expect(removeTashkeel(ARABIC_WITH_TASHKEEL)).toBe('مرحبا بالعالم');
    });
    it('returns empty string for empty input', () => {
      expect(removeTashkeel('')).toBe('');
    });
    it('returns unchanged text without tashkeel', () => {
      expect(removeTashkeel(ARABIC_WITHOUT_TASHKEEL)).toBe(ARABIC_WITHOUT_TASHKEEL);
    });
    it('removes mixed tashkeel types', () => {
      expect(removeTashkeel('كَتَبَ')).toBe('كتب');
    });
    it('keeps shadda when keepShadda option is true', () => {
      const text = 'كَتَّاب';
      const result = removeTashkeel(text, { keepShadda: true });
      expect(result).toContain('ّ');
      expect(result).not.toContain('َ');
    });
    it('handles text with tanween correctly', () => {
      expect(removeTashkeel('كتابًا')).toBe('كتابا');
    });
    it('preserves non-Arabic text unchanged', () => {
      expect(removeTashkeel('Hello World 123')).toBe('Hello World 123');
    });
    it('handles mixed Arabic/English text', () => {
      expect(removeTashkeel('Hello مَرْحَبًا')).toBe('Hello مرحبا');
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
      const text = 'مرحبًًا';
      const result = normalizeTashkeel(text);
      expect(result).toBe('مرحبًا');
    });
    it('normalizes shadda + fatha order', () => {
      const text1 = 'كَتَّب';
      const text2 = 'كَتَّب';
      expect(normalizeTashkeel(text1)).toBe(normalizeTashkeel(text2));
    });
    it('returns empty string unchanged', () => {
      expect(normalizeTashkeel('')).toBe('');
    });
    it('returns text without tashkeel unchanged', () => {
      expect(normalizeTashkeel(ARABIC_WITHOUT_TASHKEEL)).toBe(ARABIC_WITHOUT_TASHKEEL);
    });
    it('removes isolated tashkeel at beginning', () => {
      expect(normalizeTashkeel('\u064Eمرحبا')).toBe('مرحبا');
    });
    it('normalizes multiple tashkeel combinations', () => {
      const result = normalizeTashkeel('كَتَبَ بِشَكْلٍ جَيِّدٍ');
      expect(hasTashkeel(result)).toBe(true);
    });
  });

  describe('addTashkeel', () => {
    it('adds basic tashkeel to Arabic text', () => {
      expect(typeof addTashkeel('ا')).toBe('string');
    });
    it('returns empty string for empty input', () => {
      expect(addTashkeel('')).toBe('');
    });
    it('preserves existing tashkeel', () => {
      expect(addTashkeel('مَرحبا')).toContain('َ');
    });
    it('handles text with options', () => {
      expect(typeof addTashkeel('يا', { fathaForAlef: true, kasraForYa: true })).toBe('string');
    });
    it('returns non-string input unchanged', () => {
      expect(addTashkeel(null as any)).toBe(null);
      expect(addTashkeel(undefined as any)).toBe(undefined);
    });
  });

  describe('analyzeTashkeel', () => {
    it('analyzes text with tashkeel', () => {
      const analysis = analyzeTashkeel('مَرْحَبًا');
      expect(analysis.hasTashkeel).toBe(true);
      expect(analysis.count).toBeGreaterThan(0);
      expect(analysis.types.length).toBeGreaterThan(0);
    });
    it('returns correct structure for text without tashkeel', () => {
      const analysis = analyzeTashkeel(ARABIC_WITHOUT_TASHKEEL);
      expect(analysis.hasTashkeel).toBe(false);
      expect(analysis.count).toBe(0);
      expect(analysis.types).toEqual([]);
    });
    it('returns default structure for empty string', () => {
      expect(analyzeTashkeel('').hasTashkeel).toBe(false);
    });
    it('identifies different tashkeel types', () => {
      const analysis = analyzeTashkeel('مَرْحَبًا بِالْعَالَمِ');
      expect(analysis.types).toContain('fatha');
      expect(analysis.types).toContain('sukun');
    });
    it('provides correct position indices', () => {
      const analysis = analyzeTashkeel('مَرحبا');
      expect(analysis.positions[0].index).toBe(1);
      expect(analysis.positions[0].char).toBe('َ');
      expect(analysis.positions[0].type).toBe('fatha');
    });
    it('returns default for null/undefined input', () => {
      expect(analyzeTashkeel(null as any).hasTashkeel).toBe(false);
      expect(analyzeTashkeel(undefined as any).hasTashkeel).toBe(false);
    });
  });

  describe('toggleTashkeel', () => {
    it('removes tashkeel when present', () => {
      expect(hasTashkeel(toggleTashkeel('مَرْحَبًا'))).toBe(false);
    });
    it('adds tashkeel when not present', () => {
      expect(typeof toggleTashkeel('مرحبا')).toBe('string');
    });
  });

  describe('countTashkeel', () => {
    it('counts tashkeel correctly', () => {
      expect(countTashkeel('مَرْحَبًا')).toBe(4);
    });
    it('returns 0 for text without tashkeel', () => {
      expect(countTashkeel(ARABIC_WITHOUT_TASHKEEL)).toBe(0);
    });
    it('returns 0 for empty string', () => {
      expect(countTashkeel('')).toBe(0);
    });
  });

  describe('compareIgnoringTashkeel', () => {
    it('considers texts equal ignoring tashkeel', () => {
      expect(compareIgnoringTashkeel('مَرْحَبًا', 'مرحبا')).toBe(true);
    });
    it('considers different texts as different', () => {
      expect(compareIgnoringTashkeel('مرحبا', 'العالم')).toBe(false);
    });
    it('handles whitespace differences', () => {
      expect(compareIgnoringTashkeel('مرحبا', '  مرحبا  ')).toBe(true);
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
    it('identifies fatha as tashkeel', () => expect(isTashkeelChar('َ')).toBe(true));
    it('identifies damma as tashkeel', () => expect(isTashkeelChar('ُ')).toBe(true));
    it('identifies kasra as tashkeel', () => expect(isTashkeelChar('ِ')).toBe(true));
    it('identifies shadda as tashkeel', () => expect(isTashkeelChar('ّ')).toBe(true));
    it('identifies sukun as tashkeel', () => expect(isTashkeelChar('ْ')).toBe(true));
    it('returns false for Arabic letters', () => {
      expect(isTashkeelChar('م')).toBe(false);
      expect(isTashkeelChar('ر')).toBe(false);
    });
    it('returns false for Latin letters', () => {
      expect(isTashkeelChar('a')).toBe(false);
    });
    it('returns false for empty string', () => expect(isTashkeelChar('')).toBe(false));
    it('returns false for multi-character strings', () => expect(isTashkeelChar('َُ')).toBe(false));
    it('detects extended marks when includeExtended is true', () => {
      expect(isTashkeelChar('ٓ', true)).toBe(true);
    });
  });

  describe('getTashkeelType', () => {
    it('returns correct type for fatha', () => expect(getTashkeelType('َ')).toBe('fatha'));
    it('returns correct type for damma', () => expect(getTashkeelType('ُ')).toBe('damma'));
    it('returns correct type for kasra', () => expect(getTashkeelType('ِ')).toBe('kasra'));
    it('returns correct type for sukun', () => expect(getTashkeelType('ْ')).toBe('sukun'));
    it('returns correct type for shadda', () => expect(getTashkeelType('ّ')).toBe('shadda'));
    it('returns correct type for fathatan', () => expect(getTashkeelType('ً')).toBe('fathatan'));
    it('returns correct type for dammatan', () => expect(getTashkeelType('ٌ')).toBe('dammatan'));
    it('returns correct type for kasratan', () => expect(getTashkeelType('ٍ')).toBe('kasratan'));
    it('returns null for non-tashkeel characters', () => {
      expect(getTashkeelType('م')).toBe(null);
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
      const names = getTashkeelCharacters().map(c => c.name);
      expect(names).toContain('Fatha');
      expect(names).toContain('Damma');
      expect(names).toContain('Kasra');
      expect(names).toContain('Shadda');
    });
    it('includes Unicode codes', () => {
      const fatha = getTashkeelCharacters().find(c => c.name === 'Fatha');
      expect(fatha?.unicode).toBe('U+064E');
    });
    it('includes actual characters', () => {
      const fatha = getTashkeelCharacters().find(c => c.name === 'Fatha');
      expect(fatha?.char).toBe('َ');
    });
  });

  describe('Edge cases and complex scenarios', () => {
    it('handles very long text with tashkeel', () => {
      const longText = 'مَرْحَبًا بِالْعَالَمِ '.repeat(100);
      expect(hasTashkeel(removeTashkeel(longText))).toBe(false);
    });
    it('handles text with only tashkeel characters', () => {
      expect(removeTashkeel('َُِّْ')).toBe('');
    });
    it('handles text with alternating Arabic and tashkeel', () => {
      expect(analyzeTashkeel('مَرْحَبًا').positions[0].index).toBeGreaterThan(0);
    });
    it('handles Quranic text with extended marks', () => {
      expect(typeof hasTashkeel('ٱلْحَمْدُ لِلَّٰهِ', { includeExtended: true })).toBe('boolean');
    });
    it('preserves numbers when removing tashkeel', () => {
      const result = removeTashkeel('١٢٣ مَرْحَبًا');
      expect(result).toContain('١٢٣');
      expect(result).toContain('مرحبا');
    });
    it('handles special Arabic punctuation', () => {
      expect(removeTashkeel('مرحبا، كيف حال؟')).toBe('مرحبا، كيف حال؟');
    });
    it('processes text with shadda combinations correctly', () => {
      const analysis = analyzeTashkeel('كَتَّابَةٌ');
      expect(analysis.hasTashkeel).toBe(true);
      expect(analysis.types).toContain('shadda');
    });
    it('handles zero-width characters correctly', () => {
      expect(removeTashkeel('مرحبا\u200Bمَرْحَبًا')).toContain('\u200B');
    });
  });
});
