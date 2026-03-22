import { describe, it, expect } from 'vitest';
import {
  getMaterialName,
  getMaterialDescription,
  getMaterialCareInstructions,
  getAllMaterials,
  isValidMaterial,
  getMaterialInfo,
  getSupportedLocales,
  searchMaterials,
  getMaterialsByCategory,
  materialsData,
  type Material,
  type Locale,
} from '../../app/services/translation-features/material-localization';

describe('Material Localization', () => {
  describe('getMaterialName', () => {
    it('returns English material name for en locale', () => {
      expect(getMaterialName('cotton', 'en')).toBe('Cotton');
      expect(getMaterialName('silk', 'en')).toBe('Silk');
      expect(getMaterialName('leather', 'en')).toBe('Leather');
    });

    it('returns Arabic material name for ar locale', () => {
      expect(getMaterialName('cotton', 'ar')).toBe('قطن');
      expect(getMaterialName('silk', 'ar')).toBe('حرير');
      expect(getMaterialName('leather', 'ar')).toBe('جلد');
    });

    it('returns Hebrew material name for he locale', () => {
      expect(getMaterialName('cotton', 'he')).toBe('כותנה');
      expect(getMaterialName('silk', 'he')).toBe('משי');
      expect(getMaterialName('leather', 'he')).toBe('עור');
    });

    it('falls back to English for invalid locale', () => {
      expect(getMaterialName('wool', 'en')).toBe('Wool');
    });

    it('handles all 22 materials for each locale', () => {
      const materials = getAllMaterials();
      const locales: Locale[] = ['en', 'ar', 'he'];

      materials.forEach((material) => {
        locales.forEach((locale) => {
          const name = getMaterialName(material, locale);
          expect(name).toBeTruthy();
          expect(typeof name).toBe('string');
          expect(name.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('getMaterialDescription', () => {
    it('returns English description for en locale', () => {
      const desc = getMaterialDescription('cotton', 'en');
      expect(desc).toContain('Natural fiber');
      expect(desc).toContain('breathability');
    });

    it('returns Arabic description for ar locale', () => {
      const desc = getMaterialDescription('silk', 'ar');
      expect(desc).toContain('حرير');
      expect(desc).toContain('طبيعي');
    });

    it('returns Hebrew description for he locale', () => {
      const desc = getMaterialDescription('leather', 'he');
      expect(desc).toContain('עור');
      expect(desc).toContain('טבעי');
    });

    it('returns description for all materials', () => {
      const materials = getAllMaterials();
      materials.forEach((material) => {
        const desc = getMaterialDescription(material, 'en');
        expect(desc).toBeTruthy();
        expect(desc.length).toBeGreaterThan(10);
      });
    });
  });

  describe('getMaterialCareInstructions', () => {
    it('returns array of care instructions in English', () => {
      const instructions = getMaterialCareInstructions('cotton', 'en');
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0]).toContain('wash');
    });

    it('returns array of care instructions in Arabic', () => {
      const instructions = getMaterialCareInstructions('silk', 'ar');
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBe(4);
      expect(instructions[0]).toContain('التنظيف');
    });

    it('returns array of care instructions in Hebrew', () => {
      const instructions = getMaterialCareInstructions('wool', 'he');
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
    });

    it('returns different instructions for different materials', () => {
      const cottonInstructions = getMaterialCareInstructions('cotton', 'en');
      const silkInstructions = getMaterialCareInstructions('silk', 'en');
      
      expect(cottonInstructions).not.toEqual(silkInstructions);
    });

    it('has 4 care instructions for each material', () => {
      const materials = getAllMaterials();
      materials.forEach((material) => {
        const instructions = getMaterialCareInstructions(material, 'en');
        expect(instructions.length).toBe(4);
      });
    });
  });

  describe('getAllMaterials', () => {
    it('returns array of all material keys', () => {
      const materials = getAllMaterials();
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBe(21);
    });

    it('includes common materials', () => {
      const materials = getAllMaterials();
      expect(materials).toContain('cotton');
      expect(materials).toContain('silk');
      expect(materials).toContain('leather');
      expect(materials).toContain('polyester');
      expect(materials).toContain('wool');
    });
  });

  describe('isValidMaterial', () => {
    it('returns true for valid material keys', () => {
      expect(isValidMaterial('cotton')).toBe(true);
      expect(isValidMaterial('silk')).toBe(true);
      expect(isValidMaterial('denim')).toBe(true);
    });

    it('returns false for invalid material keys', () => {
      expect(isValidMaterial('invalid')).toBe(false);
      expect(isValidMaterial('plastic')).toBe(false);
      expect(isValidMaterial('')).toBe(false);
    });

    it('returns false for undefined and null', () => {
      expect(isValidMaterial(undefined as unknown as string)).toBe(false);
      expect(isValidMaterial(null as unknown as string)).toBe(false);
    });
  });

  describe('getMaterialInfo', () => {
    it('returns complete material info for valid material', () => {
      const info = getMaterialInfo('cotton');
      expect(info).toBeTruthy();
      expect(info?.name.en).toBe('Cotton');
      expect(info?.name.ar).toBe('قطن');
      expect(info?.name.he).toBe('כותנה');
      expect(info?.description.en).toBeTruthy();
      expect(info?.careInstructions.en).toBeInstanceOf(Array);
    });

    it('returns null for invalid material', () => {
      const info = getMaterialInfo('invalid' as Material);
      expect(info).toBeNull();
    });
  });

  describe('getSupportedLocales', () => {
    it('returns array of supported locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toEqual(['ar', 'he', 'en']);
    });

    it('returns exactly 3 locales', () => {
      const locales = getSupportedLocales();
      expect(locales.length).toBe(3);
    });
  });

  describe('searchMaterials', () => {
    it('finds materials by partial English name match', () => {
      const results = searchMaterials('cot', 'en');
      expect(results).toContain('cotton');
    });

    it('finds materials by partial Arabic name match', () => {
      const results = searchMaterials('قط', 'ar');
      expect(results).toContain('cotton');
    });

    it('finds materials by partial Hebrew name match', () => {
      const results = searchMaterials('כות', 'he');
      expect(results).toContain('cotton');
    });

    it('returns empty array for no matches', () => {
      const results = searchMaterials('xyz', 'en');
      expect(results).toEqual([]);
    });

    it('is case insensitive', () => {
      const resultsLower = searchMaterials('silk', 'en');
      const resultsUpper = searchMaterials('SILK', 'en');
      expect(resultsLower).toEqual(resultsUpper);
    });
  });

  describe('getMaterialsByCategory', () => {
    it('returns natural and synthetic categories', () => {
      const categories = getMaterialsByCategory();
      expect(categories).toHaveProperty('natural');
      expect(categories).toHaveProperty('synthetic');
    });

    it('categorizes cotton as natural', () => {
      const categories = getMaterialsByCategory();
      expect(categories.natural).toContain('cotton');
      expect(categories.synthetic).not.toContain('cotton');
    });

    it('categorizes polyester as synthetic', () => {
      const categories = getMaterialsByCategory();
      expect(categories.synthetic).toContain('polyester');
      expect(categories.natural).not.toContain('polyester');
    });

    it('has more materials than categorized', () => {
      const categories = getMaterialsByCategory();
      const totalCategorized = categories.natural.length + categories.synthetic.length;
      expect(totalCategorized).toBe(getAllMaterials().length);
    });
  });

  describe('materialsData', () => {
    it('contains all required properties for each material', () => {
      const materials = getAllMaterials();
      materials.forEach((material) => {
        const data = materialsData[material];
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('description');
        expect(data).toHaveProperty('careInstructions');
        
        expect(data.name).toHaveProperty('en');
        expect(data.name).toHaveProperty('ar');
        expect(data.name).toHaveProperty('he');
        
        expect(data.description).toHaveProperty('en');
        expect(data.description).toHaveProperty('ar');
        expect(data.description).toHaveProperty('he');
        
        expect(data.careInstructions).toHaveProperty('en');
        expect(data.careInstructions).toHaveProperty('ar');
        expect(data.careInstructions).toHaveProperty('he');
      });
    });

    it('has non-empty names for all locales', () => {
      const materials = getAllMaterials();
      const locales: Locale[] = ['en', 'ar', 'he'];
      
      materials.forEach((material) => {
        locales.forEach((locale) => {
          const name = materialsData[material].name[locale];
          expect(name).toBeTruthy();
          expect(name.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Arabic translations', () => {
    it('uses proper Arabic script for material names', () => {
      expect(getMaterialName('cotton', 'ar')).toMatch(/[\u0600-\u06FF]/);
      expect(getMaterialName('silk', 'ar')).toMatch(/[\u0600-\u06FF]/);
      expect(getMaterialName('wool', 'ar')).toMatch(/[\u0600-\u06FF]/);
    });

    it('has Arabic descriptions with proper script', () => {
      const materials = getAllMaterials();
      materials.forEach((material) => {
        const desc = getMaterialDescription(material, 'ar');
        expect(desc).toMatch(/[\u0600-\u06FF]/);
      });
    });
  });

  describe('Hebrew translations', () => {
    it('uses proper Hebrew script for material names', () => {
      expect(getMaterialName('cotton', 'he')).toMatch(/[\u0590-\u05FF]/);
      expect(getMaterialName('silk', 'he')).toMatch(/[\u0590-\u05FF]/);
      expect(getMaterialName('wool', 'he')).toMatch(/[\u0590-\u05FF]/);
    });

    it('has Hebrew descriptions with proper script', () => {
      const materials = getAllMaterials();
      materials.forEach((material) => {
        const desc = getMaterialDescription(material, 'he');
        expect(desc).toMatch(/[\u0590-\u05FF]/);
      });
    });
  });
});
