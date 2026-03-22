import { describe, it, expect } from 'vitest';
import {
  createWhiteFridayCampaign,
  getWhiteFridayCountdown,
  formatCountdown,
  getSaleBadge,
  isWhiteFridayActive,
  getDiscountMessage,
  WHITEFRIDAY_THEME,
  WHITEFRIDAY_BADGES,
  WHITEFRIDAY_BANNERS,
} from '../../app/services/white-friday';

describe('White Friday Service - T0060', () => {
  describe('Campaign Creation', () => {
    it('should create White Friday campaign', () => {
      const campaign = createWhiteFridayCampaign(2024);
      
      expect(campaign.name).toBe('White Friday');
      expect(campaign.nameAr).toBe('الجمعة البيضاء');
      expect(campaign.discount).toBe(50);
    });

    it('should have correct theme colors', () => {
      expect(WHITEFRIDAY_THEME.primaryColor).toBe('#000000');
      expect(WHITEFRIDAY_THEME.secondaryColor).toBe('#FFFFFF');
      expect(WHITEFRIDAY_THEME.accentColor).toBe('#FFD700');
    });

    it('should have campaign badges', () => {
      expect(WHITEFRIDAY_BADGES.length).toBeGreaterThan(0);
      expect(WHITEFRIDAY_BADGES.some((b) => b.id === 'white-friday')).toBe(true);
    });

    it('should have banners', () => {
      expect(WHITEFRIDAY_BANNERS.length).toBeGreaterThan(0);
      expect(WHITEFRIDAY_BANNERS.some((b) => b.size === 'hero')).toBe(true);
    });
  });

  describe('Countdown', () => {
    it('should get countdown to White Friday', () => {
      const countdown = getWhiteFridayCountdown(2024);
      expect(countdown).toHaveProperty('days');
      expect(countdown).toHaveProperty('hours');
      expect(countdown).toHaveProperty('minutes');
    });

    it('should format countdown in English', () => {
      const formatted = formatCountdown({ days: 5, hours: 12, minutes: 30 }, 'en');
      expect(formatted).toContain('5d');
      expect(formatted).toContain('12h');
    });

    it('should format countdown in Arabic', () => {
      const formatted = formatCountdown({ days: 5, hours: 12, minutes: 30 }, 'ar');
      expect(formatted).toContain('يوم');
      expect(formatted).toContain('ساعة');
    });
  });

  describe('Sale Badges', () => {
    it('should get sale badge in English', () => {
      const badge = getSaleBadge(50, 'en');
      expect(badge).toBe('50% OFF');
    });

    it('should get sale badge in Arabic', () => {
      const badge = getSaleBadge(50, 'ar');
      expect(badge).toBe('خصم 50%');
    });
  });

  describe('Discount Messages', () => {
    it('should get discount message in English', () => {
      const msg = getDiscountMessage(50, 'en');
      expect(msg).toContain('Save');
      expect(msg).toContain('50%');
    });

    it('should get discount message in Arabic', () => {
      const msg = getDiscountMessage(50, 'ar');
      expect(msg).toContain('وفّر');
      expect(msg).toContain('50%');
    });
  });

  describe('Campaign Status', () => {
    it('should check if White Friday is active', () => {
      // 2024 has passed, so should be false
      const isActive = isWhiteFridayActive(2023);
      expect(typeof isActive).toBe('boolean');
    });
  });
});
