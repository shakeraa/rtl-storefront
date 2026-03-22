/**
 * Language Detection Service
 * Automatically detects language from text content and HTML documents
 * Supports: Arabic, Hebrew, English, French, German, Spanish, and more
 * 
 * @module translation-features/language-detection
 */

export interface LanguagePattern {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  unicodeRange: RegExp;
  commonWords: string[];
  isRTL: boolean;
}

const UNICODE_RANGES = {
  ARABIC: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/,
  HEBREW: /[\u0590-\u05FF\uFB1D-\uFB4F]/,
  LATIN: /[a-zA-Z\u00C0-\u00FF\u0100-\u017F\u0180-\u024F]/,
  CYRILLIC: /[\u0400-\u04FF\u0500-\u052F]/,
  CJK: /[\u4E00-\u9FFF]/,
  HIRAGANA: /[\u3040-\u309F]/,
  KATAKANA: /[\u30A0-\u30FF]/,
  HANGUL: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,
  DEVANAGARI: /[\u0900-\u097F]/,
  GREEK: /[\u0370-\u03FF\u1F00-\u1FFF]/,
  THAI: /[\u0E00-\u0E7F]/,
};

export const LANGUAGE_PATTERNS: Record<string, LanguagePattern> = {
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', script: 'Arabic', unicodeRange: UNICODE_RANGES.ARABIC, commonWords: ['في', 'من', 'إلى', 'على', 'هذا', 'الذي', 'أن', 'كان', 'كل', 'مع'], isRTL: true },
  he: { code: 'he', name: 'Hebrew', nativeName: 'עברית', script: 'Hebrew', unicodeRange: UNICODE_RANGES.HEBREW, commonWords: ['את', 'של', 'על', 'הוא', 'היא', 'או', 'כל', 'לא', 'גם', 'כי'], isRTL: true },
  en: { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i'], isRTL: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'avoir', 'ne', 'je'], isRTL: false },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich'], isRTL: false },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['el', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no'], isRTL: false },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['il', 'di', 'che', 'è', 'la', 'per', 'un', 'sono', 'mi', 'ho'], isRTL: false },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['o', 'de', 'a', 'que', 'e', 'do', 'da', 'em', 'um', 'para'], isRTL: false },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', script: 'Cyrillic', unicodeRange: UNICODE_RANGES.CYRILLIC, commonWords: ['в', 'и', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а'], isRTL: false },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', script: 'CJK', unicodeRange: UNICODE_RANGES.CJK, commonWords: ['的', '一', '是', '不', '了', '人', '我', '在', '有', '他'], isRTL: false },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', script: 'Japanese', unicodeRange: UNICODE_RANGES.HIRAGANA, commonWords: ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し'], isRTL: false },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', script: 'Korean', unicodeRange: UNICODE_RANGES.HANGUL, commonWords: ['의', '이', '가', '은', '는', '에', '를', '로', '과', '도'], isRTL: false },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', unicodeRange: UNICODE_RANGES.DEVANAGARI, commonWords: ['का', 'है', 'में', 'की', 'और', 'से', 'को', 'के', 'ने', 'पर'], isRTL: false },
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['ve', 'bir', 'yok', 'bu', 'için', 'mı', 'ben', 'de', 'çok', 'ama'], isRTL: false },
  nl: { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['de', 'van', 'een', 'het', 'en', 'in', 'te', 'dat', 'is', 'voor'], isRTL: false },
  pl: { code: 'pl', name: 'Polish', nativeName: 'Polski', script: 'Latin', unicodeRange: UNICODE_RANGES.LATIN, commonWords: ['się', 'w', 'nie', 'na', 'z', 'że', 'do', 'a', 'o', 'to'], isRTL: false },
};

export interface DetectionResult {
  language: string;
  confidence: number;
  script: string;
  isRTL: boolean;
  alternatives: Array<{ language: string; confidence: number }>;
}

export interface HTMLDetectionSource {
  source: string;
  language: string;
  confidence: number;
}

const MIN_TEXT_LENGTH = 10;
const CONFIDENCE_THRESHOLDS = { HIGH: 0.8, MEDIUM: 0.5, LOW: 0.3 };

export function supportsLanguageDetection(): boolean { return true; }

function countMatchingCharacters(text: string, range: RegExp): number {
  let count = 0;
  for (const char of text) { if (range.test(char)) count++; }
  return count;
}

function calculateCharacterRatio(text: string, range: RegExp): number {
  const cleanText = text.replace(/\s+/g, '');
  if (cleanText.length === 0) return 0;
  return countMatchingCharacters(cleanText, range) / cleanText.length;
}

function detectLatinLanguage(text: string): string | null {
  const lowerText = text.toLowerCase();
  const patterns: Record<string, RegExp[]> = {
    fr: [/\b(le|la|les|du|des|et|ou|un|une|ce|cet|cette|ces|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs|je|tu|il|elle|nous|vous|ils|elles|me|te|se|lui)\b/gi, /[àâäæçéèêëïîôœùûüÿ]/],
    de: [/\b(der|die|das|den|dem|des|und|ein|eine|einer|eines|einem|einen|ist|sind|war|waren|wird|werden|wurde|wurden|hat|haben|hatte|hatten|kann|können|konnte|konnten|soll|sollen|sollte|sollten|will|wollen|wollte|wollten|muss|müssen|musste|mussten|darf|dürfen|durfte|durften|mag|mögen|mochte|mochten)\b/gi, /[äöüß]/],
    es: [/\b(el|la|los|las|un|una|unos|unas|y|o|de|del|al|en|con|por|para|que|quien|cual|cuales|este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas|mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras)\b/gi, /[áéíóúüñ¿¡]/],
    it: [/\b(il|lo|la|i|gli|le|un|uno|una|ed|od|del|dello|della|dei|degli|delle|al|allo|alla|ai|agli|alle|dal|dallo|dalla|dai|dagli|dalle|nel|nello|nella|nei|negli|nelle|col|coi|sul|sullo|sulla|sui|sugli|sulle|per|tra|fra)\b/gi, /[àèéìòù]/],
    pt: [/\b(o|a|os|as|um|uma|uns|umas|e|ou|de|do|da|dos|das|em|no|na|nos|nas|por|pelo|pela|pelos|pelas|para|ao|à|aos|às|com|sem|sob|sobre|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|aqueles|aquelas|meu|minha|meus|minhas|teu|tua|teus|tuas|seu|sua|seus|suas|nosso|nossa|nossos|nossas|vosso|vossa|vossos|vossas)\b/gi, /[àáâãçéêíóôõú]/],
    nl: [/\b(het|een|of|voor|met|door|over|van|naar|op|te|ter|ten|bij|uit|om|tot|zijn|zijne|haar|mijn|jouw|jouwe|ons|onze|uw|uwe|hun|hunne|dat|die|dit|deze|wat|wie|welk|welke|zo'n|zulk|zulke)\b/gi, /[äéëïöü]/],
    pl: [/\b(się|nie|na|że|ż|ć|ś|ź|ń|ą|ę|ó|ł|w|z|i|o|a|u|od|do|przez|za|przed|po|pod|nad|na|przy|obok|około|między|pomimo|podczas|według|bez|dla|z|ze|we)\b/gi],
    tr: [/\b(ve|bir|için|ile|de|da|ki|ben|sen|o|biz|siz|onlar|bu|şu|ne|kim|nasıl|hangi|her|bazı|tüm|hiç|çok|az|daha|en|iyi|kötü|güzel|büyük|küçük|yeni|eski|genç|yaşlı|uzun|kısa)\b/gi, /[çğıöşü]/],
  };
  
  const scores: Record<string, number> = {};
  for (const [lang, regexes] of Object.entries(patterns)) {
    scores[lang] = 0;
    for (const regex of regexes) {
      const matches = lowerText.match(regex);
      if (matches) scores[lang] += matches.length;
    }
  }
  
  let bestLang: string | null = null;
  let bestScore = 0;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; bestLang = lang; }
  }
  
  if (bestScore === 0 || bestScore < 1) return 'en';
  return bestLang;
}

export function detectLanguage(text: string): DetectionResult {
  if (!text || typeof text !== 'string') {
    return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
  }
  
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
  }
  
  const scriptScores: Array<{ code: string; ratio: number; pattern: LanguagePattern }> = [];
  for (const [code, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const ratio = calculateCharacterRatio(trimmedText, pattern.unicodeRange);
    if (ratio > 0) scriptScores.push({ code, ratio, pattern });
  }
  
  scriptScores.sort((a, b) => b.ratio - a.ratio);
  
  if (scriptScores.length === 0) {
    return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
  }
  
  const bestMatch = scriptScores[0];
  let detectedLang = bestMatch.code;
  let confidence = bestMatch.ratio;
  
  if (bestMatch.pattern.script === 'Latin' && trimmedText.length >= MIN_TEXT_LENGTH) {
    const specificLang = detectLatinLanguage(trimmedText);
    if (specificLang && specificLang !== 'en') {
      detectedLang = specificLang;
      confidence = Math.min(confidence + 0.1, 1.0);
    }
  }
  
  const alternatives = scriptScores.slice(1, 4).map(s => ({ language: s.code, confidence: s.ratio }));
  if (trimmedText.length < MIN_TEXT_LENGTH) confidence *= 0.7;
  
  const finalPattern = LANGUAGE_PATTERNS[detectedLang] || bestMatch.pattern;
  
  return {
    language: detectedLang,
    confidence: Math.round(confidence * 100) / 100,
    script: finalPattern.script,
    isRTL: finalPattern.isRTL,
    alternatives,
  };
}

export function getDetectionConfidence(text: string, detectedLang: string): number {
  if (!text || typeof text !== 'string' || !detectedLang) return 0;
  const pattern = LANGUAGE_PATTERNS[detectedLang];
  if (!pattern) return 0;
  
  const trimmedText = text.trim();
  if (trimmedText.length === 0) return 0;
  
  let confidence = calculateCharacterRatio(trimmedText, pattern.unicodeRange);
  const lowerText = trimmedText.toLowerCase();
  let commonWordMatches = 0;
  
  for (const word of pattern.commonWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) commonWordMatches += matches.length;
  }
  
  if (commonWordMatches > 0) {
    confidence = Math.min(confidence + Math.min(commonWordMatches * 0.05, 0.15), 1.0);
  }
  
  if (trimmedText.length < MIN_TEXT_LENGTH) confidence *= 0.7;
  else if (trimmedText.length > 100) confidence = Math.min(confidence * 1.1, 1.0);
  
  return Math.round(confidence * 100) / 100;
}

function extractLangAttribute(html: string): HTMLDetectionSource | null {
  const match = html.match(/<html[^>]*\blang=["']([^"']+)["'][^>]*>/i);
  if (match) {
    return { source: 'html-lang', language: match[1].toLowerCase().split('-')[0], confidence: 0.9 };
  }
  return null;
}

function extractMetaLanguage(html: string): HTMLDetectionSource | null {
  const metaPatterns = [
    /<meta[^>]*\bname=["']language["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*\bcontent=["']([^"']+)["'][^>]*\bname=["']language["'][^>]*>/i,
    /<meta[^>]*\bhttp-equiv=["']content-language["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*\bproperty=["']og:locale["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*\bname=["']twitter:locale["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i,
  ];
  
  for (const pattern of metaPatterns) {
    const match = html.match(pattern);
    if (match) {
      let lang = match[1].toLowerCase();
      if (lang.includes('_')) lang = lang.split('_')[0];
      else if (lang.includes('-')) lang = lang.split('-')[0];
      
      const source = pattern.toString().includes('og:locale') ? 'og:locale' : 
                    pattern.toString().includes('twitter') ? 'twitter:locale' :
                    pattern.toString().includes('content-language') ? 'http-equiv' : 'meta-language';
      return { source, language: lang, confidence: 0.85 };
    }
  }
  return null;
}

function extractContentTypeLanguage(html: string): HTMLDetectionSource | null {
  const match = html.match(/<meta[^>]*\bhttp-equiv=["']content-type["'][^>]*\bcontent=["'][^;]+;\s*charset=([^"']+)["'][^>]*>/i);
  if (match) {
    const charsetMap: Record<string, string> = {
      'utf-8': '', 'iso-8859-1': 'en', 'iso-8859-2': 'pl', 'iso-8859-6': 'ar', 'iso-8859-8': 'he',
      'windows-1251': 'ru', 'windows-1256': 'ar', 'euc-jp': 'ja', 'shift_jis': 'ja',
      'gb2312': 'zh', 'big5': 'zh', 'euc-kr': 'ko',
    };
    const lang = charsetMap[match[1].toLowerCase()];
    if (lang) return { source: 'charset', language: lang, confidence: 0.6 };
  }
  return null;
}

export function detectFromHTML(html: string): DetectionResult {
  if (!html || typeof html !== 'string') {
    return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
  }
  
  const trimmedHTML = html.trim();
  if (trimmedHTML.length === 0) {
    return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
  }
  
  const sources: HTMLDetectionSource[] = [];
  const langAttr = extractLangAttribute(trimmedHTML);
  if (langAttr) sources.push(langAttr);
  
  const metaLang = extractMetaLanguage(trimmedHTML);
  if (metaLang) sources.push(metaLang);
  
  const charsetLang = extractContentTypeLanguage(trimmedHTML);
  if (charsetLang) sources.push(charsetLang);
  
  if (sources.length > 0) {
    sources.sort((a, b) => b.confidence - a.confidence);
    const bestSource = sources[0];
    const pattern = LANGUAGE_PATTERNS[bestSource.language];
    
    if (pattern) {
      return {
        language: bestSource.language,
        confidence: bestSource.confidence,
        script: pattern.script,
        isRTL: pattern.isRTL,
        alternatives: sources.slice(1).map(s => ({ language: s.language, confidence: s.confidence })),
      };
    }
    return {
      language: bestSource.language,
      confidence: bestSource.confidence,
      script: 'unknown',
      isRTL: false,
      alternatives: sources.slice(1).map(s => ({ language: s.language, confidence: s.confidence })),
    };
  }
  
  const textContent = trimmedHTML
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (textContent.length > 0) return detectLanguage(textContent);
  
  return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
}

export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_PATTERNS);
}

export function getLanguageInfo(code: string): LanguagePattern | null {
  return LANGUAGE_PATTERNS[code.toLowerCase()] || null;
}

export function isRTLLanguage(code: string): boolean {
  const pattern = LANGUAGE_PATTERNS[code.toLowerCase()];
  return pattern ? pattern.isRTL : false;
}

export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' | 'unknown' {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return 'low';
  return 'unknown';
}

export function batchDetectLanguages(texts: string[]): DetectionResult[] {
  return texts.map(text => detectLanguage(text));
}

export function detectDominantLanguage(texts: string[]): DetectionResult {
  if (!texts || texts.length === 0) {
    return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
  }
  
  const detections = texts.map(text => detectLanguage(text));
  const langCounts: Record<string, { count: number; totalConfidence: number; detection: DetectionResult }> = {};
  
  for (const detection of detections) {
    if (detection.language === 'unknown') continue;
    if (!langCounts[detection.language]) {
      langCounts[detection.language] = { count: 0, totalConfidence: 0, detection };
    }
    langCounts[detection.language].count++;
    langCounts[detection.language].totalConfidence += detection.confidence;
  }
  
  let bestLang: string | null = null;
  let bestCount = 0;
  let bestConfidence = 0;
  
  for (const [lang, data] of Object.entries(langCounts)) {
    if (data.count > bestCount || (data.count === bestCount && data.totalConfidence > bestConfidence)) {
      bestCount = data.count;
      bestConfidence = data.totalConfidence;
      bestLang = lang;
    }
  }
  
  if (!bestLang) return { language: 'unknown', confidence: 0, script: 'unknown', isRTL: false, alternatives: [] };
  
  const avgConfidence = bestConfidence / langCounts[bestLang].count;
  const detection = langCounts[bestLang].detection;
  
  return {
    language: bestLang,
    confidence: Math.round(avgConfidence * 100) / 100,
    script: detection.script,
    isRTL: detection.isRTL,
    alternatives: detection.alternatives,
  };
}
