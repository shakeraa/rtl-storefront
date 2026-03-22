/**
 * Trends - T0262: Historical Trends Analysis
 * Provides trend analysis, moving averages, and simple prediction.
 */

import type { HistoricalTrend } from "./types";

// In-memory trends storage: shop -> metric -> HistoricalTrend[]
const trendsStore = new Map<string, Map<string, HistoricalTrend[]>>();

/**
 * Record a historical metric data point.
 */
export function recordTrendPoint(
  shop: string,
  metric: string,
  value: number,
  locale?: string,
): void {
  if (!trendsStore.has(shop)) {
    trendsStore.set(shop, new Map());
  }
  const shopTrends = trendsStore.get(shop)!;

  if (!shopTrends.has(metric)) {
    shopTrends.set(metric, []);
  }
  const metricTrends = shopTrends.get(metric)!;

  metricTrends.push({
    date: new Date().toISOString().split("T")[0],
    metric,
    value,
    locale,
  });

  // Keep last 365 days of data per metric
  if (metricTrends.length > 365) {
    metricTrends.splice(0, metricTrends.length - 365);
  }
}

/**
 * Get historical trends for a specific metric over a number of days.
 */
export function getHistoricalTrends(
  shop: string,
  metric: string,
  days: number,
): HistoricalTrend[] {
  const shopTrends = trendsStore.get(shop);
  if (!shopTrends) return [];

  const metricTrends = shopTrends.get(metric);
  if (!metricTrends) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  return metricTrends.filter((t) => t.date >= cutoffStr);
}

/**
 * Determine trend direction from a series of values.
 * Compares the average of the first third to the average of the last third.
 */
export function calculateTrendDirection(
  values: number[],
): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";

  const thirdLen = Math.max(1, Math.floor(values.length / 3));
  const firstThird = values.slice(0, thirdLen);
  const lastThird = values.slice(-thirdLen);

  const avgFirst = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
  const avgLast = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;

  const changePercent =
    avgFirst === 0 ? (avgLast > 0 ? 100 : 0) : ((avgLast - avgFirst) / avgFirst) * 100;

  if (changePercent > 5) return "up";
  if (changePercent < -5) return "down";
  return "stable";
}

/**
 * Calculate a simple moving average over a given window size.
 */
export function calculateMovingAverage(
  values: number[],
  window: number,
): number[] {
  if (values.length === 0 || window <= 0) return [];
  if (window > values.length) window = values.length;

  const result: number[] = [];

  for (let i = 0; i <= values.length - window; i++) {
    let sum = 0;
    for (let j = i; j < i + window; j++) {
      sum += values[j];
    }
    result.push(Math.round((sum / window) * 100) / 100);
  }

  return result;
}

/**
 * Predict the next value using simple linear regression.
 * Fits a line y = mx + b to the data and extrapolates.
 */
export function predictNextValue(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  const n = values.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return values[n - 1];

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Predict for x = n (next index)
  return Math.round((slope * n + intercept) * 100) / 100;
}
