import { useCallback, useState } from "react";
import {
  Layout,
  Card,
  Text,
  TextField,
  Button,
  Banner,
  InlineStack,
  BlockStack,
  Badge,
  Box,
} from "@shopify/polaris";

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd", "yi"]);

function isRtlLocale(locale: string): boolean {
  const lang = locale.split("-")[0].toLowerCase();
  return RTL_LOCALES.has(lang);
}

interface VisualEditorProps {
  sourceText: string;
  translatedText: string;
  sourceLocale: string;
  targetLocale: string;
  onSave: (translatedText: string) => void;
  maxLength?: number;
}

export function VisualEditor({
  sourceText,
  translatedText,
  sourceLocale,
  targetLocale,
  onSave,
  maxLength = 5000,
}: VisualEditorProps) {
  const [value, setValue] = useState(translatedText);
  const [isDirty, setIsDirty] = useState(false);

  const targetIsRtl = isRtlLocale(targetLocale);
  const sourceIsRtl = isRtlLocale(sourceLocale);
  const charCount = value.length;
  const isOverLimit = charCount > maxLength;
  const limitWarningThreshold = Math.floor(maxLength * 0.9);

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setIsDirty(newValue !== translatedText);
    },
    [translatedText],
  );

  const handleSave = useCallback(() => {
    if (!isOverLimit) {
      onSave(value);
      setIsDirty(false);
    }
  }, [value, isOverLimit, onSave]);

  return (
    <Layout>
      <Layout.Section variant="oneHalf">
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <Text as="h3" variant="headingMd">
                Source ({sourceLocale.toUpperCase()})
              </Text>
              {sourceIsRtl && <Badge tone="info">RTL</Badge>}
            </InlineStack>
            <Box
              padding="400"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <div
                dir={sourceIsRtl ? "rtl" : "ltr"}
                style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
              >
                <Text as="p" variant="bodyMd">
                  {sourceText}
                </Text>
              </div>
            </Box>
            <Text as="p" variant="bodySm" tone="subdued">
              {sourceText.length} characters
            </Text>
          </BlockStack>
        </Card>
      </Layout.Section>

      <Layout.Section variant="oneHalf">
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <Text as="h3" variant="headingMd">
                Translation ({targetLocale.toUpperCase()})
              </Text>
              {targetIsRtl && <Badge tone="info">RTL</Badge>}
            </InlineStack>

            <div dir={targetIsRtl ? "rtl" : "ltr"}>
              <TextField
                label="Translation"
                labelHidden
                value={value}
                onChange={handleChange}
                multiline={4}
                autoComplete="off"
              />
            </div>

            <InlineStack align="space-between">
              <Text
                as="p"
                variant="bodySm"
                tone={
                  isOverLimit
                    ? "critical"
                    : charCount >= limitWarningThreshold
                      ? "caution"
                      : "subdued"
                }
              >
                {charCount} / {maxLength} characters
              </Text>
              {isDirty && <Badge tone="attention">Unsaved</Badge>}
            </InlineStack>

            {isOverLimit && (
              <Banner tone="critical">
                Translation exceeds the maximum length of {maxLength} characters.
              </Banner>
            )}

            {charCount >= limitWarningThreshold && !isOverLimit && (
              <Banner tone="warning">
                Approaching character limit ({maxLength - charCount} remaining).
              </Banner>
            )}

            {targetIsRtl && (
              <BlockStack gap="200">
                <Text as="h4" variant="headingSm">
                  RTL Preview
                </Text>
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <div dir="rtl" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    <Text as="p" variant="bodyMd">
                      {value || "\u200F"}
                    </Text>
                  </div>
                </Box>
              </BlockStack>
            )}

            <InlineStack align="end">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isDirty || isOverLimit}
              >
                Save Translation
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

export default VisualEditor;
