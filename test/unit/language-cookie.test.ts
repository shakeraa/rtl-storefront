import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildLanguageCookie,
  parseLanguageCookie,
  buildClearCookie,
  getDefaultConfig,
  setLanguageCookie,
  getLanguageCookie,
  clearLanguageCookie,
  parseLanguagePreference,
  setLanguageCookieHeaders,
  getLanguageFromRequest,
  hasCookieConsent,
  setLanguageCookieGDPR,
  getCookieExpirationDate,
  type LanguageCookieConfig,
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

    it('includes HttpOnly when configured', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), httpOnly: true };
      const cookie = buildLanguageCookie('ar', config);
      expect(cookie).toContain('HttpOnly');
    });

    it('uses SameSite=Strict when configured', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), sameSite: 'strict' };
      const cookie = buildLanguageCookie('ar', config);
      expect(cookie).toContain('SameSite=Strict');
    });

    it('uses SameSite=None when configured', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), sameSite: 'none' };
      const cookie = buildLanguageCookie('ar', config);
      expect(cookie).toContain('SameSite=None');
    });

    it('includes Domain when configured', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), domain: '.example.com' };
      const cookie = buildLanguageCookie('ar', config);
      expect(cookie).toContain('Domain=.example.com');
    });

    it('calculates Max-Age correctly for 365 days', () => {
      const cookie = buildLanguageCookie('ar');
      const expectedMaxAge = 365 * 24 * 60 * 60;
      expect(cookie).toContain(`Max-Age=${expectedMaxAge}`);
    });

    it('normalizes underscores to hyphens in locale', () => {
      const cookie = buildLanguageCookie('en_US');
      expect(cookie).toContain('rtl_lang=en-US');
    });

    it('trims whitespace from locale', () => {
      const cookie = buildLanguageCookie('  ar  ');
      expect(cookie).toContain('rtl_lang=ar');
    });

    it('encodes special characters in locale', () => {
      const cookie = buildLanguageCookie('test+value');
      expect(cookie).toContain(encodeURIComponent('test+value'));
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

    it('normalizes underscore to hyphen in parsed locale', () => {
      const result = parseLanguageCookie('rtl_lang=en_US');
      expect(result.locale).toBe('en-US');
      expect(result.isValid).toBe(true);
    });

    it('trims whitespace from parsed locale', () => {
      const result = parseLanguageCookie('rtl_lang=  ar  ');
      expect(result.locale).toBe('ar');
      expect(result.isValid).toBe(true);
    });

    it('decodes URL-encoded locale values', () => {
      const result = parseLanguageCookie(`rtl_lang=${encodeURIComponent('en-US')}`);
      expect(result.locale).toBe('en-US');
      expect(result.isValid).toBe(true);
    });

    it('handles empty string input', () => {
      const result = parseLanguageCookie('');
      expect(result.locale).toBeNull();
      expect(result.isValid).toBe(false);
    });

    it('handles cookie with custom name', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), name: 'custom_lang' };
      const result = parseLanguageCookie('custom_lang=fr', config);
      expect(result.locale).toBe('fr');
      expect(result.isValid).toBe(true);
    });
  });

  describe('buildClearCookie', () => {
    it('contains Max-Age=0 to expire the cookie', () => {
      const cookie = buildClearCookie();
      expect(cookie).toContain('Max-Age=0');
      expect(cookie).toContain('rtl_lang=');
    });

    it('includes Path in clear cookie', () => {
      const cookie = buildClearCookie();
      expect(cookie).toContain('Path=/');
    });

    it('includes Secure in clear cookie when configured', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), secure: true };
      const cookie = buildClearCookie(config);
      expect(cookie).toContain('Secure');
    });

    it('includes Domain when configured', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), domain: '.example.com' };
      const cookie = buildClearCookie(config);
      expect(cookie).toContain('Domain=.example.com');
    });

    it('includes SameSite in clear cookie', () => {
      const cookie = buildClearCookie();
      expect(cookie).toContain('SameSite=Lax');
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

    it('returns httpOnly as false by default', () => {
      const config = getDefaultConfig();
      expect(config.httpOnly).toBe(false);
    });

    it('returns immutable copy of config', () => {
      const config1 = getDefaultConfig();
      const config2 = getDefaultConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });

    it('returns gdprCompliant as true by default', () => {
      const config = getDefaultConfig();
      expect(config.gdprCompliant).toBe(true);
    });
  });

  describe('setLanguageCookie', () => {
    let cookieValue = '';
    let cookieSetter: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      cookieValue = '';
      cookieSetter = vi.fn((value: string) => {
        cookieValue = value;
      });
      
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get: () => cookieValue,
        set: cookieSetter,
      });
    });

    afterEach(() => {
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        writable: true,
        value: '',
      });
    });

    it('throws error in non-browser environment', () => {
      const originalDocument = global.document;
      // @ts-expect-error - testing non-browser environment
      global.document = undefined;
      
      expect(() => setLanguageCookie('ar')).toThrow('setLanguageCookie can only be called in browser environment');
      
      global.document = originalDocument;
    });

    it('sets cookie with locale value', () => {
      setLanguageCookie('ar');
      expect(cookieSetter).toHaveBeenCalled();
      expect(cookieSetter.mock.calls[0][0]).toContain('rtl_lang=ar');
    });

    it('throws error for invalid locale format', () => {
      expect(() => setLanguageCookie('invalid!!!')).toThrow('Invalid locale format');
    });

    it('accepts custom maxAgeDays option', () => {
      setLanguageCookie('ar', { maxAgeDays: 30 });
      const expectedMaxAge = 30 * 24 * 60 * 60;
      expect(cookieSetter.mock.calls[0][0]).toContain(`Max-Age=${expectedMaxAge}`);
    });

    it('accepts custom secure option', () => {
      setLanguageCookie('ar', { secure: false });
      expect(cookieSetter.mock.calls[0][0]).not.toContain('Secure');
    });

    it('accepts custom httpOnly option', () => {
      setLanguageCookie('ar', { httpOnly: true });
      expect(cookieSetter.mock.calls[0][0]).toContain('HttpOnly');
    });

    it('accepts custom sameSite option', () => {
      setLanguageCookie('ar', { sameSite: 'strict' });
      expect(cookieSetter.mock.calls[0][0]).toContain('SameSite=Strict');
    });

    it('accepts custom path option', () => {
      setLanguageCookie('ar', { path: '/app' });
      expect(cookieSetter.mock.calls[0][0]).toContain('Path=/app');
    });

    it('accepts custom domain option', () => {
      setLanguageCookie('ar', { domain: '.example.com' });
      expect(cookieSetter.mock.calls[0][0]).toContain('Domain=.example.com');
    });

    it('accepts expires date option', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setLanguageCookie('ar', { expires: futureDate });
      expect(cookieSetter.mock.calls[0][0]).toContain('Max-Age=');
    });
  });

  describe('getLanguageCookie', () => {
    it('returns null in non-browser environment', () => {
      const originalDocument = global.document;
      // @ts-expect-error - testing non-browser environment
      global.document = undefined;
      
      expect(getLanguageCookie()).toBeNull();
      
      global.document = originalDocument;
    });

    it('returns locale from existing cookie', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'rtl_lang=ar; other=value',
      });
      expect(getLanguageCookie()).toBe('ar');
    });

    it('returns null when cookie does not exist', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'other=value',
      });
      expect(getLanguageCookie()).toBeNull();
    });

    it('returns null for invalid locale in cookie', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'rtl_lang=invalid!!!',
      });
      expect(getLanguageCookie()).toBeNull();
    });

    it('returns locale with custom cookie name', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'custom_lang=fr; rtl_lang=ar',
      });
      expect(getLanguageCookie({ name: 'custom_lang' })).toBe('fr');
    });

    it('normalizes underscores to hyphens', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'rtl_lang=en_US',
      });
      expect(getLanguageCookie()).toBe('en-US');
    });
  });

  describe('clearLanguageCookie', () => {
    let cookieValue = '';
    let cookieSetter: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      cookieValue = '';
      cookieSetter = vi.fn((value: string) => {
        cookieValue = value;
      });
      
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get: () => cookieValue,
        set: cookieSetter,
      });
    });

    afterEach(() => {
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        writable: true,
        value: '',
      });
    });

    it('throws error in non-browser environment', () => {
      const originalDocument = global.document;
      // @ts-expect-error - testing non-browser environment
      global.document = undefined;
      
      expect(() => clearLanguageCookie()).toThrow('clearLanguageCookie can only be called in browser environment');
      
      global.document = originalDocument;
    });

    it('sets Max-Age=0 to clear cookie', () => {
      clearLanguageCookie();
      expect(cookieSetter).toHaveBeenCalled();
      expect(cookieSetter.mock.calls[0][0]).toContain('Max-Age=0');
    });

    it('clears cookie with custom name', () => {
      clearLanguageCookie({ name: 'custom_lang' });
      expect(cookieSetter.mock.calls[0][0]).toContain('custom_lang=');
    });

    it('includes Secure when configured', () => {
      clearLanguageCookie({ secure: true });
      expect(cookieSetter.mock.calls[0][0]).toContain('Secure');
    });
  });

  describe('parseLanguagePreference', () => {
    it('returns normalized locale for valid 2-letter code', () => {
      expect(parseLanguagePreference('ar')).toBe('ar');
    });

    it('returns normalized locale for valid locale with region', () => {
      expect(parseLanguagePreference('en-US')).toBe('en-US');
    });

    it('normalizes underscores to hyphens', () => {
      expect(parseLanguagePreference('en_US')).toBe('en-US');
    });

    it('trims whitespace from input', () => {
      expect(parseLanguagePreference('  ar  ')).toBe('ar');
    });

    it('returns null for null input', () => {
      expect(parseLanguagePreference(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(parseLanguagePreference(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(parseLanguagePreference('')).toBeNull();
    });

    it('returns null for invalid format', () => {
      expect(parseLanguagePreference('invalid!!!')).toBeNull();
    });

    it('returns null for non-string input', () => {
      expect(parseLanguagePreference(123 as unknown as string)).toBeNull();
    });

    it('returns null for too long locale code', () => {
      expect(parseLanguagePreference('toolong')).toBeNull();
    });
  });

  describe('setLanguageCookieHeaders', () => {
    it('returns Headers with Set-Cookie', () => {
      const headers = setLanguageCookieHeaders('ar');
      expect(headers.get('Set-Cookie')).toContain('rtl_lang=ar');
    });

    it('applies custom config to headers', () => {
      const config: LanguageCookieConfig = { ...getDefaultConfig(), httpOnly: true };
      const headers = setLanguageCookieHeaders('ar', config);
      expect(headers.get('Set-Cookie')).toContain('HttpOnly');
    });
  });

  describe('getLanguageFromRequest', () => {
    it('extracts locale from request cookies', () => {
      const request = new Request('http://example.com', {
        headers: { Cookie: 'rtl_lang=ar' },
      });
      expect(getLanguageFromRequest(request)).toBe('ar');
    });

    it('returns null when no cookie in request', () => {
      const request = new Request('http://example.com');
      expect(getLanguageFromRequest(request)).toBeNull();
    });

    it('returns null for invalid locale in request', () => {
      const request = new Request('http://example.com', {
        headers: { Cookie: 'rtl_lang=invalid' },
      });
      expect(getLanguageFromRequest(request)).toBeNull();
    });
  });

  describe('hasCookieConsent', () => {
    it('returns false in non-browser environment', () => {
      const originalDocument = global.document;
      // @ts-expect-error - testing non-browser environment
      global.document = undefined;
      
      expect(hasCookieConsent()).toBe(false);
      
      global.document = originalDocument;
    });

    it('returns true when cookie_consent cookie exists', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'cookie_consent=true',
      });
      expect(hasCookieConsent()).toBe(true);
    });

    it('returns true when gdpr_consent cookie exists', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'gdpr_consent=yes',
      });
      expect(hasCookieConsent()).toBe(true);
    });

    it('returns false when no consent cookie exists', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'other=value',
      });
      expect(hasCookieConsent()).toBe(false);
    });

    it('returns true for rtl_cookie_consent', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'rtl_cookie_consent=1',
      });
      expect(hasCookieConsent()).toBe(true);
    });
  });

  describe('setLanguageCookieGDPR', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });
    });

    it('sets cookie when consent exists', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'cookie_consent=true',
      });
      const result = setLanguageCookieGDPR('ar');
      expect(result.success).toBe(true);
    });

    it('returns failure when consent required but not present', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });
      const result = setLanguageCookieGDPR('ar', { requireConsent: true });
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Cookie consent required');
    });

    it('sets cookie when requireConsent is false', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });
      const result = setLanguageCookieGDPR('ar', { requireConsent: false });
      expect(result.success).toBe(true);
    });

    it('returns failure with error message on exception', () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'cookie_consent=true',
      });
      const result = setLanguageCookieGDPR('invalid!!!', { requireConsent: false });
      expect(result.success).toBe(false);
      expect(result.reason).toContain('Invalid locale format');
    });
  });

  describe('getCookieExpirationDate', () => {
    it('returns date in the future', () => {
      const now = new Date();
      const future = getCookieExpirationDate(7);
      expect(future.getTime()).toBeGreaterThan(now.getTime());
    });

    it('returns correct date for 365 days', () => {
      const before = new Date();
      const result = getCookieExpirationDate(365);
      const after = new Date();
      
      const expectedBefore = new Date(before);
      expectedBefore.setDate(before.getDate() + 365);
      
      const expectedAfter = new Date(after);
      expectedAfter.setDate(after.getDate() + 365);
      
      expect(result.getTime()).toBeGreaterThanOrEqual(expectedBefore.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(expectedAfter.getTime());
    });

    it('returns past date for negative days', () => {
      const now = new Date();
      const past = getCookieExpirationDate(-1);
      expect(past.getTime()).toBeLessThan(now.getTime());
    });

    it('returns same date for 0 days', () => {
      const today = getCookieExpirationDate(0);
      const now = new Date();
      expect(today.getDate()).toBe(now.getDate());
    });
  });
});
