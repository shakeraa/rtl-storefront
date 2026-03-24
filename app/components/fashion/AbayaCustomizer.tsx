/**
 * Abaya Customization Component
 * T0006: RTL Fashion - Abaya Customization
 */

import { useState, useMemo } from 'react';
import {
  BlockStack,
  Select,
  Text,
  Box,
  Thumbnail,
} from '@shopify/polaris';
import { ABAYA_CUSTOMIZATIONS } from '~/services/fashion';

export interface AbayaCustomizerProps {
  locale?: 'ar' | 'en';
  currency?: string;
  onChange?: (config: Record<string, string>, price: number) => void;
}

const formatPrice = (price: number, currency: string = 'SAR') => {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(price);
};

export function AbayaCustomizer({
  locale = 'en',
  currency = 'SAR',
  onChange,
}: AbayaCustomizerProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  const totalPrice = useMemo(() => {
    let price = 0;
    for (const [categoryId, optionId] of Object.entries(selections)) {
      const category = ABAYA_CUSTOMIZATIONS.find((c) => c.id === categoryId);
      const option = category?.options.find((o) => o.id === optionId);
      if (option) {
        price += option.price;
      }
    }
    return price;
  }, [selections]);

  const calculateTotal = (sels: Record<string, string>) => {
    let price = 0;
    for (const [categoryId, optionId] of Object.entries(sels)) {
      const category = ABAYA_CUSTOMIZATIONS.find((c) => c.id === categoryId);
      const option = category?.options.find((o) => o.id === optionId);
      if (option) {
        price += option.price;
      }
    }
    return price;
  };

  const handleChange = (categoryId: string, optionId: string) => {
    const newSelections = { ...selections, [categoryId]: optionId };
    const newTotal = calculateTotal(newSelections);
    onChange?.(newSelections, newTotal);
    setSelections(newSelections);
  };

  return (
    <Box padding="400">
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">
            {locale === 'ar' ? 'تخصيص العباية' : 'Customize Your Abaya'}
          </Text>

          {ABAYA_CUSTOMIZATIONS.map((category) => (
            <Select
              key={category.id}
              label={
                category.category === 'fabric'
                  ? locale === 'ar'
                    ? 'القماش'
                    : 'Fabric'
                  : category.category === 'color'
                  ? locale === 'ar'
                    ? 'اللون'
                    : 'Color'
                  : category.category === 'embellishment'
                  ? locale === 'ar'
                    ? 'التطريز'
                    : 'Embellishment'
                  : category.category
              }
              options={category.options.map((o) => ({
                label: `${o.name} ${o.price > 0 ? `(+${formatPrice(o.price, currency)})` : ''}`,
                value: o.id,
              }))}
              value={selections[category.id]}
              onChange={(v) => handleChange(category.id, v)}
            />
          ))}

          <Text variant="headingMd" as="p">
            {locale === 'ar'
              ? `السعر الإضافي: ${formatPrice(totalPrice, currency)}`
              : `Additional Price: ${formatPrice(totalPrice, currency)}`}
          </Text>
        </BlockStack>
    </Box>
  );
}
