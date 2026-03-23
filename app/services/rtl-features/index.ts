/**
 * RTL Features Service
 *
 * T0036 - Arabic Numerals Conversion
 * T0042 - Flag Icons for Language Selector
 * T0054 - Admin Dashboard RTL Support
 * T0056 - Tashkeel (Diacritics) Management
 */

// ===========================================================================
// T0036 - Arabic Numerals
// ===========================================================================

export type NumeralSystem = "western" | "eastern_arabic" | "auto";

const EASTERN_ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const WESTERN_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Convert Western digits (0-9) to Eastern Arabic numerals (٠-٩).
 */
export function toEasternArabicNumerals(str: string): string {
  return str.replace(/[0-9]/g, (digit) => EASTERN_ARABIC_DIGITS[parseInt(digit, 10)]);
}

/**
 * Convert Eastern Arabic numerals (٠-٩) back to Western digits (0-9).
 */
export function toWesternNumerals(str: string): string {
  return str.replace(/[٠-٩]/g, (digit) => {
    const index = digit.charCodeAt(0) - 0x0660;
    return WESTERN_DIGITS[index];
  });
}

/**
 * Format a number using the appropriate numeral system for the locale.
 * When useEastern is "auto" or undefined, Eastern Arabic numerals are used
 * for Arabic locales (ar, ar-SA, ar-EG, etc.).
 */
export function formatWithNumeralSystem(
  num: number,
  locale: string,
  useEastern?: boolean,
): string {
  const formatted = num.toLocaleString(locale);

  const shouldUseEastern =
    useEastern === true ||
    (useEastern === undefined &&
      (locale === "ar" || locale.startsWith("ar-")));

  if (shouldUseEastern) {
    return toEasternArabicNumerals(formatted);
  }

  return formatted;
}

// ===========================================================================
// T0042 - Flag Icons
// ===========================================================================

export interface FlagIcon {
  countryCode: string;
  emoji: string;
  svgPath?: string;
}

export const FLAG_ICONS: Record<string, FlagIcon> = {
  SA: { countryCode: "SA", emoji: "\u{1F1F8}\u{1F1E6}", svgPath: "/flags/sa.svg" },
  AE: { countryCode: "AE", emoji: "\u{1F1E6}\u{1F1EA}", svgPath: "/flags/ae.svg" },
  KW: { countryCode: "KW", emoji: "\u{1F1F0}\u{1F1FC}", svgPath: "/flags/kw.svg" },
  BH: { countryCode: "BH", emoji: "\u{1F1E7}\u{1F1ED}", svgPath: "/flags/bh.svg" },
  QA: { countryCode: "QA", emoji: "\u{1F1F6}\u{1F1E6}", svgPath: "/flags/qa.svg" },
  OM: { countryCode: "OM", emoji: "\u{1F1F4}\u{1F1F2}", svgPath: "/flags/om.svg" },
  EG: { countryCode: "EG", emoji: "\u{1F1EA}\u{1F1EC}", svgPath: "/flags/eg.svg" },
  JO: { countryCode: "JO", emoji: "\u{1F1EF}\u{1F1F4}", svgPath: "/flags/jo.svg" },
  LB: { countryCode: "LB", emoji: "\u{1F1F1}\u{1F1E7}", svgPath: "/flags/lb.svg" },
  SY: { countryCode: "SY", emoji: "\u{1F1F8}\u{1F1FE}", svgPath: "/flags/sy.svg" },
  IQ: { countryCode: "IQ", emoji: "\u{1F1EE}\u{1F1F6}", svgPath: "/flags/iq.svg" },
  MA: { countryCode: "MA", emoji: "\u{1F1F2}\u{1F1E6}", svgPath: "/flags/ma.svg" },
  DZ: { countryCode: "DZ", emoji: "\u{1F1E9}\u{1F1FF}", svgPath: "/flags/dz.svg" },
  TN: { countryCode: "TN", emoji: "\u{1F1F9}\u{1F1F3}", svgPath: "/flags/tn.svg" },
  LY: { countryCode: "LY", emoji: "\u{1F1F1}\u{1F1FE}", svgPath: "/flags/ly.svg" },
  TR: { countryCode: "TR", emoji: "\u{1F1F9}\u{1F1F7}", svgPath: "/flags/tr.svg" },
  IL: { countryCode: "IL", emoji: "\u{1F1EE}\u{1F1F1}", svgPath: "/flags/il.svg" },
  IR: { countryCode: "IR", emoji: "\u{1F1EE}\u{1F1F7}", svgPath: "/flags/ir.svg" },
  PK: { countryCode: "PK", emoji: "\u{1F1F5}\u{1F1F0}", svgPath: "/flags/pk.svg" },
  US: { countryCode: "US", emoji: "\u{1F1FA}\u{1F1F8}", svgPath: "/flags/us.svg" },
  GB: { countryCode: "GB", emoji: "\u{1F1EC}\u{1F1E7}", svgPath: "/flags/gb.svg" },
  FR: { countryCode: "FR", emoji: "\u{1F1EB}\u{1F1F7}", svgPath: "/flags/fr.svg" },
  DE: { countryCode: "DE", emoji: "\u{1F1E9}\u{1F1EA}", svgPath: "/flags/de.svg" },
};

/** Map from locale codes to primary country codes */
const LOCALE_TO_COUNTRY: Record<string, string> = {
  "ar": "SA",
  "ar-SA": "SA",
  "ar-AE": "AE",
  "ar-KW": "KW",
  "ar-BH": "BH",
  "ar-QA": "QA",
  "ar-OM": "OM",
  "ar-EG": "EG",
  "ar-JO": "JO",
  "ar-LB": "LB",
  "ar-SY": "SY",
  "ar-IQ": "IQ",
  "ar-MA": "MA",
  "ar-DZ": "DZ",
  "ar-TN": "TN",
  "ar-LY": "LY",
  "tr": "TR",
  "he": "IL",
  "fa": "IR",
  "ur": "PK",
  "en": "US",
  "en-US": "US",
  "en-GB": "GB",
  "fr": "FR",
  "de": "DE",
};

/**
 * Get flag icon for a locale code.
 */
export function getFlagForLocale(locale: string): FlagIcon | null {
  const countryCode = LOCALE_TO_COUNTRY[locale];
  if (!countryCode) return null;
  return FLAG_ICONS[countryCode] ?? null;
}

/**
 * Get flag icon for a country code. Throws if not found.
 */
export function getFlagForCountry(countryCode: string): FlagIcon {
  const flag = FLAG_ICONS[countryCode.toUpperCase()];
  if (!flag) {
    throw new Error(`Flag not found for country: ${countryCode}`);
  }
  return flag;
}

// ===========================================================================
// T0054 - Admin Dashboard RTL
// ===========================================================================

export interface AdminRTLConfig {
  direction: "rtl" | "ltr" | "auto";
  sidebarPosition: "left" | "right";
  tableAlignment: "start" | "end";
  iconMirroring: boolean;
}

const RTL_LOCALES = new Set([
  "ar", "ar-SA", "ar-AE", "ar-EG", "ar-KW", "ar-BH", "ar-QA", "ar-OM",
  "ar-JO", "ar-LB", "ar-SY", "ar-IQ", "ar-MA", "ar-DZ", "ar-TN", "ar-LY",
  "he", "fa", "ur",
]);

/**
 * Determine admin panel RTL configuration for a given locale.
 */
export function getAdminRTLConfig(locale: string): AdminRTLConfig {
  const isRTL = RTL_LOCALES.has(locale) || locale.startsWith("ar-");

  if (isRTL) {
    return {
      direction: "rtl",
      sidebarPosition: "right",
      tableAlignment: "start",
      iconMirroring: true,
    };
  }

  return {
    direction: "ltr",
    sidebarPosition: "left",
    tableAlignment: "start",
    iconMirroring: false,
  };
}

/**
 * Generate CSS overrides to make Polaris components RTL-compatible.
 */
export function generateAdminRTLCSS(config: AdminRTLConfig): string {
  if (config.direction === "ltr") {
    return "/* LTR - no RTL overrides needed */";
  }

  const sidebarRight = config.sidebarPosition === "right";

  return `/* RTL Admin Overrides - Auto-generated */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Polaris Navigation / Sidebar */
[dir="rtl"] .Polaris-Frame__Navigation {
  ${sidebarRight ? "left: auto;\n  right: 0;" : ""}
}

[dir="rtl"] .Polaris-Frame__Main {
  ${sidebarRight ? "margin-left: 0;\n  margin-right: 240px;" : ""}
}

/* Polaris DataTable alignment */
[dir="rtl"] .Polaris-DataTable__Cell {
  text-align: ${config.tableAlignment};
}

[dir="rtl"] .Polaris-DataTable__Cell--header {
  text-align: ${config.tableAlignment};
}

/* Icon mirroring for directional icons */
${config.iconMirroring ? `[dir="rtl"] .Polaris-Icon--applyMirror {
  transform: scaleX(-1);
}

[dir="rtl"] .Polaris-Breadcrumbs__Icon,
[dir="rtl"] .Polaris-Pagination__Button .Polaris-Icon,
[dir="rtl"] [class*="chevron"] .Polaris-Icon,
[dir="rtl"] [class*="arrow"] .Polaris-Icon {
  transform: scaleX(-1);
}` : ""}

/* Form layout adjustments */
[dir="rtl"] .Polaris-FormLayout__Item {
  text-align: right;
}

[dir="rtl"] .Polaris-Label {
  text-align: right;
}

/* Card and resource list */
[dir="rtl"] .Polaris-ResourceItem__Container {
  flex-direction: row-reverse;
}

[dir="rtl"] .Polaris-Stack {
  flex-direction: row-reverse;
}

/* Modal actions */
[dir="rtl"] .Polaris-Modal-Footer {
  flex-direction: row-reverse;
}

/* Badge positioning */
[dir="rtl"] .Polaris-Badge {
  margin-left: 0;
  margin-right: 8px;
}`;
}

// ===========================================================================
// T0056 - Tashkeel (Diacritics)
// ===========================================================================

/**
 * Arabic diacritic marks (tashkeel / harakat).
 */
export const TASHKEEL_MARKS: string[] = [
  "\u064E", // Fatha (فتحة) - َ
  "\u064F", // Damma (ضمة) - ُ
  "\u0650", // Kasra (كسرة) - ِ
  "\u064B", // Fathatan (تنوين فتح) - ً
  "\u064C", // Dammatan (تنوين ضم) - ٌ
  "\u064D", // Kasratan (تنوين كسر) - ٍ
  "\u0651", // Shadda (شدة) - ّ
  "\u0652", // Sukun (سكون) - ْ
  "\u0670", // Superscript Alef (ألف خنجرية)
  "\u0653", // Maddah (مدة)
  "\u0654", // Hamza above
  "\u0655", // Hamza below
];

const TASHKEEL_REGEX = new RegExp(`[${TASHKEEL_MARKS.join("")}]`, "g");

/**
 * Check if text contains any Arabic diacritical marks.
 */
export function hasTashkeel(text: string): boolean {
  return TASHKEEL_REGEX.test(text);
}

/**
 * Remove all Arabic diacritical marks from text.
 */
export function stripTashkeel(text: string): string {
  return text.replace(TASHKEEL_REGEX, "");
}

/**
 * Add basic tashkeel to Arabic text.
 * Note: Full tashkeel requires ML models. This is a stub that returns
 * the text unchanged, to be replaced with an ML-backed implementation.
 */
export function addBasicTashkeel(text: string): string {
  // Basic tashkeel lookup for common Arabic words.
  // Full tashkeel restoration requires ML/NLP models; this handles
  // frequently-used words via a small dictionary.
  const TASHKEEL_LOOKUP: Record<string, string> = {
    "\u0643\u062A\u0627\u0628": "\u0643\u0650\u062A\u064E\u0627\u0628\u064C",       // كتاب → كِتَابٌ
    "\u0645\u062F\u0631\u0633\u0629": "\u0645\u064E\u062F\u0652\u0631\u064E\u0633\u064E\u0629\u064C", // مدرسة → مَدْرَسَةٌ
    "\u0628\u064A\u062A": "\u0628\u064E\u064A\u0652\u062A\u064C",                   // بيت → بَيْتٌ
    "\u0642\u0644\u0645": "\u0642\u064E\u0644\u064E\u0645\u064C",                   // قلم → قَلَمٌ
    "\u0648\u0644\u062F": "\u0648\u064E\u0644\u064E\u062F\u064C",                   // ولد → وَلَدٌ
    "\u0628\u0646\u062A": "\u0628\u0650\u0646\u0652\u062A\u064C",                   // بنت → بِنْتٌ
    "\u0631\u062C\u0644": "\u0631\u064E\u062C\u064F\u0644\u064C",                   // رجل → رَجُلٌ
    "\u0645\u0627\u0621": "\u0645\u064E\u0627\u0621\u064C",                         // ماء → مَاءٌ
    "\u0634\u0645\u0633": "\u0634\u064E\u0645\u0652\u0633\u064C",                   // شمس → شَمْسٌ
    "\u0642\u0645\u0631": "\u0642\u064E\u0645\u064E\u0631\u064C",                   // قمر → قَمَرٌ
    "\u0639\u0644\u0645": "\u0639\u0650\u0644\u0652\u0645\u064C",                   // علم → عِلْمٌ
    "\u0639\u0645\u0644": "\u0639\u064E\u0645\u064E\u0644\u064C",                   // عمل → عَمَلٌ
    "\u0645\u0646\u0632\u0644": "\u0645\u064E\u0646\u0652\u0632\u0650\u0644\u064C", // منزل → مَنْزِلٌ
  };

  let result = text;
  for (const [bare, tashkeeled] of Object.entries(TASHKEEL_LOOKUP)) {
    result = result.replaceAll(bare, tashkeeled);
  }
  return result;
}
