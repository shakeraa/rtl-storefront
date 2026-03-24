import { useCallback } from "react";
import {
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Divider,
} from "@shopify/polaris";
import { TranslationField } from "./TranslationField";

import { isRtlLocale } from "../../utils/rtl";
import { t } from "../../utils/i18n";

interface Field {
  key: string;
  source: string;
  translation: string;
}

interface SideBySideProps {
  fields: Field[];
  sourceLocale: string;
  targetLocale: string;
  onFieldChange: (key: string, value: string) => void;
  onSave: () => void;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  locale?: string;
}

export function SideBySide({
  fields,
  sourceLocale,
  targetLocale,
  onFieldChange,
  onSave,
  saveStatus = "idle",
  locale = 'en',
}: SideBySideProps) {
  const sourceIsRtl = isRtlLocale(sourceLocale);
  const targetIsRtl = isRtlLocale(targetLocale);

  const handleFieldChange = useCallback(
    (key: string) => (value: string) => {
      onFieldChange(key, value);
    },
    [onFieldChange],
  );

  const statusBadge = () => {
    switch (saveStatus) {
      case "saving":
        return <Badge tone="info">{t('saving', locale)}</Badge>;
      case "saved":
        return <Badge tone="success">{t('saved', locale)}</Badge>;
      case "error":
        return <Badge tone="critical">{t('error', locale)}</Badge>;
      default:
        return null;
    }
  };

  return (
    <BlockStack gap="400">
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="300">
          <Text as="h2" variant="headingLg">
            {t('translation_editor', locale)}
          </Text>
          {statusBadge()}
        </InlineStack>
        <Button variant="primary" onClick={onSave} loading={saveStatus === "saving"}>
          {t('save_all', locale)}
        </Button>
      </InlineStack>

      <Layout>
        <Layout.Section variant="oneHalf">
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
                  <div key={field.key} dir={sourceIsRtl ? "rtl" : "ltr"} style={{ overflowWrap: "break-word", wordBreak: "break-word", minWidth: 0 }}>
                    <BlockStack gap="100">
                      <Text as="span" variant="bodySm" tone="subdued">
                        {field.key}
                      </Text>
                      <Text as="p" variant="bodyMd">
                        {field.source || "\u2014"}
                      </Text>
                    </BlockStack>
                  </div>
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
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
                  <TranslationField
                    key={field.key}
                    fieldKey={field.key}
                    source={field.source}
                    value={field.translation}
                    onChange={handleFieldChange(field.key)}
                    locale={targetLocale}
                  />
                ))}
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </BlockStack>
  );
}

export default SideBySide;
