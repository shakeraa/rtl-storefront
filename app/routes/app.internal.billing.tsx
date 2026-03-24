import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import {
  Page, Card, BlockStack, InlineStack, Text,
  TextField, Checkbox, Button, DataTable, Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticateWithTenant } from "../utils/auth.server";
import { getAllPlans, upsertPlan, isAdmin } from "../services/billing/index";
import type { FeatureKey } from "../services/billing/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { shop } = await authenticateWithTenant(request);

  if (!isAdmin(shop)) {
    throw new Response("Not Found", { status: 404 });
  }

  const plans = await getAllPlans();
  return json({ plans, shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticateWithTenant(request);

  if (!isAdmin(shop)) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "upsert") {
    const id = (formData.get("id") as string) || null;
    const featuresRaw = formData.get("features") as string;

    let features: FeatureKey[];
    try {
      const parsed = JSON.parse(featuresRaw);
      features = Array.isArray(parsed) ? parsed : [];
    } catch {
      return json({ error: "Invalid features format" }, { status: 400 });
    }

    await upsertPlan(id, {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      priceInCents: parseInt(formData.get("priceInCents") as string, 10),
      trialDays: parseInt(formData.get("trialDays") as string, 10),
      maxLanguages: parseInt(formData.get("maxLanguages") as string, 10),
      maxWordsPerMonth: parseInt(formData.get("maxWordsPerMonth") as string, 10),
      features,
      sortOrder: parseInt(formData.get("sortOrder") as string, 10),
      isActive: formData.get("isActive") === "true",
    });
  }

  return json({ success: true });
};

const ALL_FEATURES: { key: FeatureKey; label: string }[] = [
  { key: "basic_translation", label: "Basic Translation" },
  { key: "rtl_support", label: "RTL Support" },
  { key: "glossary", label: "Glossary" },
  { key: "premium_ai", label: "Premium AI" },
  { key: "team_collab", label: "Team Collaboration" },
  { key: "mena_payments", label: "MENA Payments" },
  { key: "analytics", label: "Analytics" },
  { key: "priority_support", label: "Priority Support" },
];

export default function AdminBillingPage() {
  const { plans } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    priceInCents: "0",
    trialDays: "14",
    maxLanguages: "2",
    maxWordsPerMonth: "5000",
    features: [] as FeatureKey[],
    sortOrder: "0",
    isActive: true,
  });

  const startEdit = (plan: any) => {
    setEditing(plan.id);
    setForm({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      priceInCents: plan.priceInCents.toString(),
      trialDays: plan.trialDays.toString(),
      maxLanguages: plan.maxLanguages.toString(),
      maxWordsPerMonth: plan.maxWordsPerMonth.toString(),
      features: plan.features,
      sortOrder: plan.sortOrder.toString(),
      isActive: plan.isActive,
    });
  };

  const startNew = () => {
    setEditing("new");
    setForm({
      id: "",
      name: "",
      slug: "",
      priceInCents: "0",
      trialDays: "14",
      maxLanguages: "2",
      maxWordsPerMonth: "5000",
      features: [],
      sortOrder: ((plans.length + 1) * 10).toString(),
      isActive: true,
    });
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.set("intent", "upsert");
    if (form.id) formData.set("id", form.id);
    formData.set("name", form.name);
    formData.set("slug", form.slug);
    formData.set("priceInCents", form.priceInCents);
    formData.set("trialDays", form.trialDays);
    formData.set("maxLanguages", form.maxLanguages);
    formData.set("maxWordsPerMonth", form.maxWordsPerMonth);
    formData.set("features", JSON.stringify(form.features));
    formData.set("sortOrder", form.sortOrder);
    formData.set("isActive", form.isActive.toString());
    submit(formData, { method: "post" });
    setEditing(null);
  };

  const toggleFeature = (key: FeatureKey) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(key)
        ? prev.features.filter((f) => f !== key)
        : [...prev.features, key],
    }));
  };

  return (
    <Page>
      <TitleBar title="Billing Admin (Internal)" />
      <BlockStack gap="500">
        <Banner tone="warning">
          <p>This page is only visible to admin shops. Changes affect new subscriptions.</p>
        </Banner>

        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">Plans</Text>
              <Button onClick={startNew} size="slim">Add Plan</Button>
            </InlineStack>

            <DataTable
              columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "text", "text"]}
              headings={["Name", "Slug", "Price", "Languages", "Words/mo", "Status", "Actions"]}
              rows={plans.map((plan: any) => [
                plan.name,
                plan.slug,
                `$${(plan.priceInCents / 100).toFixed(2)}`,
                plan.maxLanguages === -1 ? "Unlimited" : plan.maxLanguages,
                plan.maxWordsPerMonth === -1 ? "Unlimited" : plan.maxWordsPerMonth.toLocaleString(),
                plan.isActive ? "Active" : "Inactive",
                <Button key={plan.id} onClick={() => startEdit(plan)} size="slim">
                  Edit
                </Button>,
              ])}
            />
          </BlockStack>
        </Card>

        {editing && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                {form.id ? `Edit: ${form.name}` : "New Plan"}
              </Text>
              <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="off" />
              <TextField label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} autoComplete="off" />
              <TextField label="Price (cents)" type="number" value={form.priceInCents} onChange={(v) => setForm({ ...form, priceInCents: v })} autoComplete="off" />
              <TextField label="Trial Days" type="number" value={form.trialDays} onChange={(v) => setForm({ ...form, trialDays: v })} autoComplete="off" />
              <TextField label="Max Languages (-1 = unlimited)" type="number" value={form.maxLanguages} onChange={(v) => setForm({ ...form, maxLanguages: v })} autoComplete="off" />
              <TextField label="Max Words/Month (-1 = unlimited)" type="number" value={form.maxWordsPerMonth} onChange={(v) => setForm({ ...form, maxWordsPerMonth: v })} autoComplete="off" />
              <TextField label="Sort Order" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} autoComplete="off" />

              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">Features</Text>
                {ALL_FEATURES.map((f) => (
                  <Checkbox
                    key={f.key}
                    label={f.label}
                    checked={form.features.includes(f.key)}
                    onChange={() => toggleFeature(f.key)}
                  />
                ))}
              </BlockStack>

              <Checkbox label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />

              <InlineStack gap="200">
                <Button variant="primary" onClick={handleSave} loading={isSubmitting}>Save</Button>
                <Button onClick={() => setEditing(null)}>Cancel</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}
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
