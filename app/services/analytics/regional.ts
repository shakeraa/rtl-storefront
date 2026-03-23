/**
 * Regional Conversion Analytics Service
 * T0394: Country/dialect metrics, holiday impact, and localization ROI
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface CountryMetrics {
  country: string;
  revenue: number;
  orders: number;
  conversionRate: number;
  avgOrderValue: number;
  topPaymentMethod: string;
}

export interface DialectMetrics {
  dialect: string;
  pageViews: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export interface HolidayImpact {
  holiday: string;
  period: { start: Date; end: Date };
  revenueBaseline: number;
  revenueDuring: number;
  lift: number;
}

export interface PaymentMethodStat {
  method: string;
  count: number;
  revenue: number;
  conversionRate: number;
}

export interface LocalizationROI {
  revenueLift: number;
  conversionLift: number;
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Event type used across aggregation helpers
// ---------------------------------------------------------------------------

export interface AnalyticsEvent {
  country: string;
  dialect?: string;
  paymentMethod?: string;
  revenue: number;
  converted: boolean;
  pageView?: boolean;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MENA_COUNTRIES: Array<{ code: string; en: string; ar: string; he: string }> = [
  { code: "SA", en: "Saudi Arabia", ar: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", he: "\u05E2\u05E8\u05D1 \u05D4\u05E1\u05E2\u05D5\u05D3\u05D9\u05EA" },
  { code: "AE", en: "United Arab Emirates", ar: "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", he: "\u05D0\u05D9\u05D7\u05D5\u05D3 \u05D4\u05D0\u05DE\u05D9\u05E8\u05D5\u05D9\u05D5\u05EA" },
  { code: "EG", en: "Egypt", ar: "\u0645\u0635\u0631", he: "\u05DE\u05E6\u05E8\u05D9\u05DD" },
  { code: "IL", en: "Israel", ar: "\u0625\u0633\u0631\u0627\u0626\u064A\u0644", he: "\u05D9\u05E9\u05E8\u05D0\u05DC" },
  { code: "JO", en: "Jordan", ar: "\u0627\u0644\u0623\u0631\u062F\u0646", he: "\u05D9\u05E8\u05D3\u05DF" },
  { code: "KW", en: "Kuwait", ar: "\u0627\u0644\u0643\u0648\u064A\u062A", he: "\u05DB\u05D5\u05D5\u05D9\u05EA" },
  { code: "QA", en: "Qatar", ar: "\u0642\u0637\u0631", he: "\u05E7\u05D8\u05D0\u05E8" },
  { code: "BH", en: "Bahrain", ar: "\u0627\u0644\u0628\u062D\u0631\u064A\u0646", he: "\u05D1\u05D7\u05E8\u05D9\u05D9\u05DF" },
  { code: "OM", en: "Oman", ar: "\u0639\u064F\u0645\u0627\u0646", he: "\u05E2\u05D5\u05DE\u05DF" },
  { code: "LB", en: "Lebanon", ar: "\u0644\u0628\u0646\u0627\u0646", he: "\u05DC\u05D1\u05E0\u05D5\u05DF" },
  { code: "MA", en: "Morocco", ar: "\u0627\u0644\u0645\u063A\u0631\u0628", he: "\u05DE\u05E8\u05D5\u05E7\u05D5" },
  { code: "TN", en: "Tunisia", ar: "\u062A\u0648\u0646\u0633", he: "\u05EA\u05D5\u05E0\u05D9\u05E1\u05D9\u05D4" },
];

export const HOLIDAYS = [
  { id: "ramadan", name: "Ramadan", nameAr: "\u0631\u0645\u0636\u0627\u0646" },
  { id: "eid-al-fitr", name: "Eid al-Fitr", nameAr: "\u0639\u064A\u062F \u0627\u0644\u0641\u0637\u0631" },
  { id: "eid-al-adha", name: "Eid al-Adha", nameAr: "\u0639\u064A\u062F \u0627\u0644\u0623\u0636\u062D\u0649" },
  { id: "hanukkah", name: "Hanukkah", nameHe: "\u05D7\u05E0\u05D5\u05DB\u05D4" },
  { id: "white-friday", name: "White Friday", nameAr: "\u0627\u0644\u062C\u0645\u0639\u0629 \u0627\u0644\u0628\u064A\u0636\u0627\u0621" },
] as const;

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

/**
 * Aggregate analytics events by country.
 */
export function getCountryMetrics(events: AnalyticsEvent[]): CountryMetrics[] {
  const byCountry = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    const arr = byCountry.get(e.country) || [];
    arr.push(e);
    byCountry.set(e.country, arr);
  }

  const results: CountryMetrics[] = [];
  for (const [country, countryEvents] of byCountry) {
    const orders = countryEvents.filter((e) => e.converted).length;
    const revenue = countryEvents.reduce((sum, e) => sum + e.revenue, 0);
    const conversionRate = countryEvents.length > 0 ? orders / countryEvents.length : 0;
    const avgOrderValue = orders > 0 ? revenue / orders : 0;

    // Find top payment method
    const methodCounts = new Map<string, number>();
    for (const e of countryEvents) {
      if (e.paymentMethod) {
        methodCounts.set(e.paymentMethod, (methodCounts.get(e.paymentMethod) || 0) + 1);
      }
    }
    let topPaymentMethod = "unknown";
    let maxCount = 0;
    for (const [method, count] of methodCounts) {
      if (count > maxCount) {
        maxCount = count;
        topPaymentMethod = method;
      }
    }

    results.push({ country, revenue, orders, conversionRate, avgOrderValue, topPaymentMethod });
  }

  return results;
}

/**
 * Aggregate analytics events by dialect.
 */
export function getDialectMetrics(events: AnalyticsEvent[]): DialectMetrics[] {
  const byDialect = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    const dialect = e.dialect || "unknown";
    const arr = byDialect.get(dialect) || [];
    arr.push(e);
    byDialect.set(dialect, arr);
  }

  const results: DialectMetrics[] = [];
  for (const [dialect, dialectEvents] of byDialect) {
    const pageViews = dialectEvents.filter((e) => e.pageView).length;
    const conversions = dialectEvents.filter((e) => e.converted).length;
    const revenue = dialectEvents.reduce((sum, e) => sum + e.revenue, 0);
    const conversionRate = dialectEvents.length > 0 ? conversions / dialectEvents.length : 0;

    results.push({ dialect, pageViews, conversions, revenue, conversionRate });
  }

  return results;
}

/**
 * Get payment method statistics for a given country.
 */
export function getPaymentMethodStats(
  events: AnalyticsEvent[],
  country: string,
): PaymentMethodStat[] {
  const countryEvents = events.filter((e) => e.country === country);
  const byMethod = new Map<string, AnalyticsEvent[]>();

  for (const e of countryEvents) {
    const method = e.paymentMethod || "unknown";
    const arr = byMethod.get(method) || [];
    arr.push(e);
    byMethod.set(method, arr);
  }

  const results: PaymentMethodStat[] = [];
  for (const [method, methodEvents] of byMethod) {
    const count = methodEvents.length;
    const revenue = methodEvents.reduce((sum, e) => sum + e.revenue, 0);
    const conversions = methodEvents.filter((e) => e.converted).length;
    const conversionRate = count > 0 ? conversions / count : 0;

    results.push({ method, count, revenue, conversionRate });
  }

  return results;
}

/**
 * Calculate the impact of a holiday period on revenue.
 */
export function getHolidayImpact(
  events: AnalyticsEvent[],
  holiday: { name: string; start: Date; end: Date },
): HolidayImpact {
  const duringEvents = events.filter(
    (e) => e.timestamp >= holiday.start && e.timestamp <= holiday.end,
  );
  const baselineEvents = events.filter(
    (e) => e.timestamp < holiday.start || e.timestamp > holiday.end,
  );

  const revenueDuring = duringEvents.reduce((sum, e) => sum + e.revenue, 0);
  const revenueBaseline = baselineEvents.reduce((sum, e) => sum + e.revenue, 0);

  // Normalize baseline to the same period length
  const holidayDays = Math.max(
    1,
    (holiday.end.getTime() - holiday.start.getTime()) / (1000 * 60 * 60 * 24),
  );
  const baselineDays = Math.max(1, baselineEvents.length > 0 ? 30 : 1); // approximate
  const normalizedBaseline = (revenueBaseline / baselineDays) * holidayDays;

  const lift = normalizedBaseline > 0 ? (revenueDuring - normalizedBaseline) / normalizedBaseline : 0;

  return {
    holiday: holiday.name,
    period: { start: holiday.start, end: holiday.end },
    revenueBaseline: normalizedBaseline,
    revenueDuring,
    lift,
  };
}

/**
 * Calculate localization ROI by comparing before/after event sets.
 */
export function getLocalizationROI(
  beforeEvents: AnalyticsEvent[],
  afterEvents: AnalyticsEvent[],
): LocalizationROI {
  const beforeRevenue = beforeEvents.reduce((sum, e) => sum + e.revenue, 0);
  const afterRevenue = afterEvents.reduce((sum, e) => sum + e.revenue, 0);

  const beforeConversions = beforeEvents.filter((e) => e.converted).length;
  const afterConversions = afterEvents.filter((e) => e.converted).length;

  const beforeConvRate = beforeEvents.length > 0 ? beforeConversions / beforeEvents.length : 0;
  const afterConvRate = afterEvents.length > 0 ? afterConversions / afterEvents.length : 0;

  const revenueLift = beforeRevenue > 0 ? (afterRevenue - beforeRevenue) / beforeRevenue : 0;
  const conversionLift = beforeConvRate > 0 ? (afterConvRate - beforeConvRate) / beforeConvRate : 0;

  let recommendation: string;
  if (revenueLift > 0.2 && conversionLift > 0.1) {
    recommendation = "Strong positive impact. Continue current localization strategy and expand to more markets.";
  } else if (revenueLift > 0 || conversionLift > 0) {
    recommendation = "Moderate positive impact. Consider deeper localization (dialect adaptation, cultural imagery).";
  } else {
    recommendation = "No measurable lift yet. Review translation quality, cultural fit, and payment method coverage.";
  }

  return { revenueLift, conversionLift, recommendation };
}
