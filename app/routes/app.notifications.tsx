import { useState } from "react";
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
  Badge,
  Button,
  Checkbox,
  TextField,
  Banner,
  Box,
  Tabs,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  getRecentAlerts,
  buildAlertSummary,
  getAlertConfig,
  updateAlertConfig,
  getNotificationPreferences,
  updateNotificationPreference,
  dismissAlert,
  type TranslationAlert,
} from "../services/alerts/alerts.server";

const NOTIFICATION_TYPES = [
  { id: "translation_complete", label: "Translation Complete", description: "Get notified when translations are finished" },
  { id: "review_needed", label: "Review Needed", description: "Alerts when translations need human review" },
  { id: "error", label: "Error / Coverage Alert", description: "Notifications about translation errors or coverage issues" },
  { id: "weekly_digest", label: "Weekly Digest", description: "Weekly summary of translation activity" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const [preferences, alertConfig, recentAlerts, alertSummary] = await Promise.all([
    getNotificationPreferences(shop),
    getAlertConfig(shop),
    getRecentAlerts(shop, 10),
    buildAlertSummary(shop),
  ]);

  return json({
    preferences,
    alertConfig,
    recentAlerts,
    alertSummary,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "save_preferences") {
      const prefsJson = formData.get("preferences") as string;
      const emailRecipients = formData.get("emailRecipients") as string;
      
      let prefs;
      try {
        prefs = JSON.parse(prefsJson);
      } catch {
        return json({ error: "Invalid data format" }, { status: 400 });
      }
      
      // Update notification preferences
      for (const [templateId, channels] of Object.entries(prefs)) {
        const { email, inApp } = channels as { email: boolean; inApp: boolean };
        await updateNotificationPreference(shop, templateId, email, inApp);
      }

      // Update alert config with email recipients
      await updateAlertConfig(shop, {
        emailRecipients: emailRecipients.split(",").map(e => e.trim()).filter(Boolean),
      });

      return json({ success: true });
    }

    if (intent === "dismiss_alert") {
      const alertId = formData.get("alertId") as string;
      await dismissAlert(shop, alertId);
      return json({ success: true });
    }

    return json({ error: "Unknown intent" }, { status: 400 });
  } catch (error) {
    console.error("Notification action error:", error);
    return json({ error: "Action failed" }, { status: 500 });
  }
};

function severityTone(severity: string): "critical" | "warning" | "info" | "success" | "new" | "attention" | "read" | "enabled" {
  switch (severity) {
    case "critical":
    case "error":
      return "critical";
    case "warning":
      return "warning";
    default:
      return "info";
  }
}

function OverviewTab({ alertSummary, setSelectedTab }: { alertSummary: { total: number; critical: number; warning: number; info: number }; setSelectedTab: (tab: number) => void }) {
  return (
    <Layout>
      {alertSummary.total > 0 ? (
        <Layout.Section>
          <Banner
            title={`${alertSummary.total} active alert${alertSummary.total !== 1 ? "s" : ""}`}
            tone={alertSummary.critical > 0 ? "critical" : "warning"}
          >
            <InlineStack gap="300">
              {alertSummary.critical > 0 && (
                <Badge tone="critical">{`${alertSummary.critical} critical`}</Badge>
              )}
              {alertSummary.warning > 0 && (
                <Badge tone="warning">{`${alertSummary.warning} warning`}</Badge>
              )}
              {alertSummary.info > 0 && (
                <Badge tone="info">{`${alertSummary.info} info`}</Badge>
              )}
            </InlineStack>
          </Banner>
        </Layout.Section>
      ) : (
        <Layout.Section>
          <Banner title="All caught up!" tone="success">
            <p>No active alerts. Your translations are running smoothly.</p>
          </Banner>
        </Layout.Section>
      )}

      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Quick Actions</Text>
            <InlineStack gap="300">
              <Button onClick={() => setSelectedTab(1)}>View Alert History</Button>
              <Button onClick={() => setSelectedTab(2)}>Configure Settings</Button>
              <Button variant="secondary" url="/app/coverage">Check Coverage</Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

function HistoryTab({ recentAlerts, handleDismiss }: { recentAlerts: TranslationAlert[]; handleDismiss: (id: string) => void }) {
  return (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Alert History</Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Past notifications and alerts from your translation activity.
            </Text>
          </BlockStack>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Recent Alerts</Text>
            {recentAlerts.length === 0 ? (
              <Text as="p" variant="bodyMd" tone="subdued">
                No recent alerts. Alerts will appear here when there are translation issues or new content to translate.
              </Text>
            ) : (
              <BlockStack gap="300">
                {recentAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="center">
                        <InlineStack gap="200" blockAlign="center">
                          <Badge tone={severityTone(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge>{alert.category.replace(/_/g, " ")}</Badge>
                          <Text as="span" variant="headingSm">
                            {alert.title}
                          </Text>
                        </InlineStack>
                        {!alert.dismissed && (
                          <Button
                            variant="plain"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            Dismiss
                          </Button>
                        )}
                      </InlineStack>
                      <Text as="p" variant="bodyMd">
                        {alert.message}
                      </Text>
                      <InlineStack gap="200">
                        <Badge tone="info">{alert.locale}</Badge>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </Text>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

function SettingsTab({ 
  prefs, 
  setPrefs, 
  emailRecipients, 
  setEmailRecipients, 
  handleSave, 
  fetcher 
}: { 
  prefs: Record<string, { email: boolean; inApp: boolean }>; 
  setPrefs: React.Dispatch<React.SetStateAction<Record<string, { email: boolean; inApp: boolean }>>>; 
  emailRecipients: string; 
  setEmailRecipients: (value: string) => void; 
  handleSave: () => void; 
  fetcher: ReturnType<typeof useFetcher>;
}) {
  const togglePref = (templateId: string, channel: "email" | "inApp") => {
    setPrefs((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [channel]: !prev[templateId]?.[channel],
      },
    }));
  };

  return (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Notification Preferences
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Choose which notifications you want to receive and how.
            </Text>
            <BlockStack gap="300">
              {NOTIFICATION_TYPES.map((type) => (
                <Box
                  key={type.id}
                  padding="300"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      {type.label}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {type.description}
                    </Text>
                    <InlineStack gap="400">
                      <Checkbox
                        label="Email"
                        checked={prefs[type.id]?.email ?? true}
                        onChange={() => togglePref(type.id, "email")}
                      />
                      <Checkbox
                        label="In-app"
                        checked={prefs[type.id]?.inApp ?? true}
                        onChange={() => togglePref(type.id, "inApp")}
                      />
                    </InlineStack>
                  </BlockStack>
                </Box>
              ))}
            </BlockStack>
          </BlockStack>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Email Recipients
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Comma-separated list of email addresses to receive notifications.
            </Text>
            <TextField
              label="Recipients"
              value={emailRecipients}
              onChange={setEmailRecipients}
              placeholder="admin@example.com, team@example.com"
              autoComplete="email"
              multiline={2}
            />
          </BlockStack>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <InlineStack align="end">
          <Button variant="primary" onClick={handleSave} loading={fetcher.state === "submitting"}>
            Save Preferences
          </Button>
        </InlineStack>
      </Layout.Section>
    </Layout>
  );
}

export default function NotificationsPage() {
  const { preferences, alertConfig, recentAlerts, alertSummary } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [selectedTab, setSelectedTab] = useState(0);

  const [prefs, setPrefs] = useState<Record<string, { email: boolean; inApp: boolean }>>(preferences);
  const [emailRecipients, setEmailRecipients] = useState<string>(alertConfig.emailRecipients.join(", "));

  const handleSave = () => {
    const formData = new FormData();
    formData.set("intent", "save_preferences");
    formData.set("preferences", JSON.stringify(prefs));
    formData.set("emailRecipients", emailRecipients);
    fetcher.submit(formData, { method: "post" });
  };

  const handleDismiss = (alertId: string) => {
    const formData = new FormData();
    formData.set("intent", "dismiss_alert");
    formData.set("alertId", alertId);
    fetcher.submit(formData, { method: "post" });
  };

  const tabs = [
    { id: "overview", content: "Overview" },
    { id: "history", content: "History" },
    { id: "settings", content: "Settings" },
  ];

  return (
    <Page>
      <TitleBar title="Notifications Center" />
      <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
        {selectedTab === 0 && <OverviewTab alertSummary={alertSummary} setSelectedTab={setSelectedTab} />}
        {selectedTab === 1 && <HistoryTab recentAlerts={recentAlerts as unknown as TranslationAlert[]} handleDismiss={handleDismiss} />}
        {selectedTab === 2 && (
          <SettingsTab 
            prefs={prefs} 
            setPrefs={setPrefs} 
            emailRecipients={emailRecipients} 
            setEmailRecipients={setEmailRecipients} 
            handleSave={handleSave} 
            fetcher={fetcher} 
          />
        )}
      </Tabs>
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
