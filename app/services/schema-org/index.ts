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
