import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  IndexTable,
  Badge,
  Button,
  Box,
  Select,
  Filters,
  ChoiceList,
  ProgressBar,
  useIndexResourceState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getStats as getTMStats } from "../services/translation-memory/store";

const RESOURCE_TYPE_QUERY = `
  query TranslatableResources($resourceType: TranslatableResourceType!, $first: Int!) {
    translatableResources(resourceType: $resourceType, first: $first) {
      edges {
        node {
          resourceId
          translatableContent {
            key
            value
            locale
          }
        }
      }
    }
  }
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);

  // Fetch translation memory stats from the TM store service
  let tmStats: { totalEntries: number; languagePairs: Array<{ sourceLocale: string; targetLocale: string; count: number }> } = {
    totalEntries: 0,
    languagePairs: [],
  };
  try {
    tmStats = await getTMStats(session.shop);
  } catch {
    // TM stats unavailable — fall back to defaults
  }

  // Query Shopify for translatable resources
  let items: Array<{ id: string; title: string; type: string; sourceLang: string; status: string }> = [];
  const resourceTypes = [
    { type: "PRODUCT", label: "Product" },
    { type: "COLLECTION", label: "Collection" },
    { type: "ONLINE_STORE_PAGE", label: "Page" },
    { type: "ONLINE_STORE_BLOG", label: "Blog" },
  ];

  try {
    let idx = 0;
    for (const rt of resourceTypes) {
      try {
        const response = await admin.graphql(RESOURCE_TYPE_QUERY, {
          variables: { resourceType: rt.type, first: 20 },
        });
        const data = await response.json();
        const edges = data?.data?.translatableResources?.edges ?? [];
        for (const edge of edges) {
          idx++;
          const node = edge.node;
          const titleContent = node.translatableContent?.find(
            (c: any) => c.key === "title" || c.key === "name" || c.key === "body_html",
          );
          const title = titleContent?.value ?? `${rt.label} ${node.resourceId}`;

          // Check translation status in our cache
          let status = "Untranslated";
          try {
            const cacheCount = await db.translationCache.count({
              where: { sourceText: title },
            });
            if (cacheCount > 0) {
              status = "Translated";
            }
          } catch {
            // ignore
          }

          items.push({
            id: String(idx),
            title: title.substring(0, 80),
            type: rt.label,
            sourceLang: "English",
            status,
          });
        }
      } catch {
        // Skip this resource type on error
      }
    }
  } catch {
    // If GraphQL fails entirely, fall back to empty list
    items = [];
  }

  // Build language stats from DB
  let languageStats: Record<string, { translated: number; total: number; coverage: number }> = {};
  try {
    const groups = await db.translationCache.groupBy({
      by: ["targetLocale"],
      _count: true,
    });
    const distinctSources = await db.translationCache.groupBy({
      by: ["sourceText"],
      _count: true,
    });
    const total = distinctSources.length || 1;

    const localeToName: Record<string, string> = { ar: "arabic", he: "hebrew", fa: "farsi" };
    for (const g of groups) {
      const name = localeToName[g.targetLocale] ?? g.targetLocale;
      languageStats[name] = {
        translated: g._count,
        total,
        coverage: Math.round((g._count / total) * 100),
      };
    }
  } catch {
    // Fall back to empty stats
  }

  // Ensure at least the expected keys exist
  if (!languageStats.arabic) languageStats.arabic = { translated: 0, total: 0, coverage: 0 };
  if (!languageStats.hebrew) languageStats.hebrew = { translated: 0, total: 0, coverage: 0 };
  if (!languageStats.farsi) languageStats.farsi = { translated: 0, total: 0, coverage: 0 };

  return json({
    items,
    languageStats,
    tmStats,
  });
};

function statusBadge(status: string) {
  switch (status) {
    case "Translated":
      return <Badge tone="success">Translated</Badge>;
    case "Partial":
      return <Badge tone="warning">Partial</Badge>;
    case "Untranslated":
      return <Badge tone="critical">Untranslated</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function Translate() {
  const { items, languageStats, tmStats } = useLoaderData<typeof loader>();
  const [selectedLanguage, setSelectedLanguage] = useState("arabic");

  const localeMap: Record<string, string> = {
    arabic: "ar",
    hebrew: "he",
    farsi: "fa",
  };

  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [queryValue, setQueryValue] = useState("");

  const resourceName = { singular: "content item", plural: "content items" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(items);

  const handleLanguageChange = useCallback(
    (value: string) => setSelectedLanguage(value),
    [],
  );

  const handleTypeFilterChange = useCallback(
    (value: string[]) => setTypeFilter(value),
    [],
  );

  const handleStatusFilterChange = useCallback(
    (value: string[]) => setStatusFilter(value),
    [],
  );

  const handleQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    [],
  );

  const handleQueryClear = useCallback(() => setQueryValue(""), []);

  const handleFiltersClearAll = useCallback(() => {
    setTypeFilter([]);
    setStatusFilter([]);
    setQueryValue("");
  }, []);

  const filters = [
    {
      key: "type",
      label: "Resource Type",
      filter: (
        <ChoiceList
          title="Resource Type"
          titleHidden
          choices={[
            { label: "Products", value: "Product" },
            { label: "Collections", value: "Collection" },
            { label: "Pages", value: "Page" },
            { label: "Blogs", value: "Blog" },
          ]}
          selected={typeFilter}
          onChange={handleTypeFilterChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "status",
      label: "Status",
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: "Translated", value: "Translated" },
            { label: "Partial", value: "Partial" },
            { label: "Untranslated", value: "Untranslated" },
          ]}
          selected={statusFilter}
          onChange={handleStatusFilterChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [
    ...(typeFilter.length > 0
      ? [{ key: "type", label: `Type: ${typeFilter.join(", ")}`, onRemove: () => setTypeFilter([]) }]
      : []),
    ...(statusFilter.length > 0
      ? [{ key: "status", label: `Status: ${statusFilter.join(", ")}`, onRemove: () => setStatusFilter([]) }]
      : []),
  ];

  const filteredItems = items.filter((item) => {
    if (typeFilter.length > 0 && !typeFilter.includes(item.type)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(item.status)) return false;
    if (queryValue && !item.title.toLowerCase().includes(queryValue.toLowerCase())) return false;
    return true;
  });

  const currentStats =
    languageStats[selectedLanguage as keyof typeof languageStats];

  const rowMarkup = filteredItems.map((item, index) => (
    <IndexTable.Row
      id={item.id}
      key={item.id}
      selected={selectedResources.includes(item.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="bold">
          {item.title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge>{item.type}</Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>{item.sourceLang}</IndexTable.Cell>
      <IndexTable.Cell>{statusBadge(item.status)}</IndexTable.Cell>
      <IndexTable.Cell>
        <Button
          url={`/app/translate/${item.id}?locale=${localeMap[selectedLanguage] ?? "ar"}`}
          size="slim"
        >
          Translate
        </Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      backAction={{ content: "Home", url: "/app" }}
      title="Translate Content"
    >
      <TitleBar title="Translate Content" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card padding="0">
              <BlockStack gap="0">
                <Box padding="400">
                  <InlineStack gap="400" align="start" blockAlign="center">
                    <Select
                      label="Language"
                      labelInline
                      options={[
                        { label: "Arabic", value: "arabic" },
                        { label: "Hebrew", value: "hebrew" },
                        { label: "Farsi", value: "farsi" },
                      ]}
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                    />
                  </InlineStack>
                </Box>
                <Filters
                  queryValue={queryValue}
                  queryPlaceholder="Search content..."
                  filters={filters}
                  appliedFilters={appliedFilters}
                  onQueryChange={handleQueryChange}
                  onQueryClear={handleQueryClear}
                  onClearAll={handleFiltersClearAll}
                />
                <IndexTable
                  resourceName={resourceName}
                  itemCount={filteredItems.length}
                  selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  headings={[
                    { title: "Content" },
                    { title: "Type" },
                    { title: "Source Language" },
                    { title: "Status" },
                    { title: "Actions" },
                  ]}
                >
                  {rowMarkup}
                </IndexTable>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Translation Stats
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {selectedLanguage.charAt(0).toUpperCase() +
                    selectedLanguage.slice(1)}
                </Text>
                {currentStats && (
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Translated
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {currentStats.translated} / {currentStats.total}
                      </Text>
                    </InlineStack>
                    <ProgressBar
                      progress={currentStats.coverage}
                      size="small"
                      tone={
                        currentStats.coverage >= 75
                          ? "success"
                          : currentStats.coverage >= 50
                            ? "highlight"
                            : "critical"
                      }
                    />
                    <Text as="p" variant="headingLg">
                      {currentStats.coverage}% Coverage
                    </Text>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Translation Memory
                </Text>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Total Entries
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    {tmStats.totalEntries.toLocaleString()}
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Language Pairs
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    {tmStats.languagePairs.length}
                  </Text>
                </InlineStack>
                {tmStats.languagePairs.length > 0 && (
                  <BlockStack gap="100">
                    {tmStats.languagePairs.map((pair) => (
                      <InlineStack
                        key={`${pair.sourceLocale}-${pair.targetLocale}`}
                        align="space-between"
                      >
                        <Text as="span" variant="bodySm" tone="subdued">
                          {pair.sourceLocale} → {pair.targetLocale}
                        </Text>
                        <Badge>{String(pair.count)}</Badge>
                      </InlineStack>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
