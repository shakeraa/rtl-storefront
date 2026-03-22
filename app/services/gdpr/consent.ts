/**
 * T0191 — Consent Management Service
 *
 * Manages per-shop consent preferences with an in-memory store and a
 * full audit trail of every change.
 */

import type { ConsentPreferences } from "./types";

/** In-memory consent store keyed by shop domain. */
const consentStore = new Map<string, ConsentPreferences>();

/** Audit trail of consent changes. */
const consentHistory = new Map<
  string,
  Array<{
    field: string;
    oldValue: boolean;
    newValue: boolean;
    timestamp: string;
  }>
>();

/**
 * Retrieve the current consent preferences for a shop.
 * Returns sensible defaults if none have been stored yet.
 */
export function getConsentPreferences(shop: string): ConsentPreferences {
  const stored = consentStore.get(shop);
  if (stored) return { ...stored };

  return {
    shop,
    translationProcessing: false,
    analyticsTracking: false,
    thirdPartySharing: false,
    marketingCommunications: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Persist updated consent preferences and record changes in the audit trail.
 */
export function updateConsentPreferences(prefs: ConsentPreferences): void {
  const current = getConsentPreferences(prefs.shop);
  const history = consentHistory.get(prefs.shop) ?? [];

  const booleanFields: (keyof ConsentPreferences)[] = [
    "translationProcessing",
    "analyticsTracking",
    "thirdPartySharing",
    "marketingCommunications",
  ];

  for (const field of booleanFields) {
    const oldVal = current[field] as boolean;
    const newVal = prefs[field] as boolean;
    if (oldVal !== newVal) {
      history.push({
        field,
        oldValue: oldVal,
        newValue: newVal,
        timestamp: new Date().toISOString(),
      });
    }
  }

  consentHistory.set(prefs.shop, history);
  consentStore.set(prefs.shop, {
    ...prefs,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Check whether a shop has granted the minimum required consent
 * (translation processing must be enabled for the app to function).
 */
export function hasRequiredConsent(shop: string): boolean {
  const prefs = getConsentPreferences(shop);
  return prefs.translationProcessing === true;
}

/**
 * Return the full consent-change audit trail for a shop.
 */
export function getConsentHistory(
  shop: string,
): Array<{
  field: string;
  oldValue: boolean;
  newValue: boolean;
  timestamp: string;
}> {
  return [...(consentHistory.get(shop) ?? [])];
}
