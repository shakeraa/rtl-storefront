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
  markers: string[];
  description: string;
}

export interface DialectDetectionResult {
  dialect: ArabicDialect;
  confidence: number;
  markers: string[];
}

export const ARABIC_DIALECTS: Record<ArabicDialect, DialectConfig> = {
  gulf: {
    code: 'gulf', name: 'Khaliji', nameAr: 'خليجي', nameEn: 'Gulf Arabic',
    countries: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
    features: ['yallah', 'inshallah', 'habibi', 'shlonak'],
    markers: ['شلون', 'هلا', 'وش', 'يالله', 'شنو'],
    description: 'Spoken in the Arabian Peninsula'
  },
  levant: {
    code: 'levant', name: 'Shami', nameAr: 'شامي', nameEn: 'Levantine Arabic',
    countries: ['SY', 'JO', 'LB', 'PS', 'IQ'],
    features: ['kifak', 'sho', 'shu', 'shlon'],
    markers: ['شو', 'كيفك', 'مرحبتين', 'عم', 'بدي'],
    description: 'Spoken in the Levant region'
  },
  maghreb: {
    code: 'maghreb', name: 'Maghrebi', nameAr: 'مغربي', nameEn: 'Maghrebi Arabic',
    countries: ['MA', 'DZ', 'TN', 'LY', 'MR'],
    features: ['labas', 'waash', 'shkon', 'wakha'],
    markers: ['واش', 'شكون', 'لاباس', 'واخا', 'دراهم'],
    description: 'Spoken in North Africa'
  },
  egyptian: {
    code: 'egyptian', name: 'Masri', nameAr: 'مصري', nameEn: 'Egyptian Arabic',
    countries: ['EG', 'SD'],
    features: ['izzayak', 'eh', 'yaani', 'tab'],
    markers: ['إزاي', 'إيه', 'يعني', 'طب', 'كده'],
    description: 'Most widely understood dialect'
  },
  standard: {
    code: 'standard', name: 'Fus-ha', nameAr: 'فصحى', nameEn: 'Modern Standard Arabic',
    countries: ['ALL'], features: [], markers: [],
    description: 'Formal Arabic'
  }
};

export const DIALECT_VOCABULARY: Record<string, Record<ArabicDialect, string>> = {
  hello: { standard: 'مرحباً', gulf: 'هلا', levant: 'مرحبتين', maghreb: 'سلام', egyptian: 'أهلاً' },
  'how are you': { standard: 'كيف حالك؟', gulf: 'شلونك؟', levant: 'كيفك؟', maghreb: 'كيف داير؟', egyptian: 'إزيك؟' },
  'thank you': { standard: 'شكراً', gulf: 'مشكور', levant: 'يسلمو', maghreb: 'بارك الله فيك', egyptian: 'شكراً جزيلاً' },
  goodbye: { standard: 'مع السلامة', gulf: 'في أمان الله', levant: 'بخاطرك', maghreb: 'بسلامة', egyptian: 'سلام' },
  welcome: { standard: 'أهلاً وسهلاً', gulf: 'هلا والله', levant: 'أهلاً', maghreb: 'مرحباً بك', egyptian: 'نورت' },
  what: { standard: 'ماذا', gulf: 'وش', levant: 'شو', maghreb: 'واش', egyptian: 'إيه' },
  product: { standard: 'منتج', gulf: 'منتج', levant: 'بضاعة', maghreb: 'منتوج', egyptian: 'سلعة' },
  price: { standard: 'سعر', gulf: 'سعر', levant: 'سعر', maghreb: 'ثمن', egyptian: 'سعر' }
};

export const DIALECT_PHRASES: Record<ArabicDialect, Record<string, string>> = {
  gulf: { hello_response: 'هلا بيك', welcome_phrase: 'هلا والله', thank_you_response: 'حياك الله' },
  levant: { hello_response: 'أهلاً فيك', welcome_phrase: 'أهلاً وسهلاً', thank_you_response: 'عفواً' },
  maghreb: { hello_response: 'مرحباً بيك', welcome_phrase: 'أهلاً وسهلاً', thank_you_response: 'مرحباً' },
  egyptian: { hello_response: 'أهلاً بيك', welcome_phrase: 'نورت', thank_you_response: 'على الرحب والسعة' },
  standard: { hello_response: 'أهلاً بك', welcome_phrase: 'أهلاً وسهلاً', thank_you_response: 'عفواً' }
};

export const DIALECT_REGIONS: Record<string, { region: string; primaryDialect: ArabicDialect; secondaryDialects: ArabicDialect[] }> = {
  SA: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  AE: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  QA: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  KW: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  BH: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  OM: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['standard'] },
  SY: { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  JO: { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  LB: { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  PS: { region: 'Levant', primaryDialect: 'levant', secondaryDialects: ['standard'] },
  MA: { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },
  DZ: { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },
  TN: { region: 'Maghreb', primaryDialect: 'maghreb', secondaryDialects: ['standard'] },
  EG: { region: 'Nile Valley', primaryDialect: 'egyptian', secondaryDialects: ['standard'] },
  SD: { region: 'Nile Valley', primaryDialect: 'egyptian', secondaryDialects: ['standard'] }
};

export function detectDialect(text: string): DialectDetectionResult {
  if (!text?.trim()) return { dialect: 'standard', confidence: 0, markers: [] };
  const normalized = text.toLowerCase();
  const markers: Record<ArabicDialect, string[]> = { gulf: [], levant: [], maghreb: [], egyptian: [], standard: [] };
  
  for (const [d, config] of Object.entries(ARABIC_DIALECTS)) {
    if (d === 'standard') continue;
    for (const m of config.markers) if (normalized.includes(m.toLowerCase())) markers[d as ArabicDialect].push(m);
  }
  
  let best: ArabicDialect = 'standard', max = 0;
  for (const [d, ms] of Object.entries(markers)) if (ms.length > max) { max = ms.length; best = d as ArabicDialect; }
  
  const total = Object.values(markers).flat().length;
  return { dialect: best, confidence: total ? Math.min((max / total) * 2, 1) : 0, markers: markers[best] };
}

export function detectDialectFromCountry(code: string): ArabicDialect {
  const u = code.toUpperCase();
  return DIALECT_REGIONS[u]?.primaryDialect || 
    (Object.entries(ARABIC_DIALECTS).find(([_, c]) => c.countries.includes(u))?.[0] as ArabicDialect) || 'standard';
}

export function getDialectConfig(d: ArabicDialect) { return ARABIC_DIALECTS[d]; }
export function getGreeting(d: ArabicDialect) { return DIALECT_VOCABULARY.hello[d]; }
export function getAvailableDialects(c: string) {
  const p = DIALECT_REGIONS[c.toUpperCase()]?.primaryDialect;
  return p && p !== 'standard' ? [p, 'standard'] : ['standard'];
}
export function formatDialectName(d: ArabicDialect, l: 'en' | 'ar' = 'en') { const c = getDialectConfig(d); return l === 'ar' ? c.nameAr : c.nameEn; }
export function containsDialectTerms(t: string, d: ArabicDialect) { return getDialectConfig(d).features.some(f => t.toLowerCase().includes(f.toLowerCase())); }
export function getAllDialectOptions() { return Object.values(ARABIC_DIALECTS).map(d => ({ code: d.code, name: d.nameEn, nameAr: d.nameAr })); }
export function getDialectPhrase(d: ArabicDialect, k: string) { return DIALECT_PHRASES[d]?.[k] || DIALECT_PHRASES.standard?.[k] || ''; }
export function translateToDialect(t: string, d: ArabicDialect) { return d === 'standard' ? t : t; }
export function getDialectVocabulary(d: ArabicDialect) { return Object.fromEntries(Object.entries(DIALECT_VOCABULARY).map(([k, v]) => [k, v[d]])); }
export function getDialectRegions(d: ArabicDialect) {
  return Object.entries(DIALECT_REGIONS).filter(([_, i]) => i.primaryDialect === d || i.secondaryDialects.includes(d))
    .map(([c, i]) => ({ country: c, region: i.region, isPrimary: i.primaryDialect === d }));
}
export function compareDialectTranslations(t: string) { return DIALECT_VOCABULARY[t] || null; }
export function getDialectStats(d: ArabicDialect) {
  const c = getDialectConfig(d);
  return { markerCount: c.markers.length, vocabularyCount: Object.values(DIALECT_VOCABULARY).filter(v => v[d] !== v.standard).length, phraseCount: Object.keys(DIALECT_PHRASES[d]).length, countryCount: c.countries.filter(x => x !== 'ALL').length };
}
export function suggestDialect(cc?: string, dt?: string): { dialect: ArabicDialect; confidence: number; reason: string } {
  if (cc) { const cd = detectDialectFromCountry(cc); if (cd !== 'standard') return { dialect: cd, confidence: 0.8, reason: 'Based on your location' }; }
  if (dt) { const r = detectDialect(dt); if (r.confidence > 0.5) return { dialect: r.dialect, confidence: r.confidence, reason: 'Based on your writing style' }; }
  return { dialect: 'standard', confidence: 0.3, reason: 'Could not detect specific dialect' };
}
export function batchTranslateToDialect(terms: string[], d: ArabicDialect) { return terms.map(t => ({ original: t, translated: translateToDialect(t, d) })); }
export function isValidDialect(d: string): d is ArabicDialect { return d in ARABIC_DIALECTS; }
