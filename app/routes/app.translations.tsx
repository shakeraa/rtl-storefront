import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useRouteError, isRouteErrorResponse } from "@remix-run/react";
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
import db from "../db.server";
import { TranslationList } from "../components/translations/TranslationList";

const LOCALE_NAMES: Record<string, { name: string; nativeName: string }> = {
  ar: { name: "Arabic", nativeName: "العربية" },
  he: { name: "Hebrew", nativeName: "עברית" },
  fa: { name: "Farsi", nativeName: "فارسی" },
  fr: { name: "French", nativeName: "Français" },
  tr: { name: "Turkish", nativeName: "Türkçe" },
  ur: { name: "Urdu", nativeName: "اردو" },
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Query translation cache for language stats
  let languageStats: Record<string, { name: string; nativeName: string; translated: number; total: number; coverage: number }> = {};
  let totalDistinctSources = 0;
  try {
    const groups = await db.translationCache.groupBy({
      by: ["targetLocale"],
      _count: true,
    });
    const distinctSources = await db.translationCache.groupBy({
      by: ["sourceText"],
      _count: true,
    });
    totalDistinctSources = distinctSources.length;

    for (const g of groups) {
      const code = g.targetLocale;
      const translated = g._count;
      const total = totalDistinctSources || translated;
      languageStats[code] = {
        name: LOCALE_NAMES[code]?.name ?? code,
        nativeName: LOCALE_NAMES[code]?.nativeName ?? code,
        translated,
        total,
        coverage: total > 0 ? Math.round((translated / total) * 100) : 0,
      };
    }
  } catch {
    // Fall back to empty stats
  }

  // Build items from translation cache grouped by context (resource key)
  let items: Array<{ id: string; title: string; type: string; sourceLang: string; status: string; lastUpdated: string | undefined }> = [];
  try {
    const cacheEntries = await db.translationCache.findMany({
      select: {
        id: true,
        sourceText: true,
        context: true,
        targetLocale: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const seen = new Map<string, typeof cacheEntries[0]>();
    for (const entry of cacheEntries) {
      const key = entry.context ?? entry.sourceText;
      if (!seen.has(key)) {
        seen.set(key, entry);
      }
    }

    let idx = 0;
    for (const [, entry] of seen) {
      idx++;
      let type = "Content";
      if (entry.context) {
        if (entry.context.toLowerCase().includes("product")) type = "Product";
        else if (entry.context.toLowerCase().includes("collection")) type = "Collection";
        else if (entry.context.toLowerCase().includes("page")) type = "Page";
        else if (entry.context.toLowerCase().includes("blog") || entry.context.toLowerCase().includes("article")) type = "Blog";
      }

      const ago = getTimeAgo(entry.updatedAt);
      items.push({
        id: String(idx),
        title: entry.sourceText.substring(0, 60) + (entry.sourceText.length > 60 ? "..." : ""),
        type,
        sourceLang: "English",
        status: "Translated",
        lastUpdated: ago,
      });
    }
  } catch {
    items = [];
  }

  const untranslatedCount = items.filter((i) => i.status === "Untranslated").length;
  const partialCount = items.filter((i) => i.status === "Partial").length;

  return json({
    shop: session.shop,
    items,
    languageStats,
    untranslatedCount,
    partialCount,
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
