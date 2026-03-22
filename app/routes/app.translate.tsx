import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, Text,
  IndexTable, Badge, Button, Select, useIndexResourceState,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(`#graphql
    query getProducts {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            productType
            status
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `);

  const data = await response.json();

  const products = (data.data?.products?.edges ?? []).map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    type: edge.node.productType || "Product",
    resourceType: "product" as const,
    status: "untranslated" as const,
  }));

  const collections = (data.data?.collections?.edges ?? []).map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title,
    type: "Collection",
    resourceType: "collection" as const,
    status: "untranslated" as const,
  }));

  return json({ items: [...products, ...collections], shop: session.shop });
};

export default function TranslatePage() {
  const { items } = useLoaderData<typeof loader>();
  const [locale, setLocale] = useState("ar");
  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(items);

  const statusBadge = (status: string) => {
    if (status === "translated") return <Badge tone="success">Translated</Badge>;
    if (status === "partial") return <Badge tone="warning">Partial</Badge>;
    return <Badge tone="critical">Untranslated</Badge>;
  };

  const rowMarkup = items.map((item, index) => (
    <IndexTable.Row id={item.id} key={item.id} position={index} selected={selectedResources.includes(item.id)}>
      <IndexTable.Cell><Text as="span" variant="bodyMd" fontWeight="bold">{item.title}</Text></IndexTable.Cell>
      <IndexTable.Cell>{item.type}</IndexTable.Cell>
      <IndexTable.Cell>{statusBadge(item.status)}</IndexTable.Cell>
      <IndexTable.Cell><Button size="slim">Translate</Button></IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page>
      <TitleBar title="Translate Content" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack gap="300" align="start">
                  <Select label="Target Language" labelInline options={[
                    { label: "Arabic (العربية)", value: "ar" },
                    { label: "Hebrew (עברית)", value: "he" },
                    { label: "Farsi (فارسی)", value: "fa" },
                    { label: "French (Français)", value: "fr" },
                  ]} value={locale} onChange={setLocale} />
                </InlineStack>
                <IndexTable
                  resourceName={{ singular: "item", plural: "items" }}
                  itemCount={items.length}
                  selectedItemsCount={allResourcesSelected ? "All" : selectedResources.length}
                  onSelectionChange={handleSelectionChange}
                  headings={[
                    { title: "Content" },
                    { title: "Type" },
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
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Translation Stats</Text>
                <Text as="p" variant="bodyMd">{items.length} items found</Text>
                <Text as="p" variant="bodyMd">Target: {locale === "ar" ? "Arabic" : locale === "he" ? "Hebrew" : locale === "fa" ? "Farsi" : "French"}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
