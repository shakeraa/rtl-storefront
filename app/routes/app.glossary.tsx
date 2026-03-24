import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, InlineStack, Text,
  IndexTable, Badge, Button, TextField, Checkbox, Tabs,
  Modal, FormLayout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import { getAllTerms, getNeverTranslateTerms, addTerm, deleteTerm } from "../services/translation-memory/glossary";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, shop } = await authenticateWithTenant(request);

  const glossaryTerms = await getAllTerms(shop);
  const neverTranslateTerms = await getNeverTranslateTerms(shop, "en");

  return json({ glossaryTerms, neverTranslateTerms, shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, shop } = await authenticateWithTenant(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add") {
    await addTerm(shop, {
      sourceLocale: String(formData.get("sourceLocale") || "en"),
      targetLocale: String(formData.get("targetLocale") || "ar"),
      sourceTerm: String(formData.get("sourceTerm")),
      translatedTerm: String(formData.get("translatedTerm") || ""),
      neverTranslate: formData.get("neverTranslate") === "true",
      caseSensitive: formData.get("caseSensitive") === "true",
    });
  } else if (intent === "delete") {
    await deleteTerm(String(formData.get("id")));
  }

  return json({ ok: true });
};

export default function GlossaryPage() {
  const { glossaryTerms, neverTranslateTerms } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newTerm, setNewTerm] = useState({ sourceTerm: "", translatedTerm: "", targetLocale: "ar", neverTranslate: false, caseSensitive: false });

  const handleAdd = () => {
    fetcher.submit(
      { intent: "add", ...newTerm, neverTranslate: String(newTerm.neverTranslate), caseSensitive: String(newTerm.caseSensitive) },
      { method: "POST" },
    );
    setShowModal(false);
    setNewTerm({ sourceTerm: "", translatedTerm: "", targetLocale: "ar", neverTranslate: false, caseSensitive: false });
  };

  const handleDelete = (id: string) => {
    fetcher.submit({ intent: "delete", id }, { method: "POST" });
  };

  const tabs = [
    { id: "glossary", content: `Glossary (${glossaryTerms.length})` },
    { id: "never-translate", content: `Never-Translate (${neverTranslateTerms.length})` },
  ];

  return (
    <Page>
      <TitleBar title="Glossary & Never-Translate Terms">
        <button variant="primary" onClick={() => setShowModal(true)}>Add Term</button>
      </TitleBar>
      <BlockStack gap="500">
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
          {selectedTab === 0 ? (
            <Card>
              {glossaryTerms.length === 0 ? (
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">No glossary terms yet. Add terms to ensure consistent translations.</Text>
                  <Button onClick={() => setShowModal(true)}>Add First Term</Button>
                </BlockStack>
              ) : (
                <IndexTable
                  resourceName={{ singular: "term", plural: "terms" }}
                  itemCount={glossaryTerms.length}
                  headings={[{ title: "Source" }, { title: "Translation" }, { title: "Language" }, { title: "Actions" }]}
                  selectable={false}
                >
                  {glossaryTerms.map((term: any, i: number) => (
                    <IndexTable.Row id={term.id} key={term.id} position={i}>
                      <IndexTable.Cell><Text as="span" fontWeight="bold">{term.sourceTerm}</Text></IndexTable.Cell>
                      <IndexTable.Cell>{term.translatedTerm}</IndexTable.Cell>
                      <IndexTable.Cell><Badge>{term.targetLocale}</Badge></IndexTable.Cell>
                      <IndexTable.Cell><Button tone="critical" size="slim" onClick={() => handleDelete(term.id)}>Delete</Button></IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
            </Card>
          ) : (
            <Card>
              {neverTranslateTerms.length === 0 ? (
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">No never-translate terms. Add SKUs, brand names, and technical terms that should stay in their original language.</Text>
                  <Button onClick={() => { setNewTerm({ ...newTerm, neverTranslate: true }); setShowModal(true); }}>Add Never-Translate Term</Button>
                </BlockStack>
              ) : (
                <IndexTable
                  resourceName={{ singular: "term", plural: "terms" }}
                  itemCount={neverTranslateTerms.length}
                  headings={[{ title: "Term" }, { title: "Case Sensitive" }, { title: "Actions" }]}
                  selectable={false}
                >
                  {neverTranslateTerms.map((term: any, i: number) => (
                    <IndexTable.Row id={term.id} key={term.id} position={i}>
                      <IndexTable.Cell><Text as="span" fontWeight="bold">{term.sourceTerm}</Text></IndexTable.Cell>
                      <IndexTable.Cell><Badge tone={term.caseSensitive ? "warning" : "info"}>{term.caseSensitive ? "Yes" : "No"}</Badge></IndexTable.Cell>
                      <IndexTable.Cell><Button tone="critical" size="slim" onClick={() => handleDelete(term.id)}>Delete</Button></IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
            </Card>
          )}
        </Tabs>
      </BlockStack>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Term" primaryAction={{ content: "Add", onAction: handleAdd }} secondaryActions={[{ content: "Cancel", onAction: () => setShowModal(false) }]}>
        <Modal.Section>
          <FormLayout>
            <TextField label="Source Term" value={newTerm.sourceTerm} onChange={(v) => setNewTerm({ ...newTerm, sourceTerm: v })} autoComplete="off" />
            <TextField label="Translation" value={newTerm.translatedTerm} onChange={(v) => setNewTerm({ ...newTerm, translatedTerm: v })} autoComplete="off" helpText={newTerm.neverTranslate ? "Leave empty for never-translate terms" : ""} />
            <TextField label="Target Locale" value={newTerm.targetLocale} onChange={(v) => setNewTerm({ ...newTerm, targetLocale: v })} autoComplete="off" />
            <Checkbox label="Never translate this term" checked={newTerm.neverTranslate} onChange={(v) => setNewTerm({ ...newTerm, neverTranslate: v })} />
            <Checkbox label="Case sensitive" checked={newTerm.caseSensitive} onChange={(v) => setNewTerm({ ...newTerm, caseSensitive: v })} />
          </FormLayout>
        </Modal.Section>
      </Modal>
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
