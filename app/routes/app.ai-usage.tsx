import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
  getShopUsageStats,
  getWeeklyTrends,
  getCurrentMonthQuota,
  getEngineComparison,
} from "../services/analytics/usage-tracker";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const [stats, weeklyTrends, quota, engines] = await Promise.all([
    getShopUsageStats(shop),
    getWeeklyTrends(shop),
    getCurrentMonthQuota(shop, 1_000_000),
    getEngineComparison(shop),
  ]);

  return json({
    shop,
    stats,
    weeklyTrends,
    quota,
    engines,
  });
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
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
  const { stats, weeklyTrends, quota, engines } = useLoaderData<typeof loader>();

  const quotaBadge = getQuotaBadge(quota.percent);
  const hasHighUsage = quota.percent >= 70;
  const hasNoData = stats.total.totalCalls === 0;

  // Engine rows for table
  const engineRows = engines.map((e) => [
    e.engine,
    formatNumber(e.characters),
    formatNumber(e.apiCalls),
    formatCurrency(e.cost * 100),
    `$${e.ratePer1K.toFixed(3)}/1K`,
  ]);

  // Weekly trend rows
  const trendRows = weeklyTrends.map((t) => [
    t.week,
    formatNumber(t.characters),
    formatNumber(t.apiCalls),
    t.cost,
  ]);

  // Engine comparison rows
  const comparisonRows = engines.map((e) => [
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
            {/* No data state */}
            {hasNoData && (
              <Banner tone="info" title="No Usage Data Yet">
                Start translating content to see your AI usage metrics here.
              </Banner>
            )}

            {/* High usage warning */}
            {hasHighUsage && !hasNoData && (
              <Banner tone="warning" title="High Quota Usage">
                You have used {quota.percent}% of your monthly character quota.
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
                      {formatNumber(stats.total.characters)}
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
                      {formatNumber(stats.total.apiCalls)}
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
                      {formatCurrency(stats.total.costCents)}
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
                    {quota.percent}%
                  </Text>
                  <Text as="span" variant="bodyMd" tone="subdued">
                    {formatNumber(quota.used)} of {formatNumber(quota.limit)}{" "}
                    characters used
                  </Text>
                </InlineStack>
                <ProgressBar
                  progress={quota.percent}
                  size="small"
                  tone={quota.percent >= 90 ? "critical" : undefined}
                />
                <Text as="p" variant="bodySm" tone="subdued">
                  {formatNumber(quota.remaining)} characters remaining this month
                </Text>
              </BlockStack>
            </Card>

            {/* Usage by Engine */}
            {engineRows.length > 0 ? (
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
                    rows={engineRows}
                    totals={[
                      "",
                      formatNumber(stats.total.characters),
                      formatNumber(stats.total.apiCalls),
                      formatCurrency(stats.total.costCents),
                      "",
                    ]}
                    showTotalsInFooter
                  />
                </BlockStack>
              </Card>
            ) : (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Usage by Engine
                  </Text>
                  <Text as="p" tone="subdued">
                    No translation data available yet.
                  </Text>
                </BlockStack>
              </Card>
            )}

            {/* Usage trends (weekly) */}
            {trendRows.length > 0 ? (
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Weekly Usage Trends
                    </Text>
                    <Button disabled>Export CSV</Button>
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
            ) : (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Weekly Usage Trends
                  </Text>
                  <Text as="p" tone="subdued">
                    No weekly data available yet.
                  </Text>
                </BlockStack>
              </Card>
            )}

            {/* Engine comparison */}
            {comparisonRows.length > 0 ? (
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
            ) : (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Engine Comparison
                  </Text>
                  <Text as="p" tone="subdued">
                    No engine comparison data available yet.
                  </Text>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
