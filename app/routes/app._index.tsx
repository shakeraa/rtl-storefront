import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, InlineGrid,
  Text, ProgressBar, DataTable, Badge, Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { calculateCoverage, getCoverageLevel, getCoverageColor } from "../services/coverage";

const LOCALE_NAMES: Record<string, { name: string; nativeName: string }> = {
  ar: { name: "Arabic", nativeName: "العربية" },
  he: { name: "Hebrew", nativeName: "עברית" },
  fa: { name: "Farsi", nativeName: "فارسی" },
  fr: { name: "French", nativeName: "Français" },
  tr: { name: "Turkish", nativeName: "Türkçe" },
  ur: { name: "Urdu", nativeName: "اردو" },
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  // Query DB for translation counts per target locale
  let translatedCounts: Record<string, number> = {};
  try {
    const groups = await db.translationCache.groupBy({
      by: ["targetLocale"],
      _count: true,
    });
    for (const g of groups) {
      translatedCounts[g.targetLocale] = g._count;
    }
  } catch {
    translatedCounts = {};
  }

  // Get total distinct source content count
  let totalContent = 0;
  try {
    const distinctSources = await db.translationCache.groupBy({
      by: ["sourceText"],
      _count: true,
    });
    totalContent = distinctSources.length;
  } catch {
    totalContent = 0;
  }

  // Query monthly cost estimate from ShopUsage
  let monthlyCost = 0;
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const usage = await db.shopUsage.findFirst({
      where: { shop: session.shop, periodStart: { gte: periodStart } },
      orderBy: { periodStart: "desc" },
    });
    if (usage) {
      // Rough estimate: $0.00002 per word (typical AI translation cost)
      monthlyCost = Math.round(usage.wordsUsed * 0.00002 * 100) / 100;
    }
  } catch {
    monthlyCost = 0;
  }

  // Query recent activity from DataAccessLog
  let recentActivity: string[][] = [];
  try {
    const logs = await db.dataAccessLog.findMany({
      where: { shop: session.shop },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    recentActivity = logs.map((log) => {
      const ago = getTimeAgo(log.createdAt);
      return [log.action, log.dataType, log.details ?? "", ago];
    });
  } catch {
    recentActivity = [];
  }

  // Build locale list from translated counts
  const localeCodes = Object.keys(translatedCounts).length > 0
    ? Object.keys(translatedCounts)
    : ["ar", "he", "fa", "fr"];

  const locales = localeCodes.map((code) => ({
    code,
    name: LOCALE_NAMES[code]?.name ?? code,
    nativeName: LOCALE_NAMES[code]?.nativeName ?? code,
  }));

  const coverageData = locales.map((locale) => {
    const translated = translatedCounts[locale.code] ?? 0;
    const total = totalContent || Math.max(translated, 1);
    const percent = calculateCoverage(total, translated);
    const level = getCoverageLevel(percent);
    return { ...locale, total, translated, percent, level, color: getCoverageColor(level) };
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
    monthlyCost,
    coverageData,
    recentActivity,
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
                      <Badge tone={lang.level === "excellent" ? "success" : lang.level === "good" ? "info" : lang.level === "warning" ? "warning" : "critical"}>{`${lang.percent}%`}</Badge>
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
              <Card><BlockStack gap="300"><Text as="h2" variant="headingMd">Seed Test Products</Text><Text as="p" variant="bodyMd">Create rich content products for testing.</Text><Button url="/app/seed-products">Seed Products</Button></BlockStack></Card>
              <Card><BlockStack gap="300"><Text as="h2" variant="headingMd">RTL Settings</Text><Text as="p" variant="bodyMd">AI providers, fonts, and RTL layout.</Text><Button url="/app/rtl-settings">Go to Settings</Button></BlockStack></Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
