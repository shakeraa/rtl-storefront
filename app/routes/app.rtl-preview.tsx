import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Select,
  Button,
  Badge,
  TextField,
  Checkbox,
  Box,
  Banner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RTL_LANGUAGES = [
  { label: "Arabic", value: "ar" },
  { label: "Hebrew", value: "he" },
  { label: "Farsi", value: "fa" },
];

const RTL_FONTS: Record<string, string> = {
  ar: "Noto Sans Arabic, Tahoma, sans-serif",
  he: "Noto Sans Hebrew, Arial, sans-serif",
  fa: "Noto Sans Arabic, Tahoma, sans-serif",
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  return json({
    shopDomain,
  });
};

// ---------------------------------------------------------------------------
// UI Component
// ---------------------------------------------------------------------------

export default function RTLPreview() {
  const { shopDomain } = useLoaderData<typeof loader>();

  const [selectedLocale, setSelectedLocale] = useState("ar");
  const [forceRTL, setForceRTL] = useState(false);
  const [cssOverride, setCssOverride] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  const storeUrl = `https://${shopDomain}?locale=${selectedLocale}`;

  const handleLocaleChange = useCallback((value: string) => {
    setSelectedLocale(value);
    setIframeKey((prev) => prev + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    setIframeKey((prev) => prev + 1);
  }, []);

  const direction = "rtl";
  const font = RTL_FONTS[selectedLocale] ?? "sans-serif";
  const localeName =
    RTL_LANGUAGES.find((l) => l.value === selectedLocale)?.label ?? selectedLocale;

  // Detect mixed-content warnings
  const mixedContentWarnings: string[] = [];
  if (cssOverride.includes("direction: ltr") || cssOverride.includes("direction:ltr")) {
    mixedContentWarnings.push(
      "CSS override contains LTR direction which may conflict with RTL layout.",
    );
  }
  if (cssOverride.includes("text-align: left") || cssOverride.includes("text-align:left")) {
    mixedContentWarnings.push(
      "CSS override contains left text-align which should be 'right' or 'start' for RTL.",
    );
  }
  if (cssOverride.includes("float: left") || cssOverride.includes("float:left")) {
    mixedContentWarnings.push(
      "CSS override contains float:left. Consider using float:right for RTL layouts.",
    );
  }

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }} title="RTL Preview">
      <TitleBar title="RTL Preview" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack gap="400" align="space-between" blockAlign="center">
                  <InlineStack gap="400" blockAlign="center">
                    <Select
                      label="Language"
                      labelInline
                      options={RTL_LANGUAGES}
                      value={selectedLocale}
                      onChange={handleLocaleChange}
                    />
                    <Badge tone="info">{localeName}</Badge>
                  </InlineStack>
                  <Button onClick={handleRefresh}>Refresh Preview</Button>
                </InlineStack>

                {/* Preview iframe */}
                <Box
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  minHeight="500px"
                  overflow="hidden"
                >
                  <iframe
                    key={iframeKey}
                    src={storeUrl}
                    title={`RTL Preview - ${localeName}`}
                    style={{
                      width: "100%",
                      height: "600px",
                      border: "none",
                      direction: forceRTL ? "rtl" : undefined,
                    }}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </Box>

                <Text as="p" variant="bodySm" tone="subdued">
                  Previewing: {storeUrl}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Side panel */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              {/* RTL Debug Info */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    RTL Debug Info
                  </Text>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Direction
                    </Text>
                    <Badge tone="info">{direction}</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Font Family
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {font}
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Locale
                    </Text>
                    <Badge>{selectedLocale}</Badge>
                  </InlineStack>

                  <Divider />

                  {/* Mixed content warnings */}
                  <Text as="h3" variant="headingSm">
                    Mixed Content Warnings
                  </Text>
                  {mixedContentWarnings.length > 0 ? (
                    <BlockStack gap="200">
                      {mixedContentWarnings.map((warning, i) => (
                        <Banner key={i} tone="warning">
                          <p>{warning}</p>
                        </Banner>
                      ))}
                    </BlockStack>
                  ) : (
                    <Text as="p" variant="bodySm" tone="subdued">
                      No mixed content warnings detected.
                    </Text>
                  )}
                </BlockStack>
              </Card>

              {/* Controls */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Controls
                  </Text>
                  <Checkbox
                    label="Force RTL"
                    helpText="Override direction to RTL regardless of locale auto-detection"
                    checked={forceRTL}
                    onChange={setForceRTL}
                  />
                  <Text as="span" variant="bodySm" tone="subdued">
                    {forceRTL ? "Force RTL" : "Auto-detect"}
                  </Text>
                </BlockStack>
              </Card>

              {/* CSS Override */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    CSS Override
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Add custom CSS to test RTL styling. Applied when the iframe
                    reloads.
                  </Text>
                  <TextField
                    label="Custom CSS"
                    labelHidden
                    value={cssOverride}
                    onChange={setCssOverride}
                    multiline={6}
                    autoComplete="off"
                    placeholder={`body {\n  direction: rtl;\n  font-family: ${font};\n}`}
                    monospaced
                  />
                  <Button onClick={handleRefresh} size="slim">
                    Apply & Refresh
                  </Button>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
