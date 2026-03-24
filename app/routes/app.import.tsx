import { useState, useCallback } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Button,
  Banner,
  DropZone,
  DataTable,
  Box,
  ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  parseCSV,
  validateCSVStructure,
  detectCSVDelimiter,
  csvToTranslationEntries,
} from "../services/import-export/csv";
import type { CSVValidationResult, TranslationEntry } from "../services/import-export/csv";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const fileContent = formData.get("fileContent") as string;
  const fileNameVal = formData.get("fileName") as string;

  if (!fileContent) {
    return json({ error: "No file content provided" }, { status: 400 });
  }

  const isJson = fileNameVal?.endsWith(".json");

  try {
    let translations: Array<{
      sourceText?: string;
      targetText?: string;
      translatedText?: string;
      sourceLocale?: string;
      targetLocale?: string;
    }>;

    if (isJson) {
      translations = JSON.parse(fileContent);
      if (!Array.isArray(translations)) {
        translations = [translations];
      }
    } else {
      // CSV parsing
      const lines = fileContent.split("\n");
      const headers = lines[0].split(",").map((h: string) => h.trim());
      translations = lines
        .slice(1)
        .filter((l: string) => l.trim())
        .map((line: string) => {
          const values = line.split(",").map((v: string) => v.trim().replace(/^"|"$/g, ""));
          return Object.fromEntries(headers.map((h: string, i: number) => [h, values[i]]));
        });
    }

    let imported = 0;
    for (const t of translations) {
      const sourceText = t.sourceText;
      const targetText = t.targetText || t.translatedText;
      const sourceLocale = t.sourceLocale;
      const targetLocale = t.targetLocale;

      if (sourceText && targetText && sourceLocale && targetLocale) {
        await db.translationMemory.upsert({
          where: {
            shop_sourceLocale_targetLocale_sourceText: {
              shop: session.shop,
              sourceLocale,
              targetLocale,
              sourceText,
            },
          },
          update: { translatedText: targetText },
          create: {
            shop: session.shop,
            sourceLocale,
            targetLocale,
            sourceText,
            translatedText: targetText,
          },
        });
        imported++;
      }
    }

    return json({ success: true, imported });
  } catch (error) {
    return json({ error: "Failed to parse file content" }, { status: 400 });
  }
};

type FileFormat = "CSV" | "JSON" | "XLIFF" | "unknown";

function detectFormat(fileName: string, content: string): FileFormat {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "tsv") return "CSV";
  if (ext === "json") return "JSON";
  if (ext === "xliff" || ext === "xlf") return "XLIFF";
  // Fallback: sniff content
  const trimmed = content.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "JSON";
  if (trimmed.startsWith("<?xml") || trimmed.includes("<xliff")) return "XLIFF";
  if (trimmed.includes(",") || trimmed.includes("\t")) return "CSV";
  return "unknown";
}

function formatBadgeTone(format: FileFormat) {
  switch (format) {
    case "CSV":
      return "info";
    case "JSON":
      return "success";
    case "XLIFF":
      return "attention";
    default:
      return "new";
  }
}

export default function ImportPage() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<FileFormat>("unknown");
  const [validation, setValidation] = useState<CSVValidationResult | null>(null);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, string>>>([]);
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [imported, setImported] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setImported(false);
      setImportProgress(0);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) return;

        setFileContent(content);

        const format = detectFormat(file.name, content);
        setDetectedFormat(format);

        if (format === "CSV") {
          const delimiter = detectCSVDelimiter(content);
          const validationResult = validateCSVStructure(content, [
            "key",
            "locale",
          ]);
          setValidation(validationResult);

          const parsed = parseCSV(content, delimiter);
          setPreviewRows(parsed.slice(0, 5));

          const translationEntries = csvToTranslationEntries(content);
          setEntries(translationEntries);
        } else {
          // For JSON/XLIFF, show basic info
          setValidation({
            valid: true,
            errors: [],
            rowCount: 0,
          });
          setPreviewRows([]);
          setEntries([]);
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleImport = useCallback(() => {
    if (!fileContent || entries.length === 0) return;
    const formData = new FormData();
    formData.set("fileContent", fileContent);
    formData.set("fileName", fileName || "import.csv");
    submit(formData, { method: "post" });
    setImported(true);
    setImportProgress(100);
  }, [fileContent, entries, fileName, submit]);

  const previewHeaders =
    previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <Page>
      <TitleBar title="Import Translations" />
      <Layout>
        {/* Drop Zone */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Upload Translation File
              </Text>
              <DropZone onDrop={handleDrop} accept=".csv,.tsv,.json,.xliff,.xlf">
                <DropZone.FileUpload
                  actionHint="Accepts CSV, JSON, and XLIFF files"
                />
              </DropZone>
              {fileName && (
                <InlineStack gap="200" blockAlign="center">
                  <Text as="span" variant="bodyMd">
                    File: {fileName}
                  </Text>
                  <Badge tone={formatBadgeTone(detectedFormat)}>
                    {detectedFormat}
                  </Badge>
                </InlineStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Validation Results */}
        {validation && (
          <Layout.Section>
            {validation.errors.length > 0 ? (
              <Banner title="Validation Errors" tone="critical">
                <BlockStack gap="100">
                  {validation.errors.map((err, i) => (
                    <Text key={i} as="p" variant="bodyMd">
                      {err}
                    </Text>
                  ))}
                </BlockStack>
              </Banner>
            ) : (
              <Banner title="Validation Passed" tone="success">
                <Text as="p" variant="bodyMd">
                  {validation.rowCount > 0
                    ? `${validation.rowCount} data rows detected. Ready to import.`
                    : "File structure is valid."}
                </Text>
              </Banner>
            )}
          </Layout.Section>
        )}

        {/* Preview Table */}
        {previewRows.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Preview (first 5 rows)
                </Text>
                <DataTable
                  columnContentTypes={previewHeaders.map(() => "text" as const)}
                  headings={previewHeaders}
                  rows={previewRows.map((row) =>
                    previewHeaders.map((h) => row[h] ?? ""),
                  )}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Translation Entries Summary */}
        {entries.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Translation Entries
                </Text>
                <Text as="p" variant="bodyMd">
                  {entries.length} translation entries parsed.
                </Text>
                <InlineStack gap="200">
                  {Array.from(new Set(entries.map((e) => e.locale))).map(
                    (locale) => (
                      <Badge key={locale} tone="info">
                        {`${locale}: ${entries.filter((e) => e.locale === locale).length} entries`}
                      </Badge>
                    ),
                  )}
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Import Progress */}
        {importProgress > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Import Progress
                </Text>
                <ProgressBar progress={importProgress} size="small" />
                {actionData && "success" in actionData && actionData.success && (
                  <Banner title="Import Complete" tone="success">
                    <Text as="p" variant="bodyMd">
                      Successfully imported {actionData.imported} translation entries to the database.
                    </Text>
                  </Banner>
                )}
                {actionData && "error" in actionData && (
                  <Banner title="Import Failed" tone="critical">
                    <Text as="p" variant="bodyMd">
                      {actionData.error}
                    </Text>
                  </Banner>
                )}
                {imported && !actionData && (
                  <Banner title="Import Complete" tone="success">
                    <Text as="p" variant="bodyMd">
                      Successfully imported {entries.length} translation entries.
                    </Text>
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Import Action */}
        <Layout.Section>
          <Box paddingBlockEnd="800">
            <InlineStack align="end">
              <Button
                variant="primary"
                disabled={
                  !validation?.valid ||
                  entries.length === 0 ||
                  imported ||
                  isSubmitting
                }
                onClick={handleImport}
                loading={isSubmitting}
              >
                Import
              </Button>
            </InlineStack>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
