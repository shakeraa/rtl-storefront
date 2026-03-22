import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, InlineGrid, Text,
  DataTable, Box, Badge, ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { calculateROI } from "../services/analytics/roi";
import { calculateTrendDirection } from "../services/analytics/trends";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const providers = [
    { name: "OpenAI", requests: 2847, characters: 1284000, cost: 25.68 },
    { name: "DeepL", requests: 1203, characters: 542000, cost: 13.55 },
    { name: "Google", requests: 891, characters: 401000, cost: 4.01 },
  ];

  const totalCost = providers.reduce((s, p) => s + p.cost, 0);
  const totalRequests = providers.reduce((s, p) => s + p.requests, 0);
  const totalCharacters = providers.reduce((s, p) => s + p.characters, 0);
  const roi = calculateROI(totalCost, 12500);

  const weeklyVolume = [
    { day: "Mon", count: 340 }, { day: "Tue", count: 520 },
    { day: "Wed", count: 410 }, { day: "Thu", count: 680 },
    { day: "Fri", count: 290 }, { day: "Sat", count: 150 },
    { day: "Sun", count: 180 },
  ];
  const maxVolume = Math.max(...weeklyVolume.map((d) => d.count));
  const trend = calculateTrendDirection(weeklyVolume.map((d) => d.count));

  const topLanguages = [
    ["Arabic", "2,847", "78%", "$8,500"],
    ["Hebrew", "1,203", "45%", "$2,800"],
    ["Farsi", "891", "23%", "$1,200"],
    ["French", "4,120", "92%", "$11,300"],
  ];

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
                    <ProgressBar progress={Math.round((p.cost / totalProviderCost) * 100)} size="small" />
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
