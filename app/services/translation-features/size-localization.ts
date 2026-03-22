/**
 * Size Localization Service
 * Provides localized size labels and conversions for clothing, shoes, and accessories
 * Supports Arabic, Hebrew, and English locales with US/UK/EU size conversions
 */

export type Locale = 'ar' | 'he' | 'en';
export type SizeCategory = 'clothing' | 'shoes' | 'accessories';
export type Region = 'US' | 'UK' | 'EU';

export interface SizeLabel {
  size: string;
  label: string;
  description?: string;
}

export interface SizeChartLabels {
  title: string;
  sizeColumn: string;
  usColumn: string;
  ukColumn: string;
  euColumn: string;
  chestColumn: string;
  waistColumn: string;
  hipsColumn: string;
  footLengthColumn: string;
  notes: string;
}

// Standard clothing sizes
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

// Plus size mapping
const PLUS_SIZE_MAP: Record<string, string> = {
  '1X': '2XL',
  '2X': '3XL',
  '3X': '4XL',
  '4X': '5XL',
};

// Size translations for different locales
const SIZE_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    XS: 'Extra Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
    '2XL': '2X Large',
    '3XL': '3X Large',
    '4XL': '4X Large',
    '5XL': '5X Large',
    '1X': '1X Plus',
    '2X': '2X Plus',
    '3X': '3X Plus',
    '4X': '4X Plus',
  },
  ar: {
    XS: 'صغير جداً',
    S: 'صغير',
    M: 'متوسط',
    L: 'كبير',
    XL: 'كبير جداً',
    '2XL': 'كبير مضاعف ×2',
    '3XL': 'كبير مضاعف ×3',
    '4XL': 'كبير مضاعف ×4',
    '5XL': 'كبير مضاعف ×5',
    '1X': 'مقاس خاص +1',
    '2X': 'مقاس خاص +2',
    '3X': 'مقاس خاص +3',
    '4X': 'مقاس خاص +4',
  },
  he: {
    XS: 'קטן מאוד',
    S: 'קטן',
    M: 'בינוני',
    L: 'גדול',
    XL: 'גדול מאוד',
    '2XL': 'גדול כפול ×2',
    '3XL': 'גדול כפול ×3',
    '4XL': 'גדול כפול ×4',
    '5XL': 'גדול כפול ×5',
    '1X': 'מידה פלוס +1',
    '2X': 'מידה פלוס +2',
    '3X': 'מידה פלוס +3',
    '4X': 'מידה פלוס +4',
  },
};

// Shoe size conversions (men's sizes as base)
const SHOE_SIZE_CONVERSIONS: Record<string, Record<Region, number>> = {
  '6': { US: 6, UK: 5.5, EU: 38.5 },
  '6.5': { US: 6.5, UK: 6, EU: 39 },
  '7': { US: 7, UK: 6.5, EU: 40 },
  '7.5': { US: 7.5, UK: 7, EU: 40.5 },
  '8': { US: 8, UK: 7.5, EU: 41 },
  '8.5': { US: 8.5, UK: 8, EU: 42 },
  '9': { US: 9, UK: 8.5, EU: 42.5 },
  '9.5': { US: 9.5, UK: 9, EU: 43 },
  '10': { US: 10, UK: 9.5, EU: 44 },
  '10.5': { US: 10.5, UK: 10, EU: 44.5 },
  '11': { US: 11, UK: 10.5, EU: 45 },
  '11.5': { US: 11.5, UK: 11, EU: 45.5 },
  '12': { US: 12, UK: 11.5, EU: 46 },
  '13': { US: 13, UK: 12.5, EU: 47.5 },
  '14': { US: 14, UK: 13.5, EU: 48.5 },
};

// Women's shoe size conversions
const WOMEN_SHOE_SIZE_CONVERSIONS: Record<string, Record<Region, number>> = {
  '5': { US: 5, UK: 2.5, EU: 35 },
  '5.5': { US: 5.5, UK: 3, EU: 35.5 },
  '6': { US: 6, UK: 3.5, EU: 36 },
  '6.5': { US: 6.5, UK: 4, EU: 37 },
  '7': { US: 7, UK: 4.5, EU: 37.5 },
  '7.5': { US: 7.5, UK: 5, EU: 38 },
  '8': { US: 8, UK: 5.5, EU: 38.5 },
  '8.5': { US: 8.5, UK: 6, EU: 39 },
  '9': { US: 9, UK: 6.5, EU: 40 },
  '9.5': { US: 9.5, UK: 7, EU: 40.5 },
  '10': { US: 10, UK: 7.5, EU: 41 },
  '10.5': { US: 10.5, UK: 8, EU: 42 },
  '11': { US: 11, UK: 8.5, EU: 42.5 },
  '12': { US: 12, UK: 9.5, EU: 44 },
};

// Clothing size conversions
const CLOTHING_SIZE_CONVERSIONS: Record<string, Record<Region, string>> = {
  'XS': { US: 'XS', UK: 'XS', EU: '40' },
  'S': { US: 'S', UK: 'S', EU: '44' },
  'M': { US: 'M', UK: 'M', EU: '48' },
  'L': { US: 'L', UK: 'L', EU: '52' },
  'XL': { US: 'XL', UK: 'XL', EU: '56' },
  '2XL': { US: '2XL', UK: '2XL', EU: '60' },
  '3XL': { US: '3XL', UK: '3XL', EU: '64' },
  '4XL': { US: '4XL', UK: '4XL', EU: '68' },
  '5XL': { US: '5XL', UK: '5XL', EU: '72' },
};

// Numeric clothing sizes (US to UK/EU)
const NUMERIC_CLOTHING_CONVERSIONS: Record<string, Record<Region, number>> = {
  '0': { US: 0, UK: 4, EU: 32 },
  '2': { US: 2, UK: 6, EU: 34 },
  '4': { US: 4, UK: 8, EU: 36 },
  '6': { US: 6, UK: 10, EU: 38 },
  '8': { US: 8, UK: 12, EU: 40 },
  '10': { US: 10, UK: 14, EU: 42 },
  '12': { US: 12, UK: 16, EU: 44 },
  '14': { US: 14, UK: 18, EU: 46 },
  '16': { US: 16, UK: 20, EU: 48 },
  '18': { US: 18, UK: 22, EU: 50 },
  '20': { US: 20, UK: 24, EU: 52 },
  '22': { US: 22, UK: 26, EU: 54 },
  '24': { US: 24, UK: 28, EU: 56 },
};

// Accessory size conversions
const ACCESSORY_SIZE_CONVERSIONS: Record<string, Record<Region, string>> = {
  'S': { US: 'S', UK: 'S', EU: 'S' },
  'M': { US: 'M', UK: 'M', EU: 'M' },
  'L': { US: 'L', UK: 'L', EU: 'L' },
  'One Size': { US: 'One Size', UK: 'One Size', EU: 'One Size' },
};

// Size chart labels by locale
const SIZE_CHART_LABELS_BY_LOCALE: Record<Locale, SizeChartLabels> = {
  en: {
    title: 'Size Guide',
    sizeColumn: 'Size',
    usColumn: 'US',
    ukColumn: 'UK',
    euColumn: 'EU',
    chestColumn: 'Chest (in)',
    waistColumn: 'Waist (in)',
    hipsColumn: 'Hips (in)',
    footLengthColumn: 'Foot Length (cm)',
    notes: 'Sizes may vary by brand and style',
  },
  ar: {
    title: 'دليل المقاسات',
    sizeColumn: 'المقاس',
    usColumn: 'أمريكي',
    ukColumn: 'بريطاني',
    euColumn: 'أوروبي',
    chestColumn: 'الصدر (سم)',
    waistColumn: 'الخصر (سم)',
    hipsColumn: 'الورك (سم)',
    footLengthColumn: 'طول القدم (سم)',
    notes: 'قد تختلف المقاسات حسب العلامة التجارية والنمط',
  },
  he: {
    title: 'מדריך מידות',
    sizeColumn: 'מידה',
    usColumn: 'ארה"ב',
    ukColumn: 'בריטניה',
    euColumn: 'אירופה',
    chestColumn: 'חזה (ס"מ)',
    waistColumn: 'מותן (ס"מ)',
    hipsColumn: 'ירכיים (ס"מ)',
    footLengthColumn: 'אורך כף רגל (ס"מ)',
    notes: 'מידות עשויות להשתנות לפי מותג וסגנון',
  },
};

// Measurement conversions (inches to cm for Arabic/Hebrew)
const MEASUREMENT_CONVERSIONS: Record<string, number> = {
  '32': 81,
  '34': 86,
  '36': 91,
  '38': 97,
  '40': 102,
  '42': 107,
  '44': 112,
  '46': 117,
  '48': 122,
  '50': 127,
};

/**
 * Gets the localized label for a given size
 * @param size - The size code (e.g., 'S', 'M', 'L', 'XL', '2XL', '1X')
 * @param locale - The locale code ('ar', 'he', or 'en')
 * @param category - The product category ('clothing', 'shoes', 'accessories')
 * @returns The localized size label
 */
export function getSizeLabel(
  size: string,
  locale: Locale,
  category: SizeCategory
): string {
  if (!size) {
    return '';
  }

  const normalizedSize = size.toUpperCase().trim();
  
  // For shoes, return with region indicator
  if (category === 'shoes') {
    const translations: Record<Locale, string> = {
      en: `Size ${size} US`,
      ar: `مقاس ${size} أمريكي`,
      he: `מידה ${size} ארה"ב`,
    };
    return translations[locale] || translations.en;
  }

  // Check for plus size notation
  if (PLUS_SIZE_MAP[normalizedSize]) {
    const standardSize = PLUS_SIZE_MAP[normalizedSize];
    const translation = SIZE_TRANSLATIONS[locale]?.[normalizedSize];
    return translation || SIZE_TRANSLATIONS.en[normalizedSize] || standardSize;
  }

  // Get translation for standard sizes
  const translation = SIZE_TRANSLATIONS[locale]?.[normalizedSize];
  if (translation) {
    return translation;
  }

  // Return original size if no translation found
  return normalizedSize;
}

/**
 * Gets all size chart labels for a specific locale
 * @param locale - The locale code ('ar', 'he', or 'en')
 * @returns SizeChartLabels object with localized strings
 */
export function getSizeChartLabels(locale: Locale): SizeChartLabels {
  return (
    SIZE_CHART_LABELS_BY_LOCALE[locale] ||
    SIZE_CHART_LABELS_BY_LOCALE.en
  );
}

/**
 * Converts a size from one region to another
 * @param size - The size to convert
 * @param fromRegion - The source region ('US', 'UK', or 'EU')
 * @param toRegion - The target region ('US', 'UK', or 'EU')
 * @param category - The product category ('clothing', 'shoes', 'accessories')
 * @param options - Additional options for conversion
 * @returns The converted size or null if conversion not possible
 */
export function convertSize(
  size: string | number,
  fromRegion: Region,
  toRegion: Region,
  category: SizeCategory,
  options: { gender?: 'men' | 'women' | 'unisex' } = {}
): string | number | null {
  if (fromRegion === toRegion) {
    return size;
  }

  const sizeStr = String(size).toUpperCase().trim();
  const { gender = 'unisex' } = options;

  // Handle clothing size conversions
  if (category === 'clothing') {
    // Standard letter sizes
    if (CLOTHING_SIZE_CONVERSIONS[sizeStr]) {
      const result = CLOTHING_SIZE_CONVERSIONS[sizeStr][toRegion];
      return result;
    }

    // Numeric sizes (typically women's)
    if (NUMERIC_CLOTHING_CONVERSIONS[sizeStr]) {
      const result = NUMERIC_CLOTHING_CONVERSIONS[sizeStr][toRegion];
      return result;
    }

    return null;
  }

  // Handle shoe size conversions
  if (category === 'shoes') {
    const isWomen = gender === 'women';
    const conversions = isWomen
      ? WOMEN_SHOE_SIZE_CONVERSIONS
      : SHOE_SIZE_CONVERSIONS;

    // Find the matching size entry
    const sizeEntry = conversions[sizeStr];
    if (sizeEntry) {
      return sizeEntry[toRegion];
    }

    // Try to find by value if exact match not found
    for (const [key, values] of Object.entries(conversions)) {
      if (values[fromRegion] === Number(size)) {
        return values[toRegion];
      }
    }

    return null;
  }

  // Handle accessory size conversions
  if (category === 'accessories') {
    if (ACCESSORY_SIZE_CONVERSIONS[sizeStr]) {
      return ACCESSORY_SIZE_CONVERSIONS[sizeStr][toRegion];
    }
    return size;
  }

  return null;
}

/**
 * Gets all available sizes for a category
 * @param category - The product category
 * @returns Array of size strings
 */
export function getAvailableSizes(category: SizeCategory): string[] {
  if (category === 'clothing') {
    return [...CLOTHING_SIZES];
  }
  if (category === 'shoes') {
    return Object.keys(SHOE_SIZE_CONVERSIONS);
  }
  if (category === 'accessories') {
    return ['S', 'M', 'L', 'One Size'];
  }
  return [];
}

/**
 * Gets plus size equivalents for standard sizes
 * @param standardSize - The standard size (e.g., 'XL')
 * @returns Array of plus size options
 */
export function getPlusSizeOptions(standardSize: string): string[] {
  const normalizedSize = standardSize.toUpperCase().trim();
  
  if (normalizedSize === 'XL' || normalizedSize === '2XL') {
    return ['1X', '2X', '3X', '4X'];
  }
  
  return [];
}

/**
 * Converts measurements between inches and centimeters
 * @param measurement - The measurement value
 * @param fromUnit - The source unit ('in' or 'cm')
 * @param toUnit - The target unit ('in' or 'cm')
 * @returns The converted measurement
 */
export function convertMeasurement(
  measurement: number,
  fromUnit: 'in' | 'cm',
  toUnit: 'in' | 'cm'
): number {
  if (fromUnit === toUnit) {
    return measurement;
  }

  if (fromUnit === 'in' && toUnit === 'cm') {
    return Math.round(measurement * 2.54 * 10) / 10;
  }

  if (fromUnit === 'cm' && toUnit === 'in') {
    return Math.round((measurement / 2.54) * 10) / 10;
  }

  return measurement;
}

/**
 * Gets size recommendations based on measurements
 * @param chest - Chest measurement in inches
 * @param waist - Waist measurement in inches
 * @param hips - Hips measurement in inches (optional)
 * @param locale - The locale for recommendations
 * @returns Recommended size
 */
export function getSizeRecommendation(
  chest: number,
  waist: number,
  hips?: number,
  locale: Locale = 'en'
): { size: string; label: string } {
  // Simplified size chart based on chest measurement
  let size = 'M';
  
  if (chest < 34) {
    size = 'XS';
  } else if (chest < 36) {
    size = 'S';
  } else if (chest < 40) {
    size = 'M';
  } else if (chest < 44) {
    size = 'L';
  } else if (chest < 48) {
    size = 'XL';
  } else if (chest < 52) {
    size = '2XL';
  } else if (chest < 56) {
    size = '3XL';
  } else {
    size = '4XL';
  }

  return {
    size,
    label: getSizeLabel(size, locale, 'clothing'),
  };
}

/**
 * Validates if a size string is valid for a category
 * @param size - The size string to validate
 * @param category - The product category
 * @returns Boolean indicating if the size is valid
 */
export function isValidSize(size: string, category: SizeCategory): boolean {
  const normalizedSize = size.toUpperCase().trim();
  
  if (category === 'clothing') {
    return (
      CLOTHING_SIZES.includes(normalizedSize as typeof CLOTHING_SIZES[number]) ||
      Object.keys(PLUS_SIZE_MAP).includes(normalizedSize) ||
      Object.keys(NUMERIC_CLOTHING_CONVERSIONS).includes(size)
    );
  }
  
  if (category === 'shoes') {
    return (
      Object.keys(SHOE_SIZE_CONVERSIONS).includes(size) ||
      Object.keys(WOMEN_SHOE_SIZE_CONVERSIONS).includes(size)
    );
  }
  
  if (category === 'accessories') {
    return Object.keys(ACCESSORY_SIZE_CONVERSIONS).includes(normalizedSize);
  }
  
  return false;
}

// Export constants for testing
export {
  CLOTHING_SIZES,
  PLUS_SIZE_MAP,
  SIZE_TRANSLATIONS,
  SHOE_SIZE_CONVERSIONS,
  WOMEN_SHOE_SIZE_CONVERSIONS,
  CLOTHING_SIZE_CONVERSIONS,
  NUMERIC_CLOTHING_CONVERSIONS,
  ACCESSORY_SIZE_CONVERSIONS,
  SIZE_CHART_LABELS_BY_LOCALE,
  MEASUREMENT_CONVERSIONS,
};
