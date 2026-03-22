import { describe, it, expect } from 'vitest';
import {
  detectBot,
  getBotLocale,
  getDefaultBotConfig,
  isSearchEngineBot,
  isSocialMediaBot,
} from '../../app/services/bot-detection/index';

describe('Bot Detection Service', () => {
  describe('detectBot', () => {
    it('detects Googlebot', () => {
      const result = detectBot('Googlebot/2.1');
      expect(result.isBot).toBe(true);
      expect(result.name).toBe('Googlebot');
      expect(result.engine).toBe('google');
    });

    it('detects bingbot', () => {
      const result = detectBot('bingbot/2.0');
      expect(result.isBot).toBe(true);
      expect(result.name).toBe('Bingbot');
      expect(result.engine).toBe('bing');
    });

    it('returns isBot false for regular Chrome user-agent', () => {
      const result = detectBot('Mozilla/5.0 Chrome');
      expect(result.isBot).toBe(false);
      expect(result.name).toBeNull();
      expect(result.engine).toBeNull();
    });

    it('returns isBot false for empty string', () => {
      const result = detectBot('');
      expect(result.isBot).toBe(false);
      expect(result.name).toBeNull();
    });

    it('detects facebookexternalhit', () => {
      const result = detectBot('facebookexternalhit/1.1');
      expect(result.isBot).toBe(true);
      expect(result.name).toBe('Facebook');
      expect(result.engine).toBe('facebook');
    });

    it('detects YandexBot', () => {
      const result = detectBot('Mozilla/5.0 (compatible; YandexBot/3.0)');
      expect(result.isBot).toBe(true);
      expect(result.engine).toBe('yandex');
    });

    it('detects Twitterbot', () => {
      const result = detectBot('Twitterbot/1.0');
      expect(result.isBot).toBe(true);
      expect(result.engine).toBe('twitter');
    });
  });

  describe('isSearchEngineBot', () => {
    it('returns true for google bot', () => {
      const bot = detectBot('Googlebot/2.1');
      expect(isSearchEngineBot(bot)).toBe(true);
    });

    it('returns true for bing bot', () => {
      const bot = detectBot('bingbot/2.0');
      expect(isSearchEngineBot(bot)).toBe(true);
    });

    it('returns false for facebook bot', () => {
      const bot = detectBot('facebookexternalhit/1.1');
      expect(isSearchEngineBot(bot)).toBe(false);
    });

    it('returns false for non-bot', () => {
      const bot = detectBot('Mozilla/5.0 Chrome');
      expect(isSearchEngineBot(bot)).toBe(false);
    });
  });

  describe('isSocialMediaBot', () => {
    it('returns true for facebook bot', () => {
      const bot = detectBot('facebookexternalhit/1.1');
      expect(isSocialMediaBot(bot)).toBe(true);
    });

    it('returns false for google bot', () => {
      const bot = detectBot('Googlebot/2.1');
      expect(isSocialMediaBot(bot)).toBe(false);
    });
  });

  describe('getBotLocale', () => {
    it('returns default locale for bots without override', () => {
      const bot = detectBot('Googlebot/2.1');
      const config = getDefaultBotConfig();
      const locale = getBotLocale(bot, config);
      expect(locale).toBe('en');
    });

    it('returns request locale for non-bots', () => {
      const bot = detectBot('Mozilla/5.0 Chrome');
      const config = getDefaultBotConfig();
      const locale = getBotLocale(bot, config, 'ar');
      expect(locale).toBe('ar');
    });
  });

  describe('getDefaultBotConfig', () => {
    it('returns config with serveLocalizedToBot true', () => {
      const config = getDefaultBotConfig();
      expect(config.serveLocalizedToBot).toBe(true);
      expect(config.defaultLocale).toBe('en');
      expect(config.botLocaleOverrides).toEqual({});
    });
  });
});
