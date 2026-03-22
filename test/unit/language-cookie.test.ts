import { describe, it, expect } from 'vitest';
import {
  buildLanguageCookie,
  parseLanguageCookie,
  buildClearCookie,
  getDefaultConfig,
} from '../../app/services/language-cookie/index';

describe('Language Cookie Service', () => {
  describe('buildLanguageCookie', () => {
    it('builds cookie for "ar" with correct name, Max-Age, Secure, SameSite', () => {
      const cookie = buildLanguageCookie('ar');
      expect(cookie).toContain('rtl_lang=ar');
      expect(cookie).toContain('Max-Age=');
      expect(cookie).toContain('Secure');
      expect(cookie).toContain('SameSite=Lax');
    });

    it('builds cookie for "he" with locale value', () => {
      const cookie = buildLanguageCookie('he');
      expect(cookie).toContain('rtl_lang=he');
    });

    it('includes Path=/', () => {
      const cookie = buildLanguageCookie('ar');
      expect(cookie).toContain('Path=/');
    });

    it('does not include HttpOnly by default', () => {
      const cookie = buildLanguageCookie('ar');
      expect(cookie).not.toContain('HttpOnly');
    });
  });

  describe('parseLanguageCookie', () => {
    it('parses "rtl_lang=ar; other=value" and returns locale "ar", isValid true', () => {
      const result = parseLanguageCookie('rtl_lang=ar; other=value');
      expect(result.locale).toBe('ar');
      expect(result.isValid).toBe(true);
    });

    it('returns null locale and isValid false for null input', () => {
      const result = parseLanguageCookie(null);
      expect(result.locale).toBeNull();
      expect(result.isValid).toBe(false);
    });

    it('returns no match when cookie name is absent', () => {
      const result = parseLanguageCookie('other=value');
      expect(result.locale).toBeNull();
      expect(result.isValid).toBe(false);
    });

    it('returns isValid false for invalid locale pattern', () => {
      const result = parseLanguageCookie('rtl_lang=invalid!!!');
      expect(result.isValid).toBe(false);
      expect(result.locale).toBeNull();
    });

    it('parses locale with region subtag like en-US', () => {
      const result = parseLanguageCookie('rtl_lang=en-US');
      expect(result.locale).toBe('en-US');
      expect(result.isValid).toBe(true);
    });
  });

  describe('buildClearCookie', () => {
    it('contains Max-Age=0 to expire the cookie', () => {
      const cookie = buildClearCookie();
      expect(cookie).toContain('Max-Age=0');
      expect(cookie).toContain('rtl_lang=');
    });
  });

  describe('getDefaultConfig', () => {
    it('returns name "rtl_lang" and maxAgeDays 365', () => {
      const config = getDefaultConfig();
      expect(config.name).toBe('rtl_lang');
      expect(config.maxAgeDays).toBe(365);
      expect(config.secure).toBe(true);
      expect(config.sameSite).toBe('lax');
    });
  });
});
