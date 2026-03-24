import { useCallback } from "react";
import { TextField, Text, InlineStack, Badge, BlockStack } from "@shopify/polaris";

import { isRtlLocale } from "../../utils/rtl";

interface FieldEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  locale: string;
  maxLength?: number;
}

export function FieldEditor({
  label,
  value,
  onChange,
  locale,
  maxLength,
}: FieldEditorProps) {
  const isRtl = isRtlLocale(locale);
  const charCount = value.length;
  const isOverLimit = maxLength != null && charCount > maxLength;
  const warningThreshold = maxLength != null ? Math.floor(maxLength * 0.9) : Infinity;

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <BlockStack gap="200">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="label" variant="bodyMd" fontWeight="semibold">
          {label}
        </Text>
        <InlineStack gap="200">
          {isRtl && (
            <Badge tone="info">
              RTL
            </Badge>
          )}
          <Text
            as="span"
            variant="bodySm"
            tone={
              isOverLimit
                ? "critical"
                : charCount >= warningThreshold
                  ? "caution"
                  : "subdued"
            }
          >
            {charCount}
            {maxLength != null ? ` / ${maxLength}` : ""}
          </Text>
        </InlineStack>
      </InlineStack>
      <div dir={isRtl ? "rtl" : "ltr"}>
        <TextField
          label={label}
          labelHidden
          value={value}
          onChange={handleChange}
          autoComplete="off"
          error={isOverLimit ? `Exceeds maximum length of ${maxLength}` : undefined}
        />
      </div>
    </BlockStack>
  );
}

export default FieldEditor;
