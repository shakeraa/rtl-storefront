import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, InlineStack, Text, TextField, Button, Badge, Select, Banner, Spinner } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { createTranslationEngine } from "../services/translation/engine";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const resourceId = params.resourceId!;
  const url = new URL(request.url);
  const targetLocale = url.searchParams.get("locale") || "ar";

  const response = await admin.graphql(`#graphql
    query getTranslatableResource($resourceId: ID!) {
      translatableResource(resourceId: $resourceId) {
        resourceId
        translatableContent { key value digest locale }
        translations(locale: "${targetLocale}") { key value }
      }
    }
  `, { variables: { resourceId: `gid://shopify/OnlineStoreArticle/${resourceId}` } });

  const data = await response.json();
  const resource = data.data?.translatableResource;
  const sourceFields = resource?.translatableContent ?? [];
  const translations = resource?.translations ?? [];
  const translationMap = Object.fromEntries(translations.map((t: any) => [t.key, t.value]));

  const fields = sourceFields.map((f: any) => ({
    key: f.key, sourceText: f.value ?? "", digest: f.digest,
    translatedText: translationMap[f.key] ?? "",
    status: translationMap[f.key] ? "translated" : "untranslated",
  }));

  return json({ resourceId, targetLocale, fields, shop: session.shop });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const resourceId = params.resourceId!;
  const formData = await request.formData();
  const intent = formData.get("intent");
  const targetLocale = formData.get("locale") as string;

  if (intent === "translate_all") {
    const engine = createTranslationEngine();
    const fieldsJson = formData.get("fields") as string;
    const fields = JSON.parse(fieldsJson);
    const translated = [];

    for (const field of fields) {
      if (field.status === "translated" || !field.sourceText) continue;
      try {
        const result = await engine.translate({ text: field.sourceText, sourceLocale: "en", targetLocale, context: "blog article" });
        translated.push({ key: field.key, value: result.translatedText, locale: targetLocale, translatableContentDigest: field.digest });
      } catch (e) { console.error(`Translation failed for ${field.key}:`, e); }
    }

    if (translated.length > 0) {
      await admin.graphql(`#graphql
        mutation translationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $resourceId, translations: $translations) {
            translations { key value locale }
            userErrors { field message }
          }
        }
      `, { variables: { resourceId: `gid://shopify/OnlineStoreArticle/${resourceId}`, translations: translated } });
    }

    return json({ success: true, translated: translated.length });
  }

  if (intent === "save") {
    const key = formData.get("key") as string;
    const value = formData.get("value") as string;
    const digest = formData.get("digest") as string;

    await admin.graphql(`#graphql
      mutation translationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $resourceId, translations: $translations) {
          translations { key value locale }
          userErrors { field message }
        }
      }
    `, { variables: { resourceId: `gid://shopify/OnlineStoreArticle/${resourceId}`, translations: [{ key, value, locale: targetLocale, translatableContentDigest: digest }] } });

    return json({ success: true });
  }

  return json({ error: "Unknown intent" }, { status: 400 });
};

const FIELD_LABELS: Record<string, string> = {
  title: "Title", body_html: "Body", summary_html: "Excerpt", handle: "URL Handle",
  meta_title: "SEO Title", meta_description: "SEO Description", tags: "Tags",
};

export default function BlogTranslatePage() {
  const { resourceId, targetLocale, fields } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const isTranslating = fetcher.state !== "idle";

  return (
    <Page backAction={{ url: "/app/translate" }}>
      <TitleBar title="Translate Blog Article">
        <button variant="primary" onClick={() => {
          const formData = new FormData();
          formData.set("intent", "translate_all");
          formData.set("locale", targetLocale);
          formData.set("fields", JSON.stringify(fields));
          fetcher.submit(formData, { method: "POST" });
        }}>Translate All</button>
      </TitleBar>
      <BlockStack gap="500">
        {isTranslating && <Banner tone="info"><InlineStack gap="200"><Spinner size="small" /><Text as="span" variant="bodyMd">Translating with AI...</Text></InlineStack></Banner>}
        <Layout>
          <Layout.Section>
            {fields.map((field: any) => (
              <Card key={field.key}>
                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="h3" variant="headingSm">{FIELD_LABELS[field.key] ?? field.key}</Text>
                    <Badge tone={field.status === "translated" ? "success" : "critical"}>{field.status}</Badge>
                  </InlineStack>
                  <TextField label="Source (English)" value={field.sourceText} disabled autoComplete="off" multiline={field.key === "body_html" ? 4 : 1} />
                  <TextField label={`Translation (${targetLocale})`} value={edits[field.key] ?? field.translatedText} onChange={(v) => setEdits({ ...edits, [field.key]: v })} autoComplete="off" multiline={field.key === "body_html" ? 4 : 1} />
                  {edits[field.key] && edits[field.key] !== field.translatedText && (
                    <Button size="slim" onClick={() => {
                      const formData = new FormData();
                      formData.set("intent", "save");
                      formData.set("locale", targetLocale);
                      formData.set("key", field.key);
                      formData.set("value", edits[field.key]);
                      formData.set("digest", field.digest);
                      fetcher.submit(formData, { method: "POST" });
                    }}>Save</Button>
                  )}
                </BlockStack>
              </Card>
            ))}
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Blog Article</Text>
                <Text as="p" variant="bodyMd">ID: {resourceId}</Text>
                <Text as="p" variant="bodyMd">Target: {targetLocale}</Text>
                <Text as="p" variant="bodyMd">Fields: {fields.length}</Text>
                <Text as="p" variant="bodyMd">Translated: {fields.filter((f: any) => f.status === "translated").length}</Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
