/**
 * IP Blocking Service (T0187)
 *
 * In-memory IP blocklist with expiration support.
 */

import type { IPBlockEntry } from "./types";

/** In-memory blocklist: IP address -> block entry */
const blocklist = new Map<string, IPBlockEntry>();

/**
 * Blocks an IP address.
 *
 * @param ip - The IP address to block.
 * @param reason - Reason for blocking.
 * @param permanent - If true, the block never expires. Defaults to false.
 * @param durationMs - Duration in milliseconds. Ignored if permanent is true. Defaults to 24 hours.
 */
export function blockIP(
  ip: string,
  reason: string,
  permanent: boolean = false,
  durationMs: number = 24 * 60 * 60 * 1000,
): void {
  const entry: IPBlockEntry = {
    ip,
    reason,
    blockedAt: new Date(),
    expiresAt: permanent ? undefined : new Date(Date.now() + durationMs),
    permanent,
  };

  blocklist.set(ip, entry);
}

/**
 * Removes an IP from the blocklist.
 * Returns true if the IP was blocked and has been removed.
 */
export function unblockIP(ip: string): boolean {
  return blocklist.delete(ip);
}

/**
 * Checks whether an IP is currently blocked.
 */
export function isBlocked(ip: string): { blocked: boolean; reason?: string } {
  const entry = blocklist.get(ip);

  if (!entry) {
    return { blocked: false };
  }

  // Check if a non-permanent block has expired
  if (!entry.permanent && entry.expiresAt && new Date() > entry.expiresAt) {
    blocklist.delete(ip);
    return { blocked: false };
  }

  return { blocked: true, reason: entry.reason };
}

/**
 * Returns all currently blocked IPs (including expired ones not yet cleaned up).
 */
export function getBlockedIPs(): IPBlockEntry[] {
  return Array.from(blocklist.values());
}

/**
 * Removes all expired (non-permanent) blocks.
 * Returns the number of entries removed.
 */
export function cleanupExpired(): number {
  const now = new Date();
  let removed = 0;

  for (const [ip, entry] of blocklist) {
    if (!entry.permanent && entry.expiresAt && now > entry.expiresAt) {
      blocklist.delete(ip);
      removed++;
    }
  }

  return removed;
}
