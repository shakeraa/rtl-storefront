/**
 * ROI Calculator - T0257: Translation ROI Calculation
 * Calculates return on investment for translation efforts by locale.
 */

import type { ROIMetrics } from "./types";

// In-memory ROI data: shop -> locale -> { cost, revenue, orders }
const roiStore = new Map<
  string,
  Map<string, { cost: number; revenue: number; orders: number }>
>();

/**
 * Calculate ROI as a percentage: (revenue - cost) / cost * 100
 */
export function calculateROI(translationCost: number, revenue: number): number {
  if (translationCost === 0) return 0;
  return Math.round(((revenue - translationCost) / translationCost) * 10000) / 100;
}

/**
 * Record translation cost for a locale.
 */
export function recordTranslationCost(
  shop: string,
  locale: string,
  cost: number,
): void {
  ensureLocaleEntry(shop, locale);
  const entry = roiStore.get(shop)!.get(locale)!;
  entry.cost += cost;
}

/**
 * Record revenue attributed to a locale.
 */
export function recordLocaleRevenue(
  shop: string,
  locale: string,
  revenue: number,
  orders: number = 1,
): void {
  ensureLocaleEntry(shop, locale);
  const entry = roiStore.get(shop)!.get(locale)!;
  entry.revenue += revenue;
  entry.orders += orders;
}

/**
 * Get ROI metrics for all tracked locales.
 */
export function getROIByLocale(shop: string): ROIMetrics[] {
  const shopData = roiStore.get(shop);
  if (!shopData) return [];

  const results: ROIMetrics[] = [];

  for (const [locale, data] of shopData.entries()) {
    results.push({
      locale,
      translationCost: data.cost,
      revenue: data.revenue,
      orders: data.orders,
      roi: calculateROI(data.cost, data.revenue),
      revenuePerOrder: data.orders > 0
        ? Math.round((data.revenue / data.orders) * 100) / 100
        : 0,
    });
  }

  return results.sort((a, b) => b.roi - a.roi);
}

/**
 * Estimate ROI based on projected metrics.
 * @param translationCost - Total translation investment
 * @param expectedConversionLift - Expected conversion rate improvement (e.g., 0.02 for 2%)
 * @param avgOrderValue - Average order value in base currency
 * @param monthlyVisitors - Expected monthly visitors for the locale
 * @returns Estimated ROI percentage
 */
export function estimateROI(
  translationCost: number,
  expectedConversionLift: number,
  avgOrderValue: number,
  monthlyVisitors: number,
): number {
  const additionalRevenue =
    monthlyVisitors * expectedConversionLift * avgOrderValue * 12;
  return calculateROI(translationCost, additionalRevenue);
}

/**
 * Calculate break-even point in months.
 * @param monthlyCost - Ongoing monthly translation cost
 * @param revenuePerMonth - Additional monthly revenue from translations
 * @returns Number of months to break even, or Infinity if not achievable
 */
export function getBreakEvenPoint(
  monthlyCost: number,
  revenuePerMonth: number,
): number {
  if (revenuePerMonth <= monthlyCost) return Infinity;
  const netMonthlyGain = revenuePerMonth - monthlyCost;
  return Math.ceil(monthlyCost / netMonthlyGain);
}

function ensureLocaleEntry(shop: string, locale: string): void {
  if (!roiStore.has(shop)) {
    roiStore.set(shop, new Map());
  }
  const shopData = roiStore.get(shop)!;
  if (!shopData.has(locale)) {
    shopData.set(locale, { cost: 0, revenue: 0, orders: 0 });
  }
}
