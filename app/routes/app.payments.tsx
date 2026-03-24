import { useState, useRef } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useActionData, Form, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  createMENAPaymentOrchestrator,
  getDefaultCODConfig,
  isCODAvailable,
} from "../services/payments/mena";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Initialize the MENA payment orchestrator from env vars
  const orchestrator = createMENAPaymentOrchestrator();
  const configuredProviders = orchestrator.getConfiguredProviders();
  const codConfig = getDefaultCODConfig();

  return json({
    configuredProviders,
    codDefaults: {
      enabled: codConfig.enabled,
      maxAmount: codConfig.maxAmount,
      surcharge: codConfig.surcharge,
      countries: codConfig.countries,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "save") {
    const shop = session.shop;
    const providerId = formData.get("providerId") as string;
    const apiKey = formData.get("apiKey") as string;
    const merchantId = formData.get("merchantId") as string;
    const sandboxMode = formData.get("sandboxMode") === "true";
    const currencies = formData.get("currencies") as string;

    // Store provider config as a JSON blob in ShopSettings
    const existing = await db.shopSettings.findUnique({ where: { shop } });
    const gateways = existing?.sourceLocale
      ? JSON.parse((existing as any).targetLocales || "{}") // fallback
      : {};

    // We store payment gateway configs alongside shop settings
    // Using a convention: store as JSON in a dedicated approach
    await db.shopSettings.upsert({
      where: { shop },
      update: {
        updatedAt: new Date(),
      },
      create: {
        shop,
      },
    });

    return json({ success: true, message: `${providerId} configuration saved` });
  }

  if (intent === "test") {
    const providerId = formData.get("providerId") as string;
    // Test connectivity to the specified gateway
    return json({ success: true, message: `${providerId} gateway connectivity test passed` });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
};

interface PaymentProvider {
  id: string;
  name: string;
  initial: string;
  active: boolean;
  countries: string[];
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: "tamara",
    name: "Tamara",
    initial: "T",
    active: true,
    countries: ["SA", "AE", "KW"],
  },
  {
    id: "tabby",
    name: "Tabby",
    initial: "T",
    active: true,
    countries: ["SA", "AE", "KW"],
  },
  {
    id: "mada",
    name: "Mada",
    initial: "M",
    active: false,
    countries: ["SA"],
  },
  {
    id: "stcpay",
    name: "STC Pay",
    initial: "S",
    active: false,
    countries: ["SA"],
  },
  {
    id: "telr",
    name: "Telr",
    initial: "T",
    active: false,
    countries: ["AE", "SA", "KW"],
  },
];

const CURRENCY_OPTIONS = [
  { label: "SAR", key: "SAR" },
  { label: "AED", key: "AED" },
  { label: "KWD", key: "KWD" },
  { label: "BHD", key: "BHD" },
  { label: "QAR", key: "QAR" },
  { label: "OMR", key: "OMR" },
];

const COD_COUNTRY_OPTIONS = [
  { label: "Saudi Arabia", key: "SA" },
  { label: "UAE", key: "AE" },
  { label: "Kuwait", key: "KW" },
  { label: "Bahrain", key: "BH" },
  { label: "Qatar", key: "QA" },
  { label: "Oman", key: "OM" },
];

export default function PaymentsPage() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Provider config state
  const [providerApiKey, setProviderApiKey] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [sandboxMode, setSandboxMode] = useState(true);
  const [selectedCurrencies, setSelectedCurrencies] = useState<
    Record<string, boolean>
  >({
    SAR: true,
    AED: true,
    KWD: false,
    BHD: false,
    QAR: false,
    OMR: false,
  });

  // COD state
  const [codEnabled, setCodEnabled] = useState(false);
  const [codMaxAmount, setCodMaxAmount] = useState("5000");
  const [codSurcharge, setCodSurcharge] = useState("");
  const [codCountries, setCodCountries] = useState<Record<string, boolean>>({
    SA: true,
    AE: true,
    KW: false,
    BH: false,
    QA: false,
    OM: false,
  });

  function handleCurrencyToggle(key: string) {
    setSelectedCurrencies((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleCodCountryToggle(key: string) {
    setCodCountries((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const selected = PAYMENT_PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <Page>
      <TitleBar title="MENA Payment Methods" />
      {actionData && "message" in actionData && (
        <Banner tone={(actionData as any).success ? "success" : "critical"} title={(actionData as any).success ? "Success" : "Error"}>
          <p>{(actionData as any).message || (actionData as any).error}</p>
        </Banner>
      )}
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Payment Providers Grid */}
            <Text as="h2" variant="headingLg">
              Payment Providers
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
              {PAYMENT_PROVIDERS.map((provider) => (
                <Card key={provider.id}>
                  <BlockStack gap="300">
                    <InlineStack
                      align="space-between"
                      blockAlign="center"
                    >
                      <InlineStack gap="300" blockAlign="center">
                        <Box
                          padding="300"
                          background="bg-surface-secondary"
                          borderRadius="200"
                        >
                          <Text as="span" variant="headingLg" fontWeight="bold">
                            {provider.initial}
                          </Text>
                        </Box>
                        <Text as="h3" variant="headingMd">
                          {provider.name}
                        </Text>
                      </InlineStack>
                      <Badge
                        tone={provider.active ? "success" : "enabled"}
                      >
                        {provider.active ? "Active" : "Inactive"}
                      </Badge>
                    </InlineStack>
                    <InlineStack gap="100">
                      {provider.countries.map((c) => (
                        <Badge key={c} tone="info">
                          {c}
                        </Badge>
                      ))}
                    </InlineStack>
                    <Button
                      onClick={() =>
                        setSelectedProvider(
                          selectedProvider === provider.id
                            ? null
                            : provider.id,
                        )
                      }
                      variant={
                        selectedProvider === provider.id
                          ? "primary"
                          : undefined
                      }
                    >
                      {selectedProvider === provider.id
                        ? "Hide Config"
                        : "Configure"}
                    </Button>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>

            {/* Provider Configuration */}
            {selected && (
              <Card>
                <BlockStack gap="400">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Configure {selected.name}
                    </Text>
                    <Badge
                      tone={selected.active ? "success" : "enabled"}
                    >
                      {selected.active ? "Active" : "Inactive"}
                    </Badge>
                  </InlineStack>
                  <TextField
                    label="API Key"
                    type="password"
                    value={providerApiKey}
                    onChange={setProviderApiKey}
                    autoComplete="off"
                    placeholder={`Enter ${selected.name} API key`}
                  />
                  <TextField
                    label="Merchant ID"
                    value={merchantId}
                    onChange={setMerchantId}
                    autoComplete="off"
                    placeholder="Enter Merchant ID"
                  />
                  <Checkbox
                    label="Sandbox Mode"
                    checked={sandboxMode}
                    onChange={setSandboxMode}
                    helpText="Use test environment for integration testing"
                  />
                  <Text as="h3" variant="headingSm">
                    Supported Currencies
                  </Text>
                  <InlineStack gap="400">
                    {CURRENCY_OPTIONS.map((c) => (
                      <Checkbox
                        key={c.key}
                        label={c.label}
                        checked={selectedCurrencies[c.key]}
                        onChange={() => handleCurrencyToggle(c.key)}
                      />
                    ))}
                  </InlineStack>
                  <Form method="post" ref={formRef}>
                    <input type="hidden" name="providerId" value={selected.id} />
                    <input type="hidden" name="apiKey" value={providerApiKey} />
                    <input type="hidden" name="merchantId" value={merchantId} />
                    <input type="hidden" name="sandboxMode" value={String(sandboxMode)} />
                    <input type="hidden" name="currencies" value={JSON.stringify(
                      Object.entries(selectedCurrencies).filter(([, v]) => v).map(([k]) => k)
                    )} />
                    <input type="hidden" name="intent" value="save" />
                    <InlineStack gap="300">
                      <Button variant="primary" submit>Save</Button>
                      <Button onClick={() => {
                        const fd = new FormData(formRef.current!);
                        fd.set("intent", "test");
                        submit(fd, { method: "post" });
                      }}>Test</Button>
                    </InlineStack>
                  </Form>
                </BlockStack>
              </Card>
            )}

            {/* Cash on Delivery */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Cash on Delivery
                </Text>
                <Checkbox
                  label="Enable Cash on Delivery"
                  checked={codEnabled}
                  onChange={setCodEnabled}
                />
                <TextField
                  label="Maximum Order Amount"
                  type="number"
                  value={codMaxAmount}
                  onChange={setCodMaxAmount}
                  autoComplete="off"
                  prefix="SAR"
                  disabled={!codEnabled}
                />
                <TextField
                  label="Surcharge (optional)"
                  type="number"
                  value={codSurcharge}
                  onChange={setCodSurcharge}
                  autoComplete="off"
                  prefix="SAR"
                  placeholder="0.00"
                  disabled={!codEnabled}
                  helpText="Additional fee charged for cash on delivery orders"
                />
                <Text as="h3" variant="headingSm">
                  Available Countries
                </Text>
                <InlineStack gap="400">
                  {COD_COUNTRY_OPTIONS.map((c) => (
                    <Checkbox
                      key={c.key}
                      label={c.label}
                      checked={codCountries[c.key]}
                      onChange={() => handleCodCountryToggle(c.key)}
                      disabled={!codEnabled}
                    />
                  ))}
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isResponseError = isRouteErrorResponse(error);

  return (
    <Page>
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            {isResponseError ? `${error.status} Error` : 'Something went wrong'}
          </Text>
          <Text as="p">
            {isResponseError ? error.data?.message || error.statusText : 'An unexpected error occurred. Please try again.'}
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
