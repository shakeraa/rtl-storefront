/**
 * TranslationChart
 * T0012: Bar chart showing translations by language using Polaris components.
 */

import { Card, BlockStack, InlineStack, Box, Text, Badge } from "@shopify/polaris";

export interface TranslationChartData {
  language: string;
  count: number;
  chars?: number;
  words?: number;
}

interface TranslationChartProps {
  data: TranslationChartData[];
  title?: string;
}

export function TranslationChart({ data, title = "Translations by Language" }: TranslationChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">{title}</Text>
          <Text as="p" variant="bodyMd" tone="subdued">No translation data available.</Text>
        </BlockStack>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">{title}</Text>
        <BlockStack gap="300">
          {data.map((item) => {
            const barWidthPct = Math.max((item.count / maxCount) * 100, 2);
            return (
              <BlockStack gap="100" key={item.language}>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">{item.language}</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge>{item.count.toLocaleString()}</Badge>
                    {item.words !== undefined && (
                      <Text as="span" variant="bodySm" tone="subdued">
                        {item.words.toLocaleString()} words
                      </Text>
                    )}
                  </InlineStack>
                </InlineStack>
                <Box
                  background="bg-fill-info"
                  borderRadius="100"
                  minHeight="12px"
                  minWidth={`${barWidthPct}%`}
                />
              </BlockStack>
            );
          })}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
