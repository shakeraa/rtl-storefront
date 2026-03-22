/**
 * Content Translation Service
 * T0008: Content Coverage - Product & Collection Translation
 */

import { contentTranslator } from '../content-translator/index';

export interface ProductTranslation {
  productId: string;
  title?: Record<string, string>;
  description?: Record<string, string>;
  variants?: VariantTranslation[];
  tags?: string[];
  metafields?: MetafieldTranslation[];
  status: 'pending' | 'translated' | 'error';
}

export interface VariantTranslation {
  variantId: string;
  title?: Record<string, string>;
  optionValues?: Record<string, Record<string, string>>;
}

export interface CollectionTranslation {
  collectionId: string;
  title?: Record<string, string>;
  description?: Record<string, string>;
  seoTitle?: Record<string, string>;
  seoDescription?: Record<string, string>;
  status: 'pending' | 'translated' | 'error';
}

export interface MetafieldTranslation {
  namespace: string;
  key: string;
  value: Record<string, string>;
  type: string;
}

// Product translation
export async function translateProduct(
  productId: string,
  fields: {
    title?: string;
    description?: string;
    tags?: string[];
    vendor?: string;
    productType?: string;
  },
  targetLocales: string[]
): Promise<ProductTranslation> {
  const result: ProductTranslation = {
    productId,
    status: 'translated',
  };

  if (fields.title) {
    result.title = {};
    for (const locale of targetLocales) {
      const translation = await contentTranslator.translate(
        `product.${productId}.title`,
        fields.title,
        locale,
        { contentType: 'product', fieldName: 'title', locale }
      );
      result.title[locale] = translation.translatedText;
    }
  }

  if (fields.description) {
    result.description = {};
    for (const locale of targetLocales) {
      const translation = await contentTranslator.translate(
        `product.${productId}.description`,
        fields.description,
        locale,
        { contentType: 'product', fieldName: 'description', locale }
      );
      result.description[locale] = translation.translatedText;
    }
  }

  return result;
}

// Collection translation
export async function translateCollection(
  collectionId: string,
  fields: {
    title?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
  },
  targetLocales: string[]
): Promise<CollectionTranslation> {
  const result: CollectionTranslation = {
    collectionId,
    status: 'translated',
  };

  if (fields.title) {
    result.title = {};
    for (const locale of targetLocales) {
      const translation = await contentTranslator.translate(
        `collection.${collectionId}.title`,
        fields.title,
        locale,
        { contentType: 'collection', fieldName: 'title', locale }
      );
      result.title[locale] = translation.translatedText;
    }
  }

  if (fields.description) {
    result.description = {};
    for (const locale of targetLocales) {
      const translation = await contentTranslator.translate(
        `collection.${collectionId}.description`,
        fields.description,
        locale,
        { contentType: 'collection', fieldName: 'description', locale }
      );
      result.description[locale] = translation.translatedText;
    }
  }

  return result;
}

// Bulk translation
export async function bulkTranslateProducts(
  products: Array<{ id: string; title: string; description?: string }>,
  targetLocales: string[]
): Promise<ProductTranslation[]> {
  return Promise.all(
    products.map((p) => translateProduct(p.id, p, targetLocales))
  );
}

// Webhook handler for product updates
export async function handleProductWebhook(
  productId: string,
  action: 'create' | 'update' | 'delete',
  data: Record<string, unknown>
): Promise<void> {
  if (action === 'delete') {
    contentTranslator.invalidateCache(`product.${productId}`);
    return;
  }

  // Auto-translate on create/update
  const autoTranslateLocales = ['ar', 'he']; // Configure based on settings
  await translateProduct(productId, {
    title: data.title as string,
    description: data.description as string,
  }, autoTranslateLocales);
}

export * from './constants';
