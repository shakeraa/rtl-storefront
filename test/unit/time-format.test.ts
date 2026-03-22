import { describe, it, expect } from 'vitest';
import {
  TIME_FORMAT_PATTERNS,
  getTimeFormatPattern,
  toArabicNumerals,
  fromArabicNumerals,
  containsArabicNumerals,
  convertTo12Hour,
  convertTo24Hour,
  formatTime,
  formatTimeDetailed,
  parseTime,
  getSupportedLocales,
  supports12Hour,
  supports24Hour,
  getDefaultFormat,
  getPeriodSymbols,
  compareTimes,
  isTimeInRange,
  addHours,
  formatRelativeTime,
} from '../../app/services/translation-features/time-format';

describe('Time Format Service - T0315', () => {
  describe('TIME_FORMAT_PATTERNS', () => {
    it('should have patterns for ar locale', () => {
      expect(TIME_FORMAT_PATTERNS['ar']).toBeDefined();
      expect(TIME_FORMAT_PATTERNS['ar'].defaultFormat).toBe('12h');
      expect(TIME_FORMAT_PATTERNS['ar'].amSymbol).toBe('ص');
      expect(TIME_FORMAT_PATTERNS['ar'].pmSymbol).toBe('م');
    });

    it('should have patterns for he locale', () => {
      expect(TIME_FORMAT_PATTERNS['he']).toBeDefined();
      expect(TIME_FORMAT_PATTERNS['he'].defaultFormat).toBe('24h');
      expect(TIME_FORMAT_PATTERNS['he'].amSymbolFull).toBe('לפנה"צ');
      expect(TIME_FORMAT_PATTERNS['he'].pmSymbolFull).toBe('אחה"צ');
    });

    it('should have patterns for en locale', () => {
      expect(TIME_FORMAT_PATTERNS['en']).toBeDefined();
      expect(TIME_FORMAT_PATTERNS['en'].defaultFormat).toBe('12h');
      expect(TIME_FORMAT_PATTERNS['en'].amSymbol).toBe('AM');
      expect(TIME_FORMAT_PATTERNS['en'].pmSymbol).toBe('PM');
    });

    it('should have patterns for en-gb locale with 24h default', () => {
      expect(TIME_FORMAT_PATTERNS['en-gb']).toBeDefined();
      expect(TIME_FORMAT_PATTERNS['en-gb'].defaultFormat).toBe('24h');
    });
  });

  describe('getTimeFormatPattern', () => {
    it('should return exact locale match', () => {
      const pattern = getTimeFormatPattern('ar');
      expect(pattern.locale).toBe('ar');
    });

    it('should return base locale for extended locale', () => {
      const pattern = getTimeFormatPattern('ar-EG');
      expect(pattern.locale).toBe('ar');
    });

    it('should be case insensitive', () => {
      const pattern = getTimeFormatPattern('AR-SA');
      expect(pattern.locale).toBe('ar-sa');
    });

    it('should fallback to English for unknown locale', () => {
      const pattern = getTimeFormatPattern('xx');
      expect(pattern.locale).toBe('en');
    });

    it('should return ar-sa for Saudi Arabia', () => {
      const pattern = getTimeFormatPattern('ar-sa');
      expect(pattern.nativeName).toBe('العربية (السعودية)');
    });
  });

  describe('Arabic Numerals', () => {
    it('should convert Western numerals to Arabic-Indic', () => {
      expect(toArabicNumerals('123')).toBe('١٢٣');
      expect(toArabicNumerals('09:30')).toBe('٠٩:٣٠');
    });

    it('should convert Arabic-Indic numerals to Western', () => {
      expect(fromArabicNumerals('١٢٣')).toBe('123');
      expect(fromArabicNumerals('٠٩:٣٠')).toBe('09:30');
    });

    it('should convert numbers to Arabic-Indic', () => {
      expect(toArabicNumerals(456)).toBe('٤٥٦');
    });

    it('should detect Arabic numerals in string', () => {
      expect(containsArabicNumerals('الساعة ٣:٣٠')).toBe(true);
      expect(containsArabicNumerals('3:30 PM')).toBe(false);
    });

    it('should handle mixed content', () => {
      const mixed = 'Time: 12:30 ص';
      const converted = toArabicNumerals(mixed);
      expect(converted).toBe('Time: ١٢:٣٠ ص');
    });
  });

  describe('convertTo12Hour', () => {
    it('should convert 14:30 to 2:30 PM', () => {
      const result = convertTo12Hour(14, 30);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
      expect(result.period).toBe('PM');
    });

    it('should convert 00:00 to 12:00 AM', () => {
      const result = convertTo12Hour(0, 0);
      expect(result.hours).toBe(12);
      expect(result.minutes).toBe(0);
      expect(result.period).toBe('AM');
    });

    it('should convert 12:00 to 12:00 PM', () => {
      const result = convertTo12Hour(12, 0);
      expect(result.hours).toBe(12);
      expect(result.period).toBe('PM');
    });

    it('should handle seconds', () => {
      const result = convertTo12Hour(14, 30, 45);
      expect(result.seconds).toBe(45);
    });

    it('should convert morning hours correctly', () => {
      const result = convertTo12Hour(9, 15);
      expect(result.hours).toBe(9);
      expect(result.period).toBe('AM');
    });
  });

  describe('convertTo24Hour', () => {
    it('should convert 2:30 PM to 14:30', () => {
      const result = convertTo24Hour(2, 30, 'PM');
      expect(result.hours).toBe(14);
      expect(result.minutes).toBe(30);
    });

    it('should convert 12:00 AM to 00:00', () => {
      const result = convertTo24Hour(12, 0, 'AM');
      expect(result.hours).toBe(0);
    });

    it('should convert 12:00 PM to 12:00', () => {
      const result = convertTo24Hour(12, 0, 'PM');
      expect(result.hours).toBe(12);
    });

    it('should convert 9:15 AM to 09:15', () => {
      const result = convertTo24Hour(9, 15, 'AM');
      expect(result.hours).toBe(9);
    });

    it('should handle seconds', () => {
      const result = convertTo24Hour(2, 30, 'PM', 45);
      expect(result.seconds).toBe(45);
    });
  });

  describe('formatTime', () => {
    const testDate = new Date(2024, 0, 1, 14, 30, 0);

    it('should format time in 12h for Arabic locale', () => {
      const formatted = formatTime(testDate, 'ar');
      expect(formatted).toContain('م'); // PM symbol
      expect(formatted).toContain(':');
    });

    it('should format time in 24h for Hebrew locale (default)', () => {
      const formatted = formatTime(testDate, 'he');
      expect(formatted).toBe('14:30');
    });

    it('should format time in 12h for English locale', () => {
      const formatted = formatTime(testDate, 'en');
      expect(formatted).toBe('2:30 PM');
    });

    it('should support forced 24h format', () => {
      const formatted = formatTime(testDate, 'en', { format: '24h' });
      expect(formatted).toBe('14:30');
    });

    it('should support forced 12h format', () => {
      const formatted = formatTime(testDate, 'he', { format: '12h' });
      expect(formatted).toContain('PM');
    });

    it('should include seconds when requested', () => {
      const formatted = formatTime(testDate, 'en', { includeSeconds: true });
      expect(formatted).toContain(':00');
    });

    it('should use Arabic numerals for Arabic locale', () => {
      const formatted = formatTime(testDate, 'ar');
      expect(containsArabicNumerals(formatted)).toBe(true);
    });

    it('should use full period when requested', () => {
      const formatted = formatTime(testDate, 'ar', { useFullPeriod: true });
      expect(formatted).toContain('مساءً');
    });

    it('should pad hours when requested', () => {
      const morningDate = new Date(2024, 0, 1, 9, 5, 0);
      const formatted = formatTime(morningDate, 'en', { padHours: true });
      expect(formatted).toBe('09:05 AM');
    });
  });

  describe('formatTimeDetailed', () => {
    const testDate = new Date(2024, 0, 1, 14, 30, 45);

    it('should return structured 12h data', () => {
      const result = formatTimeDetailed(testDate, 'en', { format: '12h' });
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(45);
      expect(result.period).toBe('PM');
    });

    it('should return structured 24h data', () => {
      const result = formatTimeDetailed(testDate, 'en', { format: '24h' });
      expect(result.hours).toBe(14);
      expect(result.minutes).toBe(30);
      expect(result.formatted).toBe('14:30');
      expect(result.period).toBeUndefined();
    });

    it('should include period in formattedWithPeriod for 12h', () => {
      const result = formatTimeDetailed(testDate, 'en', { format: '12h', includeSeconds: true });
      expect(result.formattedWithPeriod).toBe('2:30:45 PM');
    });
  });

  describe('parseTime', () => {
    it('should parse 24h format', () => {
      const result = parseTime('14:30');
      expect(result).not.toBeNull();
      expect(result!.hours).toBe(14);
      expect(result!.minutes).toBe(30);
    });

    it('should parse 12h format with AM', () => {
      const result = parseTime('9:30 AM');
      expect(result).not.toBeNull();
      expect(result!.hours).toBe(9);
      expect(result!.period).toBe('AM');
    });

    it('should parse 12h format with PM', () => {
      const result = parseTime('2:30 PM');
      expect(result).not.toBeNull();
      expect(result!.hours).toBe(2);
      expect(result!.period).toBe('PM');
    });

    it('should parse time with seconds', () => {
      const result = parseTime('14:30:45');
      expect(result).not.toBeNull();
      expect(result!.seconds).toBe(45);
    });

    it('should parse Arabic AM/PM symbols', () => {
      const result = parseTime('٢:٣٠ م');
      expect(result).not.toBeNull();
      expect(result!.period).toBe('PM');
    });

    it('should parse Arabic full period', () => {
      const result = parseTime('2:30 صباحاً');
      expect(result).not.toBeNull();
      expect(result!.period).toBe('AM');
    });

    it('should return null for invalid time', () => {
      const result = parseTime('invalid');
      expect(result).toBeNull();
    });

    it('should handle lowercase periods', () => {
      const result = parseTime('2:30 pm');
      expect(result).not.toBeNull();
      expect(result!.period).toBe('PM');
    });
  });

  describe('getSupportedLocales', () => {
    it('should return array of supported locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
      expect(locales.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('supports12Hour', () => {
    it('should return true for Arabic', () => {
      expect(supports12Hour('ar')).toBe(true);
    });

    it('should return true for English', () => {
      expect(supports12Hour('en')).toBe(true);
    });

    it('should return true for Hebrew', () => {
      expect(supports12Hour('he')).toBe(true);
    });
  });

  describe('supports24Hour', () => {
    it('should return true for Arabic', () => {
      expect(supports24Hour('ar')).toBe(true);
    });

    it('should return true for English', () => {
      expect(supports24Hour('en')).toBe(true);
    });

    it('should return true for Hebrew', () => {
      expect(supports24Hour('he')).toBe(true);
    });
  });

  describe('getDefaultFormat', () => {
    it('should return 12h for Arabic', () => {
      expect(getDefaultFormat('ar')).toBe('12h');
    });

    it('should return 24h for Hebrew', () => {
      expect(getDefaultFormat('he')).toBe('24h');
    });

    it('should return 12h for English (US)', () => {
      expect(getDefaultFormat('en')).toBe('12h');
    });

    it('should return 24h for English (UK)', () => {
      expect(getDefaultFormat('en-gb')).toBe('24h');
    });
  });

  describe('getPeriodSymbols', () => {
    it('should return Arabic period symbols', () => {
      const symbols = getPeriodSymbols('ar');
      expect(symbols.am).toBe('ص');
      expect(symbols.pm).toBe('م');
    });

    it('should return full Arabic period symbols', () => {
      const symbols = getPeriodSymbols('ar', true);
      expect(symbols.am).toBe('صباحاً');
      expect(symbols.pm).toBe('مساءً');
    });

    it('should return Hebrew period symbols', () => {
      const symbols = getPeriodSymbols('he');
      expect(symbols.am).toBe('AM');
      expect(symbols.pm).toBe('PM');
    });

    it('should return full Hebrew period symbols', () => {
      const symbols = getPeriodSymbols('he', true);
      expect(symbols.am).toBe('לפנה"צ');
      expect(symbols.pm).toBe('אחה"צ');
    });
  });

  describe('compareTimes', () => {
    it('should return 0 for equal times', () => {
      const result = compareTimes({ hours: 14, minutes: 30 }, { hours: 14, minutes: 30 });
      expect(result).toBe(0);
    });

    it('should return positive when first time is later', () => {
      const result = compareTimes({ hours: 15, minutes: 0 }, { hours: 14, minutes: 30 });
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative when first time is earlier', () => {
      const result = compareTimes({ hours: 9, minutes: 0 }, { hours: 14, minutes: 30 });
      expect(result).toBeLessThan(0);
    });

    it('should handle 12h format comparison', () => {
      const result = compareTimes(
        { hours: 2, minutes: 30, period: 'PM' },
        { hours: 9, minutes: 0, period: 'AM' }
      );
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('isTimeInRange', () => {
    it('should return true for time within range', () => {
      const result = isTimeInRange(
        { hours: 14, minutes: 0 },
        { hours: 9, minutes: 0 },
        { hours: 17, minutes: 0 }
      );
      expect(result).toBe(true);
    });

    it('should return false for time before range', () => {
      const result = isTimeInRange(
        { hours: 8, minutes: 0 },
        { hours: 9, minutes: 0 },
        { hours: 17, minutes: 0 }
      );
      expect(result).toBe(false);
    });

    it('should return false for time after range', () => {
      const result = isTimeInRange(
        { hours: 18, minutes: 0 },
        { hours: 9, minutes: 0 },
        { hours: 17, minutes: 0 }
      );
      expect(result).toBe(false);
    });

    it('should handle 12h format ranges', () => {
      const result = isTimeInRange(
        { hours: 2, minutes: 0, period: 'PM' },
        { hours: 9, minutes: 0, period: 'AM' },
        { hours: 5, minutes: 0, period: 'PM' }
      );
      expect(result).toBe(true);
    });
  });

  describe('addHours', () => {
    it('should add hours to time', () => {
      const result = addHours(14, 30, 0, 2);
      expect(result.hours).toBe(16);
      expect(result.minutes).toBe(30);
    });

    it('should handle day overflow', () => {
      const result = addHours(23, 0, 0, 3);
      expect(result.hours).toBe(2);
      expect(result.dayOffset).toBe(1);
    });

    it('should handle negative hours', () => {
      const result = addHours(2, 0, 0, -3);
      expect(result.hours).toBe(23);
      expect(result.dayOffset).toBe(-1);
    });

    it('should preserve minutes and seconds', () => {
      const result = addHours(10, 30, 45, 5);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(45);
    });
  });

  describe('formatRelativeTime', () => {
    it('should format future time in Arabic', () => {
      const result = formatRelativeTime(90, 'ar');
      expect(result).toContain('بعد');
      expect(result).toContain('ساعة');
    });

    it('should format past time in Arabic', () => {
      const result = formatRelativeTime(-120, 'ar');
      expect(result).toContain('منذ');
      expect(result).toContain('ساعة');
    });

    it('should format future time in Hebrew', () => {
      const result = formatRelativeTime(60, 'he');
      expect(result).toContain('בעוד');
      expect(result).toContain('שעות');
    });

    it('should format past time in Hebrew', () => {
      const result = formatRelativeTime(-30, 'he');
      expect(result).toContain('לפני');
      expect(result).toContain('דקות');
    });

    it('should format future time in English', () => {
      const result = formatRelativeTime(90, 'en');
      expect(result).toBe('in 1 hour and 30 minutes');
    });

    it('should format past time in English', () => {
      const result = formatRelativeTime(-45, 'en');
      expect(result).toBe('45 minutes ago');
    });

    it('should handle single hour in English', () => {
      const result = formatRelativeTime(60, 'en');
      expect(result).toBe('in 1 hour');
    });

    it('should use Arabic numerals in Arabic output', () => {
      const result = formatRelativeTime(120, 'ar');
      expect(containsArabicNumerals(result)).toBe(true);
    });
  });
});
