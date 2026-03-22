/**
 * Media Features Service
 * T0029: AI Image Translation (OCR stub)
 * T0040: Geolocation Detection
 * T0051: Translation Quality Scoring
 * T0072: Agency Partner Network
 * T0073: Subdomain Support
 * T0081: Conditional Translation Rules
 */

// ---------------------------------------------------------------------------
// T0029 - AI Image Translation (OCR stub)
// ---------------------------------------------------------------------------

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  locale: string;
}

export async function detectTextInImage(
  imageUrl: string,
): Promise<OCRResult[]> {
  // Stub implementation returning mock OCR results
  return [
    {
      text: "تخفيضات كبيرة",
      confidence: 0.92,
      boundingBox: { x: 50, y: 20, width: 300, height: 60 },
      locale: "ar",
    },
    {
      text: "Big Sale",
      confidence: 0.97,
      boundingBox: { x: 50, y: 90, width: 200, height: 40 },
      locale: "en",
    },
    {
      text: "50%",
      confidence: 0.99,
      boundingBox: { x: 150, y: 150, width: 100, height: 80 },
      locale: "en",
    },
  ];
}

export function getOCRProviders(): Array<{
  id: string;
  name: string;
  supportedFormats: string[];
}> {
  return [
    {
      id: "google-vision",
      name: "Google Cloud Vision",
      supportedFormats: ["png", "jpg", "jpeg", "gif", "bmp", "webp", "pdf", "tiff"],
    },
    {
      id: "aws-textract",
      name: "AWS Textract",
      supportedFormats: ["png", "jpg", "jpeg", "pdf", "tiff"],
    },
    {
      id: "azure-ocr",
      name: "Azure Computer Vision",
      supportedFormats: ["png", "jpg", "jpeg", "gif", "bmp", "pdf", "tiff"],
    },
  ];
}

// ---------------------------------------------------------------------------
// T0040 - Geolocation Detection
// ---------------------------------------------------------------------------

export interface GeoDetectionResult {
  country: string;
  locale: string;
  source: "ip" | "browser" | "url" | "cookie";
  confidence: number;
}

export const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  "Asia/Riyadh": "SA",
  "Asia/Dubai": "AE",
  "Asia/Qatar": "QA",
  "Asia/Kuwait": "KW",
  "Asia/Bahrain": "BH",
  "Asia/Muscat": "OM",
  "Africa/Cairo": "EG",
  "Asia/Amman": "JO",
  "Asia/Baghdad": "IQ",
  "Asia/Beirut": "LB",
  "Asia/Damascus": "SY",
  "Asia/Aden": "YE",
  "Asia/Gaza": "PS",
  "Asia/Hebron": "PS",
  "Asia/Jerusalem": "IL",
  "Asia/Tehran": "IR",
  "Asia/Karachi": "PK",
  "Europe/Istanbul": "TR",
  "Africa/Casablanca": "MA",
  "Africa/Algiers": "DZ",
  "Africa/Tunis": "TN",
  "Africa/Tripoli": "LY",
};

const COUNTRY_LOCALE_MAP: Record<string, string> = {
  SA: "ar-SA",
  AE: "ar-AE",
  QA: "ar-QA",
  KW: "ar-KW",
  BH: "ar-BH",
  OM: "ar-OM",
  EG: "ar-EG",
  JO: "ar-JO",
  IQ: "ar-IQ",
  LB: "ar-LB",
  SY: "ar-SY",
  YE: "ar-YE",
  PS: "ar-PS",
  IL: "he-IL",
  IR: "fa-IR",
  PK: "ur-PK",
  TR: "tr-TR",
  MA: "ar-MA",
  DZ: "ar-DZ",
  TN: "ar-TN",
  LY: "ar-LY",
};

export function detectLocale(request: Request): GeoDetectionResult {
  // 1. Check URL for locale prefix
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  if (pathParts.length > 0) {
    const possibleLocale = pathParts[0];
    if (/^[a-z]{2}(-[A-Z]{2})?$/.test(possibleLocale)) {
      return {
        country: possibleLocale.split("-")[1] ?? "",
        locale: possibleLocale,
        source: "url",
        confidence: 1.0,
      };
    }
  }

  // 2. Check cookie
  const cookieHeader = request.headers.get("cookie") ?? "";
  const localeMatch = cookieHeader.match(/locale=([a-z]{2}(?:-[A-Z]{2})?)/);
  if (localeMatch) {
    return {
      country: localeMatch[1].split("-")[1] ?? "",
      locale: localeMatch[1],
      source: "cookie",
      confidence: 0.9,
    };
  }

  // 3. Check CF/Vercel geolocation headers
  const cfCountry = request.headers.get("cf-ipcountry");
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const geoCountry = cfCountry ?? vercelCountry;

  if (geoCountry) {
    const locale = COUNTRY_LOCALE_MAP[geoCountry] ?? "en";
    return {
      country: geoCountry,
      locale,
      source: "ip",
      confidence: 0.85,
    };
  }

  // 4. Check Accept-Language header
  const acceptLang = request.headers.get("accept-language") ?? "";
  const primaryLang = acceptLang.split(",")[0]?.trim().split(";")[0] ?? "en";

  return {
    country: "",
    locale: primaryLang,
    source: "browser",
    confidence: 0.7,
  };
}

export function getCountryFromTimezone(timezone: string): string | null {
  return TIMEZONE_COUNTRY_MAP[timezone] ?? null;
}

// ---------------------------------------------------------------------------
// T0051 - Translation Quality Scoring
// ---------------------------------------------------------------------------

export interface QualityScore {
  score: number;
  level: "excellent" | "good" | "fair" | "poor";
  factors: Array<{ name: string; score: number; weight: number }>;
}

export function scoreTranslation(
  source: string,
  translation: string,
  locale: string,
): QualityScore {
  const factors: Array<{ name: string; score: number; weight: number }> = [];

  // Factor 1: Length ratio (translation should be within reasonable range)
  const lengthRatio = translation.length / Math.max(source.length, 1);
  const isRTL = locale.startsWith("ar") || locale.startsWith("he") || locale.startsWith("fa") || locale.startsWith("ur");
  // Arabic text is typically 10-30% longer than English
  const expectedMin = isRTL ? 0.7 : 0.6;
  const expectedMax = isRTL ? 1.8 : 1.6;
  let lengthScore: number;
  if (lengthRatio >= expectedMin && lengthRatio <= expectedMax) {
    lengthScore = 100;
  } else {
    const deviation = lengthRatio < expectedMin
      ? (expectedMin - lengthRatio) / expectedMin
      : (lengthRatio - expectedMax) / expectedMax;
    lengthScore = Math.max(0, 100 - deviation * 100);
  }
  factors.push({ name: "length_ratio", score: Math.round(lengthScore), weight: 0.2 });

  // Factor 2: Placeholder preservation ({name}, {{count}}, %s, etc.)
  const placeholderRegex = /(\{\{?\w+\}?\}|%[sd]|%\d+\$[sd])/g;
  const sourcePlaceholders: string[] = source.match(placeholderRegex) ?? [];
  const translationPlaceholders: string[] = translation.match(placeholderRegex) ?? [];
  let placeholderScore = 100;
  if (sourcePlaceholders.length > 0) {
    const missing = sourcePlaceholders.filter(
      (p) => !translationPlaceholders.includes(p),
    );
    placeholderScore = Math.round(
      ((sourcePlaceholders.length - missing.length) / sourcePlaceholders.length) * 100,
    );
  }
  factors.push({ name: "placeholder_preservation", score: placeholderScore, weight: 0.3 });

  // Factor 3: Formatting match (HTML tags preserved)
  const tagRegex = /<\/?[a-z][a-z0-9]*[^>]*>/gi;
  const sourceTags: string[] = source.match(tagRegex) ?? [];
  const translationTags: string[] = translation.match(tagRegex) ?? [];
  let formattingScore = 100;
  if (sourceTags.length > 0) {
    const missingTags = sourceTags.filter((t) => !translationTags.includes(t));
    formattingScore = Math.round(
      ((sourceTags.length - missingTags.length) / sourceTags.length) * 100,
    );
  }
  factors.push({ name: "formatting_match", score: formattingScore, weight: 0.2 });

  // Factor 4: Character set consistency
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const hebrewRegex = /[\u0590-\u05FF]/;
  let charsetScore = 100;
  if (locale.startsWith("ar") && !arabicRegex.test(translation)) {
    charsetScore = 10;
  } else if (locale.startsWith("he") && !hebrewRegex.test(translation)) {
    charsetScore = 10;
  }
  factors.push({ name: "charset_consistency", score: charsetScore, weight: 0.3 });

  // Calculate weighted overall score
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const weightedScore = factors.reduce(
    (sum, f) => sum + f.score * f.weight,
    0,
  );
  const score = Math.round(weightedScore / totalWeight);

  let level: QualityScore["level"];
  if (score >= 90) level = "excellent";
  else if (score >= 70) level = "good";
  else if (score >= 50) level = "fair";
  else level = "poor";

  return { score, level, factors };
}

// ---------------------------------------------------------------------------
// T0072 - Agency Partner Network
// ---------------------------------------------------------------------------

export interface AgencyPartner {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  specialties: string[];
  website: string;
  tier: "gold" | "silver" | "bronze";
}

export const MENA_AGENCY_PARTNERS: AgencyPartner[] = [
  {
    id: "ag-001",
    name: "Arabize",
    nameAr: "أرابايز",
    country: "SA",
    specialties: ["e-commerce", "luxury retail", "Shopify"],
    website: "https://arabize.example.com",
    tier: "gold",
  },
  {
    id: "ag-002",
    name: "Gulf Digital Solutions",
    nameAr: "حلول الخليج الرقمية",
    country: "AE",
    specialties: ["SaaS localization", "fintech", "mobile apps"],
    website: "https://gulfdigital.example.com",
    tier: "gold",
  },
  {
    id: "ag-003",
    name: "Nile Translations",
    nameAr: "ترجمات النيل",
    country: "EG",
    specialties: ["content marketing", "social media", "SEO"],
    website: "https://niletranslations.example.com",
    tier: "silver",
  },
  {
    id: "ag-004",
    name: "Kuwait Localize",
    nameAr: "كويت لوكالايز",
    country: "KW",
    specialties: ["retail", "food & beverage", "luxury brands"],
    website: "https://kuwaitlocalize.example.com",
    tier: "silver",
  },
  {
    id: "ag-005",
    name: "Riyadh Tech Translations",
    nameAr: "ترجمات رياض التقنية",
    country: "SA",
    specialties: ["technology", "government", "healthcare"],
    website: "https://riyadhtech.example.com",
    tier: "gold",
  },
  {
    id: "ag-006",
    name: "Cairo Creative",
    nameAr: "كايرو كرييتيف",
    country: "EG",
    specialties: ["fashion", "entertainment", "gaming"],
    website: "https://cairocreative.example.com",
    tier: "bronze",
  },
  {
    id: "ag-007",
    name: "Emirates Lingua",
    nameAr: "إمارات لينجوا",
    country: "AE",
    specialties: ["legal", "real estate", "hospitality"],
    website: "https://emirateslingua.example.com",
    tier: "silver",
  },
  {
    id: "ag-008",
    name: "Khaleeji Words",
    nameAr: "كلمات خليجية",
    country: "KW",
    specialties: ["education", "publishing", "children's content"],
    website: "https://khaleejiwords.example.com",
    tier: "bronze",
  },
];

export function getAgenciesByCountry(country: string): AgencyPartner[] {
  return MENA_AGENCY_PARTNERS.filter((a) => a.country === country);
}

// ---------------------------------------------------------------------------
// T0073 - Subdomain Support
// ---------------------------------------------------------------------------

export function resolveSubdomainLocale(
  hostname: string,
  config: Record<string, string>,
): string | null {
  // Extract subdomain: ar.example.com -> ar
  const parts = hostname.split(".");
  if (parts.length < 3) return null;

  const subdomain = parts[0];
  return config[subdomain] ?? null;
}

export function buildSubdomainUrl(baseUrl: string, locale: string): string {
  const url = new URL(baseUrl);
  const parts = url.hostname.split(".");

  // If already has a locale subdomain, replace it
  if (parts.length >= 3) {
    parts[0] = locale;
  } else {
    // Add locale as subdomain
    parts.unshift(locale);
  }

  url.hostname = parts.join(".");
  return url.toString();
}

export function getSubdomainConfig(
  locales: string[],
  baseDomain: string,
): Record<string, string> {
  const config: Record<string, string> = {};
  for (const locale of locales) {
    // Use the language part as the subdomain key
    const lang = locale.split("-")[0];
    config[lang] = locale;
  }
  return config;
}

// ---------------------------------------------------------------------------
// T0081 - Conditional Translation Rules
// ---------------------------------------------------------------------------

export interface TranslationRule {
  id: string;
  name: string;
  condition: {
    field: string;
    operator: "equals" | "contains" | "in" | "gt" | "lt";
    value: string;
  };
  action: "translate" | "skip" | "use_glossary" | "manual_review";
  targetLocales?: string[];
}

export function evaluateRule(
  rule: TranslationRule,
  resource: Record<string, unknown>,
): boolean {
  const fieldValue = getNestedValue(resource, rule.condition.field);
  if (fieldValue === undefined) return false;

  const stringValue = String(fieldValue);

  switch (rule.condition.operator) {
    case "equals":
      return stringValue === rule.condition.value;
    case "contains":
      return stringValue.includes(rule.condition.value);
    case "in": {
      const values = rule.condition.value.split(",").map((v) => v.trim());
      return values.includes(stringValue);
    }
    case "gt":
      return Number(fieldValue) > Number(rule.condition.value);
    case "lt":
      return Number(fieldValue) < Number(rule.condition.value);
    default:
      return false;
  }
}

export function getDefaultRules(): TranslationRule[] {
  return [
    {
      id: "rule-001",
      name: "Skip draft products",
      condition: { field: "status", operator: "equals", value: "draft" },
      action: "skip",
    },
    {
      id: "rule-002",
      name: "Manual review for luxury items",
      condition: { field: "tags", operator: "contains", value: "luxury" },
      action: "manual_review",
      targetLocales: ["ar-SA", "ar-AE"],
    },
    {
      id: "rule-003",
      name: "Use glossary for technical products",
      condition: { field: "product_type", operator: "in", value: "electronics,software,hardware" },
      action: "use_glossary",
    },
    {
      id: "rule-004",
      name: "Skip low-price items from premium localization",
      condition: { field: "price", operator: "lt", value: "10" },
      action: "translate",
      targetLocales: ["ar"],
    },
    {
      id: "rule-005",
      name: "Manual review for high-value items",
      condition: { field: "price", operator: "gt", value: "500" },
      action: "manual_review",
      targetLocales: ["ar-SA", "ar-AE", "ar-KW"],
    },
  ];
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
