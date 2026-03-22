export type {
  ProductSchemaInput,
  TranslatedProductSchema,
  BreadcrumbSchemaInput,
} from "./types";

export type {
  SupportedSchemaLocale,
  SchemaTranslations,
  ProductSchemaData,
  GeneratedProductSchema,
  SchemaFieldMapping,
} from "./product-schema";

export type {
  ProductReview,
  ProductAggregateRating,
  EnhancedProductData,
  GeneratedEnhancedProductSchema,
} from "./product-schema-enhanced";

export type {
  BreadcrumbItem,
  BreadcrumbSchemaConfig,
  GeneratedBreadcrumbSchema,
} from "./breadcrumb-schema";

export {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  wrapJsonLd,
} from "./generator";

export {
  generateProductSchema as generateTranslatedProductSchema,
  translateSchemaFields,
  getSchemaTranslations,
  getLocalizedAvailability,
  extractTranslatableFields,
  wrapProductJsonLd,
  generateProductBreadcrumbSchema,
  validateProductSchema,
  mergeProductSchemas,
} from "./product-schema";

export {
  generateEnhancedProductSchema,
  wrapEnhancedProductJsonLd,
  validateEnhancedProductSchema,
  extractPriceFromSchema,
  extractReviewsFromSchema,
  generateMultipleProductSchemas,
  mergeEnhancedProductSchemas,
} from "./product-schema-enhanced";

export {
  generateBreadcrumbSchema as generateTranslatedBreadcrumbSchema,
  generateProductBreadcrumbSchema as generateProductBreadcrumb,
  generateCollectionBreadcrumbSchema,
  generatePageBreadcrumbSchema,
  wrapBreadcrumbJsonLd,
  validateBreadcrumbSchema,
  extractBreadcrumbItems,
  createBreadcrumbBuilder,
} from "./breadcrumb-schema";
