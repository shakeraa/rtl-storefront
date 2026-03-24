/**
 * TranslationChart
 * T0012: Bar chart showing translations by language using Polaris components.
 */

import { Card, BlockStack, InlineStack, Box, Text, Badge } from "@shopify/polaris";
import { t } from "../../utils/i18n";

export interface TranslationChartData {
  language: string;
  count: number;
  chars?: number;
  words?: number;
}

interface TranslationChartProps {
  data: TranslationChartData[];
  title?: string;
  locale?: string;
}

export function TranslationChart({ data, title, locale = 'en' }: TranslationChartProps) {
  const resolvedTitle = title ?? t('translations_by_language', locale);
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

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">{resolvedTitle}</Text>
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
                        {item.words.toLocaleString()} {t('words', locale)}
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
