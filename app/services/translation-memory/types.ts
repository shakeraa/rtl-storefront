export interface TMEntry {
  id: string;
  sourceLocale: string;
  targetLocale: string;
  sourceText: string;
  translatedText: string;
  context?: string;
  category?: string;
  quality: number;
  usageCount: number;
}

export interface TMSearchResult {
  entry: TMEntry;
  similarity: number;
  matchType: "exact" | "fuzzy";
}

export interface GlossaryTerm {
  id: string;
  sourceLocale: string;
  targetLocale: string;
  sourceTerm: string;
  translatedTerm: string;
  neverTranslate: boolean;
  caseSensitive: boolean;
  category?: string;
  notes?: string;
}

export interface TMImportExportFormat {
  version: string;
  entries: Array<{
    sourceLocale: string;
    targetLocale: string;
    sourceText: string;
    translatedText: string;
    context?: string;
    category?: string;
  }>;
}
