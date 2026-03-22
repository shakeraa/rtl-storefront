import { describe, it, expect } from 'vitest';
import {
  getNationalDayTemplate,
  getNationalDayThemes,
  getNationalDayCampaign,
  getSupportedCountries,
  getCountryName,
  hasNationalDayTemplate,
  getUpcomingNationalDays,
  formatCountdown,
  generateBannerHtml,
  getFlagEmoji,
  getPatrioticMessaging,
  getEmailContent,
  getSmsContent,
  getYearsSinceFounding,
  UAE_NATIONAL_DAY,
  SAUDI_NATIONAL_DAY,
  KUWAIT_NATIONAL_DAY,
  BAHRAIN_NATIONAL_DAY,
  QATAR_NATIONAL_DAY,
  OMAN_NATIONAL_DAY,
  NATIONAL_DAY_TEMPLATES,
} from '../../app/services/mena-campaigns/national-day';

describe('National Day Service - T0061', () => {
  describe('getNationalDayTemplate', () => {
    it('should return UAE template for AE country code', () => {
      const template = getNationalDayTemplate('AE');
      expect(template).not.toBeNull();
      expect(template?.countryCode).toBe('AE');
      expect(template?.country).toBe('United Arab Emirates');
    });

    it('should return Saudi template for SA country code', () => {
      const template = getNationalDayTemplate('SA');
      expect(template).not.toBeNull();
      expect(template?.countryCode).toBe('SA');
      expect(template?.country).toBe('Saudi Arabia');
    });

    it('should return Kuwait template for KW country code', () => {
      const template = getNationalDayTemplate('KW');
      expect(template).not.toBeNull();
      expect(template?.countryCode).toBe('KW');
    });

    it('should return Bahrain template for BH country code', () => {
      const template = getNationalDayTemplate('BH');
      expect(template).not.toBeNull();
      expect(template?.countryCode).toBe('BH');
    });

    it('should return Qatar template for QA country code', () => {
      const template = getNationalDayTemplate('QA');
      expect(template).not.toBeNull();
      expect(template?.countryCode).toBe('QA');
    });

    it('should return Oman template for OM country code', () => {
      const template = getNationalDayTemplate('OM');
      expect(template).not.toBeNull();
      expect(template?.countryCode).toBe('OM');
    });

    it('should return null for unsupported country code', () => {
      const template = getNationalDayTemplate('US');
      expect(template).toBeNull();
    });

    it('should return Arabic messaging when locale is ar', () => {
      const template = getNationalDayTemplate('AE', 'ar');
      expect(template).not.toBeNull();
      expect(template?.messaging.ar).toBeDefined();
      expect(template?.messaging.ar.headline).toContain('عيد');
    });

    it('should return Hebrew messaging when locale is he', () => {
      const template = getNationalDayTemplate('SA', 'he');
      expect(template).not.toBeNull();
      expect(template?.messaging.he).toBeDefined();
      expect(template?.messaging.he.headline).toContain('שנה');
    });

    it('should fallback to English for unsupported locale', () => {
      const template = getNationalDayTemplate('AE', 'fr');
      expect(template).not.toBeNull();
      expect(template?.messaging.en).toBeDefined();
    });
  });

  describe('getNationalDayThemes', () => {
    it('should return UAE theme with correct flag colors', () => {
      const theme = getNationalDayThemes('AE');
      expect(theme).not.toBeNull();
      expect(theme?.flagColors).toContain('#FF0000');
      expect(theme?.flagColors).toContain('#00732F');
      expect(theme?.flagColors).toContain('#FFFFFF');
      expect(theme?.flagColors).toContain('#000000');
    });

    it('should return Saudi theme with green and white colors', () => {
      const theme = getNationalDayThemes('SA');
      expect(theme).not.toBeNull();
      expect(theme?.primaryColor).toBe('#006C35');
      expect(theme?.secondaryColor).toBe('#FFFFFF');
      expect(theme?.flagColors).toHaveLength(2);
    });

    it('should return null for unsupported country', () => {
      const theme = getNationalDayThemes('XX');
      expect(theme).toBeNull();
    });
  });

  describe('getNationalDayCampaign', () => {
    it('should return UAE campaign for 2024', () => {
      const campaign = getNationalDayCampaign('AE', 2024);
      expect(campaign).not.toBeNull();
      expect(campaign?.country).toBe('United Arab Emirates');
      expect(campaign?.year).toBe(2024);
      expect(campaign?.startDate.getMonth()).toBe(11);
      expect(campaign?.startDate.getDate()).toBe(2);
    });

    it('should return Saudi campaign for 2024', () => {
      const campaign = getNationalDayCampaign('SA', 2024);
      expect(campaign).not.toBeNull();
      expect(campaign?.country).toBe('Saudi Arabia');
      expect(campaign?.year).toBe(2024);
      expect(campaign?.startDate.getMonth()).toBe(8);
      expect(campaign?.startDate.getDate()).toBe(23);
    });

    it('should return campaign with 3-day duration', () => {
      const campaign = getNationalDayCampaign('AE', 2024);
      expect(campaign).not.toBeNull();
      const durationMs = campaign!.endDate.getTime() - campaign!.startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      expect(durationDays).toBe(3);
    });

    it('should return campaign with countdown properties', () => {
      const campaign = getNationalDayCampaign('SA', 2024);
      expect(campaign).not.toBeNull();
      expect(campaign?.countdown).toHaveProperty('days');
      expect(campaign?.countdown).toHaveProperty('hours');
      expect(campaign?.countdown).toHaveProperty('minutes');
    });

    it('should return null for unsupported country', () => {
      const campaign = getNationalDayCampaign('XX', 2024);
      expect(campaign).toBeNull();
    });
  });

  describe('getSupportedCountries', () => {
    it('should return all supported country codes', () => {
      const countries = getSupportedCountries();
      expect(countries).toContain('AE');
      expect(countries).toContain('SA');
      expect(countries).toContain('KW');
      expect(countries).toContain('BH');
      expect(countries).toContain('QA');
      expect(countries).toContain('OM');
      expect(countries).toHaveLength(6);
    });
  });

  describe('getCountryName', () => {
    it('should return UAE name in English', () => {
      const name = getCountryName('AE', 'en');
      expect(name).toBe('United Arab Emirates');
    });

    it('should return UAE name in Arabic', () => {
      const name = getCountryName('AE', 'ar');
      expect(name).toBe('الإمارات العربية المتحدة');
    });

    it('should return UAE name in Hebrew', () => {
      const name = getCountryName('AE', 'he');
      expect(name).toBe('איחוד האמירויות הערביות');
    });

    it('should return Saudi name in Arabic', () => {
      const name = getCountryName('SA', 'ar');
      expect(name).toBe('المملكة العربية السعودية');
    });

    it('should return null for unsupported country', () => {
      const name = getCountryName('XX', 'en');
      expect(name).toBeNull();
    });
  });

  describe('hasNationalDayTemplate', () => {
    it('should return true for UAE', () => {
      expect(hasNationalDayTemplate('AE')).toBe(true);
    });

    it('should return true for Saudi Arabia', () => {
      expect(hasNationalDayTemplate('SA')).toBe(true);
    });

    it('should return false for unsupported country', () => {
      expect(hasNationalDayTemplate('US')).toBe(false);
    });
  });

  describe('getUpcomingNationalDays', () => {
    it('should return array of campaigns', () => {
      const campaigns = getUpcomingNationalDays(2026);
      expect(Array.isArray(campaigns)).toBe(true);
    });

    it('should return campaigns sorted by date', () => {
      const campaigns = getUpcomingNationalDays(2026);
      if (campaigns.length > 1) {
        for (let i = 1; i < campaigns.length; i++) {
          expect(campaigns[i].startDate.getTime()).toBeGreaterThanOrEqual(
            campaigns[i - 1].startDate.getTime()
          );
        }
      }
    });
  });

  describe('formatCountdown', () => {
    it('should format countdown in English', () => {
      const formatted = formatCountdown({ days: 5, hours: 12, minutes: 30 }, 'en');
      expect(formatted).toContain('5d');
      expect(formatted).toContain('12h');
      expect(formatted).toContain('30m');
    });

    it('should format countdown in Arabic', () => {
      const formatted = formatCountdown({ days: 5, hours: 12, minutes: 30 }, 'ar');
      expect(formatted).toContain('5 يوم');
      expect(formatted).toContain('12 ساعة');
      expect(formatted).toContain('30 دقيقة');
    });

    it('should format countdown in Hebrew', () => {
      const formatted = formatCountdown({ days: 5, hours: 12, minutes: 30 }, 'he');
      expect(formatted).toContain('5 ימים');
      expect(formatted).toContain('12 שעות');
      expect(formatted).toContain('30 דקות');
    });

    it('should fallback to English for unsupported locale', () => {
      const formatted = formatCountdown({ days: 1, hours: 2, minutes: 3 }, 'fr');
      expect(formatted).toContain('1d');
    });
  });

  describe('generateBannerHtml', () => {
    it('should generate banner HTML for UAE', () => {
      const html = generateBannerHtml('AE', 'en');
      expect(html).toContain('UAE');
      expect(html).toContain('linear-gradient');
      expect(html).toContain('🇦🇪');
    });

    it('should generate banner HTML with RTL for Arabic', () => {
      const html = generateBannerHtml('SA', 'ar');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('وطني');
    });

    it('should generate banner HTML with RTL for Hebrew', () => {
      const html = generateBannerHtml('AE', 'he');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('יום');
    });

    it('should return empty string for unsupported country', () => {
      const html = generateBannerHtml('XX', 'en');
      expect(html).toBe('');
    });
  });

  describe('getFlagEmoji', () => {
    it('should return UAE flag emoji', () => {
      expect(getFlagEmoji('AE')).toBe('🇦🇪');
    });

    it('should return Saudi flag emoji', () => {
      expect(getFlagEmoji('SA')).toBe('🇸🇦');
    });

    it('should return Kuwait flag emoji', () => {
      expect(getFlagEmoji('KW')).toBe('🇰🇼');
    });

    it('should return Bahrain flag emoji', () => {
      expect(getFlagEmoji('BH')).toBe('🇧🇭');
    });

    it('should return Qatar flag emoji', () => {
      expect(getFlagEmoji('QA')).toBe('🇶🇦');
    });

    it('should return Oman flag emoji', () => {
      expect(getFlagEmoji('OM')).toBe('🇴🇲');
    });

    it('should return default flag for unknown country', () => {
      expect(getFlagEmoji('XX')).toBe('🏳️');
    });
  });

  describe('getPatrioticMessaging', () => {
    it('should return patriotic messaging for UAE in Arabic', () => {
      const messaging = getPatrioticMessaging('AE', 'ar');
      expect(messaging).not.toBeNull();
      expect(messaging?.patrioticSlogan).toContain('الإمارات');
      expect(messaging?.headline).toContain('عيد');
    });

    it('should return patriotic messaging for Saudi in Arabic', () => {
      const messaging = getPatrioticMessaging('SA', 'ar');
      expect(messaging).not.toBeNull();
      expect(messaging?.patrioticSlogan).toContain('وطن');
    });

    it('should return null for unsupported country', () => {
      const messaging = getPatrioticMessaging('XX', 'en');
      expect(messaging).toBeNull();
    });
  });

  describe('getEmailContent', () => {
    it('should return email content for UAE', () => {
      const email = getEmailContent('AE', 'en');
      expect(email).not.toBeNull();
      expect(email?.subject).toContain('UAE National Day');
      expect(email?.body).toContain('Happy National Day');
    });

    it('should return Arabic email content for Saudi', () => {
      const email = getEmailContent('SA', 'ar');
      expect(email).not.toBeNull();
      expect(email?.subject).toContain('🇸🇦');
      expect(email?.subject).toContain('السعودي');
    });

    it('should return null for unsupported country', () => {
      const email = getEmailContent('XX', 'en');
      expect(email).toBeNull();
    });
  });

  describe('getSmsContent', () => {
    it('should return SMS content for UAE in English', () => {
      const sms = getSmsContent('AE', 'en');
      expect(sms).not.toBeNull();
      expect(sms).toContain('UAE National Day');
      expect(sms).toContain('🇦🇪');
    });

    it('should return SMS content for Saudi in Arabic', () => {
      const sms = getSmsContent('SA', 'ar');
      expect(sms).not.toBeNull();
      expect(sms).toContain('اليوم الوطني');
      expect(sms).toContain('🇸🇦');
    });

    it('should return null for unsupported country', () => {
      const sms = getSmsContent('XX', 'en');
      expect(sms).toBeNull();
    });
  });

  describe('getYearsSinceFounding', () => {
    it('should calculate correct years for UAE in 2024', () => {
      const years = getYearsSinceFounding('AE', 2024);
      expect(years).toBe(53);
    });

    it('should calculate correct years for Saudi in 2024', () => {
      const years = getYearsSinceFounding('SA', 2024);
      expect(years).toBe(92);
    });

    it('should calculate correct years for Kuwait in 2024', () => {
      const years = getYearsSinceFounding('KW', 2024);
      expect(years).toBe(63);
    });

    it('should return null for unsupported country', () => {
      const years = getYearsSinceFounding('XX', 2024);
      expect(years).toBeNull();
    });
  });

  describe('Constants', () => {
    it('should have correct UAE founding year', () => {
      expect(UAE_NATIONAL_DAY.foundingYear).toBe(1971);
      expect(UAE_NATIONAL_DAY.date).toEqual({ month: 12, day: 2 });
    });

    it('should have correct Saudi founding year', () => {
      expect(SAUDI_NATIONAL_DAY.foundingYear).toBe(1932);
      expect(SAUDI_NATIONAL_DAY.date).toEqual({ month: 9, day: 23 });
    });

    it('should have all 6 countries in templates', () => {
      expect(NATIONAL_DAY_TEMPLATES).toHaveLength(6);
      const codes = NATIONAL_DAY_TEMPLATES.map((t) => t.countryCode);
      expect(codes).toEqual(['AE', 'SA', 'KW', 'BH', 'QA', 'OM']);
    });

    it('should have Arabic names for all countries', () => {
      for (const template of NATIONAL_DAY_TEMPLATES) {
        expect(template.countryNameAr).toBeTruthy();
        expect(template.countryNameAr.length).toBeGreaterThan(0);
      }
    });

    it('should have Hebrew names for all countries', () => {
      for (const template of NATIONAL_DAY_TEMPLATES) {
        expect(template.countryNameHe).toBeTruthy();
        expect(template.countryNameHe.length).toBeGreaterThan(0);
      }
    });
  });
});
