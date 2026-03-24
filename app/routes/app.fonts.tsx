import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Button,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import {
  ARABIC_FONTS,
  FONT_PAIRINGS,
  getFontById,
} from "../services/fonts/arabic";
import type { ArabicFont, FontPairingKey } from "../services/fonts/arabic";
import {
  HEBREW_FONTS,
  HEBREW_FONT_PAIRINGS,
  getHebrewFontById,
} from "../services/fonts/hebrew";
import type { HebrewFont, HebrewFontPairingKey } from "../services/fonts/hebrew";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateWithTenant(request);

  return json({
    arabicFonts: ARABIC_FONTS,
    hebrewFonts: HEBREW_FONTS,
    arabicPairings: FONT_PAIRINGS,
    hebrewPairings: HEBREW_FONT_PAIRINGS,
  });
};

function FontCard({
  font,
  isSelected,
  onSelect,
}: {
  font: ArabicFont | HebrewFont;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const categoryTone =
    font.category === "serif" ? "warning" : font.category === "sans-serif" ? "info" : "attention";

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h3" variant="headingMd">
              {font.name}
            </Text>
            <Badge tone={categoryTone}>{font.category}</Badge>
          </InlineStack>
          <Button
            variant={isSelected ? "primary" : "secondary"}
            onClick={() => onSelect(font.id)}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </InlineStack>
        <Text as="p" variant="bodyMd" tone="subdued">
          {font.description}
        </Text>
        <Box
          padding="400"
          background="bg-surface-secondary"
          borderRadius="200"
        >
          <Text as="p" variant="headingLg">
            <span style={{ fontFamily: font.family, fontSize: "24px" }}>
              {font.previewText}
            </span>
          </Text>
        </Box>
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" variant="bodySm" tone="subdued">
            Weights: {font.weights.join(", ")}
          </Text>
        </InlineStack>
        <Button
          url={font.googleFontUrl}
          variant="plain"
          external
        >
          View on Google Fonts
        </Button>
      </BlockStack>
    </Card>
  );
}

function PairingCard({
  name,
  pairing,
  resolveFont,
}: {
  name: string;
  pairing: { heading: string; body: string; accent: string };
  resolveFont: (id: string) => { name: string; family: string } | undefined;
}) {
  const heading = resolveFont(pairing.heading);
  const body = resolveFont(pairing.body);
  const accent = resolveFont(pairing.accent);

  const label = name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          {label}
        </Text>
        <BlockStack gap="200">
          {heading && (
            <InlineStack gap="200" blockAlign="center">
              <Badge>Heading</Badge>
              <Text as="span" variant="bodyMd">
                <span style={{ fontFamily: heading.family }}>{heading.name}</span>
              </Text>
            </InlineStack>
          )}
          {body && (
            <InlineStack gap="200" blockAlign="center">
              <Badge tone="info">Body</Badge>
              <Text as="span" variant="bodyMd">
                <span style={{ fontFamily: body.family }}>{body.name}</span>
              </Text>
            </InlineStack>
          )}
          {accent && (
            <InlineStack gap="200" blockAlign="center">
              <Badge tone="attention">Accent</Badge>
              <Text as="span" variant="bodyMd">
                <span style={{ fontFamily: accent.family }}>{accent.name}</span>
              </Text>
            </InlineStack>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

export default function FontsPage() {
  const { arabicFonts, hebrewFonts, arabicPairings, hebrewPairings } =
    useLoaderData<typeof loader>();
  const [selectedFont, setSelectedFont] = useState<string | null>(null);

  return (
    <Page>
      <TitleBar title="Font Management" />
      <Layout>
        {/* Arabic Fonts */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Arabic Fonts
            </Text>
            {arabicFonts.map((font: ArabicFont) => (
              <FontCard
                key={font.id}
                font={font}
                isSelected={selectedFont === font.id}
                onSelect={setSelectedFont}
              />
            ))}
          </BlockStack>
        </Layout.Section>

        {/* Hebrew Fonts */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Hebrew Fonts
            </Text>
            {hebrewFonts.map((font: HebrewFont) => (
              <FontCard
                key={font.id}
                font={font}
                isSelected={selectedFont === font.id}
                onSelect={setSelectedFont}
              />
            ))}
          </BlockStack>
        </Layout.Section>

        {/* Font Pairings */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Arabic Font Pairings
            </Text>
            {(Object.keys(arabicPairings) as FontPairingKey[]).map((key) => (
              <PairingCard
                key={key}
                name={key}
                pairing={arabicPairings[key]}
                resolveFont={(id) => {
                  const f = getFontById(id);
                  return f ? { name: f.name, family: f.family } : undefined;
                }}
              />
            ))}
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Hebrew Font Pairings
            </Text>
            {(Object.keys(hebrewPairings) as HebrewFontPairingKey[]).map(
              (key) => (
                <PairingCard
                  key={key}
                  name={key}
                  pairing={hebrewPairings[key]}
                  resolveFont={(id) => {
                    const f = getHebrewFontById(id);
                    return f ? { name: f.name, family: f.family } : undefined;
                  }}
                />
              ),
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
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
