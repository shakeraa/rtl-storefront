/**
 * Size Guide Component
 * T0012: Size Guide
 */

import { useState, useMemo } from 'react';
import {
  Modal,
  DataTable,
  BlockStack,
  Text,
  Button,
  TextField,
  Select,
} from '@shopify/polaris';
import {
  ABAYA_SIZE_GUIDE,
  HIJAB_SIZE_GUIDE,
  recommendSize,
  convertMeasurement,
  type SizeGuide as SizeGuideType,
} from '~/services/size-guide';

export interface SizeGuideProps {
  category: 'clothing' | 'hijab' | 'shoes';
  unit?: 'cm' | 'inch';
  locale?: 'ar' | 'en';
  activator?: React.ReactElement;
}

export function SizeGuide({
  category,
  unit = 'cm',
  locale = 'en',
  activator,
}: SizeGuideProps) {
  const [open, setOpen] = useState(false);
  const [measureUnit, setMeasureUnit] = useState(unit);
  
  const guide = useMemo(() => {
    switch (category) {
      case 'clothing':
        return ABAYA_SIZE_GUIDE;
      case 'hijab':
        return HIJAB_SIZE_GUIDE;
      default:
        return ABAYA_SIZE_GUIDE;
    }
  }, [category]);

  const rows = useMemo(() => {
    return guide.sizes.map((size) => [
      size.size,
      ...guide.measurements.map((m) => {
        const value = size.measurements[m.id];
        if (measureUnit === 'inch' && value) {
          return `${convertMeasurement(value, 'cm', 'inch')}"`;
        }
        return `${value} cm`;
      }),
    ]);
  }, [guide, measureUnit]);

  const headings = [
    locale === 'ar' ? 'المقاس' : 'Size',
    ...guide.measurements.map((m) =>
      locale === 'ar' ? m.nameAr : m.name
    ),
  ];

  const defaultActivator = (
    <Button onClick={() => setOpen(true)}>
      {locale === 'ar' ? 'دليل المقاسات' : 'Size Guide'}
    </Button>
  );

  return (
    <>
      {activator || defaultActivator}
      
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={locale === 'ar' ? guide.nameAr : guide.name}
        primaryAction={{
          content: locale === 'ar' ? 'إغلاق' : 'Close',
          onAction: () => setOpen(false),
        }}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Select
              label={locale === 'ar' ? 'وحدة القياس' : 'Unit'}
              options={[
                { label: 'cm', value: 'cm' },
                { label: 'inch', value: 'inch' },
              ]}
              value={measureUnit}
              onChange={(v) => setMeasureUnit(v as 'cm' | 'inch')}
            />
            
            <DataTable
              columnContentTypes={['text', ...guide.measurements.map(() => 'numeric' as const)]}
              headings={headings}
              rows={rows}
            />
            
            {guide.notes && (
              <Text variant="bodySm" as="p" tone="subdued">
                {locale === 'ar' ? guide.notesAr : guide.notes}
              </Text>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}

// Size Calculator Component
export function SizeCalculator({
  guide,
  locale = 'en',
}: {
  guide: SizeGuideType;
  locale?: 'ar' | 'en';
}) {
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  
  const recommendation = useMemo(() => {
    const numericMeasurements: Record<string, number> = {};
    for (const [key, value] of Object.entries(measurements)) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        numericMeasurements[key] = num;
      }
    }
    return recommendSize(guide, numericMeasurements);
  }, [measurements, guide]);

  return (
    <BlockStack gap="400">
      <Text variant="headingSm" as="h4">
        {locale === 'ar' ? 'حاسبة المقاس' : 'Size Calculator'}
      </Text>
      
      {guide.measurements.map((m) => (
        <TextField
          key={m.id}
          label={locale === 'ar' ? m.nameAr : m.name}
          type="number"
          value={measurements[m.id] || ''}
          onChange={(v) =>
            setMeasurements((prev) => ({ ...prev, [m.id]: v }))
          }
          suffix="cm"
          helpText={locale === 'ar' ? m.descriptionAr : m.description}
        />
      ))}
      
      {recommendation.size && (
        <BlockStack gap="200">
          <Text variant="headingMd" as="p">
            {locale === 'ar'
              ? `المقاس الموصى به: ${recommendation.size}`
              : `Recommended Size: ${recommendation.size}`}
          </Text>
          <Text variant="bodySm" as="p" tone="subdued">
            {locale === 'ar'
              ? `الثقة: ${recommendation.confidence === 'high' ? 'عالية' : recommendation.confidence === 'medium' ? 'متوسطة' : 'منخفضة'}`
              : `Confidence: ${recommendation.confidence}`}
          </Text>
        </BlockStack>
      )}
    </BlockStack>
  );
}
