/**
 * Content Reports - T0253 + T0254: Most/Least Translated Content
 * Tracks and reports on content translation status across resource types.
 */

import type { ContentReport } from "./types";

// In-memory content tracking: shop -> resourceId -> ContentReport
const contentStore = new Map<string, Map<string, ContentReport>>();

/**
 * Record or update a content translation entry.
 */
export function recordContentTranslation(
  shop: string,
  resourceType: string,
  resourceId: string,
  title: string,
  locale: string,
): void {
  if (!contentStore.has(shop)) {
    contentStore.set(shop, new Map());
  }
  const shopContent = contentStore.get(shop)!;

  const existing = shopContent.get(resourceId);
  if (existing) {
    if (!existing.locales.includes(locale)) {
      existing.locales.push(locale);
      existing.translationCount = existing.locales.length;
    }
    existing.lastTranslatedAt = new Date().toISOString();
  } else {
    shopContent.set(resourceId, {
      resourceType,
      resourceId,
      title,
      translationCount: 1,
      lastTranslatedAt: new Date().toISOString(),
      locales: [locale],
    });
  }
}

/**
 * Get the most translated content, sorted by translation count descending.
 */
export function getMostTranslatedContent(
  shop: string,
  limit: number = 10,
): ContentReport[] {
  const shopContent = contentStore.get(shop);
  if (!shopContent) return [];

  return Array.from(shopContent.values())
    .sort((a, b) => b.translationCount - a.translationCount)
    .slice(0, limit);
}

/**
 * Get the least translated content (with at least one translation),
 * sorted by translation count ascending.
 */
export function getLeastTranslatedContent(
  shop: string,
  limit: number = 10,
): ContentReport[] {
  const shopContent = contentStore.get(shop);
  if (!shopContent) return [];

  return Array.from(shopContent.values())
    .filter((c) => c.translationCount > 0)
    .sort((a, b) => a.translationCount - b.translationCount)
    .slice(0, limit);
}

/**
 * Get content that has not been translated into a specific locale.
 */
export function getUntranslatedContent(
  shop: string,
  locale: string,
): ContentReport[] {
  const shopContent = contentStore.get(shop);
  if (!shopContent) return [];

  return Array.from(shopContent.values()).filter(
    (c) => !c.locales.includes(locale),
  );
}

/**
 * Get content filtered by resource type (e.g., "Product", "Collection", "Page").
 */
export function getContentByResourceType(
  shop: string,
  type: string,
): ContentReport[] {
  const shopContent = contentStore.get(shop);
  if (!shopContent) return [];

  return Array.from(shopContent.values()).filter(
    (c) => c.resourceType === type,
  );
}
