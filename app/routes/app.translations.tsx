import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  Select,
  Filters,
  ChoiceList,
  ProgressBar,
  Button,
  Box,
  Badge,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { TranslationList } from "../components/translations/TranslationList";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return json({
    shop: session.shop,
    items: [
      { id: "1", title: "Premium Leather Handbag", type: "Product", sourceLang: "English", status: "Translated", lastUpdated: "2 hours ago" },
      { id: "2", title: "Silk Embroidered Scarf", type: "Product", sourceLang: "English", status: "Partial", lastUpdated: "1 day ago" },
      { id: "3", title: "Summer Collection 2026", type: "Collection", sourceLang: "English", status: "Translated", lastUpdated: "3 days ago" },
      { id: "4", title: "Cashmere Wool Cardigan", type: "Product", sourceLang: "English", status: "Untranslated", lastUpdated: undefined },
      { id: "5", title: "Shipping & Returns", type: "Page", sourceLang: "English", status: "Translated", lastUpdated: "1 week ago" },
      { id: "6", title: "Artisan Jewelry Box", type: "Product", sourceLang: "English", status: "Untranslated", lastUpdated: undefined },
      { id: "7", title: "Style Tips & Trends", type: "Blog", sourceLang: "English", status: "Partial", lastUpdated: "2 days ago" },
      { id: "8", title: "Winter Essentials", type: "Collection", sourceLang: "English", status: "Untranslated", lastUpdated: undefined },
      { id: "9", title: "About Us", type: "Page", sourceLang: "English", status: "Translated", lastUpdated: "5 days ago" },
      { id: "10", title: "Linen Summer Dress", type: "Product", sourceLang: "English", status: "Partial", lastUpdated: "4 hours ago" },
    ],
    languageStats: {
      ar: { name: "Arabic", nativeName: "العربية", translated: 312, total: 400, coverage: 78 },
      he: { name: "Hebrew", nativeName: "עברית", translated: 180, total: 400, coverage: 45 },
      fa: { name: "Farsi", nativeName: "فارسی", translated: 92, total: 400, coverage: 23 },
      fr: { name: "French", nativeName: "Français", translated: 368, total: 400, coverage: 92 },
    },
    untranslatedCount: 3,
    partialCount: 3,
  });
};

export default function TranslationsPage() {
  const { items, languageStats, untranslatedCount, partialCount } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [queryValue, setQueryValue] = useState("");

  const handleLanguageChange = useCallback((value: string) => setSelectedLanguage(value), []);
  const handleTypeFilterChange = useCallback((value: string[]) => setTypeFilter(value), []);
  const handleStatusFilterChange = useCallback((value: string[]) => setStatusFilter(value), []);
  const handleQueryChange = useCallback((value: string) => setQueryValue(value), []);
  const handleQueryClear = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    setTypeFilter([]);
    setStatusFilter([]);
    setQueryValue("");
  }, []);

  const filters = [
    {
      key: "type",
      label: "Resource type",
      filter: (
        <ChoiceList
          title="Resource type"
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

  const currentStats = languageStats[selectedLanguage as keyof typeof languageStats];

  const coverageTone = (coverage: number) => {
    if (coverage >= 75) return "success";
    if (coverage >= 50) return "highlight" as const;
    return "critical" as const;
  };

  return (
    <Page
      backAction={{ content: "Home", url: "/app" }}
      title="Translation Management"
    >
      <TitleBar title="Translation Management">
        <button variant="primary" onClick={() => navigate("/app/translate")}>
          Translate Content
        </button>
      </TitleBar>
      <BlockStack gap="500">
        {(untranslatedCount > 0 || partialCount > 0) && (
          <Banner tone="warning" title="Translation attention needed">
            <Text as="p" variant="bodyMd">
              {untranslatedCount} items untranslated, {partialCount} items partially translated.
            </Text>
          </Banner>
        )}

        <InlineGrid columns={4} gap="400">
          {Object.entries(languageStats).map(([code, lang]) => (
            <Card key={code}>
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" tone="subdued">
                  {lang.name} ({lang.nativeName})
                </Text>
                <Text as="p" variant="headingLg">
                  {lang.coverage}%
                </Text>
                <ProgressBar
                  progress={lang.coverage}
                  size="small"
                  tone={lang.coverage >= 75 ? "primary" : lang.coverage >= 50 ? "primary" : "critical"}
                />
                <Text as="p" variant="bodySm" tone="subdued">
                  {lang.translated} / {lang.total} items
                </Text>
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>

        <Layout>
          <Layout.Section>
            <Card padding="0">
              <BlockStack gap="0">
                <Box padding="400">
                  <InlineStack gap="400" align="space-between" blockAlign="center">
                    <Select
                      label="Language"
                      labelInline
                      options={Object.entries(languageStats).map(([code, lang]) => ({
                        label: `${lang.name} (${lang.nativeName})`,
                        value: code,
                      }))}
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                    />
                    <Button variant="secondary" size="slim">
                      Export translations
                    </Button>
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
                <TranslationList
                  items={filteredItems}
                  onTranslate={(id) => navigate(`/app/translate?item=${id}&lang=${selectedLanguage}`)}
                  onBulkTranslate={(ids) => {
                    // Bulk translate selected items
                    console.log("Bulk translate:", ids);
                  }}
                />
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Language Coverage</Text>
                {currentStats && (
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">Translated</Text>
                      <Text as="span" variant="bodyMd" fontWeight="bold">
                        {currentStats.translated} / {currentStats.total}
                      </Text>
                    </InlineStack>
                    <ProgressBar
                      progress={currentStats.coverage}
                      size="small"
                      tone={coverageTone(currentStats.coverage)}
                    />
                    <Text as="p" variant="headingLg">
                      {currentStats.coverage}% Coverage
                    </Text>
                    <Badge
                      tone={
                        currentStats.coverage >= 75
                          ? "success"
                          : currentStats.coverage >= 50
                            ? "warning"
                            : "critical"
                      }
                    >
                      {currentStats.coverage >= 75
                        ? "Good"
                        : currentStats.coverage >= 50
                          ? "Needs work"
                          : "Critical"}
                    </Badge>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Quick Actions</Text>
                <Button url="/app/translate" fullWidth>
                  Open Translation Editor
                </Button>
                <Button url="/app/glossary" fullWidth variant="secondary">
                  Manage Glossary
                </Button>
                <Button url="/app/settings" fullWidth variant="secondary">
                  Language Settings
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
