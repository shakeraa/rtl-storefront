import { describe, it, expect } from 'vitest';
import {
  COUNTRY_LANGUAGE_MAP,
  COUNTRY_CURRENCY_MAP,
  MENA_COUNTRIES,
  getSuggestedSettings,
  isCountryAllowed,
} from '../../app/services/geolocation/index';

describe('Geolocation Service', () => {
  describe('Country Mappings', () => {
    it('should map GCC countries to Arabic', () => {
      expect(COUNTRY_LANGUAGE_MAP['SA']).toBe('ar');
      expect(COUNTRY_LANGUAGE_MAP['AE']).toBe('ar');
      expect(COUNTRY_LANGUAGE_MAP['QA']).toBe('ar');
      expect(COUNTRY_LANGUAGE_MAP['KW']).toBe('ar');
    });

    it('should map Israel to Hebrew', () => {
      expect(COUNTRY_LANGUAGE_MAP['IL']).toBe('he');
    });

    it('should map Iran to Persian', () => {
      expect(COUNTRY_LANGUAGE_MAP['IR']).toBe('fa');
    });

    it('should map countries to correct currencies', () => {
      expect(COUNTRY_CURRENCY_MAP['SA']).toBe('SAR');
      expect(COUNTRY_CURRENCY_MAP['AE']).toBe('AED');
      expect(COUNTRY_CURRENCY_MAP['KW']).toBe('KWD');
      expect(COUNTRY_CURRENCY_MAP['IL']).toBe('ILS');
    });
  });

  describe('MENA Countries', () => {
    it('should include all GCC countries', () => {
      expect(MENA_COUNTRIES).toContain('SA');
      expect(MENA_COUNTRIES).toContain('AE');
      expect(MENA_COUNTRIES).toContain('QA');
      expect(MENA_COUNTRIES).toContain('KW');
      expect(MENA_COUNTRIES).toContain('BH');
      expect(MENA_COUNTRIES).toContain('OM');
    });
  });

  describe('Suggested Settings', () => {
    it('should suggest Arabic for Saudi Arabia', () => {
      const location = {
        country: 'Saudi Arabia',
        countryCode: 'SA',
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        language: 'ar',
      };
      
      const settings = getSuggestedSettings(location);
      expect(settings.language).toBe('ar');
      expect(settings.currency).toBe('SAR');
      expect(settings.direction).toBe('rtl');
    });

    it('should suggest RTL for Hebrew', () => {
      const location = {
        country: 'Israel',
        countryCode: 'IL',
        timezone: 'Asia/Jerusalem',
        currency: 'ILS',
        language: 'he',
      };
      
      const settings = getSuggestedSettings(location);
      expect(settings.direction).toBe('rtl');
    });
  });

  describe('Country Access Control', () => {
    it('should allow countries by default', () => {
      const result = isCountryAllowed('SA', {
        autoDetect: true,
        redirectOnDetect: false,
        allowedCountries: [],
        blockedCountries: [],
      });
      expect(result).toBe(true);
    });

    it('should block blacklisted countries', () => {
      const result = isCountryAllowed('XX', {
        autoDetect: true,
        redirectOnDetect: false,
        allowedCountries: [],
        blockedCountries: ['XX'],
      });
      expect(result).toBe(false);
    });

    it('should only allow whitelisted countries when whitelist exists', () => {
      const config = {
        autoDetect: true,
        redirectOnDetect: false,
        allowedCountries: ['SA', 'AE'],
        blockedCountries: [],
      };
      
      expect(isCountryAllowed('SA', config)).toBe(true);
      expect(isCountryAllowed('US', config)).toBe(false);
    });
  });
});
