/**
 * Bidirectional Search Service
 * T0392: Arabic/Hebrew text normalization, transliteration, and search matching
 */

// ---------------------------------------------------------------------------
// Transliteration maps
// ---------------------------------------------------------------------------

export const ARABIC_TO_LATIN_MAP: Record<string, string> = {
  "\u0627": "a",   // ا alef
  "\u0628": "b",   // ب ba
  "\u062A": "t",   // ت ta
  "\u062B": "th",  // ث tha
  "\u062C": "j",   // ج jim
  "\u062D": "h",   // ح ha
  "\u062E": "kh",  // خ kha
  "\u062F": "d",   // د dal
  "\u0630": "dh",  // ذ dhal
  "\u0631": "r",   // ر ra
  "\u0632": "z",   // ز zay
  "\u0633": "s",   // س sin
  "\u0634": "sh",  // ش shin
  "\u0635": "s",   // ص sad
  "\u0636": "d",   // ض dad
  "\u0637": "t",   // ط ta
  "\u0638": "z",   // ظ za
  "\u0639": "a",   // ع ain
  "\u063A": "gh",  // غ ghayn
  "\u0641": "f",   // ف fa
  "\u0642": "q",   // ق qaf
  "\u0643": "k",   // ك kaf
  "\u0644": "l",   // ل lam
  "\u0645": "m",   // م mim
  "\u0646": "n",   // ن nun
  "\u0647": "h",   // ه ha
  "\u0648": "w",   // و waw
  "\u064A": "y",   // ي ya
  "\u0621": "'",   // ء hamza
  "\u0623": "a",   // أ alef hamza above
  "\u0625": "i",   // إ alef hamza below
  "\u0622": "aa",  // آ alef madda
  "\u0629": "a",   // ة ta marbuta
  "\u0649": "a",   // ى alef maqsura
};

export const LATIN_TO_ARABIC_MAP: Record<string, string> = {
  a: "\u0627",
  b: "\u0628",
  t: "\u062A",
  th: "\u062B",
  j: "\u062C",
  h: "\u062D",
  kh: "\u062E",
  d: "\u062F",
  dh: "\u0630",
  r: "\u0631",
  z: "\u0632",
  s: "\u0633",
  sh: "\u0634",
  f: "\u0641",
  q: "\u0642",
  k: "\u0643",
  l: "\u0644",
  m: "\u0645",
  n: "\u0646",
  w: "\u0648",
  y: "\u064A",
  aa: "\u0622",
  gh: "\u063A",
  i: "\u0625",
};

// ---------------------------------------------------------------------------
// Arabic normalization
// ---------------------------------------------------------------------------

/** Unicode range for Arabic tashkeel (diacritics) */
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/**
 * Normalize Arabic text for search:
 * - Strips tashkeel (vowel diacritics)
 * - Normalizes hamza variants (أ إ آ) to bare alef (ا)
 * - Treats ta marbuta (ة) as ha (ه) for equivalence
 * - Normalizes alef maqsura (ى) to ya (ي)
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(TASHKEEL_REGEX, "")
    // Hamza normalization: أ إ آ ٱ → ا
    .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
    // Ta marbuta → ha
    .replace(/\u0629/g, "\u0647")
    // Alef maqsura → ya
    .replace(/\u0649/g, "\u064A");
}

// ---------------------------------------------------------------------------
// Hebrew normalization
// ---------------------------------------------------------------------------

/** Unicode range for Hebrew niqqud (vowel marks) */
const NIQQUD_REGEX = /[\u05B0-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g;

/** Final form → normal form mapping */
const HEBREW_FINAL_MAP: Record<string, string> = {
  "\u05DD": "\u05DE", // ם → מ
  "\u05DF": "\u05E0", // ן → נ
  "\u05DA": "\u05DB", // ך → כ
  "\u05E3": "\u05E4", // ף → פ
  "\u05E5": "\u05E6", // ץ → צ
};

/**
 * Normalize Hebrew text for search:
 * - Strips niqqud (vowel points)
 * - Maps final letter forms to their regular equivalents
 */
export function normalizeHebrew(text: string): string {
  let result = text.replace(NIQQUD_REGEX, "");
  for (const [final, normal] of Object.entries(HEBREW_FINAL_MAP)) {
    result = result.replaceAll(final, normal);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Locale-aware normalization
// ---------------------------------------------------------------------------

/**
 * Apply locale-specific normalization for search.
 * Falls back to lowercasing + whitespace trimming for unknown locales.
 */
export function normalizeForSearch(text: string, locale: string): string {
  const base = text.toLowerCase().trim();
  if (locale.startsWith("ar")) return normalizeArabic(base);
  if (locale.startsWith("he")) return normalizeHebrew(base);
  return base;
}

// ---------------------------------------------------------------------------
// Transliteration
// ---------------------------------------------------------------------------

/**
 * Transliterate Arabic text to Latin characters using ARABIC_TO_LATIN_MAP.
 */
export function transliterateArabicToLatin(text: string): string {
  let result = "";
  for (const char of text) {
    // Skip tashkeel
    if (TASHKEEL_REGEX.test(char)) {
      TASHKEEL_REGEX.lastIndex = 0;
      continue;
    }
    result += ARABIC_TO_LATIN_MAP[char] ?? char;
  }
  return result;
}

/**
 * Transliterate Latin text to Arabic characters using LATIN_TO_ARABIC_MAP.
 * Handles digraphs (th, kh, sh, dh, gh, aa) before single letters.
 */
export function transliterateLatinToArabic(text: string): string {
  let result = "";
  let i = 0;
  const lower = text.toLowerCase();
  while (i < lower.length) {
    // Try digraph first
    if (i + 1 < lower.length) {
      const digraph = lower.slice(i, i + 2);
      if (LATIN_TO_ARABIC_MAP[digraph]) {
        result += LATIN_TO_ARABIC_MAP[digraph];
        i += 2;
        continue;
      }
    }
    const ch = lower[i];
    result += LATIN_TO_ARABIC_MAP[ch] ?? ch;
    i++;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Search query building and product matching
// ---------------------------------------------------------------------------

export interface SearchQuery {
  normalized: string;
  transliterated: string;
  original: string;
}

/**
 * Build a search query with normalized, transliterated, and original forms.
 */
export function buildSearchQuery(query: string, locale: string): SearchQuery {
  const normalized = normalizeForSearch(query, locale);
  const isArabicLocale = locale.startsWith("ar");
  const transliterated = isArabicLocale
    ? transliterateArabicToLatin(query)
    : transliterateLatinToArabic(query);

  return { normalized, transliterated, original: query };
}

export interface SearchableProduct {
  title: string;
  description: string;
}

/**
 * Check if a product matches a search query using normalized comparison.
 * Checks both title and description against normalized and transliterated forms.
 */
export function matchesProduct(
  query: string,
  product: SearchableProduct,
  locale: string,
): boolean {
  const sq = buildSearchQuery(query, locale);
  const normTitle = normalizeForSearch(product.title, locale);
  const normDesc = normalizeForSearch(product.description, locale);

  const haystack = `${normTitle} ${normDesc}`;

  return (
    haystack.includes(sq.normalized) ||
    haystack.includes(sq.transliterated.toLowerCase()) ||
    haystack.includes(sq.original.toLowerCase())
  );
}
