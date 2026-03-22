import { describe, it, expect } from 'vitest';
import {
  UNICODE_RANGES,
  getUnicodeRange,
  getUnicodeRanges,
  getScriptForLocale,
  getScriptsForLocale,
  detectScriptsInContent,
  getRequiredSubsets,
  getFontSubsetUrl,
  generateSubsetFileName,
  generateFontFaceCSS,
  generateOptimizedFontCSS,
  getFontLoadingStrategy,
  generatePreloadLinks,
  calculateSubsetSavings,
  validateSubsetConfig,
  getRecommendedSubsetConfig,
  createSubsetManifest,
  type FontSubsetConfig,
  type ScriptType,
} from '../../app/services/performance/font-subsetting';

describe('Font Subsetting Service', () => {
  describe('UNICODE_RANGES', () => {
    it('contains Arabic range definition', () => {
      expect(UNICODE_RANGES.arabic).toBeDefined();
      expect(UNICODE_RANGES.arabic.name).toBe('Arabic');
      expect(UNICODE_RANGES.arabic.ranges).toContain('U+0600-06FF');
    });

    it('contains Hebrew range definition', () => {
      expect(UNICODE_RANGES.hebrew).toBeDefined();
      expect(UNICODE_RANGES.hebrew.name).toBe('Hebrew');
      expect(UNICODE_RANGES.hebrew.ranges).toContain('U+0590-05FF');
    });

    it('contains Latin range definition', () => {
      expect(UNICODE_RANGES.latin).toBeDefined();
      expect(UNICODE_RANGES.latin.name).toBe('Latin');
      expect(UNICODE_RANGES.latin.ranges).toContain('U+0000-007F');
    });

    it('contains Common symbols range definition', () => {
      expect(UNICODE_RANGES.common).toBeDefined();
      expect(UNICODE_RANGES.common.ranges).toContain('U+2000-206F');
    });

    it('Arabic range includes extended Unicode blocks', () => {
      expect(UNICODE_RANGES.arabic.ranges).toContain('U+0750-077F');
      expect(UNICODE_RANGES.arabic.ranges).toContain('U+FB50-FDFF');
      expect(UNICODE_RANGES.arabic.ranges).toContain('U+FE70-FEFF');
    });

    it('Hebrew range includes presentation forms', () => {
      expect(UNICODE_RANGES.hebrew.ranges).toContain('U+FB1D-FB4F');
    });
  });

  describe('getUnicodeRange', () => {
    it('returns Arabic Unicode range', () => {
      const range = getUnicodeRange('arabic');
      expect(range).toContain('U+0600-06FF');
      expect(range).toContain('U+0750-077F');
    });

    it('returns Hebrew Unicode range', () => {
      const range = getUnicodeRange('hebrew');
      expect(range).toContain('U+0590-05FF');
      expect(range).toContain('U+FB1D-FB4F');
    });

    it('returns Latin Unicode range', () => {
      const range = getUnicodeRange('latin');
      expect(range).toContain('U+0000-007F');
      expect(range).toContain('U+0080-00FF');
    });

    it('returns empty string for invalid script', () => {
      const range = getUnicodeRange('invalid' as ScriptType);
      expect(range).toBe('');
    });
  });

  describe('getUnicodeRanges', () => {
    it('combines multiple script ranges', () => {
      const ranges = getUnicodeRanges(['arabic', 'latin']);
      expect(ranges).toContain('U+0600-06FF');
      expect(ranges).toContain('U+0000-007F');
    });

    it('returns single range for one script', () => {
      const ranges = getUnicodeRanges(['hebrew']);
      expect(ranges).toContain('U+0590-05FF');
    });

    it('deduplicates overlapping ranges', () => {
      const ranges = getUnicodeRanges(['latin', 'latin']);
      const occurrences = ranges.split('U+0000-007F').length - 1;
      expect(occurrences).toBe(1);
    });
  });

  describe('getScriptForLocale', () => {
    it('returns arabic for Arabic locales', () => {
      expect(getScriptForLocale('ar')).toBe('arabic');
      expect(getScriptForLocale('ar-SA')).toBe('arabic');
      expect(getScriptForLocale('ar-EG')).toBe('arabic');
      expect(getScriptForLocale('fa')).toBe('arabic');
      expect(getScriptForLocale('ur')).toBe('arabic');
    });

    it('returns hebrew for Hebrew locales', () => {
      expect(getScriptForLocale('he')).toBe('hebrew');
      expect(getScriptForLocale('he-IL')).toBe('hebrew');
      expect(getScriptForLocale('iw')).toBe('hebrew');
    });

    it('returns latin for English locales', () => {
      expect(getScriptForLocale('en')).toBe('latin');
      expect(getScriptForLocale('en-US')).toBe('latin');
      expect(getScriptForLocale('en-GB')).toBe('latin');
    });

    it('returns latin for European locales', () => {
      expect(getScriptForLocale('de')).toBe('latin');
      expect(getScriptForLocale('fr')).toBe('latin');
      expect(getScriptForLocale('es')).toBe('latin');
    });

    it('defaults to latin for unknown locales', () => {
      expect(getScriptForLocale('xyz')).toBe('latin');
    });
  });

  describe('getScriptsForLocale', () => {
    it('includes latin with Arabic locale for mixed content', () => {
      const scripts = getScriptsForLocale('ar');
      expect(scripts).toContain('arabic');
      expect(scripts).toContain('latin');
      expect(scripts).toContain('common');
    });

    it('includes latin with Hebrew locale for mixed content', () => {
      const scripts = getScriptsForLocale('he');
      expect(scripts).toContain('hebrew');
      expect(scripts).toContain('latin');
    });

    it('includes common symbols for all locales', () => {
      const latinScripts = getScriptsForLocale('en');
      expect(latinScripts).toContain('common');
      
      const arabicScripts = getScriptsForLocale('ar');
      expect(arabicScripts).toContain('common');
    });
  });

  describe('detectScriptsInContent', () => {
    it('detects Arabic script in content', () => {
      const scripts = detectScriptsInContent('مرحبا بالعالم');
      expect(scripts).toContain('arabic');
    });

    it('detects Hebrew script in content', () => {
      const scripts = detectScriptsInContent('שלום עולם');
      expect(scripts).toContain('hebrew');
    });

    it('detects Latin script in content', () => {
      const scripts = detectScriptsInContent('Hello World');
      expect(scripts).toContain('latin');
    });

    it('detects multiple scripts in mixed content', () => {
      const scripts = detectScriptsInContent('Hello مرحبا שלום');
      expect(scripts).toContain('arabic');
      expect(scripts).toContain('hebrew');
      expect(scripts).toContain('latin');
    });

    it('returns empty array for empty content', () => {
      const scripts = detectScriptsInContent('');
      expect(scripts).toHaveLength(0);
    });
  });

  describe('getRequiredSubsets', () => {
    it('returns Arabic subset for Arabic content', () => {
      const subsets = getRequiredSubsets('مرحبا');
      expect(subsets).toContain('arabic');
    });

    it('returns Hebrew subset for Hebrew content', () => {
      const subsets = getRequiredSubsets('שלום');
      expect(subsets).toContain('hebrew');
    });

    it('returns Latin for content without specific script', () => {
      const subsets = getRequiredSubsets('');
      expect(subsets).toContain('latin');
    });

    it('includes common symbols when content exists', () => {
      const subsets = getRequiredSubsets('Hello');
      expect(subsets).toContain('common');
    });
  });

  describe('getFontSubsetUrl', () => {
    it('generates URL for Arabic font', () => {
      const url = getFontSubsetUrl('cairo', 'ar');
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('Cairo');
      expect(url).toContain('arabic');
    });

    it('generates URL for Hebrew font', () => {
      const url = getFontSubsetUrl('heebo', 'he');
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('Heebo');
      expect(url).toContain('hebrew');
    });

    it('generates URL for Latin font', () => {
      const url = getFontSubsetUrl('inter', 'en');
      expect(url).toContain('fonts.googleapis.com');
      expect(url).toContain('inter');
    });

    it('includes multiple scripts for RTL locales', () => {
      const url = getFontSubsetUrl('noto-sans-arabic', 'ar');
      expect(url).toContain('display=swap');
    });
  });

  describe('generateSubsetFileName', () => {
    it('generates basic file name', () => {
      const name = generateSubsetFileName({
        family: 'Noto Sans Arabic',
        weight: 400,
      });
      expect(name).toBe('noto-sans-arabic-latin.woff2');
    });

    it('includes weight when not 400', () => {
      const name = generateSubsetFileName({
        family: 'Cairo',
        weight: 700,
      });
      expect(name).toBe('cairo-latin-700.woff2');
    });

    it('includes italic style', () => {
      const name = generateSubsetFileName({
        family: 'Inter',
        weight: 400,
        style: 'italic',
      });
      expect(name).toBe('inter-latin-italic.woff2');
    });

    it('includes version when provided', () => {
      const name = generateSubsetFileName({
        family: 'Cairo',
        weight: 400,
        version: '22',
        script: 'arabic',
      });
      expect(name).toBe('cairo-v22-arabic.woff2');
    });

    it('uses specified format', () => {
      const name = generateSubsetFileName({
        family: 'Font',
        weight: 400,
        format: 'woff',
      });
      expect(name).toBe('font-latin.woff');
    });
  });

  describe('generateFontFaceCSS', () => {
    it('generates @font-face declaration', () => {
      const css = generateFontFaceCSS('Cairo', [
        {
          family: 'Cairo',
          scripts: ['arabic'],
          weights: [400, 700],
        },
      ]);
      expect(css).toContain('@font-face');
      expect(css).toContain("font-family: 'Cairo'");
      expect(css).toContain('font-weight: 400');
      expect(css).toContain('font-weight: 700');
      expect(css).toContain('unicode-range');
    });

    it('includes unicode range for specified scripts', () => {
      const css = generateFontFaceCSS('Test', [
        {
          family: 'Test',
          scripts: ['latin'],
          weights: [400],
        },
      ]);
      expect(css).toContain('U+0000-007F');
    });

    it('uses swap display strategy by default', () => {
      const css = generateFontFaceCSS('Test', [
        {
          family: 'Test',
          scripts: ['latin'],
          weights: [400],
        },
      ]);
      expect(css).toContain('font-display: swap');
    });
  });

  describe('generateOptimizedFontCSS', () => {
    it('generates CSS with multiple font families', () => {
      const css = generateOptimizedFontCSS([
        {
          family: 'Cairo',
          scripts: ['arabic'],
          weights: [400, 700],
        },
        {
          family: 'Inter',
          scripts: ['latin'],
          weights: [400, 600],
        },
      ]);
      expect(css).toContain('--font-cairo');
      expect(css).toContain('--font-inter');
      expect(css).toContain('@font-face');
    });

    it('generates CSS variables for all fonts', () => {
      const css = generateOptimizedFontCSS([
        {
          family: 'Test Font',
          scripts: ['latin'],
          weights: [400],
        },
      ]);
      expect(css).toContain('--font-test-font');
    });
  });

  describe('getFontLoadingStrategy', () => {
    it('returns preload for critical content', () => {
      expect(getFontLoadingStrategy(true, false)).toBe('preload');
      expect(getFontLoadingStrategy(true, true)).toBe('preload');
    });

    it('returns prefetch for RTL non-critical content', () => {
      expect(getFontLoadingStrategy(false, true)).toBe('prefetch');
    });

    it('returns lazy for LTR non-critical content', () => {
      expect(getFontLoadingStrategy(false, false)).toBe('lazy');
    });
  });

  describe('generatePreloadLinks', () => {
    it('generates preload link tags', () => {
      const links = generatePreloadLinks('Cairo', [
        {
          family: 'Cairo',
          scripts: ['arabic'],
          weights: [400, 700],
        },
      ]);
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toContain('rel="preload"');
      expect(links[0]).toContain('as="font"');
      expect(links[0]).toContain('type="font/woff2"');
    });

    it('limits to first 2 weights', () => {
      const links = generatePreloadLinks('Test', [
        {
          family: 'Test',
          scripts: ['latin'],
          weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        },
      ]);
      expect(links.length).toBe(2);
    });
  });

  describe('calculateSubsetSavings', () => {
    it('calculates savings for Arabic subset', () => {
      const result = calculateSubsetSavings(100000, ['arabic']);
      expect(result.savingsPercent).toBeGreaterThan(0);
      expect(result.estimatedSize).toBeLessThan(100000);
    });

    it('calculates savings for Hebrew subset', () => {
      const result = calculateSubsetSavings(100000, ['hebrew']);
      expect(result.savingsPercent).toBeGreaterThan(0);
      expect(result.estimatedSize).toBeLessThan(100000);
    });

    it('calculates lower savings for multiple scripts', () => {
      const singleScript = calculateSubsetSavings(100000, ['latin']);
      const multiScript = calculateSubsetSavings(100000, ['latin', 'latinExtended']);
      expect(multiScript.savingsPercent).toBeLessThan(singleScript.savingsPercent);
    });

    it('caps savings at reasonable maximum', () => {
      const result = calculateSubsetSavings(100000, ['latin']);
      expect(result.savingsPercent).toBeLessThan(100);
    });
  });

  describe('validateSubsetConfig', () => {
    it('validates correct config', () => {
      const config: FontSubsetConfig = {
        family: 'Test Font',
        scripts: ['latin'],
        weights: [400, 700],
      };
      const result = validateSubsetConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails for empty family', () => {
      const config: FontSubsetConfig = {
        family: '',
        scripts: ['latin'],
        weights: [400],
      };
      const result = validateSubsetConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Font family is required');
    });

    it('fails for missing scripts', () => {
      const config: FontSubsetConfig = {
        family: 'Test',
        scripts: [],
        weights: [400],
      };
      const result = validateSubsetConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one script must be specified');
    });

    it('fails for invalid script', () => {
      const config: FontSubsetConfig = {
        family: 'Test',
        scripts: ['invalid' as ScriptType],
        weights: [400],
      };
      const result = validateSubsetConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid script: invalid');
    });

    it('fails for missing weights', () => {
      const config: FontSubsetConfig = {
        family: 'Test',
        scripts: ['latin'],
        weights: [],
      };
      const result = validateSubsetConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one weight must be specified');
    });

    it('fails for invalid weight values', () => {
      const config: FontSubsetConfig = {
        family: 'Test',
        scripts: ['latin'],
        weights: [350, 950],
      };
      const result = validateSubsetConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid weight'))).toBe(true);
    });
  });

  describe('getRecommendedSubsetConfig', () => {
    it('returns RTL config for Arabic locale', () => {
      const config = getRecommendedSubsetConfig('ar');
      expect(config.scripts).toContain('arabic');
      expect(config.scripts).toContain('latin');
      expect(config.display).toBe('swap');
    });

    it('returns RTL config for Hebrew locale', () => {
      const config = getRecommendedSubsetConfig('he');
      expect(config.scripts).toContain('hebrew');
      expect(config.display).toBe('swap');
    });

    it('returns LTR config for English locale', () => {
      const config = getRecommendedSubsetConfig('en');
      expect(config.scripts).toContain('latin');
      expect(config.display).toBe('optional');
    });

    it('includes recommended weights', () => {
      const config = getRecommendedSubsetConfig('ar');
      expect(config.weights).toContain(400);
      expect(config.weights).toContain(600);
      expect(config.weights).toContain(700);
    });
  });

  describe('createSubsetManifest', () => {
    it('creates manifest with version and timestamp', () => {
      const manifest = createSubsetManifest([
        {
          family: 'Test Font',
          scripts: ['latin'],
          weights: [400],
        },
      ]);
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.generated).toBeDefined();
      expect(manifest.subsets).toBeDefined();
    });

    it('includes font family in manifest', () => {
      const manifest = createSubsetManifest([
        {
          family: 'Cairo',
          scripts: ['arabic'],
          weights: [400, 700],
        },
      ]);
      expect(manifest.subsets.cairo).toBeDefined();
      expect(manifest.subsets.cairo.family).toBe('Cairo');
    });

    it('includes generated file names', () => {
      const manifest = createSubsetManifest([
        {
          family: 'Test',
          scripts: ['latin'],
          weights: [400, 700],
        },
      ]);
      const subset = manifest.subsets.test as { files: string[] };
      expect(subset.files).toHaveLength(2);
      expect(subset.files[0]).toContain('.woff2');
    });

    it('includes unicode ranges', () => {
      const manifest = createSubsetManifest([
        {
          family: 'Test',
          scripts: ['latin', 'latinExtended'],
          weights: [400],
        },
      ]);
      const subset = manifest.subsets.test as { unicodeRanges: string[][] };
      expect(subset.unicodeRanges.length).toBe(2);
    });
  });
});
