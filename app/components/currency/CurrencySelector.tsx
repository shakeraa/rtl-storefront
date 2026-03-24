/**
 * Currency Selector Component
 * T0011: Multi-Currency Support
 */

import { useState, useCallback } from 'react';
import {
  Select,
  BlockStack,
  Text,
} from '@shopify/polaris';
import {
  CURRENCIES,
  getCurrencyByCode,
  formatPrice,
} from '~/services/currency';

export interface CurrencySelectorProps {
  currentCurrency: string;
  amount?: number;
  onChange?: (currencyCode: string) => void;
  showPreview?: boolean;
}

export function CurrencySelector({
  currentCurrency,
  amount,
  onChange,
  showPreview = true,
}: CurrencySelectorProps) {
  const [selected, setSelected] = useState(currentCurrency);
  
  const currency = getCurrencyByCode(selected);
  
  const handleChange = useCallback(
    (value: string) => {
      setSelected(value);
      onChange?.(value);
    },
    [onChange]
  );

  const options = CURRENCIES.map((c) => ({
    label: `${c.name} (${c.code})`,
    value: c.code,
  }));

  return (
    <BlockStack gap="200">
      <Select
        label="Currency"
        options={options}
        value={selected}
        onChange={handleChange}
      />
      
      {showPreview && amount !== undefined && currency && (
        <Text variant="bodyMd" as="p" tone="subdued">
          Preview: {formatPrice(amount, selected)}
        </Text>
      )}
      
      {currency && (
        <Text variant="bodySm" as="p" tone="subdued">
          Symbol: {currency.symbol} ({currency.symbolPosition})
        </Text>
      )}
    </BlockStack>
  );
}
