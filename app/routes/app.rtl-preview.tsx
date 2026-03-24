import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineStack, InlineGrid, Text, Select, Checkbox, TextField, Badge, Button, Banner, Link } from "@shopify/polaris";
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
        {/* Setup Instructions Banner */}
        <Banner
          title="Enable RTL on Your Store"
          status="info"
        >
          <BlockStack gap="200">
            <Text as="p">
              To see RTL layout on your storefront, you need to enable the <strong>RTL Engine</strong> app embed in your theme:
            </Text>
            <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Go to <strong>Online Store → Themes → Customize</strong></li>
              <li>Click <strong>Theme settings</strong> (gear icon)</li>
              <li>Go to <strong>App embeds</strong></li>
              <li>Enable <strong>RTL Engine</strong></li>
              <li>Save your theme</li>
            </ol>
            <Text as="p">
              The RTL Engine automatically detects Arabic, Hebrew, Farsi, and Urdu, and applies the correct layout and fonts.
            </Text>
          </BlockStack>
        </Banner>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">Store Preview</Text>
                  <Badge tone={direction === "rtl" ? "info" : "new"}>{direction.toUpperCase()}</Badge>
                </InlineStack>
                
                {/* Extension Status Card */}
                <Card background="bg-surface-secondary">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingSm">RTL Engine Status</Text>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge tone="info">Extension Ready</Badge>
                      <Text as="span" variant="bodySm" tone="subdued">
                        Deployed to your store
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodySm">
                      The RTL Engine theme app extension has been deployed. 
                      Enable it in your theme editor to activate RTL layout on your storefront.
                    </Text>
                    <Button
                      variant="primary"
                      onClick={() => window.open(`https://${shop}/admin/themes/current/editor`, "_blank")}
                    >
                      Open Theme Editor
                    </Button>
                  </BlockStack>
                </Card>

                <div style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", height: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f6f7" }}>
                  <BlockStack gap="400" align="center">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Preview your store with RTL layout
                    </Text>
                    <Button
                      variant="primary"
                      onClick={() => window.open(previewUrl, "_blank")}
                    >
                      Open Store Preview ({locale})
                    </Button>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {direction === "rtl" 
                        ? "RTL layout will be applied if the RTL Engine is enabled" 
                        : "LTR layout (default)"}
                    </Text>
                  </BlockStack>
                </div>
              </BlockStack>
            </Card>

            {/* Features Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">RTL Engine Features</Text>
                <InlineGrid columns={2} gap="400">
                  <BlockStack gap="200">
                    <Badge tone="success">Auto-Detection</Badge>
                    <Text as="p" variant="bodySm">Automatically detects RTL languages from store locale</Text>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Badge tone="success">Smart Fonts</Badge>
                    <Text as="p" variant="bodySm">Loads Noto Sans Arabic, Heebo, Vazirmatn automatically</Text>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Badge tone="success">Full Layout</Badge>
                    <Text as="p" variant="bodySm">Flips header, navigation, product grid, cart, checkout</Text>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Badge tone="success">App Compatible</Badge>
                    <Text as="p" variant="bodySm">Works with Judge.me, Loox, Yotpo, Klaviyo</Text>
                  </BlockStack>
                </InlineGrid>
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
                <Text as="h2" variant="headingMd">Theme Editor Settings</Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Once enabled in the theme editor, merchants can configure:
                </Text>
                <ul style={{ margin: "8px 0", paddingLeft: "16px", fontSize: "14px" }}>
                  <li>Which languages trigger RTL</li>
                  <li>Auto-load RTL fonts</li>
                  <li>Custom CSS overrides</li>
                  <li>Force RTL mode (for testing)</li>
                </ul>
                <Button 
                  size="slim"
                  onClick={() => window.open(`https://${shop}/admin/themes/current/editor?context=settings&category=app-embeds`, "_blank")}
                >
                  Configure in Theme Editor
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isResponse = isRouteErrorResponse(error);

  return (
    <Page>
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            {isResponse ? `${error.status} Error` : "Something went wrong"}
          </Text>
          <Text as="p">
            {isResponse
              ? error.data?.message || error.statusText
              : "An unexpected error occurred. Please try again."}
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
