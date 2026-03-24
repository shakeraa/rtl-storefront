/**
 * UsageMetrics
 * T0012: Word count, API usage summary cards using Polaris components.
 */

import { Card, BlockStack, InlineGrid, InlineStack, Text, Badge } from "@shopify/polaris";
import { t } from "../../utils/i18n";

export interface UsageMetricsData {
  totalTranslations: number;
  totalWords: number;
  totalChars: number;
  totalRequests: number;
  avgConfidence?: number;
  avgProcessingTimeMs?: number;
  providers?: Array<{ name: string; requests: number; cost: number }>;
}

interface UsageMetricsProps {
  data: UsageMetricsData;
  title?: string;
  locale?: string;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text as="p" variant="bodyMd" tone="subdued">{label}</Text>
        <Text as="p" variant="headingLg">{value}</Text>
        {sub && <Text as="p" variant="bodySm" tone="subdued">{sub}</Text>}
      </BlockStack>
    </Card>
  );
}

export function UsageMetrics({ data, title, locale = 'en' }: UsageMetricsProps) {
  const resolvedTitle = title ?? t('usage_summary', locale);
  const wordCountFormatted =
    data.totalWords >= 1_000_000
      ? `${(data.totalWords / 1_000_000).toFixed(1)}M`
      : data.totalWords >= 1_000
      ? `${(data.totalWords / 1_000).toFixed(1)}K`
      : data.totalWords.toLocaleString();

  const charCountFormatted =
    data.totalChars >= 1_000_000
      ? `${(data.totalChars / 1_000_000).toFixed(1)}M`
      : data.totalChars >= 1_000
      ? `${(data.totalChars / 1_000).toFixed(1)}K`
      : data.totalChars.toLocaleString();

  const avgConfidencePct =
    data.avgConfidence !== undefined
      ? `${(data.avgConfidence * 100).toFixed(1)}%`
      : undefined;

  const avgProcessingSec =
    data.avgProcessingTimeMs !== undefined
      ? `${(data.avgProcessingTimeMs / 1000).toFixed(2)}s avg`
      : undefined;

  return (
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">{resolvedTitle}</Text>
      <InlineGrid columns={4} gap="400">
        <MetricCard
          label={t('total_translations', locale)}
          value={data.totalTranslations.toLocaleString()}
        />
        <MetricCard
          label={t('words_translated', locale)}
          value={wordCountFormatted}
          sub={`${charCountFormatted} ${t('characters', locale)}`}
        />
        <MetricCard
          label={t('api_requests', locale)}
          value={data.totalRequests.toLocaleString()}
          sub={avgProcessingSec}
        />
        {avgConfidencePct && (
          <MetricCard
            label={t('ai_confidence', locale)}
            value={avgConfidencePct}
          />
        )}
      </InlineGrid>

      {data.providers && data.providers.length > 0 && (
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">{t('by_provider', locale)}</Text>
            <BlockStack gap="200">
              {data.providers.map((provider) => (
                <InlineStack key={provider.name} align="space-between" blockAlign="center">
                  <Text as="span" variant="bodyMd">{provider.name}</Text>
                  <InlineStack gap="300" blockAlign="center">
                    <Text as="span" variant="bodySm" tone="subdued">
                      {provider.requests.toLocaleString()} req
                    </Text>
                    <Badge>{formatCurrency(provider.cost)}</Badge>
                  </InlineStack>
                </InlineStack>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}
