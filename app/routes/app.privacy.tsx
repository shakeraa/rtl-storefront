/**
 * app.privacy — GDPR & Data Privacy settings page (T0022)
 *
 * Provides:
 *  - Consent toggles per purpose
 *  - Data export (JSON / CSV)
 *  - Data retention configuration
 *  - Scheduled / immediate data deletion
 *  - Recent access log view
 */

import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
  Badge,
  Divider,
  Banner,
  DataTable,
  Select,
  Modal,
  Box,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getPrivacyDashboard } from "../services/privacy/dashboard";
import {
  grantConsent,
  revokeConsent,
  setRetentionPolicy,
} from "../services/privacy";

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const dashboard = await getPrivacyDashboard(session.shop);
  return json({ shop: session.shop, dashboard });
};

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const _action = formData.get("_action") as string;

  if (_action === "consent") {
    const purpose = formData.get("purpose") as string;
    const granted = formData.get("granted") === "true";
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("cf-connecting-ip") ??
      undefined;
    if (granted) {
      await grantConsent(shop, purpose, ip ?? undefined);
    } else {
      await revokeConsent(shop, purpose);
    }
    return json({ success: true, action: "consent" });
  }

  if (_action === "retention") {
    const dataType = formData.get("dataType") as string;
    const retentionDays = Number(formData.get("retentionDays"));
    const autoDelete = formData.get("autoDelete") === "true";
    await setRetentionPolicy({ shop, dataType, retentionDays, autoDelete });
    return json({ success: true, action: "retention" });
  }

  return json({ success: false, error: "Unknown action" }, { status: 400 });
};

// ---------------------------------------------------------------------------
// Consent purpose metadata
// ---------------------------------------------------------------------------

const CONSENT_PURPOSES = [
  {
    id: "translation_processing",
    label: "Translation Processing",
    description: "Allow your store content to be sent to AI translation providers.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Collect anonymised usage analytics to improve the service.",
  },
  {
    id: "marketing",
    label: "Marketing Communications",
    description: "Receive product updates and feature announcements.",
  },
  {
    id: "third_party_sharing",
    label: "Third-Party Data Sharing",
    description:
      "Allow sharing of aggregated (non-personal) data with integration partners.",
  },
] as const;

// ---------------------------------------------------------------------------
// Retention preset options
// ---------------------------------------------------------------------------

const RETENTION_OPTIONS = [
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
  { label: "180 days", value: "180" },
  { label: "365 days", value: "365" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PrivacyPage() {
  const { shop, dashboard } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const shopify = useAppBridge();

  const isSubmitting = navigation.state === "submitting";

  // Build a consent map from loader data
  const initialConsents = Object.fromEntries(
    dashboard.consents.map((c) => [c.purpose, c.granted]),
  );
  const [consents, setConsents] =
    useState<Record<string, boolean>>(initialConsents);

  // Retention state
  const initialRetention = Object.fromEntries(
    dashboard.retentionPolicies.map((p) => [
      p.dataType,
      { days: String(p.retentionDays), autoDelete: p.autoDelete },
    ]),
  );
  const [retention, setRetention] = useState<
    Record<string, { days: string; autoDelete: boolean }>
  >(initialRetention);

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleConsentToggle = (purpose: string, granted: boolean) => {
    setConsents((prev) => ({ ...prev, [purpose]: granted }));
    submit(
      { _action: "consent", purpose, granted: String(granted) },
      { method: "post" },
    );
    shopify.toast.show(
      `${granted ? "Granted" : "Revoked"} consent for ${purpose}`,
    );
  };

  const handleRetentionSave = (dataType: string) => {
    const config = retention[dataType] ?? { days: "90", autoDelete: false };
    submit(
      {
        _action: "retention",
        dataType,
        retentionDays: config.days,
        autoDelete: String(config.autoDelete),
      },
      { method: "post" },
    );
    shopify.toast.show("Retention policy saved");
  };

  const handleExport = (format: "json" | "csv") => {
    // Navigate to the export API — triggers a file download
    window.location.href = `/api/privacy/export?format=${format}`;
  };

  const handleDeleteNow = () => {
    setDeleteModalOpen(false);
    submit({ _action: "delete_all" }, { method: "post", action: "/api/privacy/delete" });
    shopify.toast.show("Data deletion initiated", { isError: false });
  };

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const accessLogRows = dashboard.recentAccessLogs.slice(0, 20).map((log) => [
    log.action,
    log.dataType,
    new Date(log.createdAt).toLocaleString(),
  ]);

  return (
    <Page
      backAction={{ content: "Settings", url: "/app/settings" }}
      title="Data Privacy & GDPR"
    >
      <TitleBar title="Data Privacy & GDPR" />

      <BlockStack gap="500">
        {/* Info banner */}
        <Banner tone="info" title="GDPR compliance tools">
          <Text as="p" variant="bodyMd">
            Manage consent, export or delete your store data, and configure
            how long we retain each data category.
          </Text>
        </Banner>

        <Layout>
          <Layout.Section>
            {/* Consent Management */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Consent Management
                </Text>
                <Divider />
                {CONSENT_PURPOSES.map((p) => (
                  <BlockStack key={p.id} gap="100">
                    <Checkbox
                      label={
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="span" variant="bodyMd" fontWeight="semibold">
                            {p.label}
                          </Text>
                          <Badge tone={consents[p.id] ? "success" : "critical"}>
                            {consents[p.id] ? "Granted" : "Not granted"}
                          </Badge>
                        </InlineStack>
                      }
                      helpText={p.description}
                      checked={consents[p.id] ?? false}
                      onChange={(v) => handleConsentToggle(p.id, v)}
                      disabled={isSubmitting}
                    />
                  </BlockStack>
                ))}
              </BlockStack>
            </Card>

            {/* Data Retention */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Data Retention Policies
                </Text>
                <Divider />
                {(["translation_cache", "access_logs"] as const).map(
                  (dataType) => {
                    const config = retention[dataType] ?? {
                      days: "90",
                      autoDelete: false,
                    };
                    return (
                      <BlockStack key={dataType} gap="300">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {dataType === "translation_cache"
                            ? "Translation Cache"
                            : "Access Logs"}
                        </Text>
                        <InlineStack gap="300" blockAlign="end">
                          <Box minWidth="160px">
                            <Select
                              label="Retention period"
                              options={RETENTION_OPTIONS}
                              value={config.days}
                              onChange={(v) =>
                                setRetention((prev) => ({
                                  ...prev,
                                  [dataType]: { ...config, days: v },
                                }))
                              }
                            />
                          </Box>
                          <Checkbox
                            label="Auto-delete expired data"
                            checked={config.autoDelete}
                            onChange={(v) =>
                              setRetention((prev) => ({
                                ...prev,
                                [dataType]: { ...config, autoDelete: v },
                              }))
                            }
                          />
                          <Button
                            size="slim"
                            onClick={() => handleRetentionSave(dataType)}
                            loading={isSubmitting}
                          >
                            Save
                          </Button>
                        </InlineStack>
                        <Divider />
                      </BlockStack>
                    );
                  },
                )}
              </BlockStack>
            </Card>

            {/* Access Log */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Recent Data Access Log
                </Text>
                <Divider />
                {accessLogRows.length === 0 ? (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No access log entries yet.
                  </Text>
                ) : (
                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Action", "Data Type", "Timestamp"]}
                    rows={accessLogRows}
                  />
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            {/* Data summary */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Stored Data Summary
                </Text>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">Sessions</Text>
                  <Badge>{String(dashboard.dataCounts.sessions ?? 0)}</Badge>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">Translation cache entries</Text>
                  <Badge>{String(dashboard.dataCounts.translationCache ?? 0)}</Badge>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd">Consent records</Text>
                  <Badge>{String(dashboard.dataCounts.consents ?? 0)}</Badge>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Export */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Export Your Data
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Download a complete copy of all data stored for your shop.
                </Text>
                <Button
                  fullWidth
                  onClick={() => handleExport("json")}
                >
                  Download JSON
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => handleExport("csv")}
                >
                  Download CSV
                </Button>
              </BlockStack>
            </Card>

            {/* Delete */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Right to Erasure
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Permanently delete all data associated with your shop. This
                  action cannot be undone.
                </Text>
                <Banner tone="warning">
                  <Text as="p" variant="bodyMd">
                    Deleting your data will sign you out and remove all
                    translations, settings, and consent records.
                  </Text>
                </Banner>
                <Button
                  fullWidth
                  tone="critical"
                  variant="primary"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete All My Data
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm data deletion"
        primaryAction={{
          content: "Delete permanently",
          destructive: true,
          onAction: handleDeleteNow,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            You are about to permanently delete all data for{" "}
            <strong>{shop}</strong>. This includes sessions, translation cache,
            consent records, and access logs. This action cannot be reversed.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
