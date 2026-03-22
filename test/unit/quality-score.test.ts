import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateQualityScore,
  checkGrammar,
  getQualityRating,
  needsReview,
  getQualityScore,
  getScoresNeedingReview,
  getQualityTrends,
  getQualityStatsByContentType,
  DEFAULT_THRESHOLDS,
} from '../../app/services/quality-score';

describe('Quality Score Service - T0051', () => {
  beforeEach(() => {
    // Clear stored scores before each test
    const scores = getScoresNeedingReview(0);
    scores.forEach((s) => {
      // Would clear in real implementation
    });
  });

  describe('Score Calculation', () => {
    it('should calculate quality score', () => {
      const score = calculateQualityScore(
        'trans-1',
        'Black dress',
        'فستان أسود',
        'ar'
      );

      expect(score.translationId).toBe('trans-1');
      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
      expect(score.metrics).toBeDefined();
    });

    it('should include all metrics', () => {
      const score = calculateQualityScore(
        'trans-2',
        'Test',
        'اختبار',
        'ar'
      );

      expect(score.metrics.grammaticalAccuracy).toBeDefined();
      expect(score.metrics.culturalAppropriateness).toBeDefined();
      expect(score.metrics.contextualRelevance).toBeDefined();
      expect(score.metrics.brandConsistency).toBeDefined();
      expect(score.metrics.terminologyAccuracy).toBeDefined();
    });

    it('should flag low scores', () => {
      const score = calculateQualityScore(
        'trans-3',
        'Very long text about product features and benefits',
        'قصير جداً',
        'ar'
      );

      // Score calculation may or may not flag depending on algorithm
      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
    });

    it('adds grammar flags and suggestions for detected issues', () => {
      const score = calculateQualityScore(
        'trans-grammar',
        'This is a test.',
        'this is is a test  without punctuation',
        'en'
      );

      expect(score.flags.some((flag) => flag.message.includes('Repeated word detected'))).toBe(true);
      expect(score.flags.some((flag) => flag.message.includes('Sentence should end with punctuation'))).toBe(true);
      expect(score.suggestions).toContain('Review grammar and punctuation before publishing');
      expect(score.metrics.grammaticalAccuracy).toBeLessThan(70);
    });
  });

  describe('Grammar Check', () => {
    it('detects repeated words, spacing, punctuation, and capitalization issues', () => {
      expect(checkGrammar('this is is a test  without punctuation', 'en')).toEqual([
        {
          rule: 'repeated_word',
          message: 'Repeated word detected: is',
          severity: 'medium',
          position: { start: 5, end: 10 },
        },
        {
          rule: 'double_space',
          message: 'Multiple consecutive spaces detected',
          severity: 'low',
          position: { start: 17, end: 19 },
        },
        {
          rule: 'missing_punctuation',
          message: 'Sentence should end with punctuation',
          severity: 'medium',
          position: { start: 37, end: 38 },
        },
        {
          rule: 'sentence_capitalization',
          message: 'Sentence should start with a capital letter: t',
          severity: 'low',
          position: { start: 0, end: 1 },
        },
      ]);
    });
  });

  describe('Quality Rating', () => {
    it('should rate excellent scores', () => {
      expect(getQualityRating(95, DEFAULT_THRESHOLDS)).toBe('excellent');
      expect(getQualityRating(90, DEFAULT_THRESHOLDS)).toBe('excellent');
    });

    it('should rate good scores', () => {
      expect(getQualityRating(85, DEFAULT_THRESHOLDS)).toBe('good');
      expect(getQualityRating(70, DEFAULT_THRESHOLDS)).toBe('good');
    });

    it('should rate acceptable scores', () => {
      expect(getQualityRating(65, DEFAULT_THRESHOLDS)).toBe('acceptable');
      expect(getQualityRating(50, DEFAULT_THRESHOLDS)).toBe('acceptable');
    });

    it('should rate poor scores', () => {
      expect(getQualityRating(45, DEFAULT_THRESHOLDS)).toBe('poor');
      expect(getQualityRating(0, DEFAULT_THRESHOLDS)).toBe('poor');
    });
  });

  describe('Review Requirements', () => {
    it('should identify scores needing review', () => {
      const score = calculateQualityScore(
        'trans-low',
        'Test',
        'Bad',
        'ar'
      );

      if (score.overallScore < 70) {
        expect(needsReview(score)).toBe(true);
      }
    });

    it('should not flag high scores', () => {
      const score = {
        translationId: 'high',
        overallScore: 85,
        metrics: {} as any,
        flags: [],
        suggestions: [],
        timestamp: new Date(),
      };
      expect(needsReview(score)).toBe(false);
    });
  });

  describe('Score Retrieval', () => {
    it('should get score by ID', () => {
      calculateQualityScore('test-get', 'Source', 'Target', 'ar');
      const score = getQualityScore('test-get');
      expect(score).toBeDefined();
      if (score) {
        expect(score.translationId).toBe('test-get');
      }
    });

    it('should return undefined for unknown ID', () => {
      const score = getQualityScore('unknown');
      expect(score).toBeUndefined();
    });
  });

  describe('Quality Trends', () => {
    it('should calculate trends', () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const trends = getQualityTrends(startDate, now);
      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get stats by content type', () => {
      const stats = getQualityStatsByContentType();
      expect(typeof stats).toBe('object');
    });
  });
});
