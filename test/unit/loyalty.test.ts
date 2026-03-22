import { describe, it, expect } from 'vitest';
import {
  getLoyaltyLabels,
  formatPointsBalance,
  getTierLabel,
  getRewardLabels,
  formatRedemptionMessage,
  formatPointsEarnedMessage,
  getTierProgress,
  calculatePointsValue,
  calculatePointsForAmount,
  validateRedemption,
  getTierByPoints,
  getTierBenefitsList,
  getTransactionTypeLabel,
  VIP_TIERS,
  DEFAULT_EARNING_RULES,
  type VipTier,
  type RewardItem,
  type SupportedLocale,
} from '../../app/services/integrations/loyalty';

describe('Loyalty Integration Service', () => {
  describe('getLoyaltyLabels', () => {
    it('should return English labels for "en" locale', () => {
      const labels = getLoyaltyLabels('en');
      expect(labels.programName).toBe('Rewards Program');
      expect(labels.pointsBalance).toBe('Your Points Balance');
      expect(labels.pointsLabel).toBe('Point');
      expect(labels.pointsLabelPlural).toBe('Points');
    });

    it('should return Arabic labels for "ar" locale', () => {
      const labels = getLoyaltyLabels('ar');
      expect(labels.programName).toBe('برنامج المكافآت');
      expect(labels.pointsBalance).toBe('رصيد النقاط');
      expect(labels.pointsLabel).toBe('نقطة');
      expect(labels.pointsLabelPlural).toBe('نقاط');
    });

    it('should return Hebrew labels for "he" locale', () => {
      const labels = getLoyaltyLabels('he');
      expect(labels.programName).toBe('תוכנית המכירות');
      expect(labels.pointsBalance).toBe('יתרת הנקודות שלך');
    });

    it('should return French labels for "fr" locale', () => {
      const labels = getLoyaltyLabels('fr');
      expect(labels.programName).toBe('Programme de Fidélité');
      expect(labels.pointsLabelPlural).toBe('Points');
    });

    it('should return German labels for "de" locale', () => {
      const labels = getLoyaltyLabels('de');
      expect(labels.programName).toBe('Treueprogramm');
      expect(labels.pointsLabel).toBe('Punkt');
    });

    it('should return Spanish labels for "es" locale', () => {
      const labels = getLoyaltyLabels('es');
      expect(labels.programName).toBe('Programa de Recompensas');
    });

    it('should return Japanese labels for "ja" locale', () => {
      const labels = getLoyaltyLabels('ja');
      expect(labels.programName).toBe('ポイントプログラム');
    });

    it('should return Korean labels for "ko" locale', () => {
      const labels = getLoyaltyLabels('ko');
      expect(labels.programName).toBe('포인트 프로그램');
    });

    it('should return Chinese labels for "zh" locale', () => {
      const labels = getLoyaltyLabels('zh');
      expect(labels.programName).toBe('积分计划');
    });

    it('should fallback to English for unsupported locale', () => {
      const labels = getLoyaltyLabels('xx');
      expect(labels.programName).toBe('Rewards Program');
    });

    it('should handle locale with region code (e.g., en-US)', () => {
      const labels = getLoyaltyLabels('en-US');
      expect(labels.programName).toBe('Rewards Program');
    });

    it('should handle locale with region code (e.g., ar-SA)', () => {
      const labels = getLoyaltyLabels('ar-SA');
      expect(labels.programName).toBe('برنامج المكافآت');
    });
  });

  describe('formatPointsBalance', () => {
    it('should format points in English with singular label for 1 point', () => {
      const result = formatPointsBalance(1, 'en');
      expect(result).toBe('1 Point');
    });

    it('should format points in English with plural label for multiple points', () => {
      const result = formatPointsBalance(1500, 'en');
      expect(result).toBe('1,500 Points');
    });

    it('should format large numbers with proper separators', () => {
      const result = formatPointsBalance(1000000, 'en');
      expect(result).toBe('1,000,000 Points');
    });

    it('should format zero points correctly', () => {
      const result = formatPointsBalance(0, 'en');
      expect(result).toBe('0 Points');
    });

    it('should format points in Arabic', () => {
      const result = formatPointsBalance(1500, 'ar');
      expect(result).toContain('1,500');
      expect(result).toContain('نقاط');
    });

    it('should format points in Hebrew', () => {
      const result = formatPointsBalance(1500, 'he');
      expect(result).toContain('1,500');
      expect(result).toContain('נקודות');
    });

    it('should format points in German with German number formatting', () => {
      const result = formatPointsBalance(1500, 'de');
      expect(result).toContain('1.500');
      expect(result).toContain('Punkte');
    });
  });

  describe('getTierLabel', () => {
    it('should return Bronze tier labels in English', () => {
      const result = getTierLabel('bronze', 'en');
      expect(result.name).toBe('Bronze');
      expect(result.description).toContain('Entry level');
    });

    it('should return Silver tier labels in English', () => {
      const result = getTierLabel('silver', 'en');
      expect(result.name).toBe('Silver');
      expect(result.description).toContain('Enhanced');
    });

    it('should return Gold tier labels in English', () => {
      const result = getTierLabel('gold', 'en');
      expect(result.name).toBe('Gold');
      expect(result.description).toContain('Premium');
    });

    it('should return Platinum tier labels in English', () => {
      const result = getTierLabel('platinum', 'en');
      expect(result.name).toBe('Platinum');
      expect(result.description).toContain('Ultimate');
    });

    it('should return Bronze tier labels in Arabic', () => {
      const result = getTierLabel('bronze', 'ar');
      expect(result.name).toBe('برونزية');
    });

    it('should return Silver tier labels in Arabic', () => {
      const result = getTierLabel('silver', 'ar');
      expect(result.name).toBe('فضية');
    });

    it('should return Gold tier labels in Arabic', () => {
      const result = getTierLabel('gold', 'ar');
      expect(result.name).toBe('ذهبية');
    });

    it('should return Platinum tier labels in Arabic', () => {
      const result = getTierLabel('platinum', 'ar');
      expect(result.name).toBe('بلاتينية');
    });

    it('should return Bronze tier labels in Hebrew', () => {
      const result = getTierLabel('bronze', 'he');
      expect(result.name).toBe('ברונזה');
    });

    it('should return tier labels in French', () => {
      const result = getTierLabel('gold', 'fr');
      expect(result.name).toBe('Or');
    });

    it('should return tier labels in German', () => {
      const result = getTierLabel('silver', 'de');
      expect(result.name).toBe('Silber');
    });

    it('should return tier labels in Spanish', () => {
      const result = getTierLabel('bronze', 'es');
      expect(result.name).toBe('Bronce');
    });

    it('should fallback to English for unsupported locale', () => {
      const result = getTierLabel('gold', 'xx');
      expect(result.name).toBe('Gold');
    });
  });

  describe('getRewardLabels', () => {
    it('should return all reward type labels in English', () => {
      const labels = getRewardLabels('en');
      expect(labels.discount).toBe('Discount');
      expect(labels.free_shipping).toBe('Free Shipping');
      expect(labels.free_product).toBe('Free Product');
      expect(labels.gift_card).toBe('Gift Card');
      expect(labels.exclusive_access).toBe('Exclusive Access');
      expect(labels.cashback).toBe('Cashback');
    });

    it('should return all reward type labels in Arabic', () => {
      const labels = getRewardLabels('ar');
      expect(labels.discount).toBe('خصم');
      expect(labels.free_shipping).toBe('شحن مجاني');
      expect(labels.free_product).toBe('منتج مجاني');
      expect(labels.gift_card).toBe('بطاقة هدايا');
      expect(labels.exclusive_access).toBe('وصول حصري');
      expect(labels.cashback).toBe('استرداد نقدي');
    });

    it('should return all reward type labels in Hebrew', () => {
      const labels = getRewardLabels('he');
      expect(labels.discount).toBe('הנחה');
      expect(labels.free_shipping).toBe('משלוח חינם');
    });

    it('should return all reward type labels in French', () => {
      const labels = getRewardLabels('fr');
      expect(labels.discount).toBe('Réduction');
      expect(labels.free_shipping).toBe('Livraison Gratuite');
    });

    it('should fallback to English for unsupported locale', () => {
      const labels = getRewardLabels('xx');
      expect(labels.discount).toBe('Discount');
    });
  });

  describe('formatRedemptionMessage', () => {
    const mockReward: RewardItem = {
      id: 'reward-1',
      name: '$10 Discount',
      description: 'Get $10 off your next purchase',
      pointsCost: 1000,
      type: 'discount',
      value: 10,
      currency: 'USD',
      available: true,
    };

    it('should format redemption message in English', () => {
      const result = formatRedemptionMessage(1000, mockReward, 'en');
      expect(result).toContain('1,000');
      expect(result).toContain('Points');
      expect(result).toContain('$10 Discount');
      expect(result).toContain('Discount');
    });

    it('should format redemption message in Arabic', () => {
      const result = formatRedemptionMessage(1000, mockReward, 'ar');
      expect(result).toContain('1,000');
      expect(result).toContain('نقاط');
    });

    it('should format redemption message in Hebrew', () => {
      const result = formatRedemptionMessage(1000, mockReward, 'he');
      expect(result).toContain('1,000');
      expect(result).toContain('נקודות');
    });

    it('should format redemption message for free shipping reward', () => {
      const shippingReward: RewardItem = {
        ...mockReward,
        name: 'Free Shipping',
        type: 'free_shipping',
        value: 0,
      };
      const result = formatRedemptionMessage(500, shippingReward, 'en');
      expect(result).toContain('Free Shipping');
    });

    it('should format redemption message for gift card reward', () => {
      const giftCardReward: RewardItem = {
        ...mockReward,
        name: '$25 Gift Card',
        type: 'gift_card',
        value: 25,
        pointsCost: 2500,
      };
      const result = formatRedemptionMessage(2500, giftCardReward, 'en');
      expect(result).toContain('2,500');
      expect(result).toContain('$25 Gift Card');
    });
  });

  describe('formatPointsEarnedMessage', () => {
    it('should format points earned message in English', () => {
      const result = formatPointsEarnedMessage(100, 'making a purchase', 'en');
      expect(result).toContain('100');
      expect(result).toContain('Points');
      expect(result).toContain('making a purchase');
    });

    it('should format points earned message in Arabic', () => {
      const result = formatPointsEarnedMessage(100, 'purchase', 'ar');
      expect(result).toContain('100');
      expect(result).toContain('نقاط');
    });

    it('should format points earned message in Hebrew', () => {
      const result = formatPointsEarnedMessage(100, 'purchase', 'he');
      expect(result).toContain('100');
      expect(result).toContain('נקודות');
    });

    it('should format points earned message for signup', () => {
      const result = formatPointsEarnedMessage(DEFAULT_EARNING_RULES.signupPoints, 'signing up', 'en');
      expect(result).toContain('100');
    });
  });

  describe('getTierProgress', () => {
    it('should calculate progress from Bronze to Silver', () => {
      const result = getTierProgress(500, 'bronze', 'en');
      expect(result.currentTier).toBe('bronze');
      expect(result.nextTier).toBe('silver');
      expect(result.pointsToNextTier).toBe(500);
      expect(result.progressPercentage).toBe(50);
      expect(result.message).toContain('500');
      expect(result.message).toContain('Silver');
    });

    it('should calculate progress from Silver to Gold', () => {
      const result = getTierProgress(2500, 'silver', 'en');
      expect(result.currentTier).toBe('silver');
      expect(result.nextTier).toBe('gold');
      expect(result.pointsToNextTier).toBe(2500);
      expect(result.progressPercentage).toBe(37.5);
    });

    it('should calculate progress from Gold to Platinum', () => {
      const result = getTierProgress(10000, 'gold', 'en');
      expect(result.currentTier).toBe('gold');
      expect(result.nextTier).toBe('platinum');
      expect(result.pointsToNextTier).toBe(10000);
    });

    it('should return max tier message for Platinum', () => {
      const result = getTierProgress(25000, 'platinum', 'en');
      expect(result.currentTier).toBe('platinum');
      expect(result.nextTier).toBeNull();
      expect(result.pointsToNextTier).toBe(0);
      expect(result.progressPercentage).toBe(100);
      expect(result.message).toContain('highest tier');
    });

    it('should return localized progress message in Arabic', () => {
      const result = getTierProgress(500, 'bronze', 'ar');
      expect(result.message).toContain('500');
      expect(result.message).toContain('فضية');
    });

    it('should return localized progress message in Hebrew', () => {
      const result = getTierProgress(500, 'bronze', 'he');
      expect(result.message).toContain('500');
      expect(result.message).toContain('כסף');
    });

    it('should cap progress at 100%', () => {
      const result = getTierProgress(5000, 'silver', 'en');
      expect(result.progressPercentage).toBe(100);
    });

    it('should floor progress at 0%', () => {
      const result = getTierProgress(0, 'bronze', 'en');
      expect(result.progressPercentage).toBe(0);
    });
  });

  describe('calculatePointsValue', () => {
    it('should calculate points value correctly', () => {
      const result = calculatePointsValue(1000, 100);
      expect(result).toBe(10);
    });

    it('should calculate points value with default rate', () => {
      const result = calculatePointsValue(1000);
      expect(result).toBe(10);
    });

    it('should return 0 for zero points', () => {
      const result = calculatePointsValue(0, 100);
      expect(result).toBe(0);
    });

    it('should return 0 for invalid rate', () => {
      const result = calculatePointsValue(1000, 0);
      expect(result).toBe(0);
    });

    it('should handle decimal values', () => {
      const result = calculatePointsValue(150, 100);
      expect(result).toBe(1.5);
    });
  });

  describe('calculatePointsForAmount', () => {
    it('should calculate points needed for amount', () => {
      const result = calculatePointsForAmount(10, 100);
      expect(result).toBe(1000);
    });

    it('should calculate points with default rate', () => {
      const result = calculatePointsForAmount(10);
      expect(result).toBe(1000);
    });

    it('should return 0 for zero amount', () => {
      const result = calculatePointsForAmount(0, 100);
      expect(result).toBe(0);
    });

    it('should return 0 for negative amount', () => {
      const result = calculatePointsForAmount(-10, 100);
      expect(result).toBe(0);
    });

    it('should round up fractional points', () => {
      const result = calculatePointsForAmount(10.5, 100);
      expect(result).toBe(1050);
    });
  });

  describe('validateRedemption', () => {
    const mockReward: RewardItem = {
      id: 'reward-1',
      name: '$10 Discount',
      description: 'Get $10 off',
      pointsCost: 1000,
      type: 'discount',
      value: 10,
      available: true,
    };

    it('should validate successful redemption', () => {
      const result = validateRedemption(1500, mockReward);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject redemption with insufficient points', () => {
      const result = validateRedemption(500, mockReward);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient points');
    });

    it('should reject redemption for unavailable reward', () => {
      const unavailableReward = { ...mockReward, available: false };
      const result = validateRedemption(1500, unavailableReward);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should reject redemption for out of stock reward', () => {
      const outOfStockReward: RewardItem = {
        ...mockReward,
        limitedQuantity: true,
        quantityRemaining: 0,
      };
      const result = validateRedemption(1500, outOfStockReward);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('out of stock');
    });

    it('should reject redemption for expired reward', () => {
      const expiredReward: RewardItem = {
        ...mockReward,
        expiresAt: new Date('2020-01-01'),
      };
      const result = validateRedemption(1500, expiredReward);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should allow redemption for limited quantity with stock', () => {
      const limitedReward: RewardItem = {
        ...mockReward,
        limitedQuantity: true,
        quantityRemaining: 5,
      };
      const result = validateRedemption(1500, limitedReward);
      expect(result.valid).toBe(true);
    });

    it('should allow redemption exactly at points cost', () => {
      const result = validateRedemption(1000, mockReward);
      expect(result.valid).toBe(true);
    });
  });

  describe('getTierByPoints', () => {
    it('should return Bronze for 0 points', () => {
      const result = getTierByPoints(0);
      expect(result.id).toBe('bronze');
    });

    it('should return Bronze for 999 points', () => {
      const result = getTierByPoints(999);
      expect(result.id).toBe('bronze');
    });

    it('should return Silver for 1000 points', () => {
      const result = getTierByPoints(1000);
      expect(result.id).toBe('silver');
    });

    it('should return Silver for 4999 points', () => {
      const result = getTierByPoints(4999);
      expect(result.id).toBe('silver');
    });

    it('should return Gold for 5000 points', () => {
      const result = getTierByPoints(5000);
      expect(result.id).toBe('gold');
    });

    it('should return Gold for 19999 points', () => {
      const result = getTierByPoints(19999);
      expect(result.id).toBe('gold');
    });

    it('should return Platinum for 20000 points', () => {
      const result = getTierByPoints(20000);
      expect(result.id).toBe('platinum');
    });

    it('should return Platinum for very high points', () => {
      const result = getTierByPoints(100000);
      expect(result.id).toBe('platinum');
    });

    it('should have correct tier properties', () => {
      const silver = getTierByPoints(2000);
      expect(silver.color).toBe('#C0C0C0');
      expect(silver.benefits.multiplier).toBe(1.25);
      expect(silver.benefits.freeShipping).toBe(true);
    });
  });

  describe('getTierBenefitsList', () => {
    it('should return Bronze benefits in English', () => {
      const result = getTierBenefitsList('bronze', 'en');
      expect(result.length).toBe(0); // Bronze has no special benefits
    });

    it('should return Silver benefits in English', () => {
      const result = getTierBenefitsList('silver', 'en');
      expect(result).toContain('Free Shipping');
      expect(result.some(b => b.includes('1.25x'))).toBe(true);
      expect(result.some(b => b.includes('Early access'))).toBe(true);
    });

    it('should return Gold benefits in English', () => {
      const result = getTierBenefitsList('gold', 'en');
      expect(result).toContain('Free Shipping');
      expect(result.some(b => b.includes('1.5x'))).toBe(true);
      expect(result.some(b => b.includes('exclusive'))).toBe(true);
      expect(result).toContain('Birthday Bonus');
    });

    it('should return Platinum benefits in English', () => {
      const result = getTierBenefitsList('platinum', 'en');
      expect(result).toContain('Free Shipping');
      expect(result.some(b => b.includes('2x'))).toBe(true);
      expect(result.some(b => b.includes('Personal shopper'))).toBe(true);
    });

    it('should return Silver benefits in Arabic', () => {
      const result = getTierBenefitsList('silver', 'ar');
      expect(result).toContain('شحن مجاني');
    });

    it('should return Gold benefits in Hebrew', () => {
      const result = getTierBenefitsList('gold', 'he');
      expect(result).toContain('משלוח חינם');
    });
  });

  describe('getTransactionTypeLabel', () => {
    it('should return transaction type labels in English', () => {
      expect(getTransactionTypeLabel('earned', 'en')).toBe('Earned');
      expect(getTransactionTypeLabel('redeemed', 'en')).toBe('Redeemed');
      expect(getTransactionTypeLabel('expired', 'en')).toBe('Expired');
      expect(getTransactionTypeLabel('bonus', 'en')).toBe('Bonus');
      expect(getTransactionTypeLabel('adjusted', 'en')).toBe('Adjusted');
    });

    it('should return transaction type labels in Arabic', () => {
      expect(getTransactionTypeLabel('earned', 'ar')).toBe('تم الربح');
      expect(getTransactionTypeLabel('redeemed', 'ar')).toBe('تم الاستبدال');
      expect(getTransactionTypeLabel('expired', 'ar')).toBe('منتهي الصلاحية');
    });

    it('should return transaction type labels in Hebrew', () => {
      expect(getTransactionTypeLabel('earned', 'he')).toBe('הושג');
      expect(getTransactionTypeLabel('redeemed', 'he')).toBe('מומש');
    });

    it('should fallback to English for unsupported locale', () => {
      expect(getTransactionTypeLabel('earned', 'xx')).toBe('Earned');
    });
  });

  describe('VIP_TIERS constants', () => {
    it('should have all 4 tiers defined', () => {
      expect(VIP_TIERS.length).toBe(4);
      expect(VIP_TIERS.map(t => t.id)).toContain('bronze');
      expect(VIP_TIERS.map(t => t.id)).toContain('silver');
      expect(VIP_TIERS.map(t => t.id)).toContain('gold');
      expect(VIP_TIERS.map(t => t.id)).toContain('platinum');
    });

    it('should have correct point thresholds', () => {
      expect(VIP_TIERS.find(t => t.id === 'bronze')?.minPoints).toBe(0);
      expect(VIP_TIERS.find(t => t.id === 'silver')?.minPoints).toBe(1000);
      expect(VIP_TIERS.find(t => t.id === 'gold')?.minPoints).toBe(5000);
      expect(VIP_TIERS.find(t => t.id === 'platinum')?.minPoints).toBe(20000);
    });

    it('should have correct multipliers', () => {
      expect(VIP_TIERS.find(t => t.id === 'bronze')?.benefits.multiplier).toBe(1);
      expect(VIP_TIERS.find(t => t.id === 'silver')?.benefits.multiplier).toBe(1.25);
      expect(VIP_TIERS.find(t => t.id === 'gold')?.benefits.multiplier).toBe(1.5);
      expect(VIP_TIERS.find(t => t.id === 'platinum')?.benefits.multiplier).toBe(2);
    });

    it('should have correct colors', () => {
      expect(VIP_TIERS.find(t => t.id === 'bronze')?.color).toBe('#CD7F32');
      expect(VIP_TIERS.find(t => t.id === 'silver')?.color).toBe('#C0C0C0');
      expect(VIP_TIERS.find(t => t.id === 'gold')?.color).toBe('#FFD700');
      expect(VIP_TIERS.find(t => t.id === 'platinum')?.color).toBe('#E5E4E2');
    });
  });

  describe('DEFAULT_EARNING_RULES constants', () => {
    it('should have signup points defined', () => {
      expect(DEFAULT_EARNING_RULES.signupPoints).toBe(100);
    });

    it('should have purchase points defined', () => {
      expect(DEFAULT_EARNING_RULES.purchasePointsPerDollar).toBe(1);
    });

    it('should have review points defined', () => {
      expect(DEFAULT_EARNING_RULES.reviewPoints).toBe(50);
    });

    it('should have social share points defined', () => {
      expect(DEFAULT_EARNING_RULES.socialSharePoints).toBe(25);
    });

    it('should have referral points defined', () => {
      expect(DEFAULT_EARNING_RULES.referralPoints).toBe(200);
    });

    it('should have birthday bonus points defined', () => {
      expect(DEFAULT_EARNING_RULES.birthdayBonusPoints).toBe(100);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle negative points balance formatting', () => {
      const result = formatPointsBalance(-100, 'en');
      expect(result).toContain('-100');
    });

    it('should handle very large point values', () => {
      const result = formatPointsBalance(999999999, 'en');
      expect(result).toContain('999,999,999');
    });

    it('should handle decimal points values by rounding', () => {
      const result = formatPointsBalance(1000.7, 'en');
      expect(result).toContain('1,001');
    });

    it('should handle all supported locales in getLoyaltyLabels', () => {
      const locales: SupportedLocale[] = ['en', 'ar', 'he', 'fr', 'de', 'es', 'ja', 'ko', 'zh'];
      locales.forEach(locale => {
        const labels = getLoyaltyLabels(locale);
        expect(labels.programName).toBeDefined();
        expect(labels.pointsLabel).toBeDefined();
        expect(labels.pointsLabelPlural).toBeDefined();
      });
    });

    it('should handle case insensitive locale codes', () => {
      const upperEn = getLoyaltyLabels('EN');
      const lowerEn = getLoyaltyLabels('en');
      expect(upperEn.programName).toBe(lowerEn.programName);
    });
  });
});
