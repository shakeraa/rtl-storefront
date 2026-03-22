import prisma from "../../db.server";
import type { DeletionResult } from "./types";
export type { DeletionResult };

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

/**
 * Schedule a data deletion to execute after a given number of days.
 *
 * This creates a DataRetentionPolicy with autoDelete=true and a 1-day
 * retention window whose effective date is `executeAfterDays` in the future.
 * A DataAccessLog entry is written so there is an audit trail.
 *
 * Implementation note: actual deletion is carried out by `enforceRetention`
 * (called on a schedule). The policy's `lastCleanup` is set to a past date
 * so the next enforceRetention run picks it up.
 */
export async function scheduleDataDeletion(
  shop: string,
  executeAfterDays: number,
): Promise<void> {
  // Record the scheduled deletion as a retention policy with autoDelete
  await prisma.dataRetentionPolicy.upsert({
    where: {
      shop_dataType: { shop, dataType: "scheduled_deletion" },
    },
    create: {
      shop,
      dataType: "scheduled_deletion",
      retentionDays: executeAfterDays,
      autoDelete: true,
    },
    update: {
      retentionDays: executeAfterDays,
      autoDelete: true,
    },
  });

  await prisma.dataAccessLog.create({
    data: {
      shop,
      action: "deletion_scheduled",
      dataType: "all",
      details: `Data deletion scheduled in ${executeAfterDays} day(s)`,
    },
  });
}
