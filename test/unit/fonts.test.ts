import { describe, it, expect } from 'vitest';
import {
  ARABIC_FONTS,
  getFontById,
  getFontsByCategory,
  getFontsFor,
  generateGoogleFontsUrl,
  generateSubsetFontUrl,
  DEFAULT_ARABIC_FONT,
  FONT_PAIRINGS,
  generateFontCSSVariables,
  getFontIdsFromConfig,
  validateFontConfig,
  applyFontPairing,
  DEFAULT_FONT_CONFIG,
} from '../../app/services/fonts';

describe('Arabic Font Library', () => {
  describe('ARABIC_FONTS', () => {
    it('contains at least 8 fonts', () => {
      expect(ARABIC_FONTS.length).toBeGreaterThanOrEqual(8);
    });

    it('includes Noto Sans Arabic', () => {
      const font = getFontById('noto-sans-arabic');
      expect(font).toBeDefined();
      expect(font?.name).toBe('Noto Sans Arabic');
    });

    it('includes Cairo', () => {
      const font = getFontById('cairo');
      expect(font).toBeDefined();
      expect(font?.name).toBe('Cairo');
    });

    it('includes Vazirmatn', () => {
      const font = getFontById('vazirmatn');
      expect(font).toBeDefined();
      expect(font?.name).toBe('Vazirmatn');
    });

    it('includes Amiri', () => {
      const font = getFontById('amiri');
      expect(font).toBeDefined();
      expect(font?.category).toBe('serif');
    });

    it('all fonts have required properties', () => {
      ARABIC_FONTS.forEach((font) => {
        expect(font.id).toBeDefined();
        expect(font.name).toBeDefined();
        expect(font.family).toBeDefined();
        expect(font.category).toBeDefined();
        expect(font.weights).toBeDefined();
        expect(font.weights.length).toBeGreaterThan(0);
        expect(font.googleFontUrl).toBeDefined();
        expect(font.previewText).toBeDefined();
      });
    });
  });

  describe('getFontById', () => {
    it('returns font for valid ID', () => {
      const font = getFontById('cairo');
      expect(font).toBeDefined();
      expect(font?.id).toBe('cairo');
    });

    it('returns undefined for invalid ID', () => {
      const font = getFontById('nonexistent');
      expect(font).toBeUndefined();
    });
  });

  describe('getFontsByCategory', () => {
    it('returns only sans-serif fonts', () => {
      const fonts = getFontsByCategory('sans-serif');
      expect(fonts.length).toBeGreaterThan(0);
      fonts.forEach((font) => {
        expect(font.category).toBe('sans-serif');
      });
    });

    it('returns only serif fonts', () => {
      const fonts = getFontsByCategory('serif');
      expect(fonts.length).toBeGreaterThan(0);
      fonts.forEach((font) => {
        expect(font.category).toBe('serif');
      });
    });
  });

  describe('getFontsFor', () => {
    it('returns fonts for headings', () => {
      const fonts = getFontsFor('headings');
      expect(fonts.length).toBeGreaterThan(0);
    });

    it('returns fonts for body-text', () => {
      const fonts = getFontsFor('body-text');
      expect(fonts.length).toBeGreaterThan(0);
    });
  });

  describe('generateGoogleFontsUrl', () => {
    it('generates URL for single font', () => {
      const url = generateGoogleFontsUrl(['cairo']);
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('Cairo');
    });

    it('generates URL for multiple fonts', () => {
      const url = generateGoogleFontsUrl(['cairo', 'amiri']);
      expect(url).toContain('Cairo');
      expect(url).toContain('Amiri');
    });

    it('returns empty string for empty array', () => {
      const url = generateGoogleFontsUrl([]);
      expect(url).toBe('');
    });

    it('returns empty string for invalid font IDs', () => {
      const url = generateGoogleFontsUrl(['nonexistent']);
      expect(url).toBe('');
    });
  });

  describe('generateSubsetFontUrl', () => {
    it('generates URL with specific weights', () => {
      const url = generateSubsetFontUrl('cairo', [400, 700]);
      expect(url).toContain('Cairo');
      expect(url).toContain('wght@400;700');
    });

    it('returns empty string for invalid font', () => {
      const url = generateSubsetFontUrl('nonexistent', [400]);
      expect(url).toBe('');
    });
  });

  describe('DEFAULT_ARABIC_FONT', () => {
    it('is Noto Sans Arabic', () => {
      expect(DEFAULT_ARABIC_FONT.id).toBe('noto-sans-arabic');
    });
  });

  describe('FONT_PAIRINGS', () => {
    it('has modern-blog pairing', () => {
      expect(FONT_PAIRINGS['modern-blog']).toBeDefined();
      expect(FONT_PAIRINGS['modern-blog'].heading).toBe('cairo');
      expect(FONT_PAIRINGS['modern-blog'].body).toBe('vazirmatn');
    });

    it('has corporate pairing', () => {
      expect(FONT_PAIRINGS['corporate']).toBeDefined();
      expect(FONT_PAIRINGS['corporate'].heading).toBe('almarai');
    });
  });

  describe('generateFontCSSVariables', () => {
    it('generates CSS with font families', () => {
      const css = generateFontCSSVariables(DEFAULT_FONT_CONFIG);
      expect(css).toContain('--font-arabic-heading');
      expect(css).toContain('--font-arabic-body');
      expect(css).toContain('Cairo');
    });

    it('includes RTL selectors', () => {
      const css = generateFontCSSVariables(DEFAULT_FONT_CONFIG);
      expect(css).toContain('[dir="rtl"]');
    });
  });

  describe('getFontIdsFromConfig', () => {
    it('extracts unique font IDs', () => {
      const ids = getFontIdsFromConfig(DEFAULT_FONT_CONFIG);
      expect(ids).toContain('cairo');
      expect(ids).toContain('noto-sans-arabic');
    });

    it('handles config without accent', () => {
      const config = {
        ...DEFAULT_FONT_CONFIG,
        arabic: { ...DEFAULT_FONT_CONFIG.arabic, accent: undefined },
      };
      const ids = getFontIdsFromConfig(config);
      expect(ids.length).toBe(2);
    });
  });

  describe('validateFontConfig', () => {
    it('validates correct config', () => {
      const result = validateFontConfig(DEFAULT_FONT_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('invalidates config with missing font', () => {
      const config = {
        ...DEFAULT_FONT_CONFIG,
        arabic: { ...DEFAULT_FONT_CONFIG.arabic, heading: 'nonexistent' },
      };
      const result = validateFontConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('invalidates config with invalid weight', () => {
      const config = {
        ...DEFAULT_FONT_CONFIG,
        weights: { ...DEFAULT_FONT_CONFIG.weights, heading: 999 },
      };
      const result = validateFontConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe('applyFontPairing', () => {
    it('applies modern-blog pairing', () => {
      const config = applyFontPairing('modern-blog');
      expect(config.arabic.heading).toBe('cairo');
      expect(config.arabic.body).toBe('vazirmatn');
    });

    it('returns default for invalid pairing', () => {
      const config = applyFontPairing('nonexistent' as any);
      expect(config).toEqual(DEFAULT_FONT_CONFIG);
    });
  });
});
