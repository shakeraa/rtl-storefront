import { describe, it, expect } from 'vitest';
import {
  getFashionTerm,
  searchFashionTerms,
  getFashionCategories,
  getTermsByCategory,
  getTermsBySubcategory,
  getAllTerms,
  getTermCount,
  getArabicTranslation,
  getFashionByCategory,
  FASHION_DATABASE,
  CATEGORY_METADATA,
  type FashionLocale,
  type FashionCategory,
} from '../../app/services/fashion-db';

describe('Fashion Terminology Database - T0063', () => {
  describe('Database Integrity', () => {
    it('should have 80+ fashion terms in database', () => {
      expect(FASHION_DATABASE.length).toBeGreaterThanOrEqual(80);
    });

    it('should have correct term count', () => {
      expect(getTermCount()).toBe(FASHION_DATABASE.length);
      expect(getTermCount()).toBeGreaterThanOrEqual(80);
    });

    it('should have unique IDs for all terms', () => {
      const ids = FASHION_DATABASE.map((entry) => entry.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required fields for each term', () => {
      for (const entry of FASHION_DATABASE) {
        expect(entry.id).toBeDefined();
        expect(entry.english).toBeDefined();
        expect(entry.arabic).toBeDefined();
        expect(entry.hebrew).toBeDefined();
        expect(entry.category).toBeDefined();
        expect(entry.searchTerms).toBeDefined();
        expect(Array.isArray(entry.searchTerms)).toBe(true);
      }
    });

    it('should have non-empty search terms for all entries', () => {
      for (const entry of FASHION_DATABASE) {
        expect(entry.searchTerms.length).toBeGreaterThan(0);
      }
    });

    it('should have descriptions for most terms', () => {
      const withDescription = FASHION_DATABASE.filter((e) => e.description);
      expect(withDescription.length).toBeGreaterThan(FASHION_DATABASE.length * 0.8);
    });
  });

  describe('Category Coverage', () => {
    it('should have traditional_wear category with abaya, kaftan, thobe terms', () => {
      const traditional = getTermsByCategory('traditional_wear');
      expect(traditional.length).toBeGreaterThanOrEqual(20);
      
      const abayaTerms = traditional.filter((t) => t.subcategory === 'abaya');
      const kaftanTerms = traditional.filter((t) => t.subcategory === 'kaftan');
      const thobeTerms = traditional.filter((t) => t.subcategory === 'thobe');
      
      expect(abayaTerms.length).toBeGreaterThanOrEqual(6);
      expect(kaftanTerms.length).toBeGreaterThanOrEqual(5);
      expect(thobeTerms.length).toBeGreaterThanOrEqual(4);
    });

    it('should have modest_fashion category with hijab-related terms', () => {
      const modest = getTermsByCategory('modest_fashion');
      expect(modest.length).toBeGreaterThanOrEqual(5);
    });

    it('should have fabrics category with 10+ fabric types', () => {
      const fabrics = getTermsByCategory('fabrics');
      expect(fabrics.length).toBeGreaterThanOrEqual(10);
    });

    it('should have colors category with color names in Arabic and Hebrew', () => {
      const colors = getTermsByCategory('colors');
      expect(colors.length).toBeGreaterThanOrEqual(8);
      
      const black = colors.find((c) => c.id === 'color-black');
      expect(black).toBeDefined();
      expect(black!.arabic).toBe('أسود');
      expect(black!.hebrew).toBe('שחור');
    });

    it('should have sizes category with MENA size terminology', () => {
      const sizes = getTermsByCategory('sizes');
      expect(sizes.length).toBeGreaterThanOrEqual(6);
      
      const length52 = sizes.find((s) => s.id === 'size-length-52');
      expect(length52).toBeDefined();
      expect(length52!.english).toContain('52');
    });

    it('should have bridal category with wedding terms', () => {
      const bridal = getTermsByCategory('bridal');
      expect(bridal.length).toBeGreaterThanOrEqual(4);
    });

    it('should have seasonal category with Eid and Ramadan terms', () => {
      const seasonal = getTermsByCategory('seasonal');
      expect(seasonal.length).toBeGreaterThanOrEqual(4);
      
      const eidTerms = seasonal.filter((s) => s.subcategory === 'eid');
      const ramadanTerms = seasonal.filter((s) => s.subcategory === 'ramadan');
      
      expect(eidTerms.length).toBeGreaterThanOrEqual(1);
      expect(ramadanTerms.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Arabic Fashion Terminology', () => {
    it('should have correct Arabic abaya terminology', () => {
      const classicAbaya = getFashionTerm('abaya-classic', 'ar');
      expect(classicAbaya).toBeDefined();
      expect(classicAbaya!.term).toBe('عباءة كلاسيكية');
      expect(classicAbaya!.arabic).toBe('عباءة كلاسيكية');
    });

    it('should have correct Arabic hijab terminology', () => {
      const squareHijab = getFashionTerm('hijab-square', 'ar');
      expect(squareHijab!.term).toBe('حجاب مربع');
      
      const chiffonHijab = getFashionTerm('hijab-chiffon', 'ar');
      expect(chiffonHijab!.term).toBe('حجاب شيفون');
    });

    it('should have correct Arabic kaftan terminology', () => {
      const moroccanKaftan = getFashionTerm('kaftan-moroccan', 'ar');
      expect(moroccanKaftan!.term).toBe('قفطان مغربي');
      
      const khaleejiKaftan = getFashionTerm('kaftan-khaleeji', 'ar');
      expect(khaleejiKaftan!.term).toBe('قفطان خليجي');
    });

    it('should have correct Arabic fabric names', () => {
      const nida = getFashionTerm('fabric-nida', 'ar');
      expect(nida!.term).toBe('قماش نيدا');
      
      const silk = getFashionTerm('fabric-silk', 'ar');
      expect(silk!.term).toBe('حرير');
      
      const cotton = getFashionTerm('fabric-cotton', 'ar');
      expect(cotton!.term).toBe('قطن');
    });

    it('should have correct Arabic color names', () => {
      const white = getFashionTerm('color-white', 'ar');
      expect(white!.term).toBe('أبيض');
      
      const gold = getFashionTerm('color-gold', 'ar');
      expect(gold!.term).toBe('ذهبي');
    });

    it('should include dialect variants where applicable', () => {
      const classicAbaya = FASHION_DATABASE.find((e) => e.id === 'abaya-classic');
      expect(classicAbaya).toBeDefined();
      expect(classicAbaya!.dialects).toBeDefined();
      expect(classicAbaya!.dialects!.gulf).toBeDefined();
    });
  });

  describe('Hebrew Fashion Terminology', () => {
    it('should have correct Hebrew abaya terminology', () => {
      const classicAbaya = getFashionTerm('abaya-classic', 'he');
      expect(classicAbaya).toBeDefined();
      expect(classicAbaya!.term).toBe('עבאיה קלאסית');
      expect(classicAbaya!.hebrew).toBe('עבאיה קלאסית');
    });

    it('should have correct Hebrew hijab terminology', () => {
      const squareHijab = getFashionTerm('hijab-square', 'he');
      expect(squareHijab!.term).toBe("חיג'אב מרובע");
      
      const chiffonHijab = getFashionTerm('hijab-chiffon', 'he');
      expect(chiffonHijab!.term).toBe("חיג'אב שיפון");
    });

    it('should have correct Hebrew kaftan terminology', () => {
      const moroccanKaftan = getFashionTerm('kaftan-moroccan', 'he');
      expect(moroccanKaftan!.term).toBe('קפטן מרוקאי');
    });

    it('should have correct Hebrew fabric names', () => {
      const linen = getFashionTerm('fabric-linen', 'he');
      expect(linen!.term).toBe('פשתן');
      
      const silk = getFashionTerm('fabric-silk', 'he');
      expect(silk!.term).toBe('משי');
      
      const cotton = getFashionTerm('fabric-cotton', 'he');
      expect(cotton!.term).toBe('כותנה');
    });

    it('should have correct Hebrew color names', () => {
      const black = getFashionTerm('color-black', 'he');
      expect(black!.term).toBe('שחור');
      
      const white = getFashionTerm('color-white', 'he');
      expect(white!.term).toBe('לבן');
      
      const gold = getFashionTerm('color-gold', 'he');
      expect(gold!.term).toBe('זהב');
    });

    it('should have correct Hebrew size terminology', () => {
      const plusSize = getFashionTerm('size-plus', 'he');
      expect(plusSize!.term).toBe('מידות פלוס');
      
      const freeSize = getFashionTerm('size-free', 'he');
      expect(freeSize!.term).toBe('מידה חופשית');
    });
  });

  describe('getFashionTerm', () => {
    it('should return term in English by default', () => {
      const term = getFashionTerm('abaya-classic');
      expect(term).toBeDefined();
      expect(term!.term).toBe('Classic Abaya');
      expect(term!.english).toBe('Classic Abaya');
      expect(term!.arabic).toBe('عباءة كلاسيكية');
      expect(term!.hebrew).toBe('עבאיה קלאסית');
    });

    it('should return term in Arabic when locale is ar', () => {
      const term = getFashionTerm('hijab-square', 'ar');
      expect(term!.term).toBe('حجاب مربع');
    });

    it('should return term in Hebrew when locale is he', () => {
      const term = getFashionTerm('kaftan-moroccan', 'he');
      expect(term!.term).toBe('קפטן מרוקאי');
    });

    it('should return term in English when locale is en', () => {
      const term = getFashionTerm('fabric-nida', 'en');
      expect(term!.term).toBe('Nida Fabric');
    });

    it('should return null for non-existent term', () => {
      const term = getFashionTerm('non-existent-id');
      expect(term).toBeNull();
    });

    it('should include all required fields in result', () => {
      const term = getFashionTerm('abaya-embroidered');
      expect(term!.id).toBe('abaya-embroidered');
      expect(term!.category).toBe('traditional_wear');
      expect(term!.subcategory).toBe('abaya');
      expect(term!.description).toBeDefined();
    });
  });

  describe('searchFashionTerms', () => {
    it('should return empty array for empty query', () => {
      expect(searchFashionTerms('')).toEqual([]);
      expect(searchFashionTerms('   ')).toEqual([]);
    });

    it('should search by English term', () => {
      const results = searchFashionTerms('abaya');
      expect(results.length).toBeGreaterThan(5);
      expect(results.some((r) => r.english.includes('Abaya'))).toBe(true);
    });

    it('should search by Arabic term', () => {
      const results = searchFashionTerms('عباءة');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by Hebrew term', () => {
      const results = searchFashionTerms('עבאיה');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return localized results based on locale', () => {
      const arResults = searchFashionTerms('hijab', 'ar');
      expect(arResults.length).toBeGreaterThan(0);
      expect(arResults[0].term).toBe(arResults[0].arabic);
      
      const heResults = searchFashionTerms('hijab', 'he');
      expect(heResults.length).toBeGreaterThan(0);
      expect(heResults[0].term).toBe(heResults[0].hebrew);
    });

    it('should prioritize exact matches', () => {
      const results = searchFashionTerms('Classic Abaya');
      expect(results[0].id).toBe('abaya-classic');
    });

    it('should support partial matches', () => {
      const results = searchFashionTerms('sport');
      expect(results.some((r) => r.english.toLowerCase().includes('sport'))).toBe(true);
    });

    it('should search across search terms', () => {
      const results = searchFashionTerms('butterfly');
      expect(results.some((r) => r.id === 'abaya-butterfly')).toBe(true);
    });

    it('should handle fabric searches', () => {
      const results = searchFashionTerms('silk');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle color searches', () => {
      const results = searchFashionTerms('gold');
      expect(results.some((r) => r.category === 'colors')).toBe(true);
    });
  });

  describe('getFashionCategories', () => {
    it('should return all 10 categories', () => {
      const categories = getFashionCategories();
      expect(categories.length).toBe(10);
    });

    it('should return categories with English names by default', () => {
      const categories = getFashionCategories('en');
      expect(categories.some((c) => c.name === 'Traditional Wear')).toBe(true);
      expect(categories.some((c) => c.name === 'Colors')).toBe(true);
      expect(categories.some((c) => c.name === 'Sizes')).toBe(true);
    });

    it('should return categories with Arabic names', () => {
      const categories = getFashionCategories('ar');
      expect(categories.some((c) => c.name === 'الملابس التقليدية')).toBe(true);
      expect(categories.some((c) => c.name === 'ألوان')).toBe(true);
      expect(categories.some((c) => c.name === 'مقاسات')).toBe(true);
    });

    it('should return categories with Hebrew names', () => {
      const categories = getFashionCategories('he');
      expect(categories.some((c) => c.name === 'לבוש מסורתי')).toBe(true);
      expect(categories.some((c) => c.name === 'צבעים')).toBe(true);
      expect(categories.some((c) => c.name === 'מידות')).toBe(true);
    });

    it('should include subcategories where applicable', () => {
      const categories = getFashionCategories();
      const traditional = categories.find((c) => c.id === 'traditional_wear');
      expect(traditional).toBeDefined();
      expect(traditional!.subcategories).toBeDefined();
      expect(traditional!.subcategories!.length).toBeGreaterThan(0);
    });

    it('should have all translations for each category', () => {
      const categories = getFashionCategories();
      for (const cat of categories) {
        expect(cat.english).toBeDefined();
        expect(cat.arabic).toBeDefined();
        expect(cat.hebrew).toBeDefined();
      }
    });
  });

  describe('getTermsByCategory', () => {
    it('should return terms for a specific category', () => {
      const fabrics = getTermsByCategory('fabrics');
      expect(fabrics.length).toBeGreaterThan(5);
      expect(fabrics.every((f) => f.category === 'fabrics')).toBe(true);
    });

    it('should return localized terms', () => {
      const arFabrics = getTermsByCategory('fabrics', 'ar');
      expect(arFabrics[0].term).toBe(arFabrics[0].arabic);
      
      const heFabrics = getTermsByCategory('fabrics', 'he');
      expect(heFabrics[0].term).toBe(heFabrics[0].hebrew);
    });

    it('should return empty array for category with no terms', () => {
      const terms = getTermsByCategory('nonexistent' as FashionCategory);
      expect(terms).toEqual([]);
    });
  });

  describe('getTermsBySubcategory', () => {
    it('should return terms for abaya subcategory', () => {
      const abayas = getTermsBySubcategory('abaya');
      expect(abayas.length).toBeGreaterThanOrEqual(6);
    });

    it('should return terms for kaftan subcategory', () => {
      const kaftans = getTermsBySubcategory('kaftan');
      expect(kaftans.length).toBeGreaterThanOrEqual(5);
    });

    it('should return terms for hijab subcategory', () => {
      const hijabs = getTermsBySubcategory('hijab');
      expect(hijabs.length).toBeGreaterThanOrEqual(8);
    });

    it('should return localized terms', () => {
      const arAbayas = getTermsBySubcategory('abaya', 'ar');
      expect(arAbayas[0].term).toBe(arAbayas[0].arabic);
    });
  });

  describe('Legacy API Functions', () => {
    it('should get Arabic translation using legacy function', () => {
      const translation = getArabicTranslation('Classic Abaya');
      expect(translation).toBe('عباءة كلاسيكية');
    });

    it('should get dialect translation using legacy function', () => {
      const translation = getArabicTranslation('Classic Abaya', 'gulf');
      expect(translation).toBe('عباية كلاسيك');
    });

    it('should return null for unknown term in legacy function', () => {
      const translation = getArabicTranslation('Nonexistent Term');
      expect(translation).toBeNull();
    });

    it('should get fashion by category using legacy function', () => {
      const fabrics = getFashionByCategory('fabrics');
      expect(fabrics.length).toBeGreaterThan(5);
    });
  });

  describe('Specific Terminology - Acceptance Criteria', () => {
    it('should have Abaya terminology with variants', () => {
      const abayaVariants = [
        'abaya-classic',
        'abaya-open-front',
        'abaya-butterfly',
        'abaya-kimono',
        'abaya-embroidered',
        'abaya-sports',
      ];
      
      for (const id of abayaVariants) {
        const term = getFashionTerm(id);
        expect(term).toBeDefined();
        expect(term!.subcategory).toBe('abaya');
      }
    });

    it('should have Kaftan terminology with variants', () => {
      const kaftanVariants = [
        'kaftan-moroccan',
        'kaftan-khaleeji',
        'kaftan-modern',
        'kaftan-wedding',
        'kaftan-evening',
      ];
      
      for (const id of kaftanVariants) {
        const term = getFashionTerm(id);
        expect(term).toBeDefined();
        expect(term!.subcategory).toBe('kaftan');
      }
    });

    it('should have Hijab terminology with styles', () => {
      const hijabStyles = [
        'hijab-square',
        'hijab-pashmina',
        'hijab-instant',
        'hijab-jersey',
        'hijab-chiffon',
        'hijab-turban',
      ];
      
      for (const id of hijabStyles) {
        const term = getFashionTerm(id);
        expect(term).toBeDefined();
      }
    });

    it('should have fabric names in Arabic', () => {
      const fabrics = getTermsByCategory('fabrics', 'ar');
      const fabricNames = fabrics.map((f) => f.term);
      
      expect(fabricNames).toContain('قماش نيدا');
      expect(fabricNames).toContain('حرير');
      expect(fabricNames).toContain('قطن');
      expect(fabricNames).toContain('كتان');
    });

    it('should have color names in Arabic', () => {
      const colors = getTermsByCategory('colors', 'ar');
      const colorNames = colors.map((c) => c.term);
      
      expect(colorNames).toContain('أسود');
      expect(colorNames).toContain('أبيض');
      expect(colorNames).toContain('ذهبي');
      expect(colorNames).toContain('فضي');
    });

    it('should have size terminology for MENA region', () => {
      const sizes = getTermsByCategory('sizes');
      
      expect(sizes.some((s) => s.id === 'size-small')).toBe(true);
      expect(sizes.some((s) => s.id === 'size-medium')).toBe(true);
      expect(sizes.some((s) => s.id === 'size-large')).toBe(true);
      expect(sizes.some((s) => s.id === 'size-plus')).toBe(true);
      expect(sizes.some((s) => s.english.includes('52 Inch'))).toBe(true);
      expect(sizes.some((s) => s.english.includes('56 Inch'))).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should get all terms', () => {
      const allTerms = getAllTerms();
      expect(allTerms.length).toBe(FASHION_DATABASE.length);
    });

    it('should return a copy of all terms (not reference)', () => {
      const allTerms = getAllTerms();
      allTerms[0].english = 'Modified';
      expect(FASHION_DATABASE[0].english).not.toBe('Modified');
    });
  });

  describe('CATEGORY_METADATA', () => {
    it('should have metadata for all categories', () => {
      const categories = Object.keys(CATEGORY_METADATA) as FashionCategory[];
      expect(categories.length).toBe(10);
      
      for (const cat of categories) {
        expect(CATEGORY_METADATA[cat].english).toBeDefined();
        expect(CATEGORY_METADATA[cat].arabic).toBeDefined();
        expect(CATEGORY_METADATA[cat].hebrew).toBeDefined();
      }
    });

    it('should have correct translations for traditional_wear', () => {
      const meta = CATEGORY_METADATA.traditional_wear;
      expect(meta.english).toBe('Traditional Wear');
      expect(meta.arabic).toBe('الملابس التقليدية');
      expect(meta.hebrew).toBe('לבוש מסורתי');
    });

    it('should have correct translations for modest_fashion', () => {
      const meta = CATEGORY_METADATA.modest_fashion;
      expect(meta.english).toBe('Modest Fashion');
      expect(meta.arabic).toBe('الأزياء المحتشمة');
      expect(meta.hebrew).toBe('אופנה צנועה');
    });
  });
});
