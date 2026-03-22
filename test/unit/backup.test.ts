import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearBackups,
  createBackup,
  listBackups,
  restoreBackup,
} from "../../app/services/system/backup";

describe("backup service", () => {
  beforeEach(() => {
    clearBackups();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-22T20:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates manual backups with formatted size", () => {
    const backup = createBackup({ sizeBytes: 5 * 1024 * 1024 });

    expect(backup).toEqual({
      id: "backup_1774209600000",
      date: "2026-03-22T20:00:00.000Z",
      size: "5 MB",
      type: "manual",
    });
  });

  it("lists newest backups first", () => {
    const first = createBackup({ sizeBytes: 1_048_576 });
    vi.setSystemTime(new Date("2026-03-22T21:00:00.000Z"));
    const second = createBackup({ type: "auto", sizeBytes: 2_097_152 });

    expect(listBackups()).toEqual([second, first]);
  });

  it("restores an existing backup and rejects unknown ids", () => {
    const backup = createBackup();

    expect(restoreBackup(backup.id)).toEqual({ restored: true, backup });
    expect(restoreBackup("missing")).toEqual({ restored: false });
  });
});
