import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, Text,
  TextField, Select, Checkbox, Badge, Button,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { SUPPORTED_LANGUAGES } from "../services/language-switcher/options";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Build language options from the language-switcher service
  const availableLanguages = Object.entries(SUPPORTED_LANGUAGES).map(
    ([code, info]) => ({
      code,
      name: info.name,
      nativeName: info.nativeName,
      direction: info.direction,
    }),
  );

  return json({
    shop: session.shop,
    availableLanguages,
    providers: {
      openai: { configured: Boolean(process.env.OPENAI_API_KEY), name: "OpenAI" },
      deepl: { configured: Boolean(process.env.DEEPL_API_KEY), name: "DeepL" },
      google: { configured: Boolean(process.env.GOOGLE_TRANSLATE_ACCESS_TOKEN), name: "Google Translate" },
    },
  });
};

export default function SettingsPage() {
  const { shop, providers, availableLanguages } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [sourceLocale, setSourceLocale] = useState("en");
  const [targetLocales, setTargetLocales] = useState({ ar: true, he: true, fa: false, fr: false, tr: false, ur: false });
  const [arabicFont, setArabicFont] = useState("noto-sans-arabic");
  const [hebrewFont, setHebrewFont] = useState("heebo");
  const [autoDetectRTL, setAutoDetectRTL] = useState(true);
  const [enableTM, setEnableTM] = useState(true);
  const [fuzzyThreshold, setFuzzyThreshold] = useState("80");
  const [autoSuggest, setAutoSuggest] = useState(true);

  const handleSave = () => {
    shopify.toast.show("Settings saved");
  };

  return (
    <Page>
      <TitleBar title="RTL & Language Settings">
        <button variant="primary" onClick={handleSave}>Save Settings</button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">AI Translation Provider</Text>
                <Select label="Provider" options={[
                  { label: "OpenAI", value: "openai" },
                  { label: "DeepL", value: "deepl" },
                  { label: "Google Translate", value: "google" },
                ]} value={provider} onChange={setProvider} />
                <InlineStack gap="200">
                  {Object.entries(providers).map(([key, p]) => (
                    <Badge key={key} tone={p.configured ? "success" : "critical"}>{p.name}: {p.configured ? "Connected" : "Not configured"}</Badge>
                  ))}
                </InlineStack>
                <TextField label="API Key" type="password" value={apiKey} onChange={setApiKey} autoComplete="off" placeholder="Enter your API key" />
                <Button size="slim">Test Connection</Button>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Language Configuration</Text>
                <Select label="Source Language" options={[
                  { label: "English", value: "en" },
                  { label: "Arabic", value: "ar" },
                ]} value={sourceLocale} onChange={setSourceLocale} />
                <Text as="p" variant="bodyMd">Target Languages:</Text>
                <InlineStack gap="300" wrap>
                  {availableLanguages
                    .filter((lang) => lang.code !== sourceLocale)
                    .map((lang) => (
                      <Checkbox
                        key={lang.code}
                        label={`${lang.name} (${lang.nativeName})`}
                        checked={targetLocales[lang.code as keyof typeof targetLocales] ?? false}
                        onChange={(v) => setTargetLocales({ ...targetLocales, [lang.code]: v })}
                      />
                    ))}
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">RTL Settings</Text>
                <Checkbox label="Auto-detect RTL languages" checked={autoDetectRTL} onChange={setAutoDetectRTL} />
                <Select label="Arabic Font" options={[
                  { label: "Noto Sans Arabic", value: "noto-sans-arabic" },
                  { label: "Cairo", value: "cairo" },
                  { label: "Vazirmatn", value: "vazirmatn" },
                  { label: "Amiri", value: "amiri" },
                ]} value={arabicFont} onChange={setArabicFont} />
                <Select label="Hebrew Font" options={[
                  { label: "Heebo", value: "heebo" },
                  { label: "Rubik", value: "rubik" },
                  { label: "Assistant", value: "assistant" },
                ]} value={hebrewFont} onChange={setHebrewFont} />
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Translation Memory</Text>
                <Checkbox label="Enable Translation Memory" checked={enableTM} onChange={setEnableTM} />
                <Select label="Fuzzy Match Threshold" options={[
                  { label: "70% (More matches)", value: "70" },
                  { label: "80% (Balanced)", value: "80" },
                  { label: "90% (Strict)", value: "90" },
                  { label: "100% (Exact only)", value: "100" },
                ]} value={fuzzyThreshold} onChange={setFuzzyThreshold} />
                <Checkbox label="Auto-suggest from TM" checked={autoSuggest} onChange={setAutoSuggest} />
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Store Info</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{shop}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
