/**
 * Scheduled Reports Service
 * T0260: Analytics - Scheduled Report Generation
 */

export interface ScheduledReport {
  id: string;
  shop: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  metrics: string[];
  lastSentAt: Date | null;
  nextSendAt: Date;
}

// In-memory store (production would use a database)
const reportStore: ScheduledReport[] = [];

/**
 * Calculate the next send date based on frequency and a reference date.
 */
export function calculateNextSendDate(frequency: string, from: Date): Date {
  const next = new Date(from);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }

  return next;
}

/**
 * Create a new scheduled report for a shop.
 */
export async function createScheduledReport(
  shop: string,
  config: Omit<ScheduledReport, "id" | "shop" | "lastSentAt" | "nextSendAt">
): Promise<ScheduledReport> {
  const now = new Date();
  const report: ScheduledReport = {
    id: `sr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shop,
    name: config.name,
    frequency: config.frequency,
    recipients: [...config.recipients],
    metrics: [...config.metrics],
    lastSentAt: null,
    nextSendAt: calculateNextSendDate(config.frequency, now),
  };

  reportStore.push(report);
  return report;
}

/**
 * Get all scheduled reports for a shop.
 */
export async function getScheduledReports(shop: string): Promise<ScheduledReport[]> {
  return reportStore.filter((r) => r.shop === shop);
}

/**
 * Process all scheduled reports that are due. Returns the count of reports sent.
 *
 * In production this would send emails / call external APIs. Here it records
 * dispatch by updating lastSentAt and scheduling the next send.
 */
export async function processScheduledReports(): Promise<number> {
  const now = new Date();
  let sentCount = 0;

  for (const report of reportStore) {
    if (report.nextSendAt <= now) {
      // In production: dispatch the report to report.recipients
      console.log(
        `[ScheduledReports] Sending report "${report.name}" for shop "${report.shop}" to ${report.recipients.join(", ")}`
      );

      report.lastSentAt = new Date(now);
      report.nextSendAt = calculateNextSendDate(report.frequency, now);
      sentCount++;
    }
  }

  return sentCount;
}

/**
 * Remove all stored reports (for testing).
 */
export function clearScheduledReports(): void {
  reportStore.length = 0;
}

/**
 * Get the total number of stored reports (for testing).
 */
export function getScheduledReportCount(): number {
  return reportStore.length;
}
