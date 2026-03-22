import { describe, it, expect, vi } from 'vitest';
import {
  detectBrowserLanguage,
  detectBrowserLocale,
  getSuggestedSettings,
  isCountryAllowed,
  detectVPN,
  checkPrivacyCompliance,
  getLanguageFromCountry,
  getCurrencyFromCountry,
  formatLocation,
  COUNTRY_LANGUAGE_MAP,
  COUNTRY_CURRENCY_MAP,
} from '../../app/services/geolocation';

describe('Geolocation Service - T0040', () => {
  describe('Browser Detection', () => {
    it('should detect browser language', () => {
      const lang = detectBrowserLanguage();
      expect(typeof lang).toBe('string');
      expect(lang.length).toBeGreaterThan(0);
    });

    it('should detect browser locale', () => {
      const locale = detectBrowserLocale();
      expect(typeof locale).toBe('string');
      expect(locale.length).toBeGreaterThan(1);
    });
  });

  describe('Country Mappings', () => {
    it('should map GCC countries to Arabic', () => {
      expect(COUNTRY_LANGUAGE_MAP['SA']).toBe('ar');
      expect(COUNTRY_LANGUAGE_MAP['AE']).toBe('ar');
      expect(COUNTRY_LANGUAGE_MAP['QA']).toBe('ar');
    });

    it('should map Israel to Hebrew', () => {
      expect(COUNTRY_LANGUAGE_MAP['IL']).toBe('he');
    });

    it('should map countries to correct currencies', () => {
      expect(COUNTRY_CURRENCY_MAP['SA']).toBe('SAR');
      expect(COUNTRY_CURRENCY_MAP['AE']).toBe('AED');
      expect(COUNTRY_CURRENCY_MAP['IL']).toBe('ILS');
    });
  });

  describe('Suggested Settings', () => {
    it('should suggest RTL for Arabic', () => {
      const settings = getSuggestedSettings({
        country: 'Saudi Arabia',
        countryCode: 'SA',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        language: 'ar',
      });
      expect(settings.language).toBe('ar');
      expect(settings.direction).toBe('rtl');
    });

    it('should suggest RTL for Hebrew', () => {
      const settings = getSuggestedSettings({
        country: 'Israel',
        countryCode: 'IL',
        timezone: 'Asia/Jerusalem',
        currency: 'ILS',
        language: 'he',
      });
      expect(settings.direction).toBe('rtl');
    });

    it('should suggest LTR for English', () => {
      const settings = getSuggestedSettings({
        country: 'United States',
        countryCode: 'US',
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
      });
      expect(settings.direction).toBe('ltr');
    });
  });

  describe('Country Access Control', () => {
    it('should allow countries by default', () => {
      const result = isCountryAllowed('SA', {
        autoDetect: true,
        redirectOnDetect: false,
        allowedCountries: [],
        blockedCountries: [],
        privacyMode: 'balanced',
      });
      expect(result).toBe(true);
    });

    it('should block blacklisted countries', () => {
      const result = isCountryAllowed('XX', {
        autoDetect: true,
        redirectOnDetect: false,
        allowedCountries: [],
        blockedCountries: ['XX'],
        privacyMode: 'balanced',
      });
      expect(result).toBe(false);
    });
  });

  describe('Privacy Compliance', () => {
    it('should pass in balanced mode', () => {
      const result = checkPrivacyCompliance(
        { country: 'SA', countryCode: 'SA', timezone: 'Asia/Riyadh', currency: 'SAR', language: 'ar' },
        { autoDetect: true, redirectOnDetect: false, allowedCountries: [], blockedCountries: [], privacyMode: 'balanced' }
      );
      expect(result.compliant).toBe(true);
    });

    it('should fail in strict mode without consent', () => {
      const result = checkPrivacyCompliance(
        { country: 'SA', countryCode: 'SA', timezone: 'Asia/Riyadh', currency: 'SAR', language: 'ar' },
        { autoDetect: true, redirectOnDetect: false, allowedCountries: [], blockedCountries: [], privacyMode: 'strict' }
      );
      expect(result.compliant).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    it('should get language from country code', () => {
      expect(getLanguageFromCountry('SA')).toBe('ar');
      expect(getLanguageFromCountry('IL')).toBe('he');
      expect(getLanguageFromCountry('US')).toBe('en');
    });

    it('should get currency from country code', () => {
      expect(getCurrencyFromCountry('SA')).toBe('SAR');
      expect(getCurrencyFromCountry('AE')).toBe('AED');
    });

    it('should format location', () => {
      const location = {
        country: 'Saudi Arabia',
        countryCode: 'SA',
        city: 'Riyadh',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        language: 'ar',
      };
      const formatted = formatLocation(location);
      expect(formatted).toContain('Riyadh');
      expect(formatted).toContain('Saudi Arabia');
    });
  });
});
