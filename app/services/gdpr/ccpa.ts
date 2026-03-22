/**
 * T0196 — CCPA Compliance Service
 *
 * Implements California Consumer Privacy Act helpers including the
 * "Do Not Sell My Personal Information" link generation and opt-out
 * processing.
 */

import type { CCPAConfig } from "./types";

/**
 * Return the standard data categories the app collects.
 */
export function getDataCategories(): string[] {
  return [
    "Translation data",
    "Usage data",
    "Analytics",
    "User preferences",
  ];
}

/**
 * Build a default CCPA configuration for a shop.
 */
export function getDefaultCCPAConfig(shop: string): CCPAConfig {
  return {
    shop,
    doNotSellEnabled: true,
    doNotSellUrl: `/pages/do-not-sell`,
    privacyPolicyUrl: `/pages/privacy-policy`,
    dataCategories: getDataCategories(),
  };
}

/**
 * Generate a compliant "Do Not Sell My Personal Information" HTML link.
 */
export function generateDoNotSellLink(config: CCPAConfig): string {
  if (!config.doNotSellEnabled) {
    return "<!-- Do Not Sell link is disabled -->";
  }

  return `<a href="${config.doNotSellUrl}" class="ccpa-do-not-sell" rel="nofollow">Do Not Sell My Personal Information</a>`;
}

/**
 * Process a consumer opt-out request.
 *
 * In production this would update the shop's data-sharing flags in the
 * database and notify any third-party integrations. Here we simulate
 * a successful opt-out across all data categories.
 */
export function processOptOut(
  shop: string,
): { success: boolean; categories: string[] } {
  const categories = getDataCategories();

  // In a real implementation:
  // 1. Mark the shop record as opted-out
  // 2. Disable third-party data sharing
  // 3. Notify downstream processors
  // 4. Log the opt-out for audit purposes

  const _shop = shop; // acknowledge param

  return {
    success: true,
    categories,
  };
}
