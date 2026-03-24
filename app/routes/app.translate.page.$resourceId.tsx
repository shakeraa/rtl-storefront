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
  TextField,
  Badge,
  Button,
  Box,
  Select,
  Banner,
  Spinner,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import { createTranslationEngine } from "../services/translation/engine";

// ---------------------------------------------------------------------------
// Locale helpers
// ---------------------------------------------------------------------------

const LOCALE_OPTIONS = [
  { label: "Arabic", value: "ar" },
  { label: "Hebrew", value: "he" },
  { label: "Farsi", value: "fa" },
  { label: "Urdu", value: "ur" },
];

const LOCALE_LABELS: Record<string, string> = {
  ar: "Arabic",
  he: "Hebrew",
  fa: "Farsi",
  ur: "Urdu",
};

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  body: "Body",
  body_html: "Body (HTML)",
  handle: "URL Handle",
  meta_title: "SEO Title",
  meta_description: "SEO Description",
};

const GID_PREFIX = "gid://shopify/OnlineStorePage/";

// ---------------------------------------------------------------------------
// Loader — fetch translatable content and existing translations from Shopify
// ---------------------------------------------------------------------------

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticateWithTenant(request);
  const resourceId = params.resourceId;

  if (!resourceId) {
    throw new Response("Resource ID is required", { status: 400 });
  }

  const url = new URL(request.url);
  const targetLocale = url.searchParams.get("locale") || "ar";
  const shopifyResourceId = `${GID_PREFIX}${resourceId}`;

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
          outdated
        }
      }
    }`,
    {
      variables: {
        resourceId: shopifyResourceId,
        locale: targetLocale,
      },
    },
  );

  const data = await response.json();
  const resource = data?.data?.translatableResource;

  if (!resource) {
    throw new Response("Page not found", { status: 404 });
  }

  const existingTranslations: Record<string, { value: string; outdated: boolean }> = {};
  for (const t of resource.translations ?? []) {
    existingTranslations[t.key] = { value: t.value, outdated: t.outdated };
  }

  const sourceFields = (resource.translatableContent ?? [])
    .filter((field: { key: string; value: string | null }) => field.value && field.value.trim().length > 0)
    .map((field: { key: string; value: string; digest: string; locale: string }) => ({
      key: field.key,
      sourceValue: field.value,
      digest: field.digest,
      sourceLocale: field.locale,
      translatedValue: existingTranslations[field.key]?.value ?? "",
      outdated: existingTranslations[field.key]?.outdated ?? false,
      status: existingTranslations[field.key]
        ? existingTranslations[field.key].outdated
          ? "outdated"
          : "translated"
        : "untranslated",
    }));

  const pageTitle = sourceFields.find(
    (f: { key: string }) => f.key === "title",
  )?.sourceValue ?? `Page ${resourceId}`;

  return json({
    resourceId,
    shopifyResourceId,
    targetLocale,
    pageTitle,
    sourceFields,
  });
};

// ---------------------------------------------------------------------------
// Action — translate fields via AI and/or save to Shopify
// ---------------------------------------------------------------------------

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin } = await authenticateWithTenant(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const targetLocale = formData.get("locale") as string;
  const resourceId = params.resourceId;

  if (!resourceId) {
    return json({ error: "Resource ID is required" }, { status: 400 });
  }

  const shopifyResourceId = `${GID_PREFIX}${resourceId}`;

  // ----- Intent: translate_all -----
  if (intent === "translate_all") {
    const fieldsJson = formData.get("fields") as string;
    if (!fieldsJson) {
      return json({ error: "No fields provided" }, { status: 400 });
    }

    let fields: Array<{
      key: string;
      sourceValue: string;
      digest: string;
      sourceLocale: string;
      translatedValue: string;
    }>;
    try {
      fields = JSON.parse(fieldsJson);
    } catch {
      return json({ error: "Invalid data format" }, { status: 400 });
    }

    const engine = createTranslationEngine();
    const translatedFields: Array<{
      key: string;
      value: string;
      locale: string;
      translatableContentDigest: string;
    }> = [];
    const errors: Array<{ key: string; error: string }> = [];

    for (const field of fields) {
      if (field.translatedValue && field.translatedValue.trim().length > 0) {
        continue;
      }
      if (!field.sourceValue || field.sourceValue.trim().length === 0) {
        continue;
      }

      try {
        const result = await engine.translate({
          text: field.sourceValue,
          sourceLocale: field.sourceLocale || "en",
          targetLocale,
          context: `Shopify page field: ${field.key}`,
          format: field.key === "body_html" || field.key === "body" ? "html" : "text",
        });

        translatedFields.push({
          key: field.key,
          value: result.translatedText,
          locale: targetLocale,
          translatableContentDigest: field.digest,
        });
      } catch (err) {
        errors.push({
          key: field.key,
          error: err instanceof Error ? err.message : "Translation failed",
        });
      }
    }

    if (translatedFields.length === 0) {
      return json({
        success: false,
        error: errors.length > 0
          ? "All translations failed"
          : "No fields needed translation",
        errors,
        translatedFields: [],
      });
    }

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
          resourceId: shopifyResourceId,
          translations: translatedFields,
        },
      },
    );

    const saveData = await saveResponse.json();
    const result = saveData?.data?.translationsRegister;

    if (result?.userErrors?.length > 0) {
      return json({
        success: false,
        error: "Some translations failed to save to Shopify",
        userErrors: result.userErrors,
        translatedFields: translatedFields.map((f) => ({
          key: f.key,
          translatedValue: f.value,
        })),
        errors,
      });
    }

    return json({
      success: true,
      translatedFields: translatedFields.map((f) => ({
        key: f.key,
        translatedValue: f.value,
      })),
      errors,
      savedCount: translatedFields.length,
    });
  }

  // ----- Intent: translate_field -----
  if (intent === "translate_field") {
    const fieldKey = formData.get("fieldKey") as string;
    const sourceValue = formData.get("sourceValue") as string;
    const sourceLocale = formData.get("sourceLocale") as string || "en";
    const digest = formData.get("digest") as string;

    if (!fieldKey || !sourceValue || !digest) {
      return json({ error: "Missing field data" }, { status: 400 });
    }

    const engine = createTranslationEngine();

    try {
      const result = await engine.translate({
        text: sourceValue,
        sourceLocale,
        targetLocale,
        context: `Shopify page field: ${fieldKey}`,
        format: fieldKey === "body_html" || fieldKey === "body" ? "html" : "text",
      });

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
            resourceId: shopifyResourceId,
            translations: [
              {
                key: fieldKey,
                value: result.translatedText,
                locale: targetLocale,
                translatableContentDigest: digest,
              },
            ],
          },
        },
      );

      const saveData = await saveResponse.json();
      const saveResult = saveData?.data?.translationsRegister;

      if (saveResult?.userErrors?.length > 0) {
        return json({
          success: false,
          error: "Failed to save translation to Shopify",
          userErrors: saveResult.userErrors,
          fieldKey,
          translatedValue: result.translatedText,
        });
      }

      return json({
        success: true,
        fieldKey,
        translatedValue: result.translatedText,
        provider: result.provider,
        cached: result.cached,
      });
    } catch (err) {
      return json({
        success: false,
        fieldKey,
        error: err instanceof Error ? err.message : "Translation failed",
      });
    }
  }

  // ----- Intent: save -----
  if (intent === "save") {
    const translationsJson = formData.get("translations") as string;
    if (!translationsJson) {
      return json({ error: "No translations to save" }, { status: 400 });
    }

    let translations: Array<{
      key: string;
      value: string;
      digest: string;
    }>;
    try {
      translations = JSON.parse(translationsJson);
    } catch {
      return json({ error: "Invalid data format" }, { status: 400 });
    }

    const translationInputs = translations
      .filter((t) => t.value && t.value.trim().length > 0)
      .map((t) => ({
        key: t.key,
        value: t.value,
        locale: targetLocale,
        translatableContentDigest: t.digest,
      }));

    if (translationInputs.length === 0) {
      return json({ success: false, error: "No translations to save" });
    }

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
          resourceId: shopifyResourceId,
          translations: translationInputs,
        },
      },
    );

    const saveData = await saveResponse.json();
    const result = saveData?.data?.translationsRegister;

    if (result?.userErrors?.length > 0) {
      return json({
        success: false,
        error: "Failed to save translations",
        userErrors: result.userErrors,
      });
    }

    return json({
      success: true,
      savedCount: translationInputs.length,
    });
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

// ---------------------------------------------------------------------------
// UI Component
// ---------------------------------------------------------------------------

interface SourceField {
  key: string;
  sourceValue: string;
  digest: string;
  sourceLocale: string;
  translatedValue: string;
  outdated: boolean;
  status: "translated" | "outdated" | "untranslated";
}

function fieldStatusBadge(status: string) {
  switch (status) {
    case "translated":
      return <Badge tone="success">Translated</Badge>;
    case "outdated":
      return <Badge tone="warning">Outdated</Badge>;
    case "untranslated":
      return <Badge tone="critical">Untranslated</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function TranslatePage() {
  const { resourceId, pageTitle, targetLocale, sourceFields } =
    useLoaderData<typeof loader>();

  const translateAllFetcher = useFetcher<{
    success?: boolean;
    error?: string;
    translatedFields?: Array<{ key: string; translatedValue: string }>;
    savedCount?: number;
    errors?: Array<{ key: string; error: string }>;
  }>();
  const saveFetcher = useFetcher<{
    success?: boolean;
    error?: string;
    savedCount?: number;
  }>();

  const [locale, setLocale] = useState(targetLocale);
  const [editedTranslations, setEditedTranslations] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    for (const field of sourceFields) {
      initial[field.key] = field.translatedValue;
    }
    return initial;
  });

  const [translatingFields, setTranslatingFields] = useState<Set<string>>(
    new Set(),
  );

  const handleLocaleChange = useCallback((value: string) => {
    setLocale(value);
    window.location.href = `/app/translate/page/${resourceId}?locale=${value}`;
  }, [resourceId]);

  const handleTranslationChange = useCallback(
    (key: string, value: string) => {
      setEditedTranslations((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const applyTranslatedFields = useCallback(
    (translatedFields: Array<{ key: string; translatedValue: string }>) => {
      setEditedTranslations((prev) => {
        const next = { ...prev };
        for (const field of translatedFields) {
          next[field.key] = field.translatedValue;
        }
        return next;
      });
    },
    [],
  );

  if (
    translateAllFetcher.data?.success &&
    translateAllFetcher.data.translatedFields
  ) {
    const translatedKeys = translateAllFetcher.data.translatedFields.map(
      (f) => f.key,
    );
    const needsUpdate = translatedKeys.some(
      (key) => {
        const fetched = translateAllFetcher.data!.translatedFields!.find(
          (f) => f.key === key,
        );
        return fetched && editedTranslations[key] !== fetched.translatedValue;
      },
    );
    if (needsUpdate) {
      applyTranslatedFields(translateAllFetcher.data.translatedFields);
    }
  }

  const handleTranslateAll = useCallback(() => {
    const fieldsToTranslate = sourceFields
      .filter(
        (f: SourceField) =>
          f.status === "untranslated" || f.status === "outdated",
      )
      .map((f: SourceField) => ({
        key: f.key,
        sourceValue: f.sourceValue,
        digest: f.digest,
        sourceLocale: f.sourceLocale,
        translatedValue: editedTranslations[f.key] ?? "",
      }));

    if (fieldsToTranslate.length === 0) return;

    translateAllFetcher.submit(
      {
        intent: "translate_all",
        locale,
        fields: JSON.stringify(fieldsToTranslate),
      },
      { method: "POST" },
    );
  }, [sourceFields, editedTranslations, locale, translateAllFetcher]);

  const handleTranslateField = useCallback(
    (field: SourceField) => {
      setTranslatingFields((prev) => new Set(prev).add(field.key));

      const formData = new FormData();
      formData.set("intent", "translate_field");
      formData.set("locale", locale);
      formData.set("fieldKey", field.key);
      formData.set("sourceValue", field.sourceValue);
      formData.set("sourceLocale", field.sourceLocale);
      formData.set("digest", field.digest);

      fetch(`/app/translate/page/${resourceId}`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data: { success?: boolean; translatedValue?: string; fieldKey?: string }) => {
          if (data.success && data.translatedValue && data.fieldKey) {
            setEditedTranslations((prev) => ({
              ...prev,
              [data.fieldKey!]: data.translatedValue!,
            }));
          }
        })
        .finally(() => {
          setTranslatingFields((prev) => {
            const next = new Set(prev);
            next.delete(field.key);
            return next;
          });
        });
    },
    [locale, resourceId],
  );

  const handleSaveAll = useCallback(() => {
    const translations = sourceFields
      .filter((f: SourceField) => {
        const edited = editedTranslations[f.key];
        return edited && edited.trim().length > 0;
      })
      .map((f: SourceField) => ({
        key: f.key,
        value: editedTranslations[f.key],
        digest: f.digest,
      }));

    if (translations.length === 0) return;

    saveFetcher.submit(
      {
        intent: "save",
        locale,
        translations: JSON.stringify(translations),
      },
      { method: "POST" },
    );
  }, [sourceFields, editedTranslations, locale, saveFetcher]);

  const isTranslating = translateAllFetcher.state !== "idle";
  const isSaving = saveFetcher.state !== "idle";

  const untranslatedCount = sourceFields.filter(
    (f: SourceField) => f.status === "untranslated" || f.status === "outdated",
  ).length;
  const translatedCount = sourceFields.filter(
    (f: SourceField) => f.status === "translated",
  ).length;
  const hasEdits = sourceFields.some((f: SourceField) => {
    const edited = editedTranslations[f.key];
    return edited !== f.translatedValue;
  });

  return (
    <Page
      backAction={{ content: "Translate", url: `/app/translate` }}
      title={`Translate Page: ${pageTitle}`}
    >
      <TitleBar title={`Translate Page: ${pageTitle}`} />
      <BlockStack gap="500">
        {translateAllFetcher.data?.success && (
          <Banner
            title={`Successfully translated ${translateAllFetcher.data.savedCount} field(s)`}
            tone="success"
            onDismiss={() => {}}
          />
        )}
        {translateAllFetcher.data?.error && (
          <Banner
            title="Translation error"
            tone="critical"
            onDismiss={() => {}}
          >
            <p>{translateAllFetcher.data.error}</p>
            {translateAllFetcher.data.errors?.map((e) => (
              <p key={e.key}>
                {FIELD_LABELS[e.key] ?? e.key}: {e.error}
              </p>
            ))}
          </Banner>
        )}
        {saveFetcher.data?.success && (
          <Banner
            title={`Saved ${saveFetcher.data.savedCount} translation(s) to Shopify`}
            tone="success"
            onDismiss={() => {}}
          />
        )}
        {saveFetcher.data?.error && (
          <Banner title="Save error" tone="critical" onDismiss={() => {}}>
            <p>{saveFetcher.data.error}</p>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <InlineStack gap="400" align="space-between" blockAlign="center">
                <InlineStack gap="400" blockAlign="center">
                  <Select
                    label="Target language"
                    labelInline
                    options={LOCALE_OPTIONS}
                    value={locale}
                    onChange={handleLocaleChange}
                  />
                  <Text as="span" variant="bodySm" tone="subdued">
                    {translatedCount}/{sourceFields.length} fields translated
                  </Text>
                </InlineStack>
                <InlineStack gap="300">
                  <Button
                    variant="primary"
                    onClick={handleTranslateAll}
                    loading={isTranslating}
                    disabled={untranslatedCount === 0 || isTranslating}
                  >
                    {isTranslating
                      ? "Translating..."
                      : `Translate All (${untranslatedCount})`}
                  </Button>
                  <Button
                    onClick={handleSaveAll}
                    loading={isSaving}
                    disabled={!hasEdits || isSaving}
                  >
                    Save Edits
                  </Button>
                </InlineStack>
              </InlineStack>
            </Card>

            <Box paddingBlockStart="400">
              <Card>
                <BlockStack gap="600">
                  {sourceFields.map((field: SourceField, index: number) => (
                    <div key={field.key}>
                      {index > 0 && <Divider />}
                      <Box paddingBlockStart={index > 0 ? "400" : "0"}>
                        <BlockStack gap="300">
                          <InlineStack
                            align="space-between"
                            blockAlign="center"
                          >
                            <InlineStack gap="200" blockAlign="center">
                              <Text as="span" variant="headingSm">
                                {FIELD_LABELS[field.key] ?? field.key}
                              </Text>
                              {fieldStatusBadge(field.status)}
                              {field.outdated && (
                                <Badge tone="attention">Source changed</Badge>
                              )}
                            </InlineStack>
                            <Button
                              size="slim"
                              onClick={() => handleTranslateField(field)}
                              disabled={
                                translatingFields.has(field.key) || isTranslating
                              }
                              loading={translatingFields.has(field.key)}
                            >
                              Translate
                            </Button>
                          </InlineStack>

                          <TextField
                            label="Source"
                            value={field.sourceValue}
                            readOnly
                            multiline={
                              field.key === "body_html" ||
                              field.key === "body" ||
                              field.key === "meta_description"
                                ? 3
                                : undefined
                            }
                            autoComplete="off"
                          />

                          <TextField
                            label={`Translation (${LOCALE_LABELS[locale] ?? locale})`}
                            value={editedTranslations[field.key] ?? ""}
                            onChange={(value) =>
                              handleTranslationChange(field.key, value)
                            }
                            multiline={
                              field.key === "body_html" ||
                              field.key === "body" ||
                              field.key === "meta_description"
                                ? 3
                                : undefined
                            }
                            autoComplete="off"
                            placeholder={`Enter ${LOCALE_LABELS[locale] ?? locale} translation...`}
                            connectedRight={
                              translatingFields.has(field.key) ? (
                                <Spinner size="small" />
                              ) : undefined
                            }
                          />
                        </BlockStack>
                      </Box>
                    </div>
                  ))}

                  {sourceFields.length === 0 && (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No translatable content found for this page.
                    </Text>
                  )}
                </BlockStack>
              </Card>
            </Box>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Translation Summary
                  </Text>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Total fields
                    </Text>
                    <Text as="span" variant="bodyMd" fontWeight="bold">
                      {sourceFields.length}
                    </Text>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Translated
                    </Text>
                    <Badge tone="success">{String(translatedCount)}</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Untranslated
                    </Text>
                    <Badge tone="critical">{String(untranslatedCount)}</Badge>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    How it works
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    1. Select the target language above.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    2. Click "Translate All" to AI-translate all untranslated
                    fields, or use per-field "Translate" buttons.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    3. Review and edit translations as needed.
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    4. Click "Save Edits" to push manual changes to Shopify.
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

export function ErrorBoundary() {
  const error = useRouteError();
  const isResponseError = isRouteErrorResponse(error);

  return (
    <Page>
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            {isResponseError ? `${error.status} Error` : 'Something went wrong'}
          </Text>
          <Text as="p">
            {isResponseError ? error.data?.message || error.statusText : 'An unexpected error occurred. Please try again.'}
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
