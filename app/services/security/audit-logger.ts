/**
 * Audit Logging Service (T0188)
 *
 * In-memory audit log with a cap of 10,000 entries.
 */

import type { AuditLogEntry } from "./types";

const MAX_ENTRIES = 10_000;

/** In-memory audit log store */
const logs: AuditLogEntry[] = [];

let idCounter = 0;

/**
 * Logs an audit entry. Automatically assigns an id and timestamp.
 * When the store exceeds MAX_ENTRIES, the oldest entry is removed.
 */
export function log(
  entry: Omit<AuditLogEntry, "id" | "timestamp">,
): AuditLogEntry {
  idCounter++;

  const fullEntry: AuditLogEntry = {
    ...entry,
    id: `audit_${idCounter}_${Date.now()}`,
    timestamp: new Date(),
  };

  logs.push(fullEntry);

  // Trim oldest entries if we exceed the cap
  while (logs.length > MAX_ENTRIES) {
    logs.shift();
  }

  return fullEntry;
}

/**
 * Retrieves audit logs for a specific shop, with optional pagination.
 */
export function getLogsByShop(
  shop: string,
  limit: number = 100,
  offset: number = 0,
): AuditLogEntry[] {
  const filtered = logs.filter((entry) => entry.shop === shop);
  return filtered.slice(offset, offset + limit);
}

/**
 * Retrieves audit logs by action type.
 */
export function getLogsByAction(
  action: string,
  limit: number = 100,
): AuditLogEntry[] {
  return logs.filter((entry) => entry.action === action).slice(0, limit);
}

/**
 * Searches audit logs by a query string.
 * Matches against action, actor, resource, resourceId, and details fields.
 */
export function searchLogs(query: string): AuditLogEntry[] {
  const lowerQuery = query.toLowerCase();

  return logs.filter((entry) => {
    const searchable = [
      entry.action,
      entry.actor,
      entry.resource,
      entry.resourceId,
      entry.details,
      entry.shop,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(lowerQuery);
  });
}

/**
 * Exports all audit logs for a specific shop.
 */
export function exportLogs(shop: string): AuditLogEntry[] {
  return logs.filter((entry) => entry.shop === shop);
}

/**
 * Removes all audit entries older than the specified number of days.
 * Returns the number of entries removed.
 */
export function clearOlderThan(days: number): number {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const initialLength = logs.length;

  // Find the first index that is newer than cutoff
  let keepFromIndex = 0;
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].timestamp >= cutoff) {
      keepFromIndex = i;
      break;
    }
    if (i === logs.length - 1) {
      // All entries are older than cutoff
      keepFromIndex = logs.length;
    }
  }

  if (keepFromIndex > 0) {
    logs.splice(0, keepFromIndex);
  }

  return initialLength - logs.length;
}
