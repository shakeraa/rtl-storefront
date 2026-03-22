export interface DisasterRecoveryConfig {
  autoBackupEnabled: boolean;
  backupFrequency: "daily" | "weekly";
  retentionDays: number;
  notifyEmail: string;
}

const DEFAULT_CONFIG: DisasterRecoveryConfig = {
  autoBackupEnabled: true,
  backupFrequency: "daily",
  retentionDays: 30,
  notifyEmail: "",
};

let storedConfig: DisasterRecoveryConfig = { ...DEFAULT_CONFIG };

export function getDisasterRecoveryConfig(): DisasterRecoveryConfig {
  return { ...storedConfig };
}

export function validateDisasterRecoveryConfig(
  config: DisasterRecoveryConfig,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.retentionDays < 1) {
    errors.push("Retention days must be at least 1");
  }

  if (config.retentionDays > 365) {
    errors.push("Retention days cannot exceed 365");
  }

  if (
    config.notifyEmail.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.notifyEmail)
  ) {
    errors.push("Notification email must be valid");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function updateDisasterRecoveryConfig(
  patch: Partial<DisasterRecoveryConfig>,
): DisasterRecoveryConfig {
  const next = { ...storedConfig, ...patch };
  const validation = validateDisasterRecoveryConfig(next);

  if (!validation.valid) {
    throw new Error(validation.errors.join("; "));
  }

  storedConfig = next;
  return getDisasterRecoveryConfig();
}

export function resetDisasterRecoveryConfig(): void {
  storedConfig = { ...DEFAULT_CONFIG };
}
