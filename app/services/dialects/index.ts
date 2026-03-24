/**
 * Arabic Dialect Awareness Service
 * T0066: Cultural AI - Dialect Awareness
 *
 * Uses the canonical ArabicDialect type from cultural-ai/dialect-detector.
 * Standardized types: 'msa' | 'gulf' | 'egyptian' | 'levantine' | 'maghrebi'
 */

// Re-export canonical type and prompt modifier
export { getDialectPromptModifier } from "../cultural-ai/dialect-detector";
export type { ArabicDialect } from "../cultural-ai/dialect-detector";

import type { ArabicDialect } from "../cultural-ai/dialect-detector";

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
  levantine: {
    code: 'levantine', name: 'Shami', nameAr: 'شامي', nameEn: 'Levantine Arabic',
    countries: ['SY', 'JO', 'LB', 'PS', 'IQ'],
    features: ['kifak', 'sho', 'shu', 'shlon'],
    markers: ['شو', 'كيفك', 'مرحبتين', 'عم', 'بدي'],
    description: 'Spoken in the Levant region'
  },
  maghrebi: {
    code: 'maghrebi', name: 'Maghrebi', nameAr: 'مغربي', nameEn: 'Maghrebi Arabic',
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
  msa: {
    code: 'msa', name: 'Fus-ha', nameAr: 'فصحى', nameEn: 'Modern Standard Arabic',
    countries: ['ALL'], features: [], markers: [],
    description: 'Formal Arabic'
  }
};

export const DIALECT_VOCABULARY: Record<string, Record<ArabicDialect, string>> = {
  hello: { msa: 'مرحباً', gulf: 'هلا', levantine: 'مرحبتين', maghrebi: 'سلام', egyptian: 'أهلاً' },
  'how are you': { msa: 'كيف حالك؟', gulf: 'شلونك؟', levantine: 'كيفك؟', maghrebi: 'كيف داير؟', egyptian: 'إزيك؟' },
  'thank you': { msa: 'شكراً', gulf: 'مشكور', levantine: 'يسلمو', maghrebi: 'بارك الله فيك', egyptian: 'شكراً جزيلاً' },
  goodbye: { msa: 'مع السلامة', gulf: 'في أمان الله', levantine: 'بخاطرك', maghrebi: 'بسلامة', egyptian: 'سلام' },
  welcome: { msa: 'أهلاً وسهلاً', gulf: 'هلا والله', levantine: 'أهلاً', maghrebi: 'مرحباً بك', egyptian: 'نورت' },
  what: { msa: 'ماذا', gulf: 'وش', levantine: 'شو', maghrebi: 'واش', egyptian: 'إيه' },
  product: { msa: 'منتج', gulf: 'منتج', levantine: 'بضاعة', maghrebi: 'منتوج', egyptian: 'سلعة' },
  price: { msa: 'سعر', gulf: 'سعر', levantine: 'سعر', maghrebi: 'ثمن', egyptian: 'سعر' }
};

export const DIALECT_PHRASES: Record<ArabicDialect, Record<string, string>> = {
  gulf: { hello_response: 'هلا بيك', welcome_phrase: 'هلا والله', thank_you_response: 'حياك الله' },
  levantine: { hello_response: 'أهلاً فيك', welcome_phrase: 'أهلاً وسهلاً', thank_you_response: 'عفواً' },
  maghrebi: { hello_response: 'مرحباً بيك', welcome_phrase: 'أهلاً وسهلاً', thank_you_response: 'مرحباً' },
  egyptian: { hello_response: 'أهلاً بيك', welcome_phrase: 'نورت', thank_you_response: 'على الرحب والسعة' },
  msa: { hello_response: 'أهلاً بك', welcome_phrase: 'أهلاً وسهلاً', thank_you_response: 'عفواً' }
};

export const DIALECT_REGIONS: Record<string, { region: string; primaryDialect: ArabicDialect; secondaryDialects: ArabicDialect[] }> = {
  SA: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['msa'] },
  AE: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['msa'] },
  QA: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['msa'] },
  KW: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['msa'] },
  BH: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['msa'] },
  OM: { region: 'Arabian Peninsula', primaryDialect: 'gulf', secondaryDialects: ['msa'] },
  SY: { region: 'Levant', primaryDialect: 'levantine', secondaryDialects: ['msa'] },
  JO: { region: 'Levant', primaryDialect: 'levantine', secondaryDialects: ['msa'] },
  LB: { region: 'Levant', primaryDialect: 'levantine', secondaryDialects: ['msa'] },
  PS: { region: 'Levant', primaryDialect: 'levantine', secondaryDialects: ['msa'] },
  MA: { region: 'Maghreb', primaryDialect: 'maghrebi', secondaryDialects: ['msa'] },
  DZ: { region: 'Maghreb', primaryDialect: 'maghrebi', secondaryDialects: ['msa'] },
  TN: { region: 'Maghreb', primaryDialect: 'maghrebi', secondaryDialects: ['msa'] },
  EG: { region: 'Nile Valley', primaryDialect: 'egyptian', secondaryDialects: ['msa'] },
  SD: { region: 'Nile Valley', primaryDialect: 'egyptian', secondaryDialects: ['msa'] }
};

export function detectDialectFromCountry(code: string): ArabicDialect {
  const u = code.toUpperCase();
  return DIALECT_REGIONS[u]?.primaryDialect ||
    (Object.entries(ARABIC_DIALECTS).find(([_, c]) => c.countries.includes(u))?.[0] as ArabicDialect) || 'msa';
}

export function getDialectConfig(d: ArabicDialect) { return ARABIC_DIALECTS[d]; }
export function getGreeting(d: ArabicDialect) { return DIALECT_VOCABULARY.hello[d]; }
export function getAvailableDialects(c: string) {
  const p = DIALECT_REGIONS[c.toUpperCase()]?.primaryDialect;
  return p && p !== 'msa' ? [p, 'msa'] : ['msa'];
}
export function formatDialectName(d: ArabicDialect, l: 'en' | 'ar' = 'en') { const c = getDialectConfig(d); return l === 'ar' ? c.nameAr : c.nameEn; }
export function containsDialectTerms(t: string, d: ArabicDialect) { return getDialectConfig(d).features.some(f => t.toLowerCase().includes(f.toLowerCase())); }
export function getAllDialectOptions() { return Object.values(ARABIC_DIALECTS).map(d => ({ code: d.code, name: d.nameEn, nameAr: d.nameAr })); }
export function getDialectPhrase(d: ArabicDialect, k: string) { return DIALECT_PHRASES[d]?.[k] || DIALECT_PHRASES.msa?.[k] || ''; }
export function translateToDialect(t: string, d: ArabicDialect): string {
  if (d === 'msa') return t;
  let result = t;
  for (const [term, translations] of Object.entries(DIALECT_VOCABULARY)) {
    const msaForm = translations.msa;
    const dialectForm = translations[d];
    if (msaForm && dialectForm && msaForm !== dialectForm) {
      result = result.replace(new RegExp(escapeRegex(msaForm), 'g'), dialectForm);
    }
  }
  return result;
}
function escapeRegex(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function getDialectVocabulary(d: ArabicDialect) { return Object.fromEntries(Object.entries(DIALECT_VOCABULARY).map(([k, v]) => [k, v[d]])); }
export function getDialectRegions(d: ArabicDialect) {
  return Object.entries(DIALECT_REGIONS).filter(([_, i]) => i.primaryDialect === d || i.secondaryDialects.includes(d))
    .map(([c, i]) => ({ country: c, region: i.region, isPrimary: i.primaryDialect === d }));
}
export function compareDialectTranslations(t: string) { return DIALECT_VOCABULARY[t] || null; }
export function getDialectStats(d: ArabicDialect) {
  const c = getDialectConfig(d);
  return { markerCount: c.markers.length, vocabularyCount: Object.values(DIALECT_VOCABULARY).filter(v => v[d] !== v.msa).length, phraseCount: Object.keys(DIALECT_PHRASES[d]).length, countryCount: c.countries.filter(x => x !== 'ALL').length };
}
export function suggestDialect(cc?: string, dt?: string): { dialect: ArabicDialect; confidence: number; reason: string } {
  if (cc) { const cd = detectDialectFromCountry(cc); if (cd !== 'msa') return { dialect: cd, confidence: 0.8, reason: 'Based on your location' }; }
  if (dt) { const r = detectDialect(dt); if (r.confidence > 0.5) return { dialect: r.dialect, confidence: r.confidence, reason: 'Based on your writing style' }; }
  return { dialect: 'msa', confidence: 0.3, reason: 'Could not detect specific dialect' };
}
export function batchTranslateToDialect(terms: string[], d: ArabicDialect) { return terms.map(t => ({ original: t, translated: translateToDialect(t, d) })); }
export function isValidDialect(d: string): d is ArabicDialect { return d in ARABIC_DIALECTS; }

/**
 * Detect Arabic dialect from text by checking for dialect-specific marker words.
 */
export function detectDialect(text: string): DialectDetectionResult {
  if (!text?.trim()) return { dialect: 'msa', confidence: 0, markers: [] };
  const normalized = text.toLowerCase();
  const markers: Record<ArabicDialect, string[]> = { gulf: [], levantine: [], maghrebi: [], egyptian: [], msa: [] };

  for (const [d, config] of Object.entries(ARABIC_DIALECTS)) {
    if (d === 'msa') continue;
    for (const m of config.markers) if (normalized.includes(m.toLowerCase())) markers[d as ArabicDialect].push(m);
  }

  let best: ArabicDialect = 'msa', max = 0;
  for (const [d, ms] of Object.entries(markers)) if (ms.length > max) { max = ms.length; best = d as ArabicDialect; }

  const total = Object.values(markers).flat().length;
  const rawConfidence = total ? max / total : 0;
  return { dialect: best, confidence: rawConfidence, markers: markers[best] };
}
