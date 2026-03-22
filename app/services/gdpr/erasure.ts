/**
 * T0190 — Right to Erasure Service
 *
 * Processes GDPR Article 17 "right to be forgotten" requests, validating
 * confirmation strings and providing impact previews before deletion.
 */

import type { ErasureRequest, ErasureResult } from "./types";

/** Tables affected by each erasure scope. */
const SCOPE_TABLES: Record<string, string[]> = {
  all: [
    "translations",
    "translation_memory",
    "analytics_events",
    "usage_stats",
    "consent_preferences",
    "customer_data",
    "shop_settings",
  ],
  translations: ["translations", "translation_memory"],
  analytics: ["analytics_events", "usage_stats"],
  personal: ["customer_data", "consent_preferences"],
};

/** Estimated row counts per table (placeholder for real DB queries). */
const TABLE_ESTIMATES: Record<string, number> = {
  translations: 340,
  translation_memory: 180,
  analytics_events: 1200,
  usage_stats: 30,
  consent_preferences: 1,
  customer_data: 15,
  shop_settings: 5,
};

/**
 * Process an erasure request after validating the confirmation string.
 *
 * Throws if the confirmation is invalid.
 */
export function processErasure(request: ErasureRequest): ErasureResult {
  if (!validateErasureConfirmation(request.confirmation, request.shop)) {
    throw new Error(
      `Invalid erasure confirmation. Expected "DELETE ${request.shop}".`,
    );
  }

  const tables = SCOPE_TABLES[request.scope] ?? SCOPE_TABLES["all"];
  const recordsDeleted = tables.reduce(
    (sum, t) => sum + (TABLE_ESTIMATES[t] ?? 0),
    0,
  );

  // In production this would execute actual DELETE statements inside a
  // transaction and emit audit-log entries. Here we simulate success.

  return {
    shop: request.shop,
    erasedAt: new Date().toISOString(),
    scope: request.scope,
    recordsDeleted,
    tablesAffected: tables,
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
export function getErasureImpactPreview(
  _shop: string,
  scope: string,
): { tables: string[]; estimatedRecords: number } {
  const tables = SCOPE_TABLES[scope] ?? SCOPE_TABLES["all"];
  const estimatedRecords = tables.reduce(
    (sum, t) => sum + (TABLE_ESTIMATES[t] ?? 0),
    0,
  );

  return { tables, estimatedRecords };
}
