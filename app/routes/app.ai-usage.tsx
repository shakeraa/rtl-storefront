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
import {
  calculateCost,
  getProviderCostRate,
} from "../services/analytics/ai-usage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Return mock usage data for the dashboard
  const engineCharacters = ENGINE_USAGE.reduce((sum, e) => sum + e.characters, 0);
  const engineCost = ENGINE_USAGE.reduce((sum, e) => sum + e.cost, 0);
  const engineCalls = ENGINE_USAGE.reduce((sum, e) => sum + e.apiCalls, 0);

  return json({
    totalCharacters: engineCharacters,
    totalCost: engineCost,
    totalApiCalls: engineCalls,
  });
};

// --- Mock / sample data ---

interface EngineUsage {
  engine: string;
  characters: number;
  apiCalls: number;
  cost: number;
  ratePer1K: number;
  qualityScore: number;
  avgSpeed: string;
}

const ENGINE_USAGE: EngineUsage[] = [
  {
    engine: "OpenAI",
    characters: 482_300,
    apiCalls: 1_247,
    cost: calculateCost("openai", 482_300),
    ratePer1K: getProviderCostRate("openai"),
    qualityScore: 94,
    avgSpeed: "1.2s",
  },
  {
    engine: "DeepL",
    characters: 215_600,
    apiCalls: 643,
    cost: calculateCost("deepl", 215_600),
    ratePer1K: getProviderCostRate("deepl"),
    qualityScore: 96,
    avgSpeed: "0.8s",
  },
  {
    engine: "Google",
    characters: 128_400,
    apiCalls: 412,
    cost: calculateCost("google", 128_400),
    ratePer1K: getProviderCostRate("google"),
    qualityScore: 88,
    avgSpeed: "0.5s",
  },
];

const QUOTA_LIMIT = 1_000_000;
const QUOTA_USED = ENGINE_USAGE.reduce((sum, e) => sum + e.characters, 0);
const QUOTA_REMAINING = QUOTA_LIMIT - QUOTA_USED;
const QUOTA_PERCENT = Math.round((QUOTA_USED / QUOTA_LIMIT) * 100);

interface WeeklyTrend {
  week: string;
  characters: number;
  apiCalls: number;
  cost: string;
}

const WEEKLY_TRENDS: WeeklyTrend[] = [
  { week: "Mar 17 – Mar 23", characters: 142_800, apiCalls: 387, cost: "$3.12" },
  { week: "Mar 10 – Mar 16", characters: 168_200, apiCalls: 445, cost: "$3.68" },
  { week: "Mar 3 – Mar 9", characters: 198_500, apiCalls: 512, cost: "$4.21" },
  { week: "Feb 24 – Mar 2", characters: 156_400, apiCalls: 402, cost: "$3.41" },
  { week: "Feb 17 – Feb 23", characters: 160_400, apiCalls: 556, cost: "$3.52" },
];

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`;
}

function getQuotaBadge(percent: number): {
  label: string;
  tone: "success" | "warning" | "critical" | "attention";
} {
  if (percent >= 90) return { label: "Near Limit", tone: "critical" };
  if (percent >= 70) return { label: "High Usage", tone: "warning" };
  if (percent >= 40) return { label: "Moderate", tone: "attention" };
  return { label: "Healthy", tone: "success" };
}

export default function AIUsagePage() {
  const totalCharacters = ENGINE_USAGE.reduce((sum, e) => sum + e.characters, 0);
  const totalCost = ENGINE_USAGE.reduce((sum, e) => sum + e.cost, 0);
  const totalCalls = ENGINE_USAGE.reduce((sum, e) => sum + e.apiCalls, 0);

  const quotaBadge = getQuotaBadge(QUOTA_PERCENT);

  const hasHighUsage = QUOTA_PERCENT >= 70;

  // Characters per engine rows
  const characterRows = ENGINE_USAGE.map((e) => [
    e.engine,
    formatNumber(e.characters),
    formatNumber(e.apiCalls),
    formatCurrency(e.cost),
    `$${e.ratePer1K.toFixed(3)}/1K`,
  ]);

  // Weekly trend rows
  const trendRows = WEEKLY_TRENDS.map((t) => [
    t.week,
    formatNumber(t.characters),
    formatNumber(t.apiCalls),
    t.cost,
  ]);

  // Engine comparison rows
  const comparisonRows = ENGINE_USAGE.map((e) => [
    e.engine,
    e.avgSpeed,
    `$${e.ratePer1K.toFixed(3)}/1K`,
    `${e.qualityScore}/100`,
    formatNumber(e.characters),
  ]);

  return (
    <Page>
      <TitleBar title="AI Usage Metrics" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* High usage warning */}
            {hasHighUsage && (
              <Banner tone="warning" title="High Quota Usage">
                You have used {QUOTA_PERCENT}% of your monthly character quota.
                Consider upgrading your plan or optimizing translation batches to
                reduce API calls.
              </Banner>
            )}

            {/* Summary cards */}
            <InlineStack gap="400" wrap>
              <Box minWidth="200px">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Total Characters
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {formatNumber(totalCharacters)}
                    </Text>
                  </BlockStack>
                </Card>
              </Box>
              <Box minWidth="200px">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      API Calls
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {formatNumber(totalCalls)}
                    </Text>
                  </BlockStack>
                </Card>
              </Box>
              <Box minWidth="200px">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm" tone="subdued">
                      Total Cost
                    </Text>
                    <Text as="p" variant="heading2xl">
                      {formatCurrency(totalCost)}
                    </Text>
                  </BlockStack>
                </Card>
              </Box>
            </InlineStack>

            {/* Quota remaining */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Monthly Quota
                  </Text>
                  <Badge tone={quotaBadge.tone}>{quotaBadge.label}</Badge>
                </InlineStack>
                <InlineStack gap="400" blockAlign="end">
                  <Text as="span" variant="heading2xl">
                    {QUOTA_PERCENT}%
                  </Text>
                  <Text as="span" variant="bodyMd" tone="subdued">
                    {formatNumber(QUOTA_USED)} of {formatNumber(QUOTA_LIMIT)}{" "}
                    characters used
                  </Text>
                </InlineStack>
                <ProgressBar
                  progress={QUOTA_PERCENT}
                  size="small"
                  tone={QUOTA_PERCENT >= 90 ? "critical" : undefined}
                />
                <Text as="p" variant="bodySm" tone="subdued">
                  {formatNumber(QUOTA_REMAINING)} characters remaining this month
                </Text>
              </BlockStack>
            </Card>

            {/* Characters translated per engine */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Usage by Engine
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
                    "Engine",
                    "Characters",
                    "API Calls",
                    "Cost",
                    "Rate",
                  ]}
                  rows={characterRows}
                  totals={[
                    "",
                    formatNumber(totalCharacters),
                    formatNumber(totalCalls),
                    formatCurrency(totalCost),
                    "",
                  ]}
                  showTotalsInFooter
                />
              </BlockStack>
            </Card>

            {/* Usage trends (weekly) */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Weekly Usage Trends
                  </Text>
                  <Button>Export CSV</Button>
                </InlineStack>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "numeric",
                    "numeric",
                    "numeric",
                  ]}
                  headings={["Week", "Characters", "API Calls", "Cost"]}
                  rows={trendRows}
                />
              </BlockStack>
            </Card>

            {/* Engine comparison */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Engine Comparison
                </Text>
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "numeric",
                  ]}
                  headings={[
                    "Engine",
                    "Avg Speed",
                    "Cost per 1K Chars",
                    "Quality Score",
                    "Characters Translated",
                  ]}
                  rows={comparisonRows}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
