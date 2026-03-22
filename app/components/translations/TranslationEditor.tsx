import { useState, useCallback } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Badge,
  Divider,
  Select,
} from "@shopify/polaris";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd", "yi"]);

function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale.split("-")[0].toLowerCase());
}

export interface TranslationField {
  key: string;
  label: string;
  source: string;
  translation: string;
}

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface TranslationEditorProps {
  title: string;
  fields: TranslationField[];
  sourceLocale: string;
  targetLocale: string;
  targetLocaleOptions?: Array<{ label: string; value: string }>;
  saveStatus?: SaveStatus;
  onFieldChange: (key: string, value: string) => void;
  onTargetLocaleChange?: (locale: string) => void;
  onSave: () => void;
  onAutoTranslate?: () => void;
}

export function TranslationEditor({
  title,
  fields,
  sourceLocale,
  targetLocale,
  targetLocaleOptions,
  saveStatus = "idle",
  onFieldChange,
  onTargetLocaleChange,
  onSave,
  onAutoTranslate,
}: TranslationEditorProps) {
  const sourceIsRtl = isRtlLocale(sourceLocale);
  const targetIsRtl = isRtlLocale(targetLocale);

  const handleChange = useCallback(
    (key: string) => (value: string) => {
      onFieldChange(key, value);
    },
    [onFieldChange],
  );

  const statusBadge = () => {
    switch (saveStatus) {
      case "unsaved":
        return <Badge tone="attention">Unsaved changes</Badge>;
      case "saving":
        return <Badge tone="info">Saving...</Badge>;
      case "saved":
        return <Badge tone="success">Saved</Badge>;
      case "error":
        return <Badge tone="critical">Save failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="100">
          <Text as="h2" variant="headingLg">
            {title}
          </Text>
          {statusBadge()}
        </BlockStack>
        <InlineStack gap="300">
          {onAutoTranslate && (
            <Button onClick={onAutoTranslate} variant="secondary">
              Auto-translate
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onSave}
            loading={saveStatus === "saving"}
            disabled={saveStatus === "saved"}
          >
            Save
          </Button>
        </InlineStack>
      </InlineStack>

      {targetLocaleOptions && onTargetLocaleChange && (
        <Card>
          <Select
            label="Target language"
            options={targetLocaleOptions}
            value={targetLocale}
            onChange={onTargetLocaleChange}
          />
        </Card>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--p-space-400)",
        }}
      >
        {/* Source column */}
        <Card>
          <BlockStack gap="300">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="headingMd">
                Source ({sourceLocale.toUpperCase()})
              </Text>
              {sourceIsRtl && <Badge tone="info">RTL</Badge>}
            </InlineStack>
            <Divider />
            <BlockStack gap="400">
              {fields.map((field) => (
                <BlockStack gap="100" key={field.key}>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {field.label}
                  </Text>
                  <div dir={sourceIsRtl ? "rtl" : "ltr"}>
                    <Text as="p" variant="bodyMd">
                      {field.source || "\u2014"}
                    </Text>
                  </div>
                </BlockStack>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>

        {/* Target column */}
        <Card>
          <BlockStack gap="300">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="headingMd">
                Translation ({targetLocale.toUpperCase()})
              </Text>
              {targetIsRtl && <Badge tone="info">RTL</Badge>}
            </InlineStack>
            <Divider />
            <BlockStack gap="400">
              {fields.map((field) => (
                <BlockStack gap="200" key={field.key}>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {field.label}
                  </Text>
                  <div dir={targetIsRtl ? "rtl" : "ltr"}>
                    <TextField
                      label={field.label}
                      labelHidden
                      value={field.translation}
                      onChange={handleChange(field.key)}
                      multiline
                      autoComplete="off"
                      placeholder={field.source}
                    />
                  </div>
                </BlockStack>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      </div>
    </BlockStack>
  );
}

export default TranslationEditor;
