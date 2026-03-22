/**
 * Measurement Units Translation Service
 * Handles unit conversions between metric and imperial systems
 * with proper localization for Arabic, Hebrew, and English
 */

// Unit definitions with conversion factors to base units
export type UnitCategory = 'length' | 'weight' | 'volume' | 'area' | 'temperature';

export interface UnitDefinition {
  code: string;
  category: UnitCategory;
  symbol: string;
  toBase: number; // Conversion factor to base unit
  baseUnit: string;
  system: 'metric' | 'imperial' | 'universal';
}

// Base units: meter (length), gram (weight), liter (volume), sq_meter (area)
export const UNITS: Record<string, UnitDefinition> = {
  // Length - Metric
  mm: {
    code: 'mm',
    category: 'length',
    symbol: 'mm',
    toBase: 0.001,
    baseUnit: 'm',
    system: 'metric',
  },
  cm: {
    code: 'cm',
    category: 'length',
    symbol: 'cm',
    toBase: 0.01,
    baseUnit: 'm',
    system: 'metric',
  },
  m: {
    code: 'm',
    category: 'length',
    symbol: 'm',
    toBase: 1,
    baseUnit: 'm',
    system: 'metric',
  },
  km: {
    code: 'km',
    category: 'length',
    symbol: 'km',
    toBase: 1000,
    baseUnit: 'm',
    system: 'metric',
  },
  // Length - Imperial
  in: {
    code: 'in',
    category: 'length',
    symbol: '"',
    toBase: 0.0254,
    baseUnit: 'm',
    system: 'imperial',
  },
  ft: {
    code: 'ft',
    category: 'length',
    symbol: "'",
    toBase: 0.3048,
    baseUnit: 'm',
    system: 'imperial',
  },
  yd: {
    code: 'yd',
    category: 'length',
    symbol: 'yd',
    toBase: 0.9144,
    baseUnit: 'm',
    system: 'imperial',
  },
  mi: {
    code: 'mi',
    category: 'length',
    symbol: 'mi',
    toBase: 1609.344,
    baseUnit: 'm',
    system: 'imperial',
  },
  // Weight - Metric
  mg: {
    code: 'mg',
    category: 'weight',
    symbol: 'mg',
    toBase: 0.001,
    baseUnit: 'g',
    system: 'metric',
  },
  g: {
    code: 'g',
    category: 'weight',
    symbol: 'g',
    toBase: 1,
    baseUnit: 'g',
    system: 'metric',
  },
  kg: {
    code: 'kg',
    category: 'weight',
    symbol: 'kg',
    toBase: 1000,
    baseUnit: 'g',
    system: 'metric',
  },
  // Weight - Imperial
  oz: {
    code: 'oz',
    category: 'weight',
    symbol: 'oz',
    toBase: 28.3495,
    baseUnit: 'g',
    system: 'imperial',
  },
  lb: {
    code: 'lb',
    category: 'weight',
    symbol: 'lb',
    toBase: 453.592,
    baseUnit: 'g',
    system: 'imperial',
  },
  // Volume - Metric
  ml: {
    code: 'ml',
    category: 'volume',
    symbol: 'mL',
    toBase: 0.001,
    baseUnit: 'l',
    system: 'metric',
  },
  cl: {
    code: 'cl',
    category: 'volume',
    symbol: 'cL',
    toBase: 0.01,
    baseUnit: 'l',
    system: 'metric',
  },
  l: {
    code: 'l',
    category: 'volume',
    symbol: 'L',
    toBase: 1,
    baseUnit: 'l',
    system: 'metric',
  },
  // Volume - Imperial
  fl_oz: {
    code: 'fl_oz',
    category: 'volume',
    symbol: 'fl oz',
    toBase: 0.0295735,
    baseUnit: 'l',
    system: 'imperial',
  },
  cup: {
    code: 'cup',
    category: 'volume',
    symbol: 'cup',
    toBase: 0.236588,
    baseUnit: 'l',
    system: 'imperial',
  },
  pt: {
    code: 'pt',
    category: 'volume',
    symbol: 'pt',
    toBase: 0.473176,
    baseUnit: 'l',
    system: 'imperial',
  },
  qt: {
    code: 'qt',
    category: 'volume',
    symbol: 'qt',
    toBase: 0.946353,
    baseUnit: 'l',
    system: 'imperial',
  },
  gal: {
    code: 'gal',
    category: 'volume',
    symbol: 'gal',
    toBase: 3.78541,
    baseUnit: 'l',
    system: 'imperial',
  },
  // Area - Metric
  sq_cm: {
    code: 'sq_cm',
    category: 'area',
    symbol: 'cm²',
    toBase: 0.0001,
    baseUnit: 'sq_m',
    system: 'metric',
  },
  sq_m: {
    code: 'sq_m',
    category: 'area',
    symbol: 'm²',
    toBase: 1,
    baseUnit: 'sq_m',
    system: 'metric',
  },
  // Area - Imperial
  sq_in: {
    code: 'sq_in',
    category: 'area',
    symbol: 'in²',
    toBase: 0.00064516,
    baseUnit: 'sq_m',
    system: 'imperial',
  },
  sq_ft: {
    code: 'sq_ft',
    category: 'area',
    symbol: 'ft²',
    toBase: 0.092903,
    baseUnit: 'sq_m',
    system: 'imperial',
  },
};

// Unit translations
export type Locale = 'ar' | 'he' | 'en';

export interface UnitTranslation {
  singular: string;
  dual?: string; // For Arabic dual form
  plural: string;
  symbol: string;
}

export const UNIT_TRANSLATIONS: Record<string, Record<Locale, UnitTranslation>> = {
  // Length
  mm: {
    en: { singular: 'millimeter', plural: 'millimeters', symbol: 'mm' },
    ar: { singular: 'مليمتر', dual: 'مليمتران', plural: 'مليمترات', symbol: 'مم' },
    he: { singular: 'מילימטר', plural: 'מילימטרים', symbol: 'מ"מ' },
  },
  cm: {
    en: { singular: 'centimeter', plural: 'centimeters', symbol: 'cm' },
    ar: { singular: 'سنتيمتر', dual: 'سنتيمتران', plural: 'سنتيمترات', symbol: 'سم' },
    he: { singular: 'סנטימטר', plural: 'סנטימטרים', symbol: 'ס"מ' },
  },
  m: {
    en: { singular: 'meter', plural: 'meters', symbol: 'm' },
    ar: { singular: 'متر', dual: 'متران', plural: 'أمتار', symbol: 'م' },
    he: { singular: 'מטר', plural: 'מטרים', symbol: 'מ"' },
  },
  km: {
    en: { singular: 'kilometer', plural: 'kilometers', symbol: 'km' },
    ar: { singular: 'كيلومتر', dual: 'كيلومتران', plural: 'كيلومترات', symbol: 'كم' },
    he: { singular: 'קילומטר', plural: 'קילומטרים', symbol: 'ק"מ' },
  },
  in: {
    en: { singular: 'inch', plural: 'inches', symbol: '"' },
    ar: { singular: 'بوصة', dual: 'بوصتان', plural: 'بوصات', symbol: 'بوصة' },
    he: { singular: 'אינץ', plural: 'אינצ\'ים', symbol: '"' },
  },
  ft: {
    en: { singular: 'foot', plural: 'feet', symbol: "'" },
    ar: { singular: 'قدم', dual: 'قدمان', plural: 'أقدام', symbol: 'قدم' },
    he: { singular: 'רגל', plural: 'רגליים', symbol: 'רגל' },
  },
  yd: {
    en: { singular: 'yard', plural: 'yards', symbol: 'yd' },
    ar: { singular: 'ياردة', dual: 'ياردتان', plural: 'ياردات', symbol: 'ياردة' },
    he: { singular: 'יארד', plural: 'יארדים', symbol: 'יארד' },
  },
  mi: {
    en: { singular: 'mile', plural: 'miles', symbol: 'mi' },
    ar: { singular: 'ميل', dual: 'ميلان', plural: 'أميال', symbol: 'ميل' },
    he: { singular: 'מייל', plural: 'מיילים', symbol: 'מייל' },
  },
  // Weight
  mg: {
    en: { singular: 'milligram', plural: 'milligrams', symbol: 'mg' },
    ar: { singular: 'مليغرام', dual: 'مليغرامان', plural: 'مليغرامات', symbol: 'مغ' },
    he: { singular: 'מיליגרם', plural: 'מיליגרמים', symbol: 'מ"ג' },
  },
  g: {
    en: { singular: 'gram', plural: 'grams', symbol: 'g' },
    ar: { singular: 'غرام', dual: 'غرامان', plural: 'غرامات', symbol: 'غ' },
    he: { singular: 'גרם', plural: 'גרמים', symbol: 'גר\'' },
  },
  kg: {
    en: { singular: 'kilogram', plural: 'kilograms', symbol: 'kg' },
    ar: { singular: 'كيلوغرام', dual: 'كيلوغرامان', plural: 'كيلوغرامات', symbol: 'كغ' },
    he: { singular: 'קילוגרם', plural: 'קילוגרמים', symbol: 'ק"ג' },
  },
  oz: {
    en: { singular: 'ounce', plural: 'ounces', symbol: 'oz' },
    ar: { singular: 'أونصة', dual: 'أونصتان', plural: 'أونصات', symbol: 'أونصة' },
    he: { singular: 'אונקיה', plural: 'אונקיות', symbol: 'אונקיה' },
  },
  lb: {
    en: { singular: 'pound', plural: 'pounds', symbol: 'lb' },
    ar: { singular: 'رطل', dual: 'رطلان', plural: 'أرطال', symbol: 'رطل' },
    he: { singular: 'ליברה', plural: 'ליברות', symbol: 'lb' },
  },
  // Volume
  ml: {
    en: { singular: 'milliliter', plural: 'milliliters', symbol: 'mL' },
    ar: { singular: 'مليلتر', dual: 'مليلتران', plural: 'مليلترات', symbol: 'مل' },
    he: { singular: 'מיליליטר', plural: 'מיליליטרים', symbol: 'מ"ל' },
  },
  cl: {
    en: { singular: 'centiliter', plural: 'centiliters', symbol: 'cL' },
    ar: { singular: 'سنتيلتر', dual: 'سنتيلتران', plural: 'سنتيلترات', symbol: 'سل' },
    he: { singular: 'סנטיליטר', plural: 'סנטיליטרים', symbol: 'ס"ל' },
  },
  l: {
    en: { singular: 'liter', plural: 'liters', symbol: 'L' },
    ar: { singular: 'لتر', dual: 'لتران', plural: 'لترات', symbol: 'ل' },
    he: { singular: 'ליטר', plural: 'ליטרים', symbol: 'ל\'' },
  },
  fl_oz: {
    en: { singular: 'fluid ounce', plural: 'fluid ounces', symbol: 'fl oz' },
    ar: { singular: 'أونصة سائلة', dual: 'أونصتان سائلتان', plural: 'أونصات سائلة', symbol: 'أونصة سائلة' },
    he: { singular: 'אונקיית נוזל', plural: 'אונקיות נוזל', symbol: 'fl oz' },
  },
  cup: {
    en: { singular: 'cup', plural: 'cups', symbol: 'cup' },
    ar: { singular: 'كوب', dual: 'كوبان', plural: 'أكواب', symbol: 'كوب' },
    he: { singular: 'כוס', plural: 'כוסות', symbol: 'כוס' },
  },
  pt: {
    en: { singular: 'pint', plural: 'pints', symbol: 'pt' },
    ar: { singular: 'باينت', dual: 'باينتان', plural: 'باينتات', symbol: 'باينت' },
    he: { singular: 'פינט', plural: 'פינטים', symbol: 'pt' },
  },
  qt: {
    en: { singular: 'quart', plural: 'quarts', symbol: 'qt' },
    ar: { singular: 'كوارت', dual: 'كوارتان', plural: 'كوارتات', symbol: 'كوارت' },
    he: { singular: 'קוורט', plural: 'קוורטים', symbol: 'qt' },
  },
  gal: {
    en: { singular: 'gallon', plural: 'gallons', symbol: 'gal' },
    ar: { singular: 'جالون', dual: 'جالونان', plural: 'جالونات', symbol: 'جالون' },
    he: { singular: 'גלון', plural: 'גלונים', symbol: 'גלון' },
  },
  // Area
  sq_cm: {
    en: { singular: 'square centimeter', plural: 'square centimeters', symbol: 'cm²' },
    ar: { singular: 'سنتيمتر مربع', dual: 'سنتيمتران مربعان', plural: 'سنتيمترات مربعة', symbol: 'سم²' },
    he: { singular: 'סנטימטר רבוע', plural: 'סנטימטרים רבועים', symbol: 'ס"מ²' },
  },
  sq_m: {
    en: { singular: 'square meter', plural: 'square meters', symbol: 'm²' },
    ar: { singular: 'متر مربع', dual: 'متران مربعان', plural: 'أمتار مربعة', symbol: 'م²' },
    he: { singular: 'מטר רבוע', plural: 'מטרים רבועים', symbol: 'מ"ר' },
  },
  sq_in: {
    en: { singular: 'square inch', plural: 'square inches', symbol: 'in²' },
    ar: { singular: 'بوصة مربعة', dual: 'بوصتان مربعتان', plural: 'بوصات مربعة', symbol: 'بوصة²' },
    he: { singular: 'אינץ\' רבוע', plural: 'אינץ\'ים רבועים', symbol: 'אינץ\'²' },
  },
  sq_ft: {
    en: { singular: 'square foot', plural: 'square feet', symbol: 'ft²' },
    ar: { singular: 'قدم مربع', dual: 'قدمان مربعان', plural: 'أقدام مربعة', symbol: 'قدم²' },
    he: { singular: 'רגל רבוע', plural: 'רגליים רבועות', symbol: 'רגל²' },
  },
};

// Temperature is special - no linear conversion
// These are offset-based conversions
export function convertCelsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function convertFahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function convertCelsiusToKelvin(celsius: number): number {
  return celsius + 273.15;
}

export function convertKelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

export function convertFahrenheitToKelvin(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9 + 273.15;
}

export function convertKelvinToFahrenheit(kelvin: number): number {
  return ((kelvin - 273.15) * 9) / 5 + 32;
}

// Temperature translations
export const TEMPERATURE_TRANSLATIONS: Record<string, Record<Locale, UnitTranslation>> = {
  celsius: {
    en: { singular: 'degree Celsius', plural: 'degrees Celsius', symbol: '°C' },
    ar: { singular: 'درجة مئوية', dual: 'درجتان مئويتان', plural: 'درجات مئوية', symbol: '°م' },
    he: { singular: 'מעלת צלזיוס', plural: 'מעלות צלזיוס', symbol: '°C' },
  },
  fahrenheit: {
    en: { singular: 'degree Fahrenheit', plural: 'degrees Fahrenheit', symbol: '°F' },
    ar: { singular: 'درجة فهرنهايت', dual: 'درجتان فهرنهايت', plural: 'درجات فهرنهايت', symbol: '°ف' },
    he: { singular: 'מעלת פרנהייט', plural: 'מעלות פרנהייט', symbol: '°F' },
  },
  kelvin: {
    en: { singular: 'kelvin', plural: 'kelvins', symbol: 'K' },
    ar: { singular: 'كلفن', dual: 'كلفنان', plural: 'كلفنات', symbol: 'ك' },
    he: { singular: 'קלווין', plural: 'קלווינים', symbol: 'K' },
  },
};

// Helper to get unit definition
export function getUnit(unitCode: string): UnitDefinition | undefined {
  return UNITS[unitCode.toLowerCase()];
}

// Helper to check if units are compatible
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const u1 = getUnit(unit1);
  const u2 = getUnit(unit2);
  if (!u1 || !u2) return false;
  return u1.category === u2.category;
}

// Helper to get category of a unit
export function getUnitCategory(unitCode: string): UnitCategory | undefined {
  const unit = getUnit(unitCode);
  return unit?.category;
}

// Convert between units
export interface ConversionResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  originalValue: number;
}

/**
 * Convert a value from one unit to another
 * Supports metric and imperial conversions
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): ConversionResult {
  const from = getUnit(fromUnit);
  const to = getUnit(toUnit);

  if (!from || !to) {
    throw new Error(`Unknown unit: ${!from ? fromUnit : toUnit}`);
  }

  if (from.category !== to.category) {
    throw new Error(
      `Incompatible units: cannot convert ${from.category} to ${to.category}`
    );
  }

  // Convert to base unit first, then to target unit
  const baseValue = value * from.toBase;
  const convertedValue = baseValue / to.toBase;

  return {
    value: convertedValue,
    fromUnit,
    toUnit,
    originalValue: value,
  };
}

/**
 * Convert temperature between scales
 * Temperature requires special handling due to offset-based scales
 */
export function convertTemperature(
  value: number,
  fromScale: 'celsius' | 'fahrenheit' | 'kelvin',
  toScale: 'celsius' | 'fahrenheit' | 'kelvin'
): ConversionResult {
  if (fromScale === toScale) {
    return {
      value,
      fromUnit: fromScale,
      toUnit: toScale,
      originalValue: value,
    };
  }

  let result: number;

  if (fromScale === 'celsius') {
    if (toScale === 'fahrenheit') {
      result = convertCelsiusToFahrenheit(value);
    } else {
      result = convertCelsiusToKelvin(value);
    }
  } else if (fromScale === 'fahrenheit') {
    if (toScale === 'celsius') {
      result = convertFahrenheitToCelsius(value);
    } else {
      result = convertFahrenheitToKelvin(value);
    }
  } else {
    // from kelvin
    if (toScale === 'celsius') {
      result = convertKelvinToCelsius(value);
    } else {
      result = convertKelvinToFahrenheit(value);
    }
  }

  return {
    value: result,
    fromUnit: fromScale,
    toUnit: toScale,
    originalValue: value,
  };
}

// Plural forms for different locales
export type PluralForm = 'singular' | 'dual' | 'plural';

/**
 * Determine the plural form based on value and locale
 */
export function getPluralForm(value: number, locale: Locale): PluralForm {
  const absValue = Math.abs(value);

  // Arabic has dual form for exactly 2
  if (locale === 'ar') {
    if (absValue === 2) return 'dual';
    if (absValue === 1 || (absValue >= 3 && absValue <= 10)) return 'singular';
    return 'plural';
  }

  // Hebrew and English: singular only for 1
  if (absValue === 1) return 'singular';
  return 'plural';
}

/**
 * Get the translated label for a unit
 */
export function getUnitLabel(
  unit: string,
  locale: Locale = 'en',
  plural: boolean | PluralForm = false
): string {
  const unitCode = unit.toLowerCase();

  // Handle temperature separately
  if (['celsius', 'fahrenheit', 'kelvin'].includes(unitCode)) {
    const translations = TEMPERATURE_TRANSLATIONS[unitCode];
    if (!translations) return unitCode;

    const translation = translations[locale];
    if (!translation) return translations.en.singular;

    const form: PluralForm =
      typeof plural === 'boolean' ? (plural ? 'plural' : 'singular') : plural;

    if (form === 'dual' && translation.dual) {
      return translation.dual;
    }
    return form === 'singular' ? translation.singular : translation.plural;
  }

  const translations = UNIT_TRANSLATIONS[unitCode];
  if (!translations) return unitCode;

  const translation = translations[locale];
  if (!translation) return translations.en.singular;

  const form: PluralForm =
    typeof plural === 'boolean' ? (plural ? 'plural' : 'singular') : plural;

  if (form === 'dual' && translation.dual) {
    return translation.dual;
  }
  return form === 'singular' ? translation.singular : translation.plural;
}

/**
 * Get the unit symbol for a locale
 */
export function getUnitSymbol(unit: string, locale: Locale = 'en'): string {
  const unitCode = unit.toLowerCase();

  // Handle temperature
  if (['celsius', 'fahrenheit', 'kelvin'].includes(unitCode)) {
    const translations = TEMPERATURE_TRANSLATIONS[unitCode];
    if (!translations) return unitCode;
    return translations[locale]?.symbol || translations.en.symbol;
  }

  const translations = UNIT_TRANSLATIONS[unitCode];
  if (!translations) return unitCode;
  return translations[locale]?.symbol || translations.en.symbol;
}

export interface FormatOptions {
  includeValue?: boolean;
  useSymbol?: boolean;
  decimals?: number;
  plural?: boolean | PluralForm;
}

/**
 * Format a measurement value with proper unit label
 */
export function formatMeasurement(
  value: number,
  unit: string,
  locale: Locale = 'en',
  options: FormatOptions = {}
): string {
  const {
    includeValue = true,
    useSymbol = false,
    decimals = 2,
    plural: pluralOption,
  } = options;

  // Determine plural form
  let pluralForm: PluralForm;
  if (pluralOption === undefined) {
    pluralForm = getPluralForm(value, locale);
  } else if (typeof pluralOption === 'boolean') {
    pluralForm = pluralOption ? 'plural' : 'singular';
  } else {
    pluralForm = pluralOption;
  }

  // Get unit label or symbol
  const unitText = useSymbol
    ? getUnitSymbol(unit, locale)
    : getUnitLabel(unit, locale, pluralForm);

  if (!includeValue) {
    return unitText;
  }

  // Format number based on locale
  const formattedValue = formatNumber(value, locale, decimals);

  // RTL consideration: for Arabic and Hebrew, value comes after unit
  if (locale === 'ar' || locale === 'he') {
    return `${unitText} ${formattedValue}`;
  }

  return `${formattedValue} ${unitText}`;
}

/**
 * Format number according to locale conventions
 */
export function formatNumber(
  value: number,
  locale: Locale,
  decimals: number = 2
): string {
  const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

  switch (locale) {
    case 'ar':
      // Arabic uses Eastern Arabic numerals
      return toEasternArabicNumerals(rounded.toFixed(decimals));
    case 'he':
      // Hebrew uses standard Western numerals but RTL
      return rounded.toLocaleString('he-IL', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    case 'en':
    default:
      return rounded.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
  }
}

/**
 * Convert Western Arabic numerals to Eastern Arabic numerals
 */
export function toEasternArabicNumerals(value: string | number): string {
  const easternArabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(value)
    .replace(/\./g, '٫')
    .replace(/,/g, '،')
    .replace(/\d/g, (digit) => easternArabic[parseInt(digit)]);
}

/**
 * Convert Eastern Arabic numerals to Western Arabic numerals
 */
export function fromEasternArabicNumerals(value: string): number {
  const easternArabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = value.replace(/٫/g, '.').replace(/،/g, ',');
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(easternArabic[i], 'g'), String(i));
  }
  return parseFloat(result);
}

// Common conversion presets
export const COMMON_CONVERSIONS = {
  length: {
    metricToImperial: [
      { from: 'cm', to: 'in', factor: 0.393701 },
      { from: 'm', to: 'ft', factor: 3.28084 },
      { from: 'km', to: 'mi', factor: 0.621371 },
    ],
    imperialToMetric: [
      { from: 'in', to: 'cm', factor: 2.54 },
      { from: 'ft', to: 'm', factor: 0.3048 },
      { from: 'mi', to: 'km', factor: 1.60934 },
    ],
  },
  weight: {
    metricToImperial: [
      { from: 'g', to: 'oz', factor: 0.035274 },
      { from: 'kg', to: 'lb', factor: 2.20462 },
    ],
    imperialToMetric: [
      { from: 'oz', to: 'g', factor: 28.3495 },
      { from: 'lb', to: 'kg', factor: 0.453592 },
    ],
  },
  volume: {
    metricToImperial: [
      { from: 'ml', to: 'fl_oz', factor: 0.033814 },
      { from: 'l', to: 'qt', factor: 1.05669 },
      { from: 'l', to: 'gal', factor: 0.264172 },
    ],
    imperialToMetric: [
      { from: 'fl_oz', to: 'ml', factor: 29.5735 },
      { from: 'qt', to: 'l', factor: 0.946353 },
      { from: 'gal', to: 'l', factor: 3.78541 },
    ],
  },
};

/**
 * Batch convert multiple measurements
 */
export function batchConvert(
  items: Array<{ value: number; fromUnit: string; toUnit: string }>
): Array<ConversionResult & { id?: string }> {
  return items.map((item, index) => ({
    ...convertUnit(item.value, item.fromUnit, item.toUnit),
    id: `item-${index}`,
  }));
}

/**
 * Smart conversion - automatically detect and convert
 * Returns the converted value and suggested target unit
 */
export function smartConvert(
  value: number,
  fromUnit: string,
  preferredSystem: 'metric' | 'imperial' = 'metric'
): { value: number; unit: string; original: ConversionResult } {
  const unit = getUnit(fromUnit);
  if (!unit) {
    throw new Error(`Unknown unit: ${fromUnit}`);
  }

  // If already in preferred system, return as-is
  if (unit.system === preferredSystem) {
    return {
      value,
      unit: fromUnit,
      original: {
        value,
        fromUnit,
        toUnit: fromUnit,
        originalValue: value,
      },
    };
  }

  // Find appropriate target unit
  let targetUnit: string;
  const conversions =
    COMMON_CONVERSIONS[unit.category as keyof typeof COMMON_CONVERSIONS];

  if (conversions) {
    const conversionList =
      preferredSystem === 'metric'
        ? conversions.imperialToMetric
        : conversions.metricToImperial;

    const match = conversionList.find((c) => c.from === fromUnit);
    if (match) {
      targetUnit = match.to;
    } else {
      // Default to base unit of preferred system
      targetUnit =
        preferredSystem === 'metric' ? unit.baseUnit : `${unit.baseUnit}_imperial`;
    }
  } else {
    targetUnit = unit.baseUnit;
  }

  const result = convertUnit(value, fromUnit, targetUnit);
  return {
    value: result.value,
    unit: targetUnit,
    original: result,
  };
}

/**
 * Get all units in a category
 */
export function getUnitsByCategory(category: UnitCategory): UnitDefinition[] {
  return Object.values(UNITS).filter((unit) => unit.category === category);
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): Locale[] {
  return ['ar', 'he', 'en'];
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return getSupportedLocales().includes(locale as Locale);
}

/**
 * Parse a measurement string into value and unit
 */
export function parseMeasurement(input: string): {
  value: number;
  unit: string;
} | null {
  // Match number followed by optional unit
  const match = input.trim().match(/^([\d٠١٢٣٤٥٦٧٨٩,.٫]+)\s*(.+)?$/);
  if (!match) return null;

  let valueStr = match[1];
  const unitStr = match[2]?.trim();

  // Convert Eastern Arabic numerals if needed
  if (/[٠١٢٣٤٥٦٧٨٩٫]/.test(valueStr)) {
    valueStr = String(fromEasternArabicNumerals(valueStr));
  }

  const value = parseFloat(valueStr.replace(/,/g, ''));
  if (isNaN(value)) return null;

  // Try to find matching unit
  let unit: string | undefined;
  if (unitStr) {
    // First try exact match
    unit = Object.keys(UNITS).find(
      (u) => u.toLowerCase() === unitStr.toLowerCase()
    );

    // Then try symbol match
    if (!unit) {
      const unitDef = Object.values(UNITS).find(
        (u) => u.symbol.toLowerCase() === unitStr.toLowerCase()
      );
      unit = unitDef?.code;
    }

    // Then try translation match
    if (!unit) {
      for (const [code, translations] of Object.entries(UNIT_TRANSLATIONS)) {
        for (const translation of Object.values(translations)) {
          if (
            translation.singular.toLowerCase() === unitStr.toLowerCase() ||
            translation.plural.toLowerCase() === unitStr.toLowerCase() ||
            translation.symbol.toLowerCase() === unitStr.toLowerCase() ||
            (translation.dual &&
              translation.dual.toLowerCase() === unitStr.toLowerCase())
          ) {
            unit = code;
            break;
          }
        }
        if (unit) break;
      }
    }
  }

  return { value, unit: unit || unitStr || 'unknown' };
}

/**
 * Compare two measurements (after converting to same unit)
 */
export function compareMeasurements(
  value1: number,
  unit1: string,
  value2: number,
  unit2: string
): number {
  if (!areUnitsCompatible(unit1, unit2)) {
    throw new Error(`Cannot compare incompatible units: ${unit1} and ${unit2}`);
  }

  const converted = convertUnit(value1, unit1, unit2);
  return converted.value - value2;
}

/**
 * Calculate percentage difference between two measurements
 */
export function calculatePercentageDifference(
  value1: number,
  unit1: string,
  value2: number,
  unit2: string
): number {
  if (!areUnitsCompatible(unit1, unit2)) {
    throw new Error(
      `Cannot calculate difference for incompatible units: ${unit1} and ${unit2}`
    );
  }

  const converted = convertUnit(value1, unit1, unit2);
  const difference = converted.value - value2;

  if (value2 === 0) return 0;
  return (difference / Math.abs(value2)) * 100;
}
