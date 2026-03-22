import { useState, useCallback } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Select,
  ButtonGroup,
  Button,
  Banner,
  DataTable,
  Box,
  Badge,
  Spinner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { generateCSV } from "../services/import-export/csv";
import { exportEntries } from "../services/translation-memory/store";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORMAT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "CSV", value: "csv" },
  { label: "JSON", value: "json" },
  { label: "XLIFF", value: "xliff" },
];

const LOCALE_OPTIONS = [
  { label: "All Languages", value: "all" },
  { label: "Arabic", value: "ar" },
  { label: "Hebrew", value: "he" },
  { label: "Farsi", value: "fa" },
  { label: "Urdu", value: "ur" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
];

const RESOURCE_TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Products", value: "products" },
  { label: "Collections", value: "collections" },
  { label: "Pages", value: "pages" },
];

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const exportData = await exportEntries(shop);
  const entries = exportData.entries ?? [];

  const previewRows = entries.slice(0, 5).map((entry) => [
    entry.sourceLocale ?? "",
    entry.targetLocale ?? "",
    (entry.sourceText ?? "").slice(0, 60),
    (entry.translatedText ?? "").slice(0, 60),
  ]);

  const estimatedSizeKB = Math.round(
    (JSON.stringify(entries).length / 1024) * 10,
  ) / 10;

  return json({
    totalEntries: entries.length,
    estimatedSizeKB,
    previewRows,
  });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const format = (formData.get("format") as string) || "csv";
  const locale = (formData.get("locale") as string) || "all";
  const resourceType = (formData.get("resourceType") as string) || "all";

  const exportData = await exportEntries(shop);
  let entries = exportData.entries ?? [];

  // Filter by locale
  if (locale !== "all") {
    entries = entries.filter(
      (e) => e.targetLocale === locale || e.sourceLocale === locale,
    );
  }

  // Filter by resource type
  if (resourceType !== "all") {
    entries = entries.filter((e) =>
      e.context?.toLowerCase().includes(resourceType),
    );
  }

  let content: string;
  let mimeType: string;
  let extension: string;

  if (format === "json") {
    content = JSON.stringify(entries, null, 2);
    mimeType = "application/json";
    extension = "json";
  } else if (format === "xliff") {
    content = buildXliff(entries);
    mimeType = "application/xliff+xml";
    extension = "xlf";
  } else {
    const csvRows = entries.map((e) => ({
      source_locale: e.sourceLocale,
      target_locale: e.targetLocale,
      source_text: e.sourceText,
      translated_text: e.translatedText,
      context: e.context ?? "",
    }));
    content = generateCSV(csvRows);
    mimeType = "text/csv";
    extension = "csv";
  }

  return json({
    success: true,
    content,
    mimeType,
    extension,
    exportedCount: entries.length,
  });
};

// ---------------------------------------------------------------------------
// XLIFF builder
// ---------------------------------------------------------------------------

function buildXliff(
  entries: Array<{
    sourceLocale: string;
    targetLocale: string;
    sourceText: string;
    translatedText: string;
  }>,
): string {
  const units = entries
    .map(
      (e, i) =>
        `    <trans-unit id="${i + 1}">
      <source xml:lang="${e.sourceLocale}">${escapeXml(e.sourceText)}</source>
      <target xml:lang="${e.targetLocale}">${escapeXml(e.translatedText)}</target>
    </trans-unit>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext">
    <body>
${units}
    </body>
  </file>
</xliff>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// UI Component
// ---------------------------------------------------------------------------

export default function ExportTranslations() {
  const { totalEntries, estimatedSizeKB, previewRows } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<{
    success?: boolean;
    content?: string;
    mimeType?: string;
    extension?: string;
    exportedCount?: number;
  }>();

  const [format, setFormat] = useState("csv");
  const [locale, setLocale] = useState("all");
  const [resourceType, setResourceType] = useState("all");

  const handleDownload = useCallback(() => {
    fetcher.submit(
      { format, locale, resourceType },
      { method: "POST" },
    );
  }, [format, locale, resourceType, fetcher]);

  // Trigger browser download when fetcher returns content
  const triggerDownload = useCallback(() => {
    if (fetcher.data?.success && fetcher.data.content) {
      const blob = new Blob([fetcher.data.content], {
        type: fetcher.data.mimeType,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translations-export.${fetcher.data.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [fetcher.data]);

  // Fire download side-effect
  if (fetcher.data?.success && fetcher.data.content) {
    triggerDownload();
  }

  const isExporting = fetcher.state !== "idle";

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }} title="Export Translations">
      <TitleBar title="Export Translations" />
      <BlockStack gap="500">
        {fetcher.data?.success && (
          <Banner
            title={`Exported ${fetcher.data.exportedCount} translation(s)`}
            tone="success"
            onDismiss={() => {}}
          />
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Export Settings
                </Text>

                {/* Format selector */}
                <BlockStack gap="200">
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    Format
                  </Text>
                  <ButtonGroup variant="segmented">
                    {FORMAT_OPTIONS.map((opt) => (
                      <Button
                        key={opt.value}
                        pressed={format === opt.value}
                        onClick={() => setFormat(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </BlockStack>

                {/* Locale filter */}
                <Select
                  label="Language"
                  options={LOCALE_OPTIONS}
                  value={locale}
                  onChange={setLocale}
                />

                {/* Resource type filter */}
                <Select
                  label="Resource Type"
                  options={RESOURCE_TYPE_OPTIONS}
                  value={resourceType}
                  onChange={setResourceType}
                />

                <InlineStack align="end">
                  <Button
                    variant="primary"
                    onClick={handleDownload}
                    loading={isExporting}
                    disabled={isExporting || totalEntries === 0}
                  >
                    {isExporting ? "Exporting..." : "Download"}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Preview */}
            <Box paddingBlockStart="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Preview (first 5 rows)
                  </Text>
                  {previewRows.length > 0 ? (
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text"]}
                      headings={[
                        "Source Locale",
                        "Target Locale",
                        "Source Text",
                        "Translated Text",
                      ]}
                      rows={previewRows}
                    />
                  ) : (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No translation entries to preview.
                    </Text>
                  )}
                </BlockStack>
              </Card>
            </Box>
          </Layout.Section>

          {/* Sidebar — Export Stats */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Export Stats
                </Text>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Total entries
                  </Text>
                  <Badge>{String(totalEntries)}</Badge>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Estimated size
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    {estimatedSizeKB} KB
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Format
                  </Text>
                  <Badge tone="info">{format.toUpperCase()}</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
