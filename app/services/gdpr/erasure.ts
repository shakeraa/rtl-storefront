/**
 * T0190 — Right to Erasure Service
 *
 * Processes GDPR Article 17 "right to be forgotten" requests, validating
 * confirmation strings and providing impact previews before deletion.
 */

import type { ErasureRequest, ErasureResult } from "./types";
import db from "../../db.server";

/**
 * Process an erasure request after validating the confirmation string.
 *
 * Throws if the confirmation is invalid.
 */
export async function processErasure(request: ErasureRequest): Promise<ErasureResult> {
  if (!validateErasureConfirmation(request.confirmation, request.shop)) {
    throw new Error(
      `Invalid erasure confirmation. Expected "DELETE ${request.shop}".`,
    );
  }

  const scope = request.scope;
  const shop = request.shop;
  const tablesAffected: string[] = [];
  let recordsDeleted = 0;

  const results = await db.$transaction(async (tx) => {
    const counts: Record<string, number> = {};

    if (scope === "all" || scope === "translations") {
      const tmResult = await tx.translationMemory.deleteMany({ where: { shop } });
      counts["translation_memory"] = tmResult.count;

      const cacheResult = await tx.translationCache.deleteMany({ where: { shop } });
      counts["translation_cache"] = cacheResult.count;

      const glossaryResult = await tx.glossaryEntry.deleteMany({ where: { shop } });
      counts["glossary"] = glossaryResult.count;

      const culturalResult = await tx.culturalContext.deleteMany({ where: { shop } });
      counts["cultural_context"] = culturalResult.count;
    }

    if (scope === "all" || scope === "analytics") {
      const logsResult = await tx.dataAccessLog.deleteMany({ where: { shop } });
      counts["data_access_logs"] = logsResult.count;

      const usageResult = await tx.translationUsage.deleteMany({ where: { shop } });
      counts["translation_usage"] = usageResult.count;

      const shopUsageResult = await tx.shopUsage.deleteMany({ where: { shop } });
      counts["shop_usage"] = shopUsageResult.count;

      const alertsResult = await tx.translationAlert.deleteMany({ where: { shop } });
      counts["translation_alerts"] = alertsResult.count;
    }

    if (scope === "all" || scope === "personal") {
      const consentResult = await tx.consentRecord.deleteMany({ where: { shop } });
      counts["consent_records"] = consentResult.count;

      const retentionResult = await tx.dataRetentionPolicy.deleteMany({ where: { shop } });
      counts["data_retention_policies"] = retentionResult.count;

      const notifResult = await tx.notificationPreference.deleteMany({ where: { shop } });
      counts["notification_preferences"] = notifResult.count;

      const alertConfigResult = await tx.alertConfiguration.deleteMany({ where: { shop } });
      counts["alert_configuration"] = alertConfigResult.count;

      const teamInviteResult = await tx.teamInvite.deleteMany({ where: { shop } });
      counts["team_invites"] = teamInviteResult.count;

      const teamMemberResult = await tx.teamMember.deleteMany({ where: { shop } });
      counts["team_members"] = teamMemberResult.count;

      const settingsResult = await tx.shopSettings.deleteMany({ where: { shop } });
      counts["shop_settings"] = settingsResult.count;

      const subscriptionResult = await tx.shopSubscription.deleteMany({ where: { shop } });
      counts["shop_subscription"] = subscriptionResult.count;

      const sessionResult = await tx.session.deleteMany({ where: { shop } });
      counts["sessions"] = sessionResult.count;
    }

    return counts;
  });

  for (const [table, count] of Object.entries(results)) {
    tablesAffected.push(table);
    recordsDeleted += count;
  }

  return {
    shop: request.shop,
    erasedAt: new Date().toISOString(),
    scope: request.scope,
    recordsDeleted,
    tablesAffected,
  };
}

/**
 * Validate that the user typed the required confirmation phrase.
 *
 * The expected format is exactly `DELETE <shop>` (case-sensitive).
 */
export function validateErasureConfirmation(
  confirmation: string,
  shop: string,
): boolean {
  return confirmation === `DELETE ${shop}`;
}

/**
 * Preview the impact of an erasure before it is executed.
 */
export async function getErasureImpactPreview(
  shop: string,
  scope: string,
): Promise<{ tables: string[]; estimatedRecords: number }> {
  const tables: string[] = [];
  let estimatedRecords = 0;

  if (scope === "all" || scope === "translations") {
    const tmCount = await db.translationMemory.count({ where: { shop } });
    const cacheCount = await db.translationCache.count({ where: { shop } });
    const glossaryCount = await db.glossaryEntry.count({ where: { shop } });
    tables.push("translation_memory", "translation_cache", "glossary");
    estimatedRecords += tmCount + cacheCount + glossaryCount;
  }

  if (scope === "all" || scope === "analytics") {
    const logCount = await db.dataAccessLog.count({ where: { shop } });
    tables.push("data_access_logs");
    estimatedRecords += logCount;
  }

  if (scope === "all" || scope === "personal") {
    const consentCount = await db.consentRecord.count({ where: { shop } });
    tables.push("consent_records");
    estimatedRecords += consentCount;
  }

  return { tables, estimatedRecords };
}
