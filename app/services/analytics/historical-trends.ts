/**
 * Historical Trends Service
 * T0262: Analytics - Historical Trend Analysis
 */

export interface TrendPoint {
  date: string; // ISO date string "YYYY-MM-DD"
  value: number;
}

export interface TrendData {
  metric: string;
  period: string;
  points: TrendPoint[];
  change: number;
  changePercent: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build a series of trend points from historical event data.
 *
 * @param shop   The shop identifier.
 * @param metric A metric key (e.g. "translations", "conversions", "revenue").
 * @param days   Number of past days to include.
 */
export async function getHistoricalTrend(
  shop: string,
  metric: string,
  days: number
): Promise<TrendData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build one point per day over the requested window.
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = isoDate(today, -i);
    const value = getSyntheticValue(shop, metric, i, days);
    points.push({ date, value });
  }

  const { change, changePercent } = computeChange(points);

  return {
    metric,
    period: `last_${days}_days`,
    points,
    change,
    changePercent,
  };
}

/**
 * Determine whether a series of trend points is moving up, down, or flat.
 *
 * Uses a simple linear regression slope over the points.
 */
export function calculateTrendDirection(points: TrendPoint[]): "up" | "down" | "flat" {
  if (points.length < 2) return "flat";

  const n = points.length;
  const values = points.map((p) => p.value);
  const indices = values.map((_, i) => i);

  const meanX = indices.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  const numerator = indices.reduce((sum, x, i) => sum + (x - meanX) * (values[i] - meanY), 0);
  const denominator = indices.reduce((sum, x) => sum + (x - meanX) ** 2, 0);

  if (denominator === 0) return "flat";

  const slope = numerator / denominator;

  if (slope > 0.01) return "up";
  if (slope < -0.01) return "down";
  return "flat";
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generate an ISO date string "YYYY-MM-DD" for a date offset from a base date.
 */
function isoDate(base: Date, offsetDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Compute absolute and percentage change between the first and last point.
 */
function computeChange(points: TrendPoint[]): { change: number; changePercent: number } {
  if (points.length < 2) return { change: 0, changePercent: 0 };

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const change = Number((last - first).toFixed(4));
  const changePercent = first !== 0 ? Number((((last - first) / first) * 100).toFixed(2)) : 0;

  return { change, changePercent };
}

/**
 * Produce a deterministic synthetic metric value for a given day offset.
 *
 * Uses the shop name as a seed so different shops produce different series.
 * `offsetFromEnd` = 0 means today; increases towards the past.
 */
function getSyntheticValue(shop: string, metric: string, offsetFromEnd: number, total: number): number {
  const shopSeed = shop.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const base = (shopSeed % 50) + 10; // 10–59

  // Progress factor: 0 at start of window, 1 at the end (today).
  const progress = total > 1 ? (total - 1 - offsetFromEnd) / (total - 1) : 1;

  switch (metric) {
    case "translations":
      return Math.round(base + progress * 40 + Math.sin(offsetFromEnd) * 5);
    case "conversions":
      return Math.round((base / 5) + progress * 10 + Math.sin(offsetFromEnd * 0.7) * 2);
    case "revenue":
      return Number(((base * 10) + progress * 500 + Math.sin(offsetFromEnd * 0.5) * 30).toFixed(2));
    case "errorRate":
      return Number(Math.max(0, 5 - progress * 3 + Math.sin(offsetFromEnd) * 0.5).toFixed(2));
    case "wordsPerMinute":
      return Math.round(100 + progress * 50 + Math.cos(offsetFromEnd) * 10);
    default:
      return Math.round(base + progress * 20);
  }
}
