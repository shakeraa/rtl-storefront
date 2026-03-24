/**
 * Modesty Level Selector Component
 * T0006: RTL Fashion Sections
 */

import { useState } from 'react';
import {
  BlockStack,
  RadioButton,
  Text,
  Box,
} from '@shopify/polaris';
import { MODESTY_LEVELS, type ModestyLevel } from '~/services/fashion';

export interface ModestySelectorProps {
  selected?: string;
  onChange?: (level: ModestyLevel) => void;
  locale?: 'ar' | 'en';
}

export function ModestySelector({
  selected,
  onChange,
  locale = 'en',
}: ModestySelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState(selected);

  const handleChange = (level: ModestyLevel) => {
    setSelectedLevel(level.id);
    onChange?.(level);
  };

  return (
    <Box padding="400">
      <BlockStack gap="400">
        <Text variant="headingMd" as="h3">
          {locale === 'ar' ? 'مستوى الاحتشام' : 'Modesty Level'}
        </Text>

        {MODESTY_LEVELS.map((level) => (
          <RadioButton
            key={level.id}
            label={locale === 'ar' ? level.nameArabic : level.name}
            helpText={level.description}
            checked={selectedLevel === level.id}
            id={level.id}
            name="modesty-level"
            onChange={() => handleChange(level)}
          />
        ))}
      </BlockStack>
    </Box>
  );
}
