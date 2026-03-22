import { describe, it, expect } from 'vitest';
import {
  levenshteinDistance,
  calculateSimilarity,
  normalizeForMatching,
} from '../../app/services/translation-memory/matcher';

describe('Translation Memory Matcher', () => {
  describe('levenshteinDistance()', () => {
    it('returns 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('returns 1 for a single character insertion', () => {
      expect(levenshteinDistance('cat', 'cats')).toBe(1);
    });

    it('returns 1 for a single character deletion', () => {
      expect(levenshteinDistance('cats', 'cat')).toBe(1);
    });

    it('returns 1 for a single character substitution', () => {
      expect(levenshteinDistance('cat', 'car')).toBe(1);
    });

    it('returns correct distance for completely different strings', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    it('returns length of b when a is empty', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5);
    });

    it('returns length of a when b is empty', () => {
      expect(levenshteinDistance('hello', '')).toBe(5);
    });

    it('returns 0 for two empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('handles longer strings correctly', () => {
      // "kitten" -> "sitting" requires 3 edits
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('is symmetric', () => {
      const d1 = levenshteinDistance('abc', 'def');
      const d2 = levenshteinDistance('def', 'abc');
      expect(d1).toBe(d2);
    });
  });

  describe('calculateSimilarity()', () => {
    it('returns 1.0 for identical strings', () => {
      expect(calculateSimilarity('hello', 'hello')).toBe(1);
    });

    it('returns 1.0 for strings that differ only in case', () => {
      expect(calculateSimilarity('Hello', 'hello')).toBe(1);
    });

    it('returns 1.0 for strings that differ only in whitespace', () => {
      expect(calculateSimilarity('  hello  ', 'hello')).toBe(1);
    });

    it('returns 0 for completely different single-char strings', () => {
      // "a" vs "z" = distance 1, maxLen 1, similarity = 1 - 1/1 = 0
      expect(calculateSimilarity('a', 'z')).toBe(0);
    });

    it('returns a value between 0 and 1 for partially similar strings', () => {
      const sim = calculateSimilarity('hello', 'hallo');
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThan(1);
      // distance 1, maxLen 5 -> 1 - 1/5 = 0.8
      expect(sim).toBeCloseTo(0.8);
    });

    it('returns 1.0 for two empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(1);
    });
  });

  describe('normalizeForMatching()', () => {
    it('lowercases text', () => {
      expect(normalizeForMatching('HELLO')).toBe('hello');
    });

    it('trims leading and trailing whitespace', () => {
      expect(normalizeForMatching('  hello  ')).toBe('hello');
    });

    it('normalizes multiple spaces to single space', () => {
      expect(normalizeForMatching('hello   world')).toBe('hello world');
    });

    it('handles tabs and newlines as whitespace', () => {
      expect(normalizeForMatching("hello\t\nworld")).toBe('hello world');
    });

    it('combines all normalizations together', () => {
      expect(normalizeForMatching('  HELLO   WORLD  ')).toBe('hello world');
    });
  });
});
