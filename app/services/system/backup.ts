export interface BackupRecord {
  id: string;
  date: string;
  size: string;
  type: "auto" | "manual";
}

const backups: BackupRecord[] = [];

function createBackupId(now: Date): string {
  return `backup_${now.getTime()}`;
}

export function listBackups(): BackupRecord[] {
  return [...backups].sort((left, right) => right.date.localeCompare(left.date));
}

export function createBackup(
  input: { type?: BackupRecord["type"]; sizeBytes?: number } = {},
): BackupRecord {
  const now = new Date();
  const sizeBytes = input.sizeBytes ?? 1_048_576;
  const backup: BackupRecord = {
    id: createBackupId(now),
    date: now.toISOString(),
    size: `${Math.max(1, Math.round(sizeBytes / (1024 * 1024)))} MB`,
    type: input.type ?? "manual",
  };

  backups.unshift(backup);
  return backup;
}

export function restoreBackup(id: string): { restored: boolean; backup?: BackupRecord } {
  const backup = backups.find((entry) => entry.id === id);

  if (!backup) {
    return { restored: false };
  }

  return { restored: true, backup };
}

export function clearBackups(): void {
  backups.length = 0;
}
