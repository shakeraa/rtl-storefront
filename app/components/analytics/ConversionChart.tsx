/**
 * ConversionChart
 * T0012: Conversion metrics display using Polaris components.
 */

import { Card, BlockStack, InlineStack, Box, Text, Badge, DataTable } from "@shopify/polaris";

export interface ConversionChartData {
  language: string;
  count: number;
  revenue: number;
  avgOrderValue: number;
  currency?: string;
}

interface ConversionChartProps {
  data: ConversionChartData[];
  title?: string;
  conversionRate?: number;
}

export function ConversionChart({
  data,
  title = "Conversions by Language",
  conversionRate,
}: ConversionChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">{title}</Text>
          <Text as="p" variant="bodyMd" tone="subdued">No conversion data available.</Text>
        </BlockStack>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const tableRows = data.map((item) => [
    item.language,
    item.count.toLocaleString(),
    `$${item.revenue.toFixed(2)}`,
    `$${item.avgOrderValue.toFixed(2)}`,
  ]);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">{title}</Text>
          {conversionRate !== undefined && (
            <Badge tone="success">{conversionRate.toFixed(1)}% rate</Badge>
          )}
        </InlineStack>

        {/* Revenue bars */}
        <BlockStack gap="300">
          {data.map((item) => {
            const barWidthPct = Math.max((item.revenue / maxRevenue) * 100, 2);
            return (
              <BlockStack gap="100" key={item.language}>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">{item.language}</Text>
                  <Text as="span" variant="bodyMd">${item.revenue.toFixed(2)}</Text>
                </InlineStack>
                <Box
                  background="bg-fill-success"
                  borderRadius="100"
                  minHeight="12px"
                  minWidth={`${barWidthPct}%`}
                />
              </BlockStack>
            );
          })}
        </BlockStack>

        <DataTable
          columnContentTypes={["text", "numeric", "numeric", "numeric"]}
          headings={["Language", "Conversions", "Revenue", "Avg. Order"]}
          rows={tableRows}
        />
      </BlockStack>
    </Card>
  );
}
