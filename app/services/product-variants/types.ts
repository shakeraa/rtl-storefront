export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  barcode?: string;
  price: string;
  options: Record<string, string>;
  metafields?: Array<{ key: string; value: string; namespace: string }>;
}

export interface TranslatedProductOption {
  id: string;
  originalName: string;
  translatedName: string;
  values: Array<{ original: string; translated: string }>;
}

export interface TranslatedVariant {
  id: string;
  originalTitle: string;
  translatedTitle: string;
  sku: string; // preserved, never translated
  barcode?: string; // preserved, never translated
  price: string;
  options: Record<string, string>;
  translatedMetafields?: Array<{ key: string; value: string; namespace: string }>;
}

export interface VariantTranslationConfig {
  shop: string;
  sourceLocale: string;
  targetLocale: string;
  preserveSkus: boolean;
  preserveBarcodes: boolean;
  translateMetafields: boolean;
}

export interface VariantTranslationResult {
  options: TranslatedProductOption[];
  variants: TranslatedVariant[];
  preservedFields: string[];
  locale: string;
}
