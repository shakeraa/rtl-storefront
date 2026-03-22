/**
 * T0303 - Spell Check Service
 * Lightweight spell-check using locale-aware common-word dictionaries.
 * Custom dictionaries are persisted per-shop per-locale in memory (process-level cache).
 * For production use, back this with a DB table or a third-party API.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpellCheckResult {
  correct: boolean;
  misspelled: Array<{ word: string; offset: number }>;
  suggestions: Record<string, string[]>;
}

export interface SuggestionResult {
  word: string;
  suggestions: string[];
  locale: string;
}

// ---------------------------------------------------------------------------
// Custom dictionary (in-memory, keyed by `${shop}:${locale}`)
// ---------------------------------------------------------------------------

const customDictionaries = new Map<string, Set<string>>();

function getDictionaryKey(shop: string, locale: string): string {
  return `${shop}:${locale}`;
}

function getCustomDictionary(shop: string, locale: string): Set<string> {
  const key = getDictionaryKey(shop, locale);
  if (!customDictionaries.has(key)) {
    customDictionaries.set(key, new Set());
  }
  return customDictionaries.get(key)!;
}

// ---------------------------------------------------------------------------
// Locale-specific known-bad/good word lists (minimal, extendable)
// ---------------------------------------------------------------------------

// A tiny sample of common English misspellings -> corrections
const COMMON_MISSPELLINGS: Record<string, Record<string, string>> = {
  en: {
    recieve: "receive",
    occured: "occurred",
    seperate: "separate",
    definately: "definitely",
    accomodate: "accommodate",
    untill: "until",
    occurance: "occurrence",
    beleive: "believe",
    freind: "friend",
    wierd: "weird",
  },
  ar: {},
  he: {},
  fr: {},
  de: {},
  es: {},
};

/**
 * Very simple tokenizer -- splits on whitespace and strips punctuation.
 */
function tokenize(text: string): Array<{ word: string; offset: number }> {
  const tokens: Array<{ word: string; offset: number }> = [];
  const re = /\b[a-zA-Z\u00C0-\u024F\u0590-\u05FF\u0600-\u06FF]+\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    tokens.push({ word: match[0], offset: match.index });
  }
  return tokens;
}

/**
 * Levenshtein distance -- used to generate suggestions.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Check spelling of a body of text for the given locale.
 */
export function checkSpelling(
  text: string,
  locale: string,
  shop = "",
): SpellCheckResult {
  const langCode = locale.split("-")[0].toLowerCase();
  const misspellings = COMMON_MISSPELLINGS[langCode] ?? {};
  const customDict = shop ? getCustomDictionary(shop, locale) : new Set<string>();

  const tokens = tokenize(text);
  const misspelled: Array<{ word: string; offset: number }> = [];
  const suggestions: Record<string, string[]> = {};

  for (const { word, offset } of tokens) {
    const lower = word.toLowerCase();
    if (customDict.has(lower)) continue;
    if (Object.prototype.hasOwnProperty.call(misspellings, lower)) {
      misspelled.push({ word, offset });
      suggestions[word] = [misspellings[lower]];
    }
  }

  return {
    correct: misspelled.length === 0,
    misspelled,
    suggestions,
  };
}

/**
 * Get spelling suggestions for a single word in the given locale.
 */
export function getSuggestions(word: string, locale: string): SuggestionResult {
  const langCode = locale.split("-")[0].toLowerCase();
  const misspellings = COMMON_MISSPELLINGS[langCode] ?? {};
  const lower = word.toLowerCase();

  // Exact match in known misspellings
  if (Object.prototype.hasOwnProperty.call(misspellings, lower)) {
    return { word, suggestions: [misspellings[lower]], locale };
  }

  // Fuzzy match (edit distance <= 2)
  const candidates = Object.keys(misspellings)
    .filter((k) => levenshtein(lower, k) <= 2)
    .map((k) => misspellings[k]);

  return { word, suggestions: candidates.slice(0, 5), locale };
}

/**
 * Add a word to the shop's custom dictionary so it won't be flagged.
 */
export function addToCustomDictionary(
  shop: string,
  word: string,
  locale: string,
): void {
  getCustomDictionary(shop, locale).add(word.toLowerCase());
}
