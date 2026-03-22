/**
 * Arabic Dialect Awareness Service
 * T0066: Cultural AI - Dialect Awareness
 * 
 * Supports: Gulf (Khaliji), Levant (Shami), Maghreb, Egyptian dialects
 * with real linguistic variations and regional vocabulary.
 */

export type ArabicDialect = 'gulf' | 'levant' | 'maghreb' | 'egyptian' | 'standard';

export interface DialectConfig {
  code: ArabicDialect;
  name: string;
  nameAr: string;
  nameEn: string;
  countries: string[];
  features: string[];
  markers: string[];
  description: string;
}

export interface DialectTranslation {
  standard: string;
  dialect: string;
  dialectCode: ArabicDialect;
  context?: string;
}

export interface DialectDetectionResult {
  dialect: ArabicDialect;
  confidence: number;
  markers: string[];
}

export interface RegionalPhrase {
  standard: string;
  translations: Record<ArabicDialect, string>;
  category: 'greeting' | 'commerce' | 'common' | 'question';
}

// Dialect configurations with linguistic markers
export const ARABIC_DIALECTS: Record<ArabicDialect, DialectConfig> = {
  gulf: {
    code: 'gulf',
    name: 'Khaliji',
    nameAr: 'خليجي',
    nameEn: 'Gulf Arabic',
    countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
    features: ['yallah', 'inshallah', 'habibi', 'shlonak'],
    markers: ['شلون', 'هلا', 'وش', 'ديره', 'بيت', 'يالله', 'هال', 'شنو'],
    description: 'Spoken in the Arabian Peninsula, characterized by emphasis on certain consonants',
  },
  levant: {
    code: 'levant',
    name: 'Shami',
    nameAr: 'شامي',
    nameEn: 'Levantine Arabic',
    countries: ['SY', 'JO', 'LB', 'PS', 'IQ'],
    features: ['kifak', 'sho', 'shu', 'shlon'],
    markers: ['شو', 'شو بدك', 'شو هاد', 'كيفك', 'مرحبتين', 'شباك', 'عم', 'بدي'],
    description: 'Spoken in the Levant region, with variations between urban and rural dialects',
  },
  maghreb: {
    code: 'maghreb',
    name: 'Maghrebi',
    nameAr: 'مغربي',
    nameEn: 'Maghrebi Arabic',
    countries: ['MA', 'DZ', 'TN', 'LY', 'MR'],
    features: ['labas', 'waash', 'shkon', 'wakha'],
    markers: ['واش', 'شكون', 'لاباس', 'واخا', 'دراهم', 'الله', 'راه', 'هاك'],
    description: 'Spoken in North Africa, heavily influenced by Berber languages and French',
  },
  egyptian: {
    code: 'egyptian',
    name: 'Masri',
    nameAr: 'مصري',
    nameEn: 'Egyptian Arabic',
    countries: ['EG', 'SD'],
    features: ['izzayak', 'eh', 'yaani', 'tab'],
    markers: ['إزاي', 'إيه', 'يعني', 'طب', 'أهلاً', 'كده', 'دي', 'احنا'],
    description: 'Most widely understood dialect due to Egyptian media influence',
  },
  standard: {
    code: 'standard',
    name: 'Fus-ha',
    nameAr: 'فصحى',
    nameEn: 'Modern Standard Arabic',
    countries: ['ALL'],
    features: [],
    markers: ['هذا', 'التي', 'الذي', 'اللذين'],
    description: 'Formal Arabic used in writing, news, and formal contexts',
  },
};

// Regional vocabulary mappings - real dialect variations
export const DIALECT_VOCABULARY: Record<string, Record<ArabicDialect, string>> = {
  // Greetings
  'hello': {
    standard: 'مرحباً',
    gulf: 'هلا',
    levant: 'مرحبتين',
    maghreb: 'سلام',
    egyptian: 'أهلاً',
  },
  'how_are_you': {
    standard: 'كيف حالك؟',
    gulf: 'شلونك؟',
    levant: 'كيفك؟',
    maghreb: 'كيف داير؟',
    egyptian: 'إزيك؟',
  },
  'good_morning': {
    standard: 'صباح الخير',
    gulf: 'صباح النور',
    levant: 'صباح الخير',
    maghreb: 'صباح الخير',
    egyptian: 'صباح الفل',
  },
  'good_evening': {
    standard: 'مساء الخير',
    gulf: 'مساء النور',
    levant: 'مساء الخير',
    maghreb: 'مساء الخير',
    egyptian: 'مساء الفل',
  },
  'welcome': {
    standard: 'أهلاً وسهلاً',
    gulf: 'هلا والله',
    levant: 'أهلاً',
    maghreb: 'مرحباً بك',
    egyptian: 'نورت',
  },
  'goodbye': {
    standard: 'مع السلامة',
    gulf: 'في أمان الله',
    levant: 'بخاطرك',
    maghreb: 'بسلامة',
    egyptian: 'سلام',
  },
  'thank_you': {
    standard: 'شكراً',
    gulf: 'مشكور',
    levant: 'يسلمو',
    maghreb: 'بارك الله فيك',
    egyptian: 'شكراً جزيلاً',
  },

  // Commerce/E-commerce terms
  'product': {
    standard: 'منتج',
    gulf: 'منتج',
    levant: 'بضاعة',
    maghreb: 'منتوج',
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
  'shopping': {
    standard: 'تسوق',
    gulf: 'تسوق',
    levant: 'تسوق',
    maghreb: 'شراء',
    egyptian: 'تسوق',
  },
  'store': {
    standard: 'متجر',
    gulf: 'محل',
    levant: 'محل',
    maghreb: 'محل',
    egyptian: 'محل',
  },
  'cart': {
    standard: 'عربة التسوق',
    gulf: 'سلة المشتريات',
    levant: 'سلة التسوق',
    maghreb: 'عربة الشراء',
    egyptian: 'عربة التسوق',
  },
  'order': {
    standard: 'طلب',
    gulf: 'طلبية',
    levant: 'طلب',
    maghreb: 'كوموند',
    egyptian: 'أوردر',
  },
  'payment': {
    standard: 'دفع',
    gulf: 'دفع',
    levant: 'دفع',
    maghreb: 'خلاص',
    egyptian: 'دفع',
  },
  'delivery': {
    standard: 'توصيل',
    gulf: 'توصيل',
    levant: 'توصيل',
    maghreb: 'ليفريزون',
    egyptian: 'توصيل',
  },
  'money': {
    standard: 'مال',
    gulf: 'فلوس',
    levant: 'مصاري',
    maghreb: 'دراهم',
    egyptian: 'فلوس',
  },
  'cheap': {
    standard: 'رخيص',
    gulf: 'رخيص',
    levant: 'رخيص',
    maghreb: 'رخيص',
    egyptian: 'رخيص',
  },
  'expensive': {
    standard: 'غالي',
    gulf: 'غالي',
    levant: 'غالي',
    maghreb: 'غالي',
    egyptian: 'غالي',
  },
  'quality': {
    standard: 'جودة',
    gulf: 'كواليتي',
    levant: 'جودة',
    maghreb: 'كاليتي',
    egyptian: 'كواليتي',
  },

  // Common phrases
  'what': {
    standard: 'ماذا',
    gulf: 'وش',
    levant: 'شو',
    maghreb: 'واش',
    egyptian: 'إيه',
  },
  'why': {
    standard: 'لماذا',
    gulf: 'ليش',
    levant: 'ليش',
    maghreb: 'علاش',
    egyptian: 'ليه',
  },
  'where': {
    standard: 'أين',
    gulf: 'وين',
    levant: 'وين',
    maghreb: 'فين',
    egyptian: 'فين',
  },
  'when': {
    standard: 'متى',
    gulf: 'متى',
    levant: 'إمتى',
    maghreb: 'فاش',
    egyptian: 'إمتى',
  },
  'who': {
    standard: 'من',
    gulf: 'مين',
    levant: 'مين',
    maghreb: 'شكون',
    egyptian: 'مين',
  },
  'how_much': {
    standard: 'كم',
    gulf: 'كم',
    levant: 'قديش',
    maghreb: 'شحال',
    egyptian: 'بكام',
  },
  'yes': {
    standard: 'نعم',
    gulf: 'ايه',
    levant: 'اي',
    maghreb: 'واخا',
    egyptian: 'اه',
  },
  'no': {
    standard: 'لا',
    gulf: 'لا',
    levant: 'لا',
    maghreb: 'لا',
    egyptian: 'لا',
  },
  'please': {
    standard: 'من فضلك',
    gulf: 'لو سمحت',
    levant: 'من فضلك',
    maghreb: 'عفاك',
    egyptian: 'لو سمحت',
  },
  'sorry': {
    standard: 'عذراً',
    gulf: 'معذرة',
    levant: 'آسف',
    maghreb: 'سمحني',
    egyptian: 'آسف',
  },
};

// Dialect-specific phrases with regional variations
export const DIALECT_PHRASES: Record<ArabicDialect, Record<string, string>> = {
  gulf: {
    'hello_response': 'هلا بيك',
    'welcome_phrase': 'هلا والله',
    'how_are_you_response': 'بخير الحمدلله',
    'goodbye_formal': 'مع السلامة',
    'come_in': 'تفضل',
    'thank_you_response': 'حياك الله',
    'please_wait': 'انتظر',
    'what_do_you_want': 'وش تبي',
  },
  levant: {
    'hello_response': 'أهلاً فيك',
    'welcome_phrase': 'أهلاً وسهلاً',
    'how_are_you_response': 'منيح الحمدلله',
    'goodbye_formal': 'بخاطرك',
    'come_in': 'تفضل',
    'thank_you_response': 'عفواً',
    'please_wait': 'انتظر',
    'what_do_you_want': 'شو بدك',
  },
  maghreb: {
    'hello_response': 'مرحباً بيك',
    'welcome_phrase': 'أهلاً وسهلاً',
    'how_are_you_response': 'لاباس الحمدلله',
    'goodbye_formal': 'بسلامة',
    'come_in': 'تفضل',
    'thank_you_response': 'مرحباً',
    'please_wait': 'استنى',
    'what_do_you_want': 'واش بغيتي',
  },
  egyptian: {
    'hello_response': 'أهلاً بيك',
    'welcome_phrase': 'نورت',
    'how_are_you_response': 'كويس الحمدلله',
    'goodbye_formal': 'مع السلامة',
    'come_in': 'تفضل',
    'thank_you_response': 'على الرحب والسعة',
    'please_wait': 'استنى',
    'what_do_you_want': 'عايز إيه',
  },
  standard: {
    'hello_response': 'أهلاً بك',
    'welcome_phrase': 'أهلاً وسهلاً',
    'how_are_you_response': 'بخير الحمدلله',
    'goodbye_formal': 'مع السلامة',
    'come_in': 'تفضل',
    'thank_you_response': 'عفواً',
    'please_wait': 'انتظر من فضلك',
    'what_do_you_want': 'ماذا تريد',
  },
};

// Country to dialect region mapping
export const DIALECT_REGIONS: Record<string, { region: string; primaryDialect: ArabicDialect; secondaryDialects: ArabicDialect[] }> = {
  // Gulf (GCC) countries
  'SA': { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  'AE': { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  'QA': { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  'KW': { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  'BH': { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  'OM': { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  'YE': { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },

  // Levant countries
  'SY': { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  'JO': { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  'LB': { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  'PS': { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  'IQ': { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['gulf', 'standard'] },

  // Maghreb countries
  'MA': { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },
  'DZ': { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },
  'TN': { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },
  'LY': { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },
  'MR': { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },

  // Egypt
  'EG': { region: 'Nile Valley', primaryDialect: 'egyptian', secondaryDialects: ['standard'] },
  'SD': { region: 'Nile Valley', primaryDialect: 'egyptian', secondaryDialects: ['standard'] },
};

/**
 * Detect dialect from text content using linguistic markers
 */
export function detectDialect(text: string): DialectDetectionResult {
  if (!text || text.trim().length === 0) {
    return { dialect: 'standard', confidence: 0, markers: [] };
  }

  const normalizedText = text.toLowerCase().trim();
  const detectedMarkers: Record<ArabicDialect, string[]> = {
    gulf: [],
    levant: [],
    maghreb: [],
    egyptian: [],
    standard: [],
  };

  // Check for dialect-specific markers
  for (const [dialect, config] of Object.entries(ARABIC_DIALECTS)) {
    if (dialect === 'standard') continue;

    for (const marker of config.markers) {
      if (normalizedText.includes(marker.toLowerCase())) {
        detectedMarkers[dialect as ArabicDialect].push(marker);
      }
    }
  }

  // Calculate scores based on marker frequency
  const scores: Record<ArabicDialect, number> = {
    gulf: detectedMarkers.gulf.length,
    levant: detectedMarkers.levant.length,
    maghreb: detectedMarkers.maghreb.length,
    egyptian: detectedMarkers.egyptian.length,
    standard: 0,
  };

  // Find the dialect with highest score
  let maxScore = 0;
  let detectedDialect: ArabicDialect = 'standard';

  for (const [dialect, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedDialect = dialect as ArabicDialect;
    }
  }

  // Calculate confidence (normalize to 0-1)
  const totalMarkers = Object.values(detectedMarkers).flat().length;
  const confidence = totalMarkers > 0 ? maxScore / totalMarkers : 0;

  return {
    dialect: detectedDialect,
    confidence: Math.min(confidence * 2, 1), // Boost confidence
    markers: detectedMarkers[detectedDialect],
  };
}

/**
 * Detect dialect from country code
 */
export function detectDialectFromCountry(countryCode: string): ArabicDialect {
  const upperCode = countryCode.toUpperCase();
  
  if (DIALECT_REGIONS[upperCode]) {
    return DIALECT_REGIONS[upperCode].primaryDialect;
  }

  // Fallback to old method
  for (const [dialect, config] of Object.entries(ARABIC_DIALECTS)) {
    if (config.countries.includes(upperCode)) {
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
 * Get dialect-specific vocabulary
 */
export function getDialectVocabulary(dialect: ArabicDialect): Record<string, string> {
  const vocabulary: Record<string, string> = {};

  for (const [term, translations] of Object.entries(DIALECT_VOCABULARY)) {
    vocabulary[term] = translations[dialect];
  }

  return vocabulary;
}

/**
 * Translate text to target dialect
 */
export function translateToDialect(
  text: string,
  targetDialect: ArabicDialect,
  standardVersion?: string
): string {
  if (!text || targetDialect === 'standard') {
    return standardVersion || text;
  }

  let result = standardVersion || text;

  // Replace vocabulary terms
  for (const [standardTerm, translations] of Object.entries(DIALECT_VOCABULARY)) {
    const standardWord = translations.standard;
    const dialectWord = translations[targetDialect];

    if (standardWord !== dialectWord) {
      // Create regex to match the standard term
      const regex = new RegExp(standardWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(regex, dialectWord);
    }
  }

  return result;
}

/**
 * Get dialect regions for a specific dialect
 */
export function getDialectRegions(dialect: ArabicDialect): Array<{ country: string; region: string; isPrimary: boolean }> {
  const regions: Array<{ country: string; region: string; isPrimary: boolean }> = [];

  for (const [country, info] of Object.entries(DIALECT_REGIONS)) {
    if (info.primaryDialect === dialect) {
      regions.push({ country, region: info.region, isPrimary: true });
    } else if (info.secondaryDialects.includes(dialect)) {
      regions.push({ country, region: info.region, isPrimary: false });
    }
  }

  // Add from ARABIC_DIALECTS as fallback
  const config = ARABIC_DIALECTS[dialect];
  for (const country of config.countries) {
    if (country !== 'ALL' && !regions.some(r => r.country === country)) {
      regions.push({ country, region: 'Unknown', isPrimary: true });
    }
  }

  return regions;
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
  const upperCode = countryCode.toUpperCase();
  
  if (DIALECT_REGIONS[upperCode]) {
    return [DIALECT_REGIONS[upperCode].primaryDialect, 'standard'];
  }

  const detected = detectDialectFromCountry(upperCode);
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
  const normalizedText = text.toLowerCase();
  return config.features.some((term) => 
    normalizedText.includes(term.toLowerCase())
  );
}

/**
 * Get all dialect options
 */
export function getAllDialectOptions(): Array<{ code: ArabicDialect; name: string; nameAr: string }> {
  return Object.values(ARABIC_DIALECTS).map((d) => ({
    code: d.code,
    name: d.nameEn,
    nameAr: d.nameAr,
  }));
}

/**
 * Get dialect-specific phrase
 */
export function getDialectPhrase(dialect: ArabicDialect, phraseKey: string): string {
  return DIALECT_PHRASES[dialect][phraseKey] || DIALECT_PHRASES.standard[phraseKey];
}

/**
 * Compare translations across dialects
 */
export function compareDialectTranslations(term: string): Record<ArabicDialect, string> | null {
  return DIALECT_VOCABULARY[term] || null;
}

/**
 * Get dialect statistics (marker counts, vocabulary size)
 */
export function getDialectStats(dialect: ArabicDialect): {
  markerCount: number;
  vocabularyCount: number;
  phraseCount: number;
  countryCount: number;
} {
  const config = getDialectConfig(dialect);
  const vocabularyCount = Object.values(DIALECT_VOCABULARY).filter(
    v => v[dialect] !== v.standard
  ).length;

  return {
    markerCount: config.markers.length,
    vocabularyCount,
    phraseCount: Object.keys(DIALECT_PHRASES[dialect]).length,
    countryCount: config.countries.filter(c => c !== 'ALL').length,
  };
}

/**
 * Suggest dialect based on user preferences and location
 */
export function suggestDialect(
  countryCode?: string,
  detectedText?: string
): { dialect: ArabicDialect; confidence: number; reason: string } {
  // First try country-based detection
  if (countryCode) {
    const countryDialect = detectDialectFromCountry(countryCode);
    if (countryDialect !== 'standard') {
      return {
        dialect: countryDialect,
        confidence: 0.8,
        reason: 'Based on your location',
      };
    }
  }

  // Try text-based detection
  if (detectedText) {
    const textResult = detectDialect(detectedText);
    if (textResult.confidence > 0.5) {
      return {
        dialect: textResult.dialect,
        confidence: textResult.confidence,
        reason: 'Based on your writing style',
      };
    }
  }

  // Default to standard
  return {
    dialect: 'standard',
    confidence: 0.3,
    reason: 'Could not detect specific dialect',
  };
}

/**
 * Batch translate multiple terms to dialect
 */
export function batchTranslateToDialect(
  terms: string[],
  targetDialect: ArabicDialect
): Array<{ original: string; translated: string }> {
  return terms.map(term => ({
    original: term,
    translated: translateToDialect(term, targetDialect),
  }));
}

/**
 * Validate if a dialect code is valid
 */
export function isValidDialect(dialect: string): dialect is ArabicDialect {
  return Object.keys(ARABIC_DIALECTS).includes(dialect);
}
