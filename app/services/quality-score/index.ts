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

  // Calculate individual metrics
  const grammaticalAccuracy = calculateGrammaticalAccuracy(translatedText, targetLocale);
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
function calculateGrammaticalAccuracy(text: string, locale: string): number {
  // In production, this would use NLP libraries
  // For now, return a placeholder score
  const factors = [
    !/[.]{3,}/.test(text), // No excessive dots
    !/[!]{2,}/.test(text), // No excessive exclamation
    /[.!?]$/.test(text),   // Ends with punctuation
  ];
  
  const passed = factors.filter(Boolean).length;
  return Math.round((passed / factors.length) * 100);
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
