import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, InlineGrid, Text,
  DataTable, Box, Badge, ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import db from "../db.server";
import {
  getTranslationVolumeByLanguage,
  getConversionMetricsByLanguage,
  getAIConfidenceMetrics,
  getEventCount,
} from "../services/analytics/tracker";
import { CostMonitor } from "../services/performance/cost-monitor";

const LOCALE_DISPLAY: Record<string, string> = {
  ar: "Arabic", he: "Hebrew", fa: "Farsi", fr: "French", tr: "Turkish", ur: "Urdu",
};

// ROI calculation — see also ../services/analytics/tracker for conversion metrics
function calculateROI(cost: number, revenue: number): number {
  if (cost === 0) return 0;
  return ((revenue - cost) / cost) * 100;
}

// Trend direction — see also ../services/analytics/tracker for event-based trends
function calculateTrendDirection(values: number[]): "up" | "down" | "stable" {
  if (values.length < 2) return "stable";
  const first = values.slice(0, Math.floor(values.length / 2));
  const second = values.slice(Math.floor(values.length / 2));
  const avgFirst = first.reduce((s, v) => s + v, 0) / first.length;
  const avgSecond = second.reduce((s, v) => s + v, 0) / second.length;
  if (avgSecond > avgFirst * 1.05) return "up";
  if (avgSecond < avgFirst * 0.95) return "down";
  return "stable";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, shop } = await authenticateWithTenant(request);

  // Pull live data from analytics and cost-monitor services when events exist
  const translationVolume = getTranslationVolumeByLanguage();
  const conversionMetrics = getConversionMetricsByLanguage();
  const confidenceMetrics = getAIConfidenceMetrics();
  const trackedEventCount = getEventCount();
  const costMonitor = new CostMonitor();

  // Fall back to DB-based data when the in-memory event store is empty
  let providers: Array<{ name: string; requests: number; characters: number; cost: number }>;
  if (trackedEventCount > 0) {
    providers = Object.entries(costMonitor.getCostByProvider()).map(([name, cost]) => ({
      name,
      requests: translationVolume[name]?.count ?? 0,
      characters: translationVolume[name]?.chars ?? 0,
      cost,
    }));
  } else {
    // Try to build from translation cache grouped by provider
    try {
      const providerGroups = await db.translationCache.groupBy({
        by: ["provider"],
        where: { shop },
        _count: true,
      });
      if (providerGroups.length > 0) {
        providers = providerGroups.map((g) => ({
          name: g.provider,
          requests: g._count,
          characters: g._count * 500, // estimate ~500 chars per translation
          cost: g._count * 0.01, // rough cost estimate
        }));
      } else {
        providers = [];
      }
    } catch {
      providers = [];
    }
  }

  const totalCost = providers.reduce((s, p) => s + p.cost, 0);
  const totalRequests = providers.reduce((s, p) => s + p.requests, 0);
  const totalCharacters = providers.reduce((s, p) => s + p.characters, 0);
  const estimatedRevenue = Object.values(conversionMetrics).reduce((s, m) => s + m.totalValue, 0) || 12500;
  const roi = calculateROI(totalCost, estimatedRevenue);

  // Build weekly volume from translation cache (last 7 days)
  let weeklyVolume: Array<{ day: string; count: number }> = [];
  try {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await db.translationCache.count({
        where: {
          shop,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      });
      weeklyVolume.push({ day: dayNames[dayStart.getDay()], count });
    }
  } catch {
    weeklyVolume = [
      { day: "Mon", count: 0 }, { day: "Tue", count: 0 },
      { day: "Wed", count: 0 }, { day: "Thu", count: 0 },
      { day: "Fri", count: 0 }, { day: "Sat", count: 0 },
      { day: "Sun", count: 0 },
    ];
  }
  const maxVolume = Math.max(1, ...weeklyVolume.map((d) => d.count));
  const trend = calculateTrendDirection(weeklyVolume.map((d) => d.count));

  // Build top languages from translation cache
  let topLanguages: string[][] = [];
  try {
    const langGroups = await db.translationCache.groupBy({
      by: ["targetLocale"],
      where: { shop },
      _count: true,
    });
    const distinctSources = await db.translationCache.groupBy({
      by: ["sourceText"],
      where: { shop },
      _count: true,
    });
    const totalSources = distinctSources.length || 1;

    topLanguages = langGroups
      .sort((a, b) => b._count - a._count)
      .map((g) => {
        const coverage = Math.round((g._count / totalSources) * 100);
        return [
          LOCALE_DISPLAY[g.targetLocale] ?? g.targetLocale,
          g._count.toLocaleString(),
          `${coverage}%`,
          "$0",
        ];
      });
  } catch {
    topLanguages = [];
  }

  return json({
    providers, totalCost, totalRequests, totalCharacters, roi,
    weeklyVolume, maxVolume, trend, topLanguages,
    timeSaved: Math.round(totalCharacters / 30000), // ~500 chars/min = 30k chars/hour
  });
};

export default function AnalyticsPage() {
  const { providers, totalCost, totalRequests, totalCharacters, roi, weeklyVolume, maxVolume, trend, topLanguages, timeSaved } = useLoaderData<typeof loader>();
  const totalProviderCost = providers.reduce((s, p) => s + p.cost, 0);

  return (
    <Page>
      <TitleBar title="Analytics & Reports" />
      <BlockStack gap="500">
        <InlineGrid columns={4} gap="400">
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">Total Translations</Text><Text as="p" variant="headingLg">{totalRequests.toLocaleString()}</Text></BlockStack></Card>
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">Characters</Text><Text as="p" variant="headingLg">{(totalCharacters / 1000000).toFixed(1)}M</Text></BlockStack></Card>
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">AI Cost</Text><Text as="p" variant="headingLg">${totalCost.toFixed(2)}</Text></BlockStack></Card>
          <Card><BlockStack gap="200"><Text as="p" variant="bodyMd" tone="subdued">Time Saved</Text><Text as="p" variant="headingLg">{timeSaved}h</Text></BlockStack></Card>
        </InlineGrid>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Translation Volume (7 days)</Text>
                  <Badge tone={trend === "up" ? "success" : trend === "down" ? "critical" : "info"}>{trend}</Badge>
                </InlineStack>
                <InlineStack gap="200" align="end" blockAlign="end">
                  {weeklyVolume.map((d) => (
                    <BlockStack gap="100" key={d.day} inlineAlign="center">
                      <Box background="bg-fill-info" borderRadius="100" minHeight={`${Math.max((d.count / maxVolume) * 80, 4)}px`} minWidth="32px" />
                      <Text as="p" variant="bodySm">{d.day}</Text>
                    </BlockStack>
                  ))}
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Top Languages</Text>
                <DataTable
                  columnContentTypes={["text", "numeric", "text", "numeric"]}
                  headings={["Language", "Translations", "Coverage", "Revenue Impact"]}
                  rows={topLanguages}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">ROI</Text>
                <Text as="p" variant="headingXl" tone="success">{roi.toFixed(0)}%</Text>
                <Text as="p" variant="bodyMd" tone="subdued">Return on translation investment</Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Cost by Provider</Text>
                {providers.map((p) => (
                  <BlockStack gap="100" key={p.name}>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">{p.name}</Text>
                      <Text as="span" variant="bodyMd">${p.cost.toFixed(2)}</Text>
                    </InlineStack>
                    <ProgressBar progress={totalProviderCost > 0 ? Math.round((p.cost / totalProviderCost) * 100) : 0} size="small" />
                  </BlockStack>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
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
