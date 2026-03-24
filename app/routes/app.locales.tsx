import { useState, useCallback } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useRouteError, isRouteErrorResponse } from "@remix-run/react";
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
  Banner,
  Checkbox,
  Modal,
  Select,
  ResourceList,
  ResourceItem,
  ProgressBar,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { SUPPORTED_LANGUAGES } from "../services/language-switcher/options";
import { calculateCoverage, getCoverageLevel } from "../services/coverage";

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch shop locales from Shopify
  const response = await admin.graphql(
    `#graphql
    query GetShopLocales {
      shopLocales {
        locale
        primary
        published
      }
    }`,
  );

  const data = await response.json();
  const shopLocales: Array<{
    locale: string;
    primary: boolean;
    published: boolean;
  }> = data?.data?.shopLocales ?? [];

  // Build locale info with coverage (placeholder — real coverage requires
  // querying translatable resources per locale)
  const locales = shopLocales.map((sl) => {
    const langInfo = SUPPORTED_LANGUAGES[sl.locale];
    return {
      locale: sl.locale,
      name: langInfo?.name ?? sl.locale,
      nativeName: langInfo?.nativeName ?? sl.locale,
      direction: langInfo?.direction ?? "ltr",
      primary: sl.primary,
      published: sl.published,
      coveragePercent: sl.primary ? 100 : 0, // placeholder
      coverageLevel: sl.primary
        ? ("excellent" as const)
        : ("critical" as const),
    };
  });

  // Languages not yet added to the shop
  const activeLocaleCodes = new Set(shopLocales.map((sl) => sl.locale));
  const availableLanguages = Object.entries(SUPPORTED_LANGUAGES)
    .filter(([code]) => !activeLocaleCodes.has(code))
    .map(([code, info]) => ({
      value: code,
      label: `${info.name} (${info.nativeName})`,
    }));

  return json({
    locales,
    availableLanguages,
  });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // ----- Intent: add_locale -----
  if (intent === "add_locale") {
    const locale = formData.get("locale") as string;
    if (!locale) {
      return json({ error: "Locale is required" }, { status: 400 });
    }

    const response = await admin.graphql(
      `#graphql
      mutation ShopLocaleEnable($locale: String!) {
        shopLocaleEnable(locale: $locale) {
          shopLocale {
            locale
            published
          }
          userErrors {
            field
            message
          }
        }
      }`,
      { variables: { locale } },
    );

    const data = await response.json();
    const result = data?.data?.shopLocaleEnable;

    if (result?.userErrors?.length > 0) {
      return json({
        success: false,
        error: result.userErrors.map((e: { message: string }) => e.message).join(", "),
      });
    }

    return json({ success: true, action: "added", locale });
  }

  // ----- Intent: toggle_publish -----
  if (intent === "toggle_publish") {
    const locale = formData.get("locale") as string;
    const published = formData.get("published") === "true";

    if (!locale) {
      return json({ error: "Locale is required" }, { status: 400 });
    }

    const response = await admin.graphql(
      `#graphql
      mutation ShopLocaleUpdate($locale: String!, $shopLocale: ShopLocaleInput!) {
        shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) {
          shopLocale {
            locale
            published
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          locale,
          shopLocale: { published },
        },
      },
    );

    const data = await response.json();
    const result = data?.data?.shopLocaleUpdate;

    if (result?.userErrors?.length > 0) {
      return json({
        success: false,
        error: result.userErrors.map((e: { message: string }) => e.message).join(", "),
      });
    }

    return json({ success: true, action: "updated", locale });
  }

  // ----- Intent: set_primary -----
  if (intent === "set_primary") {
    const locale = formData.get("locale") as string;
    if (!locale) {
      return json({ error: "Locale is required" }, { status: 400 });
    }

    const response = await admin.graphql(
      `#graphql
      mutation ShopLocaleUpdate($locale: String!, $shopLocale: ShopLocaleInput!) {
        shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) {
          shopLocale {
            locale
            primary
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          locale,
          shopLocale: { published: true },
        },
      },
    );

    const data = await response.json();
    const result = data?.data?.shopLocaleUpdate;

    if (result?.userErrors?.length > 0) {
      return json({
        success: false,
        error: result.userErrors.map((e: { message: string }) => e.message).join(", "),
      });
    }

    return json({ success: true, action: "set_primary", locale });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

// ---------------------------------------------------------------------------
// UI Component
// ---------------------------------------------------------------------------

interface LocaleInfo {
  locale: string;
  name: string;
  nativeName: string;
  direction: string;
  primary: boolean;
  published: boolean;
  coveragePercent: number;
  coverageLevel: string;
}

function coverageTone(level: string): "success" | "warning" | "critical" | "info" {
  switch (level) {
    case "excellent":
    case "good":
      return "success";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    default:
      return "info";
  }
}

export default function LocaleManagement() {
  const { locales, availableLanguages } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{
    success?: boolean;
    error?: string;
    action?: string;
    locale?: string;
  }>();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedNewLocale, setSelectedNewLocale] = useState(
    availableLanguages[0]?.value ?? "",
  );

  const handleTogglePublish = useCallback(
    (locale: string, currentlyPublished: boolean) => {
      fetcher.submit(
        {
          intent: "toggle_publish",
          locale,
          published: String(!currentlyPublished),
        },
        { method: "POST" },
      );
    },
    [fetcher],
  );

  const handleSetPrimary = useCallback(
    (locale: string) => {
      fetcher.submit(
        { intent: "set_primary", locale },
        { method: "POST" },
      );
    },
    [fetcher],
  );

  const handleAddLocale = useCallback(() => {
    if (!selectedNewLocale) return;
    fetcher.submit(
      { intent: "add_locale", locale: selectedNewLocale },
      { method: "POST" },
    );
    setAddModalOpen(false);
  }, [selectedNewLocale, fetcher]);

  const isSubmitting = fetcher.state !== "idle";

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }} title="Languages">
      <TitleBar title="Languages" />
      <BlockStack gap="500">
        {fetcher.data?.success && (
          <Banner
            title={`Language ${fetcher.data.action === "added" ? "added" : "updated"} successfully`}
            tone="success"
            onDismiss={() => {}}
          />
        )}
        {fetcher.data?.error && (
          <Banner title="Error" tone="critical" onDismiss={() => {}}>
            <p>{fetcher.data.error}</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    Active Languages
                  </Text>
                  <Button
                    variant="primary"
                    onClick={() => setAddModalOpen(true)}
                    disabled={availableLanguages.length === 0}
                  >
                    Add Language
                  </Button>
                </InlineStack>

                <ResourceList
                  items={locales}
                  renderItem={(item: LocaleInfo) => (
                    <ResourceItem
                      id={item.locale}
                      accessibilityLabel={`Language ${item.name}`}
                    >
                      <InlineStack
                        gap="400"
                        align="space-between"
                        blockAlign="center"
                        wrap={false}
                      >
                        <InlineStack gap="300" blockAlign="center">
                          <Checkbox
                            label=""
                            labelHidden
                            checked={item.published}
                            onChange={() =>
                              handleTogglePublish(item.locale, item.published)
                            }
                            disabled={item.primary || isSubmitting}
                          />
                          <BlockStack gap="100">
                            <InlineStack gap="200" blockAlign="center">
                              <Text as="span" variant="bodyMd" fontWeight="bold">
                                {item.name}
                              </Text>
                              <Text as="span" variant="bodySm" tone="subdued">
                                ({item.nativeName})
                              </Text>
                              {item.direction === "rtl" && (
                                <Badge tone="info">RTL</Badge>
                              )}
                              {item.primary && (
                                <Badge tone="success">Primary</Badge>
                              )}
                            </InlineStack>
                            <Box width="120px">
                              <ProgressBar
                                progress={item.coveragePercent}
                                tone={
                                  item.coveragePercent >= 70
                                    ? "success"
                                    : item.coveragePercent >= 40
                                      ? "highlight"
                                      : "critical"
                                }
                                size="small"
                              />
                            </Box>
                            <Text as="span" variant="bodySm" tone="subdued">
                              {item.coveragePercent}% coverage
                            </Text>
                          </BlockStack>
                        </InlineStack>

                        <InlineStack gap="200">
                          {!item.primary && (
                            <Button
                              size="slim"
                              onClick={() => handleSetPrimary(item.locale)}
                              disabled={isSubmitting}
                            >
                              Set as primary
                            </Button>
                          )}
                        </InlineStack>
                      </InlineStack>
                    </ResourceItem>
                  )}
                />
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Sidebar — summary */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Summary
                </Text>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Total languages
                  </Text>
                  <Badge>{String(locales.length)}</Badge>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Published
                  </Text>
                  <Badge tone="success">
                    {String(locales.filter((l: LocaleInfo) => l.published).length)}
                  </Badge>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    RTL languages
                  </Text>
                  <Badge tone="info">
                    {String(
                      locales.filter((l: LocaleInfo) => l.direction === "rtl").length,
                    )}
                  </Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Add Language Modal */}
        <Modal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add Language"
          primaryAction={{
            content: "Add",
            onAction: handleAddLocale,
            disabled: !selectedNewLocale || isSubmitting,
            loading: isSubmitting,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setAddModalOpen(false),
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                Select a language to add to your store. You can publish it later
                when translations are ready.
              </Text>
              <Select
                label="Language"
                options={availableLanguages}
                value={selectedNewLocale}
                onChange={setSelectedNewLocale}
              />
            </BlockStack>
          </Modal.Section>
        </Modal>
      </BlockStack>
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
