import { useState } from "react";
import {
  Badge,
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { generateRTLCSS } from "../services/rtl/css-generator";
import { getLocaleDirectionContext, getMixedDirectionSegment } from "../utils/rtl";

const localeOptions = [
  { label: "Arabic (ar)", value: "ar" },
  { label: "Hebrew (he)", value: "he" },
  { label: "English (en)", value: "en" },
];

export default function AdditionalPage() {
  const [locale, setLocale] = useState("ar");
  const [globalOverride, setGlobalOverride] = useState(
    'html[dir="rtl"] .merchant-banner {\n  border-radius: 1rem;\n}',
  );
  const [checkoutOverride, setCheckoutOverride] = useState(
    '.rtl-checkout .checkout-summary {\n  direction: rtl;\n}',
  );

  const context = getLocaleDirectionContext(locale, { contentLocale: "en" });
  const ltrSegment = getMixedDirectionSegment("en");
  const generatedCss = generateRTLCSS({
    mode: "mixed",
    customOverrides: `${globalOverride}\n\n${checkoutOverride}`,
  });

  return (
    <Page>
      <TitleBar title="RTL settings" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Direction engine
                </Text>
                <Select
                  label="Preview locale"
                  options={localeOptions}
                  value={locale}
                  onChange={setLocale}
                />
                <InlineGrid columns={3} gap="300">
                  <InfoCard label="Direction" value={context.direction.toUpperCase()} />
                  <InfoCard label="Mode" value={context.mode.toUpperCase()} />
                  <InfoCard label="Locale" value={context.locale} />
                </InlineGrid>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Admin override fields
                </Text>
                <TextField
                  label="Global RTL CSS override"
                  value={globalOverride}
                  onChange={setGlobalOverride}
                  multiline={4}
                  autoComplete="off"
                />
                <TextField
                  label="Checkout RTL CSS override"
                  value={checkoutOverride}
                  onChange={setCheckoutOverride}
                  multiline={4}
                  autoComplete="off"
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Mixed content preview
                </Text>
                <Box
                  padding="400"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <div dir={context.direction} lang={context.locale}>
                    <div data-rtl-component="mega-menu">
                      <Text as="p" variant="bodyMd">
                        الرئيسية / الفئات / عروض رمضان
                      </Text>
                    </div>
                    <div {...ltrSegment.attributes}>
                      <Text as="p" variant="bodyMd">
                        English product title inside RTL content
                      </Text>
                    </div>
                    <div data-rtl-component="checkout">
                      <Badge tone="info">Checkout preview</Badge>
                    </div>
                  </div>
                </Box>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Generated CSS
                </Text>
                <Box
                  padding="400"
                  background="bg-surface-active"
                  borderRadius="200"
                  overflowX="scroll"
                >
                  <pre style={{ margin: 0 }}>
                    <code>{generatedCss}</code>
                  </pre>
                </Box>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      padding="300"
      background="bg-surface-secondary"
      borderRadius="200"
      minHeight="100%"
    >
      <BlockStack gap="100">
        <Text as="span" variant="bodySm" tone="subdued">
          {label}
        </Text>
        <Text as="span" variant="headingMd">
          {value}
        </Text>
      </BlockStack>
    </Box>
  );
}
