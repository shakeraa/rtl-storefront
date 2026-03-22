import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export default function RTLSettingsPage() {
  // AI Provider state
  const [aiProvider, setAiProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "not_connected"
  >("not_connected");
  const [testingConnection, setTestingConnection] = useState(false);

  // Language state
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguages, setTargetLanguages] = useState<
    Record<string, boolean>
  >({
    ar: true,
    he: false,
    fa: false,
    fr: false,
    tr: false,
    ur: false,
  });
  const [primaryTarget, setPrimaryTarget] = useState("ar");

  // RTL settings state
  const [autoDetectRTL, setAutoDetectRTL] = useState(true);
  const [arabicFont, setArabicFont] = useState("noto-sans-arabic");
  const [hebrewFont, setHebrewFont] = useState("heebo");
  const [cssDirectionOverride, setCssDirectionOverride] = useState(false);

  // Translation Memory state
  const [tmEnabled, setTmEnabled] = useState(true);
  const [fuzzyThreshold, setFuzzyThreshold] = useState("80");
  const [tmAutoSuggest, setTmAutoSuggest] = useState(true);

  const providerOptions = [
    { label: "OpenAI", value: "openai" },
    { label: "DeepL", value: "deepl" },
    { label: "Google Translate", value: "google" },
  ];

  const sourceLanguageOptions = [
    { label: "English", value: "en" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Spanish", value: "es" },
  ];

  const targetLanguageList = [
    { label: "Arabic", key: "ar" },
    { label: "Hebrew", key: "he" },
    { label: "Farsi", key: "fa" },
    { label: "French", key: "fr" },
    { label: "Turkish", key: "tr" },
    { label: "Urdu", key: "ur" },
  ];

  const primaryTargetOptions = targetLanguageList
    .filter((l) => targetLanguages[l.key])
    .map((l) => ({ label: l.label, value: l.key }));

  const arabicFontOptions = [
    { label: "Noto Sans Arabic", value: "noto-sans-arabic" },
    { label: "Cairo", value: "cairo" },
    { label: "Vazirmatn", value: "vazirmatn" },
  ];

  const hebrewFontOptions = [
    { label: "Heebo", value: "heebo" },
    { label: "Rubik", value: "rubik" },
    { label: "Assistant", value: "assistant" },
  ];

  const fuzzyThresholdOptions = [
    { label: "70%", value: "70" },
    { label: "80%", value: "80" },
    { label: "90%", value: "90" },
    { label: "100%", value: "100" },
  ];

  function handleTestConnection() {
    setTestingConnection(true);
    setTimeout(() => {
      setConnectionStatus(apiKey.length > 0 ? "connected" : "not_connected");
      setTestingConnection(false);
    }, 1500);
  }

  function handleTargetToggle(key: string) {
    setTargetLanguages((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Page>
      <TitleBar title="RTL & Language Settings">
        <button variant="primary">Save Settings</button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* AI Provider Configuration */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    AI Provider Configuration
                  </Text>
                  <Badge
                    tone={
                      connectionStatus === "connected" ? "success" : "critical"
                    }
                  >
                    {connectionStatus === "connected"
                      ? "Connected"
                      : "Not Connected"}
                  </Badge>
                </InlineStack>
                <Select
                  label="Translation Provider"
                  options={providerOptions}
                  value={aiProvider}
                  onChange={setAiProvider}
                />
                <TextField
                  label="API Key"
                  type="password"
                  value={apiKey}
                  onChange={setApiKey}
                  autoComplete="off"
                  placeholder="Enter your API key"
                />
                <InlineStack align="start">
                  <Button
                    onClick={handleTestConnection}
                    loading={testingConnection}
                  >
                    Test Connection
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Language Configuration */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Language Configuration
                </Text>
                <Select
                  label="Source Language"
                  options={sourceLanguageOptions}
                  value={sourceLanguage}
                  onChange={setSourceLanguage}
                />
                <Text as="h3" variant="headingSm">
                  Target Languages
                </Text>
                <BlockStack gap="200">
                  {targetLanguageList.map((lang) => (
                    <Checkbox
                      key={lang.key}
                      label={lang.label}
                      checked={targetLanguages[lang.key]}
                      onChange={() => handleTargetToggle(lang.key)}
                    />
                  ))}
                </BlockStack>
                {primaryTargetOptions.length > 0 && (
                  <Select
                    label="Primary Target Language"
                    options={primaryTargetOptions}
                    value={primaryTarget}
                    onChange={setPrimaryTarget}
                  />
                )}
              </BlockStack>
            </Card>

            {/* RTL Settings */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  RTL Settings
                </Text>
                <Checkbox
                  label="Auto-detect RTL direction"
                  checked={autoDetectRTL}
                  onChange={setAutoDetectRTL}
                  helpText="Automatically set text direction based on language content"
                />
                <Select
                  label="Font family for Arabic text"
                  options={arabicFontOptions}
                  value={arabicFont}
                  onChange={setArabicFont}
                />
                <Select
                  label="Font family for Hebrew text"
                  options={hebrewFontOptions}
                  value={hebrewFont}
                  onChange={setHebrewFont}
                />
                <Checkbox
                  label="CSS direction override"
                  checked={cssDirectionOverride}
                  onChange={setCssDirectionOverride}
                  helpText="Override theme CSS direction rules for RTL languages"
                />
              </BlockStack>
            </Card>

            {/* Translation Memory */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Translation Memory
                </Text>
                <Checkbox
                  label="Enable Translation Memory"
                  checked={tmEnabled}
                  onChange={setTmEnabled}
                  helpText="Store and reuse previous translations for consistency and speed"
                />
                <Select
                  label="Fuzzy match threshold"
                  options={fuzzyThresholdOptions}
                  value={fuzzyThreshold}
                  onChange={setFuzzyThreshold}
                  disabled={!tmEnabled}
                  helpText="Minimum similarity percentage to suggest a TM match"
                />
                <Checkbox
                  label="Auto-suggest from Translation Memory"
                  checked={tmAutoSuggest}
                  onChange={setTmAutoSuggest}
                  disabled={!tmEnabled}
                  helpText="Automatically pre-fill translations from matching TM entries"
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
