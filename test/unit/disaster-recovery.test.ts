import { beforeEach, describe, expect, it } from "vitest";

import {
  getDisasterRecoveryConfig,
  resetDisasterRecoveryConfig,
  updateDisasterRecoveryConfig,
  validateDisasterRecoveryConfig,
} from "../../app/services/system/disaster-recovery";

describe("disaster recovery service", () => {
  beforeEach(() => {
    resetDisasterRecoveryConfig();
  });

  it("returns the default disaster recovery configuration", () => {
    expect(getDisasterRecoveryConfig()).toEqual({
      autoBackupEnabled: true,
      backupFrequency: "daily",
      retentionDays: 30,
      notifyEmail: "",
    });
  });

  it("updates the disaster recovery configuration when valid", () => {
    const updated = updateDisasterRecoveryConfig({
      backupFrequency: "weekly",
      retentionDays: 90,
      notifyEmail: "ops@example.com",
    });

    expect(updated).toEqual({
      autoBackupEnabled: true,
      backupFrequency: "weekly",
      retentionDays: 90,
      notifyEmail: "ops@example.com",
    });
  });

  it("validates invalid retention and email values", () => {
    expect(
      validateDisasterRecoveryConfig({
        autoBackupEnabled: true,
        backupFrequency: "daily",
        retentionDays: 0,
        notifyEmail: "invalid",
      }),
    ).toEqual({
      valid: false,
      errors: [
        "Retention days must be at least 1",
        "Notification email must be valid",
      ],
    });
  });

  it("throws when trying to persist invalid config", () => {
    expect(() =>
      updateDisasterRecoveryConfig({
        retentionDays: 400,
      }),
    ).toThrow("Retention days cannot exceed 365");
  });
});
