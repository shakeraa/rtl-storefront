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

  // Delete from all shop-scoped tables
  const [
    accessLogsResult,
    consentsResult,
    translationCacheResult,
    translationMemoryResult,
    glossaryResult,
    culturalContextResult,
    retentionPolicyResult,
    subscriptionResult,
    shopUsageResult,
    translationUsageResult,
    translationAlertResult,
    notificationPrefResult,
    alertConfigResult,
    shopSettingsResult,
    teamInviteResult,
    teamMemberResult,
    sessionsResult,
  ] = await prisma.$transaction([
    prisma.dataAccessLog.deleteMany({ where: { shop } }),
    prisma.consentRecord.deleteMany({ where: { shop } }),
    prisma.translationCache.deleteMany({ where: { shop } }),
    prisma.translationMemory.deleteMany({ where: { shop } }),
    prisma.glossaryEntry.deleteMany({ where: { shop } }),
    prisma.culturalContext.deleteMany({ where: { shop } }),
    prisma.dataRetentionPolicy.deleteMany({ where: { shop } }),
    prisma.shopSubscription.deleteMany({ where: { shop } }),
    prisma.shopUsage.deleteMany({ where: { shop } }),
    prisma.translationUsage.deleteMany({ where: { shop } }),
    prisma.translationAlert.deleteMany({ where: { shop } }),
    prisma.notificationPreference.deleteMany({ where: { shop } }),
    prisma.alertConfiguration.deleteMany({ where: { shop } }),
    prisma.shopSettings.deleteMany({ where: { shop } }),
    prisma.teamInvite.deleteMany({ where: { shop } }),
    prisma.teamMember.deleteMany({ where: { shop } }),
    prisma.session.deleteMany({ where: { shop } }),
  ]);

  return {
    shop,
    deletedAt: new Date().toISOString(),
    deletedCounts: {
      sessions: sessionsResult.count,
      translationCache: translationCacheResult.count,
      translationMemory: translationMemoryResult.count,
      glossary: glossaryResult.count,
      culturalContext: culturalContextResult.count,
      consents: consentsResult.count,
      accessLogs: accessLogsResult.count,
      retentionPolicies: retentionPolicyResult.count,
      subscriptions: subscriptionResult.count,
      shopUsage: shopUsageResult.count,
      translationUsage: translationUsageResult.count,
      translationAlerts: translationAlertResult.count,
      notificationPreferences: notificationPrefResult.count,
      alertConfiguration: alertConfigResult.count,
      shopSettings: shopSettingsResult.count,
      teamInvites: teamInviteResult.count,
      teamMembers: teamMemberResult.count,
    },
  };
}
