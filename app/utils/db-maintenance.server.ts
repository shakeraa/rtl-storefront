import db from "../db.server";

/**
 * Delete expired sessions. Call periodically or on app startup.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

/**
 * Clean up old dismissed alerts (older than 30 days).
 */
export async function cleanupDismissedAlerts(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db.translationAlert.deleteMany({
    where: {
      dismissed: true,
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
  return result.count;
}

/**
 * Clean up old translation usage records (older than 90 days).
 * Keeps aggregate data but removes granular per-request records.
 */
export async function cleanupOldUsageRecords(): Promise<number> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await db.translationUsage.deleteMany({
    where: {
      createdAt: {
        lt: ninetyDaysAgo,
      },
    },
  });
  return result.count;
}

/**
 * Clean up expired translation cache entries.
 */
export async function cleanupExpiredCache(): Promise<number> {
  const result = await db.translationCache.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

/**
 * Clean up old data access logs (older than 365 days).
 */
export async function cleanupOldAccessLogs(): Promise<number> {
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  const result = await db.dataAccessLog.deleteMany({
    where: {
      createdAt: {
        lt: oneYearAgo,
      },
    },
  });
  return result.count;
}

/**
 * Run all maintenance tasks. Returns summary of cleaned records.
 */
export async function runDatabaseMaintenance(): Promise<Record<string, number>> {
  const results: Record<string, number> = {};

  try { results.expiredSessions = await cleanupExpiredSessions(); } catch (e) { results.expiredSessions = -1; }
  try { results.dismissedAlerts = await cleanupDismissedAlerts(); } catch (e) { results.dismissedAlerts = -1; }
  try { results.oldUsageRecords = await cleanupOldUsageRecords(); } catch (e) { results.oldUsageRecords = -1; }
  try { results.expiredCache = await cleanupExpiredCache(); } catch (e) { results.expiredCache = -1; }
  try { results.oldAccessLogs = await cleanupOldAccessLogs(); } catch (e) { results.oldAccessLogs = -1; }

  return results;
}
