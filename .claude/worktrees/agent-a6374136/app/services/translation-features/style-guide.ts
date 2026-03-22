/**
 * T0306 - Style Guide Service (translation-features wrapper)
 * Wraps the core style-guide service and adds shop/locale persistence (in-memory).
 */

import {
  enforceStyleGuide as coreEnforce,
  type StyleGuideConfig,
  type StyleGuideResult,
} from "../style-guide";

export type { StyleGuideConfig, StyleGuideResult };

export interface StyleGuideRule {
  type: "banned_term" | "preferred_term" | "max_exclamation";
  value: string;
  replacement?: string;
  reason?: string;
}

export interface StoredStyleGuide {
  id: string;
  shop: string;
  locale: string;
  rules: StyleGuideRule[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store keyed by `${shop}:${locale}`
const styleGuideStore = new Map<string, StoredStyleGuide>();

function storeKey(shop: string, locale: string): string {
  return `${shop}:${locale}`;
}

/**
 * Enforce style guide rules on text.
 * Accepts a StyleGuideConfig directly (no DB lookup required).
 */
export function enforceStyleGuide(
  text: string,
  locale: string,
  config: StyleGuideConfig,
): StyleGuideResult {
  return coreEnforce(text, { ...config, locale });
}

/**
 * Retrieve the stored style guide for a shop+locale pair.
 * Returns null if none exists.
 */
export function getStyleGuide(
  shop: string,
  locale: string,
): StoredStyleGuide | null {
  return styleGuideStore.get(storeKey(shop, locale)) ?? null;
}

/**
 * Create or replace the style guide for a shop+locale pair.
 */
export function createStyleGuide(
  shop: string,
  locale: string,
  rules: StyleGuideRule[],
): StoredStyleGuide {
  const key = storeKey(shop, locale);
  const existing = styleGuideStore.get(key);
  const now = new Date();
  const guide: StoredStyleGuide = {
    id: existing?.id ?? `sg_${shop}_${locale}_${Date.now()}`,
    shop,
    locale,
    rules,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  styleGuideStore.set(key, guide);
  return guide;
}
