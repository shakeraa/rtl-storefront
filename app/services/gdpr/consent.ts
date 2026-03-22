/**
 * T0191 — Consent Management Service
 *
 * Manages per-shop consent preferences backed by the Prisma ConsentRecord model,
 * with a full audit trail of every change.
 */

import type { ConsentPreferences } from "./types";
import db from "../../db.server";

/** Consent purpose keys that map to ConsentPreferences boolean fields. */
const CONSENT_PURPOSES = [
  "translationProcessing",
  "analyticsTracking",
  "thirdPartySharing",
  "marketingCommunications",
] as const;

/**
 * Retrieve the current consent preferences for a shop.
 * Returns sensible defaults if none have been stored yet.
 */
export async function getConsentPreferences(shop: string): Promise<ConsentPreferences> {
  const records = await db.consentRecord.findMany({
    where: { shop },
  });

  const prefs: ConsentPreferences = {
    shop,
    translationProcessing: false,
    analyticsTracking: false,
    thirdPartySharing: false,
    marketingCommunications: false,
    updatedAt: new Date().toISOString(),
  };

  for (const record of records) {
    if (CONSENT_PURPOSES.includes(record.purpose as typeof CONSENT_PURPOSES[number])) {
      (prefs as unknown as Record<string, unknown>)[record.purpose] = record.granted;
      if (record.updatedAt) {
        const recordDate = new Date(record.updatedAt).toISOString();
        if (recordDate > prefs.updatedAt) {
          prefs.updatedAt = recordDate;
        }
      }
    }
  }

  return prefs;
}

/**
 * Persist updated consent preferences and record changes in the database.
 */
export async function updateConsentPreferences(prefs: ConsentPreferences): Promise<void> {
  const now = new Date();

  for (const purpose of CONSENT_PURPOSES) {
    const granted = prefs[purpose] as boolean;
    await db.consentRecord.upsert({
      where: {
        shop_purpose: {
          shop: prefs.shop,
          purpose,
        },
      },
      create: {
        shop: prefs.shop,
        purpose,
        granted,
        grantedAt: granted ? now : null,
        revokedAt: granted ? null : now,
      },
      update: {
        granted,
        grantedAt: granted ? now : undefined,
        revokedAt: granted ? null : now,
      },
    });
  }
}

/**
 * Check whether a shop has granted the minimum required consent
 * (translation processing must be enabled for the app to function).
 */
export async function hasRequiredConsent(shop: string): Promise<boolean> {
  const record = await db.consentRecord.findUnique({
    where: {
      shop_purpose: {
        shop,
        purpose: "translationProcessing",
      },
    },
  });

  return record?.granted === true;
}

/**
 * Return the full consent-change audit trail for a shop.
 */
export async function getConsentHistory(
  shop: string,
): Promise<Array<{
  purpose: string;
  granted: boolean;
  grantedAt: Date | null;
  revokedAt: Date | null;
  updatedAt: Date;
}>> {
  const records = await db.consentRecord.findMany({
    where: { shop },
    orderBy: { updatedAt: "desc" },
  });

  return records.map((r) => ({
    purpose: r.purpose,
    granted: r.granted,
    grantedAt: r.grantedAt,
    revokedAt: r.revokedAt,
    updatedAt: r.updatedAt,
  }));
}
