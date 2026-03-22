/**
 * Reports - T0258 + T0259 + T0260: Export & Scheduling
 * Report generation, formatting, and scheduling system.
 */

import type { ReportConfig, ScheduledReport } from "./types";

// In-memory scheduled reports storage
const scheduledReports = new Map<string, ScheduledReport>();
let nextId = 1;

/**
 * Generate a report based on the given configuration.
 * Returns the data in the requested format wrapper.
 */
export function generateReport(
  config: ReportConfig,
): { data: unknown; format: string } {
  // In production, this would query actual data sources based on config.type.
  // Here we return structured placeholder data.
  const reportData: Record<string, unknown>[] = [
    {
      shop: config.shop,
      type: config.type,
      dateRange: config.dateRange,
      locales: config.locales || [],
      generatedAt: new Date().toISOString(),
    },
  ];

  switch (config.format) {
    case "csv":
      return { data: formatAsCSV(reportData), format: "csv" };
    case "pdf":
      return {
        data: formatAsPDFData(reportData, `${config.type} Report`),
        format: "pdf",
      };
    case "json":
    default:
      return { data: reportData, format: "json" };
  }
}

/**
 * Format an array of records as a CSV string.
 */
export function formatAsCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const lines: string[] = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      // Escape CSV values containing commas, quotes, or newlines
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    lines.push(values.join(","));
  }

  return lines.join("\n");
}

/**
 * Format data as structured PDF-ready data.
 * Returns an object suitable for PDF generation libraries.
 */
export function formatAsPDFData(
  data: Record<string, unknown>[],
  title: string,
): { title: string; rows: string[][]; generatedAt: string } {
  if (data.length === 0) {
    return { title, rows: [], generatedAt: new Date().toISOString() };
  }

  const headers = Object.keys(data[0]);
  const rows: string[][] = [headers];

  for (const row of data) {
    rows.push(
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        return typeof val === "object" ? JSON.stringify(val) : String(val);
      }),
    );
  }

  return {
    title,
    rows,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Create a scheduled report.
 */
export function createScheduledReport(
  report: Omit<ScheduledReport, "id">,
): ScheduledReport {
  const id = `report_${nextId++}_${Date.now()}`;
  const scheduled: ScheduledReport = { id, ...report };
  scheduledReports.set(id, scheduled);
  return scheduled;
}

/**
 * Get all scheduled reports for a shop.
 */
export function getScheduledReports(shop: string): ScheduledReport[] {
  const results: ScheduledReport[] = [];
  for (const report of scheduledReports.values()) {
    if (report.shop === shop) {
      results.push(report);
    }
  }
  return results;
}

/**
 * Delete a scheduled report by ID.
 */
export function deleteScheduledReport(id: string): boolean {
  return scheduledReports.delete(id);
}

/**
 * Calculate the next scheduled run time based on frequency.
 */
export function getNextScheduledRun(
  frequency: "daily" | "weekly" | "monthly",
  lastRun?: string,
): string {
  const base = lastRun ? new Date(lastRun) : new Date();

  switch (frequency) {
    case "daily":
      base.setDate(base.getDate() + 1);
      break;
    case "weekly":
      base.setDate(base.getDate() + 7);
      break;
    case "monthly":
      base.setMonth(base.getMonth() + 1);
      break;
  }

  return base.toISOString();
}
