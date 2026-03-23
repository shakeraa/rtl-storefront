import { useState, useCallback } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Select,
  Button,
  Banner,
  IndexTable,
  Checkbox,
  Badge,
  ProgressBar,
  Box,
  useIndexResourceState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { createShopTranslationEngine } from "../services/translation/engine";
import { getProviderStatus } from "../services/translation/get-provider-env.server";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESOURCE_TYPE_OPTIONS = [
  { label: "Products", value: "products" },
  { label: "Collections", value: "collections" },
  { label: "Pages", value: "pages" },
  { label: "Blog Articles", value: "blog" },
];

const LOCALE_OPTIONS = [
  { label: "Arabic", value: "ar" },
  { label: "Hebrew", value: "he" },
  { label: "Farsi", value: "fa" },
  { label: "Urdu", value: "ur" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
];

const RESOURCE_TYPE_TO_GQL: Record<string, string> = {
  products: "PRODUCT",
  collections: "COLLECTION",
  pages: "ONLINE_STORE_PAGE",
  blog: "ONLINE_STORE_ARTICLE",
};

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const resourceType = url.searchParams.get("resourceType") || "products";
  const targetLocale = url.searchParams.get("locale") || "ar";

  const gqlType = RESOURCE_TYPE_TO_GQL[resourceType] ?? "PRODUCT";

  // Fetch translatable resources of the selected type
  const response = await admin.graphql(
    `#graphql
    query GetTranslatableResources($resourceType: TranslatableResourceType!, $first: Int!) {
      translatableResources(resourceType: $resourceType, first: $first) {
        nodes {
          resourceId
          translatableContent {
            key
            value
            digest
            locale
          }
        }
      }
    }`,
    {
      variables: {
        resourceType: gqlType,
        first: 50,
      },
    },
  );

  const data = await response.json();
  const nodes = data?.data?.translatableResources?.nodes ?? [];

  const resources = nodes.map(
    (node: {
      resourceId: string;
      translatableContent: Array<{
        key: string;
        value: string | null;
        digest: string;
        locale: string;
      }>;
    }) => {
      const titleField = node.translatableContent.find(
        (c) => c.key === "title" && c.value,
      );
      const fieldCount = node.translatableContent.filter(
        (c) => c.value && c.value.trim().length > 0,
      ).length;

      // Extract the numeric ID from the GID
      const numericId = node.resourceId.split("/").pop() ?? node.resourceId;

      return {
        id: node.resourceId,
        numericId,
        title: titleField?.value ?? numericId,
        fieldCount,
      };
    },
  );

  const providerStatus = await getProviderStatus(session.shop);

  return json({
    resources,
    resourceType,
    targetLocale,
    providerStatus,
  });
};

// ---------------------------------------------------------------------------
// Action — bulk translate selected resources
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent !== "bulk_translate") {
    return json({ error: "Invalid intent" }, { status: 400 });
  }

  const targetLocale = formData.get("locale") as string;
  const resourceIdsJson = formData.get("resourceIds") as string;

  if (!targetLocale || !resourceIdsJson) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check provider configuration before attempting translation
  const providerStatus = await getProviderStatus(session.shop);
  if (!providerStatus.anyConfigured) {
    return json({
      success: false,
      error: "No translation provider configured. Go to Settings to add your API key.",
    });
  }

  const resourceIds: string[] = JSON.parse(resourceIdsJson);
  const engine = await createShopTranslationEngine(session.shop);

  let totalTranslated = 0;
  let totalErrors = 0;
  const resourceResults: Array<{
    resourceId: string;
    translated: number;
    errors: number;
  }> = [];

  for (const resourceId of resourceIds) {
    // Fetch translatable content for each resource
    const response = await admin.graphql(
      `#graphql
      query GetTranslatableResource($resourceId: ID!, $locale: String!) {
        translatableResource(resourceId: $resourceId) {
          resourceId
          translatableContent {
            key
            value
            digest
            locale
          }
          translations(locale: $locale) {
            key
            value
          }
        }
      }`,
      {
        variables: {
          resourceId,
          locale: targetLocale,
        },
      },
    );

    const data = await response.json();
    const resource = data?.data?.translatableResource;

    if (!resource) {
      resourceResults.push({ resourceId, translated: 0, errors: 1 });
      totalErrors++;
      continue;
    }

    // Build existing translations map
    const existingMap = new Map<string, string>();
    for (const t of resource.translations ?? []) {
      if (t.value && t.value.trim().length > 0) {
        existingMap.set(t.key, t.value);
      }
    }

    // Translate untranslated fields
    const translatedFields: Array<{
      key: string;
      value: string;
      locale: string;
      translatableContentDigest: string;
    }> = [];
    let resourceErrors = 0;

    for (const field of resource.translatableContent ?? []) {
      if (!field.value || field.value.trim().length === 0) continue;
      if (existingMap.has(field.key)) continue;

      try {
        const result = await engine.translate({
          text: field.value,
          sourceLocale: field.locale || "en",
          targetLocale,
          context: `Shopify resource field: ${field.key}`,
          format: field.key === "body_html" || field.key === "summary_html"
            ? "html"
            : "text",
        });

        translatedFields.push({
          key: field.key,
          value: result.translatedText,
          locale: targetLocale,
          translatableContentDigest: field.digest,
        });
      } catch {
        resourceErrors++;
      }
    }

    // Save translations to Shopify
    if (translatedFields.length > 0) {
      const saveResponse = await admin.graphql(
        `#graphql
        mutation TranslationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $resourceId, translations: $translations) {
            translations {
              key
              value
              locale
            }
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            resourceId,
            translations: translatedFields,
          },
        },
      );

      const saveData = await saveResponse.json();
      const saveResult = saveData?.data?.translationsRegister;

      if (saveResult?.userErrors?.length > 0) {
        resourceErrors += saveResult.userErrors.length;
      }
    }

    totalTranslated += translatedFields.length;
    totalErrors += resourceErrors;
    resourceResults.push({
      resourceId,
      translated: translatedFields.length,
      errors: resourceErrors,
    });
  }

  return json({
    success: true,
    totalTranslated,
    totalErrors,
    resourcesProcessed: resourceIds.length,
    resourceResults,
  });
};

// ---------------------------------------------------------------------------
// UI Component
// ---------------------------------------------------------------------------

interface ResourceRow {
  id: string;
  numericId: string;
  title: string;
  fieldCount: number;
}

export default function BulkTranslate() {
  const { resources, resourceType, targetLocale, providerStatus } =
    useLoaderData<typeof loader>();

  const fetcher = useFetcher<{
    success?: boolean;
    error?: string;
    totalTranslated?: number;
    totalErrors?: number;
    resourcesProcessed?: number;
  }>();

  const [selectedResourceType, setSelectedResourceType] = useState(resourceType);
  const [selectedLocale, setSelectedLocale] = useState(targetLocale);

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(resources);

  const handleResourceTypeChange = useCallback(
    (value: string) => {
      setSelectedResourceType(value);
      window.location.href = `/app/bulk-translate?resourceType=${value}&locale=${selectedLocale}`;
    },
    [selectedLocale],
  );

  const handleLocaleChange = useCallback(
    (value: string) => {
      setSelectedLocale(value);
      window.location.href = `/app/bulk-translate?resourceType=${selectedResourceType}&locale=${value}`;
    },
    [selectedResourceType],
  );

  const handleTranslateSelected = useCallback(() => {
    if (selectedResources.length === 0) return;

    fetcher.submit(
      {
        intent: "bulk_translate",
        locale: selectedLocale,
        resourceIds: JSON.stringify(selectedResources),
      },
      { method: "POST" },
    );
  }, [selectedResources, selectedLocale, fetcher]);

  const isTranslating = fetcher.state !== "idle";

  const resourceHeadings = [
    { title: "Title" },
    { title: "Fields" },
    { title: "ID" },
  ];

  const rowMarkup = resources.map((resource: ResourceRow, index: number) => (
    <IndexTable.Row
      id={resource.id}
      key={resource.id}
      selected={selectedResources.includes(resource.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="bold">
          {resource.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge>{String(resource.fieldCount)} fields</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodySm" tone="subdued">
          {resource.numericId}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const localeName =
    LOCALE_OPTIONS.find((l) => l.value === selectedLocale)?.label ?? selectedLocale;

  return (
    <Page backAction={{ content: "Dashboard", url: "/app" }} title="Bulk Translate">
      <TitleBar title="Bulk Translate" />
      <BlockStack gap="500">
        {!providerStatus.anyConfigured && (
          <Banner
            title="Translation provider not configured"
            tone="critical"
            action={{ content: "Go to Settings", url: "/app/settings" }}
          >
            <p>
              You need to add an API key for at least one translation provider (OpenAI, DeepL, or Google)
              before you can translate content. Go to Settings to configure your provider.
            </p>
          </Banner>
        )}
        {fetcher.data?.success && (
          <Banner
            title={`Bulk translation complete: ${fetcher.data.totalTranslated} field(s) translated across ${fetcher.data.resourcesProcessed} resource(s)`}
            tone="success"
            onDismiss={() => {}}
          >
            {fetcher.data.totalErrors ? (
              <p>{fetcher.data.totalErrors} error(s) encountered.</p>
            ) : null}
          </Banner>
        )}
        {fetcher.data?.error && (
          <Banner title="Error" tone="critical" onDismiss={() => {}}>
            <p>{fetcher.data.error}</p>
          </Banner>
        )}

        {isTranslating && (
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                Translating resources... This may take a moment.
              </Text>
              <ProgressBar progress={50} tone="highlight" />
            </BlockStack>
          </Card>
        )}

        <Layout>
          <Layout.Section>
            {/* Filters */}
            <Card>
              <InlineStack gap="400" align="start" blockAlign="end">
                <Select
                  label="Resource Type"
                  options={RESOURCE_TYPE_OPTIONS}
                  value={selectedResourceType}
                  onChange={handleResourceTypeChange}
                />
                <Select
                  label="Target Language"
                  options={LOCALE_OPTIONS}
                  value={selectedLocale}
                  onChange={handleLocaleChange}
                />
                <Box paddingBlockEnd="050">
                  <Button
                    variant="primary"
                    onClick={handleTranslateSelected}
                    loading={isTranslating}
                    disabled={selectedResources.length === 0 || isTranslating}
                  >
                    {isTranslating
                      ? "Translating..."
                      : `Translate Selected (${selectedResources.length})`}
                  </Button>
                </Box>
              </InlineStack>
            </Card>

            {/* Resource table */}
            <Box paddingBlockStart="400">
              <Card padding="0">
                <IndexTable
                  resourceName={{
                    singular: "resource",
                    plural: "resources",
                  }}
                  itemCount={resources.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  headings={resourceHeadings}
                >
                  {rowMarkup}
                </IndexTable>
              </Card>
            </Box>

            {resources.length === 0 && (
              <Box paddingBlockStart="400">
                <Banner tone="info">
                  <p>
                    No translatable resources found for this resource type. Try a
                    different type or add some content to your store first.
                  </p>
                </Banner>
              </Box>
            )}
          </Layout.Section>

          {/* Sidebar */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Bulk Translation
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Select resources from the list and click "Translate Selected"
                    to AI-translate all untranslated fields for those resources.
                  </Text>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Resources loaded
                    </Text>
                    <Badge>{String(resources.length)}</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Selected
                    </Text>
                    <Badge tone="info">{String(selectedResources.length)}</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Target language
                    </Text>
                    <Badge tone="success">{localeName}</Badge>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    How it works
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    1. Choose a resource type and target language.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    2. Select the resources you want to translate using the
                    checkboxes.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    3. Click "Translate Selected" to start AI translation.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    4. Already-translated fields are skipped automatically.
                  </Text>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
