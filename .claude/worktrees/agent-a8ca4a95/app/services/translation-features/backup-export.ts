/**
 * Backup & Export Service
 * T0334: Translation - Backup Export
 *
 * Creates, stores, and restores backups of all translation data for a shop.
 */

import { getVersionHistory, saveVersion } from './version-history';

export interface TranslationSnapshot {
  shop: string;
  resourceId: string;
  locale: string;
  content: string;
  versionId: string;
  capturedAt: Date;
}

export interface Backup {
  id: string;
  shop: string;
  createdAt: Date;
  label?: string;
  snapshots: TranslationSnapshot[];
  snapshotCount: number;
}

export interface RestoreResult {
  success: boolean;
  backupId: string;
  restoredCount: number;
  errors: string[];
}

// In-memory store (replace with DB in production)
const backupStore: Map<string, Backup[]> = new Map();
const backupById: Map<string, Backup> = new Map();

function generateBackupId(): string {
  return `bkp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Tracked resource registry (resources the backup service knows about).
 * In production, this would be queried from DB.
 */
const resourceRegistry: Map<string, Array<{ resourceId: string; locale: string }>> = new Map();

/**
 * Registers a resource for backup tracking.
 * @param shop - The shop domain
 * @param resourceId - The resource ID
 * @param locale - The locale
 */
export function registerResource(shop: string, resourceId: string, locale: string): void {
  const existing = resourceRegistry.get(shop) ?? [];
  const alreadyTracked = existing.some(
    (r) => r.resourceId === resourceId && r.locale === locale
  );
  if (!alreadyTracked) {
    resourceRegistry.set(shop, [...existing, { resourceId, locale }]);
  }
}

/**
 * Creates a full backup of all registered translations for a shop.
 * @param shop - The Shopify shop domain
 * @param label - Optional human-readable label for the backup
 * @returns The created Backup record
 */
export function createBackup(shop: string, label?: string): Backup {
  const resources = resourceRegistry.get(shop) ?? [];
  const snapshots: TranslationSnapshot[] = [];

  for (const { resourceId, locale } of resources) {
    const versions = getVersionHistory(shop, resourceId, locale);
    if (versions.length > 0) {
      const latest = versions[0]; // most recent first
      snapshots.push({
        shop,
        resourceId,
        locale,
        content: latest.content,
        versionId: latest.id,
        capturedAt: new Date(),
      });
    }
  }

  const backup: Backup = {
    id: generateBackupId(),
    shop,
    createdAt: new Date(),
    label: label ?? `Backup ${new Date().toISOString()}`,
    snapshots,
    snapshotCount: snapshots.length,
  };

  const existing = backupStore.get(shop) ?? [];
  backupStore.set(shop, [backup, ...existing]);
  backupById.set(backup.id, backup);

  return backup;
}

/**
 * Restores all translations from a specific backup.
 * Creates new version history entries for each restored snapshot.
 * @param shop - The Shopify shop domain
 * @param backupId - The backup ID to restore from
 * @returns RestoreResult with counts and any errors
 */
export function restoreBackup(shop: string, backupId: string): RestoreResult {
  const backup = backupById.get(backupId);
  const errors: string[] = [];

  if (!backup) {
    return {
      success: false,
      backupId,
      restoredCount: 0,
      errors: [`Backup '${backupId}' not found`],
    };
  }

  if (backup.shop !== shop) {
    return {
      success: false,
      backupId,
      restoredCount: 0,
      errors: ['Backup does not belong to this shop'],
    };
  }

  let restoredCount = 0;

  for (const snapshot of backup.snapshots) {
    try {
      saveVersion(shop, snapshot.resourceId, snapshot.locale, snapshot.content);
      restoredCount++;
    } catch (err) {
      errors.push(
        `Failed to restore ${snapshot.resourceId}/${snapshot.locale}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return {
    success: errors.length === 0,
    backupId,
    restoredCount,
    errors,
  };
}

/**
 * Lists all backups for a shop, most recent first.
 * @param shop - The Shopify shop domain
 * @returns Array of Backup records (without full snapshot content for performance)
 */
export function listBackups(shop: string): Array<Omit<Backup, 'snapshots'>> {
  const backups = backupStore.get(shop) ?? [];
  return backups.map(({ snapshots: _snapshots, ...meta }) => meta);
}

/**
 * Retrieves a full backup record including all snapshots.
 * @param backupId - The backup ID
 * @returns The full Backup record or null
 */
export function getBackup(backupId: string): Backup | null {
  return backupById.get(backupId) ?? null;
}

/**
 * Exports backup data as a JSON string for download.
 * @param backupId - The backup ID
 * @returns JSON string or null if not found
 */
export function exportBackupAsJson(backupId: string): string | null {
  const backup = backupById.get(backupId);
  if (!backup) return null;
  return JSON.stringify(backup, null, 2);
}

/**
 * Deletes a backup by ID.
 * @param shop - The shop domain (for ownership check)
 * @param backupId - The backup ID to delete
 * @returns true if deleted, false if not found or ownership mismatch
 */
export function deleteBackup(shop: string, backupId: string): boolean {
  const backup = backupById.get(backupId);
  if (!backup || backup.shop !== shop) return false;

  backupById.delete(backupId);
  const existing = backupStore.get(shop) ?? [];
  backupStore.set(
    shop,
    existing.filter((b) => b.id !== backupId)
  );
  return true;
}
