import prisma from "../../db.server";
import type { DataExportResult } from "./types";

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
