import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
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
  Select,
  Text,
} from "@shopify/polaris";
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import {
  getInlineSwitcherConfig,
  getDisplayOptions,
  getDropdownLabels,
  formatLanguageOption,
  getKeyboardNavigation,
  shouldUseCompactMode,
  getThemeVariables,
  getTriggerDisplay,
  type DisplayStyle,
} from "../services/language-switcher/inline";
import {
  buildLanguageOptions,
  SUPPORTED_LANGUAGES,
} from "../services/language-switcher/options";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticateWithTenant(request);

  const config = getInlineSwitcherConfig("en");
  const labels = getDropdownLabels("en");
  const languages = buildLanguageOptions(
    ["en", "ar", "he", "fa", "fr", "de", "es"],
    "en",
  );

  return json({ config, labels, languages });
};

const PLACEMENT_OPTIONS = [
  { label: "Header", value: "header" },
  { label: "Footer", value: "footer" },
];

const STYLE_OPTIONS = [
  { label: "Flag only", value: "flag-only" },
  { label: "Text only", value: "text-only" },
  { label: "Flag + Text", value: "flag-text" },
  { label: "Text + Flag", value: "text-flag" },
];

const PREVIEW_LANGUAGES = ["en", "ar", "he", "fa", "fr", "de", "es"];

export default function LanguageSwitcherPage() {
  const [placement, setPlacement] = useState<"header" | "footer">("header");
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("flag-text");
  const [compact, setCompact] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("en");

  const languages = buildLanguageOptions(PREVIEW_LANGUAGES, currentLocale);
  const config = {
    ...getInlineSwitcherConfig(currentLocale),
    placement,
    displayStyle,
    compact,
    isOpen: true,
  };
  const displayOptions = getDisplayOptions(config, currentLocale);
  const labels = getDropdownLabels(currentLocale);
  const themeVars = getThemeVariables(false);
  const autoCompact = shouldUseCompactMode(languages.length);

  const currentLang = languages.find((l) => l.isActive) ?? languages[0];
  const triggerDisplay = getTriggerDisplay(currentLang, displayStyle, true);
  const formattedOptions = languages.map((lang) =>
    formatLanguageOption(lang, currentLocale),
  );

  const keyboardNav = getKeyboardNavigation(languages, 0);

  const isRtl = displayOptions.isRtl;

  return (
    <Page>
      <TitleBar title="Language Switcher" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Info Banner */}
            <Banner title="Inline Dropdown Language Switcher" tone="info">
              Configure how the language switcher appears on your storefront.
              The switcher supports RTL/LTR layouts, keyboard navigation, and
              multiple display styles.
            </Banner>

            {/* Switcher Preview */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Switcher Preview
                  </Text>
                  <InlineStack gap="200">
                    <Badge tone={isRtl ? "warning" : "info"}>
                      {isRtl ? "RTL" : "LTR"}
                    </Badge>
                    <Badge>{placement}</Badge>
                    <Badge>{displayStyle}</Badge>
                    {compact && <Badge tone="attention">Compact</Badge>}
                  </InlineStack>
                </InlineStack>

                {/* Simulated dropdown */}
                <Box
                  padding="400"
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  background="bg-surface-secondary"
                >
                  <BlockStack gap="300">
                    {/* Trigger button preview */}
                    <Box
                      padding="200"
                      borderWidth="025"
                      borderColor="border"
                      borderRadius="100"
                      background="bg-surface"
                    >
                      <InlineStack
                        align={isRtl ? "end" : "start"}
                        blockAlign="center"
                        gap="200"
                      >
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          {triggerDisplay.content}
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                          ▾
                        </Text>
                      </InlineStack>
                    </Box>

                    {/* Dropdown items preview */}
                    <Box
                      padding="200"
                      borderWidth="025"
                      borderColor="border"
                      borderRadius="100"
                      background="bg-surface"
                    >
                      <BlockStack gap="100">
                        {formattedOptions.map((opt) => (
                          <Box
                            key={opt.locale}
                            padding="200"
                            borderRadius="100"
                            background={
                              opt.isActive
                                ? "bg-surface-selected"
                                : "bg-surface"
                            }
                          >
                            <InlineStack
                              align="space-between"
                              blockAlign="center"
                            >
                              <InlineStack gap="200" blockAlign="center">
                                {(displayStyle === "flag-only" ||
                                  displayStyle === "flag-text") && (
                                  <Text as="span" variant="bodyMd">
                                    {opt.flag}
                                  </Text>
                                )}
                                {displayStyle !== "flag-only" && (
                                  <Text
                                    as="span"
                                    variant="bodyMd"
                                    fontWeight={
                                      opt.isActive ? "bold" : "regular"
                                    }
                                  >
                                    {opt.label}
                                  </Text>
                                )}
                                {displayStyle === "text-flag" && (
                                  <Text as="span" variant="bodyMd">
                                    {opt.flag}
                                  </Text>
                                )}
                              </InlineStack>
                              <InlineStack gap="200" blockAlign="center">
                                <Badge
                                  tone={
                                    opt.direction === "rtl"
                                      ? "warning"
                                      : "info"
                                  }
                                >
                                  {opt.direction.toUpperCase()}
                                </Badge>
                                {opt.isActive && (
                                  <Badge tone="success">Active</Badge>
                                )}
                              </InlineStack>
                            </InlineStack>
                          </Box>
                        ))}
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Box>

                {/* Locale switcher for preview */}
                <Select
                  label="Preview as locale"
                  options={PREVIEW_LANGUAGES.map((code) => ({
                    label: `${SUPPORTED_LANGUAGES[code].flag} ${SUPPORTED_LANGUAGES[code].name} (${code})`,
                    value: code,
                  }))}
                  value={currentLocale}
                  onChange={(val) => setCurrentLocale(val)}
                />
              </BlockStack>
            </Card>

            {/* Configuration Panel */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Configuration
                </Text>

                <Select
                  label="Placement"
                  options={PLACEMENT_OPTIONS}
                  value={placement}
                  onChange={(val) =>
                    setPlacement(val as "header" | "footer")
                  }
                  helpText="Where the language switcher appears on the storefront."
                />

                <Select
                  label="Display style"
                  options={STYLE_OPTIONS}
                  value={displayStyle}
                  onChange={(val) => setDisplayStyle(val as DisplayStyle)}
                  helpText="How language options are displayed in the trigger and dropdown."
                />

                <Checkbox
                  label="Compact mode"
                  checked={compact}
                  onChange={setCompact}
                  helpText={
                    autoCompact
                      ? `Auto-enabled: ${languages.length} languages exceed the compact threshold.`
                      : "Use a more condensed layout for the language switcher."
                  }
                />
              </BlockStack>
            </Card>

            {/* CSS Classes Preview */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Generated CSS Classes
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  These CSS classes are applied to the switcher based on your
                  configuration.
                </Text>

                <Box
                  padding="300"
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  background="bg-surface-secondary"
                >
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" fontWeight="semibold">
                        Container:
                      </Text>
                      <Badge>{displayOptions.containerClass}</Badge>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" fontWeight="semibold">
                        Trigger:
                      </Text>
                      <Badge>{displayOptions.triggerClass}</Badge>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" fontWeight="semibold">
                        Dropdown:
                      </Text>
                      <Badge>{displayOptions.dropdownClass}</Badge>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" fontWeight="semibold">
                        Item:
                      </Text>
                      <Badge>{displayOptions.itemClass}</Badge>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="span" variant="bodySm" fontWeight="semibold">
                        Active Item:
                      </Text>
                      <Badge>{displayOptions.activeItemClass}</Badge>
                    </InlineStack>
                  </BlockStack>
                </Box>

                <Text as="h3" variant="headingSm">
                  Theme Variables
                </Text>
                <Box
                  padding="300"
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  background="bg-surface-secondary"
                >
                  <BlockStack gap="100">
                    {Object.entries(themeVars).map(([key, value]) => (
                      <InlineStack key={key} gap="200" blockAlign="center">
                        <Text as="span" variant="bodySm" fontWeight="semibold">
                          {key}:
                        </Text>
                        <Text as="span" variant="bodySm">
                          {value}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            {/* Keyboard Navigation */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Keyboard Navigation
                  </Text>
                  <Badge tone="success">Enabled</Badge>
                </InlineStack>
                <Text as="p" variant="bodyMd" tone="subdued">
                  The language switcher supports full keyboard navigation for
                  accessibility compliance.
                </Text>

                <Box
                  padding="300"
                  borderWidth="025"
                  borderColor="border"
                  borderRadius="200"
                  background="bg-surface-secondary"
                >
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Badge>Enter / Space</Badge>
                      <Text as="span" variant="bodySm">
                        Open dropdown / Select language
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge>Arrow Down</Badge>
                      <Text as="span" variant="bodySm">
                        Move to next option (wraps: index {keyboardNav.nextIndex})
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge>Arrow Up</Badge>
                      <Text as="span" variant="bodySm">
                        Move to previous option (wraps: index{" "}
                        {keyboardNav.prevIndex})
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge>Home</Badge>
                      <Text as="span" variant="bodySm">
                        Jump to first option (index {keyboardNav.firstIndex})
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge>End</Badge>
                      <Text as="span" variant="bodySm">
                        Jump to last option (index {keyboardNav.lastIndex})
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200" blockAlign="center">
                      <Badge>Escape</Badge>
                      <Text as="span" variant="bodySm">
                        Close dropdown
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            {/* RTL/LTR Awareness */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    RTL / LTR Awareness
                  </Text>
                  <Badge tone={isRtl ? "warning" : "info"}>
                    {isRtl ? "RTL Mode" : "LTR Mode"}
                  </Badge>
                </InlineStack>

                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Current direction:
                    </Text>
                    <Text as="span" variant="bodySm">
                      {isRtl ? "Right-to-Left" : "Left-to-Right"}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      Dropdown position:
                    </Text>
                    <Text as="span" variant="bodySm">
                      {config.position}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      ARIA trigger label:
                    </Text>
                    <Text as="span" variant="bodySm">
                      {labels.triggerLabel}
                    </Text>
                  </InlineStack>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      ARIA dropdown label:
                    </Text>
                    <Text as="span" variant="bodySm">
                      {labels.dropdownAriaLabel}
                    </Text>
                  </InlineStack>
                </BlockStack>

                {isRtl && (
                  <Banner tone="warning" title="RTL Layout Active">
                    The switcher is rendering in RTL mode. Dropdown alignment,
                    text direction, and keyboard navigation are adapted for
                    right-to-left languages.
                  </Banner>
                )}
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
