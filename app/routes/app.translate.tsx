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
import { getStats as getTMStats } from "../services/translation-memory/store";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Fetch translation memory stats from the TM store service
  let tmStats: { totalEntries: number; languagePairs: Array<{ sourceLocale: string; targetLocale: string; count: number }> } = {
    totalEntries: 0,
    languagePairs: [],
  };
  try {
    tmStats = await getTMStats(session.shop);
  } catch {
    // TM stats unavailable (e.g. DB not connected) — fall back to defaults
  }

  return json({
    items: [
      { id: "1", title: "Premium Leather Handbag", type: "Product", sourceLang: "English", status: "Translated" },
      { id: "2", title: "Silk Embroidered Scarf", type: "Product", sourceLang: "English", status: "Partial" },
      { id: "3", title: "Summer Collection 2026", type: "Collection", sourceLang: "English", status: "Translated" },
      { id: "4", title: "Cashmere Wool Cardigan", type: "Product", sourceLang: "English", status: "Untranslated" },
      { id: "5", title: "Shipping & Returns", type: "Page", sourceLang: "English", status: "Translated" },
      { id: "6", title: "Artisan Jewelry Box", type: "Product", sourceLang: "English", status: "Untranslated" },
      { id: "7", title: "Style Tips & Trends", type: "Blog", sourceLang: "English", status: "Partial" },
      { id: "8", title: "Winter Essentials", type: "Collection", sourceLang: "English", status: "Untranslated" },
    ],
    languageStats: {
      arabic: { translated: 312, total: 400, coverage: 78 },
      hebrew: { translated: 180, total: 400, coverage: 45 },
      farsi: { translated: 92, total: 400, coverage: 23 },
    },
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
        <Button size="slim">Translate</Button>
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
