/**
 * Filter Labels Translation Service
 * T0139-T0141: Filter label translations for availability, price range, and pagination
 */

export interface FilterLabelSet {
  availability: AvailabilityLabels;
  price: PriceLabels;
  pagination: PaginationLabels;
}

export interface AvailabilityLabels {
  inStock: string;
  outOfStock: string;
  lowStock: string;
  preorder: string;
  backorder: string;
}

export interface PriceLabels {
  priceRange: string;
  minPrice: string;
  maxPrice: string;
  priceAscending: string;
  priceDescending: string;
  under: string;
  over: string;
  andAbove: string;
  currencyFormat: string;
}

export interface PaginationLabels {
  previous: string;
  next: string;
  page: string;
  of: string;
  showing: string;
  results: string;
  itemsPerPage: string;
}

// Arabic translations
export const ARABIC_LABELS: FilterLabelSet = {
  availability: {
    inStock: 'متوفر',
    outOfStock: 'نفذت الكمية',
    lowStock: 'الكمية محدودة',
    preorder: 'طلب مسبق',
    backorder: 'إعادة الطلب',
  },
  price: {
    priceRange: 'نطاق السعر',
    minPrice: 'الحد الأدنى',
    maxPrice: 'الحد الأقصى',
    priceAscending: 'الأقل سعراً',
    priceDescending: 'الأعلى سعراً',
    under: 'أقل من',
    over: 'أكثر من',
    andAbove: 'فأعلى',
    currencyFormat: '{{amount}} {{currency}}',
  },
  pagination: {
    previous: 'السابق',
    next: 'التالي',
    page: 'صفحة',
    of: 'من',
    showing: 'عرض',
    results: 'نتيجة',
    itemsPerPage: 'عنصر في الصفحة',
  },
};

// Hebrew translations
export const HEBREW_LABELS: FilterLabelSet = {
  availability: {
    inStock: 'במלאי',
    outOfStock: 'אזל מהמלאי',
    lowStock: 'מלאי מוגבל',
    preorder: 'הזמנה מראש',
    backorder: 'הזמנה חוזרת',
  },
  price: {
    priceRange: 'טווח מחירים',
    minPrice: 'מחיר מינימום',
    maxPrice: 'מחיר מקסימום',
    priceAscending: 'מהזול ליקר',
    priceDescending: 'מהיקר לזול',
    under: 'מתחת ל',
    over: 'מעל ל',
    andAbove: 'ומעלה',
    currencyFormat: '{{currency}} {{amount}}',
  },
  pagination: {
    previous: 'הקודם',
    next: 'הבא',
    page: 'עמוד',
    of: 'מתוך',
    showing: 'מציג',
    results: 'תוצאות',
    itemsPerPage: 'פריטים בעמוד',
  },
};

// English labels (default)
export const ENGLISH_LABELS: FilterLabelSet = {
  availability: {
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    preorder: 'Pre-order',
    backorder: 'Backorder',
  },
  price: {
    priceRange: 'Price Range',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    priceAscending: 'Price: Low to High',
    priceDescending: 'Price: High to Low',
    under: 'Under',
    over: 'Over',
    andAbove: '& Above',
    currencyFormat: '{{currency}}{{amount}}',
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    results: 'results',
    itemsPerPage: 'items per page',
  },
};

const LABELS_BY_LOCALE: Record<string, FilterLabelSet> = {
  ar: ARABIC_LABELS,
  he: HEBREW_LABELS,
  en: ENGLISH_LABELS,
};

/**
 * Get filter labels for a locale
 */
export function getFilterLabels(locale: string): FilterLabelSet {
  const normalizedLocale = locale.split('-')[0]?.toLowerCase() || 'en';
  return LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_LABELS;
}

/**
 * Get availability label
 */
export function getAvailabilityLabel(
  status: keyof AvailabilityLabels,
  locale: string
): string {
  const labels = getFilterLabels(locale);
  return labels.availability[status] || ENGLISH_LABELS.availability[status];
}

/**
 * Get price label
 */
export function getPriceLabel(
  key: keyof PriceLabels,
  locale: string
): string {
  const labels = getFilterLabels(locale);
  return labels.price[key] || ENGLISH_LABELS.price[key];
}

/**
 * Get pagination label
 */
export function getPaginationLabel(
  key: keyof PaginationLabels,
  locale: string
): string {
  const labels = getFilterLabels(locale);
  return labels.pagination[key] || ENGLISH_LABELS.pagination[key];
}

/**
 * Format price with localized currency format
 */
export function formatPriceLabel(
  amount: number,
  currency: string,
  locale: string
): string {
  const labels = getFilterLabels(locale);
  const format = labels.price.currencyFormat;
  const formattedAmount = new Intl.NumberFormat(locale).format(amount);
  return format
    .replace('{{amount}}', formattedAmount)
    .replace('{{currency}}', currency);
}

/**
 * Get all availability options for filter UI
 */
export function getAvailabilityOptions(locale: string): Array<{
  value: string;
  label: string;
  count?: number;
}> {
  const labels = getFilterLabels(locale);
  return [
    { value: 'in_stock', label: labels.availability.inStock },
    { value: 'out_of_stock', label: labels.availability.outOfStock },
    { value: 'low_stock', label: labels.availability.lowStock },
    { value: 'preorder', label: labels.availability.preorder },
    { value: 'backorder', label: labels.availability.backorder },
  ];
}

/**
 * Get price range options for filter UI
 */
export function getPriceRangeOptions(
  locale: string,
  currency: string,
  ranges: Array<{ min: number; max: number | null }>
): Array<{ value: string; label: string; min: number; max: number | null }> {
  const labels = getFilterLabels(locale);

  return ranges.map((range) => {
    let label: string;
    if (range.max === null) {
      label = `${labels.price.over} ${formatPriceLabel(range.min, currency, locale)}`;
    } else if (range.min === 0) {
      label = `${labels.price.under} ${formatPriceLabel(range.max, currency, locale)}`;
    } else {
      label = `${formatPriceLabel(range.min, currency, locale)} - ${formatPriceLabel(range.max, currency, locale)}`;
    }
    return {
      value: `${range.min}-${range.max ?? 'max'}`,
      label,
      min: range.min,
      max: range.max,
    };
  });
}

/**
 * Get sort options for collection sorting
 */
export function getSortOptions(locale: string): Array<{
  value: string;
  label: string;
}> {
  const labels = getFilterLabels(locale);
  return [
    { value: 'price-asc', label: labels.price.priceAscending },
    { value: 'price-desc', label: labels.price.priceDescending },
  ];
}

/**
 * Get pagination info text
 */
export function getPaginationInfo(
  currentPage: number,
  totalPages: number,
  totalItems: number,
  itemsPerPage: number,
  locale: string
): string {
  const labels = getFilterLabels(locale);
  return `${labels.pagination.showing} ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} ${labels.pagination.of} ${totalItems} ${labels.pagination.results}`;
}
