/**
 * Translation Coverage Dashboard Component
 * T0009: Admin Dashboard
 */

import { useState } from 'react';
import {
  BlockStack,
  Text,
  ProgressBar,
  DataTable,
  Badge,
  Button,
  Box,
} from '@shopify/polaris';

export interface CoverageData {
  locale: string;
  languageName: string;
  totalStrings: number;
  translatedStrings: number;
  coverage: number;
  lastUpdated: string;
}

export interface TranslationCoverageProps {
  data: CoverageData[];
  onTranslateMissing?: (locale: string) => void;
  locale?: 'ar' | 'en';
}

export function TranslationCoverage({
  data,
  onTranslateMissing,
  locale = 'en',
}: TranslationCoverageProps) {
  const sortedData = [...data].sort((a, b) => b.coverage - a.coverage);

  const rows = sortedData.map((item) => [
    item.languageName,
    `${item.translatedStrings}/${item.totalStrings}`,
    <ProgressBar
      key={item.locale}
      progress={item.coverage}
      size="small"
      tone={item.coverage >= 90 ? 'success' : item.coverage >= 50 ? 'warning' : 'critical'}
    />,
    `${item.coverage.toFixed(1)}%`,
    item.lastUpdated,
    item.coverage < 100 ? (
      <Button
        size="slim"
        onClick={() => onTranslateMissing?.(item.locale)}
      >
        {locale === 'ar' ? 'ترجمة' : 'Translate'}
      </Button>
    ) : (
      <Badge tone="success">{locale === 'ar' ? 'مكتمل' : 'Complete'}</Badge>
    ),
  ]);

  const headings = [
    locale === 'ar' ? 'اللغة' : 'Language',
    locale === 'ar' ? 'النصوص' : 'Strings',
    locale === 'ar' ? 'التغطية' : 'Coverage',
    locale === 'ar' ? 'النسبة' : 'Percentage',
    locale === 'ar' ? 'آخر تحديث' : 'Last Updated',
    locale === 'ar' ? 'إجراء' : 'Action',
  ];

  return (
    <Box padding="400">
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          {locale === 'ar' ? 'تغطية الترجمة' : 'Translation Coverage'}
        </Text>

        <DataTable
          columnContentTypes={['text', 'text', 'numeric', 'numeric', 'text', 'text']}
          headings={headings}
          rows={rows}
        />
      </BlockStack>
    </Box>
  );
}
