/**
 * Dimension Conversion Service
 * Handles product dimension conversions (length, width, height)
 * Supports metric (cm, m) and imperial (in, ft) units
 * Localized for Arabic (ar), Hebrew (he), and English (en) locales
 */

export type DimensionUnit = 'cm' | 'm' | 'in' | 'ft';

export interface DimensionValue {
  value: number;
  unit: DimensionUnit;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface ConversionResult {
  originalValue: number;
  originalUnit: DimensionUnit;
  convertedValue: number;
  targetUnit: DimensionUnit;
  rounded: number;
  timestamp: Date;
}

export interface FormattedDimensions {
  length: string;
  width: string;
  height: string;
  unit: string;
  fullFormat: string;
}

// Conversion factors to centimeters (base unit)
const TO_CM: Record<DimensionUnit, number> = {
  cm: 1,
  m: 100,
  in: 2.54,
  ft: 30.48,
};

// Conversion factors from centimeters
const FROM_CM: Record<DimensionUnit, number> = {
  cm: 1,
  m: 0.01,
  in: 1 / 2.54,
  ft: 1 / 30.48,
};

// Unit labels by locale
const UNIT_LABELS: Record<DimensionUnit, Record<string, string>> = {
  cm: {
    en: 'cm',
    ar: 'سم',
    he: 'ס"מ',
  },
  m: {
    en: 'm',
    ar: 'م',
    he: 'מ"',
  },
  in: {
    en: 'in',
    ar: 'بوصة',
    he: '"',
  },
  ft: {
    en: 'ft',
    ar: 'قدم',
    he: 'רגל',
  },
};

// Dimension name labels by locale
const DIMENSION_NAMES: Record<string, Record<string, string>> = {
  length: {
    en: 'Length',
    ar: 'الطول',
    he: 'אורך',
  },
  width: {
    en: 'Width',
    ar: 'العرض',
    he: 'רוחב',
  },
  height: {
    en: 'Height',
    ar: 'الارتفاع',
    he: 'גובה',
  },
};

// Separators by locale
const LOCALE_CONFIG: Record<string, { separator: string; order: 'ltr' | 'rtl' }> = {
  en: { separator: ' x ', order: 'ltr' },
  ar: { separator: ' × ', order: 'rtl' },
  he: { separator: ' × ', order: 'rtl' },
};

/**
 * Convert a dimension value from one unit to another
 * @param value - The numeric value to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @returns The converted value
 */
export function convertDimension(
  value: number,
  fromUnit: DimensionUnit,
  toUnit: DimensionUnit
): number {
  if (fromUnit === toUnit) {
    return value;
  }

  // Convert to cm first, then to target unit
  const inCm = value * TO_CM[fromUnit];
  return inCm * FROM_CM[toUnit];
}

/**
 * Convert a dimension with full result details
 * @param value - The numeric value to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @param decimals - Number of decimal places (default: 2)
 * @returns Conversion result object
 */
export function convertDimensionDetailed(
  value: number,
  fromUnit: DimensionUnit,
  toUnit: DimensionUnit,
  decimals: number = 2
): ConversionResult {
  const convertedValue = convertDimension(value, fromUnit, toUnit);
  const rounded = roundToDecimals(convertedValue, decimals);

  return {
    originalValue: value,
    originalUnit: fromUnit,
    convertedValue,
    targetUnit: toUnit,
    rounded,
    timestamp: new Date(),
  };
}

/**
 * Convert dimensions object to a different unit
 * @param dimensions - Dimensions object with length, width, height, and unit
 * @param toUnit - Target unit
 * @returns New dimensions object in target unit
 */
export function convertDimensions(
  dimensions: Dimensions,
  toUnit: DimensionUnit
): Dimensions {
  return {
    length: convertDimension(dimensions.length, dimensions.unit, toUnit),
    width: convertDimension(dimensions.width, dimensions.unit, toUnit),
    height: convertDimension(dimensions.height, dimensions.unit, toUnit),
    unit: toUnit,
  };
}

/**
 * Format dimensions for display with locale support
 * @param width - Width value
 * @param height - Height value
 * @param depth - Depth value (or length)
 * @param unit - Unit of measurement
 * @param locale - Locale code ('ar', 'he', 'en')
 * @param options - Formatting options
 * @returns Formatted dimensions object
 */
export function formatDimensions(
  width: number,
  height: number,
  depth: number,
  unit: DimensionUnit,
  locale: string = 'en',
  options: {
    decimals?: number;
    includeUnit?: boolean;
    useFullUnitName?: boolean;
  } = {}
): FormattedDimensions {
  const { decimals = 1, includeUnit = true, useFullUnitName = false } = options;
  const unitLabel = getDimensionUnitLabel(unit, locale, useFullUnitName);

  const formatValue = (val: number): string => {
    const rounded = roundToDecimals(val, decimals);
    // Remove trailing zeros for cleaner display
    const formatted = rounded.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
    return formatted;
  };

  const formattedWidth = formatValue(width);
  const formattedHeight = formatValue(height);
  const formattedDepth = formatValue(depth);

  const config = LOCALE_CONFIG[locale] || LOCALE_CONFIG.en;
  const separator = config.separator;

  // Build full format: "W x H x D unit" or "unit: W x H x D" for RTL
  let fullFormat: string;
  if (locale === 'ar' || locale === 'he') {
    // RTL format: dimensions first, then unit
    const dims = `${formattedWidth}${separator}${formattedHeight}${separator}${formattedDepth}`;
    fullFormat = includeUnit ? `${dims} ${unitLabel}` : dims;
  } else {
    // LTR format: dimensions first, then unit
    const dims = `${formattedWidth}${separator}${formattedHeight}${separator}${formattedDepth}`;
    fullFormat = includeUnit ? `${dims} ${unitLabel}` : dims;
  }

  return {
    length: formattedDepth, // depth is often used as length
    width: formattedWidth,
    height: formattedHeight,
    unit: unitLabel,
    fullFormat,
  };
}

/**
 * Get unit label for a specific locale
 * @param unit - Dimension unit
 * @param locale - Locale code ('ar', 'he', 'en')
 * @param fullName - Whether to use full name instead of abbreviation
 * @returns Localized unit label
 */
export function getDimensionUnitLabel(
  unit: DimensionUnit,
  locale: string = 'en',
  fullName: boolean = false
): string {
  const labels = UNIT_LABELS[unit];
  const label = labels[locale] || labels.en;

  if (fullName) {
    const fullNames: Record<DimensionUnit, Record<string, string>> = {
      cm: {
        en: 'centimeters',
        ar: 'سنتيمتر',
        he: 'סנטימטרים',
      },
      m: {
        en: 'meters',
        ar: 'متر',
        he: 'מטרים',
      },
      in: {
        en: 'inches',
        ar: 'بوصات',
        he: 'אינצ\'ים',
      },
      ft: {
        en: 'feet',
        ar: 'أقدام',
        he: 'רגליים',
      },
    };
    return fullNames[unit][locale] || fullNames[unit].en;
  }

  return label;
}

/**
 * Get dimension name label for a specific locale
 * @param dimension - Dimension type ('length', 'width', 'height')
 * @param locale - Locale code ('ar', 'he', 'en')
 * @returns Localized dimension name
 */
export function getDimensionName(
  dimension: 'length' | 'width' | 'height',
  locale: string = 'en'
): string {
  return DIMENSION_NAMES[dimension][locale] || DIMENSION_NAMES[dimension].en;
}

/**
 * Format a single dimension value with unit
 * @param value - Numeric value
 * @param unit - Dimension unit
 * @param locale - Locale code
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatDimension(
  value: number,
  unit: DimensionUnit,
  locale: string = 'en',
  decimals: number = 1
): string {
  const rounded = roundToDecimals(value, decimals);
  const formatted = rounded.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
  const unitLabel = getDimensionUnitLabel(unit, locale);

  if (locale === 'ar' || locale === 'he') {
    return `${formatted} ${unitLabel}`;
  }
  return `${formatted} ${unitLabel}`;
}

/**
 * Detect the most appropriate unit based on value magnitude
 * @param value - Value in centimeters
 * @returns Suggested unit
 */
export function suggestUnit(value: number): DimensionUnit {
  if (value >= 100) return 'm';
  if (value >= 30.48) return 'ft';
  if (value >= 2.54) return 'in';
  return 'cm';
}

/**
 * Convert and auto-format dimensions to the most appropriate unit
 * @param dimensions - Dimensions in any unit
 * @param locale - Locale code
 * @returns Auto-converted and formatted dimensions
 */
export function autoConvertDimensions(
  dimensions: Dimensions,
  locale: string = 'en'
): FormattedDimensions {
  // Find the largest dimension to determine appropriate unit
  const maxValue = Math.max(dimensions.length, dimensions.width, dimensions.height);
  const maxInCm = convertDimension(maxValue, dimensions.unit, 'cm');
  const suggestedUnit = suggestUnit(maxInCm);

  // Convert all dimensions to suggested unit
  const converted = convertDimensions(dimensions, suggestedUnit);

  return formatDimensions(
    converted.width,
    converted.height,
    converted.length,
    suggestedUnit,
    locale
  );
}

/**
 * Compare two dimensions
 * @param dim1 - First dimension
 * @param dim2 - Second dimension
 * @returns Comparison result (-1, 0, 1)
 */
export function compareDimensions(
  dim1: DimensionValue,
  dim2: DimensionValue
): number {
  // Normalize both to cm
  const val1 = convertDimension(dim1.value, dim1.unit, 'cm');
  const val2 = convertDimension(dim2.value, dim2.unit, 'cm');

  if (val1 < val2) return -1;
  if (val1 > val2) return 1;
  return 0;
}

/**
 * Check if dimensions are equal (within tolerance)
 * @param dim1 - First dimension
 * @param dim2 - Second dimension
 * @param tolerance - Allowed difference in cm (default: 0.01)
 * @returns Boolean indicating equality
 */
export function areDimensionsEqual(
  dim1: DimensionValue,
  dim2: DimensionValue,
  tolerance: number = 0.01
): boolean {
  const val1 = convertDimension(dim1.value, dim1.unit, 'cm');
  const val2 = convertDimension(dim2.value, dim2.unit, 'cm');
  return Math.abs(val1 - val2) <= tolerance;
}

/**
 * Parse a dimension string
 * @param input - Input string (e.g., "10 cm", "5.5 in")
 * @returns Parsed dimension or null if invalid
 */
export function parseDimension(input: string): DimensionValue | null {
  const trimmed = input.trim();
  const match = trimmed.match(/^([\d.]+)\s*(cm|m|in|ft|inch|inches|foot|feet|centimeter|centimeters|meter|meters)?$/i);

  if (!match) return null;

  const value = parseFloat(match[1]);
  const unitInput = match[2]?.toLowerCase() || 'cm';

  const unitMap: Record<string, DimensionUnit> = {
    cm: 'cm',
    m: 'm',
    meter: 'm',
    meters: 'm',
    in: 'in',
    inch: 'in',
    inches: 'in',
    ft: 'ft',
    foot: 'ft',
    feet: 'ft',
    centimeter: 'cm',
    centimeters: 'cm',
  };

  const unit = unitMap[unitInput] || 'cm';

  return { value, unit };
}

/**
 * Parse dimension string in LxWxH format
 * @param input - Input string (e.g., "10 x 5 x 3 cm")
 * @returns Parsed dimensions or null if invalid
 */
export function parseDimensions(input: string): Dimensions | null {
  const trimmed = input.trim();
  
  // Match pattern: number x number x number [unit]
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|m|in|ft)?$/i);
  
  if (!match) return null;

  const length = parseFloat(match[1]);
  const width = parseFloat(match[2]);
  const height = parseFloat(match[3]);
  const unitInput = match[4]?.toLowerCase() || 'cm';

  const unitMap: Record<string, DimensionUnit> = {
    cm: 'cm',
    m: 'm',
    in: 'in',
    ft: 'ft',
  };

  const unit = unitMap[unitInput] || 'cm';

  return { length, width, height, unit };
}

/**
 * Get all supported units
 * @returns Array of dimension units
 */
export function getSupportedUnits(): DimensionUnit[] {
  return ['cm', 'm', 'in', 'ft'];
}

/**
 * Check if a unit is supported
 * @param unit - Unit to check
 * @returns Boolean indicating support
 */
export function isSupportedUnit(unit: string): unit is DimensionUnit {
  return ['cm', 'm', 'in', 'ft'].includes(unit);
}

/**
 * Get conversion rate between two units
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Conversion rate
 */
export function getConversionRate(
  fromUnit: DimensionUnit,
  toUnit: DimensionUnit
): number {
  if (fromUnit === toUnit) return 1;
  return TO_CM[fromUnit] * FROM_CM[toUnit];
}

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format dimensions as a specification string
 * @param dimensions - Dimensions object
 * @param locale - Locale code
 * @returns Specification string
 */
export function formatDimensionSpec(
  dimensions: Dimensions,
  locale: string = 'en'
): string {
  const { length, width, height, unit } = dimensions;
  const unitLabel = getDimensionUnitLabel(unit, locale);

  const config = LOCALE_CONFIG[locale] || LOCALE_CONFIG.en;
  const separator = config.separator;

  if (locale === 'ar') {
    return `${length}${separator}${width}${separator}${height} ${unitLabel}`;
  } else if (locale === 'he') {
    return `${length}${separator}${width}${separator}${height} ${unitLabel}`;
  }

  return `${length}${separator}${width}${separator}${height} ${unitLabel}`;
}

/**
 * Batch convert multiple dimension values
 * @param values - Array of dimension values
 * @param toUnit - Target unit
 * @returns Array of converted values
 */
export function batchConvertDimensions(
  values: DimensionValue[],
  toUnit: DimensionUnit
): number[] {
  return values.map((dv) => convertDimension(dv.value, dv.unit, toUnit));
}

/**
 * Get preferred unit for a locale (metric for most, but can be customized)
 * @param locale - Locale code
 * @returns Preferred unit
 */
export function getPreferredUnit(locale: string): DimensionUnit {
  // Most locales prefer metric, but we could add exceptions
  // For now, default to cm for all
  return 'cm';
}
