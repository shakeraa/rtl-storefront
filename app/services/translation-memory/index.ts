export type {
  TMEntry,
  TMSearchResult,
  GlossaryTerm,
  TMImportExportFormat,
} from "./types";

export {
  levenshteinDistance,
  calculateSimilarity,
  normalizeForMatching,
} from "./matcher";

export {
  addEntry,
  findExact,
  findFuzzy,
  search,
  deleteEntry,
  getStats,
  exportEntries,
  importEntries,
} from "./store";

export {
  addTerm,
  findTerms,
  getNeverTranslateTerms,
  getAllTerms,
  deleteTerm,
  importTerms,
  exportTerms,
} from "./glossary";
