import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, InlineGrid, Text,
  Badge, Button, Icon, Divider, Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

interface PlanFeature {
  label: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small stores getting started with RTL",
    monthlyPrice: 9.99,
    yearlyPrice: 7.99,
    cta: "Start Free Trial",
    features: [
      { label: "RTL layout engine", included: true },
      { label: "1 target language", included: true },
      { label: "Arabic & Hebrew fonts", included: true },
      { label: "Basic translation (500 items/mo)", included: true },
      { label: "Language switcher widget", included: true },
      { label: "Email support", included: true },
      { label: "AI translation (Google)", included: true },
      { label: "Cultural sensitivity filter", included: false },
      { label: "Translation memory", included: false },
      { label: "MENA payment gateways", included: false },
      { label: "Custom CSS editor", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing stores targeting MENA markets",
    monthlyPrice: 24.99,
    yearlyPrice: 19.99,
    popular: true,
    cta: "Start Free Trial",
    features: [
      { label: "RTL layout engine", included: true },
      { label: "5 target languages", included: true },
      { label: "Arabic, Hebrew & Farsi fonts", included: true },
      { label: "Unlimited translation", included: true },
      { label: "Language switcher widget", included: true },
      { label: "Priority support", included: true },
      { label: "AI translation (OpenAI + DeepL + Google)", included: true },
      { label: "Cultural sensitivity filter", included: true },
      { label: "Translation memory & glossary", included: true },
      { label: "MENA payment gateways (Tamara, Tabby, Mada)", included: true },
      { label: "Custom CSS editor", included: true },
      { label: "Checkout extension", included: true },
      { label: "Analytics dashboard", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full MENA market expansion suite",
    monthlyPrice: 59.99,
    yearlyPrice: 49.99,
    cta: "Start Free Trial",
    features: [
      { label: "RTL layout engine", included: true },
      { label: "Unlimited languages", included: true },
      { label: "Full RTL font library (Arabic, Hebrew, Farsi, Urdu)", included: true },
      { label: "Unlimited translation", included: true },
      { label: "Language switcher + checkout extension", included: true },
      { label: "Dedicated support + Slack channel", included: true },
      { label: "AI translation (all providers + custom)", included: true },
      { label: "Cultural AI (dialect, formality, sensitivity)", included: true },
      { label: "Translation memory, glossary & review workflow", included: true },
      { label: "All 9 MENA payment gateways", included: true },
      { label: "Custom CSS + theme sections", included: true },
      { label: "Checkout + storefront extensions", included: true },
      { label: "Analytics, ROI tracking & reports", included: true },
      { label: "Public REST API + webhooks", included: true },
      { label: "Hijri calendar & seasonal campaigns", included: true },
      { label: "WhatsApp & SMS notifications (Arabic)", included: true },
    ],
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <Page>
      <TitleBar title="Pricing Plans" />
      <BlockStack gap="600">
        <BlockStack gap="200" inlineAlign="center">
          <Text as="h1" variant="headingXl" alignment="center">Choose Your Plan</Text>
          <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
            The most complete RTL & MENA market solution for Shopify. 7-day free trial on all plans.
          </Text>
          <InlineStack gap="300" align="center">
            <Button pressed={!yearly} onClick={() => setYearly(false)} size="slim">Monthly</Button>
            <Button pressed={yearly} onClick={() => setYearly(true)} size="slim">
              Yearly (save 20%)
            </Button>
          </InlineStack>
        </BlockStack>

        <InlineGrid columns={3} gap="400">
          {PLANS.map((plan) => (
            <Card key={plan.id} background={plan.popular ? "bg-surface-info" : undefined}>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingLg">{plan.name}</Text>
                    {plan.popular && <Badge tone="info">Most Popular</Badge>}
                  </InlineStack>
                  <Text as="p" variant="bodyMd" tone="subdued">{plan.description}</Text>
                </BlockStack>

                <BlockStack gap="100">
                  <InlineStack gap="100" blockAlign="end">
                    <Text as="span" variant="heading2xl">
                      ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </Text>
                    <Text as="span" variant="bodyMd" tone="subdued">/month</Text>
                  </InlineStack>
                  {yearly && (
                    <Text as="p" variant="bodySm" tone="subdued">
                      Billed ${(plan.yearlyPrice * 12).toFixed(0)}/year (save ${((plan.monthlyPrice - plan.yearlyPrice) * 12).toFixed(0)})
                    </Text>
                  )}
                </BlockStack>

                <Button variant={plan.popular ? "primary" : "secondary"} fullWidth>
                  {plan.cta}
                </Button>

                <Divider />

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">Plan includes:</Text>
                  {plan.features.map((feature, i) => (
                    <InlineStack gap="200" key={i} wrap={false}>
                      <Text as="span" variant="bodyMd" tone={feature.included ? "success" : "subdued"}>
                        {feature.included ? "✓" : "—"}
                      </Text>
                      <Text as="span" variant="bodyMd" tone={feature.included ? undefined : "subdued"}>
                        {feature.label}
                      </Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>

        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingMd" alignment="center">Why RTL Storefront?</Text>
            <InlineGrid columns={4} gap="400">
              <BlockStack gap="100" inlineAlign="center">
                <Text as="p" variant="headingLg" alignment="center">9</Text>
                <Text as="p" variant="bodySm" alignment="center" tone="subdued">MENA Payment Gateways</Text>
              </BlockStack>
              <BlockStack gap="100" inlineAlign="center">
                <Text as="p" variant="headingLg" alignment="center">3</Text>
                <Text as="p" variant="bodySm" alignment="center" tone="subdued">AI Translation Engines</Text>
              </BlockStack>
              <BlockStack gap="100" inlineAlign="center">
                <Text as="p" variant="headingLg" alignment="center">6+</Text>
                <Text as="p" variant="bodySm" alignment="center" tone="subdued">RTL Languages Supported</Text>
              </BlockStack>
              <BlockStack gap="100" inlineAlign="center">
                <Text as="p" variant="headingLg" alignment="center">500+</Text>
                <Text as="p" variant="bodySm" alignment="center" tone="subdued">Translated UI Labels</Text>
              </BlockStack>
            </InlineGrid>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
