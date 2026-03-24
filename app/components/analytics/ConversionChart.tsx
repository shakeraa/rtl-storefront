/**
 * ConversionChart
 * T0012: Conversion metrics display using Polaris components.
 */

import { Card, BlockStack, InlineStack, Box, Text, Badge, DataTable } from "@shopify/polaris";
import { t } from "../../utils/i18n";

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
  locale?: string;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export function ConversionChart({
  data,
  title,
  conversionRate,
  locale = 'en',
}: ConversionChartProps) {
  const resolvedTitle = title ?? t('conversions_by_language', locale);
  if (data.length === 0) {
    return (
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">{resolvedTitle}</Text>
          <Text as="p" variant="bodyMd" tone="subdued">{t('no_data', locale)}</Text>
        </BlockStack>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const tableRows = data.map((item) => [
    item.language,
    item.count.toLocaleString(),
    formatCurrency(item.revenue, item.currency),
    formatCurrency(item.avgOrderValue, item.currency),
  ]);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">{resolvedTitle}</Text>
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
                  <Text as="span" variant="bodyMd">{formatCurrency(item.revenue, item.currency)}</Text>
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
