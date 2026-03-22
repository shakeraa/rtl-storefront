/**
 * Translation Quality Score Service
 * T0051: AI Confidence Scoring
 */

import { scanForSensitivity } from '../sensitivity/index';

export interface QualityScore {
  translationId: string;
  overallScore: number; // 0-100
  metrics: {
    grammaticalAccuracy: number;
    culturalAppropriateness: number;
    contextualRelevance: number;
    brandConsistency: number;
    terminologyAccuracy: number;
  };
  flags: QualityFlag[];
  suggestions: string[];
  timestamp: Date;
  sourceText?: string;
  translatedText?: string;
  targetLocale?: string;
}

export interface QualityFlag {
  type: 'error' | 'warning' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  position?: { start: number; end: number };
}

export interface GrammarIssue {
  rule: 'repeated_word' | 'missing_punctuation' | 'double_space' | 'unbalanced_delimiter' | 'sentence_capitalization';
  message: string;
  severity: 'high' | 'medium' | 'low';
  position?: { start: number; end: number };
}

export interface QualityThresholds {
  excellent: number; // >= 90
  good: number;      // >= 70
  acceptable: number; // >= 50
  poor: number;      // < 50
}

export const DEFAULT_THRESHOLDS: QualityThresholds = {
  excellent: 90,
  good: 70,
  acceptable: 50,
  poor: 50,
};

// Quality score storage
const qualityScores: Map<string, QualityScore> = new Map();

/**
 * Calculate quality score for a translation
 */
export function calculateQualityScore(
  translationId: string,
  sourceText: string,
  translatedText: string,
  targetLocale: string,
  options: { contentType?: string; brandTerms?: string[] } = {}
): QualityScore {
  const flags: QualityFlag[] = [];
  const suggestions: string[] = [];
  const grammarIssues = checkGrammar(translatedText, targetLocale);

  // Calculate individual metrics
  const grammaticalAccuracy = calculateGrammaticalAccuracy(translatedText, targetLocale, grammarIssues);
  const culturalAppropriateness = calculateCulturalScore(translatedText, targetLocale);
  const contextualRelevance = calculateContextualScore(sourceText, translatedText, targetLocale);
  const brandConsistency = calculateBrandConsistency(translatedText, options.brandTerms || []);
  const terminologyAccuracy = calculateTerminologyScore(sourceText, translatedText, targetLocale);

  // Check for low scores and flag
  if (grammaticalAccuracy < 70) {
    flags.push({
      type: 'warning',
      severity: 'high',
      message: 'Potential grammatical issues detected',
    });
  }

  for (const issue of grammarIssues) {
    flags.push({
      type: 'warning',
      severity: issue.severity,
      message: issue.message,
      position: issue.position,
    });
  }

  if (culturalAppropriateness < 60) {
    flags.push({
      type: 'warning',
      severity: 'medium',
      message: 'Cultural appropriateness may need review',
    });
  }

  if (contextualRelevance < 80) {
    flags.push({
      type: 'error',
      severity: 'critical',
      message: 'Context may be significantly different from source',
    });
  }

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    grammaticalAccuracy * 0.25 +
    culturalAppropriateness * 0.25 +
    contextualRelevance * 0.25 +
    brandConsistency * 0.15 +
    terminologyAccuracy * 0.10
  );

  // Generate suggestions
  if (overallScore < 70) {
    suggestions.push('Consider re-translation with more context');
    suggestions.push('Review by native speaker recommended');
  }

  if (grammarIssues.length > 0) {
    suggestions.push('Review grammar and punctuation before publishing');
  }

  const score: QualityScore = {
    translationId,
    overallScore,
    metrics: {
      grammaticalAccuracy,
      culturalAppropriateness,
      contextualRelevance,
      brandConsistency,
      terminologyAccuracy,
    },
    flags,
    suggestions,
    timestamp: new Date(),
    sourceText,
    translatedText,
    targetLocale,
  };

  // Store score
  qualityScores.set(translationId, score);

  return score;
}

/**
 * Calculate grammatical accuracy with rule-based checks
 */
function calculateGrammaticalAccuracy(
  text: string,
  _locale: string,
  grammarIssues: GrammarIssue[] = []
): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  const checks = [
    // 1. No excessive dots (ellipsis abuse)
    !/[.]{4,}/.test(text),
    // 2. No excessive exclamation marks
    !/[!]{2,}/.test(text),
    // 3. No excessive question marks
    !/[?]{3,}/.test(text),
    // 4. Ends with proper punctuation (period, exclamation, question, Arabic period, etc.)
    /[.!?\u06D4\u061F]$/.test(trimmed),
    // 5. No sentence fragments: text is at least 2 words or a single recognized token
    trimmed.split(/\s+/).length >= 2 || trimmed.length <= 20,
    // 6. Balanced parentheses
    (text.match(/\(/g) ?? []).length === (text.match(/\)/g) ?? []).length,
    // 7. Balanced square brackets
    (text.match(/\[/g) ?? []).length === (text.match(/\]/g) ?? []).length,
    // 8. Balanced double quotes (even count)
    (text.match(/"/g) ?? []).length % 2 === 0,
    // 9. No tab characters in translation text
    !/\t/.test(text),
    // 10. No more than 3 consecutive spaces
    !/ {4,}/.test(text),
  ];

  const passed = checks.filter(Boolean).length;
  const baseScore = Math.round((passed / checks.length) * 100);

  // Apply penalties from grammar issues found by checkGrammar
  const penalties = grammarIssues.reduce((total, issue) => {
    if (issue.severity === 'high') return total + 20;
    if (issue.severity === 'medium') return total + 12;
    return total + 6;
  }, 0);

  return Math.max(0, baseScore - penalties);
}

/**
 * Calculate cultural appropriateness using the sensitivity scanner
 */
function calculateCulturalScore(text: string, locale: string): number {
  const result = scanForSensitivity(text, locale);
  // scanForSensitivity returns a score 0-100 where 100 is fully clean
  return result.score;
}

/**
 * Calculate contextual relevance with multiple heuristics
 */
function calculateContextualScore(source: string, translation: string, targetLocale?: string): number {
  let score = 100;

  // 1. Length ratio check
  const lengthRatio = translation.length / Math.max(source.length, 1);
  if (lengthRatio < 0.3 || lengthRatio > 3) {
    score -= 30; // Significant length mismatch
  } else if (lengthRatio < 0.7 || lengthRatio > 1.5) {
    score -= 10; // Moderate length mismatch
  }

  // 2. Number preservation: source numbers should appear in translation
  const sourceNumbers = source.match(/\d+(?:\.\d+)?/g) ?? [];
  if (sourceNumbers.length > 0) {
    const translationText = translation;
    const preserved = sourceNumbers.filter((num) => translationText.includes(num));
    const preserveRatio = preserved.length / sourceNumbers.length;
    if (preserveRatio < 1) {
      score -= Math.round((1 - preserveRatio) * 20);
    }
  }

  // 3. Brand name preservation: uppercase words (likely brand names) should be kept
  const brandCandidates = source.match(/\b[A-Z][A-Z]+\b/g) ?? [];
  if (brandCandidates.length > 0) {
    const preserved = brandCandidates.filter((brand) => translation.includes(brand));
    const preserveRatio = preserved.length / brandCandidates.length;
    if (preserveRatio < 1) {
      score -= Math.round((1 - preserveRatio) * 15);
    }
  }

  // 4. RTL direction check: for Arabic/Hebrew targets, text should contain RTL characters
  if (targetLocale) {
    const baseLocale = targetLocale.split('-')[0]?.toLowerCase() ?? '';
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    if (rtlLocales.includes(baseLocale)) {
      // Check that translation actually contains RTL characters
      const rtlCharPattern = /[\u0600-\u06FF\u0590-\u05FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
      if (!rtlCharPattern.test(translation)) {
        score -= 25; // Translation should contain RTL characters but doesn't
      }
    }
  }

  // 5. Empty translation check
  if (translation.trim().length === 0 && source.trim().length > 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate brand consistency
 */
function calculateBrandConsistency(text: string, brandTerms: string[]): number {
  if (brandTerms.length === 0) return 100;

  const matches = brandTerms.filter((term) =>
    text.toLowerCase().includes(term.toLowerCase())
  );

  return Math.round((matches.length / brandTerms.length) * 100);
}

/**
 * Calculate terminology accuracy by checking for domain-specific term patterns
 */
function calculateTerminologyScore(source: string, translation: string, locale: string): number {
  let score = 85; // Base score

  // Check if key e-commerce domain terms are handled
  const ecommerceTermPatterns: Record<string, RegExp[]> = {
    ar: [
      /\u0633\u0644\u0629|\u0639\u0631\u0628\u0629/u,     // cart
      /\u0634\u0631\u0627\u0621|\u0627\u0634\u062A\u0631/u, // buy/purchase
      /\u062F\u0641\u0639|\u0633\u062F\u0627\u062F/u,       // pay/checkout
      /\u0634\u062D\u0646|\u062A\u0648\u0635\u064A\u0644/u, // shipping/delivery
      /\u0645\u0646\u062A\u062C|\u0633\u0644\u0639\u0629/u, // product
    ],
    he: [
      /\u05E2\u05D2\u05DC\u05D4|\u05E1\u05DC/u,       // cart
      /\u05E7\u05E0[\u05D4\u05D9\u05D9]/u,             // buy
      /\u05EA\u05E9\u05DC\u05D5\u05DD/u,               // payment
      /\u05DE\u05E9\u05DC\u05D5\u05D7/u,               // shipping
      /\u05DE\u05D5\u05E6\u05E8/u,                     // product
    ],
  };

  const baseLocale = locale.split('-')[0]?.toLowerCase() ?? '';
  const patterns = ecommerceTermPatterns[baseLocale];

  if (patterns && source.length > 10) {
    // Check if source contains commerce-related English terms
    const commerceTerms = /\b(cart|buy|purchase|checkout|pay|ship|product|order|price|discount)\b/i;
    if (commerceTerms.test(source)) {
      // Source has commerce terms - check if translation has corresponding terms
      const hasAnyTerm = patterns.some((p) => p.test(translation));
      if (!hasAnyTerm) {
        score -= 15; // Expected domain terms missing
      }
    }
  }

  // Check for untranslated English words left in RTL text (excluding brand names/numbers)
  if (['ar', 'he', 'fa', 'ur'].includes(baseLocale)) {
    const englishWords = translation.match(/\b[a-zA-Z]{4,}\b/g) ?? [];
    // Filter out likely brand names (starting with uppercase)
    const untranslated = englishWords.filter((w) => w[0] !== w[0].toUpperCase() || w === w.toLowerCase());
    if (untranslated.length > 2) {
      score -= Math.min(20, untranslated.length * 5);
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function checkGrammar(text: string, locale: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  const repeatedWordPattern = /\b(\p{L}+)\s+\1\b/giu;
  let repeatedMatch: RegExpExecArray | null;
  while ((repeatedMatch = repeatedWordPattern.exec(text)) !== null) {
    issues.push({
      rule: 'repeated_word',
      message: `Repeated word detected: ${repeatedMatch[1]}`,
      severity: 'medium',
      position: {
        start: repeatedMatch.index,
        end: repeatedMatch.index + repeatedMatch[0].length,
      },
    });
  }

  const doubleSpacePattern = / {2,}/g;
  let doubleSpaceMatch: RegExpExecArray | null;
  while ((doubleSpaceMatch = doubleSpacePattern.exec(text)) !== null) {
    issues.push({
      rule: 'double_space',
      message: 'Multiple consecutive spaces detected',
      severity: 'low',
      position: {
        start: doubleSpaceMatch.index,
        end: doubleSpaceMatch.index + doubleSpaceMatch[0].length,
      },
    });
  }

  const trimmedText = text.trim();
  if (trimmedText.length > 0 && !/[.!?]$/.test(trimmedText)) {
    issues.push({
      rule: 'missing_punctuation',
      message: 'Sentence should end with punctuation',
      severity: 'medium',
      position: { start: trimmedText.length - 1, end: trimmedText.length },
    });
  }

  const openParens = (text.match(/\(/g) ?? []).length;
  const closeParens = (text.match(/\)/g) ?? []).length;
  const openQuotes = (text.match(/"/g) ?? []).length;
  if (openParens !== closeParens || openQuotes % 2 !== 0) {
    issues.push({
      rule: 'unbalanced_delimiter',
      message: 'Unbalanced punctuation delimiters detected',
      severity: 'medium',
    });
  }

  if (locale === 'en') {
    const sentenceStartPattern = /(?:^|[.!?]\s+)([a-z])/g;
    let sentenceStartMatch: RegExpExecArray | null;
    while ((sentenceStartMatch = sentenceStartPattern.exec(text)) !== null) {
      issues.push({
        rule: 'sentence_capitalization',
        message: `Sentence should start with a capital letter: ${sentenceStartMatch[1]}`,
        severity: 'low',
        position: {
          start: sentenceStartMatch.index + sentenceStartMatch[0].length - 1,
          end: sentenceStartMatch.index + sentenceStartMatch[0].length,
        },
      });
    }
  }

  return issues;
}

/**
 * Get quality rating from score
 */
export function getQualityRating(score: number, thresholds: QualityThresholds = DEFAULT_THRESHOLDS): string {
  if (score >= thresholds.excellent) return 'excellent';
  if (score >= thresholds.good) return 'good';
  if (score >= thresholds.acceptable) return 'acceptable';
  return 'poor';
}

/**
 * Check if translation needs review
 */
export function needsReview(score: QualityScore, threshold: number = 70): boolean {
  return score.overallScore < threshold;
}

/**
 * Get quality score by ID
 */
export function getQualityScore(translationId: string): QualityScore | undefined {
  return qualityScores.get(translationId);
}

/**
 * Get all scores needing review
 */
export function getScoresNeedingReview(threshold: number = 70): QualityScore[] {
  return Array.from(qualityScores.values()).filter((score) =>
    score.overallScore < threshold
  );
}

/**
 * Get quality trends over time
 */
export function getQualityTrends(
  startDate: Date,
  endDate: Date
): { date: string; avgScore: number; count: number }[] {
  const scores = Array.from(qualityScores.values()).filter(
    (s) => s.timestamp >= startDate && s.timestamp <= endDate
  );

  // Group by date
  const grouped = scores.reduce((acc, score) => {
    const date = score.timestamp.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { total: 0, count: 0 };
    }
    acc[date].total += score.overallScore;
    acc[date].count++;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    avgScore: Math.round(data.total / data.count),
    count: data.count,
  }));
}

/**
 * Get statistics by content type
 */
export function getQualityStatsByContentType(): Record<string, { avgScore: number; count: number }> {
  // In production, this would group by actual content type
  const scores = Array.from(qualityScores.values());

  if (scores.length === 0) {
    return {};
  }

  const total = scores.reduce((sum, s) => sum + s.overallScore, 0);

  return {
    all: {
      avgScore: Math.round(total / scores.length),
      count: scores.length,
    },
  };
}

/**
 * Re-calculate score for a translation using stored source data
 */
export function recalculateScore(translationId: string): QualityScore | null {
  const existing = qualityScores.get(translationId);
  if (!existing) return null;

  // Use the stored source/translated text to recalculate
  const sourceText = existing.sourceText ?? '';
  const translatedText = existing.translatedText ?? '';
  const targetLocale = existing.targetLocale ?? 'ar';

  // Remove old score before recalculating
  qualityScores.delete(translationId);

  return calculateQualityScore(translationId, sourceText, translatedText, targetLocale);
}
