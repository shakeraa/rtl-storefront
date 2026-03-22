export interface BiDiSegment {
  text: string;
  direction: "rtl" | "ltr" | "neutral";
  start: number;
  end: number;
}

export interface BiDiPreserveOptions {
  locale: string;
  neverTranslateTerms?: string[];
  preserveEmails?: boolean;
  preserveUrls?: boolean;
  preserveNumbers?: boolean;
  insertMarks?: boolean;
}

export interface BiDiAnalysis {
  hasRTL: boolean;
  hasLTR: boolean;
  isMixed: boolean;
  segments: BiDiSegment[];
  dominantDirection: "rtl" | "ltr";
}
