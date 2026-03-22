/**
 * Translation Quality Score Service
 * T0051: AI Confidence Scoring
 */

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
  const contextualRelevance = calculateContextualScore(sourceText, translatedText);
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
  };

  // Store score
  qualityScores.set(translationId, score);

  return score;
}

/**
 * Calculate grammatical accuracy (placeholder)
 */
function calculateGrammaticalAccuracy(
  text: string,
  locale: string,
  grammarIssues: GrammarIssue[] = []
): number {
  const factors = [
    !/[.]{3,}/.test(text), // No excessive dots
    !/[!]{2,}/.test(text), // No excessive exclamation
    /[.!?]$/.test(text),   // Ends with punctuation
  ];
  
  const passed = factors.filter(Boolean).length;
  const baseScore = Math.round((passed / factors.length) * 100);
  const penalties = grammarIssues.reduce((total, issue) => {
    if (issue.severity === 'high') return total + 20;
    if (issue.severity === 'medium') return total + 12;
    return total + 6;
  }, 0);

  return Math.max(0, baseScore - penalties);
}

/**
 * Calculate cultural appropriateness (placeholder)
 */
function calculateCulturalScore(text: string, locale: string): number {
  const sensitiveTerms: Record<string, string[]> = {
    ar: [' inappropriate term 1', ' inappropriate term 2'],
    he: [' inappropriate term 3'],
  };

  const terms = sensitiveTerms[locale] || [];
  const hasSensitive = terms.some((term) => text.toLowerCase().includes(term.toLowerCase()));
  
  return hasSensitive ? 40 : 85;
}

/**
 * Calculate contextual relevance (placeholder)
 */
function calculateContextualScore(source: string, translation: string): number {
  // Simple length-based check as placeholder
  const lengthRatio = translation.length / source.length;
  
  if (lengthRatio < 0.3 || lengthRatio > 3) {
    return 50; // Significant length difference
  }
  
  if (lengthRatio < 0.7 || lengthRatio > 1.5) {
    return 75; // Moderate length difference
  }
  
  return 90; // Good length match
}

/**
 * Calculate brand consistency (placeholder)
 */
function calculateBrandConsistency(text: string, brandTerms: string[]): number {
  if (brandTerms.length === 0) return 100;
  
  const matches = brandTerms.filter((term) => 
    text.toLowerCase().includes(term.toLowerCase())
  );
  
  return Math.round((matches.length / brandTerms.length) * 100);
}

/**
 * Calculate terminology accuracy (placeholder)
 */
function calculateTerminologyScore(source: string, translation: string, locale: string): number {
  // In production, check against terminology database
  return 80;
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
 * Re-calculate score for a translation
 */
export function recalculateScore(translationId: string): QualityScore | null {
  const existing = qualityScores.get(translationId);
  if (!existing) return null;

  // Remove old score
  qualityScores.delete(translationId);
  
  // Would recalculate in production
  return existing;
}
