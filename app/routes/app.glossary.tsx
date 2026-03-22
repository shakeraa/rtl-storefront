import { useState, useCallback } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  IndexTable,
  Badge,
  Button,
  Tabs,
  InlineStack,
  useIndexResourceState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    glossaryTerms: [
      { id: "g1", source: "Abaya", translation: "\u0639\u0628\u0627\u064A\u0629", language: "Arabic", category: "Fashion" },
      { id: "g2", source: "Hijab", translation: "\u062D\u062C\u0627\u0628", language: "Arabic", category: "Fashion" },
      { id: "g3", source: "Kaftan", translation: "\u0642\u0641\u0637\u0627\u0646", language: "Arabic", category: "Fashion" },
      { id: "g4", source: "Add to Cart", translation: "\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629", language: "Arabic", category: "UI" },
      { id: "g5", source: "Checkout", translation: "\u05E7\u05D5\u05E4\u05D4", language: "Hebrew", category: "UI" },
      { id: "g6", source: "Free Shipping", translation: "\u0634\u062D\u0646 \u0645\u062C\u0627\u0646\u064A", language: "Arabic", category: "Shipping" },
    ],
    neverTranslateTerms: [
      { id: "nt1", term: "SKU-12345", type: "SKU", caseSensitive: true },
      { id: "nt2", term: "GUCCI", type: "Brand", caseSensitive: true },
      { id: "nt3", term: "pH", type: "Technical", caseSensitive: true },
      { id: "nt4", term: "COVID-19", type: "Technical", caseSensitive: false },
    ],
  });
};

function categoryBadge(category: string) {
  switch (category) {
    case "Fashion":
      return <Badge tone="info">Fashion</Badge>;
    case "UI":
      return <Badge tone="success">UI</Badge>;
    case "Shipping":
      return <Badge tone="warning">Shipping</Badge>;
    default:
      return <Badge>{category}</Badge>;
  }
}

function typeBadge(type: string) {
  switch (type) {
    case "SKU":
      return <Badge tone="info">SKU</Badge>;
    case "Brand":
      return <Badge tone="success">Brand</Badge>;
    case "Technical":
      return <Badge tone="warning">Technical</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
}

export default function Glossary() {
  const { glossaryTerms, neverTranslateTerms } =
    useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelectedTab(selectedTabIndex),
    [],
  );

  const glossaryResource = useIndexResourceState(glossaryTerms);
  const neverTranslateResource = useIndexResourceState(neverTranslateTerms);

  const tabs = [
    { id: "glossary", content: "Glossary", panelID: "glossary-panel" },
    {
      id: "never-translate",
      content: "Never-Translate",
      panelID: "never-translate-panel",
    },
  ];

  const glossaryRowMarkup = glossaryTerms.map((term, index) => (
    <IndexTable.Row
      id={term.id}
      key={term.id}
      selected={glossaryResource.selectedResources.includes(term.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="bold">
          {term.source}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{term.translation}</IndexTable.Cell>
      <IndexTable.Cell>{term.language}</IndexTable.Cell>
      <IndexTable.Cell>{categoryBadge(term.category)}</IndexTable.Cell>
      <IndexTable.Cell>
        <InlineStack gap="200">
          <Button size="slim">Edit</Button>
          <Button size="slim" tone="critical">
            Delete
          </Button>
        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  const neverTranslateRowMarkup = neverTranslateTerms.map((term, index) => (
    <IndexTable.Row
      id={term.id}
      key={term.id}
      selected={neverTranslateResource.selectedResources.includes(term.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd" fontWeight="bold">
          {term.term}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{typeBadge(term.type)}</IndexTable.Cell>
      <IndexTable.Cell>
        {term.caseSensitive ? (
          <Badge tone="info">Case Sensitive</Badge>
        ) : (
          <Badge>Case Insensitive</Badge>
        )}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <InlineStack gap="200">
          <Button size="slim">Edit</Button>
          <Button size="slim" tone="critical">
            Delete
          </Button>
        </InlineStack>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      backAction={{ content: "Home", url: "/app" }}
      title="Glossary & Never-Translate Terms"
    >
      <TitleBar title="Glossary & Never-Translate Terms">
        <button variant="primary">Add Term</button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card padding="0">
              <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                {selectedTab === 0 ? (
                  <IndexTable
                    resourceName={{
                      singular: "glossary term",
                      plural: "glossary terms",
                    }}
                    itemCount={glossaryTerms.length}
                    selectedItemsCount={
                      glossaryResource.allResourcesSelected
                        ? "All"
                        : glossaryResource.selectedResources.length
                    }
                    onSelectionChange={glossaryResource.handleSelectionChange}
                    headings={[
                      { title: "Source Term" },
                      { title: "Translation" },
                      { title: "Language" },
                      { title: "Category" },
                      { title: "Actions" },
                    ]}
                  >
                    {glossaryRowMarkup}
                  </IndexTable>
                ) : (
                  <IndexTable
                    resourceName={{
                      singular: "term",
                      plural: "terms",
                    }}
                    itemCount={neverTranslateTerms.length}
                    selectedItemsCount={
                      neverTranslateResource.allResourcesSelected
                        ? "All"
                        : neverTranslateResource.selectedResources.length
                    }
                    onSelectionChange={
                      neverTranslateResource.handleSelectionChange
                    }
                    headings={[
                      { title: "Term" },
                      { title: "Type" },
                      { title: "Case Sensitive" },
                      { title: "Actions" },
                    ]}
                  >
                    {neverTranslateRowMarkup}
                  </IndexTable>
                )}
              </Tabs>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
