import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  InlineStack,
  Layout,
  Page,
  ProgressBar,
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

const TOTAL_STEPS = 5;

const TARGET_LANGUAGES = [
  { label: "Arabic", key: "ar" },
  { label: "Hebrew", key: "he" },
  { label: "Farsi", key: "fa" },
  { label: "French", key: "fr" },
  { label: "Turkish", key: "tr" },
  { label: "Urdu", key: "ur" },
  { label: "German", key: "de" },
  { label: "Spanish", key: "es" },
];

const MOCK_TRANSLATIONS: Record<string, string> = {
  ar: "عباية قطن فاخرة - أسود",
  he: "עבאיה כותנה פרימיום - שחור",
  fa: "عبای پنبه ای ممتاز - مشکی",
  fr: "Abaya Premium en Coton - Noir",
  tr: "Premium Pamuk Abaya - Siyah",
  ur: "پریمیم کاٹن عبایا - سیاہ",
  de: "Premium Baumwoll-Abaya - Schwarz",
  es: "Abaya de Algodón Premium - Negro",
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1 state
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [selectedLanguages, setSelectedLanguages] = useState<
    Record<string, boolean>
  >(
    Object.fromEntries(TARGET_LANGUAGES.map((l) => [l.key, false])),
  );

  // Step 2 state
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  // Step 3 state
  const [translating, setTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  const hasSelectedLanguage = Object.values(selectedLanguages).some(Boolean);
  const firstSelectedLang =
    TARGET_LANGUAGES.find((l) => selectedLanguages[l.key])?.key ?? "ar";

  function handleLanguageToggle(key: string) {
    setSelectedLanguages((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleTestConnection() {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus(apiKey.length > 0 ? "success" : "error");
    }, 1500);
  }

  function handleTranslate() {
    setTranslating(true);
    setTimeout(() => {
      setTranslatedText(MOCK_TRANSLATIONS[firstSelectedLang] || "Translation");
      setTranslating(false);
    }, 2000);
  }

  function goNext() {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <Page narrowWidth>
      <TitleBar title="Setup Wizard" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Progress */}
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Step {step + 1} of {TOTAL_STEPS}
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {Math.round(progress)}%
                  </Text>
                </InlineStack>
                <ProgressBar progress={progress} size="small" />
              </BlockStack>
            </Card>

            {/* Step 0 - Welcome */}
            {step === 0 && (
              <Card>
                <BlockStack gap="400">
                  <Box
                    padding="600"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200" align="center">
                      <Text as="h1" variant="headingXl" alignment="center">
                        RTL Storefront
                      </Text>
                      <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                        Translate and localize your Shopify store for
                        right-to-left languages
                      </Text>
                    </BlockStack>
                  </Box>
                  <Text as="p" variant="bodyMd">
                    Welcome to RTL Storefront! This wizard will help you set up
                    your store for right-to-left language support. In just a few
                    steps, you will configure your target languages, connect an
                    AI translation provider, and see your first translation in
                    action.
                  </Text>
                  <Banner tone="info">
                    This setup takes about 2 minutes. You can change any setting
                    later from the RTL Settings page.
                  </Banner>
                  <InlineStack align="end">
                    <Button variant="primary" onClick={goNext}>
                      Get Started
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* Step 1 - Languages */}
            {step === 1 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">
                    Choose Your Languages
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Select a source language and the languages you want to
                    translate your store into.
                  </Text>
                  <Select
                    label="Source Language"
                    options={[
                      { label: "English", value: "en" },
                      { label: "French", value: "fr" },
                      { label: "German", value: "de" },
                      { label: "Spanish", value: "es" },
                    ]}
                    value={sourceLanguage}
                    onChange={setSourceLanguage}
                  />
                  <Text as="h3" variant="headingSm">
                    Target Languages
                  </Text>
                  <BlockStack gap="200">
                    {TARGET_LANGUAGES.map((lang) => (
                      <Checkbox
                        key={lang.key}
                        label={lang.label}
                        checked={selectedLanguages[lang.key]}
                        onChange={() => handleLanguageToggle(lang.key)}
                      />
                    ))}
                  </BlockStack>
                  {!hasSelectedLanguage && (
                    <Banner tone="warning">
                      Select at least one target language to continue.
                    </Banner>
                  )}
                  <InlineStack align="space-between">
                    <Button onClick={goBack}>Back</Button>
                    <Button
                      variant="primary"
                      onClick={goNext}
                      disabled={!hasSelectedLanguage}
                    >
                      Next
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* Step 2 - AI Provider */}
            {step === 2 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">
                    Connect AI Provider
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Choose a translation provider and enter your API key.
                  </Text>
                  <Select
                    label="Provider"
                    options={[
                      { label: "OpenAI", value: "openai" },
                      { label: "DeepL", value: "deepl" },
                      { label: "Google Translate", value: "google" },
                    ]}
                    value={provider}
                    onChange={setProvider}
                  />
                  <TextField
                    label="API Key"
                    type="password"
                    value={apiKey}
                    onChange={setApiKey}
                    autoComplete="off"
                    placeholder="Enter your API key"
                  />
                  <InlineStack gap="300" blockAlign="center">
                    <Button
                      onClick={handleTestConnection}
                      loading={testStatus === "testing"}
                    >
                      Test Connection
                    </Button>
                    {testStatus === "success" && (
                      <Badge tone="success">Connected</Badge>
                    )}
                    {testStatus === "error" && (
                      <Badge tone="critical">Connection Failed</Badge>
                    )}
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Button onClick={goBack}>Back</Button>
                    <Button variant="primary" onClick={goNext}>
                      Next
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* Step 3 - First Translation */}
            {step === 3 && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingLg">
                    Your First Translation
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    See the AI translation in action with a sample product
                    title.
                  </Text>
                  <Box
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <Text as="span" variant="bodySm" tone="subdued">
                        Original (English)
                      </Text>
                      <Text as="p" variant="headingMd">
                        Premium Cotton Abaya - Black
                      </Text>
                    </BlockStack>
                  </Box>
                  <InlineStack align="center">
                    <Button
                      variant="primary"
                      onClick={handleTranslate}
                      loading={translating}
                    >
                      Translate
                    </Button>
                  </InlineStack>
                  {translatedText && (
                    <Box
                      padding="400"
                      background="bg-surface-success"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="span" variant="bodySm" tone="subdued">
                            Translated (
                            {TARGET_LANGUAGES.find(
                              (l) => l.key === firstSelectedLang,
                            )?.label ?? firstSelectedLang}
                            )
                          </Text>
                          <Badge tone="success">AI Generated</Badge>
                        </InlineStack>
                        <Text
                          as="p"
                          variant="headingMd"
                          alignment={
                            ["ar", "he", "fa", "ur"].includes(firstSelectedLang)
                              ? "end"
                              : "start"
                          }
                        >
                          {translatedText}
                        </Text>
                      </BlockStack>
                    </Box>
                  )}
                  <InlineStack align="space-between">
                    <Button onClick={goBack}>Back</Button>
                    <Button variant="primary" onClick={goNext}>
                      Next
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}

            {/* Step 4 - Complete */}
            {step === 4 && (
              <Card>
                <BlockStack gap="400">
                  <Banner tone="success" title="Setup Complete!">
                    Your RTL Storefront is ready to go. Here is a summary of
                    your configuration.
                  </Banner>
                  <Box
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="300">
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone="success">Done</Badge>
                        <Text as="span" variant="bodyMd">
                          Source language: English
                        </Text>
                      </InlineStack>
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone="success">Done</Badge>
                        <Text as="span" variant="bodyMd">
                          Target languages:{" "}
                          {TARGET_LANGUAGES.filter(
                            (l) => selectedLanguages[l.key],
                          )
                            .map((l) => l.label)
                            .join(", ") || "None"}
                        </Text>
                      </InlineStack>
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone={apiKey ? "success" : "attention"}>
                          {apiKey ? "Done" : "Pending"}
                        </Badge>
                        <Text as="span" variant="bodyMd">
                          AI Provider:{" "}
                          {provider === "openai"
                            ? "OpenAI"
                            : provider === "deepl"
                              ? "DeepL"
                              : "Google Translate"}
                        </Text>
                      </InlineStack>
                      <InlineStack gap="200" blockAlign="center">
                        <Badge tone={translatedText ? "success" : "attention"}>
                          {translatedText ? "Done" : "Skipped"}
                        </Badge>
                        <Text as="span" variant="bodyMd">
                          First translation test
                        </Text>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                  <InlineStack align="space-between">
                    <Button onClick={goBack}>Back</Button>
                    <Button
                      variant="primary"
                      onClick={() => navigate("/app")}
                    >
                      Go to Dashboard
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
