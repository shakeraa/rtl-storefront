import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineStack, Text, Select, Checkbox, TextField, Badge, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const storeUrl = `https://${shop}`;
  return json({ shop, storeUrl });
};

export default function RTLPreviewPage() {
  const { shop, storeUrl } = useLoaderData<typeof loader>();
  const [locale, setLocale] = useState("ar");
  const [forceRTL, setForceRTL] = useState(false);
  const [customCSS, setCustomCSS] = useState("");

  const previewUrl = `${storeUrl}?locale=${locale}`;
  const direction = ["ar", "he", "fa", "ur"].includes(locale) ? "rtl" : "ltr";
  const fontFamily = locale === "ar" ? "Noto Sans Arabic, Cairo" : locale === "he" ? "Heebo, Rubik" : locale === "fa" ? "Vazirmatn" : "system-ui";

  return (
    <Page>
      <TitleBar title="RTL Preview" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Store Preview</Text>
                  <Badge tone={direction === "rtl" ? "info" : "new"}>{direction.toUpperCase()}</Badge>
                </InlineStack>
                <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", height: "600px" }}>
                  <iframe src={previewUrl} style={{ width: "100%", height: "100%", border: "none" }} title="Store Preview" />
                </div>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Preview Settings</Text>
                <Select label="Language" options={[
                  { label: "Arabic (العربية)", value: "ar" },
                  { label: "Hebrew (עברית)", value: "he" },
                  { label: "Farsi (فارسی)", value: "fa" },
                  { label: "Urdu (اردو)", value: "ur" },
                  { label: "English", value: "en" },
                  { label: "French", value: "fr" },
                ]} value={locale} onChange={setLocale} />
                <Checkbox label="Force RTL direction" checked={forceRTL} onChange={setForceRTL} />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">RTL Debug Info</Text>
                <InlineStack gap="200"><Text as="span" variant="bodyMd" tone="subdued">Direction:</Text><Badge tone={direction === "rtl" ? "success" : "info"}>{direction}</Badge></InlineStack>
                <InlineStack gap="200"><Text as="span" variant="bodyMd" tone="subdued">Font:</Text><Text as="span" variant="bodyMd">{fontFamily}</Text></InlineStack>
                <InlineStack gap="200"><Text as="span" variant="bodyMd" tone="subdued">Locale:</Text><Text as="span" variant="bodyMd">{locale}</Text></InlineStack>
                <InlineStack gap="200"><Text as="span" variant="bodyMd" tone="subdued">Store:</Text><Text as="span" variant="bodyMd">{shop}</Text></InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Custom CSS Override</Text>
                <TextField label="CSS" value={customCSS} onChange={setCustomCSS} multiline={6} autoComplete="off" placeholder={`[dir="rtl"] .header {\n  flex-direction: row-reverse;\n}`} />
                <Button size="slim">Apply to Preview</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
