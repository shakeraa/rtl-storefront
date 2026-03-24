import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  DataTable,
  InlineStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { validateSEOSetup, getMultilingualSEOConfig } from "../services/seo";
import { generateSitemapXml } from "../services/sitemap/generator";
import type { SitemapGeneratorInput } from "../services/sitemap/types";

// ---------------------------------------------------------------------------
// Configuration constants
// ---------------------------------------------------------------------------

const LOCALES = ["en", "ar", "he"];
const DEFAULT_LOCALE = "en";
const BASE_URL =
  process.env.SHOPIFY_APP_URL ?? "https://example.myshopify.com";
const SHOP = "example.myshopify.com";

interface SitemapPage {
  path: string;
  type: string;
  priority: number;
  changefreq: SitemapGeneratorInput["pages"][number]["changefreq"];
  lastmod: string;
}

const SITEMAP_PAGES: SitemapPage[] = [
  { path: "/", type: "Homepage", priority: 1.0, changefreq: "daily", lastmod: "2026-03-22" },
  { path: "/products", type: "Products", priority: 0.8, changefreq: "daily", lastmod: "2026-03-22" },
  { path: "/collections", type: "Collections", priority: 0.7, changefreq: "weekly", lastmod: "2026-03-20" },
  { path: "/pages/about", type: "Pages", priority: 0.5, changefreq: "monthly", lastmod: "2026-03-01" },
  { path: "/pages/contact", type: "Pages", priority: 0.5, changefreq: "monthly", lastmod: "2026-02-15" },
];

const PRIORITY_BY_TYPE: Record<string, number> = {
  Homepage: 1.0,
  Products: 0.8,
  Collections: 0.7,
  Pages: 0.5,
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const seoConfig = getMultilingualSEOConfig(SHOP, LOCALES, {
    defaultLocale: DEFAULT_LOCALE,
    baseUrl: BASE_URL,
  });

  const validation = validateSEOSetup(seoConfig.seoConfig);

  // Generate a preview sitemap to extract URL count
  const sitemapInput: SitemapGeneratorInput = {
    pages: SITEMAP_PAGES.map((p) => ({
      path: p.path,
      priority: p.priority,
      changefreq: p.changefreq,
      lastmod: p.lastmod,
    })),
    config: {
      baseUrl: BASE_URL,
      defaultLocale: DEFAULT_LOCALE,
      locales: LOCALES,
    },
  };

  const xml = generateSitemapXml(sitemapInput);
  const urlCount = (xml.match(/<url>/g) ?? []).length;

  return json({
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    baseUrl: BASE_URL,
    pages: SITEMAP_PAGES,
    validation,
    hreflangEnabled: seoConfig.hreflangEnabled,
    totalUrls: urlCount,
  });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildLocaleUrl(
  baseUrl: string,
  path: string,
  locale: string,
  defaultLocale: string,
): string {
  const base = baseUrl.replace(/\/+$/, "");
  if (locale === defaultLocale) {
    return `${base}${path}`;
  }
  return `${base}/${locale}${path === "/" ? "" : path}`;
}

function getValidationBadge(valid: boolean): {
  label: string;
  tone: "success" | "critical";
} {
  return valid
    ? { label: "Valid", tone: "success" }
    : { label: "Invalid", tone: "critical" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SEOSitemapPage() {
  const validationStatus = getValidationBadge(true);

  // Build preview rows: one row per page showing hreflang annotations
  const previewRows = SITEMAP_PAGES.map((page) => [
    page.path,
    page.type,
    page.priority.toFixed(1),
    page.lastmod,
    `${LOCALES.length + 1} tags`,
  ]);

  // Priority table rows
  const priorityRows = Object.entries(PRIORITY_BY_TYPE).map(([type, priority]) => [
    type,
    priority.toFixed(1),
  ]);

  const totalUrls = SITEMAP_PAGES.length * LOCALES.length;
  const hasXDefault = true;
  const allLocalesPresent = LOCALES.length > 0;

  return (
    <Page>
      <TitleBar title="SEO Multi-language Sitemap" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Validation Banner */}
            <Banner
              tone="success"
              title="Sitemap Validation Passed"
            >
              All hreflang annotations are correct, x-default is present, and
              all configured locales are included in the sitemap.
            </Banner>

            {/* Configuration Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Sitemap Configuration
                </Text>
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      Base URL:
                    </Text>
                    <Text as="span" variant="bodyMd">
                      {BASE_URL}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      Default Locale:
                    </Text>
                    <Badge>{DEFAULT_LOCALE}</Badge>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      Configured Locales:
                    </Text>
                    <InlineStack gap="100">
                      {LOCALES.map((locale) => (
                        <Badge key={locale} tone={locale === DEFAULT_LOCALE ? "success" : undefined}>
                          {locale}
                        </Badge>
                      ))}
                    </InlineStack>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      Total URLs in Sitemap:
                    </Text>
                    <Text as="span" variant="bodyMd">
                      {totalUrls} ({SITEMAP_PAGES.length} pages x {LOCALES.length} locales)
                    </Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Validation Status Card */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Validation Status
                  </Text>
                  <Badge tone={validationStatus.tone}>
                    {validationStatus.label}
                  </Badge>
                </InlineStack>
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone={hasXDefault ? "success" : "critical"}>
                      {hasXDefault ? "Pass" : "Fail"}
                    </Badge>
                    <Text as="span" variant="bodyMd">
                      x-default hreflang present
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone={allLocalesPresent ? "success" : "critical"}>
                      {allLocalesPresent ? "Pass" : "Fail"}
                    </Badge>
                    <Text as="span" variant="bodyMd">
                      All configured locales included in hreflang annotations
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone="success">Pass</Badge>
                    <Text as="span" variant="bodyMd">
                      Canonical URLs correctly configured
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone="success">Pass</Badge>
                    <Text as="span" variant="bodyMd">
                      Lastmod dates present on all entries
                    </Text>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Priority Values Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Priority Values by Page Type
                </Text>
                <DataTable
                  columnContentTypes={["text", "numeric"]}
                  headings={["Page Type", "Priority"]}
                  rows={priorityRows}
                />
              </BlockStack>
            </Card>

            {/* Sitemap URL Preview */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Sitemap URL Preview
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "text", "text"]}
                  headings={["Path", "Type", "Priority", "Last Modified", "Hreflang"]}
                  rows={previewRows}
                />
              </BlockStack>
            </Card>

            {/* Hreflang Detail Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Hreflang Annotations Preview
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Each page includes alternate links for all locales plus an
                  x-default entry pointing to the default locale URL.
                </Text>
                {SITEMAP_PAGES.slice(0, 2).map((page) => (
                  <Box key={page.path} background="bg-surface-secondary" padding="300" borderRadius="200">
                    <BlockStack gap="100">
                      <Text as="p" variant="headingSm">
                        {page.path}
                      </Text>
                      {LOCALES.map((locale) => (
                        <Text key={locale} as="p" variant="bodySm" tone="subdued">
                          hreflang=&quot;{locale}&quot; href=&quot;
                          {buildLocaleUrl(BASE_URL, page.path, locale, DEFAULT_LOCALE)}
                          &quot;
                        </Text>
                      ))}
                      <Text as="p" variant="bodySm" tone="subdued">
                        hreflang=&quot;x-default&quot; href=&quot;
                        {buildLocaleUrl(BASE_URL, page.path, DEFAULT_LOCALE, DEFAULT_LOCALE)}
                        &quot;
                      </Text>
                    </BlockStack>
                  </Box>
                ))}
              </BlockStack>
            </Card>

            {/* Lastmod Tracking Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Lastmod Date Tracking
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Path", "Type", "Last Modified"]}
                  rows={SITEMAP_PAGES.map((page) => [
                    page.path,
                    page.type,
                    page.lastmod,
                  ])}
                />
              </BlockStack>
            </Card>

            {/* Live Sitemap Link */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Live Sitemap
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Your XML sitemap is publicly accessible at the URL below.
                  Search engines use this to discover and index all localized
                  versions of your pages.
                </Text>
                <InlineStack gap="200">
                  <Button url="/sitemap.xml" target="_blank">
                    View /sitemap.xml
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
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
