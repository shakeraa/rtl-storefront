import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, InlineGrid,
  Text, ProgressBar, DataTable, Badge, Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { calculateCoverage, getCoverageLevel, getCoverageColor } from "../services/coverage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const locales = [
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "he", name: "Hebrew", nativeName: "עברית" },
    { code: "fa", name: "Farsi", nativeName: "فارسی" },
    { code: "fr", name: "French", nativeName: "Français" },
  ];

  const totalContent = 1284;
  const translatedCounts: Record<string, number> = { ar: 1001, he: 578, fa: 295, fr: 1181 };

  const coverageData = locales.map((locale) => {
    const translated = translatedCounts[locale.code] ?? 0;
    const percent = calculateCoverage(totalContent, translated);
    const level = getCoverageLevel(percent);
    return { ...locale, total: totalContent, translated, percent, level, color: getCoverageColor(level) };
  });

  const overallPercent = calculateCoverage(
    coverageData.reduce((s, c) => s + c.total, 0),
    coverageData.reduce((s, c) => s + c.translated, 0),
  );

  return json({
    shop: session.shop,
    languages: locales.length,
    overallPercent,
    contentItems: totalContent,
    monthlyCost: 47.82,
    coverageData,
    recentActivity: [
      ["Translated", "Premium Abaya - Black", "Arabic", "2 min ago"],
      ["Updated", "Summer Collection", "Hebrew", "15 min ago"],
      ["Glossary", "Hijab → حجاب", "Arabic", "1 hour ago"],
      ["AI Translated", "Shipping Policy", "Farsi", "2 hours ago"],
      ["Translated", "About Us", "French", "3 hours ago"],
    ],
  });
};

export default function Dashboard() {
  const { languages, overallPercent, contentItems, monthlyCost, coverageData, recentActivity } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="RTL Storefront">
        <button variant="primary" onClick={() => { open("/app/translate", "_self"); }}>
          Start Translating
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <InlineGrid columns={4} gap="400">
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">Languages</Text><Text as="p" variant="headingLg">{languages}</Text></BlockStack></Card>
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">Coverage</Text><Text as="p" variant="headingLg">{overallPercent}%</Text></BlockStack></Card>
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">AI Cost (Month)</Text><Text as="p" variant="headingLg">${monthlyCost}</Text></BlockStack></Card>
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">Content Items</Text><Text as="p" variant="headingLg">{contentItems.toLocaleString()}</Text></BlockStack></Card>
        </InlineGrid>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Translation Coverage</Text>
                {coverageData.map((lang) => (
                  <BlockStack gap="200" key={lang.code}>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">{lang.name} ({lang.nativeName})</Text>
                      <Badge tone={lang.level === "excellent" ? "success" : lang.level === "good" ? "info" : lang.level === "warning" ? "warning" : "critical"}>{lang.percent}%</Badge>
                    </InlineStack>
                    <ProgressBar progress={lang.percent} size="small" tone={lang.level === "critical" ? "critical" : "primary"} />
                  </BlockStack>
                ))}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Recent Activity</Text>
                <DataTable columnContentTypes={["text", "text", "text", "text"]} headings={["Action", "Resource", "Language", "When"]} rows={recentActivity} />
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card><BlockStack gap="300"><Text as="h2" variant="headingMd">Translate Content</Text><Text as="p" variant="bodyMd">Translate products, collections, and pages.</Text><Button url="/app/translate">Go to Translate</Button></BlockStack></Card>
              <Card><BlockStack gap="300"><Text as="h2" variant="headingMd">Manage Glossary</Text><Text as="p" variant="bodyMd">Brand terms and never-translate words.</Text><Button url="/app/glossary">Go to Glossary</Button></BlockStack></Card>
              <Card><BlockStack gap="300"><Text as="h2" variant="headingMd">RTL Settings</Text><Text as="p" variant="bodyMd">AI providers, fonts, and RTL layout.</Text><Button url="/app/rtl-settings">Go to Settings</Button></BlockStack></Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
