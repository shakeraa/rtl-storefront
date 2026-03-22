import { describe, it, expect } from "vitest";
import {
  formatPhoneNumber,
  parsePhoneNumber,
  MENA_PHONE_FORMATS,
  formatDate,
  formatDateRange,
  getDateFormatPattern,
  parseLocalDate,
  formatNumber,
  formatPercent,
  formatCompactNumber,
  getDecimalSeparator,
  getThousandsSeparator,
  useEasternArabicNumerals,
  toEasternArabicNumerals,
} from "../../app/services/localization";

// -----------------------------------------------------------------------
// T0313 - Phone Number Format
// -----------------------------------------------------------------------

describe("T0313 — Phone Number Format", () => {
  it("formats Saudi phone number", () => {
    const result = formatPhoneNumber("501234567", "SA");
    expect(result).toBe("+966 50 123 4567");
  });

  it("formats UAE phone number", () => {
    const result = formatPhoneNumber("501234567", "AE");
    expect(result).toBe("+971 50 123 4567");
  });

  it("formats Kuwait phone number (4-4)", () => {
    const result = formatPhoneNumber("51234567", "KW");
    expect(result).toBe("+965 5123 4567");
  });

  it("formats Egypt phone number", () => {
    const result = formatPhoneNumber("1012345678", "EG");
    expect(result).toBe("+20 10 1234 5678");
  });

  it("formats Lebanon phone number", () => {
    const result = formatPhoneNumber("71123456", "LB");
    expect(result).toBe("+961 71 123 456");
  });

  it("formats Iraq phone number", () => {
    const result = formatPhoneNumber("7701234567", "IQ");
    expect(result).toBe("+964 770 123 4567");
  });

  it("strips non-digit chars before formatting", () => {
    const result = formatPhoneNumber("+966-50-123-4567", "SA");
    expect(result).toBe("+966 50 123 4567");
  });

  it("returns raw number for unknown country", () => {
    const result = formatPhoneNumber("12345", "XX");
    expect(result).toBe("12345");
  });

  it("handles case-insensitive country codes", () => {
    const result = formatPhoneNumber("501234567", "sa");
    expect(result).toBe("+966 50 123 4567");
  });

  it("MENA_PHONE_FORMATS has 10 countries", () => {
    expect(Object.keys(MENA_PHONE_FORMATS).length).toBe(10);
  });
});

describe("T0313 — parsePhoneNumber", () => {
  it("parses Saudi number with prefix", () => {
    const result = parsePhoneNumber("+966501234567");
    expect(result).not.toBeNull();
    expect(result!.country).toBe("SA");
    expect(result!.number).toBe("501234567");
  });

  it("parses UAE number", () => {
    const result = parsePhoneNumber("+971501234567");
    expect(result).not.toBeNull();
    expect(result!.country).toBe("AE");
  });

  it("returns null for unknown prefix", () => {
    const result = parsePhoneNumber("+9991234567");
    expect(result).toBeNull();
  });
});

// -----------------------------------------------------------------------
// T0314 - Date Format Localization
// -----------------------------------------------------------------------

describe("T0314 — Date Format", () => {
  const testDate = new Date(2026, 2, 23); // March 23, 2026

  it("formats date in short style", () => {
    const result = formatDate(testDate, "en", "short");
    expect(result).toContain("2026");
  });

  it("formats date in medium style", () => {
    const result = formatDate(testDate, "en", "medium");
    expect(result).toContain("2026");
    expect(result).toContain("Mar");
  });

  it("formats date in long style", () => {
    const result = formatDate(testDate, "en", "long");
    expect(result).toContain("March");
    expect(result).toContain("2026");
  });

  it("formats date in Arabic locale", () => {
    const result = formatDate(testDate, "ar", "medium");
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("getDateFormatPattern returns DD/MM/YYYY for Arabic", () => {
    expect(getDateFormatPattern("ar")).toBe("DD/MM/YYYY");
    expect(getDateFormatPattern("ar-SA")).toBe("DD/MM/YYYY");
  });

  it("getDateFormatPattern returns MM/DD/YYYY for en-US", () => {
    expect(getDateFormatPattern("en-US")).toBe("MM/DD/YYYY");
    expect(getDateFormatPattern("en")).toBe("MM/DD/YYYY");
  });
});

describe("T0314 — parseLocalDate", () => {
  it("parses DD/MM/YYYY for Arabic locale", () => {
    const result = parseLocalDate("23/03/2026", "ar");
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(2); // March = 2
    expect(result!.getDate()).toBe(23);
  });

  it("parses MM/DD/YYYY for en-US locale", () => {
    const result = parseLocalDate("03/23/2026", "en-US");
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(2);
    expect(result!.getDate()).toBe(23);
  });

  it("returns null for invalid date", () => {
    expect(parseLocalDate("32/13/2026", "ar")).toBeNull();
  });

  it("returns null for incomplete date", () => {
    expect(parseLocalDate("23/03", "ar")).toBeNull();
  });
});

describe("T0314 — formatDateRange", () => {
  it("formats a date range", () => {
    const start = new Date(2026, 2, 1);
    const end = new Date(2026, 2, 31);
    const result = formatDateRange(start, end, "en");
    expect(result).toContain("Mar");
    expect(result.length).toBeGreaterThan(0);
  });
});

// -----------------------------------------------------------------------
// T0316 - Number Format
// -----------------------------------------------------------------------

describe("T0316 — Number Format", () => {
  it("formats number with locale grouping", () => {
    const result = formatNumber(1234567, "en");
    expect(result).toContain("1");
    expect(result).toContain("234");
  });

  it("formats percent", () => {
    const result = formatPercent(0.75, "en");
    expect(result).toContain("75");
    expect(result).toContain("%");
  });

  it("formats compact number", () => {
    const result = formatCompactNumber(1500000, "en");
    expect(result).toMatch(/1\.5M|2M/);
  });

  it("gets decimal separator for English", () => {
    expect(getDecimalSeparator("en")).toBe(".");
  });

  it("gets thousands separator for English", () => {
    expect(getThousandsSeparator("en")).toBe(",");
  });
});

describe("T0316 — Eastern Arabic Numerals", () => {
  it("identifies Gulf locales as using Eastern Arabic", () => {
    expect(useEasternArabicNumerals("ar-SA")).toBe(true);
    expect(useEasternArabicNumerals("ar-AE")).toBe(true);
    expect(useEasternArabicNumerals("ar")).toBe(true);
  });

  it("identifies North African locales as NOT using Eastern Arabic", () => {
    expect(useEasternArabicNumerals("ar-EG")).toBe(false);
    expect(useEasternArabicNumerals("ar-MA")).toBe(false);
  });

  it("identifies non-Arabic locales as NOT using Eastern Arabic", () => {
    expect(useEasternArabicNumerals("en")).toBe(false);
    expect(useEasternArabicNumerals("he")).toBe(false);
  });

  it("converts Western to Eastern Arabic numerals", () => {
    const result = toEasternArabicNumerals("123");
    expect(result).toBe("\u0661\u0662\u0663");
  });

  it("converts all 10 digits", () => {
    const result = toEasternArabicNumerals("0123456789");
    expect(result).toBe("\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669");
  });

  it("preserves non-digit characters", () => {
    const result = toEasternArabicNumerals("Price: 99.50 SAR");
    expect(result).toContain("\u0669\u0669");
    expect(result).toContain("Price");
    expect(result).toContain("SAR");
  });
});
