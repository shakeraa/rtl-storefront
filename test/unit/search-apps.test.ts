import { describe, it, expect } from 'vitest';
import {
  getSearchLabels,
  getAutocompleteLabels,
  getFilterLabels,
  getSearchFilters,
  getNoResultsContent,
  getPopularSearches,
  getRecentSearches,
  generateAutocompleteSuggestions,
  getSortOptions,
  formatResultsCount,
  getSearchAccessibilityAttrs,
  isValidSearchQuery,
  sanitizeSearchQuery,
  getSearchIntegrationConfig,
  getRTLSearchAdjustments,
  formatSearchSuggestion,
  ARABIC_SEARCH_LABELS,
  HEBREW_SEARCH_LABELS,
  ENGLISH_SEARCH_LABELS,
  ARABIC_AUTOCOMPLETE_LABELS,
  HEBREW_AUTOCOMPLETE_LABELS,
  ENGLISH_AUTOCOMPLETE_LABELS,
  ARABIC_FILTER_LABELS,
  HEBREW_FILTER_LABELS,
  ENGLISH_FILTER_LABELS,
  ARABIC_SEARCH_FILTERS,
  HEBREW_SEARCH_FILTERS,
  ENGLISH_SEARCH_FILTERS,
  POPULAR_SEARCHES,
  SEARCH_TIPS,
} from '../../app/services/integrations/search-apps';

describe('Search Apps Integration - T0219', () => {
  describe('Search Labels - getSearchLabels()', () => {
    it('should return Arabic search labels for ar locale', () => {
      const labels = getSearchLabels('ar');
      expect(labels.searchPlaceholder).toBe('البحث عن منتجات، ماركات، فئات...');
      expect(labels.searchButton).toBe('بحث');
      expect(labels.clearSearch).toBe('مسح البحث');
      expect(labels.voiceSearch).toBe('بحث صوتي');
      expect(labels.imageSearch).toBe('بحث بالصورة');
    });

    it('should return Hebrew search labels for he locale', () => {
      const labels = getSearchLabels('he');
      expect(labels.searchPlaceholder).toBe('חיפוש מוצרים, מותגים, קטגוריות...');
      expect(labels.searchButton).toBe('חיפוש');
      expect(labels.clearSearch).toBe('נקה חיפוש');
      expect(labels.voiceSearch).toBe('חיפוש קולי');
      expect(labels.imageSearch).toBe('חיפוש לפי תמונה');
    });

    it('should return English search labels for en locale', () => {
      const labels = getSearchLabels('en');
      expect(labels.searchPlaceholder).toBe('Search for products, brands, categories...');
      expect(labels.searchButton).toBe('Search');
      expect(labels.clearSearch).toBe('Clear Search');
      expect(labels.advancedSearch).toBe('Advanced Search');
    });

    it('should handle locale with region code', () => {
      const labels = getSearchLabels('ar-SA');
      expect(labels.searchPlaceholder).toBe('البحث عن منتجات، ماركات، فئات...');
      expect(labels.searchResults).toBe('نتائج البحث');
    });

    it('should default to English for unknown locale', () => {
      const labels = getSearchLabels('fr');
      expect(labels.searchPlaceholder).toBe('Search for products, brands, categories...');
      expect(labels.searchButton).toBe('Search');
    });

    it('should have all required search label keys in Arabic', () => {
      const labels = ARABIC_SEARCH_LABELS;
      expect(labels.searchPlaceholder).toBeDefined();
      expect(labels.searchButton).toBeDefined();
      expect(labels.clearSearch).toBeDefined();
      expect(labels.searchResults).toBeDefined();
      expect(labels.searching).toBeDefined();
      expect(labels.recentSearches).toBeDefined();
      expect(labels.popularSearches).toBeDefined();
      expect(labels.trendingNow).toBeDefined();
      expect(labels.voiceSearch).toBeDefined();
      expect(labels.imageSearch).toBeDefined();
      expect(labels.advancedSearch).toBeDefined();
    });

    it('should have all required search label keys in Hebrew', () => {
      const labels = HEBREW_SEARCH_LABELS;
      expect(labels.searchPlaceholder).toBeDefined();
      expect(labels.searchButton).toBeDefined();
      expect(labels.clearSearch).toBeDefined();
      expect(labels.searchResults).toBeDefined();
      expect(labels.searching).toBeDefined();
      expect(labels.voiceSearch).toBeDefined();
      expect(labels.imageSearch).toBeDefined();
    });
  });

  describe('Autocomplete Labels - getAutocompleteLabels()', () => {
    it('should return Arabic autocomplete labels for ar locale', () => {
      const labels = getAutocompleteLabels('ar');
      expect(labels.suggestions).toBe('اقتراحات');
      expect(labels.products).toBe('المنتجات');
      expect(labels.collections).toBe('المجموعات');
      expect(labels.seeAllResults).toBe('عرض جميع النتائج');
      expect(labels.minimumCharacters).toBe('الحد الأدنى 3 أحرف');
    });

    it('should return Hebrew autocomplete labels for he locale', () => {
      const labels = getAutocompleteLabels('he');
      expect(labels.suggestions).toBe('הצעות');
      expect(labels.products).toBe('מוצרים');
      expect(labels.collections).toBe('קולקציות');
      expect(labels.seeAllResults).toBe('הצג את כל התוצאות');
      expect(labels.minimumCharacters).toBe('מינימום 3 תווים');
    });

    it('should return English autocomplete labels for en locale', () => {
      const labels = getAutocompleteLabels('en');
      expect(labels.suggestions).toBe('Suggestions');
      expect(labels.products).toBe('Products');
      expect(labels.collections).toBe('Collections');
      expect(labels.seeAllResults).toBe('See All Results');
    });

    it('should handle ar-EG locale', () => {
      const labels = getAutocompleteLabels('ar-EG');
      expect(labels.suggestions).toBe('اقتراحات');
      expect(labels.noSuggestions).toBe('لا توجد اقتراحات');
    });

    it('should default to English for unknown locale', () => {
      const labels = getAutocompleteLabels('es');
      expect(labels.suggestions).toBe('Suggestions');
      expect(labels.products).toBe('Products');
    });

    it('should have all autocomplete label keys in all locales', () => {
      const arabicLabels = ARABIC_AUTOCOMPLETE_LABELS;
      const hebrewLabels = HEBREW_AUTOCOMPLETE_LABELS;
      const englishLabels = ENGLISH_AUTOCOMPLETE_LABELS;
      
      const keys = ['suggestions', 'products', 'collections', 'pages', 'articles', 'seeAllResults', 'noSuggestions', 'typeToSearch', 'minimumCharacters'];
      
      keys.forEach((key) => {
        expect(arabicLabels[key as keyof typeof arabicLabels]).toBeDefined();
        expect(hebrewLabels[key as keyof typeof hebrewLabels]).toBeDefined();
        expect(englishLabels[key as keyof typeof englishLabels]).toBeDefined();
      });
    });
  });

  describe('Filter Labels - getFilterLabels()', () => {
    it('should return Arabic filter labels for ar locale', () => {
      const labels = getFilterLabels('ar');
      expect(labels.sortBy).toBe('ترتيب حسب');
      expect(labels.relevance).toBe('الأكثر صلة');
      expect(labels.priceLowToHigh).toBe('السعر: من الأقل للأعلى');
      expect(labels.priceHighToLow).toBe('السعر: من الأعلى للأقل');
      expect(labels.clearAll).toBe('مسح الكل');
    });

    it('should return Hebrew filter labels for he locale', () => {
      const labels = getFilterLabels('he');
      expect(labels.sortBy).toBe('מיין לפי');
      expect(labels.relevance).toBe('רלוונטיות');
      expect(labels.priceLowToHigh).toBe('מחיר: מהנמוך לגבוה');
      expect(labels.priceHighToLow).toBe('מחיר: מהגבוה לנמוך');
      expect(labels.clearAll).toBe('נקה הכל');
    });

    it('should return English filter labels for en locale', () => {
      const labels = getFilterLabels('en');
      expect(labels.sortBy).toBe('Sort by');
      expect(labels.relevance).toBe('Relevance');
      expect(labels.bestSelling).toBe('Best Selling');
      expect(labels.highestRated).toBe('Highest Rated');
    });

    it('should have all filter label keys defined', () => {
      const arabicLabels = ARABIC_FILTER_LABELS;
      const hebrewLabels = HEBREW_FILTER_LABELS;
      const englishLabels = ENGLISH_FILTER_LABELS;
      
      const keys = ['sortBy', 'relevance', 'newest', 'priceLowToHigh', 'priceHighToLow', 'bestSelling', 'highestRated', 'alphabetical', 'filterBy', 'clearAll', 'applyFilters', 'resultsCount', 'showingResults'];
      
      keys.forEach((key) => {
        expect(arabicLabels[key as keyof typeof arabicLabels]).toBeDefined();
        expect(hebrewLabels[key as keyof typeof hebrewLabels]).toBeDefined();
        expect(englishLabels[key as keyof typeof englishLabels]).toBeDefined();
      });
    });
  });

  describe('Search Filters - getSearchFilters()', () => {
    it('should return Arabic search filter labels for ar locale', () => {
      const filters = getSearchFilters('ar');
      expect(filters.categories).toBe('الفئات');
      expect(filters.brands).toBe('الماركات');
      expect(filters.priceRange).toBe('نطاق السعر');
      expect(filters.availability).toBe('توفر المنتج');
      expect(filters.color).toBe('اللون');
      expect(filters.size).toBe('المقاس');
      expect(filters.material).toBe('الخامة');
    });

    it('should return Hebrew search filter labels for he locale', () => {
      const filters = getSearchFilters('he');
      expect(filters.categories).toBe('קטגוריות');
      expect(filters.brands).toBe('מותגים');
      expect(filters.priceRange).toBe('טווח מחירים');
      expect(filters.availability).toBe('זמינות מוצר');
      expect(filters.color).toBe('צבע');
      expect(filters.size).toBe('מידה');
      expect(filters.material).toBe('חומר');
    });

    it('should return English search filter labels for en locale', () => {
      const filters = getSearchFilters('en');
      expect(filters.categories).toBe('Categories');
      expect(filters.brands).toBe('Brands');
      expect(filters.priceRange).toBe('Price Range');
      expect(filters.availability).toBe('Availability');
      expect(filters.ratings).toBe('Ratings');
      expect(filters.tags).toBe('Tags');
    });

    it('should have all search filter keys defined', () => {
      const arabicFilters = ARABIC_SEARCH_FILTERS;
      const hebrewFilters = HEBREW_SEARCH_FILTERS;
      const englishFilters = ENGLISH_SEARCH_FILTERS;
      
      const keys = ['categories', 'brands', 'priceRange', 'availability', 'ratings', 'tags', 'color', 'size', 'material'];
      
      keys.forEach((key) => {
        expect(arabicFilters[key as keyof typeof arabicFilters]).toBeDefined();
        expect(hebrewFilters[key as keyof typeof hebrewFilters]).toBeDefined();
        expect(englishFilters[key as keyof typeof englishFilters]).toBeDefined();
      });
    });
  });

  describe('No Results Content - getNoResultsContent()', () => {
    it('should return Arabic no results content', () => {
      const content = getNoResultsContent('test query', 'ar');
      expect(content.title).toBe('لم يتم العثور على نتائج');
      expect(content.message).toContain('test query');
      expect(content.suggestionTitle).toBe('حاول ما يلي:');
      expect(content.contactSupport).toBe('تواصل مع الدعم');
      expect(content.browseCategories).toBe('تصفح الفئات');
      expect(content.clearFilters).toBe('مسح عوامل التصفية');
      expect(content.modifySearch).toBe('تعديل البحث');
    });

    it('should return Hebrew no results content', () => {
      const content = getNoResultsContent('test query', 'he');
      expect(content.title).toBe('לא נמצאו תוצאות');
      expect(content.message).toContain('test query');
      expect(content.suggestionTitle).toBe('נסה את הדברים הבאים:');
      expect(content.contactSupport).toBe('צור קשר עם תמיכה');
      expect(content.browseCategories).toBe('עיין בקטגוריות');
      expect(content.clearFilters).toBe('נקה מסננים');
      expect(content.modifySearch).toBe('שנה חיפוש');
    });

    it('should return English no results content', () => {
      const content = getNoResultsContent('test query', 'en');
      expect(content.title).toBe('No Results Found');
      expect(content.message).toContain('test query');
      expect(content.suggestionTitle).toBe('Try the following:');
      expect(content.contactSupport).toBe('Contact Support');
      expect(content.browseCategories).toBe('Browse Categories');
    });

    it('should include search tips in no results content', () => {
      const arabicContent = getNoResultsContent('test', 'ar');
      expect(arabicContent.searchTips.length).toBeGreaterThan(0);
      expect(arabicContent.searchTips[0]).toBe('تحقق من الإملاء');
      
      const hebrewContent = getNoResultsContent('test', 'he');
      expect(hebrewContent.searchTips.length).toBeGreaterThan(0);
      expect(hebrewContent.searchTips[0]).toBe('בדוק את האיות');
      
      const englishContent = getNoResultsContent('test', 'en');
      expect(englishContent.searchTips.length).toBeGreaterThan(0);
      expect(englishContent.searchTips[0]).toBe('Check your spelling');
    });

    it('should default to English for unknown locale', () => {
      const content = getNoResultsContent('test query', 'unknown');
      expect(content.title).toBe('No Results Found');
    });
  });

  describe('Popular Searches - getPopularSearches()', () => {
    it('should return Arabic popular searches', () => {
      const searches = getPopularSearches('ar');
      expect(searches.length).toBeGreaterThan(0);
      expect(searches).toContain('فستان');
      expect(searches).toContain('حذاء');
      expect(searches).toContain('عطر');
    });

    it('should return Hebrew popular searches', () => {
      const searches = getPopularSearches('he');
      expect(searches.length).toBeGreaterThan(0);
      expect(searches).toContain('שמלה');
      expect(searches).toContain('נעליים');
      expect(searches).toContain('בושם');
    });

    it('should return English popular searches', () => {
      const searches = getPopularSearches('en');
      expect(searches.length).toBeGreaterThan(0);
      expect(searches).toContain('dress');
      expect(searches).toContain('shoes');
      expect(searches).toContain('perfume');
    });

    it('should respect limit parameter', () => {
      const searches = getPopularSearches('en', 3);
      expect(searches.length).toBe(3);
    });

    it('should default to English for unknown locale', () => {
      const searches = getPopularSearches('unknown');
      expect(searches.length).toBeGreaterThan(0);
      expect(searches).toContain('dress');
    });
  });

  describe('Recent Searches - getRecentSearches()', () => {
    it('should return Arabic recent searches', () => {
      const searches = getRecentSearches('ar');
      expect(searches.length).toBeGreaterThan(0);
      expect(searches).toContain('فستان أسود');
    });

    it('should return Hebrew recent searches', () => {
      const searches = getRecentSearches('he');
      expect(searches.length).toBeGreaterThan(0);
      expect(searches).toContain('שמלה שחורה');
    });

    it('should return English recent searches', () => {
      const searches = getRecentSearches('en');
      expect(searches.length).toBeGreaterThan(0);
      expect(searches).toContain('black dress');
    });

    it('should respect limit parameter', () => {
      const searches = getRecentSearches('en', 2);
      expect(searches.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Generate Autocomplete Suggestions - generateAutocompleteSuggestions()', () => {
    it('should generate suggestions with query', () => {
      const suggestions = generateAutocompleteSuggestions('shoe', 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].type).toBe('query');
      expect(suggestions[0].title).toContain('shoe');
    });

    it('should include product suggestions', () => {
      const options = {
        products: [
          { title: 'Running Shoes', url: '/products/running-shoes', price: 99.99 },
          { title: 'Casual Shoes', url: '/products/casual-shoes', price: 79.99 },
        ],
      };
      const suggestions = generateAutocompleteSuggestions('shoe', 'en', options);
      const productSuggestions = suggestions.filter((s) => s.type === 'product');
      expect(productSuggestions.length).toBe(2);
      expect(productSuggestions[0].title).toBe('Running Shoes');
      expect(productSuggestions[0].price).toBe(99.99);
    });

    it('should include collection suggestions', () => {
      const options = {
        collections: [
          { title: 'Summer Collection', url: '/collections/summer' },
        ],
      };
      const suggestions = generateAutocompleteSuggestions('summer', 'en', options);
      const collectionSuggestions = suggestions.filter((s) => s.type === 'collection');
      expect(collectionSuggestions.length).toBe(1);
      expect(collectionSuggestions[0].title).toBe('Summer Collection');
    });

    it('should include page suggestions', () => {
      const options = {
        pages: [
          { title: 'About Us', url: '/pages/about-us' },
        ],
      };
      const suggestions = generateAutocompleteSuggestions('about', 'en', options);
      const pageSuggestions = suggestions.filter((s) => s.type === 'page');
      expect(pageSuggestions.length).toBe(1);
      expect(pageSuggestions[0].title).toBe('About Us');
    });

    it('should limit product suggestions to 3', () => {
      const options = {
        products: [
          { title: 'Product 1', url: '/p1' },
          { title: 'Product 2', url: '/p2' },
          { title: 'Product 3', url: '/p3' },
          { title: 'Product 4', url: '/p4' },
          { title: 'Product 5', url: '/p5' },
        ],
      };
      const suggestions = generateAutocompleteSuggestions('product', 'en', options);
      const productSuggestions = suggestions.filter((s) => s.type === 'product');
      expect(productSuggestions.length).toBe(3);
    });

    it('should not add query suggestion for short queries', () => {
      const suggestions = generateAutocompleteSuggestions('s', 'en');
      const querySuggestions = suggestions.filter((s) => s.type === 'query');
      expect(querySuggestions.length).toBe(0);
    });
  });

  describe('Sort Options - getSortOptions()', () => {
    it('should return sort options in Arabic', () => {
      const options = getSortOptions('ar');
      expect(options.length).toBe(7);
      expect(options[0]).toEqual({ value: 'relevance', label: 'الأكثر صلة' });
      expect(options[1]).toEqual({ value: 'newest', label: 'الأحدث' });
      expect(options[2]).toEqual({ value: 'price-asc', label: 'السعر: من الأقل للأعلى' });
    });

    it('should return sort options in Hebrew', () => {
      const options = getSortOptions('he');
      expect(options.length).toBe(7);
      expect(options[0]).toEqual({ value: 'relevance', label: 'רלוונטיות' });
      expect(options[3]).toEqual({ value: 'price-desc', label: 'מחיר: מהגבוה לנמוך' });
    });

    it('should return sort options in English', () => {
      const options = getSortOptions('en');
      expect(options.length).toBe(7);
      expect(options[0]).toEqual({ value: 'relevance', label: 'Relevance' });
      expect(options[4]).toEqual({ value: 'best-selling', label: 'Best Selling' });
      expect(options[5]).toEqual({ value: 'rated', label: 'Highest Rated' });
    });
  });

  describe('Format Results Count - formatResultsCount()', () => {
    it('should format results count in Arabic', () => {
      const result = formatResultsCount(42, 'ar');
      expect(result).toContain('42');
      expect(result).toContain('نتيجة');
    });

    it('should format results count in Hebrew', () => {
      const result = formatResultsCount(42, 'he');
      expect(result).toContain('42');
      expect(result).toContain('תוצאות');
    });

    it('should format results count in English', () => {
      const result = formatResultsCount(42, 'en');
      expect(result).toBe('42 results');
    });
  });

  describe('Search Accessibility Attributes - getSearchAccessibilityAttrs()', () => {
    it('should return Arabic accessibility attributes', () => {
      const attrs = getSearchAccessibilityAttrs('ar');
      expect(attrs.role).toBe('searchbox');
      expect(attrs.ariaLabel).toBe('حقل البحث');
      expect(attrs.ariaAutocomplete).toBe('list');
      expect(attrs.ariaHasPopup).toBe('listbox');
      expect(attrs.ariaExpanded).toBe('false');
    });

    it('should return Hebrew accessibility attributes', () => {
      const attrs = getSearchAccessibilityAttrs('he');
      expect(attrs.role).toBe('searchbox');
      expect(attrs.ariaLabel).toBe('שדה חיפוש');
    });

    it('should return English accessibility attributes', () => {
      const attrs = getSearchAccessibilityAttrs('en');
      expect(attrs.role).toBe('searchbox');
      expect(attrs.ariaLabel).toBe('Search field');
    });

    it('should default to English for unknown locale', () => {
      const attrs = getSearchAccessibilityAttrs('unknown');
      expect(attrs.ariaLabel).toBe('Search field');
    });
  });

  describe('Search Query Validation - isValidSearchQuery()', () => {
    it('should validate valid search query', () => {
      const result = isValidSearchQuery('shoes');
      expect(result.valid).toBe(true);
    });

    it('should reject empty query', () => {
      const result = isValidSearchQuery('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('empty');
    });

    it('should reject whitespace-only query', () => {
      const result = isValidSearchQuery('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('empty');
    });

    it('should reject too short query', () => {
      const result = isValidSearchQuery('a');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('too_short');
    });

    it('should reject too long query', () => {
      const longQuery = 'a'.repeat(101);
      const result = isValidSearchQuery(longQuery);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('too_long');
    });

    it('should reject query with invalid characters', () => {
      const result = isValidSearchQuery('test<script>');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('invalid_chars');
    });

    it('should accept query with spaces', () => {
      const result = isValidSearchQuery('running shoes');
      expect(result.valid).toBe(true);
    });
  });

  describe('Sanitize Search Query - sanitizeSearchQuery()', () => {
    it('should trim whitespace', () => {
      const result = sanitizeSearchQuery('  shoes  ');
      expect(result).toBe('shoes');
    });

    it('should remove dangerous characters', () => {
      const result = sanitizeSearchQuery('test<script>alert(1)</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should normalize multiple spaces', () => {
      const result = sanitizeSearchQuery('running   shoes');
      expect(result).toBe('running shoes');
    });

    it('should limit to 100 characters', () => {
      const longQuery = 'a'.repeat(150);
      const result = sanitizeSearchQuery(longQuery);
      expect(result.length).toBe(100);
    });
  });

  describe('Search Integration Config - getSearchIntegrationConfig()', () => {
    it('should return config with required properties', () => {
      const config = getSearchIntegrationConfig();
      expect(config.minQueryLength).toBe(2);
      expect(config.maxQueryLength).toBe(100);
      expect(config.debounceMs).toBe(300);
      expect(config.maxSuggestions).toBe(8);
      expect(config.enableVoiceSearch).toBe(true);
      expect(config.enableImageSearch).toBe(true);
      expect(config.enableAutocomplete).toBe(true);
    });
  });

  describe('RTL Search Adjustments - getRTLSearchAdjustments()', () => {
    it('should return RTL adjustments for Arabic', () => {
      const adjustments = getRTLSearchAdjustments('ar');
      expect(adjustments.direction).toBe('rtl');
      expect(adjustments.alignRight).toBe(true);
      expect(adjustments.clearButtonPosition).toBe('left');
    });

    it('should return RTL adjustments for Hebrew', () => {
      const adjustments = getRTLSearchAdjustments('he');
      expect(adjustments.direction).toBe('rtl');
      expect(adjustments.alignRight).toBe(true);
      expect(adjustments.clearButtonPosition).toBe('left');
    });

    it('should return LTR adjustments for English', () => {
      const adjustments = getRTLSearchAdjustments('en');
      expect(adjustments.direction).toBe('ltr');
      expect(adjustments.alignRight).toBe(false);
      expect(adjustments.clearButtonPosition).toBe('right');
    });

    it('should return RTL adjustments for Persian', () => {
      const adjustments = getRTLSearchAdjustments('fa');
      expect(adjustments.direction).toBe('rtl');
    });

    it('should return RTL adjustments for Urdu', () => {
      const adjustments = getRTLSearchAdjustments('ur');
      expect(adjustments.direction).toBe('rtl');
    });
  });

  describe('Format Search Suggestion - formatSearchSuggestion()', () => {
    it('should highlight matching text', () => {
      const result = formatSearchSuggestion('running shoes', 'shoe');
      expect(result.length).toBe(2);
      expect(result[0].text).toBe('running ');
      expect(result[0].highlighted).toBe(false);
      expect(result[1].text).toBe('shoe');
      expect(result[1].highlighted).toBe(true);
    });

    it('should handle no match', () => {
      const result = formatSearchSuggestion('running shoes', 'xyz');
      expect(result.length).toBe(1);
      expect(result[0].text).toBe('running shoes');
      expect(result[0].highlighted).toBe(false);
    });

    it('should handle multiple matches', () => {
      const result = formatSearchSuggestion('shoe shoes', 'shoe');
      expect(result.length).toBe(3);
      expect(result[0].highlighted).toBe(true);
      expect(result[1].highlighted).toBe(false);
      expect(result[2].highlighted).toBe(true);
    });

    it('should handle empty query', () => {
      const result = formatSearchSuggestion('running shoes', '');
      expect(result.length).toBe(1);
      expect(result[0].text).toBe('running shoes');
      expect(result[0].highlighted).toBe(false);
    });

    it('should be case insensitive', () => {
      const result = formatSearchSuggestion('Running Shoes', 'shoe');
      expect(result[1].text).toBe('Shoe');
      expect(result[1].highlighted).toBe(true);
    });
  });

  describe('Constants', () => {
    it('should have Arabic search tips defined', () => {
      expect(SEARCH_TIPS.ar).toBeDefined();
      expect(SEARCH_TIPS.ar.length).toBe(4);
      expect(SEARCH_TIPS.ar[0]).toBe('تحقق من الإملاء');
    });

    it('should have Hebrew search tips defined', () => {
      expect(SEARCH_TIPS.he).toBeDefined();
      expect(SEARCH_TIPS.he.length).toBe(4);
      expect(SEARCH_TIPS.he[0]).toBe('בדוק את האיות');
    });

    it('should have English search tips defined', () => {
      expect(SEARCH_TIPS.en).toBeDefined();
      expect(SEARCH_TIPS.en.length).toBe(4);
      expect(SEARCH_TIPS.en[0]).toBe('Check your spelling');
    });

    it('should have popular searches for Arabic', () => {
      expect(POPULAR_SEARCHES.ar).toBeDefined();
      expect(POPULAR_SEARCHES.ar.length).toBeGreaterThan(0);
    });

    it('should have popular searches for Hebrew', () => {
      expect(POPULAR_SEARCHES.he).toBeDefined();
      expect(POPULAR_SEARCHES.he.length).toBeGreaterThan(0);
    });

    it('should have popular searches for English', () => {
      expect(POPULAR_SEARCHES.en).toBeDefined();
      expect(POPULAR_SEARCHES.en.length).toBeGreaterThan(0);
    });
  });
});
