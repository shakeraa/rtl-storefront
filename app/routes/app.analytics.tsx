import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  DataTable,
  ButtonGroup,
  Button,
  ProgressBar,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    metrics: {
      totalTranslations: 2847,
      charactersTranslated: 1_240_000,
      aiCost: 142.56,
      timeSaved: "86 hrs",
    },
    dailyVolume: [
      { day: "Mon", count: 120 },
      { day: "Tue", count: 245 },
      { day: "Wed", count: 180 },
      { day: "Thu", count: 310 },
      { day: "Fri", count: 275 },
      { day: "Sat", count: 90 },
      { day: "Sun", count: 65 },
    ],
    topLanguages: [
      ["Arabic", "1,245", "78%", "$12,400"],
      ["French", "892", "92%", "$8,200"],
      ["Hebrew", "420", "45%", "$5,100"],
      ["Farsi", "290", "23%", "$2,800"],
    ],
    costBreakdown: [
      { provider: "OpenAI GPT-4", cost: 68.30, percentage: 48 },
      { provider: "DeepL Pro", cost: 45.20, percentage: 32 },
      { provider: "Google Translate", cost: 29.06, percentage: 20 },
    ],
  });
};

export default function Analytics() {
  const { metrics, dailyVolume, topLanguages, costBreakdown } =
    useLoaderData<typeof loader>();
  const [dateRange, setDateRange] = useState("30");

  const handleDateRangeChange = useCallback(
    (value: string) => setDateRange(value),
    [],
  );

  const maxVolume = Math.max(...dailyVolume.map((d) => d.count));

  return (
    <Page
      backAction={{ content: "Home", url: "/app" }}
      title="Analytics & Reports"
    >
      <TitleBar title="Analytics & Reports" />
      <BlockStack gap="500">
        {/* Date Range Selector */}
        <InlineStack align="end">
          <ButtonGroup variant="segmented">
            <Button
              pressed={dateRange === "7"}
              onClick={() => handleDateRangeChange("7")}
            >
              Last 7 days
            </Button>
            <Button
              pressed={dateRange === "30"}
              onClick={() => handleDateRangeChange("30")}
            >
              Last 30 days
            </Button>
            <Button
              pressed={dateRange === "90"}
              onClick={() => handleDateRangeChange("90")}
            >
              Last 90 days
            </Button>
          </ButtonGroup>
        </InlineStack>

        {/* Metric Cards */}
        <InlineGrid columns={4} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" tone="subdued">
                Total Translations
              </Text>
              <Text as="p" variant="headingXl">
                {metrics.totalTranslations.toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" tone="subdued">
                Characters Translated
              </Text>
              <Text as="p" variant="headingXl">
                {(metrics.charactersTranslated / 1_000_000).toFixed(2)}M
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" tone="subdued">
                AI Cost
              </Text>
              <Text as="p" variant="headingXl">
                ${metrics.aiCost.toFixed(2)}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" tone="subdued">
                Time Saved
              </Text>
              <Text as="p" variant="headingXl">
                {metrics.timeSaved}
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        <Layout>
          <Layout.Section>
            {/* Translation Volume Chart */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Translation Volume
                </Text>
                <InlineStack gap="200" align="end" blockAlign="end">
                  {dailyVolume.map((day) => (
                    <BlockStack key={day.day} gap="200" inlineAlign="center">
                      <Box
                        background="bg-fill-info"
                        borderRadius="100"
                        minHeight={`${Math.max((day.count / maxVolume) * 200, 8)}px`}
                        minWidth="40px"
                      />
                      <Text as="p" variant="bodySm" alignment="center">
                        {day.day}
                      </Text>
                      <Text
                        as="p"
                        variant="bodySm"
                        tone="subdued"
                        alignment="center"
                      >
                        {day.count}
                      </Text>
                    </BlockStack>
                  ))}
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Top Languages Table */}
            <Box paddingBlockStart="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Top Languages
                  </Text>
                  <DataTable
                    columnContentTypes={["text", "numeric", "numeric", "numeric"]}
                    headings={[
                      "Language",
                      "Translations",
                      "Coverage %",
                      "Revenue Impact",
                    ]}
                    rows={topLanguages}
                  />
                </BlockStack>
              </Card>
            </Box>
          </Layout.Section>

          {/* Cost Breakdown Sidebar */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Cost Breakdown
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Total: ${metrics.aiCost.toFixed(2)}
                </Text>
                {costBreakdown.map((item) => (
                  <BlockStack gap="200" key={item.provider}>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        {item.provider}
                      </Text>
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        ${item.cost.toFixed(2)}
                      </Text>
                    </InlineStack>
                    <ProgressBar
                      progress={item.percentage}
                      size="small"
                      tone={
                        item.percentage >= 40
                          ? "highlight"
                          : item.percentage >= 25
                            ? "success"
                            : "primary"
                      }
                    />
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
