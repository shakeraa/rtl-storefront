import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, InlineGrid, Text,
  Badge, Button, TextField, Checkbox,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { createMENAPaymentOrchestrator } from "../services/payments/mena";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const orchestrator = createMENAPaymentOrchestrator();
  const configured = orchestrator.getConfiguredProviders();

  const providers = [
    { id: "tamara", name: "Tamara", nameAr: "تمارا", type: "BNPL", countries: ["SA", "AE", "KW"], currencies: ["SAR", "AED", "KWD"] },
    { id: "tabby", name: "Tabby", nameAr: "تابي", type: "BNPL", countries: ["SA", "AE", "KW", "BH", "QA"], currencies: ["SAR", "AED"] },
    { id: "mada", name: "Mada", nameAr: "مدى", type: "Card", countries: ["SA"], currencies: ["SAR"] },
    { id: "stc_pay", name: "STC Pay", nameAr: "STC Pay", type: "Wallet", countries: ["SA"], currencies: ["SAR"] },
    { id: "telr", name: "Telr", nameAr: "تلر", type: "Gateway", countries: ["AE", "SA"], currencies: ["AED", "SAR", "USD"] },
    { id: "payfort", name: "PayFort", nameAr: "بيفورت", type: "Gateway", countries: ["AE", "SA", "EG"], currencies: ["AED", "SAR", "EGP"] },
    { id: "hyperpay", name: "HyperPay", nameAr: "هايبر باي", type: "Gateway", countries: ["SA", "AE"], currencies: ["SAR", "AED"] },
  ];

  return json({
    providers: providers.map((p) => ({ ...p, configured: configured.includes(p.id as any) })),
    shop: session.shop,
  });
};

export default function PaymentsPage() {
  const { providers } = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState<string | null>(null);
  const [codEnabled, setCodEnabled] = useState(false);

  return (
    <Page>
      <TitleBar title="MENA Payment Methods" />
      <BlockStack gap="500">
        <InlineGrid columns={3} gap="400">
          {providers.map((p) => (
            <Card key={p.id}>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">{p.name}</Text>
                  <Badge tone={p.configured ? "success" : "new"}>{p.configured ? "Active" : "Inactive"}</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">{p.nameAr} · {p.type}</Text>
                <InlineStack gap="100">
                  {p.countries.map((c) => <Badge key={c} tone="info">{c}</Badge>)}
                </InlineStack>
                <Button onClick={() => setSelected(selected === p.id ? null : p.id)} size="slim">
                  {selected === p.id ? "Close" : "Configure"}
                </Button>
                {selected === p.id && (
                  <BlockStack gap="200">
                    <TextField label="API Key" type="password" value="" autoComplete="off" onChange={() => {}} />
                    <TextField label="Merchant ID" value="" autoComplete="off" onChange={() => {}} />
                    <Checkbox label="Sandbox Mode" checked={true} onChange={() => {}} />
                    <InlineStack gap="200">
                      <Button variant="primary" size="slim">Save</Button>
                      <Button size="slim">Test Connection</Button>
                    </InlineStack>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd">Cash on Delivery</Text>
            <Checkbox label="Enable Cash on Delivery" checked={codEnabled} onChange={setCodEnabled} />
            {codEnabled && (
              <BlockStack gap="200">
                <TextField label="Maximum Amount (SAR)" value="5000" autoComplete="off" onChange={() => {}} />
                <TextField label="Surcharge (optional)" value="" autoComplete="off" onChange={() => {}} placeholder="0" />
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
