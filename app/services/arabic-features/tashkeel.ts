/**
 * Arabic Diacritics (Tashkeel) Handling Module
 */

// Unicode ranges and specific characters for Arabic diacritics
export const TASHKEEL_CHARS = {
  FATHA: '\u064E',
  DAMMA: '\u064F',
  KASRA: '\u0650',
  SUKUN: '\u0652',
  SHADDA: '\u0651',
  FATHATAN: '\u064B',
  DAMMATAN: '\u064C',
  KASRATAN: '\u064D',
  MADDAH_ABOVE: '\u0653',
  HAMZA_ABOVE: '\u0654',
  HAMZA_BELOW: '\u0655',
} as const;

export const TASHKEEL_PATTERN = /[\u064B-\u065F\u0670\u0640\uFC60-\uFC62\u06E9-\u06ED]/g;
export const EXTENDED_TASHKEEL_PATTERN = /[\u064B-\u065F\u0670\u0640\uFC60-\uFC62\u06E9-\u06ED\u06DF-\u06E8]/g;

export type TashkeelType = 
  | 'fatha' | 'damma' | 'kasra' | 'sukun' | 'shadda' 
  | 'fathatan' | 'dammatan' | 'kasratan'
  | 'maddah' | 'hamza_above' | 'hamza_below' | 'other';

export interface TashkeelAnalysis {
  hasTashkeel: boolean;
  count: number;
  types: TashkeelType[];
  positions: Array<{ index: number; char: string; type: TashkeelType }>;
}

export function addTashkeel(text: string, options: { fathaForAlef?: boolean; kasraForYa?: boolean; dammaForWaw?: boolean } = {}): string {
  if (!text || typeof text !== 'string') return text;
  const { fathaForAlef = true, kasraForYa = true, dammaForWaw = true } = options;
  let result = '';
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    result += char;
    if (isTashkeelChar(char)) continue;
    const nextChar = chars[i + 1];
    if (nextChar && isTashkeelChar(nextChar)) continue;
    if (fathaForAlef && char === 'ا' && i < chars.length - 1) {
      const nextLetter = chars[i + 1];
      if (nextLetter && isArabicLetter(nextLetter) && !isTashkeelChar(nextLetter)) result += TASHKEEL_CHARS.FATHA;
    }
    if (kasraForYa && char === 'ي' && i === chars.length - 1) result += TASHKEEL_CHARS.KASRA;
    if (dammaForWaw && char === 'و' && i === chars.length - 1) result += TASHKEEL_CHARS.DAMMA;
  }
  return result;
}

export function removeTashkeel(text: string, options: { keepShadda?: boolean; keepExtended?: boolean } = {}): string {
  if (!text || typeof text !== 'string') return text;
  const { keepShadda = false, keepExtended = false } = options;
  let pattern = TASHKEEL_PATTERN;
  if (keepShadda && !keepExtended) pattern = /[\u064B-\u0650\u0652-\u065F\u0670\u0640\uFC60-\uFC62\u06E9-\u06ED]/g;
  else if (!keepShadda && keepExtended) pattern = /[\u064B-\u0652\u0651]/g;
  else if (keepShadda && keepExtended) pattern = /[\u064B-\u0650\u0652]/g;
  return text.replace(pattern, '');
}

export function hasTashkeel(text: string, options: { includeExtended?: boolean; specificType?: TashkeelType } = {}): boolean {
  if (!text || typeof text !== 'string') return false;
  const { includeExtended = false, specificType } = options;
  if (specificType) return getTashkeelPositionsByType(text, specificType).length > 0;
  const pattern = includeExtended ? EXTENDED_TASHKEEL_PATTERN : TASHKEEL_PATTERN;
  return pattern.test(text);
}

export function normalizeTashkeel(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  const tashkeelChars = Object.values(TASHKEEL_CHARS);
  for (const char of tashkeelChars) {
    const duplicatePattern = new RegExp(`${char}{2,}`, 'g');
    result = result.replace(duplicatePattern, char);
  }
  result = result.replace(/\u0651\u064E/g, `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.FATHA}`);
  result = result.replace(/\u064E\u0651/g, `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.FATHA}`);
  result = result.replace(/\u0651\u064F/g, `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.DAMMA}`);
  result = result.replace(/\u064F\u0651/g, `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.DAMMA}`);
  result = result.replace(/\u0651\u0650/g, `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.KASRA}`);
  result = result.replace(/\u0650\u0651/g, `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.KASRA}`);
  result = removeTashkeelFromNonArabic(result);
  result = removeIsolatedTashkeel(result);
  return result;
}

export function analyzeTashkeel(text: string): TashkeelAnalysis {
  const defaultResult: TashkeelAnalysis = { hasTashkeel: false, count: 0, types: [], positions: [] };
  if (!text || typeof text !== 'string') return defaultResult;
  const analysis: TashkeelAnalysis = { hasTashkeel: false, count: 0, types: [], positions: [] };
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const type = getTashkeelType(char);
    if (type) {
      analysis.hasTashkeel = true;
      analysis.count++;
      if (!analysis.types.includes(type)) analysis.types.push(type);
      analysis.positions.push({ index: i, char, type });
    }
  }
  return analysis;
}

export function toggleTashkeel(text: string): string {
  return hasTashkeel(text) ? removeTashkeel(text) : addTashkeel(text);
}

export function countTashkeel(text: string, options: { includeExtended?: boolean } = {}): number {
  if (!text || typeof text !== 'string') return 0;
  const { includeExtended = false } = options;
  const pattern = includeExtended ? EXTENDED_TASHKEEL_PATTERN : TASHKEEL_PATTERN;
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

export function compareIgnoringTashkeel(text1: string, text2: string): boolean {
  if (!text1 || !text2) return text1 === text2;
  return removeTashkeel(text1).trim() === removeTashkeel(text2).trim();
}

export function isTashkeelChar(char: string, includeExtended = false): boolean {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  if (code >= 0x064B && code <= 0x065F) return true;
  if (code === 0x0670) return true;
  if (code === 0x0640) return true;
  if (includeExtended) {
    if (code >= 0xFC60 && code <= 0xFC62) return true;
    if (code >= 0x06E9 && code <= 0x06ED) return true;
    if (code >= 0x06DF && code <= 0x06E8) return true;
  }
  return false;
}

export function getTashkeelType(char: string): TashkeelType | null {
  if (!char || char.length !== 1) return null;
  switch (char) {
    case TASHKEEL_CHARS.FATHA: return 'fatha';
    case TASHKEEL_CHARS.DAMMA: return 'damma';
    case TASHKEEL_CHARS.KASRA: return 'kasra';
    case TASHKEEL_CHARS.SUKUN: return 'sukun';
    case TASHKEEL_CHARS.SHADDA: return 'shadda';
    case TASHKEEL_CHARS.FATHATAN: return 'fathatan';
    case TASHKEEL_CHARS.DAMMATAN: return 'dammatan';
    case TASHKEEL_CHARS.KASRATAN: return 'kasratan';
    case TASHKEEL_CHARS.MADDAH_ABOVE: return 'maddah';
    case TASHKEEL_CHARS.HAMZA_ABOVE: return 'hamza_above';
    case TASHKEEL_CHARS.HAMZA_BELOW: return 'hamza_below';
    default: return isTashkeelChar(char, true) ? 'other' : null;
  }
}

function getTashkeelPositionsByType(text: string, type: TashkeelType): number[] {
  const positions: number[] = [];
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) if (getTashkeelType(chars[i]) === type) positions.push(i);
  return positions;
}

function isArabicLetter(char: string): boolean {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  if (code >= 0x0600 && code <= 0x06FF) {
    if (code >= 0x0600 && code <= 0x0605) return false;
    if (code >= 0x0606 && code <= 0x0608) return false;
    if (code >= 0x0609 && code <= 0x060A) return false;
    if (code === 0x060B || code === 0x060C || code === 0x060D) return false;
    if (code >= 0x060E && code <= 0x061F) return false;
    if (code === 0x0640) return false;
    return true;
  }
  if (code >= 0x0750 && code <= 0x077F) return true;
  if (code >= 0x08A0 && code <= 0x08FF) return true;
  return false;
}

function removeTashkeelFromNonArabic(text: string): string {
  const chars = Array.from(text);
  let result = '';
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (isTashkeelChar(char)) {
      const prevChar = chars[i - 1];
      if (prevChar && isArabicLetter(prevChar)) result += char;
    } else result += char;
  }
  return result;
}

function removeIsolatedTashkeel(text: string): string {
  const chars = Array.from(text);
  while (chars.length > 0 && isTashkeelChar(chars[0])) chars.shift();
  return chars.join('');
}

export function getTashkeelCharacters(): Array<{ char: string; name: string; unicode: string }> {
  return [
    { char: TASHKEEL_CHARS.FATHA, name: 'Fatha', unicode: 'U+064E' },
    { char: TASHKEEL_CHARS.DAMMA, name: 'Damma', unicode: 'U+064F' },
    { char: TASHKEEL_CHARS.KASRA, name: 'Kasra', unicode: 'U+0650' },
    { char: TASHKEEL_CHARS.SUKUN, name: 'Sukun', unicode: 'U+0652' },
    { char: TASHKEEL_CHARS.SHADDA, name: 'Shadda', unicode: 'U+0651' },
    { char: TASHKEEL_CHARS.FATHATAN, name: 'Fathatan', unicode: 'U+064B' },
    { char: TASHKEEL_CHARS.DAMMATAN, name: 'Dammatan', unicode: 'U+064C' },
    { char: TASHKEEL_CHARS.KASRATAN, name: 'Kasratan', unicode: 'U+064D' },
    { char: TASHKEEL_CHARS.MADDAH_ABOVE, name: 'Maddah Above', unicode: 'U+0653' },
    { char: TASHKEEL_CHARS.HAMZA_ABOVE, name: 'Hamza Above', unicode: 'U+0654' },
    { char: TASHKEEL_CHARS.HAMZA_BELOW, name: 'Hamza Below', unicode: 'U+0655' },
  ];
}
