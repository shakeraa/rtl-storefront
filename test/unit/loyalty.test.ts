import { describe, it, expect } from 'vitest';
import {
  getLoyaltyLabels,
  formatPointsBalance,
  getTierLabel,
  getRewardLabels,
  formatRedemptionMessage,
  getTransactionTypeLabel,
  getTierProgress,
  VIP_TIERS,
} from '../../app/services/integrations/loyalty';

describe('Loyalty Integration - T0221', () => {
  describe('Loyalty Labels', () => {
    it('should get Arabic loyalty labels', () => {
      const labels = getLoyaltyLabels('ar');
      expect(labels.programName).toBeDefined();
      expect(labels.pointsBalance).toBeDefined();
    });

    it('should get Hebrew loyalty labels', () => {
      const labels = getLoyaltyLabels('he');
      expect(labels.programName).toBeDefined();
      expect(labels.pointsLabel).toBeDefined();
    });

    it('should get English loyalty labels', () => {
      const labels = getLoyaltyLabels('en');
      expect(labels.programName).toBeDefined();
      expect(labels.pointsLabel).toBeDefined();
    });

    it('should handle locale with region code', () => {
      const labels = getLoyaltyLabels('ar-SA');
      expect(labels.programName).toBeDefined();
    });
  });

  describe('Points Balance Formatting', () => {
    it('should format points in Arabic', () => {
      const formatted = formatPointsBalance(1500, 'ar');
      expect(formatted).toContain('1');
      expect(formatted).toContain('500');
    });

    it('should format zero points', () => {
      const formatted = formatPointsBalance(0, 'en');
      expect(formatted).toContain('0');
    });

    it('should format large numbers', () => {
      const formatted = formatPointsBalance(100000, 'en');
      expect(formatted).toContain('100');
    });
  });

  describe('Tier Labels', () => {
    it('should get Arabic bronze tier label', () => {
      const label = getTierLabel('bronze', 'ar');
      expect(label.name).toBeDefined();
      expect(label.description).toBeDefined();
    });

    it('should get Hebrew silver tier label', () => {
      const label = getTierLabel('silver', 'he');
      expect(label.name).toBeDefined();
    });

    it('should get English gold tier label', () => {
      const label = getTierLabel('gold', 'en');
      expect(label.name.toLowerCase()).toContain('gold');
    });

    it('should get platinum tier label', () => {
      const label = getTierLabel('platinum', 'en');
      expect(label.name.toLowerCase()).toContain('platinum');
    });
  });

  describe('Reward Labels', () => {
    it('should get Arabic reward labels', () => {
      const labels = getRewardLabels('ar');
      expect(labels.discount).toBeDefined();
      expect(labels.free_shipping).toBeDefined();
    });

    it('should get Hebrew reward labels', () => {
      const labels = getRewardLabels('he');
      expect(labels.free_product).toBeDefined();
    });

    it('should include all reward types', () => {
      const labels = getRewardLabels('en');
      expect(labels.discount).toBeDefined();
      expect(labels.free_shipping).toBeDefined();
      expect(labels.free_product).toBeDefined();
      expect(labels.gift_card).toBeDefined();
    });
  });

  describe('Redemption Message', () => {
    it('should format redemption message in Arabic', () => {
      const reward = { type: 'discount' as const, value: 10, description: '10% Off' };
      const message = formatRedemptionMessage(1000, reward, 'ar');
      expect(message).toContain('1,000');
    });

    it('should format redemption message in Hebrew', () => {
      const reward = { type: 'free_shipping' as const, value: 0, description: 'Free Shipping' };
      const message = formatRedemptionMessage(500, reward, 'he');
      expect(message).toContain('500');
    });

    it('should format redemption message in English', () => {
      const reward = { type: 'discount' as const, value: 20, description: '$20 Off' };
      const message = formatRedemptionMessage(2000, reward, 'en');
      expect(message).toContain('2,000');
    });
  });

  describe('Transaction Labels', () => {
    it('should get earned transaction label', () => {
      const label = getTransactionTypeLabel('earned', 'en');
      expect(label.toLowerCase()).toContain('earned');
    });

    it('should get redeemed transaction label in Arabic', () => {
      const label = getTransactionTypeLabel('redeemed', 'ar');
      expect(label).toBeDefined();
    });

    it('should get bonus transaction label', () => {
      const label = getTransactionTypeLabel('bonus', 'en');
      expect(label.toLowerCase()).toContain('bonus');
    });

    it('should get expired transaction label', () => {
      const label = getTransactionTypeLabel('expired', 'en');
      expect(label.toLowerCase()).toContain('expired');
    });
  });

  describe('Tier Progress', () => {
    it('should get tier progress', () => {
      const progress = getTierProgress(500, 'silver', 'en');
      expect(progress.currentPoints).toBeDefined();
    });

    it('should calculate progress percentage', () => {
      const progress = getTierProgress(500, 'silver', 'en');
      expect(progress.progressPercentage).toBeGreaterThanOrEqual(0);
      expect(progress.progressPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe('Tier Constants', () => {
    it('should have all tier definitions', () => {
      const bronze = VIP_TIERS.find(t => t.id === 'bronze');
      const silver = VIP_TIERS.find(t => t.id === 'silver');
      expect(bronze).toBeDefined();
      expect(silver).toBeDefined();
    });

    it('should have tier thresholds', () => {
      const bronze = VIP_TIERS.find(t => t.id === 'bronze');
      expect(bronze?.minPoints).toBe(0);
    });
  });
});
