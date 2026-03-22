/**
 * Search Apps Integration Service
 * T0219: Integration - Search Apps
 * 
 * Provides RTL-aware search interface labels, autocomplete suggestions,
 * no results content, and filter/sort labels for search apps integration.
 */

export interface SearchLabelSet {
  searchPlaceholder: string;
  searchButton: string;
  clearSearch: string;
  searchResults: string;
  searching: string;
  recentSearches: string;
  popularSearches: string;
  trendingNow: string;
  voiceSearch: string;
  imageSearch: string;
  advancedSearch: string;
}

export interface AutocompleteLabelSet {
  suggestions: string;
  products: string;
  collections: string;
  pages: string;
  articles: string;
  seeAllResults: string;
  noSuggestions: string;
  typeToSearch: string;
  minimumCharacters: string;
}

export interface NoResultsContent {
  title: string;
  message: string;
  suggestionTitle: string;
  suggestions: string[];
  searchTips: string[];
  contactSupport: string;
  browseCategories: string;
  clearFilters: string;
  modifySearch: string;
}

export interface FilterLabelSet {
  sortBy: string;
  relevance: string;
  newest: string;
  priceLowToHigh: string;
  priceHighToLow: string;
  bestSelling: string;
  highestRated: string;
  alphabetical: string;
  filterBy: string;
  clearAll: string;
  applyFilters: string;
  resultsCount: string;
  showingResults: string;
}

export interface SearchFilters {
  categories: string;
  brands: string;
  priceRange: string;
  availability: string;
  ratings: string;
  tags: string;
  color: string;
  size: string;
  material: string;
}

export interface AutocompleteSuggestion {
  type: 'product' | 'collection' | 'page' | 'article' | 'query';
  title: string;
  url?: string;
  image?: string;
  price?: number;
  category?: string;
}

// Arabic translations
export const ARABIC_SEARCH_LABELS: SearchLabelSet = {
  searchPlaceholder: 'البحث عن منتجات، ماركات، فئات...',
  searchButton: 'بحث',
  clearSearch: 'مسح البحث',
  searchResults: 'نتائج البحث',
  searching: 'جاري البحث...',
  recentSearches: 'عمليات البحث الأخيرة',
  popularSearches: 'عمليات البحث الشائعة',
  trendingNow: 'الأكثر تداولاً الآن',
  voiceSearch: 'بحث صوتي',
  imageSearch: 'بحث بالصورة',
  advancedSearch: 'بحث متقدم',
};

export const ARABIC_AUTOCOMPLETE_LABELS: AutocompleteLabelSet = {
  suggestions: 'اقتراحات',
  products: 'المنتجات',
  collections: 'المجموعات',
  pages: 'الصفحات',
  articles: 'المقالات',
  seeAllResults: 'عرض جميع النتائج',
  noSuggestions: 'لا توجد اقتراحات',
  typeToSearch: 'اكتب للبحث...',
  minimumCharacters: 'الحد الأدنى 3 أحرف',
};

export const ARABIC_FILTER_LABELS: FilterLabelSet = {
  sortBy: 'ترتيب حسب',
  relevance: 'الأكثر صلة',
  newest: 'الأحدث',
  priceLowToHigh: 'السعر: من الأقل للأعلى',
  priceHighToLow: 'السعر: من الأعلى للأقل',
  bestSelling: 'الأكثر مبيعاً',
  highestRated: 'الأعلى تقييماً',
  alphabetical: 'أبجدياً',
  filterBy: 'تصفية حسب',
  clearAll: 'مسح الكل',
  applyFilters: 'تطبيق التصفية',
  resultsCount: 'نتيجة',
  showingResults: 'عرض النتائج',
};

export const ARABIC_SEARCH_FILTERS: SearchFilters = {
  categories: 'الفئات',
  brands: 'الماركات',
  priceRange: 'نطاق السعر',
  availability: 'توفر المنتج',
  ratings: 'التقييمات',
  tags: 'الوسوم',
  color: 'اللون',
  size: 'المقاس',
  material: 'الخامة',
};

// Hebrew translations
export const HEBREW_SEARCH_LABELS: SearchLabelSet = {
  searchPlaceholder: 'חיפוש מוצרים, מותגים, קטגוריות...',
  searchButton: 'חיפוש',
  clearSearch: 'נקה חיפוש',
  searchResults: 'תוצאות חיפוש',
  searching: 'מחפש...',
  recentSearches: 'חיפושים אחרונים',
  popularSearches: 'חיפושים פופולריים',
  trendingNow: 'טרנד עכשיו',
  voiceSearch: 'חיפוש קולי',
  imageSearch: 'חיפוש לפי תמונה',
  advancedSearch: 'חיפוש מתקדם',
};

export const HEBREW_AUTOCOMPLETE_LABELS: AutocompleteLabelSet = {
  suggestions: 'הצעות',
  products: 'מוצרים',
  collections: 'קולקציות',
  pages: 'דפים',
  articles: 'מאמרים',
  seeAllResults: 'הצג את כל התוצאות',
  noSuggestions: 'אין הצעות',
  typeToSearch: 'הקלד לחיפוש...',
  minimumCharacters: 'מינימום 3 תווים',
};

export const HEBREW_FILTER_LABELS: FilterLabelSet = {
  sortBy: 'מיין לפי',
  relevance: 'רלוונטיות',
  newest: 'חדש ביותר',
  priceLowToHigh: 'מחיר: מהנמוך לגבוה',
  priceHighToLow: 'מחיר: מהגבוה לנמוך',
  bestSelling: 'הנמכר ביותר',
  highestRated: 'המדורג ביותר',
  alphabetical: 'אלפביתי',
  filterBy: 'סנן לפי',
  clearAll: 'נקה הכל',
  applyFilters: 'החל מסננים',
  resultsCount: 'תוצאות',
  showingResults: 'מציג תוצאות',
};

export const HEBREW_SEARCH_FILTERS: SearchFilters = {
  categories: 'קטגוריות',
  brands: 'מותגים',
  priceRange: 'טווח מחירים',
  availability: 'זמינות מוצר',
  ratings: 'דירוגים',
  tags: 'תגיות',
  color: 'צבע',
  size: 'מידה',
  material: 'חומר',
};

// English translations (default)
export const ENGLISH_SEARCH_LABELS: SearchLabelSet = {
  searchPlaceholder: 'Search for products, brands, categories...',
  searchButton: 'Search',
  clearSearch: 'Clear Search',
  searchResults: 'Search Results',
  searching: 'Searching...',
  recentSearches: 'Recent Searches',
  popularSearches: 'Popular Searches',
  trendingNow: 'Trending Now',
  voiceSearch: 'Voice Search',
  imageSearch: 'Image Search',
  advancedSearch: 'Advanced Search',
};

export const ENGLISH_AUTOCOMPLETE_LABELS: AutocompleteLabelSet = {
  suggestions: 'Suggestions',
  products: 'Products',
  collections: 'Collections',
  pages: 'Pages',
  articles: 'Articles',
  seeAllResults: 'See All Results',
  noSuggestions: 'No suggestions',
  typeToSearch: 'Type to search...',
  minimumCharacters: 'Minimum 3 characters',
};

export const ENGLISH_FILTER_LABELS: FilterLabelSet = {
  sortBy: 'Sort by',
  relevance: 'Relevance',
  newest: 'Newest',
  priceLowToHigh: 'Price: Low to High',
  priceHighToLow: 'Price: High to Low',
  bestSelling: 'Best Selling',
  highestRated: 'Highest Rated',
  alphabetical: 'Alphabetical',
  filterBy: 'Filter by',
  clearAll: 'Clear All',
  applyFilters: 'Apply Filters',
  resultsCount: 'results',
  showingResults: 'Showing results',
};

export const ENGLISH_SEARCH_FILTERS: SearchFilters = {
  categories: 'Categories',
  brands: 'Brands',
  priceRange: 'Price Range',
  availability: 'Availability',
  ratings: 'Ratings',
  tags: 'Tags',
  color: 'Color',
  size: 'Size',
  material: 'Material',
};

// Popular/trending search terms by locale
export const POPULAR_SEARCHES: Record<string, string[]> = {
  ar: ['فستان', 'حذاء', 'شنطة', 'ساعة', 'عطر', 'نظارة شمسية', 'هدية', 'تخفيضات'],
  he: ['שמלה', 'נעליים', 'תיק', 'שעון', 'בושם', 'משקפי שמש', 'מתנה', 'מבצעים'],
  en: ['dress', 'shoes', 'bag', 'watch', 'perfume', 'sunglasses', 'gift', 'sale'],
};

// Search tips by locale
export const SEARCH_TIPS: Record<string, string[]> = {
  ar: [
    'تحقق من الإملاء',
    'استخدم مصطلحات بحث أقصر',
    'جرب كلمات مفتاحية مختلفة',
    'استخدم المصطلحات العامة بدلاً من المحددة',
  ],
  he: [
    'בדוק את האיות',
    'השתמש במונחי חיפוש קצרים יותר',
    'נסה מילות מפתח שונות',
    'השתמש במונחים כלליים במקום ספציפיים',
  ],
  en: [
    'Check your spelling',
    'Use shorter search terms',
    'Try different keywords',
    'Use more general terms',
  ],
};

// Label mappings by locale
const LABELS_BY_LOCALE: Record<string, { search: SearchLabelSet; autocomplete: AutocompleteLabelSet; filters: FilterLabelSet; searchFilters: SearchFilters }> = {
  ar: {
    search: ARABIC_SEARCH_LABELS,
    autocomplete: ARABIC_AUTOCOMPLETE_LABELS,
    filters: ARABIC_FILTER_LABELS,
    searchFilters: ARABIC_SEARCH_FILTERS,
  },
  he: {
    search: HEBREW_SEARCH_LABELS,
    autocomplete: HEBREW_AUTOCOMPLETE_LABELS,
    filters: HEBREW_FILTER_LABELS,
    searchFilters: HEBREW_SEARCH_FILTERS,
  },
  en: {
    search: ENGLISH_SEARCH_LABELS,
    autocomplete: ENGLISH_AUTOCOMPLETE_LABELS,
    filters: ENGLISH_FILTER_LABELS,
    searchFilters: ENGLISH_SEARCH_FILTERS,
  },
};

/**
 * Normalize locale code
 */
function normalizeLocale(locale: string): string {
  return locale.split('-')[0]?.toLowerCase() || 'en';
}

/**
 * Get search labels for a locale
 */
export function getSearchLabels(locale: string): SearchLabelSet {
  const normalized = normalizeLocale(locale);
  return LABELS_BY_LOCALE[normalized]?.search || ENGLISH_SEARCH_LABELS;
}

/**
 * Get autocomplete labels for a locale
 */
export function getAutocompleteLabels(locale: string): AutocompleteLabelSet {
  const normalized = normalizeLocale(locale);
  return LABELS_BY_LOCALE[normalized]?.autocomplete || ENGLISH_AUTOCOMPLETE_LABELS;
}

/**
 * Get filter labels for a locale
 */
export function getFilterLabels(locale: string): FilterLabelSet {
  const normalized = normalizeLocale(locale);
  return LABELS_BY_LOCALE[normalized]?.filters || ENGLISH_FILTER_LABELS;
}

/**
 * Get search filter labels for a locale
 */
export function getSearchFilters(locale: string): SearchFilters {
  const normalized = normalizeLocale(locale);
  return LABELS_BY_LOCALE[normalized]?.searchFilters || ENGLISH_SEARCH_FILTERS;
}

/**
 * Get no results content for a search query
 */
export function getNoResultsContent(query: string, locale: string): NoResultsContent {
  const normalized = normalizeLocale(locale);
  
  const contentByLocale: Record<string, NoResultsContent> = {
    ar: {
      title: 'لم يتم العثور على نتائج',
      message: `عذراً، لم نتمكن من العثور على أي نتائج لـ "${query}"`,
      suggestionTitle: 'حاول ما يلي:',
      suggestions: [
        'تحقق من الإملاء',
        'استخدم مصطلحات بحث أقصر',
        'جرب كلمات مفتاحية مختلفة',
      ],
      searchTips: SEARCH_TIPS.ar,
      contactSupport: 'تواصل مع الدعم',
      browseCategories: 'تصفح الفئات',
      clearFilters: 'مسح عوامل التصفية',
      modifySearch: 'تعديل البحث',
    },
    he: {
      title: 'לא נמצאו תוצאות',
      message: `מצטערים, לא מצאנו תוצאות עבור "${query}"`,
      suggestionTitle: 'נסה את הדברים הבאים:',
      suggestions: [
        'בדוק את האיות',
        'השתמש במונחי חיפוש קצרים יותר',
        'נסה מילות מפתח שונות',
      ],
      searchTips: SEARCH_TIPS.he,
      contactSupport: 'צור קשר עם תמיכה',
      browseCategories: 'עיין בקטגוריות',
      clearFilters: 'נקה מסננים',
      modifySearch: 'שנה חיפוש',
    },
    en: {
      title: 'No Results Found',
      message: `Sorry, we couldn't find any results for "${query}"`,
      suggestionTitle: 'Try the following:',
      suggestions: [
        'Check your spelling',
        'Use shorter search terms',
        'Try different keywords',
      ],
      searchTips: SEARCH_TIPS.en,
      contactSupport: 'Contact Support',
      browseCategories: 'Browse Categories',
      clearFilters: 'Clear Filters',
      modifySearch: 'Modify Search',
    },
  };
  
  return contentByLocale[normalized] || contentByLocale.en;
}

/**
 * Get popular searches for a locale
 */
export function getPopularSearches(locale: string, limit: number = 8): string[] {
  const normalized = normalizeLocale(locale);
  const searches = POPULAR_SEARCHES[normalized] || POPULAR_SEARCHES.en;
  return searches.slice(0, limit);
}

/**
 * Get recent searches (mock implementation - would integrate with storage)
 */
export function getRecentSearches(locale: string, limit: number = 5): string[] {
  const normalized = normalizeLocale(locale);
  // In real implementation, this would fetch from localStorage or session
  const mockRecent: Record<string, string[]> = {
    ar: ['فستان أسود', 'حذاء رياضي', 'شنطة يد'],
    he: ['שמלה שחורה', 'נעלי ספורט', 'תיק יד'],
    en: ['black dress', 'running shoes', 'handbag'],
  };
  return (mockRecent[normalized] || mockRecent.en).slice(0, limit);
}

/**
 * Generate autocomplete suggestions based on query
 */
export function generateAutocompleteSuggestions(
  query: string,
  locale: string,
  options?: {
    products?: Array<{ title: string; url: string; price?: number; image?: string }>;
    collections?: Array<{ title: string; url: string }>;
    pages?: Array<{ title: string; url: string }>;
  }
): AutocompleteSuggestion[] {
  const suggestions: AutocompleteSuggestion[] = [];
  const normalized = normalizeLocale(locale);
  const labels = getAutocompleteLabels(normalized);
  
  // Add query suggestion
  if (query.length >= 2) {
    suggestions.push({
      type: 'query',
      title: `${labels.seeAllResults} "${query}"`,
    });
  }
  
  // Add product suggestions
  if (options?.products) {
    options.products.slice(0, 3).forEach((product) => {
      suggestions.push({
        type: 'product',
        title: product.title,
        url: product.url,
        price: product.price,
        image: product.image,
      });
    });
  }
  
  // Add collection suggestions
  if (options?.collections) {
    options.collections.slice(0, 2).forEach((collection) => {
      suggestions.push({
        type: 'collection',
        title: collection.title,
        url: collection.url,
      });
    });
  }
  
  // Add page suggestions
  if (options?.pages) {
    options.pages.slice(0, 2).forEach((page) => {
      suggestions.push({
        type: 'page',
        title: page.title,
        url: page.url,
      });
    });
  }
  
  return suggestions;
}

/**
 * Get sort options for search results
 */
export function getSortOptions(locale: string): Array<{ value: string; label: string }> {
  const labels = getFilterLabels(locale);
  return [
    { value: 'relevance', label: labels.relevance },
    { value: 'newest', label: labels.newest },
    { value: 'price-asc', label: labels.priceLowToHigh },
    { value: 'price-desc', label: labels.priceHighToLow },
    { value: 'best-selling', label: labels.bestSelling },
    { value: 'rated', label: labels.highestRated },
    { value: 'alphabetical', label: labels.alphabetical },
  ];
}

/**
 * Format search results count
 */
export function formatResultsCount(count: number, locale: string): string {
  const labels = getFilterLabels(locale);
  const normalized = normalizeLocale(locale);
  
  if (normalized === 'ar') {
    return `${count} ${labels.resultsCount}`;
  } else if (normalized === 'he') {
    return `${count} ${labels.resultsCount}`;
  }
  return `${count} ${labels.resultsCount}`;
}

/**
 * Get search input attributes for accessibility
 */
export function getSearchAccessibilityAttrs(locale: string): {
  role: string;
  ariaLabel: string;
  ariaAutocomplete: string;
  ariaHasPopup: string;
  ariaExpanded: string;
} {
  const normalized = normalizeLocale(locale);
  
  const attrsByLocale: Record<string, { role: string; ariaLabel: string; ariaAutocomplete: string; ariaHasPopup: string; ariaExpanded: string }> = {
    ar: {
      role: 'searchbox',
      ariaLabel: 'حقل البحث',
      ariaAutocomplete: 'list',
      ariaHasPopup: 'listbox',
      ariaExpanded: 'false',
    },
    he: {
      role: 'searchbox',
      ariaLabel: 'שדה חיפוש',
      ariaAutocomplete: 'list',
      ariaHasPopup: 'listbox',
      ariaExpanded: 'false',
    },
    en: {
      role: 'searchbox',
      ariaLabel: 'Search field',
      ariaAutocomplete: 'list',
      ariaHasPopup: 'listbox',
      ariaExpanded: 'false',
    },
  };
  
  return attrsByLocale[normalized] || attrsByLocale.en;
}

/**
 * Check if search query is valid
 */
export function isValidSearchQuery(query: string): { valid: boolean; error?: string } {
  const trimmed = query.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'empty' };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'too_short' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'too_long' };
  }
  
  // Check for special characters that might indicate injection attempts
  const dangerousPattern = /[<>\"\'\;\{\}\[\]]/;
  if (dangerousPattern.test(trimmed)) {
    return { valid: false, error: 'invalid_chars' };
  }
  
  return { valid: true };
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>\"\'\;\{\}\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

/**
 * Get search integration config
 */
export function getSearchIntegrationConfig(): {
  minQueryLength: number;
  maxQueryLength: number;
  debounceMs: number;
  maxSuggestions: number;
  enableVoiceSearch: boolean;
  enableImageSearch: boolean;
  enableAutocomplete: boolean;
} {
  return {
    minQueryLength: 2,
    maxQueryLength: 100,
    debounceMs: 300,
    maxSuggestions: 8,
    enableVoiceSearch: true,
    enableImageSearch: true,
    enableAutocomplete: true,
  };
}

/**
 * Get RTL-specific search adjustments
 */
export function getRTLSearchAdjustments(locale: string): {
  direction: 'rtl' | 'ltr';
  alignRight: boolean;
  clearButtonPosition: 'left' | 'right';
} {
  const normalized = normalizeLocale(locale);
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const isRTL = rtlLocales.includes(normalized);
  
  return {
    direction: isRTL ? 'rtl' : 'ltr',
    alignRight: isRTL,
    clearButtonPosition: isRTL ? 'left' : 'right',
  };
}

/**
 * Format search suggestion with highlighting
 */
export function formatSearchSuggestion(
  suggestion: string,
  query: string,
  locale: string
): { text: string; highlighted: boolean }[] {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedSuggestion = suggestion.toLowerCase();
  
  if (!normalizedQuery || !normalizedSuggestion.includes(normalizedQuery)) {
    return [{ text: suggestion, highlighted: false }];
  }
  
  const parts: { text: string; highlighted: boolean }[] = [];
  let lastIndex = 0;
  let index = normalizedSuggestion.indexOf(normalizedQuery);
  
  while (index !== -1) {
    if (index > lastIndex) {
      parts.push({
        text: suggestion.slice(lastIndex, index),
        highlighted: false,
      });
    }
    parts.push({
      text: suggestion.slice(index, index + normalizedQuery.length),
      highlighted: true,
    });
    lastIndex = index + normalizedQuery.length;
    index = normalizedSuggestion.indexOf(normalizedQuery, lastIndex);
  }
  
  if (lastIndex < suggestion.length) {
    parts.push({
      text: suggestion.slice(lastIndex),
      highlighted: false,
    });
  }
  
  return parts;
}
