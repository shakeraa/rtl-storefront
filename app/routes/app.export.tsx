import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineStack, Text, Button, Select, DataTable, Badge, ButtonGroup } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function ExportPage() {
  const { shop } = useLoaderData<typeof loader>();
  const [format, setFormat] = useState("csv");
  const [locale, setLocale] = useState("ar");
  const [resourceType, setResourceType] = useState("all");

  const sampleData = [
    ["product:123:title", "en", "Premium Abaya", "ar", "عباية فاخرة"],
    ["product:123:description", "en", "Elegant black abaya", "ar", "عباية سوداء أنيقة"],
    ["collection:5:title", "en", "Summer Collection", "ar", "مجموعة الصيف"],
    ["page:2:title", "en", "About Us", "ar", "من نحن"],
    ["product:456:title", "en", "Silk Hijab", "ar", "حجاب حرير"],
  ];

  const handleDownload = () => {
    let content: string;
    let mimeType: string;
    let ext: string;

    if (format === "csv") {
      content = "key,source_locale,source_text,target_locale,translated_text\n" +
        sampleData.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      mimeType = "text/csv";
      ext = "csv";
    } else {
      content = JSON.stringify(sampleData.map(([key, sl, st, tl, tt]) => ({ key, sourceLocale: sl, sourceText: st, targetLocale: tl, translatedText: tt })), null, 2);
      mimeType = "application/json";
      ext = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations-${locale}-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Page>
      <TitleBar title="Export Translations" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Export Settings</Text>
                <InlineStack gap="400">
                  <ButtonGroup segmented>
                    <Button pressed={format === "csv"} onClick={() => setFormat("csv")}>CSV</Button>
                    <Button pressed={format === "json"} onClick={() => setFormat("json")}>JSON</Button>
                    <Button pressed={format === "xliff"} onClick={() => setFormat("xliff")}>XLIFF</Button>
                  </ButtonGroup>
                </InlineStack>
                <InlineStack gap="300">
                  <Select label="Language" labelInline options={[
                    { label: "Arabic", value: "ar" }, { label: "Hebrew", value: "he" },
                    { label: "Farsi", value: "fa" }, { label: "French", value: "fr" },
                  ]} value={locale} onChange={setLocale} />
                  <Select label="Resource Type" labelInline options={[
                    { label: "All", value: "all" }, { label: "Products", value: "products" },
                    { label: "Collections", value: "collections" }, { label: "Pages", value: "pages" },
                  ]} value={resourceType} onChange={setResourceType} />
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Preview</Text>
                <DataTable columnContentTypes={["text","text","text","text","text"]} headings={["Key","Source","Source Text","Target","Translation"]} rows={sampleData} />
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Export Summary</Text>
                <Text as="p" variant="bodyMd">Format: <Badge>{format.toUpperCase()}</Badge></Text>
                <Text as="p" variant="bodyMd">Language: {locale}</Text>
                <Text as="p" variant="bodyMd">Entries: {sampleData.length}</Text>
                <Button variant="primary" fullWidth onClick={handleDownload}>Download {format.toUpperCase()}</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
