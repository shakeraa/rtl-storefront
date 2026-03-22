import { useState, useCallback } from "react";
import {
  Card,
  Badge,
  Button,
  TextField,
  InlineStack,
  BlockStack,
  Text,
  Box,
  Banner,
  Select,
  Checkbox,
  ProgressBar,
  DataTable,
} from "@shopify/polaris";

// ---------------------------------------------------------------------------
// T0381 - Health Check
// ---------------------------------------------------------------------------

export interface HealthStatus {
  service: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  lastCheck: string;
}

function healthBadge(status: HealthStatus["status"]) {
  const config: Record<HealthStatus["status"], { tone: "success" | "warning" | "critical"; label: string }> = {
    healthy: { tone: "success", label: "Healthy" },
    degraded: { tone: "warning", label: "Degraded" },
    down: { tone: "critical", label: "Down" },
  };
  const { tone, label } = config[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function HealthCheckDashboard({
  services,
}: {
  services: HealthStatus[];
}) {
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const overallTone: "success" | "warning" | "critical" =
    healthyCount === services.length
      ? "success"
      : healthyCount >= services.length / 2
        ? "warning"
        : "critical";

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingLg">
            System Health
          </Text>
          <Badge tone={overallTone}>
            {`${healthyCount}/${services.length} Healthy`}
          </Badge>
        </InlineStack>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {services.map((service) => (
            <div key={service.service}>
              <Card>
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingSm">
                      {service.service}
                    </Text>
                    {healthBadge(service.status)}
                  </InlineStack>
                  <InlineStack gap="300">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Latency: {service.latencyMs}ms
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Last checked: {service.lastCheck}
                  </Text>
                  {service.latencyMs > 0 && (
                    <ProgressBar
                      progress={Math.min(100, (service.latencyMs / 1000) * 100)}
                      tone={service.latencyMs < 200 ? "success" : service.latencyMs < 500 ? "highlight" : "critical"}
                      size="small"
                    />
                  )}
                </BlockStack>
              </Card>
            </div>
          ))}
        </div>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0382 - Status Page
// ---------------------------------------------------------------------------

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "resolved";
  date: string;
}

function incidentBadge(status: Incident["status"]) {
  const config: Record<Incident["status"], { tone: "warning" | "attention" | "success"; label: string }> = {
    investigating: { tone: "warning", label: "Investigating" },
    identified: { tone: "attention", label: "Identified" },
    resolved: { tone: "success", label: "Resolved" },
  };
  const { tone, label } = config[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function StatusPage({
  services,
  incidents,
}: {
  services: HealthStatus[];
  incidents: Incident[];
}) {
  const allHealthy = services.every((s) => s.status === "healthy");
  const anyDown = services.some((s) => s.status === "down");

  return (
    <BlockStack gap="600">
      <Card>
        <BlockStack gap="400">
          <Banner
            tone={allHealthy ? "success" : anyDown ? "critical" : "warning"}
            title={
              allHealthy
                ? "All Systems Operational"
                : anyDown
                  ? "Service Disruption Detected"
                  : "Partial Service Degradation"
            }
          />

          <BlockStack gap="200">
            {services.map((service) => (
              <Box
                key={service.service}
                padding="300"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="p" variant="bodyMd">
                    {service.service}
                  </Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="p" variant="bodySm" tone="subdued">
                      {service.latencyMs}ms
                    </Text>
                    {healthBadge(service.status)}
                  </InlineStack>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingLg">
            Incident History
          </Text>

          {incidents.length === 0 ? (
            <Text as="p" variant="bodySm" tone="subdued">
              No incidents reported.
            </Text>
          ) : (
            <BlockStack gap="300">
              {incidents.map((incident) => (
                <Box
                  key={incident.id}
                  padding="300"
                  background="bg-surface-secondary"
                  borderRadius="200"
                >
                  <BlockStack gap="100">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h4" variant="headingSm">
                        {incident.title}
                      </Text>
                      {incidentBadge(incident.status)}
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {incident.date}
                    </Text>
                  </BlockStack>
                </Box>
              ))}
            </BlockStack>
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// ---------------------------------------------------------------------------
// T0383 - Backup Manager
// ---------------------------------------------------------------------------

interface Backup {
  id: string;
  date: string;
  size: string;
  type: "auto" | "manual";
}

export function BackupManager({
  backups,
  onCreateBackup,
  onRestore,
}: {
  backups: Backup[];
  onCreateBackup: () => void;
  onRestore: (id: string) => void;
}) {
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  const handleRestore = useCallback(
    (id: string) => {
      if (confirmRestoreId === id) {
        onRestore(id);
        setConfirmRestoreId(null);
      } else {
        setConfirmRestoreId(id);
      }
    },
    [confirmRestoreId, onRestore],
  );

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingLg">
            Backups
          </Text>
          <Button variant="primary" onClick={onCreateBackup}>
            Create Backup
          </Button>
        </InlineStack>

        {backups.length === 0 ? (
          <Text as="p" variant="bodySm" tone="subdued">
            No backups available.
          </Text>
        ) : (
          <BlockStack gap="200">
            {backups.map((backup) => (
              <Box
                key={backup.id}
                padding="300"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <Badge tone={backup.type === "auto" ? "info" : undefined}>
                      {backup.type === "auto" ? "Auto" : "Manual"}
                    </Badge>
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd">
                        {backup.date}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {backup.size}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <Button
                    onClick={() => handleRestore(backup.id)}
                    tone={confirmRestoreId === backup.id ? "critical" : undefined}
                    variant={confirmRestoreId === backup.id ? "primary" : "secondary"}
                  >
                    {confirmRestoreId === backup.id ? "Confirm Restore" : "Restore"}
                  </Button>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0384 - Disaster Recovery Configuration
// ---------------------------------------------------------------------------

interface DRConfig {
  autoBackupEnabled: boolean;
  backupFrequency: "daily" | "weekly";
  retentionDays: number;
  notifyEmail: string;
}

export function DisasterRecoveryConfig({
  config,
  onChange,
}: {
  config: DRConfig;
  onChange: (config: DRConfig) => void;
}) {
  const [localConfig, setLocalConfig] = useState<DRConfig>(config);
  const [saved, setSaved] = useState(true);

  const update = useCallback(
    (patch: Partial<DRConfig>) => {
      setLocalConfig((prev) => {
        const next = { ...prev, ...patch };
        setSaved(false);
        return next;
      });
    },
    [],
  );

  const handleSave = useCallback(() => {
    onChange(localConfig);
    setSaved(true);
  }, [localConfig, onChange]);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingLg">
            Disaster Recovery
          </Text>
          {!saved && <Badge tone="attention">Unsaved changes</Badge>}
        </InlineStack>

        <Checkbox
          label="Enable automatic backups"
          checked={localConfig.autoBackupEnabled}
          onChange={(checked) => update({ autoBackupEnabled: checked })}
        />

        <Select
          label="Backup frequency"
          options={[
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
          ]}
          value={localConfig.backupFrequency}
          onChange={(value) => update({ backupFrequency: value as DRConfig["backupFrequency"] })}
          disabled={!localConfig.autoBackupEnabled}
        />

        <TextField
          label="Retention period (days)"
          type="number"
          value={String(localConfig.retentionDays)}
          onChange={(value) => update({ retentionDays: parseInt(value, 10) || 0 })}
          autoComplete="off"
        />

        <TextField
          label="Notification email"
          type="email"
          value={localConfig.notifyEmail}
          onChange={(value) => update({ notifyEmail: value })}
          autoComplete="email"
          placeholder="admin@example.com"
        />

        <InlineStack align="end">
          <Button variant="primary" onClick={handleSave} disabled={saved}>
            Save Configuration
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// T0385 - Migration Wizard
// ---------------------------------------------------------------------------

const MIGRATION_STEPS = [
  { title: "Select Source", description: "Choose the data source for migration." },
  { title: "Map Fields", description: "Map source fields to destination fields." },
  { title: "Import", description: "Review and start the import process." },
];

export function MigrationWizard({
  step,
  onNext,
  onBack,
}: {
  step: number;
  onNext: () => void;
  onBack: () => void;
}) {
  const currentStep = Math.min(Math.max(step, 0), MIGRATION_STEPS.length - 1);
  const progressPercent = ((currentStep + 1) / MIGRATION_STEPS.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === MIGRATION_STEPS.length - 1;

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Migration Wizard
        </Text>

        <ProgressBar progress={progressPercent} size="small" />

        <InlineStack gap="300">
          {MIGRATION_STEPS.map((s, index) => (
            <Box key={s.title} padding="200">
              <InlineStack gap="200" blockAlign="center">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    backgroundColor:
                      index < currentStep
                        ? "#22c55e"
                        : index === currentStep
                          ? "#3b82f6"
                          : "#e5e7eb",
                    color: index <= currentStep ? "#fff" : "#6b7280",
                  }}
                >
                  {index < currentStep ? "\u2713" : index + 1}
                </div>
                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight={index === currentStep ? "semibold" : "regular"}
                  tone={index === currentStep ? undefined : "subdued"}
                >
                  {s.title}
                </Text>
              </InlineStack>
            </Box>
          ))}
        </InlineStack>

        <Box padding="400" background="bg-surface-secondary" borderRadius="200">
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Step {currentStep + 1}: {MIGRATION_STEPS[currentStep].title}
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              {MIGRATION_STEPS[currentStep].description}
            </Text>
          </BlockStack>
        </Box>

        <InlineStack align="space-between">
          <Button onClick={onBack} disabled={isFirstStep}>
            Back
          </Button>
          <Button variant="primary" onClick={onNext}>
            {isLastStep ? "Start Import" : "Next"}
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
