import { describe, it, expect } from 'vitest';
import {
  toHijri,
  fromHijri,
  formatHijri,
  getUpcomingEvents,
  getEventForDate,
  getDaysUntilRamadan,
  getEidCountdown,
  getNationalDay,
  getWeekendDays,
  HIJRI_EVENTS,
} from '../../app/services/calendar/hijri';
import {
  getTemplateByType,
  getTemplateById,
  detectUpcomingCampaigns,
  getActiveCampaigns,
  scheduleCampaign,
  SEASONAL_TEMPLATES,
  RAMADAN_TEMPLATE,
  WHITE_FRIDAY_TEMPLATE,
  UAE_NATIONAL_DAY_TEMPLATE,
  SAUDI_NATIONAL_DAY_TEMPLATE,
} from '../../app/services/calendar/events';

describe('Calendar Service - T0005', () => {
  describe('Hijri Date Conversion', () => {
    it('should convert Gregorian to Hijri', () => {
      const date = new Date(2024, 2, 22);
      const hijri = toHijri(date);
      
      expect(hijri.year).toBeGreaterThan(1440);
      expect(hijri.month).toBeGreaterThanOrEqual(1);
      expect(hijri.month).toBeLessThanOrEqual(12);
      expect(hijri.day).toBeGreaterThanOrEqual(1);
      expect(hijri.day).toBeLessThanOrEqual(30);
    });

    it('should convert Hijri to Gregorian', () => {
      const hijri = { year: 1445, month: 9, day: 1 };
      const gregorian = fromHijri(hijri);
      
      expect(gregorian).toBeInstanceOf(Date);
      expect(gregorian.getFullYear()).toBeGreaterThan(2020);
    });

    it('should format Hijri date in Arabic', () => {
      const hijri = { year: 1445, month: 9, day: 1, monthName: 'رمضان', monthNameEn: 'Ramadan' };
      const formatted = formatHijri(hijri, 'ar');
      expect(formatted).toContain('رمضان');
      expect(formatted).toContain('1445');
    });

    it('should format Hijri date in English', () => {
      const hijri = { year: 1445, month: 9, day: 1, monthName: 'رمضان', monthNameEn: 'Ramadan' };
      const formatted = formatHijri(hijri, 'en');
      expect(formatted).toContain('Ramadan');
    });
  });

  describe('Islamic Events', () => {
    it('should have defined Hijri events', () => {
      expect(HIJRI_EVENTS.length).toBeGreaterThan(0);
      expect(HIJRI_EVENTS.some((e) => e.id === 'eid-al-fitr')).toBe(true);
      expect(HIJRI_EVENTS.some((e) => e.id === 'ramadan-start')).toBe(true);
    });

    it('should detect events for specific dates', () => {
      const event = getEventForDate(new Date());
      expect(typeof event === 'object' || event === null).toBe(true);
    });

    it('should calculate days until Ramadan', () => {
      const days = getDaysUntilRamadan();
      expect(typeof days).toBe('number');
    });

    it('should calculate Eid countdown', () => {
      const countdown = getEidCountdown();
      expect(typeof countdown.eidFitr).toBe('number');
      expect(typeof countdown.eidAdha).toBe('number');
    });
  });

  describe('National Days', () => {
    it('should get UAE National Day', () => {
      const date = getNationalDay('AE', 2024);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMonth()).toBe(11); // December
      expect(date?.getDate()).toBe(2);
    });

    it('should get Saudi National Day', () => {
      const date = getNationalDay('SA', 2024);
      expect(date).toBeInstanceOf(Date);
      expect(date?.getMonth()).toBe(8); // September
      expect(date?.getDate()).toBe(23);
    });

    it('should return null for unknown country', () => {
      const date = getNationalDay('XX', 2024);
      expect(date).toBeNull();
    });
  });

  describe('Weekend Configuration', () => {
    it('should return Friday-Saturday for GCC countries', () => {
      expect(getWeekendDays('SA')).toEqual([5, 6]);
      expect(getWeekendDays('AE')).toEqual([5, 6]);
      expect(getWeekendDays('QA')).toEqual([5, 6]);
    });

    it('should return Saturday-Sunday for default', () => {
      expect(getWeekendDays('US')).toEqual([0, 6]);
      expect(getWeekendDays('GB')).toEqual([0, 6]);
    });
  });

  describe('Seasonal Templates', () => {
    it('should have all seasonal templates', () => {
      expect(SEASONAL_TEMPLATES.length).toBeGreaterThanOrEqual(6);
    });

    it('should get template by type', () => {
      const ramadan = getTemplateByType('ramadan');
      expect(ramadan).toBeDefined();
      expect(ramadan?.type).toBe('ramadan');
    });

    it('should get template by ID', () => {
      const template = getTemplateById('ramadan-2024');
      expect(template).toBeDefined();
      expect(template?.id).toBe('ramadan-2024');
    });

    it('should have Ramadan template with correct colors', () => {
      expect(RAMADAN_TEMPLATE.theme.primaryColor).toBe('#1a5f2a');
      expect(RAMADAN_TEMPLATE.theme.secondaryColor).toBe('#d4af37');
      expect(RAMADAN_TEMPLATE.presets.discount).toBe(20);
    });

    it('should have White Friday template', () => {
      expect(WHITE_FRIDAY_TEMPLATE.type).toBe('white-friday');
      expect(WHITE_FRIDAY_TEMPLATE.presets.discount).toBe(50);
    });

    it('should have UAE National Day template', () => {
      expect(UAE_NATIONAL_DAY_TEMPLATE.type).toBe('national-day');
      expect(UAE_NATIONAL_DAY_TEMPLATE.theme.primaryColor).toBe('#00732f');
    });

    it('should have Saudi National Day template with 23% discount', () => {
      expect(SAUDI_NATIONAL_DAY_TEMPLATE.type).toBe('national-day');
      expect(SAUDI_NATIONAL_DAY_TEMPLATE.presets.discount).toBe(23);
    });
  });

  describe('Campaign Detection', () => {
    it('should detect upcoming campaigns', () => {
      const campaigns = detectUpcomingCampaigns(new Date());
      expect(Array.isArray(campaigns)).toBe(true);
    });

    it('should detect Ramadan campaign', () => {
      // Test with a date in early January to ensure Ramadan (March) is detected
      const januaryDate = new Date(2025, 0, 1);
      const campaigns = detectUpcomingCampaigns(januaryDate);
      const ramadan = campaigns.find((c) => c.type === 'ramadan');
      expect(ramadan).toBeDefined();
      expect(ramadan?.countries).toContain('SA');
      expect(ramadan?.type).toBe('ramadan');
    });

    it('should detect White Friday campaign', () => {
      const campaigns = detectUpcomingCampaigns(new Date());
      const whiteFriday = campaigns.find((c) => c.type === 'white-friday');
      expect(whiteFriday).toBeDefined();
    });

    it('should detect UAE National Day', () => {
      const campaigns = detectUpcomingCampaigns(new Date());
      const uaeDay = campaigns.find((c) => c.id.includes('uae-national-day'));
      expect(uaeDay).toBeDefined();
      expect(uaeDay?.countries).toContain('AE');
    });

    it('should detect Saudi National Day', () => {
      const campaigns = detectUpcomingCampaigns(new Date());
      const saudiDay = campaigns.find((c) => c.id.includes('saudi-national-day'));
      expect(saudiDay).toBeDefined();
      expect(saudiDay?.countries).toContain('SA');
      expect(saudiDay?.discount).toBe(23);
    });
  });

  describe('Campaign Scheduling', () => {
    it('should schedule a campaign', () => {
      const campaign = {
        id: 'test-campaign',
        name: 'Test Campaign',
        nameAr: 'حملة تجريبية',
        startDate: new Date(),
        endDate: new Date(),
        type: 'seasonal' as const,
        countries: ['SA'],
        template: 'test',
        autoSchedule: true,
      };
      
      const result = scheduleCampaign(campaign);
      expect(result.success).toBe(true);
      expect(result.message).toContain('scheduled');
    });
  });
});
