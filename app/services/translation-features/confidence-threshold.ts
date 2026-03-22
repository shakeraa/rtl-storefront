/**
 * Translation Confidence Threshold Service
 * T0326: Translation - Confidence Threshold
 * 
 * Provides confidence scoring, threshold-based auto-approval,
 * and quality gates for translation quality assurance.
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RecommendedAction = 'auto-approve' | 'review' | 'reject';
export type QualityGateStatus = 'passed' | 'failed' | 'warning';

export interface TranslationSource {
  text: string;
  locale: string;
  contentType?: string;
  context?: string;
}

export interface TranslationResult {
  text: string;
  locale: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

export interface ConfidenceFactors {
  lengthMatch: number;        // 0-100: How well lengths match
  punctuationIntegrity: number; // 0-100: Proper punctuation handling
  specialCharsPreserved: number; // 0-100: Special characters maintained
  formatMarkersIntact: number; // 0-100: Format placeholders preserved
  casingConsistency: number;  // 0-100: Casing patterns maintained
  numericValuesMatch: number; // 0-100: Numbers are consistent
  whitespaceHandling: number; // 0-100: Whitespace patterns preserved
}

export interface ConfidenceScore {
  score: number;              // 0-100 overall confidence
  level: ConfidenceLevel;
  factors: ConfidenceFactors;
  breakdown: {
    structural: number;       // Structural integrity (0-100)
    semantic: number;         // Semantic similarity (0-100)
    contextual: number;       // Context preservation (0-100)
  };
  flags: ConfidenceFlag[];
  timestamp: Date;
}

export interface ConfidenceFlag {
  type: 'error' | 'warning' | 'info';
  category: 'length' | 'punctuation' | 'format' | 'content' | 'structure';
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  factor?: keyof ConfidenceFactors;
}

export interface ThresholdConfig {
  high: number;      // >= 90
  medium: number;    // >= 70
  low: number;       // < 70
  autoApprove: number; // >= 90
  review: number;    // >= 70
  reject: number;    // < 70
}

export interface QualityGate {
  name: string;
  description: string;
  check: (score: ConfidenceScore, source: TranslationSource, translation: TranslationResult) => QualityGateStatus;
  required: boolean;
}

export interface ConfidenceThresholdResult {
  score: ConfidenceScore;
  action: RecommendedAction;
  passedGates: QualityGate[];
  failedGates: QualityGate[];
  warningGates: QualityGate[];
  canAutoApprove: boolean;
}

// Default threshold configuration
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  high: 90,        // High confidence: 90+
  medium: 70,      // Medium confidence: 70-89
  low: 0,          // Low confidence: < 70
  autoApprove: 90, // Auto-approve threshold
  review: 70,      // Review threshold
  reject: 0,       // Reject threshold (below review)
};

// Score ranges for confidence levels
export const CONFIDENCE_RANGES = {
  high: { min: 90, max: 100 },
  medium: { min: 70, max: 89 },
  low: { min: 0, max: 69 },
} as const;

// Minimum factor scores for high confidence
export const FACTOR_THRESHOLDS = {
  critical: 95,    // Must be >= 95 for auto-approval
  important: 85,   // Must be >= 85
  normal: 70,      // Must be >= 70
} as const;

// Store confidence scores for analytics
const confidenceScores: Map<string, ConfidenceScore> = new Map();

/**
 * Calculate confidence score for a translation
 * Analyzes multiple factors to determine translation quality confidence
 */
export function calculateConfidenceScore(
  source: TranslationSource,
  translation: TranslationResult,
  options: { translationId?: string; contentType?: string } = {}
): ConfidenceScore {
  const flags: ConfidenceFlag[] = [];

  // Calculate individual confidence factors
  const factors = calculateConfidenceFactors(source, translation, flags);

  // Calculate breakdown scores
  const structural = calculateStructuralScore(factors, flags);
  const semantic = calculateSemanticScore(source, translation, factors, flags);
  const contextual = calculateContextualScore(source, translation, factors, flags);

  // Calculate overall score (weighted average)
  const score = Math.round(
    structural * 0.35 +
    semantic * 0.40 +
    contextual * 0.25
  );

  // Clamp score to 0-100 range
  const clampedScore = Math.max(0, Math.min(100, score));

  const confidenceScore: ConfidenceScore = {
    score: clampedScore,
    level: getConfidenceLevel(clampedScore),
    factors,
    breakdown: {
      structural,
      semantic,
      contextual,
    },
    flags,
    timestamp: new Date(),
  };

  // Store score if ID provided
  if (options.translationId) {
    confidenceScores.set(options.translationId, confidenceScore);
  }

  return confidenceScore;
}

/**
 * Calculate individual confidence factors
 */
function calculateConfidenceFactors(
  source: TranslationSource,
  translation: TranslationResult,
  flags: ConfidenceFlag[]
): ConfidenceFactors {
  return {
    lengthMatch: calculateLengthMatch(source.text, translation.text, flags),
    punctuationIntegrity: calculatePunctuationIntegrity(source.text, translation.text, flags),
    specialCharsPreserved: calculateSpecialCharsPreserved(source.text, translation.text, flags),
    formatMarkersIntact: calculateFormatMarkersIntact(source.text, translation.text, flags),
    casingConsistency: calculateCasingConsistency(source.text, translation.text, flags),
    numericValuesMatch: calculateNumericValuesMatch(source.text, translation.text, flags),
    whitespaceHandling: calculateWhitespaceHandling(source.text, translation.text, flags),
  };
}

/**
 * Calculate length match factor (0-100)
 */
function calculateLengthMatch(source: string, translation: string, flags: ConfidenceFlag[]): number {
  if (!source || !translation) return 0;

  const sourceLen = source.length;
  const transLen = translation.length;

  if (sourceLen === 0) return transLen === 0 ? 100 : 0;

  const ratio = transLen / sourceLen;
  let score: number;

  if (ratio >= 0.8 && ratio <= 1.5) {
    // Ideal range
    score = 100 - Math.abs(ratio - 1) * 20;
  } else if (ratio >= 0.5 && ratio <= 2.0) {
    // Acceptable range
    score = 70 - Math.abs(ratio - 1) * 15;
  } else {
    // Poor match
    score = 30;
    flags.push({
      type: 'warning',
      category: 'length',
      message: `Significant length difference detected (${sourceLen} → ${transLen})`,
      severity: 'high',
      factor: 'lengthMatch',
    });
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate punctuation integrity factor (0-100)
 */
function calculatePunctuationIntegrity(source: string, translation: string, flags: ConfidenceFlag[]): number {
  const sourcePunct = (source.match(/[.!?,:;]/g) || []).length;
  const transPunct = (translation.match(/[.!?,:;]/g) || []).length;

  // For RTL languages, some punctuation differences are acceptable
  const tolerance = 1;
  const diff = Math.abs(sourcePunct - transPunct);

  if (diff <= tolerance) return 100;
  if (diff <= 2) return 80;
  if (diff <= 3) {
    flags.push({
      type: 'warning',
      category: 'punctuation',
      message: `Punctuation count differs (${sourcePunct} → ${transPunct})`,
      severity: 'medium',
      factor: 'punctuationIntegrity',
    });
    return 60;
  }

  flags.push({
    type: 'error',
    category: 'punctuation',
    message: `Significant punctuation mismatch (${sourcePunct} → ${transPunct})`,
    severity: 'high',
    factor: 'punctuationIntegrity',
  });
  return 30;
}

/**
 * Calculate special characters preserved factor (0-100)
 */
function calculateSpecialCharsPreserved(source: string, translation: string, flags: ConfidenceFlag[]): number {
  const specialChars = /[©®™§¶†‡•◦‣⁃]/g;
  const sourceSpecial = (source.match(specialChars) || []).length;
  const transSpecial = (translation.match(specialChars) || []).length;

  if (sourceSpecial === 0) return 100;

  const ratio = transSpecial / sourceSpecial;
  const score = ratio * 100;

  if (score < 80) {
    flags.push({
      type: 'warning',
      category: 'content',
      message: 'Special characters may not be preserved',
      severity: 'medium',
      factor: 'specialCharsPreserved',
    });
  }

  return Math.round(score);
}

/**
 * Calculate format markers intact factor (0-100)
 */
function calculateFormatMarkersIntact(source: string, translation: string, flags: ConfidenceFlag[]): number {
  // Check for common format placeholders: {variable}, %s, %d, {{variable}}, etc.
  const formatPattern = /\{[^}]+\}|%[sdif]|\{\{[^}]+\}\}/g;
  
  const sourceMarkers = (source.match(formatPattern) || []).length;
  const transMarkers = (translation.match(formatPattern) || []).length;

  if (sourceMarkers === 0) return 100;

  const score = (transMarkers / sourceMarkers) * 100;

  if (score < 100) {
    flags.push({
      type: 'error',
      category: 'format',
      message: `Format markers missing (${sourceMarkers} → ${transMarkers})`,
      severity: 'critical',
      factor: 'formatMarkersIntact',
    });
  }

  return Math.round(score);
}

/**
 * Calculate casing consistency factor (0-100)
 */
function calculateCasingConsistency(source: string, translation: string, flags: ConfidenceFlag[]): number {
  const sourceUpper = (source.match(/[A-Z]/g) || []).length;
  const sourceLower = (source.match(/[a-z]/g) || []).length;
  const sourceTotal = sourceUpper + sourceLower;

  if (sourceTotal === 0) return 100;

  const transUpper = (translation.match(/[A-Z\u0621-\u064A]/g) || []).length;
  const transLower = (translation.match(/[a-z\u0621-\u064A]/g) || []).length;
  const transTotal = transUpper + transLower;

  // For RTL languages, casing doesn't apply the same way
  // Check if source is all caps or title case
  const sourceIsAllCaps = sourceUpper > sourceLower * 2 && sourceUpper > 2;
  const sourceIsTitleCase = /^[A-Z]/.test(source) && sourceLower > 0;

  if (sourceIsAllCaps && transTotal > 0) {
    // RTL languages don't have case, but we can check for emphasis indicators
    return 90;
  }

  return 100;
}

/**
 * Calculate numeric values match factor (0-100)
 */
function calculateNumericValuesMatch(source: string, translation: string, flags: ConfidenceFlag[]): number {
  const numberPattern = /\d+(?:\.\d+)?/g;
  
  const sourceNumbers = (source.match(numberPattern) || []).sort();
  const transNumbers = (translation.match(numberPattern) || []).sort();

  if (sourceNumbers.length === 0) return 100;

  // Check if all source numbers appear in translation
  const matches = sourceNumbers.filter(n => transNumbers.includes(n));
  const score = (matches.length / sourceNumbers.length) * 100;

  if (score < 100) {
    flags.push({
      type: 'error',
      category: 'content',
      message: 'Numeric values may have been altered',
      severity: 'critical',
      factor: 'numericValuesMatch',
    });
  }

  return Math.round(score);
}

/**
 * Calculate whitespace handling factor (0-100)
 */
function calculateWhitespaceHandling(source: string, translation: string, flags: ConfidenceFlag[]): number {
  const sourceLeading = source.match(/^\s*/)?.[0].length || 0;
  const sourceTrailing = source.match(/\s*$/)?.[0].length || 0;
  const transLeading = translation.match(/^\s*/)?.[0].length || 0;
  const transTrailing = translation.match(/\s*$/)?.[0].length || 0;

  // Check for significant whitespace differences
  const leadingDiff = Math.abs(sourceLeading - transLeading);
  const trailingDiff = Math.abs(sourceTrailing - transTrailing);

  if (leadingDiff > 2 || trailingDiff > 2) {
    flags.push({
      type: 'info',
      category: 'structure',
      message: 'Whitespace handling differs from source',
      severity: 'low',
      factor: 'whitespaceHandling',
    });
    return 70;
  }

  return 100;
}

/**
 * Calculate structural score (0-100)
 */
function calculateStructuralScore(factors: ConfidenceFactors, flags: ConfidenceFlag[]): number {
  // Weight structural factors
  const score = Math.round(
    factors.formatMarkersIntact * 0.30 +
    factors.punctuationIntegrity * 0.25 +
    factors.specialCharsPreserved * 0.20 +
    factors.whitespaceHandling * 0.15 +
    factors.casingConsistency * 0.10
  );

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate semantic score (0-100)
 */
function calculateSemanticScore(
  source: TranslationSource,
  translation: TranslationResult,
  factors: ConfidenceFactors,
  flags: ConfidenceFlag[]
): number {
  // Weight semantic factors
  const score = Math.round(
    factors.lengthMatch * 0.40 +
    factors.numericValuesMatch * 0.35 +
    factors.punctuationIntegrity * 0.15 +
    factors.specialCharsPreserved * 0.10
  );

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate contextual score (0-100)
 */
function calculateContextualScore(
  source: TranslationSource,
  translation: TranslationResult,
  factors: ConfidenceFactors,
  flags: ConfidenceFlag[]
): number {
  // Content type adjustments
  let contentTypeBonus = 0;
  
  if (source.contentType) {
    switch (source.contentType) {
      case 'product-title':
      case 'seo-meta':
        // These require higher precision
        if (factors.lengthMatch < 80) {
          flags.push({
            type: 'warning',
            category: 'content',
            message: 'Content type requires precise length match',
            severity: 'medium',
          });
        }
        break;
      case 'description':
        // Descriptions allow more flexibility
        contentTypeBonus = 5;
        break;
    }
  }

  const baseScore = Math.round(
    factors.lengthMatch * 0.50 +
    factors.punctuationIntegrity * 0.30 +
    factors.whitespaceHandling * 0.20
  );

  return Math.max(0, Math.min(100, baseScore + contentTypeBonus));
}

/**
 * Check if score meets threshold
 */
export function meetsThreshold(score: number, threshold: number): boolean {
  return score >= threshold;
}

/**
 * Get confidence level from score
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= CONFIDENCE_RANGES.high.min) return 'high';
  if (score >= CONFIDENCE_RANGES.medium.min) return 'medium';
  return 'low';
}

/**
 * Get recommended action based on confidence score
 */
export function getRecommendedAction(score: number): RecommendedAction {
  if (score >= DEFAULT_THRESHOLDS.autoApprove) return 'auto-approve';
  if (score >= DEFAULT_THRESHOLDS.review) return 'review';
  return 'reject';
}

/**
 * Get detailed action recommendation with explanation
 */
export function getActionRecommendation(score: number): {
  action: RecommendedAction;
  reason: string;
  requiresHumanReview: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
} {
  const level = getConfidenceLevel(score);
  const action = getRecommendedAction(score);

  switch (action) {
    case 'auto-approve':
      return {
        action,
        reason: `High confidence score (${score}) indicates reliable translation quality`,
        requiresHumanReview: false,
        priority: 'low',
      };
    case 'review':
      return {
        action,
        reason: `Medium confidence score (${score}) requires human verification for accuracy`,
        requiresHumanReview: true,
        priority: level === 'medium' && score < 80 ? 'high' : 'normal',
      };
    case 'reject':
      return {
        action,
        reason: `Low confidence score (${score}) suggests translation issues need to be addressed`,
        requiresHumanReview: true,
        priority: 'urgent',
      };
  }
}

/**
 * Default quality gates
 */
export const DEFAULT_QUALITY_GATES: QualityGate[] = [
  {
    name: 'format-integrity',
    description: 'Ensures format markers are preserved',
    check: (score) => score.factors.formatMarkersIntact >= 100 ? 'passed' : 'failed',
    required: true,
  },
  {
    name: 'numeric-preservation',
    description: 'Ensures numeric values are unchanged',
    check: (score) => {
      if (score.factors.numericValuesMatch >= 100) return 'passed';
      if (score.factors.numericValuesMatch >= 90) return 'warning';
      return 'failed';
    },
    required: true,
  },
  {
    name: 'length-reasonableness',
    description: 'Checks translation length is reasonable',
    check: (score) => {
      if (score.factors.lengthMatch >= 70) return 'passed';
      if (score.factors.lengthMatch >= 50) return 'warning';
      return 'failed';
    },
    required: false,
  },
  {
    name: 'punctuation-check',
    description: 'Verifies punctuation integrity',
    check: (score) => {
      if (score.factors.punctuationIntegrity >= 80) return 'passed';
      if (score.factors.punctuationIntegrity >= 60) return 'warning';
      return 'failed';
    },
    required: false,
  },
  {
    name: 'overall-confidence',
    description: 'Verifies overall confidence threshold',
    check: (score) => {
      if (score.score >= 90) return 'passed';
      if (score.score >= 70) return 'warning';
      return 'failed';
    },
    required: false,
  },
];

/**
 * Evaluate quality gates for a confidence score
 */
export function evaluateQualityGates(
  score: ConfidenceScore,
  source: TranslationSource,
  translation: TranslationResult,
  gates: QualityGate[] = DEFAULT_QUALITY_GATES
): { passed: QualityGate[]; failed: QualityGate[]; warnings: QualityGate[] } {
  const passed: QualityGate[] = [];
  const failed: QualityGate[] = [];
  const warnings: QualityGate[] = [];

  for (const gate of gates) {
    const status = gate.check(score, source, translation);
    
    switch (status) {
      case 'passed':
        passed.push(gate);
        break;
      case 'warning':
        warnings.push(gate);
        break;
      case 'failed':
        failed.push(gate);
        break;
    }
  }

  return { passed, failed, warnings };
}

/**
 * Check if translation can be auto-approved based on quality gates
 */
export function canAutoApprove(
  score: ConfidenceScore,
  source: TranslationSource,
  translation: TranslationResult,
  gates: QualityGate[] = DEFAULT_QUALITY_GATES
): boolean {
  // Must have high confidence
  if (score.score < DEFAULT_THRESHOLDS.autoApprove) {
    return false;
  }

  const { failed } = evaluateQualityGates(score, source, translation, gates);

  // No required gates can fail
  const requiredFailures = failed.filter(g => g.required);
  if (requiredFailures.length > 0) {
    return false;
  }

  // Limit on non-required failures
  if (failed.length > 1) {
    return false;
  }

  return true;
}

/**
 * Run full confidence threshold evaluation
 */
export function evaluateConfidenceThreshold(
  source: TranslationSource,
  translation: TranslationResult,
  options: {
    translationId?: string;
    thresholds?: ThresholdConfig;
    gates?: QualityGate[];
  } = {}
): ConfidenceThresholdResult {
  const thresholds = options.thresholds || DEFAULT_THRESHOLDS;
  const gates = options.gates || DEFAULT_QUALITY_GATES;

  // Calculate confidence score
  const score = calculateConfidenceScore(source, translation, {
    translationId: options.translationId,
    contentType: source.contentType,
  });

  // Evaluate quality gates
  const gateResults = evaluateQualityGates(score, source, translation, gates);

  // Determine recommended action
  const action = getRecommendedAction(score.score);

  // Check if can auto-approve
  const autoApprove = canAutoApprove(score, source, translation, gates);

  return {
    score,
    action,
    passedGates: gateResults.passed,
    failedGates: gateResults.failed,
    warningGates: gateResults.warnings,
    canAutoApprove: autoApprove,
  };
}

/**
 * Get confidence score by ID
 */
export function getConfidenceScore(translationId: string): ConfidenceScore | undefined {
  return confidenceScores.get(translationId);
}

/**
 * Get all stored confidence scores
 */
export function getAllConfidenceScores(): Map<string, ConfidenceScore> {
  return new Map(confidenceScores);
}

/**
 * Get confidence score statistics
 */
export function getConfidenceStats(): {
  total: number;
  high: number;
  medium: number;
  low: number;
  average: number;
  autoApproveRate: number;
} {
  const scores = Array.from(confidenceScores.values());
  
  if (scores.length === 0) {
    return { total: 0, high: 0, medium: 0, low: 0, average: 0, autoApproveRate: 0 };
  }

  const high = scores.filter(s => s.level === 'high').length;
  const medium = scores.filter(s => s.level === 'medium').length;
  const low = scores.filter(s => s.level === 'low').length;
  const autoApprovable = scores.filter(s => s.score >= DEFAULT_THRESHOLDS.autoApprove).length;

  return {
    total: scores.length,
    high,
    medium,
    low,
    average: Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length),
    autoApproveRate: Math.round((autoApprovable / scores.length) * 100),
  };
}

/**
 * Clear stored confidence scores
 */
export function clearConfidenceScores(): void {
  confidenceScores.clear();
}

/**
 * Get threshold configuration for UI display
 */
export function getThresholdConfigDisplay(): {
  levels: { name: string; min: number; max: number; color: string; description: string }[];
  actions: { name: RecommendedAction; threshold: number; description: string }[];
} {
  return {
    levels: [
      {
        name: 'High',
        min: CONFIDENCE_RANGES.high.min,
        max: CONFIDENCE_RANGES.high.max,
        color: '#4ade80', // green-400
        description: 'High confidence - suitable for auto-approval',
      },
      {
        name: 'Medium',
        min: CONFIDENCE_RANGES.medium.min,
        max: CONFIDENCE_RANGES.medium.max,
        color: '#fbbf24', // amber-400
        description: 'Medium confidence - requires review',
      },
      {
        name: 'Low',
        min: CONFIDENCE_RANGES.low.min,
        max: CONFIDENCE_RANGES.low.max,
        color: '#f87171', // red-400
        description: 'Low confidence - recommend re-translation',
      },
    ],
    actions: [
      {
        name: 'auto-approve',
        threshold: DEFAULT_THRESHOLDS.autoApprove,
        description: 'Automatically approve translations with score ≥ 90',
      },
      {
        name: 'review',
        threshold: DEFAULT_THRESHOLDS.review,
        description: 'Queue for human review translations with score 70-89',
      },
      {
        name: 'reject',
        threshold: DEFAULT_THRESHOLDS.reject,
        description: 'Reject or re-translate with score < 70',
      },
    ],
  };
}

/**
 * Validate custom threshold configuration
 */
export function validateThresholdConfig(config: Partial<ThresholdConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.high !== undefined && (config.high < 0 || config.high > 100)) {
    errors.push('High threshold must be between 0 and 100');
  }
  if (config.medium !== undefined && (config.medium < 0 || config.medium > 100)) {
    errors.push('Medium threshold must be between 0 and 100');
  }
  if (config.low !== undefined && (config.low < 0 || config.low > 100)) {
    errors.push('Low threshold must be between 0 and 100');
  }
  if (config.autoApprove !== undefined && (config.autoApprove < 0 || config.autoApprove > 100)) {
    errors.push('Auto-approve threshold must be between 0 and 100');
  }
  if (config.review !== undefined && (config.review < 0 || config.review > 100)) {
    errors.push('Review threshold must be between 0 and 100');
  }

  // Check logical ordering
  if (config.high !== undefined && config.medium !== undefined && config.high <= config.medium) {
    errors.push('High threshold must be greater than medium threshold');
  }
  if (config.medium !== undefined && config.low !== undefined && config.medium <= config.low) {
    errors.push('Medium threshold must be greater than low threshold');
  }

  return { valid: errors.length === 0, errors };
}
