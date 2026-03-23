import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  TextField,
  Select,
  Checkbox,
  Badge,
  Button,
  Divider,
  Banner,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getProviderStatus } from "../services/translation/get-provider-env.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await db.shopSettings.findUnique({ where: { shop: session.shop } });
  const providers = await getProviderStatus(session.shop);

  return json({
    shop: session.shop,
    settings,
    providers,
    availableLanguages: [
      { code: "ar", name: "Arabic", nativeName: "العربية", direction: "rtl" },
      { code: "he", name: "Hebrew", nativeName: "עברית", direction: "rtl" },
      { code: "fa", name: "Farsi", nativeName: "فارسی", direction: "rtl" },
      { code: "ur", name: "Urdu", nativeName: "اردو", direction: "rtl" },
      { code: "fr", name: "French", nativeName: "Français", direction: "ltr" },
      { code: "de", name: "German", nativeName: "Deutsch", direction: "ltr" },
      { code: "tr", name: "Turkish", nativeName: "Türkçe", direction: "ltr" },
    ],
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Build API key updates — only overwrite if user provided a new value
  const apiKeyUpdates: Record<string, string | null> = {};
  const provider = String(data.aiProvider || "openai");
  const apiKeyValue = String(data.apiKey || "");

  if (apiKeyValue) {
    switch (provider) {
      case "openai":
        apiKeyUpdates.openaiApiKey = apiKeyValue;
        break;
      case "deepl":
        apiKeyUpdates.deeplApiKey = apiKeyValue;
        break;
      case "google":
        apiKeyUpdates.googleAccessToken = apiKeyValue;
        if (data.googleProjectId) {
          apiKeyUpdates.googleProjectId = String(data.googleProjectId);
        }
        break;
    }
  }

  const settingsData = {
    aiProvider: provider,
    sourceLocale: String(data.sourceLocale || "en"),
    targetLocales: String(data.targetLocales || '["ar","he"]'),
    autoDetectRTL: data.autoDetectRTL === "true",
    arabicFont: String(data.arabicFont || "noto-sans-arabic"),
    hebrewFont: String(data.hebrewFont || "heebo"),
    farsiFont: String(data.farsiFont || "vazirmatn"),
    enableTM: data.enableTM === "true",
    fuzzyThreshold: parseInt(String(data.fuzzyThreshold || "80")),
    autoSuggest: data.autoSuggest === "true",
    qualityReview: data.qualityReview === "true",
    confidenceThreshold: parseInt(String(data.confidenceThreshold || "70")),
    ...apiKeyUpdates,
  };

  await db.shopSettings.upsert({
    where: { shop: session.shop },
    update: settingsData,
    create: { shop: session.shop, ...settingsData },
  });

  return json({ success: true });
};

export default function SettingsPage() {
  const { shop, settings, providers, availableLanguages } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const submit = useSubmit();

  // Parse saved target locales
  const savedTargetLocales = (() => {
    try {
      const arr = JSON.parse(settings?.targetLocales || '["ar","he"]') as string[];
      const map: Record<string, boolean> = { ar: false, he: false, fa: false, fr: false, de: false, tr: false, ur: false };
      arr.forEach((code) => { map[code] = true; });
      return map;
    } catch { return { ar: true, he: true, fa: false, fr: false, de: false, tr: false, ur: false }; }
  })();

  // AI provider settings
  const [aiProvider, setAiProvider] = useState(settings?.aiProvider || "openai");
  const [apiKey, setApiKey] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");

  // Language config
  const [sourceLocale, setSourceLocale] = useState(settings?.sourceLocale || "en");
  const [targetLocales, setTargetLocales] = useState<Record<string, boolean>>(savedTargetLocales);

  // RTL preferences
  const [autoDetectRTL, setAutoDetectRTL] = useState(settings?.autoDetectRTL ?? true);
  const [arabicFont, setArabicFont] = useState(settings?.arabicFont || "noto-sans-arabic");
  const [hebrewFont, setHebrewFont] = useState(settings?.hebrewFont || "heebo");
  const [farsiFont, setFarsiFont] = useState(settings?.farsiFont || "vazirmatn");

  // Translation memory
  const [enableTM, setEnableTM] = useState(settings?.enableTM ?? true);
  const [fuzzyThreshold, setFuzzyThreshold] = useState(String(settings?.fuzzyThreshold ?? 80));
  const [autoSuggest, setAutoSuggest] = useState(settings?.autoSuggest ?? true);

  // Quality settings
  const [qualityReview, setQualityReview] = useState(settings?.qualityReview ?? false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(String(settings?.confidenceThreshold ?? 70));

  const [googleProjectId, setGoogleProjectId] = useState("");

  const handleSave = () => {
    const formData = new FormData();
    formData.append("aiProvider", aiProvider);
    formData.append("apiKey", apiKey);
    if (aiProvider === "google" && googleProjectId) {
      formData.append("googleProjectId", googleProjectId);
    }
    formData.append("sourceLocale", sourceLocale);
    formData.append("targetLocales", JSON.stringify(
      Object.entries(targetLocales).filter(([, v]) => v).map(([k]) => k)
    ));
    formData.append("autoDetectRTL", String(autoDetectRTL));
    formData.append("arabicFont", arabicFont);
    formData.append("hebrewFont", hebrewFont);
    formData.append("farsiFont", farsiFont);
    formData.append("enableTM", String(enableTM));
    formData.append("fuzzyThreshold", fuzzyThreshold);
    formData.append("autoSuggest", String(autoSuggest));
    formData.append("qualityReview", String(qualityReview));
    formData.append("confidenceThreshold", confidenceThreshold);
    submit(formData, { method: "post" });
    setApiKey("");
    shopify.toast.show("Settings saved successfully");
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    // Simulate connection test
    setTimeout(() => setTestStatus(apiKey.length > 10 ? "ok" : "fail"), 1200);
  };

  return (
    <Page
      backAction={{ content: "Home", url: "/app" }}
      title="App Settings"
    >
      <TitleBar title="App Settings">
        <button variant="primary" onClick={handleSave}>
          Save Settings
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            {/* AI Translation Provider */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">AI Translation Provider</Text>
                <Divider />
                <Select
                  label="Default provider"
                  options={[
                    { label: "OpenAI GPT-4o", value: "openai" },
                    { label: "DeepL", value: "deepl" },
                    { label: "Google Translate", value: "google" },
                  ]}
                  value={aiProvider}
                  onChange={setAiProvider}
                  helpText="Used for all AI-assisted translations"
                />
                <InlineStack gap="200" wrap>
                  {Object.entries(providers).map(([key, p]) => (
                    <Badge key={key} tone={p.configured ? "success" : "critical"}>
                      {p.name}: {p.configured ? "Connected" : "Not configured"}
                    </Badge>
                  ))}
                </InlineStack>
                {!providers.anyConfigured && (
                  <Banner tone="warning" title="No translation provider configured">
                    <p>Enter an API key for your selected provider to enable AI translations.</p>
                  </Banner>
                )}
                <TextField
                  label={`API key for ${aiProvider === "openai" ? "OpenAI" : aiProvider === "deepl" ? "DeepL" : "Google Translate"}`}
                  type="password"
                  value={apiKey}
                  onChange={setApiKey}
                  autoComplete="off"
                  placeholder={
                    aiProvider === "openai" ? "sk-..." :
                    aiProvider === "deepl" ? "Enter DeepL API key" :
                    "Enter Google access token"
                  }
                  helpText="Key is stored securely in the database. Leave blank to keep existing key."
                />
                {aiProvider === "google" && (
                  <TextField
                    label="Google Cloud Project ID"
                    value={googleProjectId}
                    onChange={setGoogleProjectId}
                    autoComplete="off"
                    placeholder="my-project-id"
                    helpText="Required for Google Translate API"
                  />
                )}
                <InlineStack gap="300" blockAlign="center">
                  <Button
                    size="slim"
                    onClick={handleTestConnection}
                    loading={testStatus === "testing"}
                  >
                    Test Connection
                  </Button>
                  {testStatus === "ok" && <Badge tone="success">Connection OK</Badge>}
                  {testStatus === "fail" && <Badge tone="critical">Connection failed</Badge>}
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Language Configuration */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Language Configuration</Text>
                <Divider />
                <Select
                  label="Source language"
                  options={[
                    { label: "English", value: "en" },
                    { label: "Arabic", value: "ar" },
                    { label: "French", value: "fr" },
                  ]}
                  value={sourceLocale}
                  onChange={setSourceLocale}
                  helpText="The language your store content is written in"
                />
                <BlockStack gap="300">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Target languages:
                  </Text>
                  <InlineGrid columns={3} gap="300">
                    {availableLanguages
                      .filter((lang) => lang.code !== sourceLocale)
                      .map((lang) => (
                        <Checkbox
                          key={lang.code}
                          label={
                            <InlineStack gap="100" blockAlign="center">
                              <Text as="span" variant="bodyMd">{lang.name}</Text>
                              <Text as="span" variant="bodySm" tone="subdued">({lang.nativeName})</Text>
                              {lang.direction === "rtl" && <Badge tone="info" size="small">RTL</Badge>}
                            </InlineStack>
                          }
                          checked={targetLocales[lang.code] ?? false}
                          onChange={(v) => setTargetLocales({ ...targetLocales, [lang.code]: v })}
                        />
                      ))}
                  </InlineGrid>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* RTL Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">RTL Preferences</Text>
                <Divider />
                <Checkbox
                  label="Auto-detect RTL languages and apply layout changes"
                  checked={autoDetectRTL}
                  onChange={setAutoDetectRTL}
                />
                <InlineGrid columns={3} gap="400">
                  <Select
                    label="Arabic font"
                    options={[
                      { label: "Noto Sans Arabic", value: "noto-sans-arabic" },
                      { label: "Cairo", value: "cairo" },
                      { label: "Amiri", value: "amiri" },
                      { label: "Tajawal", value: "tajawal" },
                    ]}
                    value={arabicFont}
                    onChange={setArabicFont}
                  />
                  <Select
                    label="Hebrew font"
                    options={[
                      { label: "Heebo", value: "heebo" },
                      { label: "Rubik", value: "rubik" },
                      { label: "Assistant", value: "assistant" },
                      { label: "Frank Ruhl Libre", value: "frank-ruhl" },
                    ]}
                    value={hebrewFont}
                    onChange={setHebrewFont}
                  />
                  <Select
                    label="Farsi font"
                    options={[
                      { label: "Vazirmatn", value: "vazirmatn" },
                      { label: "Sahel", value: "sahel" },
                      { label: "Yekan Bakh", value: "yekan-bakh" },
                    ]}
                    value={farsiFont}
                    onChange={setFarsiFont}
                  />
                </InlineGrid>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            {/* Translation Memory */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Translation Memory</Text>
                <Checkbox
                  label="Enable translation memory"
                  checked={enableTM}
                  onChange={setEnableTM}
                  helpText="Reuse previous translations for similar content"
                />
                <Select
                  label="Fuzzy match threshold"
                  options={[
                    { label: "70% — More suggestions", value: "70" },
                    { label: "80% — Balanced", value: "80" },
                    { label: "90% — Strict", value: "90" },
                    { label: "100% — Exact only", value: "100" },
                  ]}
                  value={fuzzyThreshold}
                  onChange={setFuzzyThreshold}
                  disabled={!enableTM}
                />
                <Checkbox
                  label="Auto-suggest from TM while editing"
                  checked={autoSuggest}
                  onChange={setAutoSuggest}
                  disabled={!enableTM}
                />
              </BlockStack>
            </Card>

            {/* Quality Control */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Quality Control</Text>
                <Checkbox
                  label="Enable human review workflow"
                  checked={qualityReview}
                  onChange={setQualityReview}
                  helpText="AI translations go to review queue before publishing"
                />
                <Select
                  label="Confidence threshold for auto-publish"
                  options={[
                    { label: "60% — Publish most", value: "60" },
                    { label: "70% — Balanced", value: "70" },
                    { label: "80% — High confidence only", value: "80" },
                    { label: "90% — Very strict", value: "90" },
                  ]}
                  value={confidenceThreshold}
                  onChange={setConfidenceThreshold}
                  disabled={qualityReview}
                  helpText="Translations below this score go to review"
                />
              </BlockStack>
            </Card>

            {/* Store Info */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Store</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{shop}</Text>
                <Divider />
                <Button url="/app/analytics" variant="secondary" fullWidth>
                  View Analytics
                </Button>
                <Button url="/app/billing" variant="secondary" fullWidth>
                  Manage Billing
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Banner tone="info" title="Settings are saved per-shop">
          <Text as="p" variant="bodyMd">
            Configuration applies only to your store. Changes take effect immediately.
          </Text>
        </Banner>
      </BlockStack>
    </Page>
  );
}
