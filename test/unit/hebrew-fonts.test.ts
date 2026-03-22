import { describe, it, expect } from 'vitest';
import {
  HEBREW_FONTS,
  getHebrewFontById,
  getHebrewFontsByCategory,
  getHebrewFontsFor,
  generateHebrewGoogleFontsUrl,
  DEFAULT_HEBREW_FONT,
  HEBREW_FONT_PAIRINGS,
} from '../../app/services/fonts/hebrew';

describe('Hebrew Font Library', () => {
  describe('HEBREW_FONTS', () => {
    it('contains at least 9 fonts', () => {
      expect(HEBREW_FONTS.length).toBeGreaterThanOrEqual(9);
    });

    it('includes Heebo', () => {
      const font = getHebrewFontById('heebo');
      expect(font).toBeDefined();
      expect(font?.name).toBe('Heebo');
      expect(font?.category).toBe('sans-serif');
    });

    it('includes Rubik', () => {
      const font = getHebrewFontById('rubik');
      expect(font).toBeDefined();
      expect(font?.name).toBe('Rubik');
    });

    it('includes Assistant', () => {
      const font = getHebrewFontById('assistant');
      expect(font).toBeDefined();
      expect(font?.name).toBe('Assistant');
    });

    it('includes David Libre', () => {
      const font = getHebrewFontById('david-libre');
      expect(font).toBeDefined();
      expect(font?.category).toBe('serif');
    });

    it('includes Miriam Libre', () => {
      const font = getHebrewFontById('miriam-libre');
      expect(font).toBeDefined();
    });

    it('includes Frank Ruhl Libre', () => {
      const font = getHebrewFontById('frank-ruhl-libre');
      expect(font).toBeDefined();
      expect(font?.category).toBe('serif');
    });

    it('includes Noto Sans Hebrew', () => {
      const font = getHebrewFontById('noto-sans-hebrew');
      expect(font).toBeDefined();
    });

    it('includes Secular One', () => {
      const font = getHebrewFontById('secular-one');
      expect(font).toBeDefined();
    });

    it('includes Suez One', () => {
      const font = getHebrewFontById('suez-one');
      expect(font).toBeDefined();
      expect(font?.category).toBe('serif');
    });

    it('all fonts have Hebrew preview text', () => {
      HEBREW_FONTS.forEach((font) => {
        expect(font.previewText).toBeDefined();
        expect(font.previewText.length).toBeGreaterThan(0);
        // Check for Hebrew characters
        expect(/[\u0590-\u05FF]/.test(font.previewText)).toBe(true);
      });
    });

    it('all fonts have required properties', () => {
      HEBREW_FONTS.forEach((font) => {
        expect(font.id).toBeDefined();
        expect(font.name).toBeDefined();
        expect(font.family).toBeDefined();
        expect(font.category).toBeDefined();
        expect(font.weights).toBeDefined();
        expect(font.weights.length).toBeGreaterThan(0);
        expect(font.googleFontUrl).toBeDefined();
        expect(font.description).toBeDefined();
      });
    });
  });

  describe('getHebrewFontById', () => {
    it('returns font for valid ID', () => {
      const font = getHebrewFontById('heebo');
      expect(font).toBeDefined();
      expect(font?.id).toBe('heebo');
    });

    it('returns undefined for invalid ID', () => {
      const font = getHebrewFontById('nonexistent');
      expect(font).toBeUndefined();
    });
  });

  describe('getHebrewFontsByCategory', () => {
    it('returns only sans-serif fonts', () => {
      const fonts = getHebrewFontsByCategory('sans-serif');
      expect(fonts.length).toBeGreaterThan(0);
      fonts.forEach((font) => {
        expect(font.category).toBe('sans-serif');
      });
    });

    it('returns only serif fonts', () => {
      const fonts = getHebrewFontsByCategory('serif');
      expect(fonts.length).toBeGreaterThan(0);
      fonts.forEach((font) => {
        expect(font.category).toBe('serif');
      });
    });
  });

  describe('getHebrewFontsFor', () => {
    it('returns fonts for body-text', () => {
      const fonts = getHebrewFontsFor('body-text');
      expect(fonts.length).toBeGreaterThan(0);
      expect(fonts.map((f) => f.id)).toContain('heebo');
    });

    it('returns fonts for headlines', () => {
      const fonts = getHebrewFontsFor('headlines');
      expect(fonts.length).toBeGreaterThan(0);
      expect(fonts.map((f) => f.id)).toContain('secular-one');
    });
  });

  describe('generateHebrewGoogleFontsUrl', () => {
    it('generates URL for single font', () => {
      const url = generateHebrewGoogleFontsUrl(['heebo']);
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('Heebo');
    });

    it('generates URL for multiple fonts', () => {
      const url = generateHebrewGoogleFontsUrl(['heebo', 'rubik']);
      expect(url).toContain('Heebo');
      expect(url).toContain('Rubik');
    });

    it('returns empty string for empty array', () => {
      const url = generateHebrewGoogleFontsUrl([]);
      expect(url).toBe('');
    });

    it('returns empty string for invalid font IDs', () => {
      const url = generateHebrewGoogleFontsUrl(['nonexistent']);
      expect(url).toBe('');
    });
  });

  describe('DEFAULT_HEBREW_FONT', () => {
    it('is Heebo', () => {
      expect(DEFAULT_HEBREW_FONT.id).toBe('heebo');
    });
  });

  describe('HEBREW_FONT_PAIRINGS', () => {
    it('has modern-blog pairing', () => {
      expect(HEBREW_FONT_PAIRINGS['modern-blog']).toBeDefined();
      expect(HEBREW_FONT_PAIRINGS['modern-blog'].heading).toBe('secular-one');
      expect(HEBREW_FONT_PAIRINGS['modern-blog'].body).toBe('heebo');
    });

    it('has traditional pairing', () => {
      expect(HEBREW_FONT_PAIRINGS['traditional']).toBeDefined();
      expect(HEBREW_FONT_PAIRINGS['traditional'].heading).toBe('suez-one');
    });

    it('has tech-startup pairing', () => {
      expect(HEBREW_FONT_PAIRINGS['tech-startup']).toBeDefined();
      expect(HEBREW_FONT_PAIRINGS['tech-startup'].body).toBe('assistant');
    });
  });
});
