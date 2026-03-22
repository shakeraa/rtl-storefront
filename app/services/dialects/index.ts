/**
 * Arabic Dialect Awareness Service
 * T0066: Cultural AI - Dialect Awareness
 */

export type ArabicDialect = 'gulf' | 'levant' | 'maghreb' | 'egyptian' | 'standard';

export interface DialectConfig {
  code: ArabicDialect;
  name: string;
  nameAr: string;
  nameEn: string;
  countries: string[];
  features: string[];
}

export interface DialectTranslation {
  standard: string;
  dialect: string;
  dialectCode: ArabicDialect;
  context?: string;
}

// Dialect configurations
export const ARABIC_DIALECTS: Record<ArabicDialect, DialectConfig> = {
  gulf: {
    code: 'gulf',
    name: 'Khaliji',
    nameAr: 'خليجي',
    nameEn: 'Gulf Arabic',
    countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
    features: ['yallah', 'inshallah', 'habibi', 'shlonak'],
  },
  levant: {
    code: 'levant',
    name: 'Shami',
    nameAr: 'شامي',
    nameEn: 'Levantine Arabic',
    countries: ['SY', 'JO', 'LB', 'PS'],
    features: ['kifak', 'sho', 'shu'],
  },
  maghreb: {
    code: 'maghreb',
    name: 'Maghrebi',
    nameAr: 'مغربي',
    nameEn: 'Maghrebi Arabic',
    countries: ['MA', 'DZ', 'TN', 'LY', 'MR'],
    features: ['labas', 'waash', 'shkon'],
  },
  egyptian: {
    code: 'egyptian',
    name: 'Masri',
    nameAr: 'مصري',
    nameEn: 'Egyptian Arabic',
    countries: ['EG'],
    features: ['izzayak', 'eh', 'yaani'],
  },
  standard: {
    code: 'standard',
    name: 'Fus-ha',
    nameAr: 'فصحى',
    nameEn: 'Modern Standard Arabic',
    countries: ['ALL'],
    features: [],
  },
};

// Common translations across dialects
export const DIALECT_VOCABULARY: Record<string, Record<ArabicDialect, string>> = {
  'hello': {
    standard: 'مرحباً',
    gulf: 'هلا',
    levant: 'مرحبتين',
    maghreb: 'سلام',
    egyptian: 'أهلاً',
  },
  'how are you': {
    standard: 'كيف حالك؟',
    gulf: 'شلونك؟',
    levant: 'كيفك؟',
    maghreb: 'كيف داير؟',
    egyptian: 'إزيك؟',
  },
  'thank you': {
    standard: 'شكراً',
    gulf: 'مشكور',
    levant: 'يسلمو',
    maghreb: 'بارك الله فيك',
    egyptian: 'شكراً جزيلاً',
  },
  'goodbye': {
    standard: 'مع السلامة',
    gulf: 'في أمان الله',
    levant: 'بخاطرك',
    maghreb: 'بسلامة',
    egyptian: 'سلام',
  },
  'welcome': {
    standard: 'أهلاً وسهلاً',
    gulf: 'هلا والله',
    levant: 'أهلاً',
    maghreb: 'مرحباً بك',
    egyptian: 'نورت',
  },
  'product': {
    standard: 'منتج',
    gulf: 'منتج',
    levant: 'بضاعة',
    maghreb: ' produit',
    egyptian: 'سلعة',
  },
  'price': {
    standard: 'سعر',
    gulf: 'سعر',
    levant: 'سعر',
    maghreb: 'ثمن',
    egyptian: 'سعر',
  },
  'discount': {
    standard: 'خصم',
    gulf: 'تخفيض',
    levant: 'تخفيض',
    maghreb: 'تخفيض',
    egyptian: 'خصم',
  },
};

/**
 * Detect dialect from country code
 */
export function detectDialectFromCountry(countryCode: string): ArabicDialect {
  for (const [dialect, config] of Object.entries(ARABIC_DIALECTS)) {
    if (config.countries.includes(countryCode)) {
      return dialect as ArabicDialect;
    }
  }
  return 'standard';
}

/**
 * Get dialect config
 */
export function getDialectConfig(dialect: ArabicDialect): DialectConfig {
  return ARABIC_DIALECTS[dialect];
}

/**
 * Translate to dialect
 */
export function translateToDialect(
  text: string,
  dialect: ArabicDialect,
  standardVersion?: string
): string {
  // Simple word replacement for common terms
  let result = standardVersion || text;
  
  for (const [standardTerm, translations] of Object.entries(DIALECT_VOCABULARY)) {
    if (result.includes(translations.standard)) {
      result = result.replace(
        new RegExp(translations.standard, 'g'),
        translations[dialect]
      );
    }
  }
  
  return result;
}

/**
 * Get dialect-specific greeting
 */
export function getGreeting(dialect: ArabicDialect): string {
  return DIALECT_VOCABULARY['hello'][dialect];
}

/**
 * Get available dialects for country
 */
export function getAvailableDialects(countryCode: string): ArabicDialect[] {
  const detected = detectDialectFromCountry(countryCode);
  if (detected !== 'standard') {
    return [detected, 'standard'];
  }
  return ['standard'];
}

/**
 * Format dialect name
 */
export function formatDialectName(
  dialect: ArabicDialect,
  locale: 'en' | 'ar' = 'en'
): string {
  const config = getDialectConfig(dialect);
  if (locale === 'ar') {
    return config.nameAr;
  }
  return config.nameEn;
}

/**
 * Check if text contains dialect-specific terms
 */
export function containsDialectTerms(text: string, dialect: ArabicDialect): boolean {
  const config = getDialectConfig(dialect);
  return config.features.some((term) => 
    text.toLowerCase().includes(term.toLowerCase())
  );
}

/**
 * Get all dialect options
 */
export function getAllDialectOptions(): Array<{ code: ArabicDialect; name: string }> {
  return Object.values(ARABIC_DIALECTS).map((d) => ({
    code: d.code,
    name: d.nameEn,
  }));
}
