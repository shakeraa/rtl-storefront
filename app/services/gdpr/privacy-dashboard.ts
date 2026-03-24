import prisma from "../../db.server";
import type { PrivacyDashboardData } from "./types";

/**
 * Aggregate all privacy-related data for the admin dashboard UI.
 */
export async function getPrivacyDashboard(
  shop: string,
): Promise<PrivacyDashboardData> {
  const [consents, retentionPolicies, recentAccessLogs, sessionCount, translationCacheCount, consentCount] =
    await Promise.all([
      prisma.consentRecord.findMany({
        where: { shop },
        select: {
          purpose: true,
          granted: true,
          grantedAt: true,
        },
        orderBy: { purpose: "asc" },
      }),
      prisma.dataRetentionPolicy.findMany({
        where: { shop },
        select: {
          dataType: true,
          retentionDays: true,
          autoDelete: true,
        },
        orderBy: { dataType: "asc" },
      }),
      prisma.dataAccessLog.findMany({
        where: { shop },
        select: {
          action: true,
          dataType: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.session.count({ where: { shop } }),
      prisma.translationCache.count(),
      prisma.consentRecord.count({ where: { shop } }),
    ]);

  return {
    shop,
    consents: consents.map((c) => ({
      purpose: c.purpose,
      granted: c.granted,
      grantedAt: c.grantedAt ? c.grantedAt.toISOString() : null,
    })),
    retentionPolicies: retentionPolicies.map((p) => ({
      dataType: p.dataType,
      retentionDays: p.retentionDays,
      autoDelete: p.autoDelete,
    })),
    recentAccessLogs: recentAccessLogs.map((l) => ({
      action: l.action,
      dataType: l.dataType,
      createdAt: l.createdAt.toISOString(),
    })),
    dataCounts: {
      sessions: sessionCount,
      translationCache: translationCacheCount,
      consents: consentCount,
    },
  };
}
