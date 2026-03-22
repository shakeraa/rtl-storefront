export type {
  TMEntry,
  TMSearchResult,
  GlossaryTerm,
  GlossaryLanguageBucket,
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
  getGlossaryTargetLocales,
  getGlossariesByLanguage,
  deleteTerm,
  importTerms,
  exportTerms,
  exportTermsByLanguage,
} from "./glossary";
