import prisma from "../../db.server";
import type { RetentionPolicyInput } from "./types";

/**
 * Create or update a data retention policy for a shop.
 */
export async function setRetentionPolicy(
  input: RetentionPolicyInput,
): Promise<void> {
  const { shop, dataType, retentionDays, autoDelete } = input;

  await prisma.dataRetentionPolicy.upsert({
    where: {
      shop_dataType: { shop, dataType },
    },
    create: {
      shop,
      dataType,
      retentionDays,
      autoDelete,
    },
    update: {
      retentionDays,
      autoDelete,
    },
  });

  await prisma.dataAccessLog.create({
    data: {
      shop,
      action: "retention_policy_updated",
      dataType,
      details: `Retention policy set: ${retentionDays} days, autoDelete=${autoDelete}`,
    },
  });
}

/**
 * Get all retention policies for a shop.
 */
export async function getRetentionPolicies(
  shop: string,
): Promise<Array<RetentionPolicyInput>> {
  const policies = await prisma.dataRetentionPolicy.findMany({
    where: { shop },
    select: {
      shop: true,
      dataType: true,
      retentionDays: true,
      autoDelete: true,
    },
    orderBy: { dataType: "asc" },
  });

  return policies;
}

/**
 * Enforce retention policies by deleting data that has exceeded its retention period.
 *
 * Supported data types:
 * - "translation_cache": deletes TranslationCache entries past retention
 * - "access_logs": deletes DataAccessLog entries past retention
 */
export async function enforceRetention(
  shop: string,
): Promise<{ deletedCounts: Record<string, number> }> {
  const policies = await prisma.dataRetentionPolicy.findMany({
    where: { shop, autoDelete: true },
  });

  const deletedCounts: Record<string, number> = {};

  for (const policy of policies) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    let deletedCount = 0;

    if (policy.dataType === "translation_cache") {
      const result = await prisma.translationCache.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });
      deletedCount = result.count;
    } else if (policy.dataType === "access_logs") {
      const result = await prisma.dataAccessLog.deleteMany({
        where: {
          shop,
          createdAt: { lt: cutoffDate },
        },
      });
      deletedCount = result.count;
    }

    deletedCounts[policy.dataType] = deletedCount;

    // Update lastCleanup timestamp
    await prisma.dataRetentionPolicy.update({
      where: { id: policy.id },
      data: { lastCleanup: new Date() },
    });
  }

  // Log the retention enforcement
  await prisma.dataAccessLog.create({
    data: {
      shop,
      action: "retention_enforced",
      dataType: "multiple",
      details: `Retention enforced: ${JSON.stringify(deletedCounts)}`,
    },
  });

  return { deletedCounts };
}
