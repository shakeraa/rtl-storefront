/**
 * Fashion Corpus - consolidated into fashion-db service.
 * Re-exports for backward compatibility.
 */

export { searchFashionTerms, getFashionTerm } from "../fashion-db";

import type { ArabicDialect, FashionTerm } from "./types";
import { FASHION_DATABASE } from "../fashion-db";

/**
 * Flat list of fashion terms derived from the fashion-db for backward compatibility.
 */
export const FASHION_TERMS: FashionTerm[] = FASHION_DATABASE.map((entry) => ({
  english: entry.english,
  arabic: entry.arabic,
  category: entry.category.replace(/_/g, " "),
  dialect: entry.dialects ? (Object.keys(entry.dialects)[0] as ArabicDialect | undefined) : undefined,
  notes: entry.description,
}));

/**
 * Find fashion terms that appear in the given text (case-insensitive).
 * Checks both term names and search terms from the fashion database.
 */
export function findFashionTerms(text: string): FashionTerm[] {
  const lowerText = text.toLowerCase();
  return FASHION_TERMS.filter((term, index) => {
    // Check if term name appears in text
    if (lowerText.includes(term.english.toLowerCase()) || text.includes(term.arabic)) {
      return true;
    }
    // Also check searchTerms from the underlying database entry
    // Only match search terms with 3+ characters to avoid false positives from short abbreviations
    const dbEntry = FASHION_DATABASE[index];
    if (dbEntry?.searchTerms) {
      return dbEntry.searchTerms.some((st) => st.length >= 3 && lowerText.includes(st.toLowerCase()));
    }
    return false;
  });
}

/**
 * Get all fashion terms belonging to a specific category.
 */
export function getFashionTermsByCategory(category: string): FashionTerm[] {
  const normalizedCategory = category.toLowerCase();
  return FASHION_TERMS.filter(
    (term) => term.category.toLowerCase() === normalizedCategory,
  );
}

/**
 * Get fashion terms specific to a given Arabic dialect.
 */
export function getFashionTermsByDialect(dialect: ArabicDialect): FashionTerm[] {
  return FASHION_TERMS.filter(
    (term) => !term.dialect || term.dialect === dialect,
  );
}
