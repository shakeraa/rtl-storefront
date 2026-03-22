import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateConfidenceScore,
  meetsThreshold,
  getConfidenceLevel,
  getRecommendedAction,
  getActionRecommendation,
  evaluateConfidenceThreshold,
  evaluateQualityGates,
  canAutoApprove,
  getConfidenceScore,
  getAllConfidenceScores,
  getConfidenceStats,
  clearConfidenceScores,
  getThresholdConfigDisplay,
  validateThresholdConfig,
  DEFAULT_THRESHOLDS,
  CONFIDENCE_RANGES,
  DEFAULT_QUALITY_GATES,
} from '../../app/services/translation-features/confidence-threshold';

describe('Confidence Threshold Service - T0326', () => {
  const mockSource = {
    text: 'Black dress with floral pattern',
    locale: 'en',
    contentType: 'product-title',
  };

  const mockTranslation = {
    text: 'فستان أسود بنقشة زهرية',
    locale: 'ar',
    provider: 'google-translate',
  };

  beforeEach(() => {
    clearConfidenceScores();
  });

  describe('calculateConfidenceScore', () => {
    it('should calculate confidence score with all factors', () => {
      const result = calculateConfidenceScore(mockSource, mockTranslation);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.level).toBeDefined();
      expect(result.factors).toBeDefined();
      expect(result.breakdown).toBeDefined();
      expect(result.flags).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should store score when translationId is provided', () => {
      const result = calculateConfidenceScore(mockSource, mockTranslation, {
        translationId: 'test-123',
      });

      const stored = getConfidenceScore('test-123');
      expect(stored).toBeDefined();
      expect(stored?.score).toBe(result.score);
    });

    it('should calculate all confidence factors', () => {
      const result = calculateConfidenceScore(mockSource, mockTranslation);

      expect(result.factors.lengthMatch).toBeGreaterThanOrEqual(0);
      expect(result.factors.punctuationIntegrity).toBeGreaterThanOrEqual(0);
      expect(result.factors.specialCharsPreserved).toBeGreaterThanOrEqual(0);
      expect(result.factors.formatMarkersIntact).toBeGreaterThanOrEqual(0);
      expect(result.factors.casingConsistency).toBeGreaterThanOrEqual(0);
      expect(result.factors.numericValuesMatch).toBeGreaterThanOrEqual(0);
      expect(result.factors.whitespaceHandling).toBeGreaterThanOrEqual(0);
    });

    it('should calculate structural breakdown score', () => {
      const result = calculateConfidenceScore(mockSource, mockTranslation);

      expect(result.breakdown.structural).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.structural).toBeLessThanOrEqual(100);
    });

    it('should calculate semantic breakdown score', () => {
      const result = calculateConfidenceScore(mockSource, mockTranslation);

      expect(result.breakdown.semantic).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.semantic).toBeLessThanOrEqual(100);
    });

    it('should calculate contextual breakdown score', () => {
      const result = calculateConfidenceScore(mockSource, mockTranslation);

      expect(result.breakdown.contextual).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.contextual).toBeLessThanOrEqual(100);
    });

    it('should flag format marker issues when markers are missing', () => {
      const sourceWithFormat = {
        text: 'Hello {name}, you have {count} messages',
        locale: 'en',
      };
      const translationWithoutFormat = {
        text: 'مرحبا بالاسم، لديك عدد الرسائل',
        locale: 'ar',
      };

      const result = calculateConfidenceScore(sourceWithFormat, translationWithoutFormat);
      
      const formatFlag = result.flags.find(f => f.category === 'format');
      expect(formatFlag).toBeDefined();
      expect(formatFlag?.severity).toBe('critical');
    });

    it('should flag numeric value mismatches', () => {
      const sourceWithNumbers = {
        text: 'Price: $99.99',
        locale: 'en',
      };
      const translationWithDifferentNumbers = {
        text: 'السعر: $199.99',
        locale: 'ar',
      };

      const result = calculateConfidenceScore(sourceWithNumbers, translationWithDifferentNumbers);
      
      const numericFlag = result.flags.find(f => f.factor === 'numericValuesMatch');
      expect(numericFlag).toBeDefined();
      expect(numericFlag?.severity).toBe('critical');
    });

    it('should flag significant length differences', () => {
      const longSource = {
        text: 'This is a very long product description with many details about the features and benefits of this amazing product that you should definitely buy',
        locale: 'en',
      };
      const shortTranslation = {
        text: 'منتج جيد',
        locale: 'ar',
      };

      const result = calculateConfidenceScore(longSource, shortTranslation);
      
      const lengthFlag = result.flags.find(f => f.factor === 'lengthMatch');
      expect(lengthFlag).toBeDefined();
    });

    it('should handle empty source text', () => {
      const emptySource = {
        text: '',
        locale: 'en',
      };
      const translation = {
        text: 'ترجمة',
        locale: 'ar',
      };

      const result = calculateConfidenceScore(emptySource, translation);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle special characters preservation', () => {
      const sourceWithSpecial = {
        text: 'Product™ with © symbol',
        locale: 'en',
      };
      const translationWithSpecial = {
        text: 'منتج™ مع رمز ©',
        locale: 'ar',
      };

      const result = calculateConfidenceScore(sourceWithSpecial, translationWithSpecial);
      expect(result.factors.specialCharsPreserved).toBe(100);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return high for scores >= 90', () => {
      expect(getConfidenceLevel(100)).toBe('high');
      expect(getConfidenceLevel(95)).toBe('high');
      expect(getConfidenceLevel(90)).toBe('high');
    });

    it('should return medium for scores 70-89', () => {
      expect(getConfidenceLevel(89)).toBe('medium');
      expect(getConfidenceLevel(80)).toBe('medium');
      expect(getConfidenceLevel(70)).toBe('medium');
    });

    it('should return low for scores < 70', () => {
      expect(getConfidenceLevel(69)).toBe('low');
      expect(getConfidenceLevel(50)).toBe('low');
      expect(getConfidenceLevel(0)).toBe('low');
    });
  });

  describe('meetsThreshold', () => {
    it('should return true when score meets threshold', () => {
      expect(meetsThreshold(90, 90)).toBe(true);
      expect(meetsThreshold(95, 90)).toBe(true);
      expect(meetsThreshold(100, 50)).toBe(true);
    });

    it('should return false when score is below threshold', () => {
      expect(meetsThreshold(89, 90)).toBe(false);
      expect(meetsThreshold(50, 70)).toBe(false);
      expect(meetsThreshold(0, 1)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(meetsThreshold(0, 0)).toBe(true);
      expect(meetsThreshold(100, 100)).toBe(true);
    });
  });

  describe('getRecommendedAction', () => {
    it('should recommend auto-approve for scores >= 90', () => {
      expect(getRecommendedAction(100)).toBe('auto-approve');
      expect(getRecommendedAction(95)).toBe('auto-approve');
      expect(getRecommendedAction(90)).toBe('auto-approve');
    });

    it('should recommend review for scores 70-89', () => {
      expect(getRecommendedAction(89)).toBe('review');
      expect(getRecommendedAction(80)).toBe('review');
      expect(getRecommendedAction(70)).toBe('review');
    });

    it('should recommend reject for scores < 70', () => {
      expect(getRecommendedAction(69)).toBe('reject');
      expect(getRecommendedAction(50)).toBe('reject');
      expect(getRecommendedAction(0)).toBe('reject');
    });
  });

  describe('getActionRecommendation', () => {
    it('should provide details for auto-approve action', () => {
      const rec = getActionRecommendation(95);
      
      expect(rec.action).toBe('auto-approve');
      expect(rec.requiresHumanReview).toBe(false);
      expect(rec.priority).toBe('low');
      expect(rec.reason).toContain('95');
    });

    it('should provide details for review action', () => {
      const rec = getActionRecommendation(80);
      
      expect(rec.action).toBe('review');
      expect(rec.requiresHumanReview).toBe(true);
      expect(rec.reason).toContain('80');
    });

    it('should provide details for reject action', () => {
      const rec = getActionRecommendation(50);
      
      expect(rec.action).toBe('reject');
      expect(rec.requiresHumanReview).toBe(true);
      expect(rec.priority).toBe('urgent');
      expect(rec.reason).toContain('50');
    });

    it('should set high priority for borderline review cases', () => {
      const rec = getActionRecommendation(75);
      expect(rec.priority).toBe('high');
    });

    it('should set normal priority for solid review cases', () => {
      const rec = getActionRecommendation(85);
      expect(rec.priority).toBe('normal');
    });
  });

  describe('evaluateQualityGates', () => {
    it('should evaluate all quality gates', () => {
      const score = calculateConfidenceScore(mockSource, mockTranslation);
      const result = evaluateQualityGates(score, mockSource, mockTranslation);

      expect(result.passed.length + result.failed.length + result.warnings.length).toBe(DEFAULT_QUALITY_GATES.length);
    });

    it('should pass format-integrity gate when format markers are preserved', () => {
      const sourceWithFormat = {
        text: 'Hello {name}',
        locale: 'en',
      };
      const translationWithFormat = {
        text: 'مرحبا {name}',
        locale: 'ar',
      };

      const score = calculateConfidenceScore(sourceWithFormat, translationWithFormat);
      const result = evaluateQualityGates(score, sourceWithFormat, translationWithFormat);

      const formatGate = result.passed.find(g => g.name === 'format-integrity');
      expect(formatGate).toBeDefined();
    });

    it('should fail format-integrity gate when format markers are missing', () => {
      const sourceWithFormat = {
        text: 'Hello {name}',
        locale: 'en',
      };
      const translationWithoutFormat = {
        text: 'مرحبا',
        locale: 'ar',
      };

      const score = calculateConfidenceScore(sourceWithFormat, translationWithoutFormat);
      const result = evaluateQualityGates(score, sourceWithFormat, translationWithoutFormat);

      const formatGate = result.failed.find(g => g.name === 'format-integrity');
      expect(formatGate).toBeDefined();
      expect(formatGate?.required).toBe(true);
    });

    it('should pass numeric-preservation gate when numbers match', () => {
      const sourceWithNumbers = {
        text: 'Price: $99.99',
        locale: 'en',
      };
      const translationWithNumbers = {
        text: 'السعر: $99.99',
        locale: 'ar',
      };

      const score = calculateConfidenceScore(sourceWithNumbers, translationWithNumbers);
      const result = evaluateQualityGates(score, sourceWithNumbers, translationWithNumbers);

      const numericGate = result.passed.find(g => g.name === 'numeric-preservation');
      expect(numericGate).toBeDefined();
    });

    it('should evaluate length-reasonableness gate', () => {
      const score = calculateConfidenceScore(mockSource, mockTranslation);
      const result = evaluateQualityGates(score, mockSource, mockTranslation);

      // The gate could be passed, failed, or warning depending on the score
      const lengthGate = 
        result.passed.find(g => g.name === 'length-reasonableness') ||
        result.warnings.find(g => g.name === 'length-reasonableness') ||
        result.failed.find(g => g.name === 'length-reasonableness');
      expect(lengthGate).toBeDefined();
    });
  });

  describe('canAutoApprove', () => {
    it('should allow auto-approve for high confidence with no required gate failures', () => {
      const highConfidenceSource = {
        text: 'Good translation test',
        locale: 'en',
      };
      const highConfidenceTranslation = {
        text: 'اختبار ترجمة جيد',
        locale: 'ar',
      };

      const score = calculateConfidenceScore(highConfidenceSource, highConfidenceTranslation);
      // Manually set score to high for testing
      score.score = 95;
      score.level = 'high';
      score.factors.formatMarkersIntact = 100;
      score.factors.numericValuesMatch = 100;

      const canApprove = canAutoApprove(score, highConfidenceSource, highConfidenceTranslation);
      expect(canApprove).toBe(true);
    });

    it('should not allow auto-approve for medium confidence', () => {
      const score = calculateConfidenceScore(mockSource, mockTranslation);
      score.score = 80;
      score.level = 'medium';

      const canApprove = canAutoApprove(score, mockSource, mockTranslation);
      expect(canApprove).toBe(false);
    });

    it('should not allow auto-approve when required gates fail', () => {
      const score = calculateConfidenceScore(mockSource, mockTranslation);
      score.score = 95;
      score.level = 'high';
      score.factors.formatMarkersIntact = 0; // Required gate will fail

      const canApprove = canAutoApprove(score, mockSource, mockTranslation);
      expect(canApprove).toBe(false);
    });
  });

  describe('evaluateConfidenceThreshold', () => {
    it('should return complete evaluation result', () => {
      const result = evaluateConfidenceThreshold(mockSource, mockTranslation, {
        translationId: 'eval-test',
      });

      expect(result.score).toBeDefined();
      expect(result.action).toBeDefined();
      expect(result.passedGates).toBeDefined();
      expect(result.failedGates).toBeDefined();
      expect(result.warningGates).toBeDefined();
      expect(typeof result.canAutoApprove).toBe('boolean');
    });

    it('should use provided translationId', () => {
      evaluateConfidenceThreshold(mockSource, mockTranslation, {
        translationId: 'stored-test',
      });

      const stored = getConfidenceScore('stored-test');
      expect(stored).toBeDefined();
    });
  });

  describe('getConfidenceScore (retrieval)', () => {
    it('should retrieve stored score by ID', () => {
      calculateConfidenceScore(mockSource, mockTranslation, {
        translationId: 'retrieve-test',
      });

      const retrieved = getConfidenceScore('retrieve-test');
      expect(retrieved).toBeDefined();
    });

    it('should return undefined for unknown ID', () => {
      const retrieved = getConfidenceScore('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllConfidenceScores', () => {
    it('should return all stored scores', () => {
      calculateConfidenceScore(mockSource, mockTranslation, { translationId: 'score-1' });
      calculateConfidenceScore(mockSource, mockTranslation, { translationId: 'score-2' });
      calculateConfidenceScore(mockSource, mockTranslation, { translationId: 'score-3' });

      const all = getAllConfidenceScores();
      expect(all.size).toBe(3);
      expect(all.has('score-1')).toBe(true);
      expect(all.has('score-2')).toBe(true);
      expect(all.has('score-3')).toBe(true);
    });

    it('should return empty map when no scores stored', () => {
      const all = getAllConfidenceScores();
      expect(all.size).toBe(0);
    });
  });

  describe('getConfidenceStats', () => {
    it('should return zero stats when no scores', () => {
      const stats = getConfidenceStats();
      
      expect(stats.total).toBe(0);
      expect(stats.high).toBe(0);
      expect(stats.medium).toBe(0);
      expect(stats.low).toBe(0);
      expect(stats.average).toBe(0);
      expect(stats.autoApproveRate).toBe(0);
    });

    it('should calculate correct statistics', () => {
      // Store multiple scores with translationIds
      // Use translations with different lengths to get varied scores
      calculateConfidenceScore(
        { text: 'A', locale: 'en' },
        { text: 'أ', locale: 'ar' },
        { translationId: 'score-1' }
      );
      calculateConfidenceScore(
        { text: 'Test', locale: 'en' },
        { text: 'اختبار', locale: 'ar' },
        { translationId: 'score-2' }
      );
      calculateConfidenceScore(
        { text: 'Good', locale: 'en' },
        { text: 'جيد', locale: 'ar' },
        { translationId: 'score-3' }
      );

      const stats = getConfidenceStats();
      
      expect(stats.total).toBe(3);
      expect(stats.average).toBeGreaterThanOrEqual(0);
      expect(stats.average).toBeLessThanOrEqual(100);
    });
  });

  describe('clearConfidenceScores', () => {
    it('should clear all stored scores', () => {
      calculateConfidenceScore(mockSource, mockTranslation, { translationId: 'clear-test' });
      expect(getAllConfidenceScores().size).toBe(1);

      clearConfidenceScores();
      expect(getAllConfidenceScores().size).toBe(0);
    });
  });

  describe('getThresholdConfigDisplay', () => {
    it('should return threshold configuration for display', () => {
      const config = getThresholdConfigDisplay();

      expect(config.levels).toHaveLength(3);
      expect(config.actions).toHaveLength(3);

      // Check levels
      expect(config.levels[0].name).toBe('High');
      expect(config.levels[0].min).toBe(90);
      expect(config.levels[1].name).toBe('Medium');
      expect(config.levels[1].min).toBe(70);
      expect(config.levels[2].name).toBe('Low');
      expect(config.levels[2].max).toBe(69);

      // Check actions
      expect(config.actions[0].name).toBe('auto-approve');
      expect(config.actions[0].threshold).toBe(90);
      expect(config.actions[1].name).toBe('review');
      expect(config.actions[2].name).toBe('reject');
    });

    it('should include colors for UI display', () => {
      const config = getThresholdConfigDisplay();

      expect(config.levels[0].color).toBeDefined();
      expect(config.levels[1].color).toBeDefined();
      expect(config.levels[2].color).toBeDefined();
    });

    it('should include descriptions', () => {
      const config = getThresholdConfigDisplay();

      config.levels.forEach(level => {
        expect(level.description).toBeDefined();
      });

      config.actions.forEach(action => {
        expect(action.description).toBeDefined();
      });
    });
  });

  describe('validateThresholdConfig', () => {
    it('should validate valid configuration', () => {
      const result = validateThresholdConfig({
        high: 90,
        medium: 70,
        low: 0,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid threshold ranges', () => {
      const result = validateThresholdConfig({
        high: 110,
        medium: -10,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject non-logical threshold ordering', () => {
      const result = validateThresholdConfig({
        high: 70,
        medium: 90,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('greater than'))).toBe(true);
    });

    it('should validate all threshold fields', () => {
      const result = validateThresholdConfig({
        high: 90,
        medium: 70,
        low: 0,
        autoApprove: 90,
        review: 70,
        reject: 0,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('Default Constants', () => {
    it('should have correct default thresholds', () => {
      expect(DEFAULT_THRESHOLDS.high).toBe(90);
      expect(DEFAULT_THRESHOLDS.medium).toBe(70);
      expect(DEFAULT_THRESHOLDS.low).toBe(0);
      expect(DEFAULT_THRESHOLDS.autoApprove).toBe(90);
      expect(DEFAULT_THRESHOLDS.review).toBe(70);
    });

    it('should have correct confidence ranges', () => {
      expect(CONFIDENCE_RANGES.high.min).toBe(90);
      expect(CONFIDENCE_RANGES.high.max).toBe(100);
      expect(CONFIDENCE_RANGES.medium.min).toBe(70);
      expect(CONFIDENCE_RANGES.medium.max).toBe(89);
      expect(CONFIDENCE_RANGES.low.min).toBe(0);
      expect(CONFIDENCE_RANGES.low.max).toBe(69);
    });

    it('should have quality gates defined', () => {
      expect(DEFAULT_QUALITY_GATES.length).toBeGreaterThan(0);
      DEFAULT_QUALITY_GATES.forEach(gate => {
        expect(gate.name).toBeDefined();
        expect(gate.description).toBeDefined();
        expect(typeof gate.check).toBe('function');
        expect(typeof gate.required).toBe('boolean');
      });
    });
  });
});

// Note: Internal confidenceScores map is not exported - all testing done through public API
