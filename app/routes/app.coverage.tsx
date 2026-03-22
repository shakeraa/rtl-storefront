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
  ProgressBar,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

interface LanguageCoverage {
  code: string;
  name: string;
  nativeName: string;
  translated: number;
  total: number;
}

interface ContentTypeCoverage {
  type: string;
  total: number;
  translated: number;
}

const LANGUAGE_COVERAGE: LanguageCoverage[] = [
  { code: "ar", name: "Arabic", nativeName: "العربية", translated: 892, total: 1284 },
  { code: "he", name: "Hebrew", nativeName: "עברית", translated: 641, total: 1284 },
  { code: "fa", name: "Farsi", nativeName: "فارسی", translated: 384, total: 1284 },
  { code: "fr", name: "French", nativeName: "Français", translated: 1156, total: 1284 },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", translated: 512, total: 1284 },
  { code: "ur", name: "Urdu", nativeName: "اردو", translated: 198, total: 1284 },
];

const CONTENT_TYPE_COVERAGE: ContentTypeCoverage[] = [
  { type: "Products", total: 486, translated: 342 },
  { type: "Collections", total: 24, translated: 22 },
  { type: "Pages", total: 18, translated: 12 },
  { type: "Blog Posts", total: 45, translated: 28 },
  { type: "Navigation", total: 8, translated: 8 },
  { type: "Theme", total: 703, translated: 389 },
];

function getCoveragePercent(translated: number, total: number): number {
  return total === 0 ? 0 : Math.round((translated / total) * 100);
}

function getCoverageBadge(percent: number): { label: string; tone: "success" | "warning" | "critical" | "attention" } {
  if (percent >= 90) return { label: "Excellent", tone: "success" };
  if (percent >= 70) return { label: "Good", tone: "attention" };
  if (percent >= 50) return { label: "Warning", tone: "warning" };
  return { label: "Critical", tone: "critical" };
}

function getStatusBadge(percent: number): { label: string; tone: "success" | "warning" | "critical" | "attention" } {
  if (percent === 100) return { label: "Complete", tone: "success" };
  if (percent >= 75) return { label: "In Progress", tone: "attention" };
  if (percent >= 50) return { label: "Partial", tone: "warning" };
  return { label: "Needs Work", tone: "critical" };
}

export default function CoveragePage() {
  const overallTranslated = LANGUAGE_COVERAGE.reduce(
    (sum, l) => sum + l.translated,
    0,
  );
  const overallTotal = LANGUAGE_COVERAGE.reduce((sum, l) => sum + l.total, 0);
  const overallPercent = getCoveragePercent(overallTranslated, overallTotal);

  const hasLowCoverage = LANGUAGE_COVERAGE.some(
    (l) => getCoveragePercent(l.translated, l.total) < 50,
  );

  const contentRows = CONTENT_TYPE_COVERAGE.map((c) => {
    const pct = getCoveragePercent(c.translated, c.total);
    const status = getStatusBadge(pct);
    return [c.type, c.total, c.translated, `${pct}%`, status.label];
  });

  return (
    <Page>
      <TitleBar title="Translation Coverage" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Untranslated Content Alert */}
            {hasLowCoverage && (
              <Banner tone="warning" title="Low Coverage Detected">
                Some languages have less than 50% translation coverage. Consider
                running a bulk translation to improve your store's
                accessibility.
              </Banner>
            )}

            {/* Overall Coverage */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Overall Coverage
                </Text>
                <InlineStack gap="400" blockAlign="end">
                  <Text as="span" variant="heading2xl">
                    {overallPercent}%
                  </Text>
                  <Text as="span" variant="bodyMd" tone="subdued">
                    {overallTranslated.toLocaleString()} of{" "}
                    {overallTotal.toLocaleString()} items translated across all
                    languages
                  </Text>
                </InlineStack>
                <ProgressBar progress={overallPercent} size="small" />
              </BlockStack>
            </Card>

            {/* Coverage by Language */}
            <Text as="h2" variant="headingLg">
              Coverage by Language
            </Text>
            {LANGUAGE_COVERAGE.map((lang) => {
              const pct = getCoveragePercent(lang.translated, lang.total);
              const badge = getCoverageBadge(pct);
              return (
                <Card key={lang.code}>
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="h3" variant="headingMd">
                          {lang.name}
                        </Text>
                        <Text as="span" variant="bodyMd" tone="subdued">
                          {lang.nativeName}
                        </Text>
                      </InlineStack>
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                        <Text as="span" variant="headingSm">
                          {pct}%
                        </Text>
                      </InlineStack>
                    </InlineStack>
                    <ProgressBar
                      progress={pct}
                      size="small"
                      tone={pct < 50 ? "critical" : undefined}
                    />
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="span" variant="bodySm" tone="subdued">
                        {lang.translated} of {lang.total} items translated
                      </Text>
                      <Button>Translate Missing</Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              );
            })}

            {/* Coverage by Content Type */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Coverage by Content Type
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "numeric",
                    "numeric",
                    "numeric",
                    "text",
                  ]}
                  headings={[
                    "Type",
                    "Total",
                    "Translated",
                    "Coverage %",
                    "Status",
                  ]}
                  rows={contentRows}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
