export interface ProductSchemaInput {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  availability: "InStock" | "OutOfStock" | "PreOrder" | "BackOrder";
  imageUrl?: string;
  brand?: string;
  ratingValue?: number;
  reviewCount?: number;
  url: string;
  locale: string;
}

export interface TranslatedProductSchema {
  jsonLd: Record<string, unknown>;
  html: string;
  locale: string;
}

export interface BreadcrumbSchemaInput {
  items: Array<{ name: string; url: string }>;
  locale: string;
}
