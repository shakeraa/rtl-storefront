/**
 * Abaya Customization Component
 * T0006: RTL Fashion - Abaya Customization
 */

import { useState, useMemo } from 'react';
import {
  Stack,
  Select,
  Text,
  Card,
  Thumbnail,
} from '@shopify/polaris';
import { ABAYA_CUSTOMIZATIONS } from '~/services/fashion';

export interface AbayaCustomizerProps {
  locale?: 'ar' | 'en';
  onChange?: (config: Record<string, string>, price: number) => void;
}

export function AbayaCustomizer({
  locale = 'en',
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

  const handleChange = (categoryId: string, optionId: string) => {
    const newSelections = { ...selections, [categoryId]: optionId };
    setSelections(newSelections);
    onChange?.(newSelections, totalPrice);
  };

  return (
    <Card>
      <Card.Section>
        <Stack vertical spacing="loose">
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
                label: `${o.name} ${o.price > 0 ? `(+$${o.price})` : ''}`,
                value: o.id,
              }))}
              value={selections[category.id]}
              onChange={(v) => handleChange(category.id, v)}
            />
          ))}

          <Text variant="headingMd" as="p">
            {locale === 'ar'
              ? `السعر الإضافي: $${totalPrice}`
              : `Additional Price: $${totalPrice}`}
          </Text>
        </Stack>
      </Card.Section>
    </Card>
  );
}
