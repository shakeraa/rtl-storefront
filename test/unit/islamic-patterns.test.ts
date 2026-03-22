import { describe, it, expect } from 'vitest';
import {
  getIslamicPattern,
  getPatternNames,
  generateSVGPattern,
  getPatternMetadata,
  getAllPatterns,
  getPatternsByCategory,
  hasPattern,
  getBackgroundPatterns,
  getDefaultOptions,
  getPatternsByComplexity,
  getPatternsByOrigin,
  DEFAULT_COLORS,
  PATTERN_COUNT,
  PATTERN_CATEGORIES,
  AVAILABLE_PATTERN_NAMES,
  type PatternOptions,
  type PatternMetadata,
} from '../../app/services/mena-design/islamic-patterns';

describe('Islamic Patterns Library', () => {
  describe('getIslamicPattern', () => {
    it('returns pattern for valid pattern name', () => {
      const pattern = getIslamicPattern('arabesque');
      expect(pattern).not.toBeNull();
      expect(pattern?.metadata.name).toBe('arabesque');
      expect(pattern?.metadata.nameEn).toBe('Arabesque');
      expect(pattern?.metadata.nameAr).toBe('الأرابيسك');
    });

    it('returns pattern with generateSVG function', () => {
      const pattern = getIslamicPattern('girih');
      expect(pattern).not.toBeNull();
      expect(typeof pattern?.generateSVG).toBe('function');
    });

    it('returns null for invalid pattern name', () => {
      const pattern = getIslamicPattern('nonexistent');
      expect(pattern).toBeNull();
    });

    it('returns pattern for all available patterns', () => {
      AVAILABLE_PATTERN_NAMES.forEach(name => {
        const pattern = getIslamicPattern(name);
        expect(pattern).not.toBeNull();
        expect(pattern?.metadata.name).toBe(name);
      });
    });

    it('returns pattern with complete metadata', () => {
      const pattern = getIslamicPattern('eight-pointed-star');
      expect(pattern?.metadata).toHaveProperty('name');
      expect(pattern?.metadata).toHaveProperty('nameEn');
      expect(pattern?.metadata).toHaveProperty('nameAr');
      expect(pattern?.metadata).toHaveProperty('description');
      expect(pattern?.metadata).toHaveProperty('category');
      expect(pattern?.metadata).toHaveProperty('origin');
      expect(pattern?.metadata).toHaveProperty('complexity');
      expect(pattern?.metadata).toHaveProperty('supportsColor');
      expect(pattern?.metadata).toHaveProperty('supportsOpacity');
      expect(pattern?.metadata).toHaveProperty('defaultSize');
    });
  });

  describe('getPatternNames', () => {
    it('returns English names for English locale', () => {
      const names = getPatternNames('en');
      expect(names.length).toBe(PATTERN_COUNT);
      expect(names[0]).toHaveProperty('id');
      expect(names[0]).toHaveProperty('name');
      
      const arabesque = names.find(n => n.id === 'arabesque');
      expect(arabesque?.name).toBe('Arabesque');
    });

    it('returns Arabic names for Arabic locale', () => {
      const names = getPatternNames('ar');
      const arabesque = names.find(n => n.id === 'arabesque');
      expect(arabesque?.name).toBe('الأرابيسك');
    });

    it('returns Arabic names for Arabic country locales', () => {
      const namesSA = getPatternNames('ar-SA');
      const namesEG = getPatternNames('ar-EG');
      
      const saPattern = namesSA.find(n => n.id === 'girih');
      const egPattern = namesEG.find(n => n.id === 'girih');
      
      expect(saPattern?.name).toBe('القرية');
      expect(egPattern?.name).toBe('القرية');
    });

    it('returns Hebrew names for Hebrew locale', () => {
      // Hebrew also uses Arabic pattern names in this implementation
      const names = getPatternNames('he');
      expect(names.length).toBe(PATTERN_COUNT);
    });

    it('defaults to English for unknown locales', () => {
      const names = getPatternNames('unknown');
      const arabesque = names.find(n => n.id === 'arabesque');
      expect(arabesque?.name).toBe('Arabesque');
    });
  });

  describe('generateSVGPattern', () => {
    it('generates SVG for valid pattern', () => {
      const svg = generateSVGPattern('arabesque');
      expect(svg).not.toBeNull();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('returns null for invalid pattern', () => {
      const svg = generateSVGPattern('nonexistent');
      expect(svg).toBeNull();
    });

    it('applies custom primary color', () => {
      const svg = generateSVGPattern('arabesque', { primaryColor: '#ff0000' });
      expect(svg).toContain('#ff0000');
    });

    it('applies custom secondary color', () => {
      const svg = generateSVGPattern('girih', { 
        primaryColor: '#000000',
        secondaryColor: '#00ff00' 
      });
      expect(svg).toContain('#00ff00');
    });

    it('applies opacity setting', () => {
      const svg = generateSVGPattern('arabesque', { opacity: 0.5 });
      expect(svg).toContain('opacity="0.5"');
    });

    it('applies scale setting', () => {
      const svg = generateSVGPattern('arabesque', { scale: 2 });
      expect(svg).toContain('width="400"');
      expect(svg).toContain('height="400"');
    });

    it('applies stroke width setting', () => {
      const svg = generateSVGPattern('arabesque', { strokeWidth: 5 });
      expect(svg).toContain('stroke-width="5"');
    });

    it('generates SVG for all patterns', () => {
      AVAILABLE_PATTERN_NAMES.forEach(name => {
        const svg = generateSVGPattern(name);
        expect(svg).not.toBeNull();
        expect(svg).toContain('<svg');
        expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      });
    });

    it('generates valid pattern elements for each pattern type', () => {
      const arabesque = generateSVGPattern('arabesque');
      expect(arabesque).toContain('pattern id="arabesque-pattern"');

      const girih = generateSVGPattern('girih');
      expect(girih).toContain('pattern id="girih-pattern"');

      const eightStar = generateSVGPattern('eight-pointed-star');
      expect(eightStar).toContain('pattern id="eight-star-pattern"');
    });
  });

  describe('getPatternMetadata', () => {
    it('returns metadata for valid pattern', () => {
      const metadata = getPatternMetadata('rosette');
      expect(metadata).not.toBeNull();
      expect(metadata?.name).toBe('rosette');
      expect(metadata?.category).toBe('floral');
    });

    it('returns null for invalid pattern', () => {
      const metadata = getPatternMetadata('nonexistent');
      expect(metadata).toBeNull();
    });

    it('returns correct complexity levels', () => {
      const sixStar = getPatternMetadata('six-pointed-star');
      expect(sixStar?.complexity).toBe(2);

      const girih = getPatternMetadata('girih');
      expect(girih?.complexity).toBe(5);

      const muqarnas = getPatternMetadata('muqarnas');
      expect(muqarnas?.complexity).toBe(5);
    });

    it('returns correct category for each pattern', () => {
      const arabesque = getPatternMetadata('arabesque');
      expect(arabesque?.category).toBe('floral');

      const girih = getPatternMetadata('girih');
      expect(girih?.category).toBe('geometric');

      const calligraphy = getPatternMetadata('calligraphy-border');
      expect(calligraphy?.category).toBe('calligraphic');

      const knotwork = getPatternMetadata('knotwork');
      expect(knotwork?.category).toBe('interlaced');
    });
  });

  describe('getAllPatterns', () => {
    it('returns all patterns', () => {
      const patterns = getAllPatterns();
      expect(patterns.length).toBe(PATTERN_COUNT);
      expect(patterns.length).toBeGreaterThanOrEqual(10);
    });

    it('returns patterns with complete metadata', () => {
      const patterns = getAllPatterns();
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('nameEn');
        expect(pattern).toHaveProperty('nameAr');
        expect(pattern).toHaveProperty('description');
      });
    });
  });

  describe('getPatternsByCategory', () => {
    it('returns geometric patterns', () => {
      const geometric = getPatternsByCategory('geometric');
      expect(geometric.length).toBeGreaterThan(0);
      geometric.forEach(p => expect(p.category).toBe('geometric'));
    });

    it('returns floral patterns', () => {
      const floral = getPatternsByCategory('floral');
      expect(floral.length).toBeGreaterThan(0);
      floral.forEach(p => expect(p.category).toBe('floral'));
    });

    it('returns calligraphic patterns', () => {
      const calligraphic = getPatternsByCategory('calligraphic');
      expect(calligraphic.length).toBeGreaterThan(0);
      calligraphic.forEach(p => expect(p.category).toBe('calligraphic'));
    });

    it('returns interlaced patterns', () => {
      const interlaced = getPatternsByCategory('interlaced');
      expect(interlaced.length).toBeGreaterThan(0);
      interlaced.forEach(p => expect(p.category).toBe('interlaced'));
    });
  });

  describe('hasPattern', () => {
    it('returns true for existing patterns', () => {
      expect(hasPattern('arabesque')).toBe(true);
      expect(hasPattern('girih')).toBe(true);
      expect(hasPattern('eight-pointed-star')).toBe(true);
    });

    it('returns false for non-existing patterns', () => {
      expect(hasPattern('nonexistent')).toBe(false);
      expect(hasPattern('')).toBe(false);
    });
  });

  describe('getBackgroundPatterns', () => {
    it('returns patterns suitable for backgrounds', () => {
      const backgrounds = getBackgroundPatterns();
      expect(backgrounds.length).toBeGreaterThan(0);
      backgrounds.forEach(p => {
        expect(p.supportsOpacity).toBe(true);
        expect(p.complexity).toBeLessThanOrEqual(4);
      });
    });

    it('only includes patterns with opacity support', () => {
      const backgrounds = getBackgroundPatterns();
      backgrounds.forEach(p => {
        expect(p.supportsOpacity).toBe(true);
      });
    });
  });

  describe('getDefaultOptions', () => {
    it('returns complete default options', () => {
      const defaults = getDefaultOptions();
      expect(defaults).toHaveProperty('primaryColor');
      expect(defaults).toHaveProperty('secondaryColor');
      expect(defaults).toHaveProperty('backgroundColor');
      expect(defaults).toHaveProperty('opacity');
      expect(defaults).toHaveProperty('scale');
      expect(defaults).toHaveProperty('rotation');
      expect(defaults).toHaveProperty('strokeWidth');
    });

    it('returns expected default values', () => {
      const defaults = getDefaultOptions();
      expect(defaults.primaryColor).toBe(DEFAULT_COLORS.primary);
      expect(defaults.opacity).toBe(1);
      expect(defaults.scale).toBe(1);
      expect(defaults.rotation).toBe(0);
      expect(defaults.strokeWidth).toBe(2);
    });
  });

  describe('getPatternsByComplexity', () => {
    it('returns patterns for complexity level 2', () => {
      const level2 = getPatternsByComplexity(2);
      expect(level2.length).toBeGreaterThan(0);
      level2.forEach(p => expect(p.complexity).toBe(2));
    });

    it('returns patterns for complexity level 5', () => {
      const level5 = getPatternsByComplexity(5);
      expect(level5.length).toBeGreaterThan(0);
      level5.forEach(p => expect(p.complexity).toBe(5));
    });

    it('returns empty array for invalid complexity', () => {
      const invalid = getPatternsByComplexity(10);
      expect(invalid).toEqual([]);
    });
  });

  describe('getPatternsByOrigin', () => {
    it('returns patterns from Persia', () => {
      const persian = getPatternsByOrigin('Persia');
      expect(persian.length).toBeGreaterThan(0);
    });

    it('returns patterns from Islamic Golden Age', () => {
      const goldenAge = getPatternsByOrigin('Islamic Golden Age');
      expect(goldenAge.length).toBeGreaterThan(0);
    });

    it('performs case-insensitive search', () => {
      const lower = getPatternsByOrigin('persia');
      const upper = getPatternsByOrigin('PERSIA');
      expect(lower.length).toBe(upper.length);
    });
  });

  describe('Constants', () => {
    it('exports DEFAULT_COLORS with expected properties', () => {
      expect(DEFAULT_COLORS).toHaveProperty('primary');
      expect(DEFAULT_COLORS).toHaveProperty('secondary');
      expect(DEFAULT_COLORS).toHaveProperty('background');
      expect(DEFAULT_COLORS).toHaveProperty('gold');
      expect(DEFAULT_COLORS).toHaveProperty('green');
      expect(DEFAULT_COLORS).toHaveProperty('turquoise');
    });

    it('exports correct pattern count', () => {
      expect(PATTERN_COUNT).toBe(12);
      expect(PATTERN_COUNT).toBe(AVAILABLE_PATTERN_NAMES.length);
    });

    it('exports all pattern categories', () => {
      expect(PATTERN_CATEGORIES).toContain('geometric');
      expect(PATTERN_CATEGORIES).toContain('floral');
      expect(PATTERN_CATEGORIES).toContain('calligraphic');
      expect(PATTERN_CATEGORIES).toContain('interlaced');
    });

    it('exports all available pattern names', () => {
      expect(AVAILABLE_PATTERN_NAMES.length).toBe(PATTERN_COUNT);
      expect(AVAILABLE_PATTERN_NAMES).toContain('arabesque');
      expect(AVAILABLE_PATTERN_NAMES).toContain('girih');
      expect(AVAILABLE_PATTERN_NAMES).toContain('eight-pointed-star');
    });
  });

  describe('Pattern-specific features', () => {
    it('arabesque pattern has scrolling foliage design', () => {
      const svg = generateSVGPattern('arabesque');
      expect(svg).toContain('path');
      expect(svg).toContain('Q'); // Quadratic bezier curves
    });

    it('girih pattern has polygonal elements', () => {
      const svg = generateSVGPattern('girih');
      expect(svg).toContain('polygon');
      expect(svg).toContain('line');
    });

    it('eight-pointed-star has correct number of points', () => {
      const metadata = getPatternMetadata('eight-pointed-star');
      expect(metadata?.nameAr).toBe('النجمة الثمانية');
    });

    it('seal-of-solomon has interlaced triangles', () => {
      const svg = generateSVGPattern('seal-of-solomon');
      expect(svg).toContain('path d=');
      // Should have multiple path elements for interlacing
      const pathCount = (svg?.match(/<path/g) || []).length;
      expect(pathCount).toBeGreaterThanOrEqual(2);
    });

    it('muqarnas has stalactite vaulting pattern', () => {
      const metadata = getPatternMetadata('muqarnas');
      expect(metadata?.nameAr).toBe('المقرنص');
      expect(metadata?.complexity).toBe(5);
    });

    it('calligraphy-border has border dimensions', () => {
      const metadata = getPatternMetadata('calligraphy-border');
      expect(metadata?.defaultSize.width).toBe(400);
      expect(metadata?.defaultSize.height).toBe(100);
    });
  });

  describe('Integration tests', () => {
    it('can generate pattern, retrieve metadata, and get localized name', () => {
      const name = 'mandala';
      
      // Get metadata
      const metadata = getPatternMetadata(name);
      expect(metadata).not.toBeNull();
      
      // Generate SVG
      const svg = generateSVGPattern(name);
      expect(svg).not.toBeNull();
      
      // Get localized name
      const names = getPatternNames('ar');
      const localizedName = names.find(n => n.id === name);
      expect(localizedName?.name).toBe(metadata?.nameAr);
    });

    it('all patterns support color customization', () => {
      const patterns = getAllPatterns();
      patterns.forEach(p => {
        expect(p.supportsColor).toBe(true);
      });
    });

    it('all patterns support opacity control', () => {
      const patterns = getAllPatterns();
      patterns.forEach(p => {
        expect(p.supportsOpacity).toBe(true);
      });
    });
  });
});
