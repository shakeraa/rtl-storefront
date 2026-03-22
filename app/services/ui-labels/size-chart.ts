/**
 * Size Chart Label Translation Service
 * T0145: Size Chart - Label Translation
 *
 * Provides translated labels for size charts, measurement guides,
 * and size options for Arabic (ar), Hebrew (he), and English (en).
 */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export interface SizeChartLabels {
  sizeChart: string;
  sizeGuide: string;
  howToMeasure: string;
  chest: string;
  waist: string;
  hips: string;
  inseam: string;
  length: string;
}

export interface SizeTypeLabels {
  small: string;
  medium: string;
  large: string;
  xLarge: string;
  xxLarge: string;
}

export interface MeasurementGuide {
  title: string;
  chestDescription: string;
  waistDescription: string;
  hipsDescription: string;
  inseamDescription: string;
  lengthDescription: string;
}

export interface SizeChartLabelSet {
  labels: SizeChartLabels;
  sizeTypes: SizeTypeLabels;
  measurementGuide: MeasurementGuide;
}

// ---------------------------------------------------------------------------
// Arabic Translations
// ---------------------------------------------------------------------------

export const ARABIC_LABELS: SizeChartLabelSet = {
  labels: {
    sizeChart: 'جدول المقاسات',
    sizeGuide: 'دليل المقاسات',
    howToMeasure: 'كيفية القياس',
    chest: 'الصدر',
    waist: 'الخصر',
    hips: 'الورك',
    inseam: 'طول الساق الداخلي',
    length: 'الطول',
  },
  sizeTypes: {
    small: 'صغير',
    medium: 'متوسط',
    large: 'كبير',
    xLarge: 'كبير جداً',
    xxLarge: 'كبير جداً جداً',
  },
  measurementGuide: {
    title: 'دليل القياس',
    chestDescription: 'قس حول الجزء الأكبر من صدرك، تحت الإبطين مباشرةً',
    waistDescription: 'قس حول أضيق جزء من خصرك، عادةً فوق زر البنطال',
    hipsDescription: 'قس حول أعرض جزء من وركيك عند مستوى عظام الورك',
    inseamDescription: 'قس من داخل الساق من الفخذ حتى الكاحل',
    lengthDescription: 'قس من أعلى الكتف حتى الأسفل المطلوب',
  },
};

// ---------------------------------------------------------------------------
// Hebrew Translations
// ---------------------------------------------------------------------------

export const HEBREW_LABELS: SizeChartLabelSet = {
  labels: {
    sizeChart: 'טבלת מידות',
    sizeGuide: 'מדריך מידות',
    howToMeasure: 'כיצד למדוד',
    chest: 'חזה',
    waist: 'מותן',
    hips: 'ירכיים',
    inseam: 'אורך פנימי',
    length: 'אורך',
  },
  sizeTypes: {
    small: 'קטן',
    medium: 'בינוני',
    large: 'גדול',
    xLarge: 'גדול מאוד',
    xxLarge: 'גדול מאוד מאוד',
  },
  measurementGuide: {
    title: 'מדריך מדידה',
    chestDescription: 'מדוד סביב החלק הרחב ביותר של החזה, ממש מתחת לבית השחי',
    waistDescription: 'מדוד סביב החלק הצר ביותר במותניים, בדרך כלל מעל כפתור המכנסיים',
    hipsDescription: 'מדוד סביב החלק הרחב ביותר של הירכיים בגובה עצמות האגן',
    inseamDescription: 'מדוד מבפנים ברגל מהירך עד הקרסול',
    lengthDescription: 'מדוד מראש הכתף עד לאורך הרצוי למטה',
  },
};

// ---------------------------------------------------------------------------
// English Labels (Default)
// ---------------------------------------------------------------------------

export const ENGLISH_LABELS: SizeChartLabelSet = {
  labels: {
    sizeChart: 'Size Chart',
    sizeGuide: 'Size Guide',
    howToMeasure: 'How to Measure',
    chest: 'Chest',
    waist: 'Waist',
    hips: 'Hips',
    inseam: 'Inseam',
    length: 'Length',
  },
  sizeTypes: {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    xLarge: 'X-Large',
    xxLarge: 'XX-Large',
  },
  measurementGuide: {
    title: 'Measurement Guide',
    chestDescription: 'Measure around the fullest part of your chest, just under the armpits',
    waistDescription: 'Measure around the narrowest part of your waist, usually above the pant button',
    hipsDescription: 'Measure around the widest part of your hips at the hip bone level',
    inseamDescription: 'Measure from the inside of the leg from thigh to ankle',
    lengthDescription: 'Measure from the top of the shoulder down to the desired hem',
  },
};

// ---------------------------------------------------------------------------
// Locale Mapping
// ---------------------------------------------------------------------------

const LABELS_BY_LOCALE: Record<string, SizeChartLabelSet> = {
  ar: ARABIC_LABELS,
  he: HEBREW_LABELS,
  en: ENGLISH_LABELS,
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Normalize locale string (extract base language code)
 */
function normalizeLocale(locale: string): string {
  return locale.split('-')[0]?.toLowerCase() || 'en';
}

/**
 * Get complete label set for a locale
 */
export function getSizeChartLabels(locale: string): SizeChartLabelSet {
  const normalized = normalizeLocale(locale);
  return LABELS_BY_LOCALE[normalized] || ENGLISH_LABELS;
}

/**
 * Get a specific size chart label by key
 * @param key - The label key (e.g., 'sizeChart', 'chest', 'waist')
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns The translated label string
 */
export function getSizeLabel(
  key: keyof SizeChartLabels,
  locale: string
): string {
  const labels = getSizeChartLabels(locale);
  return labels.labels[key] || ENGLISH_LABELS.labels[key];
}

/**
 * Get a specific size type label by key
 * @param key - The size type key (e.g., 'small', 'medium', 'large')
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns The translated size type string
 */
export function getSizeTypeLabel(
  key: keyof SizeTypeLabels,
  locale: string
): string {
  const labels = getSizeChartLabels(locale);
  return labels.sizeTypes[key] || ENGLISH_LABELS.sizeTypes[key];
}

/**
 * Get the complete measurement guide for a locale
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns The translated measurement guide object
 */
export function getMeasurementGuide(locale: string): MeasurementGuide {
  const labels = getSizeChartLabels(locale);
  return labels.measurementGuide;
}

/**
 * Get size options array for dropdown/select UI components
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns Array of size options with value and label
 */
export function getSizeOptions(locale: string): Array<{
  value: string;
  label: string;
}> {
  const labels = getSizeChartLabels(locale);
  return [
    { value: 'S', label: labels.sizeTypes.small },
    { value: 'M', label: labels.sizeTypes.medium },
    { value: 'L', label: labels.sizeTypes.large },
    { value: 'XL', label: labels.sizeTypes.xLarge },
    { value: 'XXL', label: labels.sizeTypes.xxLarge },
  ];
}

/**
 * Get measurement fields for size chart display
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns Array of measurement field keys and labels
 */
export function getMeasurementFields(locale: string): Array<{
  key: keyof SizeChartLabels;
  label: string;
}> {
  const labels = getSizeChartLabels(locale);
  return [
    { key: 'chest', label: labels.labels.chest },
    { key: 'waist', label: labels.labels.waist },
    { key: 'hips', label: labels.labels.hips },
    { key: 'inseam', label: labels.labels.inseam },
    { key: 'length', label: labels.labels.length },
  ];
}

/**
 * Format size chart header with appropriate labels
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns Object containing all header labels
 */
export function getSizeChartHeader(locale: string): {
  title: string;
  subtitle: string;
  howToMeasure: string;
} {
  const labels = getSizeChartLabels(locale);
  return {
    title: labels.labels.sizeChart,
    subtitle: labels.labels.sizeGuide,
    howToMeasure: labels.labels.howToMeasure,
  };
}

/**
 * Check if a locale is supported for size chart translations
 * @param locale - The locale to check
 * @returns boolean indicating if the locale is supported
 */
export function isLocaleSupported(locale: string): boolean {
  const normalized = normalizeLocale(locale);
  return normalized in LABELS_BY_LOCALE;
}

/**
 * Get all supported locales
 * @returns Array of supported locale codes
 */
export function getSupportedLocales(): string[] {
  return Object.keys(LABELS_BY_LOCALE);
}

/**
 * Get size abbreviation mapping with translations
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns Object mapping size abbreviations to translated labels
 */
export function getSizeAbbreviationMap(locale: string): Record<string, string> {
  const labels = getSizeChartLabels(locale);
  return {
    S: labels.sizeTypes.small,
    M: labels.sizeTypes.medium,
    L: labels.sizeTypes.large,
    XL: labels.sizeTypes.xLarge,
    XXL: labels.sizeTypes.xxLarge,
  };
}

/**
 * Translate a size abbreviation to full label
 * @param abbreviation - Size abbreviation (S, M, L, XL, XXL)
 * @param locale - The target locale (e.g., 'ar', 'he', 'en')
 * @returns The translated full size label
 */
export function translateSizeAbbreviation(
  abbreviation: string,
  locale: string
): string {
  const map = getSizeAbbreviationMap(locale);
  const upperAbbr = abbreviation.toUpperCase();
  return map[upperAbbr] || abbreviation;
}
