/**
 * Content Service Constants
 */

export const PRODUCT_FIELDS = [
  'title',
  'description',
  'tags',
  'vendor',
  'productType',
  'options',
  'metafields',
] as const;

export const COLLECTION_FIELDS = [
  'title',
  'description',
  'seoTitle',
  'seoDescription',
] as const;

export const AUTO_TRANSLATE_ON_WEBHOOK = true;
export const WEBHOOK_RETRY_ATTEMPTS = 3;
