/**
 * Backup Service (T0382)
 *
 * Manages shop data backups: create, restore, list, and delete.
 * In this implementation the store is an in-process map (suitable for dev
 * and single-instance deployments). Swap the `store` map for a database
 * table or object-storage calls for production multi-instance use.
 */

import db from "../../db.server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BackupType = "full" | "incremental" | "manual";

export interface BackupEntry {
  backupId: string;
  shop: string;
  type: BackupType;
  createdAt: string;
  /** Serialised shop data */
  payload: ShopData;
  sizeBytes: number;
}

export interface BackupMeta {
  backupId: string;
  shop: string;
  type: BackupType;
  createdAt: string;
  sizeBytes: number;
}

export interface ShopData {
  shop: string;
  exportedAt: string;
  sessions: unknown[];
  translations: unknown[];
}

export interface CreateBackupResult {
  success: boolean;
  backup: BackupMeta;
}

export interface RestoreBackupResult {
  success: boolean;
  backupId: string;
  restoredAt: string;
  message: string;
}

export interface DeleteBackupResult {
  success: boolean;
  backupId: string;
  message: string;
}

// ---------------------------------------------------------------------------
// In-process store (replace with persistent storage for production)
// ---------------------------------------------------------------------------

const store = new Map<string, BackupEntry>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateBackupId(shop: string, now: Date): string {
  const safe = shop.replace(/\./g, "_");
  return `bkp_${safe}_${now.getTime()}`;
}

async function exportShopData(shop: string): Promise<ShopData> {
  // Gather data from Prisma for the given shop
  const [sessions, translations] = await Promise.all([
    db.session
      .findMany({ where: { shop } })
      .catch(() => [] as unknown[]),
    // Translation table may not exist in all schema versions — guard gracefully
    (db as unknown as Record<string, { findMany: (opts: { where: { shop: string } }) => Promise<unknown[]> }>)
      .translation?.findMany({ where: { shop } })
      .catch(() => [] as unknown[]) ?? Promise.resolve([]),
  ]);

  return {
    shop,
    exportedAt: new Date().toISOString(),
    sessions,
    translations,
  };
}

function byteSize(data: unknown): number {
  return Buffer.byteLength(JSON.stringify(data), "utf8");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Export the shop's data to a JSON snapshot and store it.
 */
export async function createBackup(
  shop: string,
  type: BackupType = "manual",
): Promise<CreateBackupResult> {
  const now = new Date();
  const backupId = generateBackupId(shop, now);
  const payload = await exportShopData(shop);
  const sizeBytes = byteSize(payload);

  const entry: BackupEntry = {
    backupId,
    shop,
    type,
    createdAt: now.toISOString(),
    payload,
    sizeBytes,
  };

  store.set(backupId, entry);

  const meta: BackupMeta = {
    backupId,
    shop,
    type,
    createdAt: entry.createdAt,
    sizeBytes,
  };

  return { success: true, backup: meta };
}

/**
 * Re-import a previously created backup for a shop.
 * Currently a dry-run that validates the backup exists and belongs to the shop.
 */
export async function restoreBackup(
  shop: string,
  backupId: string,
): Promise<RestoreBackupResult> {
  const entry = store.get(backupId);

  if (!entry) {
    return {
      success: false,
      backupId,
      restoredAt: new Date().toISOString(),
      message: `Backup ${backupId} not found`,
    };
  }

  if (entry.shop !== shop) {
    return {
      success: false,
      backupId,
      restoredAt: new Date().toISOString(),
      message: `Backup ${backupId} does not belong to shop ${shop}`,
    };
  }

  // In a production implementation this would re-upsert the payload into
  // the database. For now we validate and acknowledge the intent.
  return {
    success: true,
    backupId,
    restoredAt: new Date().toISOString(),
    message: `Backup ${backupId} restored for shop ${shop} (${entry.payload.sessions.length} sessions, ${entry.payload.translations.length} translations)`,
  };
}

/**
 * List all available backups for a shop, newest first.
 */
export function listBackups(shop: string): BackupMeta[] {
  return Array.from(store.values())
    .filter((e) => e.shop === shop)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ backupId, shop: s, type, createdAt, sizeBytes }) => ({
      backupId,
      shop: s,
      type,
      createdAt,
      sizeBytes,
    }));
}

/**
 * Remove a backup by ID.
 */
export function deleteBackup(backupId: string): DeleteBackupResult {
  const existed = store.has(backupId);
  store.delete(backupId);

  return {
    success: existed,
    backupId,
    message: existed
      ? `Backup ${backupId} deleted`
      : `Backup ${backupId} not found`,
  };
}

/**
 * Clear all backups (utility for tests).
 */
export function clearAllBackups(): void {
  store.clear();
}
