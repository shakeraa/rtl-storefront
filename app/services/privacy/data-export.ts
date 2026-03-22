import prisma from "../../db.server";
import type { DataExportResult } from "./types";
export type { DataExportResult };

/**
 * Mask sensitive fields in session data for GDPR-compliant export.
 */
function sanitizeSession(
  session: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized = { ...session };

  if (sanitized.accessToken && typeof sanitized.accessToken === "string") {
    const token = sanitized.accessToken;
    sanitized.accessToken =
      token.length > 8
        ? `${token.slice(0, 4)}${"*".repeat(token.length - 8)}${token.slice(-4)}`
        : "********";
  }

  if (sanitized.refreshToken && typeof sanitized.refreshToken === "string") {
    const token = sanitized.refreshToken;
    sanitized.refreshToken =
      token.length > 8
        ? `${token.slice(0, 4)}${"*".repeat(token.length - 8)}${token.slice(-4)}`
        : "********";
  }

  return sanitized;
}

/**
 * Export all data associated with a shop in GDPR-compliant JSON format.
 * Sensitive fields (accessToken, refreshToken) are masked.
 */
export async function exportShopData(shop: string): Promise<DataExportResult> {
  const [sessions, translationCache, consents, accessLogs] = await Promise.all([
    prisma.session.findMany({ where: { shop } }),
    prisma.translationCache.findMany(),
    prisma.consentRecord.findMany({ where: { shop } }),
    prisma.dataAccessLog.findMany({
      where: { shop },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Log this export action
  await prisma.dataAccessLog.create({
    data: {
      shop,
      action: "data_export",
      dataType: "all",
      details: `Exported ${sessions.length} sessions, ${translationCache.length} translation cache entries, ${consents.length} consent records, ${accessLogs.length} access logs`,
    },
  });

  const sanitizedSessions = sessions.map((session) =>
    sanitizeSession(session as unknown as Record<string, unknown>),
  );

  return {
    shop,
    exportedAt: new Date().toISOString(),
    data: {
      sessions: sanitizedSessions,
      translationCache: translationCache as unknown as Array<
        Record<string, unknown>
      >,
      consents: consents as unknown as Array<Record<string, unknown>>,
      accessLogs: accessLogs as unknown as Array<Record<string, unknown>>,
    },
  };
}

/**
 * Format exported data as a JSON string (pretty-printed).
 */
export function formatExportAsJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format exported data as CSV.
 * Each top-level array in `data.data` is flattened into its own CSV block
 * separated by a blank line.
 */
export function formatExportAsCsv(data: DataExportResult): string {
  const sections: string[] = [];

  sections.push(`# GDPR Data Export`);
  sections.push(`# Shop: ${data.shop}`);
  sections.push(`# Exported at: ${data.exportedAt}`);
  sections.push(``);

  const arrayToCSV = (
    label: string,
    rows: Array<Record<string, unknown>>,
  ): string => {
    if (rows.length === 0) return `# ${label}\n(no records)\n`;
    const keys = Object.keys(rows[0]);
    const header = keys.map((k) => `"${k}"`).join(",");
    const body = rows
      .map((row) =>
        keys
          .map((k) => {
            const v = row[k];
            if (v === null || v === undefined) return `""`;
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    return `# ${label}\n${header}\n${body}\n`;
  };

  sections.push(arrayToCSV("Sessions", data.data.sessions));
  sections.push(
    arrayToCSV("Translation Cache", data.data.translationCache),
  );
  sections.push(arrayToCSV("Consents", data.data.consents));
  sections.push(arrayToCSV("Access Logs", data.data.accessLogs));

  return sections.join("\n");
}
