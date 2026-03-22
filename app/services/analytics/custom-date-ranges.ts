/**
 * Custom Date Ranges Service
 * T0279: Analytics - Custom Date Range Support
 */

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Return a standard set of preset date ranges relative to today.
 */
export function getPresetDateRanges(): DateRange[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  const last7Start = new Date(startOfToday);
  last7Start.setDate(last7Start.getDate() - 6);

  const last30Start = new Date(startOfToday);
  last30Start.setDate(last30Start.getDate() - 29);

  const last90Start = new Date(startOfToday);
  last90Start.setDate(last90Start.getDate() - 89);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  lastMonthStart.setHours(0, 0, 0, 0);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  lastMonthEnd.setHours(23, 59, 59, 999);

  const yearStart = new Date(today.getFullYear(), 0, 1);
  yearStart.setHours(0, 0, 0, 0);

  return [
    { start: startOfToday, end: today, label: "Today" },
    { start: yesterday, end: endOfYesterday, label: "Yesterday" },
    { start: last7Start, end: today, label: "Last 7 days" },
    { start: last30Start, end: today, label: "Last 30 days" },
    { start: last90Start, end: today, label: "Last 90 days" },
    { start: monthStart, end: today, label: "This month" },
    { start: lastMonthStart, end: lastMonthEnd, label: "Last month" },
    { start: yearStart, end: today, label: "Year to date" },
  ];
}

/**
 * Parse a date range from two ISO date strings (or any string accepted by `Date`).
 *
 * The start date is normalised to the beginning of the day (00:00:00.000) and
 * the end date is normalised to the end of the day (23:59:59.999).
 *
 * @throws {Error} if either string is not a valid date, or if start > end.
 */
export function parseDateRange(start: string, end: string): DateRange {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime())) {
    throw new Error(`Invalid start date: "${start}"`);
  }
  if (isNaN(endDate.getTime())) {
    throw new Error(`Invalid end date: "${end}"`);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  if (startDate > endDate) {
    throw new Error("Start date must be before or equal to end date");
  }

  const label = `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`;

  return { start: startDate, end: endDate, label };
}

/**
 * Compare two date ranges and return their respective day counts.
 */
export function compareDateRanges(
  current: DateRange,
  previous: DateRange
): { currentDays: number; previousDays: number } {
  return {
    currentDays: daysBetween(current.start, current.end),
    previousDays: daysBetween(previous.start, previous.end),
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Return the number of calendar days spanned by [start, end] (inclusive).
 */
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(Math.abs(end.getTime() - start.getTime()) / msPerDay) + 1;
}

/**
 * Format a Date to a short human-readable label, e.g. "Mar 1, 2026".
 */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
