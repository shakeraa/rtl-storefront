/**
 * Normalize text for fuzzy matching: lowercase, trim, collapse whitespace.
 */
export function normalizeForMatching(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Compute the Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  // Use two rows instead of the full matrix for space efficiency.
  let previousRow = new Array<number>(lenB + 1);
  let currentRow = new Array<number>(lenB + 1);

  for (let j = 0; j <= lenB; j++) {
    previousRow[j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    currentRow[0] = i;

    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        previousRow[j] + 1,       // deletion
        currentRow[j - 1] + 1,    // insertion
        previousRow[j - 1] + cost // substitution
      );
    }

    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[lenB];
}

/**
 * Calculate normalized similarity between two strings (0 to 1).
 * 1 means identical, 0 means completely different.
 */
export function calculateSimilarity(a: string, b: string): number {
  const normalizedA = normalizeForMatching(a);
  const normalizedB = normalizeForMatching(b);

  if (normalizedA === normalizedB) return 1;

  const maxLen = Math.max(normalizedA.length, normalizedB.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(normalizedA, normalizedB);
  return 1 - distance / maxLen;
}
