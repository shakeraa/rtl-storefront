/**
 * Time Format Localization Service
 * Handles 12h/24h formats, AM/PM localization, and Arabic numerals
 * Supports: ar (Arabic), he (Hebrew), en (English)
 */

// Time format patterns for different locales
export const TIME_FORMAT_PATTERNS: Record<string, TimeFormatPattern> = {
  ar: {
    locale: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    defaultFormat: '12h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'ص',
    pmSymbol: 'م',
    amSymbolFull: 'صباحاً',
    pmSymbolFull: 'مساءً',
    separator: ':',
    usesArabicNumerals: true,
  },
  'ar-sa': {
    locale: 'ar-sa',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (السعودية)',
    defaultFormat: '12h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'ص',
    pmSymbol: 'م',
    amSymbolFull: 'صباحاً',
    pmSymbolFull: 'مساءً',
    separator: ':',
    usesArabicNumerals: true,
  },
  'ar-ae': {
    locale: 'ar-ae',
    name: 'Arabic (UAE)',
    nativeName: 'العربية (الإمارات)',
    defaultFormat: '12h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'ص',
    pmSymbol: 'م',
    amSymbolFull: 'صباحاً',
    pmSymbolFull: 'مساءً',
    separator: ':',
    usesArabicNumerals: true,
  },
  he: {
    locale: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    defaultFormat: '24h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'AM',
    pmSymbol: 'PM',
    amSymbolFull: 'לפנה"צ',
    pmSymbolFull: 'אחה"צ',
    separator: ':',
    usesArabicNumerals: false,
  },
  'he-il': {
    locale: 'he-il',
    name: 'Hebrew (Israel)',
    nativeName: 'עברית (ישראל)',
    defaultFormat: '24h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'AM',
    pmSymbol: 'PM',
    amSymbolFull: 'לפנה"צ',
    pmSymbolFull: 'אחה"צ',
    separator: ':',
    usesArabicNumerals: false,
  },
  en: {
    locale: 'en',
    name: 'English',
    nativeName: 'English',
    defaultFormat: '12h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'AM',
    pmSymbol: 'PM',
    amSymbolFull: 'AM',
    pmSymbolFull: 'PM',
    separator: ':',
    usesArabicNumerals: false,
  },
  'en-us': {
    locale: 'en-us',
    name: 'English (US)',
    nativeName: 'English (US)',
    defaultFormat: '12h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'AM',
    pmSymbol: 'PM',
    amSymbolFull: 'AM',
    pmSymbolFull: 'PM',
    separator: ':',
    usesArabicNumerals: false,
  },
  'en-gb': {
    locale: 'en-gb',
    name: 'English (UK)',
    nativeName: 'English (UK)',
    defaultFormat: '24h',
    supports24h: true,
    supports12h: true,
    amSymbol: 'am',
    pmSymbol: 'pm',
    amSymbolFull: 'am',
    pmSymbolFull: 'pm',
    separator: ':',
    usesArabicNumerals: false,
  },
};

// Arabic-Indic numerals mapping (Eastern Arabic numerals)
const ARABIC_NUMERALS: Record<string, string> = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

// Eastern Arabic to Western numerals (for parsing)
const WESTERN_NUMERALS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

export interface TimeFormatPattern {
  locale: string;
  name: string;
  nativeName: string;
  defaultFormat: '12h' | '24h';
  supports24h: boolean;
  supports12h: boolean;
  amSymbol: string;
  pmSymbol: string;
  amSymbolFull: string;
  pmSymbolFull: string;
  separator: string;
  usesArabicNumerals: boolean;
}

export interface TimeFormatOptions {
  format?: '12h' | '24h';
  useFullPeriod?: boolean;
  includeSeconds?: boolean;
  useArabicNumerals?: boolean;
  padHours?: boolean;
}

export interface FormattedTime {
  hours: number;
  minutes: number;
  seconds: number;
  period?: 'AM' | 'PM';
  formatted: string;
  formattedWithPeriod?: string;
}

/**
 * Get time format pattern for a locale
 */
export function getTimeFormatPattern(locale: string): TimeFormatPattern {
  const normalizedLocale = locale.toLowerCase();
  
  // Try exact match first
  if (TIME_FORMAT_PATTERNS[normalizedLocale]) {
    return TIME_FORMAT_PATTERNS[normalizedLocale];
  }
  
  // Try base locale (e.g., 'ar' from 'ar-eg')
  const baseLocale = normalizedLocale.split('-')[0];
  if (TIME_FORMAT_PATTERNS[baseLocale]) {
    return TIME_FORMAT_PATTERNS[baseLocale];
  }
  
  // Fallback to English
  return TIME_FORMAT_PATTERNS['en'];
}

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
export function toArabicNumerals(value: string | number): string {
  const str = String(value);
  return str.replace(/[0-9]/g, (digit) => ARABIC_NUMERALS[digit] || digit);
}

/**
 * Convert Arabic-Indic numerals to Western numerals
 */
export function fromArabicNumerals(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => WESTERN_NUMERALS[digit] || digit);
}

/**
 * Check if string contains Arabic-Indic numerals
 */
export function containsArabicNumerals(value: string): boolean {
  return /[٠-٩]/.test(value);
}

/**
 * Convert 24-hour time to 12-hour format
 */
export function convertTo12Hour(
  hours: number,
  minutes: number,
  seconds?: number
): { hours: number; minutes: number; seconds: number; period: 'AM' | 'PM' } {
  let period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
  let adjustedHours = hours % 12;
  
  if (adjustedHours === 0) {
    adjustedHours = 12;
  }
  
  return {
    hours: adjustedHours,
    minutes,
    seconds: seconds ?? 0,
    period,
  };
}

/**
 * Convert 12-hour time to 24-hour format
 */
export function convertTo24Hour(
  hours: number,
  minutes: number,
  period: 'AM' | 'PM',
  seconds?: number
): { hours: number; minutes: number; seconds: number } {
  let adjustedHours = hours;
  
  if (period === 'PM' && hours !== 12) {
    adjustedHours = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    adjustedHours = 0;
  }
  
  return {
    hours: adjustedHours,
    minutes,
    seconds: seconds ?? 0,
  };
}

/**
 * Format time according to locale preferences
 */
export function formatTime(
  date: Date | string | number,
  locale: string = 'en',
  options: TimeFormatOptions = {}
): string {
  const pattern = getTimeFormatPattern(locale);
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  
  const format = options.format || pattern.defaultFormat;
  const useArabicNumerals = options.useArabicNumerals ?? pattern.usesArabicNumerals;
  
  let formatted: string;
  
  if (format === '12h') {
    const converted = convertTo12Hour(hours, minutes, seconds);
    const period = options.useFullPeriod 
      ? (converted.period === 'AM' ? pattern.amSymbolFull : pattern.pmSymbolFull)
      : (converted.period === 'AM' ? pattern.amSymbol : pattern.pmSymbol);
    
    const hourStr = String(converted.hours).padStart(options.padHours ? 2 : 1, '0');
    const minStr = String(converted.minutes).padStart(2, '0');
    const secStr = options.includeSeconds 
      ? pattern.separator + String(converted.seconds).padStart(2, '0')
      : '';
    
    formatted = `${hourStr}${pattern.separator}${minStr}${secStr} ${period}`;
  } else {
    const hourStr = String(hours).padStart(options.padHours !== false ? 2 : 1, '0');
    const minStr = String(minutes).padStart(2, '0');
    const secStr = options.includeSeconds 
      ? pattern.separator + String(seconds).padStart(2, '0')
      : '';
    
    formatted = `${hourStr}${pattern.separator}${minStr}${secStr}`;
  }
  
  if (useArabicNumerals) {
    formatted = toArabicNumerals(formatted);
  }
  
  return formatted;
}

/**
 * Format time with detailed options returning structured data
 */
export function formatTimeDetailed(
  date: Date | string | number,
  locale: string = 'en',
  options: TimeFormatOptions = {}
): FormattedTime {
  const pattern = getTimeFormatPattern(locale);
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  
  const format = options.format || pattern.defaultFormat;
  
  if (format === '12h') {
    const converted = convertTo12Hour(hours, minutes, seconds);
    const period = options.useFullPeriod 
      ? (converted.period === 'AM' ? pattern.amSymbolFull : pattern.pmSymbolFull)
      : (converted.period === 'AM' ? pattern.amSymbol : pattern.pmSymbol);
    
    const hourStr = String(converted.hours).padStart(options.padHours ? 2 : 1, '0');
    const minStr = String(converted.minutes).padStart(2, '0');
    const secStr = options.includeSeconds 
      ? pattern.separator + String(converted.seconds).padStart(2, '0')
      : '';
    
    let formatted = `${hourStr}${pattern.separator}${minStr}${secStr}`;
    const formattedWithPeriod = `${formatted} ${period}`;
    
    if (options.useArabicNumerals ?? pattern.usesArabicNumerals) {
      formatted = toArabicNumerals(formatted);
    }
    
    return {
      hours: converted.hours,
      minutes: converted.minutes,
      seconds: converted.seconds,
      period: converted.period,
      formatted,
      formattedWithPeriod,
    };
  } else {
    const hourStr = String(hours).padStart(options.padHours !== false ? 2 : 1, '0');
    const minStr = String(minutes).padStart(2, '0');
    const secStr = options.includeSeconds 
      ? pattern.separator + String(seconds).padStart(2, '0')
      : '';
    
    let formatted = `${hourStr}${pattern.separator}${minStr}${secStr}`;
    
    if (options.useArabicNumerals ?? pattern.usesArabicNumerals) {
      formatted = toArabicNumerals(formatted);
    }
    
    return {
      hours,
      minutes,
      seconds,
      formatted,
    };
  }
}

/**
 * Parse a time string in various formats
 */
export function parseTime(timeStr: string): { hours: number; minutes: number; seconds: number; period?: 'AM' | 'PM' } | null {
  // Handle Arabic numerals
  const normalized = fromArabicNumerals(timeStr).trim();
  
  // Try 12-hour format with period: "2:30 PM", "14:30:00", "2:30:45 pm"
  const twelveHourMatch = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|AM|PM|ص|م|صباحاً|مساءً|לפנה"צ|אחה"צ)$/i);
  if (twelveHourMatch) {
    let hours = parseInt(twelveHourMatch[1], 10);
    const minutes = parseInt(twelveHourMatch[2], 10);
    const seconds = twelveHourMatch[3] ? parseInt(twelveHourMatch[3], 10) : 0;
    const periodRaw = twelveHourMatch[4].toLowerCase();
    
    const period: 'AM' | 'PM' = ['pm', 'م', 'مساءً', 'אחה"צ'].includes(periodRaw) ? 'PM' : 'AM';
    
    return { hours, minutes, seconds, period };
  }
  
  // Try 24-hour format: "14:30", "14:30:00"
  const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    const hours = parseInt(twentyFourHourMatch[1], 10);
    const minutes = parseInt(twentyFourHourMatch[2], 10);
    const seconds = twentyFourHourMatch[3] ? parseInt(twentyFourHourMatch[3], 10) : 0;
    
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes, seconds };
    }
  }
  
  return null;
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): string[] {
  return Object.keys(TIME_FORMAT_PATTERNS);
}

/**
 * Check if a locale supports 12-hour format
 */
export function supports12Hour(locale: string): boolean {
  const pattern = getTimeFormatPattern(locale);
  return pattern.supports12h;
}

/**
 * Check if a locale supports 24-hour format
 */
export function supports24Hour(locale: string): boolean {
  const pattern = getTimeFormatPattern(locale);
  return pattern.supports24h;
}

/**
 * Get the default format for a locale
 */
export function getDefaultFormat(locale: string): '12h' | '24h' {
  const pattern = getTimeFormatPattern(locale);
  return pattern.defaultFormat;
}

/**
 * Get localized period symbols
 */
export function getPeriodSymbols(locale: string, full: boolean = false): { am: string; pm: string } {
  const pattern = getTimeFormatPattern(locale);
  return {
    am: full ? pattern.amSymbolFull : pattern.amSymbol,
    pm: full ? pattern.pmSymbolFull : pattern.pmSymbol,
  };
}

/**
 * Compare two times
 */
export function compareTimes(
  time1: { hours: number; minutes: number; seconds?: number; period?: 'AM' | 'PM' },
  time2: { hours: number; minutes: number; seconds?: number; period?: 'AM' | 'PM' }
): number {
  const t1 = time1.period 
    ? convertTo24Hour(time1.hours, time1.minutes, time1.period, time1.seconds ?? 0)
    : { hours: time1.hours, minutes: time1.minutes, seconds: time1.seconds ?? 0 };
  
  const t2 = time2.period 
    ? convertTo24Hour(time2.hours, time2.minutes, time2.period, time2.seconds ?? 0)
    : { hours: time2.hours, minutes: time2.minutes, seconds: time2.seconds ?? 0 };
  
  const total1 = t1.hours * 3600 + t1.minutes * 60 + t1.seconds;
  const total2 = t2.hours * 3600 + t2.minutes * 60 + t2.seconds;
  
  return total1 - total2;
}

/**
 * Check if a time is within a range
 */
export function isTimeInRange(
  time: { hours: number; minutes: number; seconds?: number; period?: 'AM' | 'PM' },
  startTime: { hours: number; minutes: number; seconds?: number; period?: 'AM' | 'PM' },
  endTime: { hours: number; minutes: number; seconds?: number; period?: 'AM' | 'PM' }
): boolean {
  const timeCompare = compareTimes(time, startTime);
  const endCompare = compareTimes(endTime, time);
  
  return timeCompare >= 0 && endCompare >= 0;
}

/**
 * Add hours to a time
 */
export function addHours(
  hours: number,
  minutes: number,
  seconds: number,
  hoursToAdd: number
): { hours: number; minutes: number; seconds: number; dayOffset: number } {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds + hoursToAdd * 3600;
  const dayOffset = Math.floor(totalSeconds / 86400);
  const remainingSeconds = totalSeconds % 86400;
  
  const newHours = Math.floor(remainingSeconds / 3600);
  const newMinutes = Math.floor((remainingSeconds % 3600) / 60);
  const newSeconds = remainingSeconds % 60;
  
  return {
    hours: newHours,
    minutes: newMinutes,
    seconds: newSeconds,
    dayOffset,
  };
}

/**
 * Format relative time (e.g., "in 2 hours", "2 hours ago")
 */
export function formatRelativeTime(
  minutesDiff: number,
  locale: string = 'en'
): string {
  const isArabic = locale.toLowerCase().startsWith('ar');
  const isHebrew = locale.toLowerCase().startsWith('he');
  
  const absMinutes = Math.abs(minutesDiff);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  
  if (isArabic) {
    if (minutesDiff > 0) {
      if (hours > 0 && minutes > 0) {
        return `بعد ${toArabicNumerals(hours)} ساعة و ${toArabicNumerals(minutes)} دقيقة`;
      } else if (hours > 0) {
        return `بعد ${toArabicNumerals(hours)} ساعة`;
      } else {
        return `بعد ${toArabicNumerals(minutes)} دقيقة`;
      }
    } else {
      if (hours > 0 && minutes > 0) {
        return `منذ ${toArabicNumerals(hours)} ساعة و ${toArabicNumerals(minutes)} دقيقة`;
      } else if (hours > 0) {
        return `منذ ${toArabicNumerals(hours)} ساعة`;
      } else {
        return `منذ ${toArabicNumerals(minutes)} دقيقة`;
      }
    }
  } else if (isHebrew) {
    if (minutesDiff > 0) {
      if (hours > 0 && minutes > 0) {
        return `בעוד ${hours} שעות ו-${minutes} דקות`;
      } else if (hours > 0) {
        return `בעוד ${hours} שעות`;
      } else {
        return `בעוד ${minutes} דקות`;
      }
    } else {
      if (hours > 0 && minutes > 0) {
        return `לפני ${hours} שעות ו-${minutes} דקות`;
      } else if (hours > 0) {
        return `לפני ${hours} שעות`;
      } else {
        return `לפני ${minutes} דקות`;
      }
    }
  } else {
    if (minutesDiff > 0) {
      if (hours > 0 && minutes > 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    } else {
      if (hours > 0 && minutes > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
    }
  }
}
