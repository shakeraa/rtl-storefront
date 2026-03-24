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

import { isRtlLocale } from "../../utils/rtl";
import { t } from "../../utils/i18n";

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
  locale?: string;
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
  locale = 'en',
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
        return <Badge tone="attention">{t('unsaved_changes', locale)}</Badge>;
      case "saving":
        return <Badge tone="info">{t('saving', locale)}</Badge>;
      case "saved":
        return <Badge tone="success">{t('saved', locale)}</Badge>;
      case "error":
        return <Badge tone="critical">{t('save_error', locale)}</Badge>;
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
              {t('auto_translate', locale)}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onSave}
            loading={saveStatus === "saving"}
            disabled={saveStatus === "saved"}
          >
            {t('save', locale)}
          </Button>
        </InlineStack>
      </InlineStack>

      {targetLocaleOptions && onTargetLocaleChange && (
        <Card>
          <Select
            label={t('target_language', locale)}
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
          minWidth: 0,
        }}
      >
        {/* Source column */}
        <Card>
          <BlockStack gap="300">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="headingMd">
                {t('source', locale)} ({sourceLocale.toUpperCase()})
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
                  <div dir={sourceIsRtl ? "rtl" : "ltr"} style={{ overflowWrap: "break-word", wordBreak: "break-word", minWidth: 0 }}>
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
                {t('translation', locale)} ({targetLocale.toUpperCase()})
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
                  <div dir={targetIsRtl ? "rtl" : "ltr"} style={{ overflowWrap: "break-word", wordBreak: "break-word", minWidth: 0 }}>
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
