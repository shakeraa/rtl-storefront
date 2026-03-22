import prisma from "../../db.server";
import type { ConsentInput, ConsentPurpose } from "./types";

/**
 * Grant or revoke consent for a specific purpose.
 * Creates the consent record if it doesn't exist, or updates it.
 * All changes are logged to DataAccessLog.
 */
export async function updateConsent(input: ConsentInput): Promise<void> {
  const { shop, purpose, granted, ipAddress, userAgent } = input;
  const now = new Date();

  await prisma.consentRecord.upsert({
    where: {
      shop_purpose: { shop, purpose },
    },
    create: {
      shop,
      purpose,
      granted,
      grantedAt: granted ? now : null,
      revokedAt: granted ? null : now,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
    update: {
      granted,
      grantedAt: granted ? now : undefined,
      revokedAt: granted ? null : now,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    },
  });

  // Log consent change
  await prisma.dataAccessLog.create({
    data: {
      shop,
      action: granted ? "consent_granted" : "consent_revoked",
      dataType: "consent",
      details: `Consent for "${purpose}" ${granted ? "granted" : "revoked"}`,
      ipAddress: ipAddress ?? null,
    },
  });
}

/**
 * Get the consent status for a specific purpose.
 */
export async function getConsent(
  shop: string,
  purpose: string,
): Promise<{ granted: boolean; grantedAt: Date | null } | null> {
  const record = await prisma.consentRecord.findUnique({
    where: {
      shop_purpose: { shop, purpose },
    },
    select: {
      granted: true,
      grantedAt: true,
    },
  });

  return record;
}

/**
 * Get all consent records for a shop.
 */
export async function getAllConsents(
  shop: string,
): Promise<Array<{ purpose: string; granted: boolean; grantedAt: Date | null }>> {
  const records = await prisma.consentRecord.findMany({
    where: { shop },
    select: {
      purpose: true,
      granted: true,
      grantedAt: true,
    },
    orderBy: { purpose: "asc" },
  });

  return records;
}

/**
 * Quick check whether a shop has granted consent for a specific purpose.
 */
export async function hasConsent(
  shop: string,
  purpose: ConsentPurpose,
): Promise<boolean> {
  const record = await prisma.consentRecord.findUnique({
    where: {
      shop_purpose: { shop, purpose },
    },
    select: {
      granted: true,
    },
  });

  return record?.granted ?? false;
}
