/**
 * Temperature Conversion Service
 * Handles temperature unit conversions between Celsius, Fahrenheit, and Kelvin
 * with RTL locale support (Arabic, Hebrew, English)
 */

export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';
export type TemperatureLocale = 'ar' | 'he' | 'en';

export interface TemperatureConversionResult {
  value: number;
  fromUnit: TemperatureUnit;
  toUnit: TemperatureUnit;
  formatted: string;
}

export interface TemperatureFormatOptions {
  includeUnit?: boolean;
  decimalPlaces?: number;
}

// Temperature unit symbols
const UNIT_SYMBOLS: Record<TemperatureUnit, string> = {
  celsius: '°C',
  fahrenheit: '°F',
  kelvin: 'K',
};

// Unit labels for different locales
const UNIT_LABELS: Record<TemperatureUnit, Record<TemperatureLocale, string>> = {
  celsius: {
    ar: 'درجة مئوية',
    he: 'צלזיוס',
    en: 'Celsius',
  },
  fahrenheit: {
    ar: 'فهرنهايت',
    he: 'פרנהייט',
    en: 'Fahrenheit',
  },
  kelvin: {
    ar: 'كلفن',
    he: 'קלווין',
    en: 'Kelvin',
  },
};

// Short unit labels for different locales
const SHORT_UNIT_LABELS: Record<TemperatureUnit, Record<TemperatureLocale, string>> = {
  celsius: {
    ar: '°م',
    he: '°C',
    en: '°C',
  },
  fahrenheit: {
    ar: '°ف',
    he: '°F',
    en: '°F',
  },
  kelvin: {
    ar: 'ك',
    he: 'K',
    en: 'K',
  },
};

// Absolute zero constants (for validation)
export const ABSOLUTE_ZERO = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0,
};

// Common temperature reference points
export const TEMPERATURE_REFERENCE_POINTS = {
  waterFreezing: {
    celsius: 0,
    fahrenheit: 32,
    kelvin: 273.15,
  },
  waterBoiling: {
    celsius: 100,
    fahrenheit: 212,
    kelvin: 373.15,
  },
  roomTemperature: {
    celsius: 20,
    fahrenheit: 68,
    kelvin: 293.15,
  },
  bodyTemperature: {
    celsius: 37,
    fahrenheit: 98.6,
    kelvin: 310.15,
  },
};

/**
 * Convert temperature between units
 * Supports Celsius, Fahrenheit, and Kelvin
 */
export function convertTemperature(
  value: number,
  fromUnit: TemperatureUnit,
  toUnit: TemperatureUnit
): number {
  // If same unit, return original value
  if (fromUnit === toUnit) {
    return value;
  }

  // Convert to Celsius first (as intermediate step)
  let celsiusValue: number;
  
  switch (fromUnit) {
    case 'celsius':
      celsiusValue = value;
      break;
    case 'fahrenheit':
      celsiusValue = (value - 32) * (5 / 9);
      break;
    case 'kelvin':
      celsiusValue = value - 273.15;
      break;
    default:
      throw new Error(`Unsupported fromUnit: ${fromUnit}`);
  }

  // Convert from Celsius to target unit
  switch (toUnit) {
    case 'celsius':
      return celsiusValue;
    case 'fahrenheit':
      return (celsiusValue * (9 / 5)) + 32;
    case 'kelvin':
      return celsiusValue + 273.15;
    default:
      throw new Error(`Unsupported toUnit: ${toUnit}`);
  }
}

/**
 * Convert temperature with full result object
 */
export function convertTemperatureWithResult(
  value: number,
  fromUnit: TemperatureUnit,
  toUnit: TemperatureUnit,
  locale: TemperatureLocale = 'en',
  options: TemperatureFormatOptions = {}
): TemperatureConversionResult {
  const convertedValue = convertTemperature(value, fromUnit, toUnit);
  
  return {
    value: convertedValue,
    fromUnit,
    toUnit,
    formatted: formatTemperature(convertedValue, toUnit, locale, options),
  };
}

/**
 * Format temperature value with unit for display
 */
export function formatTemperature(
  value: number,
  unit: TemperatureUnit,
  locale: TemperatureLocale = 'en',
  options: TemperatureFormatOptions = {}
): string {
  const { includeUnit = true, decimalPlaces = 1 } = options;
  
  // Format number with specified decimal places
  const formattedNumber = formatNumber(value, decimalPlaces, locale);
  
  if (!includeUnit) {
    return formattedNumber;
  }
  
  const symbol = getTemperatureUnitSymbol(unit);
  
  // For RTL locales (Arabic, Hebrew), the unit typically comes before the number
  if (locale === 'ar' || locale === 'he') {
    return `${symbol} ${formattedNumber}`;
  }
  
  return `${formattedNumber}${symbol}`;
}

/**
 * Format number with locale-appropriate formatting
 */
function formatNumber(value: number, decimalPlaces: number, locale: TemperatureLocale): string {
  const rounded = roundToDecimalPlaces(value, decimalPlaces);
  
  // Use locale-specific number formatting
  const formatter = new Intl.NumberFormat(getLocaleString(locale), {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
  
  return formatter.format(rounded);
}

/**
 * Get the BCP 47 locale string
 */
function getLocaleString(locale: TemperatureLocale): string {
  const localeMap: Record<TemperatureLocale, string> = {
    ar: 'ar-SA',
    he: 'he-IL',
    en: 'en-US',
  };
  return localeMap[locale];
}

/**
 * Round number to specified decimal places
 */
function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
}

/**
 * Get the unit symbol (e.g., °C, °F, K)
 */
export function getTemperatureUnitSymbol(unit: TemperatureUnit): string {
  return UNIT_SYMBOLS[unit];
}

/**
 * Get the full unit label in the specified locale
 */
export function getTemperatureUnitLabel(
  unit: TemperatureUnit,
  locale: TemperatureLocale = 'en'
): string {
  return UNIT_LABELS[unit][locale];
}

/**
 * Get the short unit label in the specified locale
 */
export function getTemperatureShortLabel(
  unit: TemperatureUnit,
  locale: TemperatureLocale = 'en'
): string {
  return SHORT_UNIT_LABELS[unit][locale];
}

/**
 * Get all available temperature units
 */
export function getAllTemperatureUnits(): TemperatureUnit[] {
  return ['celsius', 'fahrenheit', 'kelvin'];
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): TemperatureLocale[] {
  return ['ar', 'he', 'en'];
}

/**
 * Validate if a temperature is physically possible (above absolute zero)
 */
export function isValidTemperature(value: number, unit: TemperatureUnit): boolean {
  const absoluteZero = ABSOLUTE_ZERO[unit];
  return value >= absoluteZero;
}

/**
 * Detect the most appropriate unit based on locale
 */
export function detectUnitFromLocale(locale: string): TemperatureUnit {
  const localeLower = locale.toLowerCase();
  
  // Countries using Fahrenheit
  const fahrenheitCountries = ['us', 'bz', 'bs', 'ky', 'pw', 'fm', 'mh', 'lr', 'mm'];
  
  for (const country of fahrenheitCountries) {
    if (localeLower.includes(country)) {
      return 'fahrenheit';
    }
  }
  
  // Default to Celsius for most countries
  return 'celsius';
}

/**
 * Batch convert multiple temperature values
 */
export function batchConvertTemperatures(
  items: Array<{ value: number; fromUnit: TemperatureUnit; toUnit: TemperatureUnit; id?: string }>,
  locale: TemperatureLocale = 'en',
  options: TemperatureFormatOptions = {}
): Array<TemperatureConversionResult & { id?: string }> {
  return items.map((item) => ({
    ...convertTemperatureWithResult(
      item.value,
      item.fromUnit,
      item.toUnit,
      locale,
      options
    ),
    id: item.id,
  }));
}

/**
 * Compare two temperatures (returns difference in target unit)
 */
export function compareTemperatures(
  temp1: { value: number; unit: TemperatureUnit },
  temp2: { value: number; unit: TemperatureUnit },
  targetUnit: TemperatureUnit = 'celsius'
): number {
  const t1 = convertTemperature(temp1.value, temp1.unit, targetUnit);
  const t2 = convertTemperature(temp2.value, temp2.unit, targetUnit);
  return t1 - t2;
}

/**
 * Get temperature range display
 */
export function formatTemperatureRange(
  min: number,
  max: number,
  unit: TemperatureUnit,
  locale: TemperatureLocale = 'en',
  options: TemperatureFormatOptions = {}
): string {
  const minFormatted = formatTemperature(min, unit, locale, options);
  const maxFormatted = formatTemperature(max, unit, locale, options);
  
  if (min === max) {
    return minFormatted;
  }
  
  // Use appropriate separator for locale
  const separator = locale === 'ar' || locale === 'he' ? ' - ' : ' - ';
  return `${minFormatted}${separator}${maxFormatted}`;
}

/**
 * Calculate average temperature
 */
export function calculateAverageTemperature(
  temperatures: Array<{ value: number; unit: TemperatureUnit }>,
  targetUnit: TemperatureUnit = 'celsius'
): { value: number; formatted: string } {
  if (temperatures.length === 0) {
    return { value: 0, formatted: '0' };
  }
  
  const sum = temperatures.reduce((acc, temp) => {
    return acc + convertTemperature(temp.value, temp.unit, targetUnit);
  }, 0);
  
  const average = sum / temperatures.length;
  
  return {
    value: average,
    formatted: formatTemperature(average, targetUnit, 'en', { decimalPlaces: 2 }),
  };
}

/**
 * Parse temperature string to numeric value
 */
export function parseTemperature(
  tempString: string,
  defaultUnit: TemperatureUnit = 'celsius'
): { value: number; unit: TemperatureUnit } | null {
  const trimmed = tempString.trim();
  
  // Extract number from string
  const numberMatch = trimmed.match(/-?\d+(?:\.\d+)?/);
  if (!numberMatch) {
    return null;
  }
  
  const value = parseFloat(numberMatch[0]);
  
  // Detect unit from string
  let unit: TemperatureUnit = defaultUnit;
  const lowerTrimmed = trimmed.toLowerCase();
  
  if (lowerTrimmed.includes('°c') || lowerTrimmed.includes('celsius') || lowerTrimmed.includes('c')) {
    unit = 'celsius';
  } else if (lowerTrimmed.includes('°f') || lowerTrimmed.includes('fahrenheit') || lowerTrimmed.includes('f')) {
    unit = 'fahrenheit';
  } else if (lowerTrimmed.includes('k') || lowerTrimmed.includes('kelvin')) {
    unit = 'kelvin';
  }
  
  return { value, unit };
}
