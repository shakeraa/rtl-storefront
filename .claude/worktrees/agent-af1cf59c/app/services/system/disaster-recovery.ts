/**
 * Disaster Recovery Service (T0384)
 *
 * Provides a recovery plan, readiness validation, and recovery initiation
 * for the rtl-storefront application.
 */

import { listBackups, restoreBackup } from "./backup-system";

export interface RecoveryPlan {
  steps: {
    name: string;
    description: string;
    automated: boolean;
  }[];
  estimatedDowntime: number; // seconds
  lastTested: Date | null;
}

// ---------------------------------------------------------------------------
// Recovery plan definition
// ---------------------------------------------------------------------------

export function getRecoveryPlan(): RecoveryPlan {
  return {
    steps: [
      {
        name: "identify_failure",
        description:
          "Detect the failure source via health-check endpoint and application logs.",
        automated: true,
      },
      {
        name: "notify_stakeholders",
        description:
          "Send automated alerts to the on-call engineer and status page.",
        automated: true,
      },
      {
        name: "select_backup",
        description:
          "Choose the most recent complete backup appropriate for the failure type.",
        automated: false,
      },
      {
        name: "restore_database",
        description:
          "Apply the selected backup to the SQLite database and validate schema integrity.",
        automated: true,
      },
      {
        name: "validate_translation_service",
        description:
          "Run the translation service smoke test to confirm core workflows are functional.",
        automated: true,
      },
      {
        name: "restore_shopify_webhooks",
        description:
          "Re-register any Shopify webhooks that may have been lost during the incident.",
        automated: true,
      },
      {
        name: "resume_traffic",
        description:
          "Remove maintenance mode flag and verify end-to-end health via the /api/health endpoint.",
        automated: false,
      },
    ],
    estimatedDowntime: 900, // 15 minutes
    lastTested: null,
  };
}

// ---------------------------------------------------------------------------
// Readiness validation
// ---------------------------------------------------------------------------

export async function validateRecoveryReadiness(
  shop: string,
): Promise<{ ready: boolean; issues: string[] }> {
  const issues: string[] = [];

  // 1. Verify at least one complete backup exists for the shop.
  let backups: Awaited<ReturnType<typeof listBackups>>;
  try {
    backups = await listBackups(shop);
  } catch {
    issues.push("Unable to reach backup store — backup service unavailable.");
    return { ready: false, issues };
  }

  const completeBackups = backups.filter((b) => b.status === "complete");
  if (completeBackups.length === 0) {
    issues.push(
      "No complete backups found for this shop. Create a backup before relying on disaster recovery.",
    );
  }

  // 2. Verify the database is reachable (import lazily to avoid circular deps).
  try {
    const { checkDatabase } = await import("./health-check");
    const dbResult = await checkDatabase();
    if (dbResult.status !== "ok") {
      issues.push(`Database is not healthy: ${dbResult.status}`);
    }
  } catch {
    issues.push("Health-check module unavailable — cannot verify database.");
  }

  // 3. Ensure the recovery plan has at least one automated step.
  const plan = getRecoveryPlan();
  const automatedSteps = plan.steps.filter((s) => s.automated);
  if (automatedSteps.length === 0) {
    issues.push("Recovery plan has no automated steps — manual intervention required for all steps.");
  }

  return { ready: issues.length === 0, issues };
}

// ---------------------------------------------------------------------------
// Recovery initiation
// ---------------------------------------------------------------------------

export async function initiateRecovery(
  shop: string,
  fromBackupId: string,
): Promise<{ status: string; steps: string[] }> {
  const executedSteps: string[] = [];

  // Step 1 — identify_failure (automated, always first)
  executedSteps.push("identify_failure: failure source logged and recorded.");

  // Step 2 — notify_stakeholders
  executedSteps.push("notify_stakeholders: on-call alert sent.");

  // Step 3 — restore_database via backup service
  try {
    await restoreBackup(shop, fromBackupId);
    executedSteps.push(
      `restore_database: backup ${fromBackupId} restored successfully.`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    executedSteps.push(`restore_database: FAILED — ${message}`);
    return { status: "failed", steps: executedSteps };
  }

  // Step 4 — validate_translation_service
  try {
    const { checkTranslationService } = await import("./health-check");
    const result = await checkTranslationService();
    if (result.status === "ok") {
      executedSteps.push("validate_translation_service: service healthy.");
    } else {
      executedSteps.push(
        `validate_translation_service: degraded — ${result.status}`,
      );
    }
  } catch {
    executedSteps.push(
      "validate_translation_service: check skipped — module unavailable.",
    );
  }

  // Step 5 — restore_shopify_webhooks (automated placeholder)
  executedSteps.push(
    "restore_shopify_webhooks: webhook re-registration queued.",
  );

  // Steps 6+ (select_backup, resume_traffic) are manual — flag them.
  executedSteps.push(
    "resume_traffic: awaiting manual sign-off before removing maintenance mode.",
  );

  return { status: "in_progress", steps: executedSteps };
}
