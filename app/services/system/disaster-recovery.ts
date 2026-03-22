/**
 * Disaster Recovery Service (T0384)
 *
 * Provides recovery planning, readiness validation, and orchestrated restore.
 * Works in conjunction with the Backup Service.
 */

import { createBackup, listBackups, restoreBackup } from "./backup";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecoveryStep {
  step: number;
  action: string;
  description: string;
  estimatedMinutes: number;
}

export interface RecoveryPlan {
  planVersion: string;
  lastUpdated: string;
  rto: string;
  rpo: string;
  steps: RecoveryStep[];
}

export type ReadinessStatus = "ready" | "warning" | "not_ready";

export interface ReadinessCheck {
  name: string;
  status: ReadinessStatus;
  detail: string;
}

export interface RecoveryReadiness {
  shop: string;
  overallStatus: ReadinessStatus;
  checks: ReadinessCheck[];
  evaluatedAt: string;
}

export interface RecoveryResult {
  success: boolean;
  shop: string;
  backupId: string;
  startedAt: string;
  completedAt: string;
  steps: Array<{ action: string; status: "completed" | "failed"; detail: string }>;
  message: string;
}

// ---------------------------------------------------------------------------
// Recovery plan (static, versioned document)
// ---------------------------------------------------------------------------

const RECOVERY_PLAN: RecoveryPlan = {
  planVersion: "1.0.0",
  lastUpdated: "2026-03-22",
  rto: "4 hours",
  rpo: "24 hours",
  steps: [
    {
      step: 1,
      action: "assess",
      description:
        "Identify the scope of data loss or corruption and determine the target backup to restore from.",
      estimatedMinutes: 15,
    },
    {
      step: 2,
      action: "notify",
      description:
        "Notify affected merchants and the on-call engineering team. Open an incident channel.",
      estimatedMinutes: 5,
    },
    {
      step: 3,
      action: "isolate",
      description:
        "Put the affected shop(s) into maintenance mode to prevent further writes during restore.",
      estimatedMinutes: 5,
    },
    {
      step: 4,
      action: "validate_backup",
      description:
        "Confirm the selected backup is intact and its checksum matches the stored record.",
      estimatedMinutes: 10,
    },
    {
      step: 5,
      action: "restore",
      description:
        "Run restoreBackup() to re-import sessions, translations, and configuration.",
      estimatedMinutes: 30,
    },
    {
      step: 6,
      action: "verify",
      description:
        "Run smoke tests against the restored data: spot-check translation counts, session validity.",
      estimatedMinutes: 20,
    },
    {
      step: 7,
      action: "resume",
      description: "Take the shop out of maintenance mode and monitor for 30 minutes.",
      estimatedMinutes: 30,
    },
    {
      step: 8,
      action: "post_mortem",
      description:
        "Document the incident timeline, root cause, and preventive actions within 48 hours.",
      estimatedMinutes: 60,
    },
  ],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return the current disaster recovery plan.
 */
export function getRecoveryPlan(): RecoveryPlan {
  return RECOVERY_PLAN;
}

/**
 * Validate whether a shop is ready for disaster recovery.
 *
 * Checks:
 * - At least one backup exists
 * - The most recent backup is no older than 24 hours (RPO)
 * - The most recent backup has non-trivial size (>0 bytes)
 */
export async function validateRecoveryReadiness(
  shop: string,
): Promise<RecoveryReadiness> {
  const checks: ReadinessCheck[] = [];

  const backups = listBackups(shop);

  // Check 1: backup exists
  if (backups.length === 0) {
    checks.push({
      name: "backup_exists",
      status: "not_ready",
      detail: "No backups found for this shop. Run createBackup() to create one.",
    });
  } else {
    checks.push({
      name: "backup_exists",
      status: "ready",
      detail: `${backups.length} backup(s) available`,
    });
  }

  // Check 2: backup freshness (within RPO of 24 h)
  if (backups.length > 0) {
    const latest = backups[0];
    const ageMs = Date.now() - new Date(latest.createdAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    const rpoHours = 24;

    if (ageHours <= rpoHours) {
      checks.push({
        name: "backup_freshness",
        status: "ready",
        detail: `Latest backup is ${ageHours.toFixed(1)}h old (RPO: ${rpoHours}h)`,
      });
    } else if (ageHours <= rpoHours * 2) {
      checks.push({
        name: "backup_freshness",
        status: "warning",
        detail: `Latest backup is ${ageHours.toFixed(1)}h old — approaching RPO limit of ${rpoHours}h`,
      });
    } else {
      checks.push({
        name: "backup_freshness",
        status: "not_ready",
        detail: `Latest backup is ${ageHours.toFixed(1)}h old — exceeds RPO of ${rpoHours}h`,
      });
    }
  }

  // Check 3: data integrity (non-zero size)
  if (backups.length > 0) {
    const latest = backups[0];
    if (latest.sizeBytes > 0) {
      checks.push({
        name: "data_integrity",
        status: "ready",
        detail: `Latest backup size: ${latest.sizeBytes} bytes`,
      });
    } else {
      checks.push({
        name: "data_integrity",
        status: "not_ready",
        detail: "Latest backup has zero size — possible corruption",
      });
    }
  }

  const overallStatus: ReadinessStatus = checks.some(
    (c) => c.status === "not_ready",
  )
    ? "not_ready"
    : checks.some((c) => c.status === "warning")
      ? "warning"
      : "ready";

  return {
    shop,
    overallStatus,
    checks,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Orchestrate a full restore for a shop from the given backup.
 *
 * Steps performed:
 * 1. Validate readiness
 * 2. Create a safety backup of current state
 * 3. Restore from the target backup
 */
export async function initiateRecovery(
  shop: string,
  backupId: string,
): Promise<RecoveryResult> {
  const startedAt = new Date().toISOString();
  const stepLog: RecoveryResult["steps"] = [];

  // Step 1: validate readiness
  const readiness = await validateRecoveryReadiness(shop);
  if (readiness.overallStatus === "not_ready") {
    stepLog.push({
      action: "validate_readiness",
      status: "failed",
      detail: readiness.checks
        .filter((c) => c.status === "not_ready")
        .map((c) => c.detail)
        .join("; "),
    });
    return {
      success: false,
      shop,
      backupId,
      startedAt,
      completedAt: new Date().toISOString(),
      steps: stepLog,
      message: "Recovery aborted: shop is not in a recoverable state",
    };
  }

  stepLog.push({
    action: "validate_readiness",
    status: "completed",
    detail: `Readiness status: ${readiness.overallStatus}`,
  });

  // Step 2: safety snapshot of current state
  try {
    const safetyBackup = await createBackup(shop, "full");
    stepLog.push({
      action: "safety_snapshot",
      status: "completed",
      detail: `Safety backup created: ${safetyBackup.backup.backupId}`,
    });
  } catch (err) {
    stepLog.push({
      action: "safety_snapshot",
      status: "failed",
      detail: err instanceof Error ? err.message : "Unknown error creating safety backup",
    });
    // Non-fatal: proceed with restore but log the failure
  }

  // Step 3: restore from target backup
  const restoreResult = await restoreBackup(shop, backupId);

  stepLog.push({
    action: "restore",
    status: restoreResult.success ? "completed" : "failed",
    detail: restoreResult.message,
  });

  return {
    success: restoreResult.success,
    shop,
    backupId,
    startedAt,
    completedAt: new Date().toISOString(),
    steps: stepLog,
    message: restoreResult.success
      ? `Recovery completed for shop ${shop} from backup ${backupId}`
      : `Recovery failed for shop ${shop}: ${restoreResult.message}`,
  };
}
