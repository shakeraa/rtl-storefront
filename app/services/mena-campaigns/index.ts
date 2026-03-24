/**
 * MENA Campaigns Service
 *
 * T0025 - Hydrogen/Headless API Stub
 * T0045 - Activity Audit Log
 * T0049 - Regional Logistics Providers
 * T0059 - Hijri Date Display
 * T0061 - National Day Campaign Templates
 */

// ===========================================================================
// T0025 - Hydrogen/Headless Stub
// ===========================================================================

export interface HeadlessConfig {
  framework: "hydrogen" | "next" | "gatsby" | "custom";
  apiEndpoint: string;
  storefrontToken: string;
}

/**
 * Return the API shape for headless consumers to use for translations.
 */
export function getHeadlessTranslationAPI(): {
  endpoint: string;
  methods: string[];
} {
  return {
    endpoint: "/api/translations",
    methods: [
      "GET /api/translations/:locale",
      "GET /api/translations/:locale/:resourceType",
      "GET /api/translations/:locale/:resourceType/:resourceId",
      "POST /api/translations/bulk",
      "GET /api/translations/locales",
      "GET /api/translations/coverage",
    ],
  };
}

/**
 * Validate an incoming headless API request.
 * Checks for required storefront token and shop header.
 */
export function validateHeadlessRequest(
  request: Request,
): { valid: boolean; shop?: string } {
  const shop = request.headers.get("X-Shopify-Shop-Domain");
  const token = request.headers.get("X-Shopify-Storefront-Token");

  if (!shop || !token) {
    return { valid: false };
  }

  // In production, validate the token against the shop's storefront access token.
  // This is a stub that accepts any non-empty token.
  return { valid: true, shop };
}

// ===========================================================================
// T0045 - Activity Audit Log
// ===========================================================================

export interface ActivityEntry {
  id: string;
  shop: string;
  user: string;
  action: string;
  details: string;
  timestamp: Date;
}

/** In-memory activity store (replaced by DB in production) */
const activityStore: ActivityEntry[] = [];

let activityIdCounter = 0;

/**
 * Log a new activity entry.
 */
export function logActivity(
  shop: string,
  user: string,
  action: string,
  details: string,
): ActivityEntry {
  activityIdCounter++;
  const entry: ActivityEntry = {
    id: `act_${activityIdCounter}_${Date.now()}`,
    shop,
    user,
    action,
    details,
    timestamp: new Date(),
  };
  activityStore.push(entry);
  return entry;
}

/**
 * Get the activity feed for a shop, ordered newest first.
 */
export function getActivityFeed(
  shop: string,
  limit: number = 50,
): ActivityEntry[] {
  return activityStore
    .filter((e) => e.shop === shop)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Get activity entries for a specific user within a shop.
 */
export function getActivityByUser(
  shop: string,
  user: string,
): ActivityEntry[] {
  return activityStore
    .filter((e) => e.shop === shop && e.user === user)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Export the activity log for a shop in JSON or CSV format.
 */
export function exportActivityLog(
  shop: string,
  format: "json" | "csv",
): string {
  const entries = activityStore
    .filter((e) => e.shop === shop)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (format === "json") {
    return JSON.stringify(entries, null, 2);
  }

  // CSV format
  const header = "id,shop,user,action,details,timestamp";
  const rows = entries.map((e) => {
    const escapeCsv = (val: string) =>
      val.includes(",") || val.includes('"') || val.includes("\n")
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    return [
      e.id,
      escapeCsv(e.shop),
      escapeCsv(e.user),
      escapeCsv(e.action),
      escapeCsv(e.details),
      e.timestamp.toISOString(),
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

// ===========================================================================
// T0049 - Regional Logistics
// ===========================================================================

export interface LogisticsProvider {
  id: string;
  name: string;
  nameAr: string;
  countries: string[];
  trackingUrl: string;
}

export const MENA_LOGISTICS_PROVIDERS: LogisticsProvider[] = [
  {
    id: "aramex",
    name: "Aramex",
    nameAr: "أرامكس",
    countries: ["SA", "AE", "KW", "BH", "QA", "OM", "EG", "JO", "LB", "IQ", "MA"],
    trackingUrl: "https://www.aramex.com/track/results?ShipmentNumber={{tracking}}",
  },
  {
    id: "fetchr",
    name: "Fetchr",
    nameAr: "فيتشر",
    countries: ["AE", "SA", "KW", "BH"],
    trackingUrl: "https://www.fetchr.us/track/{{tracking}}",
  },
  {
    id: "smsa",
    name: "SMSA Express",
    nameAr: "سمسا إكسبريس",
    countries: ["SA"],
    trackingUrl: "https://www.smsaexpress.com/track/{{tracking}}",
  },
  {
    id: "naqel",
    name: "Naqel Express",
    nameAr: "ناقل إكسبريس",
    countries: ["SA", "AE", "KW", "BH", "QA", "OM"],
    trackingUrl: "https://www.naqelexpress.com/tracking?awb={{tracking}}",
  },
  {
    id: "jt-express-me",
    name: "J&T Express ME",
    nameAr: "جي آند تي إكسبريس",
    countries: ["SA", "AE", "EG"],
    trackingUrl: "https://www.jtexpress.ae/track?billcode={{tracking}}",
  },
];

/**
 * Get logistics providers that serve a specific country.
 */
export function getLogisticsProviders(country: string): LogisticsProvider[] {
  const code = country.toUpperCase();
  return MENA_LOGISTICS_PROVIDERS.filter((p) => p.countries.includes(code));
}

/**
 * Build a tracking URL for a given provider and tracking number.
 */
export function buildTrackingUrl(
  providerId: string,
  trackingNumber: string,
): string {
  const provider = MENA_LOGISTICS_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) {
    throw new Error(`Logistics provider not found: ${providerId}`);
  }
  return provider.trackingUrl.replace("{{tracking}}", encodeURIComponent(trackingNumber));
}

// ===========================================================================
// T0059 - Hijri Date Display
// ===========================================================================

/**
 * Format a Gregorian date as a Hijri date string using Intl.
 */
export function formatHijriDate(date: Date, locale: string): string {
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      calendar: "islamic-umalqura",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatter.format(date);
  } catch {
    // Fallback if the runtime doesn't support islamic-umalqura
    return date.toLocaleDateString(locale);
  }
}

/**
 * Get both Hijri and Gregorian representations of a date,
 * plus a combined display string.
 */
export function getHijriDateWidget(
  date: Date,
  locale: string,
): { hijri: string; gregorian: string; combined: string } {
  const hijri = formatHijriDate(date, locale);
  const gregorian = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isArabic = locale === "ar" || locale.startsWith("ar-");
  const combined = isArabic
    ? `${hijri} \u2022 ${gregorian}`
    : `${gregorian} \u2022 ${hijri}`;

  return { hijri, gregorian, combined };
}

/**
 * Known Islamic holidays (approximate Hijri dates).
 * Because Islamic holidays follow the lunar Hijri calendar, exact Gregorian
 * dates shift each year. This uses Intl to check the Hijri month/day.
 */
const ISLAMIC_HOLIDAYS: Array<{
  hijriMonth: number;
  hijriDay: number;
  name: string;
  nameAr: string;
}> = [
  { hijriMonth: 1, hijriDay: 1, name: "Islamic New Year", nameAr: "\u0631\u0623\u0633 \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0647\u062C\u0631\u064A\u0629" },
  { hijriMonth: 1, hijriDay: 10, name: "Day of Ashura", nameAr: "\u064A\u0648\u0645 \u0639\u0627\u0634\u0648\u0631\u0627\u0621" },
  { hijriMonth: 3, hijriDay: 12, name: "Mawlid al-Nabi", nameAr: "\u0627\u0644\u0645\u0648\u0644\u062F \u0627\u0644\u0646\u0628\u0648\u064A" },
  { hijriMonth: 7, hijriDay: 27, name: "Isra and Mi'raj", nameAr: "\u0627\u0644\u0625\u0633\u0631\u0627\u0621 \u0648\u0627\u0644\u0645\u0639\u0631\u0627\u062C" },
  { hijriMonth: 9, hijriDay: 1, name: "Ramadan Begins", nameAr: "\u0628\u062F\u0627\u064A\u0629 \u0631\u0645\u0636\u0627\u0646" },
  { hijriMonth: 10, hijriDay: 1, name: "Eid al-Fitr", nameAr: "\u0639\u064A\u062F \u0627\u0644\u0641\u0637\u0631" },
  { hijriMonth: 12, hijriDay: 10, name: "Eid al-Adha", nameAr: "\u0639\u064A\u062F \u0627\u0644\u0623\u0636\u062D\u0649" },
];

/**
 * Check if a given date falls on a known Islamic holiday.
 */
export function isIslamicHoliday(
  date: Date,
): { isHoliday: boolean; name?: string; nameAr?: string } {
  try {
    const dayFormatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      day: "numeric",
    });
    const monthFormatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      month: "numeric",
    });

    const hijriDay = parseInt(dayFormatter.format(date), 10);
    const hijriMonth = parseInt(monthFormatter.format(date), 10);

    const holiday = ISLAMIC_HOLIDAYS.find(
      (h) => h.hijriMonth === hijriMonth && h.hijriDay === hijriDay,
    );

    if (holiday) {
      return { isHoliday: true, name: holiday.name, nameAr: holiday.nameAr };
    }

    return { isHoliday: false };
  } catch {
    return { isHoliday: false };
  }
}

// ===========================================================================
// T0061 - National Day Templates (consolidated into ./national-day.ts)
// ===========================================================================

export {
  getNationalDayTemplate,
  getNationalDayCampaign,
  getUpcomingNationalDays,
  generateBannerHtml,
  getSupportedCountries,
  getCountryName,
  hasNationalDayTemplate,
  formatCountdown as formatNationalDayCountdown,
  NATIONAL_DAY_TEMPLATES,
} from "./national-day";
