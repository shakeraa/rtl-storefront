import prisma from "../../db.server";
import type { DeletionResult } from "./types";

/**
 * Delete ALL data associated with a shop (GDPR Right to Erasure).
 *
 * Deletion order: access logs, consents, translation cache, sessions.
 * A deletion log entry is created BEFORE deletion so there is a record
 * of the erasure request even after shop data is removed.
 */
export async function deleteShopData(
  shop: string,
  performedBy?: string,
): Promise<DeletionResult> {
  // Log the deletion action BEFORE deleting so we have a record
  await prisma.dataAccessLog.create({
    data: {
      shop,
      action: "data_deletion",
      dataType: "all",
      performedBy: performedBy ?? "system",
      details: "GDPR right to erasure: deleting all shop data",
    },
  });

  // Delete in order: access logs, consents, translation cache, sessions
  const [accessLogsResult, consentsResult, translationCacheResult, sessionsResult] =
    await prisma.$transaction([
      prisma.dataAccessLog.deleteMany({ where: { shop } }),
      prisma.consentRecord.deleteMany({ where: { shop } }),
      prisma.translationCache.deleteMany(),
      prisma.session.deleteMany({ where: { shop } }),
    ]);

  return {
    shop,
    deletedAt: new Date().toISOString(),
    deletedCounts: {
      sessions: sessionsResult.count,
      translationCache: translationCacheResult.count,
      consents: consentsResult.count,
      accessLogs: accessLogsResult.count,
    },
  };
}
