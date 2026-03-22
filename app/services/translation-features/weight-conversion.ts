/**
 * Weight Unit Conversion Service
 * Handles weight conversions between metric and imperial units
 * Supports RTL locales (Arabic, Hebrew) and English
 */

export type WeightUnit = 'kg' | 'g' | 'lb' | 'oz';
export type SupportedLocale = 'ar' | 'he' | 'en';

export interface WeightConversionResult {
  value: number;
  fromUnit: WeightUnit;
  toUnit: WeightUnit;
  originalValue: number;
}

export interface FormattedWeight {
  value: number;
  unit: WeightUnit;
  formatted: string;
  localized: string;
}

// Conversion factors to grams (base unit)
const CONVERSION_TO_GRAMS: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  lb: 453.59237,
  oz: 28.34952,
};

// Unit labels for different locales
const UNIT_LABELS: Record<WeightUnit, Record<SupportedLocale, string>> = {
  kg: {
    ar: 'كجم',
    he: 'ק"ג',
    en: 'kg',
  },
  g: {
    ar: 'غرام',
    he: 'גרם',
    en: 'g',
  },
  lb: {
    ar: 'رطل',
    he: 'ליברה',
    en: 'lb',
  },
  oz: {
    ar: 'أونصة',
    he: 'אונקיה',
    en: 'oz',
  },
};

// Full unit names for display
const UNIT_NAMES: Record<WeightUnit, Record<SupportedLocale, string>> = {
  kg: {
    ar: 'كيلوغرام',
    he: 'קילוגרם',
    en: 'kilogram',
  },
  g: {
    ar: 'غرام',
    he: 'גרם',
    en: 'gram',
  },
  lb: {
    ar: 'رطل',
    he: 'ליברה',
    en: 'pound',
  },
  oz: {
    ar: 'أونصة',
    he: 'אונקיה',
    en: 'ounce',
  },
};

// Plural forms
const UNIT_PLURALS: Record<WeightUnit, Record<SupportedLocale, string>> = {
  kg: {
    ar: 'كيلوغرامات',
    he: 'קילוגרם',
    en: 'kilograms',
  },
  g: {
    ar: 'غرامات',
    he: 'גרם',
    en: 'grams',
  },
  lb: {
    ar: 'أرطال',
    he: 'ליברות',
    en: 'pounds',
  },
  oz: {
    ar: 'أونصات',
    he: 'אונקיות',
    en: 'ounces',
  },
};

// Decimal separators by locale
const DECIMAL_SEPARATORS: Record<SupportedLocale, string> = {
  ar: '٫',
  he: '.',
  en: '.',
};

// Thousands separators by locale
const THOUSANDS_SEPARATORS: Record<SupportedLocale, string> = {
  ar: '٬',
  he: ',',
  en: ',',
};

/**
 * Convert weight between units
 * @param value - The value to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Conversion result with converted value
 */
export function convertWeight(
  value: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit
): WeightConversionResult {
  if (fromUnit === toUnit) {
    return {
      value,
      fromUnit,
      toUnit,
      originalValue: value,
    };
  }

  // Convert to grams first, then to target unit
  const valueInGrams = value * CONVERSION_TO_GRAMS[fromUnit];
  const convertedValue = valueInGrams / CONVERSION_TO_GRAMS[toUnit];

  return {
    value: convertedValue,
    fromUnit,
    toUnit,
    originalValue: value,
  };
}

/**
 * Get conversion factor between two units
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Conversion factor
 */
export function getConversionFactor(fromUnit: WeightUnit, toUnit: WeightUnit): number {
  if (fromUnit === toUnit) return 1;
  return CONVERSION_TO_GRAMS[fromUnit] / CONVERSION_TO_GRAMS[toUnit];
}

/**
 * Round weight value to appropriate decimal places
 * @param value - Value to round
 * @param unit - Target unit for determining precision
 * @returns Rounded value
 */
export function roundWeight(value: number, unit: WeightUnit): number {
  const decimalPlaces: Record<WeightUnit, number> = {
    kg: 3,
    g: 1,
    lb: 3,
    oz: 2,
  };

  const factor = Math.pow(10, decimalPlaces[unit]);
  return Math.round(value * factor) / factor;
}

/**
 * Format weight value for display
 * @param value - Weight value
 * @param unit - Weight unit
 * @param locale - Locale for formatting
 * @param options - Formatting options
 * @returns Formatted weight string
 */
export function formatWeight(
  value: number,
  unit: WeightUnit,
  locale: SupportedLocale = 'en',
  options: {
    includeUnit?: boolean;
    useFullName?: boolean;
    decimals?: number;
    useArabicNumerals?: boolean;
  } = {}
): string {
  const {
    includeUnit = true,
    useFullName = false,
    decimals,
    useArabicNumerals = false,
  } = options;

  // Determine decimal places
  const defaultDecimals: Record<WeightUnit, number> = {
    kg: 2,
    g: 0,
    lb: 2,
    oz: 1,
  };

  const decimalPlaces = decimals ?? defaultDecimals[unit];

  // Format number
  const formattedNumber = formatNumber(value, decimalPlaces, locale, useArabicNumerals);

  if (!includeUnit) {
    return formattedNumber;
  }

  // Get appropriate unit label
  let unitLabel: string;
  if (useFullName) {
    const isPlural = value !== 1 && value !== -1;
    unitLabel = isPlural ? UNIT_PLURALS[unit][locale] : UNIT_NAMES[unit][locale];
  } else {
    unitLabel = UNIT_LABELS[unit][locale];
  }

  // RTL locales: unit comes before number
  if (locale === 'ar' || locale === 'he') {
    return `${unitLabel} ${formattedNumber}`;
  }

  // LTR: number comes before unit
  return `${formattedNumber} ${unitLabel}`;
}

/**
 * Format number with locale-specific separators
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @param locale - Target locale
 * @param useArabicNumerals - Whether to use Arabic-Indic numerals
 * @returns Formatted number string
 */
function formatNumber(
  value: number,
  decimals: number,
  locale: SupportedLocale,
  useArabicNumerals: boolean
): string {
  // Round to specified decimals
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor) / factor;

  // Use Intl.NumberFormat for standard locales
  if (!useArabicNumerals && locale !== 'ar') {
    return rounded.toLocaleString(locale === 'he' ? 'he-IL' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Manual formatting for Arabic numerals or custom formatting
  const [integerPart, decimalPart] = rounded.toFixed(decimals).split('.');

  // Add thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATORS[locale]);

  let result = formattedInteger;

  if (decimals > 0 && decimalPart) {
    const decimalSep = DECIMAL_SEPARATORS[locale];
    result += decimalSep + decimalPart;
  }

  // Convert to Arabic-Indic numerals if requested
  if (useArabicNumerals) {
    result = toArabicNumerals(result);
  }

  return result;
}

/**
 * Convert Western numerals to Arabic-Indic numerals
 * @param str - String containing numerals
 * @returns String with Arabic-Indic numerals
 */
function toArabicNumerals(str: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (match) => arabicNumerals[parseInt(match)]);
}

/**
 * Get weight unit label for display
 * @param unit - Weight unit
 * @param locale - Target locale
 * @param useFullName - Whether to use full unit name
 * @returns Unit label string
 */
export function getWeightUnitLabel(
  unit: WeightUnit,
  locale: SupportedLocale = 'en',
  useFullName = false
): string {
  if (useFullName) {
    return UNIT_NAMES[unit][locale];
  }
  return UNIT_LABELS[unit][locale];
}

/**
 * Get all supported weight units
 * @returns Array of weight units
 */
export function getSupportedWeightUnits(): WeightUnit[] {
  return ['kg', 'g', 'lb', 'oz'];
}

/**
 * Check if a unit is supported
 * @param unit - Unit to check
 * @returns Boolean indicating if unit is supported
 */
export function isSupportedWeightUnit(unit: string): unit is WeightUnit {
  return ['kg', 'g', 'lb', 'oz'].includes(unit);
}

/**
 * Parse weight string to numeric value
 * @param weightString - String containing weight value
 * @returns Parsed value or null if invalid
 */
export function parseWeight(weightString: string): number | null {
  // Remove unit labels and extra whitespace
  const cleaned = weightString
    .replace(/[كجملبأونصةرطلozglb]/gi, '')
    .replace(/[\s٫٬,.]/g, (match) => {
      // Keep decimal points and convert Arabic decimal
      if (match === '٫') return '.';
      if (match === '.' || match === ',') return match;
      return '';
    })
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Convert weight and format in one operation
 * @param value - Value to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @param locale - Target locale
 * @param options - Formatting options
 * @returns Formatted converted weight
 */
export function convertAndFormatWeight(
  value: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit,
  locale: SupportedLocale = 'en',
  options?: {
    includeUnit?: boolean;
    useFullName?: boolean;
    decimals?: number;
    useArabicNumerals?: boolean;
  }
): string {
  const conversion = convertWeight(value, fromUnit, toUnit);
  return formatWeight(conversion.value, toUnit, locale, options);
}

/**
 * Batch convert multiple weights
 * @param items - Array of weights to convert
 * @param targetUnit - Target unit for all conversions
 * @returns Array of conversion results
 */
export function batchConvertWeights(
  items: Array<{ value: number; unit: WeightUnit; id?: string }>,
  targetUnit: WeightUnit
): Array<WeightConversionResult & { id?: string }> {
  return items.map((item) => ({
    ...convertWeight(item.value, item.unit, targetUnit),
    id: item.id,
  }));
}

/**
 * Compare two weights (handles different units)
 * @param weight1 - First weight with unit
 * @param weight2 - Second weight with unit
 * @returns Comparison result (-1, 0, 1)
 */
export function compareWeights(
  weight1: { value: number; unit: WeightUnit },
  weight2: { value: number; unit: WeightUnit }
): number {
  // Convert both to grams for comparison
  const grams1 = weight1.value * CONVERSION_TO_GRAMS[weight1.unit];
  const grams2 = weight2.value * CONVERSION_TO_GRAMS[weight2.unit];

  if (grams1 < grams2) return -1;
  if (grams1 > grams2) return 1;
  return 0;
}

/**
 * Get the heavier of two weights
 * @param weight1 - First weight
 * @param weight2 - Second weight
 * @returns The heavier weight
 */
export function maxWeight(
  weight1: { value: number; unit: WeightUnit },
  weight2: { value: number; unit: WeightUnit }
): { value: number; unit: WeightUnit } {
  const comparison = compareWeights(weight1, weight2);
  return comparison >= 0 ? weight1 : weight2;
}

/**
 * Get the lighter of two weights
 * @param weight1 - First weight
 * @param weight2 - Second weight
 * @returns The lighter weight
 */
export function minWeight(
  weight1: { value: number; unit: WeightUnit },
  weight2: { value: number; unit: WeightUnit }
): { value: number; unit: WeightUnit } {
  const comparison = compareWeights(weight1, weight2);
  return comparison <= 0 ? weight1 : weight2;
}

/**
 * Sum multiple weights
 * @param weights - Array of weights
 * @param targetUnit - Unit for result
 * @returns Sum in target unit
 */
export function sumWeights(
  weights: Array<{ value: number; unit: WeightUnit }>,
  targetUnit: WeightUnit
): number {
  return weights.reduce((sum, weight) => {
    const converted = convertWeight(weight.value, weight.unit, targetUnit);
    return sum + converted.value;
  }, 0);
}

/**
 * Calculate average weight
 * @param weights - Array of weights
 * @param targetUnit - Unit for result
 * @returns Average in target unit, or null if empty array
 */
export function averageWeight(
  weights: Array<{ value: number; unit: WeightUnit }>,
  targetUnit: WeightUnit
): number | null {
  if (weights.length === 0) return null;
  return sumWeights(weights, targetUnit) / weights.length;
}

/**
 * Format weight range
 * @param min - Minimum weight
 * @param max - Maximum weight
 * @param unit - Weight unit
 * @param locale - Target locale
 * @returns Formatted range string
 */
export function formatWeightRange(
  min: number,
  max: number,
  unit: WeightUnit,
  locale: SupportedLocale = 'en'
): string {
  const minFormatted = formatWeight(min, unit, locale, { includeUnit: false });
  const maxFormatted = formatWeight(max, unit, locale, { includeUnit: false });
  const unitLabel = getWeightUnitLabel(unit, locale);

  if (min === max) {
    return formatWeight(min, unit, locale);
  }

  // RTL locales
  if (locale === 'ar' || locale === 'he') {
    const separator = locale === 'ar' ? ' - ' : ' - ';
    return `${unitLabel} ${minFormatted}${separator}${maxFormatted}`;
  }

  return `${minFormatted} - ${maxFormatted} ${unitLabel}`;
}

/**
 * Detect appropriate unit for a weight value
 * @param valueInGrams - Weight in grams
 * @param preferredSystem - Preferred unit system ('metric' | 'imperial')
 * @returns Suggested unit
 */
export function suggestUnit(
  valueInGrams: number,
  preferredSystem: 'metric' | 'imperial' = 'metric'
): WeightUnit {
  if (preferredSystem === 'metric') {
    if (valueInGrams >= 1000) return 'kg';
    return 'g';
  } else {
    const ounces = valueInGrams / CONVERSION_TO_GRAMS.oz;
    if (ounces >= 16) return 'lb';
    return 'oz';
  }
}

/**
 * Convert to preferred unit based on value
 * @param value - Weight value
 * @param unit - Current unit
 * @param preferredSystem - Preferred unit system
 * @returns Object with converted value and unit
 */
export function convertToPreferredUnit(
  value: number,
  unit: WeightUnit,
  preferredSystem: 'metric' | 'imperial' = 'metric'
): { value: number; unit: WeightUnit } {
  // First convert to grams to evaluate magnitude
  const inGrams = convertWeight(value, unit, 'g').value;
  const suggestedUnit = suggestUnit(inGrams, preferredSystem);
  
  if (suggestedUnit === unit) {
    return { value, unit };
  }
  
  const converted = convertWeight(value, unit, suggestedUnit);
  return { value: converted.value, unit: suggestedUnit };
}
