import { describe, it, expect } from 'vitest';
import {
  CALLIGRAPHY_STYLES,
  getCalligraphyStyle,
  getCalligraphyStyles,
  getFontForStyle,
  getAllFontsForStyle,
  getStyleMetadata,
  getStylesForUseCase,
  getStylesByEra,
  getStylesByDifficulty,
  getHeroStyles,
  generateFontFamily,
  getStyleNames,
  searchStyles,
  getAllGoogleFontsUrl,
  isStyleSuitableForLocale,
} from '../../app/services/arabic-features/calligraphy';

describe('Arabic Calligraphy Library', () => {
  describe('CALLIGRAPHY_STYLES', () => {
    it('contains at least 8 calligraphy styles', () => {
      expect(CALLIGRAPHY_STYLES.length).toBeGreaterThanOrEqual(8);
    });

    it('contains exactly 10 calligraphy styles', () => {
      expect(CALLIGRAPHY_STYLES.length).toBe(10);
    });

    it('includes Naskh style', () => {
      const style = CALLIGRAPHY_STYLES.find((s) => s.id === 'naskh');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Naskh');
    });

    it('includes Thuluth style', () => {
      const style = CALLIGRAPHY_STYLES.find((s) => s.id === 'thuluth');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Thuluth');
    });

    it('includes Diwani style', () => {
      const style = CALLIGRAPHY_STYLES.find((s) => s.id === 'diwani');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Diwani');
    });

    it('includes Ruqaa style', () => {
      const style = CALLIGRAPHY_STYLES.find((s) => s.id === 'ruqaa');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Ruqaa');
    });

    it('includes Kufic style', () => {
      const style = CALLIGRAPHY_STYLES.find((s) => s.id === 'kufi');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Kufic');
    });

    it('includes Nastaaliq style', () => {
      const style = CALLIGRAPHY_STYLES.find((s) => s.id === 'nastaaliq');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Nastaaliq');
    });

    it('includes Maghrebi style', () => {
      const style = CALLIGRAPHY_STYLES.find((s) => s.id === 'maghrebi');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Maghrebi');
    });

    it('all styles have Arabic names', () => {
      CALLIGRAPHY_STYLES.forEach((style) => {
        expect(style.name.arabic).toBeDefined();
        expect(style.name.arabic.length).toBeGreaterThan(0);
        expect(style.name.arabic).toContain('ال');
      });
    });

    it('all styles have required properties', () => {
      CALLIGRAPHY_STYLES.forEach((style) => {
        expect(style.id).toBeDefined();
        expect(style.name.english).toBeDefined();
        expect(style.name.arabic).toBeDefined();
        expect(style.name.transliteration).toBeDefined();
        expect(style.description.english).toBeDefined();
        expect(style.description.arabic).toBeDefined();
        expect(style.era).toBeDefined();
        expect(style.origin).toBeDefined();
        expect(style.characteristics).toBeDefined();
        expect(style.characteristics.length).toBeGreaterThan(0);
        expect(style.useCases).toBeDefined();
        expect(style.useCases.length).toBeGreaterThan(0);
        expect(style.fonts).toBeDefined();
        expect(style.fonts.length).toBeGreaterThan(0);
        expect(style.difficulty).toBeDefined();
        expect(style.popularity).toBeDefined();
        expect(style.sampleText).toBeDefined();
      });
    });

    it('all styles have at least one recommended font', () => {
      CALLIGRAPHY_STYLES.forEach((style) => {
        const hasRecommended = style.fonts.some((f) => f.recommended);
        expect(hasRecommended).toBe(true);
      });
    });
  });

  describe('getCalligraphyStyle', () => {
    it('returns style for valid ID', () => {
      const style = getCalligraphyStyle('naskh');
      expect(style).toBeDefined();
      expect(style?.id).toBe('naskh');
      expect(style?.name.english).toBe('Naskh');
    });

    it('returns correct Thuluth style', () => {
      const style = getCalligraphyStyle('thuluth');
      expect(style).toBeDefined();
      expect(style?.name.english).toBe('Thuluth');
      expect(style?.name.arabic).toBe('الثلث');
    });

    it('returns correct Diwani style', () => {
      const style = getCalligraphyStyle('diwani');
      expect(style).toBeDefined();
      expect(style?.era).toBe('ottoman');
    });

    it('returns undefined for invalid ID', () => {
      const style = getCalligraphyStyle('nonexistent' as any);
      expect(style).toBeUndefined();
    });

    it('returns Kufic with geometric characteristics', () => {
      const style = getCalligraphyStyle('kufi');
      expect(style).toBeDefined();
      expect(style?.characteristics).toContain('Geometric and angular');
      expect(style?.characteristics).toContain('Square proportions');
    });
  });

  describe('getCalligraphyStyles', () => {
    it('returns all styles without locale', () => {
      const styles = getCalligraphyStyles();
      expect(styles.length).toBe(10);
    });

    it('prioritizes Maghrebi for Moroccan locale', () => {
      const styles = getCalligraphyStyles('ar-ma');
      expect(styles[0].id).toBe('maghrebi');
    });

    it('prioritizes Maghrebi for Algerian locale', () => {
      const styles = getCalligraphyStyles('ar-dz');
      expect(styles[0].id).toBe('maghrebi');
    });

    it('prioritizes Nastaaliq for Persian locale', () => {
      const styles = getCalligraphyStyles('fa');
      expect(styles[0].id).toBe('nastaaliq');
    });

    it('prioritizes Nastaaliq for Urdu locale', () => {
      const styles = getCalligraphyStyles('ur');
      expect(styles[0].id).toBe('nastaaliq');
    });

    it('prioritizes Diwani for Turkish locale', () => {
      const styles = getCalligraphyStyles('tr');
      expect(styles[0].id).toBe('diwani');
    });

    it('returns all styles for general Arabic locale', () => {
      const styles = getCalligraphyStyles('ar');
      expect(styles.length).toBe(10);
    });
  });

  describe('getFontForStyle', () => {
    it('returns recommended font for Naskh', () => {
      const font = getFontForStyle('naskh');
      expect(font).toBeDefined();
      expect(font?.recommended).toBe(true);
    });

    it('returns Amiri for Naskh style', () => {
      const font = getFontForStyle('naskh');
      expect(font?.name).toBe('Amiri');
    });

    it('returns Aref Ruqaa for Ruqaa style', () => {
      const font = getFontForStyle('ruqaa');
      expect(font?.name).toBe('Aref Ruqaa');
    });

    it('returns Reem Kufi for Kufic style', () => {
      const font = getFontForStyle('kufi');
      expect(font?.name).toBe('Reem Kufi');
    });

    it('returns undefined for invalid style', () => {
      const font = getFontForStyle('nonexistent' as any);
      expect(font).toBeUndefined();
    });

    it('returns font with provider information', () => {
      const font = getFontForStyle('naskh');
      expect(font?.provider).toBeDefined();
      expect(['google', 'adobe', 'local', 'custom']).toContain(font?.provider);
    });
  });

  describe('getAllFontsForStyle', () => {
    it('returns all fonts for Naskh', () => {
      const fonts = getAllFontsForStyle('naskh');
      expect(fonts.length).toBeGreaterThanOrEqual(2);
    });

    it('returns array for all valid styles', () => {
      CALLIGRAPHY_STYLES.forEach((style) => {
        const fonts = getAllFontsForStyle(style.id);
        expect(Array.isArray(fonts)).toBe(true);
        expect(fonts.length).toBeGreaterThan(0);
      });
    });

    it('returns empty array for invalid style', () => {
      const fonts = getAllFontsForStyle('nonexistent' as any);
      expect(fonts).toEqual([]);
    });
  });

  describe('getStyleMetadata', () => {
    it('returns metadata for Naskh', () => {
      const metadata = getStyleMetadata('naskh');
      expect(metadata).toBeDefined();
      expect(metadata?.letterforms.alif).toBeDefined();
      expect(metadata?.proportions.lineHeight).toBeDefined();
    });

    it('returns metadata for all valid styles', () => {
      CALLIGRAPHY_STYLES.forEach((style) => {
        const metadata = getStyleMetadata(style.id);
        expect(metadata).toBeDefined();
        expect(metadata?.letterforms).toBeDefined();
        expect(metadata?.proportions).toBeDefined();
        expect(metadata?.rules).toBeDefined();
      });
    });

    it('returns correct proportions for Thuluth', () => {
      const metadata = getStyleMetadata('thuluth');
      expect(metadata?.proportions.lineHeight).toBe(2.5);
      expect(metadata?.proportions.letterSpacing).toBe('wide');
    });

    it('returns correct letterform descriptions', () => {
      const metadata = getStyleMetadata('kufi');
      expect(metadata?.letterforms.alif).toContain('Straight');
      expect(metadata?.letterforms.baa).toContain('Square');
    });

    it('returns undefined for invalid style', () => {
      const metadata = getStyleMetadata('nonexistent' as any);
      expect(metadata).toBeUndefined();
    });
  });

  describe('getStylesForUseCase', () => {
    it('returns styles for hero-section', () => {
      const styles = getStylesForUseCase('hero-section');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles.some((s) => s.id === 'thuluth')).toBe(true);
      expect(styles.some((s) => s.id === 'kufi')).toBe(true);
    });

    it('returns styles for quran', () => {
      const styles = getStylesForUseCase('quran');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles.some((s) => s.id === 'naskh')).toBe(true);
      expect(styles.some((s) => s.id === 'muhaqqaq')).toBe(true);
    });

    it('returns styles for decorative use', () => {
      const styles = getStylesForUseCase('decorative');
      expect(styles.length).toBeGreaterThan(0);
    });

    it('returns styles for logo', () => {
      const styles = getStylesForUseCase('logo');
      expect(styles.length).toBeGreaterThan(0);
    });
  });

  describe('getStylesByEra', () => {
    it('returns classical era styles', () => {
      const styles = getStylesByEra('classical');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles.some((s) => s.id === 'naskh')).toBe(true);
      expect(styles.some((s) => s.id === 'thuluth')).toBe(true);
    });

    it('returns ottoman era styles', () => {
      const styles = getStylesByEra('ottoman');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles.some((s) => s.id === 'diwani')).toBe(true);
      expect(styles.some((s) => s.id === 'ruqaa')).toBe(true);
    });

    it('returns maghrebi era styles', () => {
      const styles = getStylesByEra('maghrebi');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles[0].id).toBe('maghrebi');
    });
  });

  describe('getStylesByDifficulty', () => {
    it('returns beginner level styles', () => {
      const styles = getStylesByDifficulty('beginner');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles.some((s) => s.id === 'naskh')).toBe(true);
    });

    it('returns master level styles', () => {
      const styles = getStylesByDifficulty('master');
      expect(styles.length).toBeGreaterThan(0);
      expect(styles.some((s) => s.id === 'diwani')).toBe(true);
      expect(styles.some((s) => s.id === 'nastaaliq')).toBe(true);
    });
  });

  describe('getHeroStyles', () => {
    it('returns styles suitable for hero sections', () => {
      const styles = getHeroStyles();
      expect(styles.length).toBeGreaterThan(0);
    });

    it('includes Thuluth for hero sections', () => {
      const styles = getHeroStyles();
      expect(styles.some((s) => s.id === 'thuluth')).toBe(true);
    });

    it('includes Kufic for hero sections', () => {
      const styles = getHeroStyles();
      expect(styles.some((s) => s.id === 'kufi')).toBe(true);
    });
  });

  describe('generateFontFamily', () => {
    it('generates font family for Naskh', () => {
      const family = generateFontFamily('naskh');
      expect(family).toContain('Amiri');
      expect(family).toContain('Noto Sans Arabic');
    });

    it('generates font family for Kufic', () => {
      const family = generateFontFamily('kufi');
      expect(family).toContain('Reem Kufi');
    });

    it('generates Nastaaliq with appropriate fallback', () => {
      const family = generateFontFamily('nastaaliq');
      expect(family).toContain('Noto Nastaliq Urdu');
    });

    it('returns empty string for invalid style', () => {
      const family = generateFontFamily('nonexistent' as any);
      expect(family).toBe('');
    });
  });

  describe('getStyleNames', () => {
    it('returns names for Naskh', () => {
      const names = getStyleNames('naskh');
      expect(names).toBeDefined();
      expect(names?.english).toBe('Naskh');
      expect(names?.arabic).toBe('النسخ');
      expect(names?.transliteration).toBe('Nasḫ');
    });

    it('returns names for Thuluth', () => {
      const names = getStyleNames('thuluth');
      expect(names?.english).toBe('Thuluth');
      expect(names?.arabic).toBe('الثلث');
    });

    it('returns undefined for invalid style', () => {
      const names = getStyleNames('nonexistent' as any);
      expect(names).toBeUndefined();
    });
  });

  describe('searchStyles', () => {
    it('finds styles by English name', () => {
      const results = searchStyles('naskh');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.id === 'naskh')).toBe(true);
    });

    it('finds styles by Arabic name', () => {
      const results = searchStyles('النسخ');
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds styles by characteristic', () => {
      const results = searchStyles('geometric');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.id === 'kufi')).toBe(true);
    });

    it('finds styles by description keyword', () => {
      const results = searchStyles('quran');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty array for no matches', () => {
      const results = searchStyles('xyznonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('getAllGoogleFontsUrl', () => {
    it('returns valid Google Fonts URL', () => {
      const url = getAllGoogleFontsUrl();
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('family=');
    });

    it('includes display swap parameter', () => {
      const url = getAllGoogleFontsUrl();
      expect(url).toContain('display=swap');
    });

    it('contains multiple font families', () => {
      const url = getAllGoogleFontsUrl();
      const familyCount = (url.match(/family=/g) || []).length;
      expect(familyCount).toBeGreaterThan(1);
    });
  });

  describe('isStyleSuitableForLocale', () => {
    it('returns true for Naskh with any locale', () => {
      expect(isStyleSuitableForLocale('naskh', 'ar')).toBe(true);
      expect(isStyleSuitableForLocale('naskh', 'en')).toBe(true);
    });

    it('returns true for Nastaaliq with Persian locale', () => {
      expect(isStyleSuitableForLocale('nastaaliq', 'fa')).toBe(true);
      expect(isStyleSuitableForLocale('nastaaliq', 'fa-ir')).toBe(true);
    });

    it('returns false for Nastaaliq with Arabic locale', () => {
      expect(isStyleSuitableForLocale('nastaaliq', 'ar')).toBe(false);
      expect(isStyleSuitableForLocale('nastaaliq', 'ar-sa')).toBe(false);
    });

    it('returns true for Maghrebi with Moroccan locale', () => {
      expect(isStyleSuitableForLocale('maghrebi', 'ar-ma')).toBe(true);
    });

    it('returns true for Diwani with Turkish locale', () => {
      expect(isStyleSuitableForLocale('diwani', 'tr')).toBe(true);
    });

    it('returns true for Diwani with Arabic locale', () => {
      expect(isStyleSuitableForLocale('diwani', 'ar')).toBe(true);
    });
  });

  describe('Style Properties Validation', () => {
    it('all styles have valid era values', () => {
      const validEras = ['classical', 'ottoman', 'modern', 'maghrebi'];
      CALLIGRAPHY_STYLES.forEach((style) => {
        expect(validEras).toContain(style.era);
      });
    });

    it('all styles have valid difficulty values', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced', 'master'];
      CALLIGRAPHY_STYLES.forEach((style) => {
        expect(validDifficulties).toContain(style.difficulty);
      });
    });

    it('all styles have valid popularity values', () => {
      const validPopularities = ['common', 'popular', 'rare', 'specialized'];
      CALLIGRAPHY_STYLES.forEach((style) => {
        expect(validPopularities).toContain(style.popularity);
      });
    });

    it('all fonts have valid provider values', () => {
      const validProviders = ['google', 'adobe', 'local', 'custom'];
      CALLIGRAPHY_STYLES.forEach((style) => {
        style.fonts.forEach((font) => {
          expect(validProviders).toContain(font.provider);
        });
      });
    });

    it('all sample texts are in Arabic script', () => {
      CALLIGRAPHY_STYLES.forEach((style) => {
        expect(style.sampleText).toBeDefined();
        expect(style.sampleText.length).toBeGreaterThan(0);
        // Check for Arabic Unicode range
        const hasArabic = /[\u0600-\u06FF]/.test(style.sampleText);
        expect(hasArabic).toBe(true);
      });
    });
  });
});
