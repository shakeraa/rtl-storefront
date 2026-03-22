import { describe, it, expect } from 'vitest';
import { BiDiPreserver, BIDI_MARKS } from '../../app/services/bidi/index';

const preserver = new BiDiPreserver();

describe('BiDi Preservation Service', () => {
  describe('BIDI_MARKS constants', () => {
    it('has correct LRM value', () => {
      expect(BIDI_MARKS.LRM).toBe('\u200E');
    });

    it('has correct RLM value', () => {
      expect(BIDI_MARKS.RLM).toBe('\u200F');
    });

    it('has correct LRI value', () => {
      expect(BIDI_MARKS.LRI).toBe('\u2066');
    });

    it('has correct RLI value', () => {
      expect(BIDI_MARKS.RLI).toBe('\u2067');
    });

    it('has correct PDI value', () => {
      expect(BIDI_MARKS.PDI).toBe('\u2069');
    });
  });

  describe('BiDiPreserver.preserve()', () => {
    it('preserves mixed Arabic/English text with directional marks', () => {
      const result = preserver.preserve('مرحبا Hello', 'ar');
      // Mixed content should get RLM marks (RTL locale)
      expect(result).toContain(BIDI_MARKS.RLM);
    });

    it('handles pure Arabic text without inserting marks', () => {
      const result = preserver.preserve('مرحبا بالعالم', 'ar');
      // Pure RTL text should not get boundary marks since it is not mixed
      expect(result).not.toContain(BIDI_MARKS.RLM);
      expect(result).not.toContain(BIDI_MARKS.LRM);
    });

    it('handles pure English text without inserting marks', () => {
      const result = preserver.preserve('Hello World', 'en');
      // Pure LTR text in LTR locale should remain unchanged
      expect(result).not.toContain(BIDI_MARKS.RLM);
      expect(result).not.toContain(BIDI_MARKS.LRM);
    });

    it('returns empty string for empty input', () => {
      expect(preserver.preserve('', 'ar')).toBe('');
    });
  });

  describe('BiDiPreserver.insertDirectionalMarks()', () => {
    it('adds RLM marks for mixed content in RTL direction', () => {
      const result = preserver.insertDirectionalMarks('مرحبا Hello', 'rtl');
      expect(result).toBe(`${BIDI_MARKS.RLM}مرحبا Hello${BIDI_MARKS.RLM}`);
    });

    it('adds LRM marks for mixed content in LTR direction', () => {
      const result = preserver.insertDirectionalMarks('Hello مرحبا', 'ltr');
      expect(result).toBe(`${BIDI_MARKS.LRM}Hello مرحبا${BIDI_MARKS.LRM}`);
    });

    it('skips marks for pure RTL text', () => {
      const result = preserver.insertDirectionalMarks('مرحبا بالعالم', 'rtl');
      expect(result).toBe('مرحبا بالعالم');
    });

    it('skips marks for pure LTR text', () => {
      const result = preserver.insertDirectionalMarks('Hello World', 'ltr');
      expect(result).toBe('Hello World');
    });

    it('returns empty string for empty input', () => {
      expect(preserver.insertDirectionalMarks('', 'rtl')).toBe('');
    });
  });

  describe('BiDiPreserver.preserveEmails()', () => {
    it('wraps email addresses in LTR isolates', () => {
      const result = preserver.preserveEmails('اتصل بنا user@example.com');
      expect(result).toContain(`${BIDI_MARKS.LRI}user@example.com${BIDI_MARKS.PDI}`);
    });

    it('wraps multiple emails', () => {
      const result = preserver.preserveEmails('a@b.com and c@d.com');
      expect(result).toContain(`${BIDI_MARKS.LRI}a@b.com${BIDI_MARKS.PDI}`);
      expect(result).toContain(`${BIDI_MARKS.LRI}c@d.com${BIDI_MARKS.PDI}`);
    });

    it('returns text unchanged when no emails are present', () => {
      const text = 'مرحبا بالعالم';
      expect(preserver.preserveEmails(text)).toBe(text);
    });
  });

  describe('BiDiPreserver.preserveUrls()', () => {
    it('wraps http URLs in LTR isolates', () => {
      const result = preserver.preserveUrls('زوروا https://example.com');
      expect(result).toContain(`${BIDI_MARKS.LRI}https://example.com${BIDI_MARKS.PDI}`);
    });

    it('wraps www URLs in LTR isolates', () => {
      const result = preserver.preserveUrls('زوروا www.example.com');
      expect(result).toContain(`${BIDI_MARKS.LRI}www.example.com${BIDI_MARKS.PDI}`);
    });

    it('returns text unchanged when no URLs are present', () => {
      const text = 'نص بسيط بدون روابط';
      expect(preserver.preserveUrls(text)).toBe(text);
    });
  });

  describe('BiDiPreserver.preserveNumbers()', () => {
    it('wraps numbers in LTR isolates for RTL locale', () => {
      const result = preserver.preserveNumbers('سعر 100 ريال', 'ar');
      expect(result).toContain(`${BIDI_MARKS.LRI}100${BIDI_MARKS.PDI}`);
    });

    it('does not wrap numbers for LTR locale', () => {
      const text = 'Price is 100 dollars';
      expect(preserver.preserveNumbers(text, 'en')).toBe(text);
    });

    it('wraps multi-digit numbers with separators', () => {
      const result = preserver.preserveNumbers('المبلغ 1,234 ريال', 'ar');
      expect(result).toContain(BIDI_MARKS.LRI);
      expect(result).toContain(BIDI_MARKS.PDI);
    });
  });

  describe('BiDiPreserver.preserveBrandNames()', () => {
    it('wraps brand names in LTR isolates', () => {
      const result = preserver.preserveBrandNames('تسوق في Shopify', ['Shopify']);
      expect(result).toContain(`${BIDI_MARKS.LRI}Shopify${BIDI_MARKS.PDI}`);
    });

    it('handles multiple brand names', () => {
      const result = preserver.preserveBrandNames(
        'استخدم Nike و Adidas',
        ['Nike', 'Adidas'],
      );
      expect(result).toContain(`${BIDI_MARKS.LRI}Nike${BIDI_MARKS.PDI}`);
      expect(result).toContain(`${BIDI_MARKS.LRI}Adidas${BIDI_MARKS.PDI}`);
    });

    it('returns text unchanged when no brand names appear', () => {
      const text = 'مرحبا بالعالم';
      expect(preserver.preserveBrandNames(text, ['Shopify'])).toBe(text);
    });

    it('returns text unchanged for empty brand list', () => {
      const text = 'تسوق في Shopify';
      expect(preserver.preserveBrandNames(text, [])).toBe(text);
    });
  });

  describe('BiDiPreserver.detectMixedContent()', () => {
    it('detects mixed Arabic/English content', () => {
      const result = preserver.detectMixedContent('مرحبا Hello');
      expect(result.isMixed).toBe(true);
      expect(result.hasRTL).toBe(true);
      expect(result.hasLTR).toBe(true);
    });

    it('detects pure RTL content', () => {
      const result = preserver.detectMixedContent('مرحبا بالعالم');
      expect(result.hasRTL).toBe(true);
      expect(result.hasLTR).toBe(false);
      expect(result.isMixed).toBe(false);
    });

    it('detects pure LTR content', () => {
      const result = preserver.detectMixedContent('Hello World');
      expect(result.hasRTL).toBe(false);
      expect(result.hasLTR).toBe(true);
      expect(result.isMixed).toBe(false);
    });

    it('identifies segments with their directions', () => {
      const result = preserver.detectMixedContent('مرحبا Hello');
      expect(result.segments.length).toBeGreaterThan(0);
      const directions = result.segments.map((s) => s.direction);
      expect(directions).toContain('rtl');
      expect(directions).toContain('ltr');
    });

    it('returns dominant direction as RTL when Arabic dominates', () => {
      const result = preserver.detectMixedContent('مرحبا بالعالم العربي Hello');
      expect(result.dominantDirection).toBe('rtl');
    });

    it('returns dominant direction as LTR when English dominates', () => {
      const result = preserver.detectMixedContent('Hello World مرحبا');
      expect(result.dominantDirection).toBe('ltr');
    });

    it('returns empty analysis for empty text', () => {
      const result = preserver.detectMixedContent('');
      expect(result.hasRTL).toBe(false);
      expect(result.hasLTR).toBe(false);
      expect(result.isMixed).toBe(false);
      expect(result.segments).toEqual([]);
      expect(result.dominantDirection).toBe('ltr');
    });
  });
});
