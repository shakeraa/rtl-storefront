export type ArabicDialect = "msa" | "gulf" | "egyptian" | "levantine" | "maghrebi";
export type FormalityLevel = "formal" | "informal" | "casual";

export interface CulturalContextInput {
  text: string;
  category: string;
  targetLocale: string;
  dialect?: ArabicDialect;
  formalityLevel?: FormalityLevel;
}

export interface CulturalContextResult {
  enhancedPrompt: string;
  dialect: ArabicDialect;
  formalityLevel: FormalityLevel;
  culturalNotes: string[];
  sensitivityFlags: string[];
}

export interface FashionTerm {
  english: string;
  arabic: string;
  category: string;
  dialect?: ArabicDialect;
  notes?: string;
}

export interface SensitivityResult {
  hasSensitiveContent: boolean;
  flags: SensitivityFlag[];
  suggestions: string[];
}

export interface SensitivityFlag {
  type: "religious" | "cultural" | "modesty" | "dietary" | "political";
  severity: "low" | "medium" | "high";
  description: string;
  originalText: string;
  suggestion?: string;
}
