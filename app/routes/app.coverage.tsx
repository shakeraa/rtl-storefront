import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineStack, Text, ProgressBar, Badge, Button, DataTable, Banner } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { calculateCoverage, getCoverageLevel, getCoverageColor } from "../services/coverage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const localeInfo: Record<string, { name: string; native: string }> = {
    ar: { name: "Arabic", native: "العربية" },
    he: { name: "Hebrew", native: "עברית" },
    fa: { name: "Farsi", native: "فارسی" },
    fr: { name: "French", native: "Français" },
    tr: { name: "Turkish", native: "Türkçe" },
    ur: { name: "Urdu", native: "اردو" },
  };

  const resourceTypes = [
    { type: "Products", total: 156 },
    { type: "Collections", total: 24 },
    { type: "Pages", total: 12 },
    { type: "Blog Posts", total: 34 },
    { type: "Navigation", total: 10 },
    { type: "Theme", total: 48 },
  ];
  const grandTotal = resourceTypes.reduce((s, r) => s + r.total, 0);

  const translatedByLocale: Record<string, number> = { ar: 235, he: 134, fa: 68, fr: 271, tr: 0, ur: 0 };

  const coverageByLocale = Object.entries(localeInfo).map(([code, info]) => {
    const translated = translatedByLocale[code] ?? 0;
    const percent = calculateCoverage(grandTotal, translated);
    const level = getCoverageLevel(percent);
    return { code, ...info, total: grandTotal, translated, percent, level, color: getCoverageColor(level) };
  }).sort((a, b) => a.percent - b.percent);

  const overallPercent = calculateCoverage(
    coverageByLocale.reduce((s, c) => s + c.total, 0),
    coverageByLocale.reduce((s, c) => s + c.translated, 0),
  );

  const hasLowCoverage = coverageByLocale.some((c) => c.percent < 50);

  return json({ coverageByLocale, resourceTypes, overallPercent, grandTotal, hasLowCoverage });
};

export default function CoveragePage() {
  const { coverageByLocale, resourceTypes, overallPercent, grandTotal, hasLowCoverage } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Translation Coverage" />
      <BlockStack gap="500">
        {hasLowCoverage && (
          <Banner title="Low coverage detected" tone="warning">
            <p>Some languages have less than 50% coverage. Consider prioritizing translations for these markets.</p>
          </Banner>
        )}
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">Overall Coverage</Text>
            <Text as="p" variant="headingXl">{overallPercent}%</Text>
            <ProgressBar progress={overallPercent} size="small" />
            <Text as="p" variant="bodyMd" tone="subdued">{grandTotal} total content items across {coverageByLocale.length} languages</Text>
          </BlockStack>
        </Card>

        <Text as="h2" variant="headingMd">Coverage by Language</Text>
        <Layout>
          {coverageByLocale.map((lang) => (
            <Layout.Section key={lang.code} variant="oneThird">
              <Card>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h3" variant="headingMd">{lang.name}</Text>
                    <Badge tone={lang.level === "excellent" ? "success" : lang.level === "good" ? "info" : lang.level === "warning" ? "warning" : "critical"}>{lang.level}</Badge>
                  </InlineStack>
                  <Text as="p" variant="bodyMd" tone="subdued">{lang.native}</Text>
                  <Text as="p" variant="headingLg">{lang.percent}%</Text>
                  <ProgressBar progress={lang.percent} size="small" tone={lang.level === "critical" ? "critical" : "primary"} />
                  <Text as="p" variant="bodyMd">{lang.translated} / {lang.total} items</Text>
                  <Button url="/app/translate" size="slim">Translate Missing</Button>
                </BlockStack>
              </Card>
            </Layout.Section>
          ))}
        </Layout>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">Coverage by Content Type</Text>
            <DataTable
              columnContentTypes={["text", "numeric"]}
              headings={["Content Type", "Total Items"]}
              rows={resourceTypes.map((r) => [r.type, r.total])}
            />
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
