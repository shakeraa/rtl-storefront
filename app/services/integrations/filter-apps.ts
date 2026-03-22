/**
 * Filter Apps Integration Service
 * T0220: Integration - Filter Apps
 * 
 * Provides RTL-aware labels and formatting for Shopify filter apps including:
 * - Collection filters (price, availability, variants)
 * - Price slider components
 * - Active filters display
 * - Range and checkbox filter types
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface FilterAppLabelSet {
  /** App-level labels */
  app: {
    title: string;
    clearAll: string;
    applyFilters: string;
    filterBy: string;
    noFilters: string;
  };
  /** Filter type labels */
  filterTypes: {
    range: string;
    checkbox: string;
    multiSelect: string;
    singleSelect: string;
  };
  /** Accessibility labels */
  accessibility: {
    filtersPanel: string;
    closeFilters: string;
    sliderHandle: string;
    sliderRange: string;
    removeFilter: string;
  };
}

export interface CollectionFilterLabels {
  /** Price filter labels */
  price: {
    title: string;
    minLabel: string;
    maxLabel: string;
    sliderAriaLabel: string;
  };
  /** Availability filter labels */
  availability: {
    title: string;
    inStock: string;
    outOfStock: string;
    onSale: string;
  };
  /** Size filter labels */
  size: {
    title: string;
  };
  /** Color filter labels */
  color: {
    title: string;
  };
  /** Brand/Manufacturer labels */
  brand: {
    title: string;
  };
  /** Material filter labels */
  material: {
    title: string;
  };
  /** Rating filter labels */
  rating: {
    title: string;
    andUp: string;
  };
}

export interface PriceSliderLabels {
  /** Slider component labels */
  slider: {
    minHandle: string;
    maxHandle: string;
    rangeSelected: string;
  };
  /** Input field labels */
  input: {
    from: string;
    to: string;
    go: string;
  };
  /** Validation messages */
  validation: {
    minGreaterThanMax: string;
    invalidRange: string;
  };
}

export interface ActiveFiltersLabels {
  /** Summary labels */
  summary: {
    showing: string;
    of: string;
    results: string;
    filteredBy: string;
  };
  /** Filter chip labels */
  chips: {
    remove: string;
    clearAll: string;
  };
  /** Mobile-specific labels */
  mobile: {
    showFilters: string;
    hideFilters: string;
    filtersApplied: string;
  };
}

export interface FilterValue {
  value: string;
  label: string;
  count?: number;
  selected?: boolean;
}

export interface FilterGroup {
  id: string;
  type: 'range' | 'checkbox' | 'multi_select' | 'single_select';
  title: string;
  values: FilterValue[];
}

// ============================================================================
// Arabic Labels
// ============================================================================

export const ARABIC_FILTER_APP_LABELS: FilterAppLabelSet = {
  app: {
    title: 'تصفية المنتجات',
    clearAll: 'مسح الكل',
    applyFilters: 'تطبيق التصفية',
    filterBy: 'تصفية حسب',
    noFilters: 'لا توجد عوامل تصفية',
  },
  filterTypes: {
    range: 'نطاق',
    checkbox: 'خيار متعدد',
    multiSelect: 'اختيار متعدد',
    singleSelect: 'اختيار واحد',
  },
  accessibility: {
    filtersPanel: 'لوحة عوامل التصفية',
    closeFilters: 'إغلاق عوامل التصفية',
    sliderHandle: 'مقبض المنزلق',
    sliderRange: 'نطاق السعر المحدد',
    removeFilter: 'إزالة عامل التصفية',
  },
};

export const ARABIC_COLLECTION_FILTER_LABELS: CollectionFilterLabels = {
  price: {
    title: 'السعر',
    minLabel: 'من',
    maxLabel: 'إلى',
    sliderAriaLabel: 'منزلق نطاق السعر',
  },
  availability: {
    title: 'التوفر',
    inStock: 'متوفر',
    outOfStock: 'نفذت الكمية',
    onSale: 'خصم',
  },
  size: {
    title: 'المقاس',
  },
  color: {
    title: 'اللون',
  },
  brand: {
    title: 'العلامة التجارية',
  },
  material: {
    title: 'المادة',
  },
  rating: {
    title: 'التقييم',
    andUp: 'فأعلى',
  },
};

export const ARABIC_PRICE_SLIDER_LABELS: PriceSliderLabels = {
  slider: {
    minHandle: 'السعر الأدنى',
    maxHandle: 'السعر الأقصى',
    rangeSelected: 'نطاق السعر المحدد',
  },
  input: {
    from: 'من',
    to: 'إلى',
    go: 'تطبيق',
  },
  validation: {
    minGreaterThanMax: 'السعر الأدنى يجب أن يكون أقل من السعر الأقصى',
    invalidRange: 'نطاق السعر غير صالح',
  },
};

export const ARABIC_ACTIVE_FILTERS_LABELS: ActiveFiltersLabels = {
  summary: {
    showing: 'عرض',
    of: 'من',
    results: 'نتيجة',
    filteredBy: 'مصفى حسب',
  },
  chips: {
    remove: 'إزالة',
    clearAll: 'مسح الكل',
  },
  mobile: {
    showFilters: 'عرض التصفية',
    hideFilters: 'إخفاء التصفية',
    filtersApplied: 'تم تطبيق عوامل التصفية',
  },
};

// ============================================================================
// Hebrew Labels
// ============================================================================

export const HEBREW_FILTER_APP_LABELS: FilterAppLabelSet = {
  app: {
    title: 'סינון מוצרים',
    clearAll: 'נקה הכל',
    applyFilters: 'החל סינון',
    filterBy: 'סנן לפי',
    noFilters: 'אין מסננים',
  },
  filterTypes: {
    range: 'טווח',
    checkbox: 'תיבת סימון',
    multiSelect: 'בחירה מרובה',
    singleSelect: 'בחירה יחידה',
  },
  accessibility: {
    filtersPanel: 'לוח מסננים',
    closeFilters: 'סגור מסננים',
    sliderHandle: 'ידית המחוון',
    sliderRange: 'טווח מחירים נבחר',
    removeFilter: 'הסר מסנן',
  },
};

export const HEBREW_COLLECTION_FILTER_LABELS: CollectionFilterLabels = {
  price: {
    title: 'מחיר',
    minLabel: 'מ',
    maxLabel: 'עד',
    sliderAriaLabel: 'מחוון טווח מחירים',
  },
  availability: {
    title: 'זמינות',
    inStock: 'במלאי',
    outOfStock: 'אזל מהמלאי',
    onSale: 'במבצע',
  },
  size: {
    title: 'מידה',
  },
  color: {
    title: 'צבע',
  },
  brand: {
    title: 'מותג',
  },
  material: {
    title: 'חומר',
  },
  rating: {
    title: 'דירוג',
    andUp: 'ומעלה',
  },
};

export const HEBREW_PRICE_SLIDER_LABELS: PriceSliderLabels = {
  slider: {
    minHandle: 'מחיר מינימום',
    maxHandle: 'מחיר מקסימום',
    rangeSelected: 'טווח מחירים נבחר',
  },
  input: {
    from: 'מ',
    to: 'עד',
    go: 'החל',
  },
  validation: {
    minGreaterThanMax: 'מחיר מינימום חייב להיות נמוך ממחיר מקסימום',
    invalidRange: 'טווח מחירים לא תקין',
  },
};

export const HEBREW_ACTIVE_FILTERS_LABELS: ActiveFiltersLabels = {
  summary: {
    showing: 'מציג',
    of: 'מתוך',
    results: 'תוצאות',
    filteredBy: 'מסונן לפי',
  },
  chips: {
    remove: 'הסר',
    clearAll: 'נקה הכל',
  },
  mobile: {
    showFilters: 'הצג מסננים',
    hideFilters: 'הסתר מסננים',
    filtersApplied: 'מסננים הוחלו',
  },
};

// ============================================================================
// English Labels (Default)
// ============================================================================

export const ENGLISH_FILTER_APP_LABELS: FilterAppLabelSet = {
  app: {
    title: 'Filter Products',
    clearAll: 'Clear All',
    applyFilters: 'Apply Filters',
    filterBy: 'Filter By',
    noFilters: 'No filters applied',
  },
  filterTypes: {
    range: 'Range',
    checkbox: 'Checkbox',
    multiSelect: 'Multi Select',
    singleSelect: 'Single Select',
  },
  accessibility: {
    filtersPanel: 'Filters Panel',
    closeFilters: 'Close Filters',
    sliderHandle: 'Slider Handle',
    sliderRange: 'Selected Price Range',
    removeFilter: 'Remove Filter',
  },
};

export const ENGLISH_COLLECTION_FILTER_LABELS: CollectionFilterLabels = {
  price: {
    title: 'Price',
    minLabel: 'Min',
    maxLabel: 'Max',
    sliderAriaLabel: 'Price Range Slider',
  },
  availability: {
    title: 'Availability',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    onSale: 'On Sale',
  },
  size: {
    title: 'Size',
  },
  color: {
    title: 'Color',
  },
  brand: {
    title: 'Brand',
  },
  material: {
    title: 'Material',
  },
  rating: {
    title: 'Rating',
    andUp: '& Up',
  },
};

export const ENGLISH_PRICE_SLIDER_LABELS: PriceSliderLabels = {
  slider: {
    minHandle: 'Minimum Price',
    maxHandle: 'Maximum Price',
    rangeSelected: 'Selected Price Range',
  },
  input: {
    from: 'From',
    to: 'To',
    go: 'Go',
  },
  validation: {
    minGreaterThanMax: 'Minimum price must be less than maximum price',
    invalidRange: 'Invalid price range',
  },
};

export const ENGLISH_ACTIVE_FILTERS_LABELS: ActiveFiltersLabels = {
  summary: {
    showing: 'Showing',
    of: 'of',
    results: 'results',
    filteredBy: 'Filtered by',
  },
  chips: {
    remove: 'Remove',
    clearAll: 'Clear All',
  },
  mobile: {
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    filtersApplied: 'Filters Applied',
  },
};

// ============================================================================
// Label Registries
// ============================================================================

const FILTER_APP_LABELS_BY_LOCALE: Record<string, FilterAppLabelSet> = {
  ar: ARABIC_FILTER_APP_LABELS,
  he: HEBREW_FILTER_APP_LABELS,
  en: ENGLISH_FILTER_APP_LABELS,
};

const COLLECTION_FILTER_LABELS_BY_LOCALE: Record<string, CollectionFilterLabels> = {
  ar: ARABIC_COLLECTION_FILTER_LABELS,
  he: HEBREW_COLLECTION_FILTER_LABELS,
  en: ENGLISH_COLLECTION_FILTER_LABELS,
};

const PRICE_SLIDER_LABELS_BY_LOCALE: Record<string, PriceSliderLabels> = {
  ar: ARABIC_PRICE_SLIDER_LABELS,
  he: HEBREW_PRICE_SLIDER_LABELS,
  en: ENGLISH_PRICE_SLIDER_LABELS,
};

const ACTIVE_FILTERS_LABELS_BY_LOCALE: Record<string, ActiveFiltersLabels> = {
  ar: ARABIC_ACTIVE_FILTERS_LABELS,
  he: HEBREW_ACTIVE_FILTERS_LABELS,
  en: ENGLISH_ACTIVE_FILTERS_LABELS,
};

// ============================================================================
// Utility Functions
// ============================================================================

function normalizeLocale(locale: string): string {
  return locale.split('-')[0]?.toLowerCase() || 'en';
}

// ============================================================================
// Main Export Functions
// ============================================================================

/**
 * Get all filter app labels for a locale
 * @param locale - The locale code (e.g., 'ar', 'he', 'en')
 * @returns FilterAppLabelSet with translated labels
 */
export function getFilterAppLabels(locale: string): FilterAppLabelSet {
  const normalizedLocale = normalizeLocale(locale);
  return FILTER_APP_LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_FILTER_APP_LABELS;
}

/**
 * Get collection filter labels for a locale
 * @param locale - The locale code (e.g., 'ar', 'he', 'en')
 * @returns CollectionFilterLabels with translated labels
 */
export function getCollectionFilterLabels(locale: string): CollectionFilterLabels {
  const normalizedLocale = normalizeLocale(locale);
  return COLLECTION_FILTER_LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_COLLECTION_FILTER_LABELS;
}

/**
 * Get price slider labels for a locale
 * @param locale - The locale code (e.g., 'ar', 'he', 'en')
 * @returns PriceSliderLabels with translated labels
 */
export function getPriceSliderLabels(locale: string): PriceSliderLabels {
  const normalizedLocale = normalizeLocale(locale);
  return PRICE_SLIDER_LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_PRICE_SLIDER_LABELS;
}

/**
 * Get active filters labels for a locale
 * @param locale - The locale code (e.g., 'ar', 'he', 'en')
 * @returns ActiveFiltersLabels with translated labels
 */
export function getActiveFiltersLabels(locale: string): ActiveFiltersLabels {
  const normalizedLocale = normalizeLocale(locale);
  return ACTIVE_FILTERS_LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_ACTIVE_FILTERS_LABELS;
}

/**
 * Format a price slider label with localized number and currency
 * @param min - Minimum price value
 * @param max - Maximum price value
 * @param currency - Currency code (e.g., 'AED', 'ILS', 'USD')
 * @param locale - The locale code
 * @returns Formatted price range string
 */
export function formatPriceSliderLabel(
  min: number,
  max: number,
  currency: string,
  locale: string
): string {
  const normalizedLocale = normalizeLocale(locale);
  const formatter = new Intl.NumberFormat(normalizedLocale === 'ar' ? 'ar-SA' : 
                                           normalizedLocale === 'he' ? 'he-IL' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });

  const formattedMin = formatter.format(min);
  const formattedMax = formatter.format(max);

  // For Arabic and Hebrew, use localized range separator
  if (normalizedLocale === 'ar') {
    return `${formattedMin} - ${formattedMax}`;
  } else if (normalizedLocale === 'he') {
    return `${formattedMin} - ${formattedMax}`;
  }

  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Format a single price value with currency
 * @param amount - Price amount
 * @param currency - Currency code
 * @param locale - The locale code
 * @returns Formatted price string
 */
export function formatPriceValue(
  amount: number,
  currency: string,
  locale: string
): string {
  const normalizedLocale = normalizeLocale(locale);
  const formatter = new Intl.NumberFormat(normalizedLocale === 'ar' ? 'ar-SA' : 
                                           normalizedLocale === 'he' ? 'he-IL' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
}

/**
 * Get active filters summary text
 * @param count - Number of active filters
 * @param locale - The locale code
 * @returns Localized summary string
 */
export function getActiveFiltersSummary(count: number, locale: string): string {
  const labels = getActiveFiltersLabels(locale);
  
  if (count === 0) {
    return labels.summary.showing + ' ' + labels.summary.results;
  }

  // Handle pluralization for Arabic
  if (normalizeLocale(locale) === 'ar') {
    if (count === 1) {
      return `${labels.summary.filteredBy} ${count} ${labels.summary.results}`;
    } else if (count === 2) {
      return `${labels.summary.filteredBy} ${count} نتيجتين`;
    } else if (count >= 3 && count <= 10) {
      return `${labels.summary.filteredBy} ${count} نتائج`;
    } else {
      return `${labels.summary.filteredBy} ${count} نتيجة`;
    }
  }

  // Handle pluralization for Hebrew
  if (normalizeLocale(locale) === 'he') {
    if (count === 1) {
      return `${labels.summary.filteredBy} ${count} תוצאה`;
    }
    return `${labels.summary.filteredBy} ${count} תוצאות`;
  }

  // English and default
  if (count === 1) {
    return `${labels.summary.filteredBy} 1 filter`;
  }
  return `${labels.summary.filteredBy} ${count} filters`;
}

/**
 * Get results showing text with count
 * @param showing - Number of items being shown
 * @param total - Total number of items
 * @param locale - The locale code
 * @returns Localized showing text
 */
export function getResultsShowingText(
  showing: number,
  total: number,
  locale: string
): string {
  const labels = getActiveFiltersLabels(locale);
  return `${labels.summary.showing} ${showing} ${labels.summary.of} ${total} ${labels.summary.results}`;
}

/**
 * Get filter groups with localized labels for a collection
 * @param locale - The locale code
 * @returns Array of filter groups with localized titles
 */
export function getLocalizedFilterGroups(locale: string): FilterGroup[] {
  const collectionLabels = getCollectionFilterLabels(locale);
  const filterAppLabels = getFilterAppLabels(locale);

  return [
    {
      id: 'price',
      type: 'range',
      title: collectionLabels.price.title,
      values: [],
    },
    {
      id: 'availability',
      type: 'checkbox',
      title: collectionLabels.availability.title,
      values: [
        { value: 'in_stock', label: collectionLabels.availability.inStock },
        { value: 'out_of_stock', label: collectionLabels.availability.outOfStock },
        { value: 'on_sale', label: collectionLabels.availability.onSale },
      ],
    },
    {
      id: 'size',
      type: 'multi_select',
      title: collectionLabels.size.title,
      values: [],
    },
    {
      id: 'color',
      type: 'multi_select',
      title: collectionLabels.color.title,
      values: [],
    },
    {
      id: 'brand',
      type: 'multi_select',
      title: collectionLabels.brand.title,
      values: [],
    },
    {
      id: 'material',
      type: 'multi_select',
      title: collectionLabels.material.title,
      values: [],
    },
    {
      id: 'rating',
      type: 'single_select',
      title: collectionLabels.rating.title,
      values: [
        { value: '4', label: `4★ ${collectionLabels.rating.andUp}` },
        { value: '3', label: `3★ ${collectionLabels.rating.andUp}` },
        { value: '2', label: `2★ ${collectionLabels.rating.andUp}` },
        { value: '1', label: `1★ ${collectionLabels.rating.andUp}` },
      ],
    },
  ];
}

/**
 * Get aria labels for filter components
 * @param component - Component identifier
 * @param locale - The locale code
 * @param context - Optional context for dynamic labels
 * @returns Localized aria label string
 */
export function getFilterAriaLabel(
  component: 'panel' | 'close' | 'slider' | 'remove' | 'handle',
  locale: string,
  context?: { value?: string; filterName?: string }
): string {
  const labels = getFilterAppLabels(locale);

  switch (component) {
    case 'panel':
      return labels.accessibility.filtersPanel;
    case 'close':
      return labels.accessibility.closeFilters;
    case 'slider':
      return labels.accessibility.sliderRange;
    case 'remove':
      if (context?.filterName) {
        return `${labels.accessibility.removeFilter}: ${context.filterName}`;
      }
      return labels.accessibility.removeFilter;
    case 'handle':
      return labels.accessibility.sliderHandle;
    default:
      return '';
  }
}

/**
 * Get mobile filter button labels
 * @param filterCount - Number of active filters
 * @param locale - The locale code
 * @returns Localized button label
 */
export function getMobileFilterButtonLabel(
  filterCount: number,
  locale: string
): string {
  const labels = getActiveFiltersLabels(locale);
  
  if (filterCount === 0) {
    return labels.mobile.showFilters;
  }
  
  return `${labels.mobile.showFilters} (${filterCount})`;
}

/**
 * Get price input placeholder text
 * @param type - 'min' or 'max'
 * @param locale - The locale code
 * @returns Localized placeholder string
 */
export function getPriceInputPlaceholder(
  type: 'min' | 'max',
  locale: string
): string {
  const labels = getCollectionFilterLabels(locale);
  return type === 'min' ? labels.price.minLabel : labels.price.maxLabel;
}

/**
 * Validate price range input
 * @param min - Minimum price
 * @param max - Maximum price
 * @param locale - The locale code
 * @returns Validation result with optional error message
 */
export function validatePriceRange(
  min: number,
  max: number,
  locale: string
): { valid: boolean; error?: string } {
  if (min > max) {
    const labels = getPriceSliderLabels(locale);
    return { valid: false, error: labels.validation.minGreaterThanMax };
  }
  
  if (min < 0 || max < 0) {
    const labels = getPriceSliderLabels(locale);
    return { valid: false, error: labels.validation.invalidRange };
  }
  
  return { valid: true };
}
