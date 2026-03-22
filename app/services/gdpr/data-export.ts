/**
 * T0189 — Enhanced GDPR Data Export Service
 *
 * Builds portable data-export packages containing translations, settings,
 * and analytics data for a given shop, in JSON or CSV format.
 */

import type { DataExportRequest, DataExportPackage } from "./types";
import db from "../../db.server";

/**
 * Create a full data-export package for the requesting shop.
 */
export async function createExportPackage(
  request: DataExportRequest,
): Promise<DataExportPackage> {
  const sections: Record<string, unknown[]> = {};

  // Always include shop settings
  sections["settings"] = [
    {
      shop: request.shop,
      defaultLocale: "en",
      enabledLocales: ["en", "ar"],
      rtlEnabled: true,
    },
  ];

  if (request.includeTranslations) {
    const translationMemory = await db.translationMemory.findMany({
      where: { shop: request.shop },
    });
    sections["translation_memory"] = translationMemory;

    const glossaryEntries = await db.glossaryEntry.findMany({
      where: { shop: request.shop },
    });
    sections["glossary"] = glossaryEntries;

    const translationCache = await db.translationCache.findMany({
      where: { sourceLocale: { not: undefined } },
      take: 1000,
    });
    sections["translations"] = translationCache;
  }

  if (request.includeAnalytics) {
    const dataAccessLogs = await db.dataAccessLog.findMany({
      where: { shop: request.shop },
    });
    sections["data_access_logs"] = dataAccessLogs;
  }

  const totalRecords = Object.values(sections).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const serialized =
    request.format === "csv"
      ? Object.values(sections)
          .flat()
          .map((row) => formatAsCSV([row as Record<string, unknown>]))
          .join("")
      : JSON.stringify(sections);

  const sizeBytes = new TextEncoder().encode(serialized).length;

  return {
    shop: request.shop,
    exportedAt: new Date().toISOString(),
    format: request.format,
    sections,
    metadata: { totalRecords, sizeBytes },
  };
}

/**
 * Convert an array of flat objects into a CSV string (headers + rows).
 */
export function formatAsCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const headerLine = headers.map(escapeCSVField).join(",");

  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        return escapeCSVField(val === undefined || val === null ? "" : String(val));
      })
      .join(","),
  );

  return [headerLine, ...rows].join("\n") + "\n";
}

/**
 * Estimate the size of an export before generating it.
 */
export async function estimateExportSize(
  shop: string,
): Promise<{ estimatedRecords: number; estimatedSizeMB: number }> {
  const estimatedRecords = await db.translationMemory.count({
    where: { shop },
  });
  const avgRecordBytes = 256;
  const estimatedSizeMB =
    Math.round((estimatedRecords * avgRecordBytes) / (1024 * 1024) * 100) / 100;

  return { estimatedRecords, estimatedSizeMB: Math.max(estimatedSizeMB, 0.01) };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
