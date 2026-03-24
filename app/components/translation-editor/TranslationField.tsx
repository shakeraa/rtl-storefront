import { useCallback, useRef, useEffect } from "react";
import { TextField, Text, InlineStack, Badge, BlockStack } from "@shopify/polaris";

import { isRtlLocale } from "../../utils/rtl";

type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface TranslationFieldProps {
  fieldKey: string;
  source: string;
  value: string;
  onChange: (value: string) => void;
  locale: string;
  saveStatus?: SaveStatus;
}

export function TranslationField({
  fieldKey,
  source,
  value,
  onChange,
  locale,
  saveStatus = "idle",
}: TranslationFieldProps) {
  const isRtl = isRtlLocale(locale);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea effect
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    [onChange],
  );

  const statusBadge = () => {
    switch (saveStatus) {
      case "unsaved":
        return <Badge tone="attention">Unsaved</Badge>;
      case "saving":
        return <Badge tone="info">Saving</Badge>;
      case "saved":
        return <Badge tone="success">Saved</Badge>;
      case "error":
        return <Badge tone="critical">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <BlockStack gap="200">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="span" variant="bodySm" tone="subdued">
          {fieldKey}
        </Text>
        <InlineStack gap="200">
          {isRtl && <Badge tone="info">RTL</Badge>}
          {statusBadge()}
        </InlineStack>
      </InlineStack>
      <div dir={isRtl ? "rtl" : "ltr"}>
        <TextField
          label={fieldKey}
          labelHidden
          value={value}
          onChange={handleChange}
          multiline
          autoComplete="off"
          placeholder={source}
        />
      </div>
    </BlockStack>
  );
}

export default TranslationField;
