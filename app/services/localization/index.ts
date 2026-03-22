/**
 * Localization Service - Number, Date, and Phone Formatting
 *
 * T0313 - Phone Number Format
 * T0314 - Date Format Localization
 * T0316 - Number Format
 *
 * Uses Intl.NumberFormat and Intl.DateTimeFormat where possible.
 */

// ---------------------------------------------------------------------------
// T0313 - Phone Number Format
// ---------------------------------------------------------------------------

export interface PhoneFormat {
  country: string;
  prefix: string;
  pattern: string;
  example: string;
}

export const MENA_PHONE_FORMATS: Record<string, PhoneFormat> = {
  SA: {
    country: "SA",
    prefix: "+966",
    pattern: "+966 5X XXX XXXX",
    example: "+966 50 123 4567",
  },
  AE: {
    country: "AE",
    prefix: "+971",
    pattern: "+971 5X XXX XXXX",
    example: "+971 50 123 4567",
  },
  KW: {
    country: "KW",
    prefix: "+965",
    pattern: "+965 XXXX XXXX",
    example: "+965 5123 4567",
  },
  BH: {
    country: "BH",
    prefix: "+973",
    pattern: "+973 XXXX XXXX",
    example: "+973 3612 3456",
  },
  QA: {
    country: "QA",
    prefix: "+974",
    pattern: "+974 XXXX XXXX",
    example: "+974 5512 3456",
  },
  OM: {
    country: "OM",
    prefix: "+968",
    pattern: "+968 XXXX XXXX",
    example: "+968 9123 4567",
  },
  EG: {
    country: "EG",
    prefix: "+20",
    pattern: "+20 1X XXXX XXXX",
    example: "+20 10 1234 5678",
  },
  JO: {
    country: "JO",
    prefix: "+962",
    pattern: "+962 7X XXX XXXX",
    example: "+962 79 123 4567",
  },
  LB: {
    country: "LB",
    prefix: "+961",
    pattern: "+961 XX XXX XXX",
    example: "+961 71 123 456",
  },
  IQ: {
    country: "IQ",
    prefix: "+964",
    pattern: "+964 7XX XXX XXXX",
    example: "+964 770 123 4567",
  },
};

/**
 * Format a phone number according to its country's display pattern.
 * Accepts raw digits or numbers prefixed with country code.
 */
export function formatPhoneNumber(phone: string, country: string): string {
  const format = MENA_PHONE_FORMATS[country.toUpperCase()];
  if (!format) return phone;

  // Strip everything except digits and leading +
  const digits = phone.replace(/[^\d]/g, "");

  // Remove country prefix if present
  const prefixDigits = format.prefix.replace("+", "");
  const localDigits = digits.startsWith(prefixDigits)
    ? digits.slice(prefixDigits.length)
    : digits;

  // Apply formatting based on country
  switch (country.toUpperCase()) {
    case "SA":
    case "AE":
    case "JO": {
      // +XXX 5X XXX XXXX (9 local digits grouped 2-3-4)
      if (localDigits.length >= 9) {
        const d = localDigits.slice(0, 9);
        return `${format.prefix} ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 9)}`;
      }
      break;
    }
    case "KW":
    case "BH":
    case "QA":
    case "OM": {
      // +XXX XXXX XXXX (8 local digits grouped 4-4)
      if (localDigits.length >= 8) {
        const d = localDigits.slice(0, 8);
        return `${format.prefix} ${d.slice(0, 4)} ${d.slice(4, 8)}`;
      }
      break;
    }
    case "EG": {
      // +20 1X XXXX XXXX (10 local digits grouped 2-4-4)
      if (localDigits.length >= 10) {
        const d = localDigits.slice(0, 10);
        return `${format.prefix} ${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6, 10)}`;
      }
      break;
    }
    case "LB": {
      // +961 XX XXX XXX (8 local digits grouped 2-3-3)
      if (localDigits.length >= 8) {
        const d = localDigits.slice(0, 8);
        return `${format.prefix} ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)}`;
      }
      break;
    }
    case "IQ": {
      // +964 7XX XXX XXXX (10 local digits grouped 3-3-4)
      if (localDigits.length >= 10) {
        const d = localDigits.slice(0, 10);
        return `${format.prefix} ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}`;
      }
      break;
    }
  }

  // Fallback: return with prefix and unformatted digits
  return `${format.prefix} ${localDigits}`;
}

/**
 * Parse a phone number string to extract country and local number.
 */
export function parsePhoneNumber(
  phone: string,
): { country: string; number: string } | null {
  const digits = phone.replace(/[^\d+]/g, "");
  const withPlus = digits.startsWith("+") ? digits : `+${digits}`;

  // Try each prefix (longest first to avoid partial matches)
  const sorted = Object.values(MENA_PHONE_FORMATS).sort(
    (a, b) => b.prefix.length - a.prefix.length,
  );

  for (const format of sorted) {
    if (withPlus.startsWith(format.prefix)) {
      const localNumber = withPlus.slice(format.prefix.length).replace(/\D/g, "");
      return { country: format.country, number: localNumber };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// T0314 - Date Format Localization
// ---------------------------------------------------------------------------

/**
 * Format a date according to locale conventions.
 */
export function formatDate(
  date: Date,
  locale: string,
  style: "short" | "medium" | "long" = "medium",
): string {
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: "numeric", month: "2-digit", day: "2-digit" },
    medium: { year: "numeric", month: "short", day: "numeric" },
    long: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
  };

  return new Intl.DateTimeFormat(locale, optionsMap[style]).format(date);
}

/**
 * Format a date range for display.
 */
export function formatDateRange(
  start: Date,
  end: Date,
  locale: string,
): string {
  const fmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Use formatRange if available (modern engines)
  if (typeof (fmt as any).formatRange === "function") {
    return (fmt as any).formatRange(start, end);
  }

  // Fallback
  const separator = locale.startsWith("ar") ? " \u2013 " : " \u2013 ";
  return `${fmt.format(start)}${separator}${fmt.format(end)}`;
}

/**
 * Get the date format pattern string for a locale.
 */
export function getDateFormatPattern(locale: string): string {
  if (locale.startsWith("ar")) {
    return "DD/MM/YYYY";
  }
  // US English
  if (locale === "en-US" || locale === "en") {
    return "MM/DD/YYYY";
  }
  // Most other locales use day-first
  return "DD/MM/YYYY";
}

/**
 * Parse a date string written in the local format.
 */
export function parseLocalDate(dateStr: string, locale: string): Date | null {
  // Strip Eastern Arabic numerals if present
  const normalized = fromEasternArabicNumerals(dateStr);
  const parts = normalized.split(/[/\-.\s]+/).filter(Boolean);

  if (parts.length < 3) return null;

  const pattern = getDateFormatPattern(locale);

  let day: number;
  let month: number;
  let year: number;

  if (pattern === "MM/DD/YYYY") {
    month = parseInt(parts[0], 10);
    day = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else {
    // DD/MM/YYYY (Arabic and most MENA locales)
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  const date = new Date(year, month - 1, day);
  // Validate the date is real
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

// ---------------------------------------------------------------------------
// T0316 - Number Format
// ---------------------------------------------------------------------------

const EASTERN_ARABIC_NUMERALS = [
  "\u0660", // ٠
  "\u0661", // ١
  "\u0662", // ٢
  "\u0663", // ٣
  "\u0664", // ٤
  "\u0665", // ٥
  "\u0666", // ٦
  "\u0667", // ٧
  "\u0668", // ٨
  "\u0669", // ٩
];

/**
 * Format a number according to locale conventions using Intl.NumberFormat.
 */
export function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a number as a percentage.
 */
export function formatPercent(num: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(num);
}

/**
 * Format a number in compact notation (1.2K, 3.5M, etc.).
 */
export function formatCompactNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Get the decimal separator for a locale.
 */
export function getDecimalSeparator(locale: string): string {
  const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
  const decimal = parts.find((p) => p.type === "decimal");
  return decimal ? decimal.value : ".";
}

/**
 * Get the thousands (grouping) separator for a locale.
 */
export function getThousandsSeparator(locale: string): string {
  const parts = new Intl.NumberFormat(locale).formatToParts(1000);
  const group = parts.find((p) => p.type === "group");
  return group ? group.value : ",";
}

/**
 * Determine whether a locale conventionally uses Eastern Arabic numerals.
 */
export function useEasternArabicNumerals(locale: string): boolean {
  // ar-SA and several other Arabic locales use Eastern Arabic numerals by default
  const eastern = ["ar-SA", "ar-AE", "ar-BH", "ar-QA", "ar-OM", "ar-KW", "ar-IQ", "ar-YE"];
  // The bare "ar" locale also typically uses Eastern Arabic
  if (locale === "ar" || eastern.includes(locale)) {
    return true;
  }
  // ar-EG, ar-LB, ar-MA, ar-TN, ar-DZ use Western Arabic numerals
  return false;
}

/**
 * Convert Western Arabic numerals (0-9) to Eastern Arabic (٠-٩).
 */
export function toEasternArabicNumerals(str: string): string {
  return str.replace(/[0-9]/g, (d) => EASTERN_ARABIC_NUMERALS[parseInt(d, 10)]);
}

/**
 * Convert Eastern Arabic numerals back to Western Arabic (internal helper).
 */
function fromEasternArabicNumerals(str: string): string {
  return str.replace(/[\u0660-\u0669]/g, (c) =>
    String(c.charCodeAt(0) - 0x0660),
  );
}
