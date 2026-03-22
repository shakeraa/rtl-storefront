import { describe, it, expect } from 'vitest';
import {
  getWeekendConfig,
  isWeekend,
  getNextBusinessDay,
  calculateDeliveryDate,
  getBusinessDaysBetween,
  getSupportHours,
  formatWeekendDays,
  getWeekendType,
  isFriSatWeekend,
  WEEKEND_CONFIGS,
} from '../../app/services/weekend';

describe('Weekend Service - T0062', () => {
  describe('Weekend Configurations', () => {
    it('should return Friday-Saturday for GCC countries', () => {
      const sa = getWeekendConfig('SA');
      expect(sa.weekendType).toBe('fri-sat');
      expect(sa.weekendDays).toEqual([5, 6]);
      
      const ae = getWeekendConfig('AE');
      expect(ae.weekendType).toBe('fri-sat');
    });

    it('should return Saturday-Sunday for Western countries', () => {
      const us = getWeekendConfig('US');
      expect(us.weekendType).toBe('sat-sun');
      expect(us.weekendDays).toEqual([0, 6]);
    });

    it('should default to US config for unknown country', () => {
      const config = getWeekendConfig('XX');
      expect(config.country).toBe('US');
    });
  });

  describe('Weekend Detection', () => {
    it('should detect Friday as weekend in GCC', () => {
      const friday = new Date(2024, 2, 22); // Friday
      expect(isWeekend(friday, 'SA')).toBe(true);
    });

    it('should detect Saturday as weekend in GCC', () => {
      const saturday = new Date(2024, 2, 23); // Saturday
      expect(isWeekend(saturday, 'SA')).toBe(true);
    });

    it('should detect Sunday as weekend in US', () => {
      const sunday = new Date(2024, 2, 24); // Sunday
      expect(isWeekend(sunday, 'US')).toBe(true);
      expect(isWeekend(sunday, 'SA')).toBe(false);
    });

    it('should detect Sunday as weekday in GCC', () => {
      const sunday = new Date(2024, 2, 24); // Sunday
      expect(isWeekend(sunday, 'SA')).toBe(false);
    });
  });

  describe('Business Day Calculations', () => {
    it('should get next business day', () => {
      const thursday = new Date(2024, 2, 21); // Thursday
      const nextDay = getNextBusinessDay(thursday, 'SA');
      expect(nextDay.getDay()).toBe(0); // Sunday
    });

    it('should calculate delivery date with weekends', () => {
      const thursday = new Date(2024, 2, 21); // Thursday
      const delivery = calculateDeliveryDate(thursday, 3, 'SA');
      
      expect(delivery.businessDays).toBe(3);
      expect(delivery.weekendDays).toBeGreaterThanOrEqual(2); // Fri-Sat
    });

    it('should calculate business days between dates', () => {
      const start = new Date(2024, 2, 17); // Sunday
      const end = new Date(2024, 2, 24); // Next Sunday
      const days = getBusinessDaysBetween(start, end, 'SA');
      
      expect(days).toBe(5); // Sun-Thu
    });
  });

  describe('Display Functions', () => {
    it('should format support hours in English', () => {
      const hours = getSupportHours('SA', 'en');
      expect(hours).toContain('Sunday');
      expect(hours).toContain('Thursday');
    });

    it('should format support hours in Arabic', () => {
      const hours = getSupportHours('SA', 'ar');
      expect(hours).toContain('الأحد');
    });

    it('should format weekend days', () => {
      const days = formatWeekendDays('SA', 'en');
      expect(days).toContain('Friday');
      expect(days).toContain('Saturday');
    });

    it('should get weekend type', () => {
      expect(getWeekendType('SA')).toBe('fri-sat');
      expect(getWeekendType('US')).toBe('sat-sun');
    });

    it('should check if Friday-Saturday weekend', () => {
      expect(isFriSatWeekend('SA')).toBe(true);
      expect(isFriSatWeekend('US')).toBe(false);
    });
  });
});
