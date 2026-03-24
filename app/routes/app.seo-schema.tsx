import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCallback, useState } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import {
  generateProductSchema,
  validateProductSchema,
  getLocalizedAvailability,
  getSchemaTranslations,
} from "../services/schema-org/product-schema";
import type {
  ProductSchemaData,
  SupportedSchemaLocale,
} from "../services/schema-org/product-schema";

/**
 * Sample product data used to demonstrate schema generation across locales.
 */
const SAMPLE_PRODUCT: ProductSchemaData = {
  name: "Premium Arabic Calligraphy Pen Set",
  description:
    "A handcrafted set of 6 calligraphy pens designed for Arabic and Hebrew script writing. Includes nibs for Naskh, Thuluth, and Diwani styles.",
  sku: "ACP-2025-001",
  price: 89.99,
  currency: "SAR",
  availability: "InStock",
  imageUrl: "https://example.com/images/calligraphy-pen-set.jpg",
  brand: "Al-Qalam",
  ratingValue: 4.7,
  reviewCount: 128,
  url: "https://example.com/products/calligraphy-pen-set",
  category: "Arts & Crafts",
  condition: "New",
};

const LOCALES: { code: SupportedSchemaLocale; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateWithTenant(request);

  const schemas = LOCALES.map(({ code }) => {
    const generated = generateProductSchema(SAMPLE_PRODUCT, code);
    const validation = validateProductSchema(generated.jsonLd);
    const translations = getSchemaTranslations(code);
    const localizedAvailability = getLocalizedAvailability(
      SAMPLE_PRODUCT.availability,
      code,
    );

    return {
      locale: code,
      direction: generated.direction,
      jsonLd: generated.jsonLd,
      html: generated.html,
      validation,
      localizedAvailability,
      translationSample: {
        product: translations.product,
        availability: localizedAvailability,
        price: translations.price,
        description: translations.description,
      },
    };
  });

  return json({ schemas });
};

function getDirectionBadge(direction: "rtl" | "ltr") {
  if (direction === "rtl") {
    return { label: "RTL", tone: "info" as const };
  }
  return { label: "LTR", tone: "enabled" as const };
}

function getValidationBadge(valid: boolean) {
  if (valid) {
    return { label: "Valid", tone: "success" as const };
  }
  return { label: "Invalid", tone: "critical" as const };
}

export default function SeoSchemaPage() {
  const [copiedLocale, setCopiedLocale] = useState<string | null>(null);

  const schemas = LOCALES.map(({ code }) => {
    const generated = generateProductSchema(SAMPLE_PRODUCT, code);
    const validation = validateProductSchema(generated.jsonLd);
    const translations = getSchemaTranslations(code);
    const localizedAvailability = getLocalizedAvailability(
      SAMPLE_PRODUCT.availability,
      code,
    );

    return {
      locale: code,
      direction: generated.direction,
      jsonLd: generated.jsonLd,
      html: generated.html,
      validation,
      localizedAvailability,
      translationSample: {
        product: translations.product,
        availability: localizedAvailability,
        price: translations.price,
        description: translations.description,
      },
    };
  });

  const allValid = schemas.every((s) => s.validation.valid);

  const handleCopy = useCallback(
    async (locale: string, jsonLd: Record<string, unknown>) => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2));
        setCopiedLocale(locale);
        setTimeout(() => setCopiedLocale(null), 2000);
      } catch {
        // Fallback for environments where clipboard API is unavailable
      }
    },
    [],
  );

  return (
    <Page>
      <TitleBar title="SEO Product Schema.org" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Validation Summary */}
            {allValid ? (
              <Banner tone="success" title="All Schemas Valid">
                Product JSON-LD schemas for all locales pass validation. Your
                structured data is ready for search engines.
              </Banner>
            ) : (
              <Banner tone="critical" title="Schema Validation Errors">
                One or more locale schemas have validation errors. Review the
                details below.
              </Banner>
            )}

            {/* Product Info */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Sample Product
                </Text>
                <InlineStack gap="400" blockAlign="center">
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {SAMPLE_PRODUCT.name}
                  </Text>
                  <Badge>{SAMPLE_PRODUCT.sku}</Badge>
                  <Badge tone="success">
                    {SAMPLE_PRODUCT.currency} {SAMPLE_PRODUCT.price}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {SAMPLE_PRODUCT.description}
                </Text>
              </BlockStack>
            </Card>

            {/* Schema per locale */}
            <Text as="h2" variant="headingLg">
              Schema.org JSON-LD by Locale
            </Text>

            {schemas.map((schema) => {
              const localeInfo = LOCALES.find((l) => l.code === schema.locale)!;
              const dirBadge = getDirectionBadge(schema.direction);
              const valBadge = getValidationBadge(schema.validation.valid);

              return (
                <Card key={schema.locale}>
                  <BlockStack gap="400">
                    {/* Header */}
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="h3" variant="headingMd">
                          {localeInfo.name}
                        </Text>
                        <Text as="span" variant="bodyMd" tone="subdued">
                          {localeInfo.nativeName}
                        </Text>
                      </InlineStack>
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone={dirBadge.tone}>{dirBadge.label}</Badge>
                        <Badge tone={valBadge.tone}>{valBadge.label}</Badge>
                      </InlineStack>
                    </InlineStack>

                    {/* Translated Labels */}
                    <Box
                      background="bg-surface-secondary"
                      padding="300"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="p" variant="bodySm" fontWeight="semibold">
                          Translated Labels ({schema.locale.toUpperCase()})
                        </Text>
                        <InlineStack gap="300" wrap>
                          <Text as="span" variant="bodySm">
                            Product: {schema.translationSample.product}
                          </Text>
                          <Text as="span" variant="bodySm">
                            Price: {schema.translationSample.price}
                          </Text>
                          <Text as="span" variant="bodySm">
                            Description: {schema.translationSample.description}
                          </Text>
                          <Text as="span" variant="bodySm">
                            Availability: {schema.translationSample.availability}
                          </Text>
                        </InlineStack>
                      </BlockStack>
                    </Box>

                    {/* Validation Errors */}
                    {!schema.validation.valid && (
                      <Banner tone="critical" title="Validation Errors">
                        <BlockStack gap="100">
                          {schema.validation.errors.map((err, i) => (
                            <Text key={i} as="p" variant="bodySm">
                              {err}
                            </Text>
                          ))}
                        </BlockStack>
                      </Banner>
                    )}

                    {/* JSON-LD Preview */}
                    <Box
                      background="bg-surface-secondary"
                      padding="400"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <InlineStack
                          align="space-between"
                          blockAlign="center"
                        >
                          <Text as="p" variant="bodySm" fontWeight="semibold">
                            JSON-LD Output
                          </Text>
                          <Button
                            size="slim"
                            onClick={() =>
                              handleCopy(schema.locale, schema.jsonLd)
                            }
                          >
                            {copiedLocale === schema.locale
                              ? "Copied!"
                              : "Copy JSON-LD"}
                          </Button>
                        </InlineStack>
                        <Box>
                          <pre
                            style={{
                              fontSize: "12px",
                              lineHeight: "1.5",
                              overflow: "auto",
                              maxHeight: "300px",
                              margin: 0,
                              direction: schema.direction,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {JSON.stringify(schema.jsonLd, null, 2)}
                          </pre>
                        </Box>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Card>
              );
            })}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isResponse = isRouteErrorResponse(error);

  return (
    <Page>
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            {isResponse ? `${error.status} Error` : "Something went wrong"}
          </Text>
          <Text as="p">
            {isResponse
              ? error.data?.message || error.statusText
              : "An unexpected error occurred. Please try again."}
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
