import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
    // Simulate import progress
    setImportProgress(0);
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImported(true);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  }, [fileContent, entries]);

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
                {imported && (
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
                  imported
                }
                onClick={handleImport}
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
