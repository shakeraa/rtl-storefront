/**
 * Comprehensive GDPR services test suite.
 *
 * Covers: data-export, erasure, data-deletion, consent, retention.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock Prisma client
// ---------------------------------------------------------------------------

vi.mock("../../app/db.server", () => ({
  default: {
    translationMemory: { findMany: vi.fn(), count: vi.fn(), deleteMany: vi.fn() },
    translationCache: { findMany: vi.fn(), count: vi.fn(), deleteMany: vi.fn() },
    glossaryEntry: { findMany: vi.fn(), count: vi.fn(), deleteMany: vi.fn() },
    culturalContext: { deleteMany: vi.fn() },
    dataAccessLog: { findMany: vi.fn(), count: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    consentRecord: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), count: vi.fn(), deleteMany: vi.fn() },
    dataRetentionPolicy: { findMany: vi.fn(), upsert: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
    shopSubscription: { deleteMany: vi.fn() },
    shopUsage: { deleteMany: vi.fn() },
    translationUsage: { deleteMany: vi.fn() },
    translationAlert: { deleteMany: vi.fn() },
    notificationPreference: { deleteMany: vi.fn() },
    alertConfiguration: { deleteMany: vi.fn() },
    shopSettings: { deleteMany: vi.fn() },
    teamInvite: { deleteMany: vi.fn() },
    teamMember: { deleteMany: vi.fn() },
    session: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import db from "../../app/db.server";
import {
  createExportPackage,
  formatAsCSV,
  estimateExportSize,
} from "../../app/services/gdpr/data-export";
import {
  processErasure,
  validateErasureConfirmation,
  getErasureImpactPreview,
} from "../../app/services/gdpr/erasure";
import { deleteShopData } from "../../app/services/gdpr/data-deletion";
import {
  getConsentPreferences,
  updateConsentPreferences,
  hasRequiredConsent,
  getConsentHistory,
} from "../../app/services/gdpr/consent";
import {
  setRetentionPolicy,
  getRetentionPolicies,
  enforceRetention,
} from "../../app/services/gdpr/retention";

const SHOP = "test-shop.myshopify.com";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockCount(count: number) {
  return { count };
}

function resetAllMocks() {
  vi.clearAllMocks();
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Data Export
// ═══════════════════════════════════════════════════════════════════════════

describe("Data Export Service", () => {
  beforeEach(resetAllMocks);

  it("createExportPackage() always includes a settings section", async () => {
    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: false,
      includeAnalytics: false,
    });

    expect(pkg.sections).toHaveProperty("settings");
    expect(pkg.sections["settings"]).toHaveLength(1);
    expect((pkg.sections["settings"][0] as Record<string, unknown>).shop).toBe(SHOP);
  });

  it("createExportPackage() settings section contains locale configuration", async () => {
    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: false,
      includeAnalytics: false,
    });

    const settings = pkg.sections["settings"][0] as Record<string, unknown>;
    expect(settings).toHaveProperty("defaultLocale", "en");
    expect(settings).toHaveProperty("rtlEnabled", true);
    expect(settings).toHaveProperty("enabledLocales");
  });

  it("createExportPackage() includes translations when requested", async () => {
    const tmRecords = [{ id: "1", source: "Hello", target: "مرحبا", shop: SHOP }];
    const glossary = [{ id: "2", term: "Checkout", translation: "الدفع", shop: SHOP }];
    const cache = [{ id: "3", sourceLocale: "en", targetLocale: "ar" }];

    (db.translationMemory.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(tmRecords);
    (db.glossaryEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(glossary);
    (db.translationCache.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(cache);

    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: true,
      includeAnalytics: false,
    });

    expect(pkg.sections).toHaveProperty("translation_memory");
    expect(pkg.sections).toHaveProperty("glossary");
    expect(pkg.sections).toHaveProperty("translations");
    expect(pkg.sections["translation_memory"]).toEqual(tmRecords);
    expect(pkg.sections["glossary"]).toEqual(glossary);
  });

  it("createExportPackage() does not include translations when not requested", async () => {
    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: false,
      includeAnalytics: false,
    });

    expect(pkg.sections).not.toHaveProperty("translation_memory");
    expect(pkg.sections).not.toHaveProperty("glossary");
    expect(pkg.sections).not.toHaveProperty("translations");
  });

  it("createExportPackage() includes analytics when requested", async () => {
    const logs = [{ id: "1", action: "export", shop: SHOP }];
    (db.dataAccessLog.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(logs);

    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: false,
      includeAnalytics: true,
    });

    expect(pkg.sections).toHaveProperty("data_access_logs");
    expect(pkg.sections["data_access_logs"]).toEqual(logs);
  });

  it("createExportPackage() does not include analytics when not requested", async () => {
    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: false,
      includeAnalytics: false,
    });

    expect(pkg.sections).not.toHaveProperty("data_access_logs");
  });

  it("createExportPackage() calculates metadata correctly", async () => {
    const tmRecords = [{ id: "1" }, { id: "2" }];
    const glossary = [{ id: "3" }];
    const cache = [{ id: "4" }];

    (db.translationMemory.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(tmRecords);
    (db.glossaryEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(glossary);
    (db.translationCache.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(cache);

    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: true,
      includeAnalytics: false,
    });

    // 1 settings + 2 TM + 1 glossary + 1 cache = 5
    expect(pkg.metadata.totalRecords).toBe(5);
    expect(pkg.metadata.sizeBytes).toBeGreaterThan(0);
  });

  it("createExportPackage() returns correct shop and format", async () => {
    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "json",
      includeTranslations: false,
      includeAnalytics: false,
    });

    expect(pkg.shop).toBe(SHOP);
    expect(pkg.format).toBe("json");
    expect(pkg.exportedAt).toBeDefined();
  });

  it("createExportPackage() supports CSV format", async () => {
    const pkg = await createExportPackage({
      shop: SHOP,
      requestedBy: "admin",
      format: "csv",
      includeTranslations: false,
      includeAnalytics: false,
    });

    expect(pkg.format).toBe("csv");
    // sizeBytes should still be calculated
    expect(pkg.metadata.sizeBytes).toBeGreaterThan(0);
  });

  it("formatAsCSV() converts objects to CSV", () => {
    const data = [
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ];

    const csv = formatAsCSV(data);
    const lines = csv.trim().split("\n");

    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[0]).toBe("name,age");
    expect(lines[1]).toBe("Alice,30");
    expect(lines[2]).toBe("Bob,25");
  });

  it("formatAsCSV() handles empty data", () => {
    expect(formatAsCSV([])).toBe("");
  });

  it("formatAsCSV() escapes commas and quotes", () => {
    const data = [{ value: 'has,comma', quoted: 'has"quote' }];
    const csv = formatAsCSV(data);
    const lines = csv.trim().split("\n");

    expect(lines[1]).toContain('"has,comma"');
    expect(lines[1]).toContain('"has""quote"');
  });

  it("formatAsCSV() escapes newlines in values", () => {
    const data = [{ text: "line1\nline2" }];
    const csv = formatAsCSV(data);

    expect(csv).toContain('"line1\nline2"');
  });

  it("formatAsCSV() handles null and undefined values", () => {
    const data = [{ a: null, b: undefined, c: "ok" }];
    const csv = formatAsCSV(data as unknown as Record<string, unknown>[]);
    const lines = csv.trim().split("\n");

    // null/undefined should become empty strings
    expect(lines[1]).toBe(",,ok");
  });

  it("estimateExportSize() calculates size", async () => {
    (db.translationMemory.count as ReturnType<typeof vi.fn>).mockResolvedValue(100);

    const result = await estimateExportSize(SHOP);

    expect(result.estimatedRecords).toBe(100);
    expect(result.estimatedSizeMB).toBeGreaterThan(0);
  });

  it("estimateExportSize() returns minimum 0.01 MB for small datasets", async () => {
    (db.translationMemory.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const result = await estimateExportSize(SHOP);

    expect(result.estimatedSizeMB).toBeGreaterThanOrEqual(0.01);
  });

  it("estimateExportSize() returns minimum 0.01 MB for zero records", async () => {
    (db.translationMemory.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);

    const result = await estimateExportSize(SHOP);

    expect(result.estimatedSizeMB).toBe(0.01);
    expect(result.estimatedRecords).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Erasure
// ═══════════════════════════════════════════════════════════════════════════

describe("Erasure Service", () => {
  beforeEach(resetAllMocks);

  it("validateErasureConfirmation() validates correct format", () => {
    expect(validateErasureConfirmation(`DELETE ${SHOP}`, SHOP)).toBe(true);
  });

  it("validateErasureConfirmation() rejects wrong text", () => {
    expect(validateErasureConfirmation("REMOVE test-shop.myshopify.com", SHOP)).toBe(false);
  });

  it("validateErasureConfirmation() rejects wrong shop name", () => {
    expect(validateErasureConfirmation("DELETE wrong-shop.myshopify.com", SHOP)).toBe(false);
  });

  it("validateErasureConfirmation() rejects empty string", () => {
    expect(validateErasureConfirmation("", SHOP)).toBe(false);
  });

  it("validateErasureConfirmation() is case-sensitive", () => {
    expect(validateErasureConfirmation(`delete ${SHOP}`, SHOP)).toBe(false);
  });

  it("processErasure() throws on invalid confirmation", async () => {
    await expect(
      processErasure({
        shop: SHOP,
        requestedBy: "admin",
        scope: "all",
        confirmation: "WRONG",
      }),
    ).rejects.toThrow("Invalid erasure confirmation");
  });

  it("processErasure() throws with expected message containing shop name", async () => {
    await expect(
      processErasure({
        shop: SHOP,
        requestedBy: "admin",
        scope: "all",
        confirmation: "NOPE",
      }),
    ).rejects.toThrow(`DELETE ${SHOP}`);
  });

  it("processErasure() deletes from translation tables with scope=translations", async () => {
    const txMock = {
      translationMemory: { deleteMany: vi.fn().mockResolvedValue(mockCount(5)) },
      translationCache: { deleteMany: vi.fn().mockResolvedValue(mockCount(10)) },
      glossaryEntry: { deleteMany: vi.fn().mockResolvedValue(mockCount(3)) },
      culturalContext: { deleteMany: vi.fn().mockResolvedValue(mockCount(2)) },
    };

    (db.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: Function) =>
      fn(txMock),
    );

    const result = await processErasure({
      shop: SHOP,
      requestedBy: "admin",
      scope: "translations",
      confirmation: `DELETE ${SHOP}`,
    });

    expect(txMock.translationMemory.deleteMany).toHaveBeenCalledWith({ where: { shop: SHOP } });
    expect(txMock.translationCache.deleteMany).toHaveBeenCalledWith({ where: { shop: SHOP } });
    expect(txMock.glossaryEntry.deleteMany).toHaveBeenCalledWith({ where: { shop: SHOP } });
    expect(txMock.culturalContext.deleteMany).toHaveBeenCalledWith({ where: { shop: SHOP } });
    expect(result.recordsDeleted).toBe(20);
    expect(result.tablesAffected).toContain("translation_memory");
  });

  it("processErasure() deletes from analytics tables with scope=analytics", async () => {
    const txMock = {
      dataAccessLog: { deleteMany: vi.fn().mockResolvedValue(mockCount(4)) },
      translationUsage: { deleteMany: vi.fn().mockResolvedValue(mockCount(6)) },
      shopUsage: { deleteMany: vi.fn().mockResolvedValue(mockCount(2)) },
      translationAlert: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
    };

    (db.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: Function) =>
      fn(txMock),
    );

    const result = await processErasure({
      shop: SHOP,
      requestedBy: "admin",
      scope: "analytics",
      confirmation: `DELETE ${SHOP}`,
    });

    expect(txMock.dataAccessLog.deleteMany).toHaveBeenCalled();
    expect(txMock.translationUsage.deleteMany).toHaveBeenCalled();
    expect(txMock.shopUsage.deleteMany).toHaveBeenCalled();
    expect(txMock.translationAlert.deleteMany).toHaveBeenCalled();
    expect(result.recordsDeleted).toBe(13);
    expect(result.tablesAffected).toContain("data_access_logs");
  });

  it("processErasure() deletes from personal data tables with scope=personal", async () => {
    const txMock = {
      consentRecord: { deleteMany: vi.fn().mockResolvedValue(mockCount(4)) },
      dataRetentionPolicy: { deleteMany: vi.fn().mockResolvedValue(mockCount(2)) },
      notificationPreference: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      alertConfiguration: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      teamInvite: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      teamMember: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      shopSettings: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      shopSubscription: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      session: { deleteMany: vi.fn().mockResolvedValue(mockCount(3)) },
    };

    (db.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: Function) =>
      fn(txMock),
    );

    const result = await processErasure({
      shop: SHOP,
      requestedBy: "admin",
      scope: "personal",
      confirmation: `DELETE ${SHOP}`,
    });

    expect(txMock.consentRecord.deleteMany).toHaveBeenCalled();
    expect(txMock.session.deleteMany).toHaveBeenCalled();
    expect(txMock.shopSettings.deleteMany).toHaveBeenCalled();
    expect(result.recordsDeleted).toBe(14);
    expect(result.tablesAffected).toContain("consent_records");
    expect(result.tablesAffected).toContain("sessions");
  });

  it("processErasure() respects scope=all and deletes everything", async () => {
    const txMock = {
      translationMemory: { deleteMany: vi.fn().mockResolvedValue(mockCount(5)) },
      translationCache: { deleteMany: vi.fn().mockResolvedValue(mockCount(10)) },
      glossaryEntry: { deleteMany: vi.fn().mockResolvedValue(mockCount(3)) },
      culturalContext: { deleteMany: vi.fn().mockResolvedValue(mockCount(2)) },
      dataAccessLog: { deleteMany: vi.fn().mockResolvedValue(mockCount(4)) },
      translationUsage: { deleteMany: vi.fn().mockResolvedValue(mockCount(6)) },
      shopUsage: { deleteMany: vi.fn().mockResolvedValue(mockCount(2)) },
      translationAlert: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      consentRecord: { deleteMany: vi.fn().mockResolvedValue(mockCount(4)) },
      dataRetentionPolicy: { deleteMany: vi.fn().mockResolvedValue(mockCount(2)) },
      notificationPreference: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      alertConfiguration: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      teamInvite: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      teamMember: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      shopSettings: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      shopSubscription: { deleteMany: vi.fn().mockResolvedValue(mockCount(1)) },
      session: { deleteMany: vi.fn().mockResolvedValue(mockCount(3)) },
    };

    (db.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: Function) =>
      fn(txMock),
    );

    const result = await processErasure({
      shop: SHOP,
      requestedBy: "admin",
      scope: "all",
      confirmation: `DELETE ${SHOP}`,
    });

    expect(result.scope).toBe("all");
    expect(result.shop).toBe(SHOP);
    expect(result.erasedAt).toBeDefined();
    // translations (20) + analytics (13) + personal (14) = 47
    expect(result.recordsDeleted).toBe(47);
    expect(result.tablesAffected.length).toBeGreaterThanOrEqual(10);
  });

  it("processErasure() returns correct erasedAt timestamp", async () => {
    const txMock = {
      translationMemory: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      translationCache: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      glossaryEntry: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      culturalContext: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      dataAccessLog: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      translationUsage: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      shopUsage: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      translationAlert: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      consentRecord: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      dataRetentionPolicy: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      notificationPreference: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      alertConfiguration: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      teamInvite: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      teamMember: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      shopSettings: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      shopSubscription: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
      session: { deleteMany: vi.fn().mockResolvedValue(mockCount(0)) },
    };

    (db.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: Function) =>
      fn(txMock),
    );

    const before = new Date().toISOString();
    const result = await processErasure({
      shop: SHOP,
      requestedBy: "admin",
      scope: "all",
      confirmation: `DELETE ${SHOP}`,
    });
    const after = new Date().toISOString();

    expect(result.erasedAt >= before).toBe(true);
    expect(result.erasedAt <= after).toBe(true);
  });

  it("getErasureImpactPreview() returns impact estimate for translations scope", async () => {
    (db.translationMemory.count as ReturnType<typeof vi.fn>).mockResolvedValue(50);
    (db.translationCache.count as ReturnType<typeof vi.fn>).mockResolvedValue(100);
    (db.glossaryEntry.count as ReturnType<typeof vi.fn>).mockResolvedValue(25);

    const preview = await getErasureImpactPreview(SHOP, "translations");

    expect(preview.tables).toContain("translation_memory");
    expect(preview.tables).toContain("translation_cache");
    expect(preview.tables).toContain("glossary");
    expect(preview.estimatedRecords).toBe(175);
  });

  it("getErasureImpactPreview() returns impact estimate for analytics scope", async () => {
    (db.dataAccessLog.count as ReturnType<typeof vi.fn>).mockResolvedValue(200);

    const preview = await getErasureImpactPreview(SHOP, "analytics");

    expect(preview.tables).toContain("data_access_logs");
    expect(preview.estimatedRecords).toBe(200);
  });

  it("getErasureImpactPreview() returns impact estimate for personal scope", async () => {
    (db.consentRecord.count as ReturnType<typeof vi.fn>).mockResolvedValue(8);

    const preview = await getErasureImpactPreview(SHOP, "personal");

    expect(preview.tables).toContain("consent_records");
    expect(preview.estimatedRecords).toBe(8);
  });

  it("getErasureImpactPreview() returns combined tables for all scope", async () => {
    (db.translationMemory.count as ReturnType<typeof vi.fn>).mockResolvedValue(10);
    (db.translationCache.count as ReturnType<typeof vi.fn>).mockResolvedValue(20);
    (db.glossaryEntry.count as ReturnType<typeof vi.fn>).mockResolvedValue(5);
    (db.dataAccessLog.count as ReturnType<typeof vi.fn>).mockResolvedValue(30);
    (db.consentRecord.count as ReturnType<typeof vi.fn>).mockResolvedValue(4);

    const preview = await getErasureImpactPreview(SHOP, "all");

    expect(preview.estimatedRecords).toBe(69);
    expect(preview.tables.length).toBeGreaterThanOrEqual(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Data Deletion
// ═══════════════════════════════════════════════════════════════════════════

describe("Data Deletion Service", () => {
  beforeEach(resetAllMocks);

  it("deleteShopData() creates audit log before deletion", async () => {
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(
      Array(17).fill(mockCount(0)),
    );

    await deleteShopData(SHOP);

    expect(db.dataAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shop: SHOP,
        action: "data_deletion",
        dataType: "all",
      }),
    });

    // create is called BEFORE $transaction
    const createOrder = (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mock
      .invocationCallOrder[0];
    const txOrder = (db.$transaction as ReturnType<typeof vi.fn>).mock
      .invocationCallOrder[0];
    expect(createOrder).toBeLessThan(txOrder);
  });

  it("deleteShopData() deletes from all 17 tables in transaction", async () => {
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(
      Array(17).fill(mockCount(0)),
    );

    await deleteShopData(SHOP);

    // The transaction should be called with an array of 17 operations
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    const txArg = (db.$transaction as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(txArg).toHaveLength(17);
  });

  it("deleteShopData() returns deletion counts", async () => {
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const counts = [
      mockCount(5),  // accessLogs
      mockCount(4),  // consents
      mockCount(10), // translationCache
      mockCount(8),  // translationMemory
      mockCount(3),  // glossary
      mockCount(2),  // culturalContext
      mockCount(1),  // retentionPolicies
      mockCount(1),  // subscriptions
      mockCount(2),  // shopUsage
      mockCount(6),  // translationUsage
      mockCount(3),  // translationAlerts
      mockCount(1),  // notificationPreferences
      mockCount(1),  // alertConfiguration
      mockCount(1),  // shopSettings
      mockCount(0),  // teamInvites
      mockCount(2),  // teamMembers
      mockCount(3),  // sessions
    ];
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(counts);

    const result = await deleteShopData(SHOP);

    expect(result.shop).toBe(SHOP);
    expect(result.deletedAt).toBeDefined();
    expect(result.deletedCounts.sessions).toBe(3);
    expect(result.deletedCounts.translationCache).toBe(10);
    expect(result.deletedCounts.translationMemory).toBe(8);
    expect(result.deletedCounts.glossary).toBe(3);
    expect(result.deletedCounts.consents).toBe(4);
    expect(result.deletedCounts.accessLogs).toBe(5);
    expect(result.deletedCounts.culturalContext).toBe(2);
    expect(result.deletedCounts.retentionPolicies).toBe(1);
    expect(result.deletedCounts.subscriptions).toBe(1);
    expect(result.deletedCounts.shopUsage).toBe(2);
    expect(result.deletedCounts.translationUsage).toBe(6);
    expect(result.deletedCounts.translationAlerts).toBe(3);
    expect(result.deletedCounts.notificationPreferences).toBe(1);
    expect(result.deletedCounts.alertConfiguration).toBe(1);
    expect(result.deletedCounts.shopSettings).toBe(1);
    expect(result.deletedCounts.teamInvites).toBe(0);
    expect(result.deletedCounts.teamMembers).toBe(2);
  });

  it("deleteShopData() uses performedBy parameter", async () => {
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(
      Array(17).fill(mockCount(0)),
    );

    await deleteShopData(SHOP, "shop-admin@example.com");

    expect(db.dataAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        performedBy: "shop-admin@example.com",
      }),
    });
  });

  it("deleteShopData() defaults performedBy to system", async () => {
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(
      Array(17).fill(mockCount(0)),
    );

    await deleteShopData(SHOP);

    expect(db.dataAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        performedBy: "system",
      }),
    });
  });

  it("deleteShopData() audit log includes GDPR description", async () => {
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(
      Array(17).fill(mockCount(0)),
    );

    await deleteShopData(SHOP);

    expect(db.dataAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        details: expect.stringContaining("GDPR"),
      }),
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Consent
// ═══════════════════════════════════════════════════════════════════════════

describe("Consent Service", () => {
  beforeEach(resetAllMocks);

  it("getConsentPreferences() returns defaults when no records exist", async () => {
    (db.consentRecord.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const prefs = await getConsentPreferences(SHOP);

    expect(prefs.shop).toBe(SHOP);
    expect(prefs.translationProcessing).toBe(false);
    expect(prefs.analyticsTracking).toBe(false);
    expect(prefs.thirdPartySharing).toBe(false);
    expect(prefs.marketingCommunications).toBe(false);
    expect(prefs.updatedAt).toBeDefined();
  });

  it("getConsentPreferences() reads from database", async () => {
    (db.consentRecord.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { purpose: "translationProcessing", granted: true, updatedAt: new Date("2025-01-01") },
      { purpose: "analyticsTracking", granted: true, updatedAt: new Date("2025-01-02") },
      { purpose: "thirdPartySharing", granted: false, updatedAt: new Date("2025-01-01") },
    ]);

    const prefs = await getConsentPreferences(SHOP);

    expect(prefs.translationProcessing).toBe(true);
    expect(prefs.analyticsTracking).toBe(true);
    expect(prefs.thirdPartySharing).toBe(false);
    expect(prefs.marketingCommunications).toBe(false); // not in DB => default
  });

  it("getConsentPreferences() uses latest updatedAt from records", async () => {
    // Use a future date so it will be later than the default new Date() in the implementation
    const latestDate = new Date("2099-12-31T23:59:59Z");
    (db.consentRecord.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { purpose: "translationProcessing", granted: true, updatedAt: new Date("2025-01-01") },
      { purpose: "analyticsTracking", granted: true, updatedAt: latestDate },
    ]);

    const prefs = await getConsentPreferences(SHOP);

    expect(prefs.updatedAt).toBe(latestDate.toISOString());
  });

  it("getConsentPreferences() ignores unknown purpose keys", async () => {
    (db.consentRecord.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { purpose: "unknownPurpose", granted: true, updatedAt: new Date() },
    ]);

    const prefs = await getConsentPreferences(SHOP);

    // Should not throw and unknown key should not appear
    expect((prefs as unknown as Record<string, unknown>)["unknownPurpose"]).toBeUndefined();
  });

  it("updateConsentPreferences() upserts all four consent purposes", async () => {
    (db.consentRecord.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await updateConsentPreferences({
      shop: SHOP,
      translationProcessing: true,
      analyticsTracking: false,
      thirdPartySharing: false,
      marketingCommunications: true,
      updatedAt: new Date().toISOString(),
    });

    expect(db.consentRecord.upsert).toHaveBeenCalledTimes(4);

    // Check translationProcessing was granted
    expect(db.consentRecord.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { shop_purpose: { shop: SHOP, purpose: "translationProcessing" } },
        create: expect.objectContaining({ granted: true }),
        update: expect.objectContaining({ granted: true }),
      }),
    );

    // Check analyticsTracking was revoked
    expect(db.consentRecord.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { shop_purpose: { shop: SHOP, purpose: "analyticsTracking" } },
        create: expect.objectContaining({ granted: false }),
        update: expect.objectContaining({ granted: false }),
      }),
    );
  });

  it("updateConsentPreferences() sets grantedAt for granted consents", async () => {
    (db.consentRecord.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await updateConsentPreferences({
      shop: SHOP,
      translationProcessing: true,
      analyticsTracking: false,
      thirdPartySharing: false,
      marketingCommunications: false,
      updatedAt: new Date().toISOString(),
    });

    // The create for translationProcessing should have grantedAt set
    const tpCall = (db.consentRecord.upsert as ReturnType<typeof vi.fn>).mock.calls.find(
      (call: unknown[]) =>
        (call[0] as Record<string, unknown>).where &&
        ((call[0] as Record<string, Record<string, string>>).where.shop_purpose as Record<string, string>).purpose === "translationProcessing",
    );
    expect(tpCall).toBeDefined();
    expect((tpCall![0] as Record<string, Record<string, unknown>>).create.grantedAt).toBeInstanceOf(Date);
    expect((tpCall![0] as Record<string, Record<string, unknown>>).create.revokedAt).toBeNull();
  });

  it("hasRequiredConsent() returns true when translationProcessing is granted", async () => {
    (db.consentRecord.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      granted: true,
    });

    const result = await hasRequiredConsent(SHOP);

    expect(result).toBe(true);
    expect(db.consentRecord.findUnique).toHaveBeenCalledWith({
      where: {
        shop_purpose: { shop: SHOP, purpose: "translationProcessing" },
      },
    });
  });

  it("hasRequiredConsent() returns false when translationProcessing is not granted", async () => {
    (db.consentRecord.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      granted: false,
    });

    expect(await hasRequiredConsent(SHOP)).toBe(false);
  });

  it("hasRequiredConsent() returns false when no record exists", async () => {
    (db.consentRecord.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    expect(await hasRequiredConsent(SHOP)).toBe(false);
  });

  it("getConsentHistory() returns ordered records", async () => {
    const records = [
      {
        purpose: "translationProcessing",
        granted: true,
        grantedAt: new Date("2025-02-01"),
        revokedAt: null,
        updatedAt: new Date("2025-02-01"),
      },
      {
        purpose: "analyticsTracking",
        granted: false,
        grantedAt: null,
        revokedAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15"),
      },
    ];

    (db.consentRecord.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(records);

    const history = await getConsentHistory(SHOP);

    expect(history).toHaveLength(2);
    expect(history[0].purpose).toBe("translationProcessing");
    expect(history[0].granted).toBe(true);
    expect(history[1].purpose).toBe("analyticsTracking");
    expect(history[1].granted).toBe(false);

    // Verify orderBy was passed
    expect(db.consentRecord.findMany).toHaveBeenCalledWith({
      where: { shop: SHOP },
      orderBy: { updatedAt: "desc" },
    });
  });

  it("getConsentHistory() returns empty array when no history exists", async () => {
    (db.consentRecord.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const history = await getConsentHistory(SHOP);

    expect(history).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Retention
// ═══════════════════════════════════════════════════════════════════════════

describe("Retention Service", () => {
  beforeEach(resetAllMocks);

  it("setRetentionPolicy() upserts policy", async () => {
    (db.dataRetentionPolicy.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await setRetentionPolicy({
      shop: SHOP,
      dataType: "translation_cache",
      retentionDays: 90,
      autoDelete: true,
    });

    expect(db.dataRetentionPolicy.upsert).toHaveBeenCalledWith({
      where: { shop_dataType: { shop: SHOP, dataType: "translation_cache" } },
      create: {
        shop: SHOP,
        dataType: "translation_cache",
        retentionDays: 90,
        autoDelete: true,
      },
      update: {
        retentionDays: 90,
        autoDelete: true,
      },
    });
  });

  it("setRetentionPolicy() logs the policy update", async () => {
    (db.dataRetentionPolicy.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await setRetentionPolicy({
      shop: SHOP,
      dataType: "access_logs",
      retentionDays: 30,
      autoDelete: false,
    });

    expect(db.dataAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shop: SHOP,
        action: "retention_policy_updated",
        dataType: "access_logs",
        details: expect.stringContaining("30 days"),
      }),
    });
  });

  it("setRetentionPolicy() log details include autoDelete flag", async () => {
    (db.dataRetentionPolicy.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await setRetentionPolicy({
      shop: SHOP,
      dataType: "translation_cache",
      retentionDays: 60,
      autoDelete: true,
    });

    expect(db.dataAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        details: expect.stringContaining("autoDelete=true"),
      }),
    });
  });

  it("getRetentionPolicies() returns policies for shop", async () => {
    const policies = [
      { shop: SHOP, dataType: "access_logs", retentionDays: 30, autoDelete: true },
      { shop: SHOP, dataType: "translation_cache", retentionDays: 90, autoDelete: false },
    ];

    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(policies);

    const result = await getRetentionPolicies(SHOP);

    expect(result).toHaveLength(2);
    expect(result[0].dataType).toBe("access_logs");
    expect(result[1].dataType).toBe("translation_cache");

    expect(db.dataRetentionPolicy.findMany).toHaveBeenCalledWith({
      where: { shop: SHOP },
      select: { shop: true, dataType: true, retentionDays: true, autoDelete: true },
      orderBy: { dataType: "asc" },
    });
  });

  it("getRetentionPolicies() returns empty array when no policies exist", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await getRetentionPolicies(SHOP);

    expect(result).toEqual([]);
  });

  it("enforceRetention() deletes expired translation_cache entries", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "p1", shop: SHOP, dataType: "translation_cache", retentionDays: 30, autoDelete: true },
    ]);
    (db.translationCache.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockCount(15));
    (db.dataRetentionPolicy.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await enforceRetention(SHOP);

    expect(result.deletedCounts["translation_cache"]).toBe(15);
    expect(db.translationCache.deleteMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: expect.any(Date) } },
    });
  });

  it("enforceRetention() deletes expired access_logs entries", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "p2", shop: SHOP, dataType: "access_logs", retentionDays: 60, autoDelete: true },
    ]);
    (db.dataAccessLog.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockCount(42));
    (db.dataRetentionPolicy.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await enforceRetention(SHOP);

    expect(result.deletedCounts["access_logs"]).toBe(42);
    expect(db.dataAccessLog.deleteMany).toHaveBeenCalledWith({
      where: { shop: SHOP, createdAt: { lt: expect.any(Date) } },
    });
  });

  it("enforceRetention() updates lastCleanup timestamp", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "p1", shop: SHOP, dataType: "translation_cache", retentionDays: 30, autoDelete: true },
    ]);
    (db.translationCache.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockCount(0));
    (db.dataRetentionPolicy.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await enforceRetention(SHOP);

    expect(db.dataRetentionPolicy.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { lastCleanup: expect.any(Date) },
    });
  });

  it("enforceRetention() logs enforcement action", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "p1", shop: SHOP, dataType: "translation_cache", retentionDays: 30, autoDelete: true },
    ]);
    (db.translationCache.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockCount(5));
    (db.dataRetentionPolicy.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await enforceRetention(SHOP);

    expect(db.dataAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shop: SHOP,
        action: "retention_enforced",
        dataType: "multiple",
        details: expect.stringContaining("translation_cache"),
      }),
    });
  });

  it("enforceRetention() skips policies with autoDelete=false", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await enforceRetention(SHOP);

    expect(result.deletedCounts).toEqual({});
    // No delete calls should have been made
    expect(db.translationCache.deleteMany).not.toHaveBeenCalled();
    expect(db.dataAccessLog.deleteMany).not.toHaveBeenCalled();
  });

  it("enforceRetention() handles multiple policies at once", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "p1", shop: SHOP, dataType: "translation_cache", retentionDays: 30, autoDelete: true },
      { id: "p2", shop: SHOP, dataType: "access_logs", retentionDays: 60, autoDelete: true },
    ]);
    (db.translationCache.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockCount(10));
    (db.dataAccessLog.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockCount(20));
    (db.dataRetentionPolicy.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await enforceRetention(SHOP);

    expect(result.deletedCounts["translation_cache"]).toBe(10);
    expect(result.deletedCounts["access_logs"]).toBe(20);
    expect(db.dataRetentionPolicy.update).toHaveBeenCalledTimes(2);
  });

  it("enforceRetention() ignores unknown data types gracefully", async () => {
    (db.dataRetentionPolicy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "p1", shop: SHOP, dataType: "unknown_type", retentionDays: 7, autoDelete: true },
    ]);
    (db.dataRetentionPolicy.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (db.dataAccessLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const result = await enforceRetention(SHOP);

    // Unknown type should result in 0 deletions
    expect(result.deletedCounts["unknown_type"]).toBe(0);
  });
});
