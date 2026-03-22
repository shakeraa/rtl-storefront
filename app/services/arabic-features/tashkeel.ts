/**
 * Arabic Diacritics (Tashkeel) Handling Module
 * 
 * Provides utilities for working with Arabic diacritical marks (tashkeel)
 * including adding, removing, detecting, and normalizing tashkeel characters.
 * 
 * Tashkeel characters are used in Arabic to indicate vowel sounds and
 * pronunciation guides. They are positioned above or below Arabic letters.
 */

// Unicode ranges and specific characters for Arabic diacritics
export const TASHKEEL_CHARS = {
  // Basic vowel marks (Harakat)
  FATHA: '\u064E',                    // َ  - Short 'a' sound (above letter)
  DAMMA: '\u064F',                    // ُ  - Short 'u' sound (above letter)
  KASRA: '\u0650',                    // ِ  - Short 'i' sound (below letter)
  SUKUN: '\u0652',                    // ْ  - Absence of vowel (above letter)
  SHADDA: '\u0651',                   // ّ  - Gemination/doubling (above letter)
  
  // Tanween (Nunation - indefinite accusative/genitive/nominative endings)
  FATHATAN: '\u064B',                 // ً  - Double fatha (two short 'a' sounds)
  DAMMATAN: '\u064C',                 // ٌ  - Double damma (two short 'u' sounds)
  KASRATAN: '\u064D',                 // ٍ  - Double kasra (two short 'i' sounds)
  
  // Extended Arabic diacritics
  SHADDA_PLUS_FATHA: '\uFC60',        // ﱠ - Shadda + Fatha ligature
  SHADDA_PLUS_DAMMA: '\uFC61',        // ﱡ - Shadda + Damma ligature
  SHADDA_PLUS_KASRA: '\uFC62',        // ﱢ - Shadda + Kasra ligature
  
  // Quranic/extended marks
  MADDAH_ABOVE: '\u0653',             // ٓ  - Maddah above
  HAMZA_ABOVE: '\u0654',              // ٔ  - Hamza above
  HAMZA_BELOW: '\u0655',              // ٕ  - Hamza below
  SUBSCRIPT_ALEF: '\u0656',           // ٖ  - Subscript alef
  INVERTED_DAMMA: '\u0657',           // ٗ  - Inverted damma
  MARK_NOON_GHUNNA: '\u0658',         // ٘  - Noon ghunna mark
  ZWARAKAY: '\u0659',                 // ٙ  - Zwarakay
  VOWEL_SMALL_V: '\u065A',            // ٚ  - Small vowel 'v'
  VOWEL_INVERTED_SMALL_V: '\u065B',   // ٛ  - Inverted small vowel 'v'
  RING: '\u065C',                     // ٜ  - Ring
  FATHA_WITH_RING: '\u065D',          // ٝ  - Fatha with ring
  WAVY_HAMZA: '\u065E',               // ٞ  - Wavy hamza
  FATHA_WITH_DOT_ABOVE: '\u065F',     // ٟ  - Fatha with dot above
  
  // Koranic annotation signs
  SAJDAH: '\u06E9',                   // ۩  - Sajdah mark
  EMPTY_CENTRE_LOW_STOP: '\u06EA',    // ۪  - Empty centre low stop
  EMPTY_CENTRE_HIGH_STOP: '\u06EB',   // ۫  - Empty centre high stop
  ROUNDED_HIGH_STOP_FILLED: '\u06EC', // ۬  - Rounded high stop with filled centre
  SMALL_LOW_MEEM: '\u06ED',           // ۭ  - Small low meem
} as const;

// Regex pattern matching all tashkeel characters
export const TASHKEEL_PATTERN = /[\u064B-\u065F\u0670\u0640\uFC60-\uFC62\u06E9-\u06ED]/g;

// Individual patterns for specific tashkeel types
export const HARAKAT_PATTERN = /[\u064E\u064F\u0650\u0652]/g; // Fatha, Damma, Kasra, Sukun
export const TANWEEN_PATTERN = /[\u064B-\u064D]/g; // Fathatan, Dammatan, Kasratan
export const SHADDA_PATTERN = /\u0651/g;

// Extended tashkeel pattern (includes Quranic marks)
export const EXTENDED_TASHKEEL_PATTERN = /[\u064B-\u065F\u0670\u0640\uFC60-\uFC62\u06E9-\u06ED\u06DF-\u06E8]/g;

export type TashkeelType = 
  | 'fatha' 
  | 'damma' 
  | 'kasra' 
  | 'sukun' 
  | 'shadda' 
  | 'fathatan' 
  | 'dammatan' 
  | 'kasratan'
  | 'maddah'
  | 'hamza_above'
  | 'hamza_below'
  | 'other';

export interface TashkeelAnalysis {
  hasTashkeel: boolean;
  count: number;
  types: TashkeelType[];
  positions: Array<{ index: number; char: string; type: TashkeelType }>;
}

/**
 * Add tashkeel (diacritics) to Arabic text
 * Uses a simple rule-based approach for demonstration
 * In production, this would typically use an AI/NLP model
 * 
 * @param text - Arabic text without tashkeel
 * @param options - Optional configuration
 * @returns Text with tashkeel added
 */
export function addTashkeel(
  text: string, 
  options: { 
    fathaForAlef?: boolean;
    kasraForYa?: boolean;
    dammaForWaw?: boolean;
  } = {}
): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const { fathaForAlef = true, kasraForYa = true, dammaForWaw = true } = options;
  
  let result = '';
  const chars = Array.from(text);
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const code = char.charCodeAt(0);
    result += char;
    
    // Skip if current char is already tashkeel
    if (isTashkeelChar(char)) {
      continue;
    }
    
    // Check if next char is tashkeel (preserve existing)
    const nextChar = chars[i + 1];
    if (nextChar && isTashkeelChar(nextChar)) {
      continue;
    }
    
    // Add basic vowel hints based on context
    // Alef (ا) often has fatha sound
    if (fathaForAlef && char === 'ا' && i < chars.length - 1) {
      const nextLetter = chars[i + 1];
      if (nextLetter && isArabicLetter(nextLetter) && !isTashkeelChar(nextLetter)) {
        result += TASHKEEL_CHARS.FATHA;
      }
    }
    
    // Ya (ي) at end often has kasra sound
    if (kasraForYa && char === 'ي' && i === chars.length - 1) {
      result += TASHKEEL_CHARS.KASRA;
    }
    
    // Waw (و) at end often has damma sound
    if (dammaForWaw && char === 'و' && i === chars.length - 1) {
      result += TASHKEEL_CHARS.DAMMA;
    }
  }
  
  return result;
}

/**
 * Remove all tashkeel characters from Arabic text
 * 
 * @param text - Text with tashkeel
 * @param options - Optional configuration for selective removal
 * @returns Text without tashkeel
 */
export function removeTashkeel(
  text: string,
  options: {
    keepShadda?: boolean;
    keepExtended?: boolean;
  } = {}
): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  const { keepShadda = false, keepExtended = false } = options;
  
  let pattern = TASHKEEL_PATTERN;
  
  if (keepShadda && !keepExtended) {
    // Remove everything except shadda
    pattern = /[\u064B-\u0650\u0652-\u065F\u0670\u0640\uFC60-\uFC62\u06E9-\u06ED]/g;
  } else if (!keepShadda && keepExtended) {
    // Keep extended marks, remove basic tashkeel
    pattern = /[\u064B-\u0652\u0651]/g;
  } else if (keepShadda && keepExtended) {
    // Keep both shadda and extended marks
    pattern = /[\u064B-\u0650\u0652]/g;
  }
  
  return text.replace(pattern, '');
}

/**
 * Check if text contains any tashkeel characters
 * 
 * @param text - Text to check
 * @param options - Optional configuration
 * @returns True if text contains tashkeel
 */
export function hasTashkeel(
  text: string,
  options: {
    includeExtended?: boolean;
    specificType?: TashkeelType;
  } = {}
): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const { includeExtended = false, specificType } = options;
  
  if (specificType) {
    return getTashkeelPositionsByType(text, specificType).length > 0;
  }
  
  const pattern = includeExtended ? EXTENDED_TASHKEEL_PATTERN : TASHKEEL_PATTERN;
  return pattern.test(text);
}

/**
 * Normalize tashkeel in text
 * - Removes duplicate consecutive tashkeel
 * - Standardizes combined marks
 * - Fixes common tashkeel placement issues
 * 
 * @param text - Text with tashkeel to normalize
 * @returns Normalized text
 */
export function normalizeTashkeel(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let result = text;
  
  // Step 1: Remove duplicate consecutive tashkeel of same type
  const tashkeelChars = Object.values(TASHKEEL_CHARS);
  for (const char of tashkeelChars) {
    const duplicatePattern = new RegExp(`${char}{2,}`, 'g');
    result = result.replace(duplicatePattern, char);
  }
  
  // Step 2: Normalize Shadda + Haraka combinations
  // Shadda + Fatha should be in consistent order
  result = result.replace(
    /\u0651\u064E/g, 
    `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.FATHA}`
  );
  result = result.replace(
    /\u064E\u0651/g, 
    `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.FATHA}`
  );
  
  // Shadda + Damma
  result = result.replace(
    /\u0651\u064F/g, 
    `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.DAMMA}`
  );
  result = result.replace(
    /\u064F\u0651/g, 
    `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.DAMMA}`
  );
  
  // Shadda + Kasra
  result = result.replace(
    /\u0651\u0650/g, 
    `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.KASRA}`
  );
  result = result.replace(
    /\u0650\u0651/g, 
    `${TASHKEEL_CHARS.SHADDA}${TASHKEEL_CHARS.KASRA}`
  );
  
  // Step 3: Remove tashkeel from non-Arabic characters
  result = removeTashkeelFromNonArabic(result);
  
  // Step 4: Fix isolated tashkeel (tashkeel not attached to letters)
  result = removeIsolatedTashkeel(result);
  
  return result;
}

/**
 * Analyze tashkeel in text and return detailed information
 * 
 * @param text - Text to analyze
 * @returns Analysis result with counts and positions
 */
export function analyzeTashkeel(text: string): TashkeelAnalysis {
  const defaultResult: TashkeelAnalysis = {
    hasTashkeel: false,
    count: 0,
    types: [],
    positions: [],
  };

  if (!text || typeof text !== 'string') {
    return defaultResult;
  }

  const analysis: TashkeelAnalysis = {
    hasTashkeel: false,
    count: 0,
    types: [],
    positions: [],
  };

  const chars = Array.from(text);
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const type = getTashkeelType(char);
    
    if (type) {
      analysis.hasTashkeel = true;
      analysis.count++;
      
      if (!analysis.types.includes(type)) {
        analysis.types.push(type);
      }
      
      analysis.positions.push({
        index: i,
        char,
        type,
      });
    }
  }

  return analysis;
}

/**
 * Toggle tashkeel - add if missing, remove if present
 * 
 * @param text - Input text
 * @returns Text with tashkeel toggled
 */
export function toggleTashkeel(text: string): string {
  if (hasTashkeel(text)) {
    return removeTashkeel(text);
  }
  return addTashkeel(text);
}

/**
 * Get the count of tashkeel characters in text
 * 
 * @param text - Text to count
 * @param options - Optional configuration
 * @returns Number of tashkeel characters
 */
export function countTashkeel(
  text: string,
  options: { includeExtended?: boolean } = {}
): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const { includeExtended = false } = options;
  const pattern = includeExtended ? EXTENDED_TASHKEEL_PATTERN : TASHKEEL_PATTERN;
  const matches = text.match(pattern);
  
  return matches ? matches.length : 0;
}

/**
 * Compare two texts ignoring tashkeel differences
 * 
 * @param text1 - First text
 * @param text2 - Second text
 * @returns True if texts are equal when tashkeel is ignored
 */
export function compareIgnoringTashkeel(text1: string, text2: string): boolean {
  if (!text1 || !text2) {
    return text1 === text2;
  }
  
  const normalized1 = removeTashkeel(text1).trim();
  const normalized2 = removeTashkeel(text2).trim();
  
  return normalized1 === normalized2;
}

/**
 * Check if a character is a tashkeel/diacritic character
 * 
 * @param char - Character to check
 * @param includeExtended - Whether to include extended marks
 * @returns True if character is tashkeel
 */
export function isTashkeelChar(char: string, includeExtended = false): boolean {
  if (!char || char.length !== 1) {
    return false;
  }
  
  const code = char.charCodeAt(0);
  
  // Basic tashkeel range: U+064B to U+065F
  if (code >= 0x064B && code <= 0x065F) {
    return true;
  }
  
  // Superscript alef (U+0670)
  if (code === 0x0670) {
    return true;
  }
  
  // Tatweel/kashida (U+0640)
  if (code === 0x0640) {
    return true;
  }
  
  if (includeExtended) {
    // Extended ranges
    if (code >= 0xFC60 && code <= 0xFC62) return true; // Shadda combinations
    if (code >= 0x06E9 && code <= 0x06ED) return true; // Quranic marks
    if (code >= 0x06DF && code <= 0x06E8) return true; // More Quranic marks
  }
  
  return false;
}

/**
 * Get the type of tashkeel character
 * 
 * @param char - Character to check
 * @returns Tashkeel type or null if not tashkeel
 */
export function getTashkeelType(char: string): TashkeelType | null {
  if (!char || char.length !== 1) {
    return null;
  }
  
  switch (char) {
    case TASHKEEL_CHARS.FATHA:
      return 'fatha';
    case TASHKEEL_CHARS.DAMMA:
      return 'damma';
    case TASHKEEL_CHARS.KASRA:
      return 'kasra';
    case TASHKEEL_CHARS.SUKUN:
      return 'sukun';
    case TASHKEEL_CHARS.SHADDA:
      return 'shadda';
    case TASHKEEL_CHARS.FATHATAN:
      return 'fathatan';
    case TASHKEEL_CHARS.DAMMATAN:
      return 'dammatan';
    case TASHKEEL_CHARS.KASRATAN:
      return 'kasratan';
    case TASHKEEL_CHARS.MADDAH_ABOVE:
      return 'maddah';
    case TASHKEEL_CHARS.HAMZA_ABOVE:
      return 'hamza_above';
    case TASHKEEL_CHARS.HAMZA_BELOW:
      return 'hamza_below';
    default:
      if (isTashkeelChar(char, true)) {
        return 'other';
      }
      return null;
  }
}

/**
 * Get all tashkeel positions for a specific type
 * 
 * @param text - Text to search
 * @param type - Tashkeel type to find
 * @returns Array of positions (indices)
 */
function getTashkeelPositionsByType(text: string, type: TashkeelType): number[] {
  const positions: number[] = [];
  const chars = Array.from(text);
  
  for (let i = 0; i < chars.length; i++) {
    if (getTashkeelType(chars[i]) === type) {
      positions.push(i);
    }
  }
  
  return positions;
}

/**
 * Check if a character is an Arabic letter
 * 
 * @param char - Character to check
 * @returns True if Arabic letter
 */
function isArabicLetter(char: string): boolean {
  if (!char || char.length !== 1) {
    return false;
  }
  
  const code = char.charCodeAt(0);
  
  // Arabic basic range: U+0600 to U+06FF
  if (code >= 0x0600 && code <= 0x06FF) {
    // Exclude Arabic punctuation and symbols
    if (code >= 0x0600 && code <= 0x0605) return false; // Arabic number signs
    if (code >= 0x0606 && code <= 0x0608) return false; // Arabic footnote marks
    if (code >= 0x0609 && code <= 0x060A) return false; // Arabic signs
    if (code === 0x060B) return false; // Afghan sign
    if (code === 0x060C) return false; // Arabic comma
    if (code === 0x060D) return false; // Arabic date separator
    if (code >= 0x060E && code <= 0x060F) return false; // Arabic poetric signs
    if (code === 0x0610) return false; // Arabic sign sallallahou
    if (code === 0x0611) return false; // Arabic sign alayhe
    if (code === 0x0612) return false; // Arabic sign rahmatullah
    if (code === 0x0613) return false; // Arabic sign radi
    if (code === 0x0614) return false; // Arabic sign takhallus
    if (code === 0x0615) return false; // Arabic small high tah
    if (code === 0x0616) return false; // Arabic small high ligature alef with lam
    if (code === 0x0617) return false; // Arabic small high zain
    if (code === 0x0618) return false; // Arabic small fatha
    if (code === 0x0619) return false; // Arabic small damma
    if (code === 0x061A) return false; // Arabic small kasra
    if (code === 0x061B) return false; // Arabic semicolon
    if (code === 0x061C) return false; // Arabic letter mark
    if (code === 0x061D) return false; // Arabic end of text marker
    if (code === 0x061E) return false; // Arabic triple dot punctuation
    if (code === 0x061F) return false; // Arabic question mark
    if (code === 0x0640) return false; // Arabic tatweel
    
    return true;
  }
  
  // Arabic supplement: U+0750 to U+077F
  if (code >= 0x0750 && code <= 0x077F) {
    return true;
  }
  
  // Arabic extended-A: U+08A0 to U+08FF
  if (code >= 0x08A0 && code <= 0x08FF) {
    return true;
  }
  
  return false;
}

/**
 * Remove tashkeel from non-Arabic characters (like numbers, punctuation)
 * 
 * @param text - Text to process
 * @returns Cleaned text
 */
function removeTashkeelFromNonArabic(text: string): string {
  const chars = Array.from(text);
  let result = '';
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    if (isTashkeelChar(char)) {
      // Check if previous character is Arabic
      const prevChar = chars[i - 1];
      if (prevChar && isArabicLetter(prevChar)) {
        result += char;
      }
      // Otherwise skip this tashkeel (it's on non-Arabic)
    } else {
      result += char;
    }
  }
  
  return result;
}

/**
 * Remove isolated tashkeel (tashkeel at beginning or not following Arabic letter)
 * 
 * @param text - Text to process
 * @returns Cleaned text
 */
function removeIsolatedTashkeel(text: string): string {
  const chars = Array.from(text);
  
  // Remove leading tashkeel
  while (chars.length > 0 && isTashkeelChar(chars[0])) {
    chars.shift();
  }
  
  return chars.join('');
}

/**
 * Get all tashkeel characters as an array
 * 
 * @returns Array of tashkeel character codes and names
 */
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
