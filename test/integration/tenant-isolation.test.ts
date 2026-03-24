/**
 * Multi-Tenant Data Isolation Tests
 *
 * Tests that Shop A's data is completely invisible to Shop B.
 * Tests inserts, fetches, updates, and deletes across tenants.
 *
 * Requires: PostgreSQL running (Docker) with DATABASE_URL configured.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SHOP_A = "shop-a.myshopify.com";
const SHOP_B = "shop-b.myshopify.com";
const SHOP_C = "shop-c.myshopify.com";

describe("Multi-Tenant Data Isolation", () => {
  beforeAll(async () => {
    // Clean up any leftover test data
    await db.translationMemory.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.glossaryEntry.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.translationCache.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.shopSettings.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.translationUsage.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.translationAlert.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.teamMember.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.teamInvite.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
  });

  afterAll(async () => {
    // Clean up test data
    await db.translationMemory.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.glossaryEntry.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.translationCache.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.shopSettings.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.translationUsage.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.translationAlert.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.teamMember.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.teamInvite.deleteMany({ where: { shop: { in: [SHOP_A, SHOP_B, SHOP_C] } } });
    await db.$disconnect();
  });

  // =========================================================================
  // INSERT ISOLATION
  // =========================================================================
  describe("Insert Isolation", () => {
    it("creates translation memory entries for separate shops", async () => {
      await db.translationMemory.create({
        data: {
          shop: SHOP_A,
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Welcome to our store",
          translatedText: "مرحباً بكم في متجرنا",
        },
      });

      await db.translationMemory.create({
        data: {
          shop: SHOP_B,
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Welcome to our store",
          translatedText: "أهلاً وسهلاً في متجرنا", // Different translation for same source
        },
      });

      await db.translationMemory.create({
        data: {
          shop: SHOP_A,
          sourceLocale: "en",
          targetLocale: "he",
          sourceText: "Add to cart",
          translatedText: "הוסף לעגלה",
        },
      });

      const totalEntries = await db.translationMemory.count({
        where: { shop: { in: [SHOP_A, SHOP_B] } },
      });
      expect(totalEntries).toBe(3);
    });

    it("creates shop settings independently per tenant", async () => {
      await db.shopSettings.create({
        data: { shop: SHOP_A, aiProvider: "openai", sourceLocale: "en" },
      });
      await db.shopSettings.create({
        data: { shop: SHOP_B, aiProvider: "deepl", sourceLocale: "fr" },
      });

      const settingsA = await db.shopSettings.findUnique({ where: { shop: SHOP_A } });
      const settingsB = await db.shopSettings.findUnique({ where: { shop: SHOP_B } });

      expect(settingsA?.aiProvider).toBe("openai");
      expect(settingsA?.sourceLocale).toBe("en");
      expect(settingsB?.aiProvider).toBe("deepl");
      expect(settingsB?.sourceLocale).toBe("fr");
    });
  });

  // =========================================================================
  // FETCH ISOLATION — Shop A must NEVER see Shop B's data
  // =========================================================================
  describe("Fetch Isolation", () => {
    it("Shop A only sees its own translation memory", async () => {
      const shopAEntries = await db.translationMemory.findMany({
        where: { shop: SHOP_A },
      });

      expect(shopAEntries).toHaveLength(2);
      expect(shopAEntries.every((e) => e.shop === SHOP_A)).toBe(true);
      // Must NOT contain Shop B's translation
      expect(shopAEntries.some((e) => e.translatedText === "أهلاً وسهلاً في متجرنا")).toBe(false);
    });

    it("Shop B only sees its own translation memory", async () => {
      const shopBEntries = await db.translationMemory.findMany({
        where: { shop: SHOP_B },
      });

      expect(shopBEntries).toHaveLength(1);
      expect(shopBEntries[0].shop).toBe(SHOP_B);
      expect(shopBEntries[0].translatedText).toBe("أهلاً وسهلاً في متجرنا");
      // Must NOT contain Shop A's Hebrew translation
      expect(shopBEntries.some((e) => e.targetLocale === "he")).toBe(false);
    });

    it("Shop C (no data) sees nothing", async () => {
      const shopCEntries = await db.translationMemory.findMany({
        where: { shop: SHOP_C },
      });

      expect(shopCEntries).toHaveLength(0);
    });

    it("findFirst respects shop boundary", async () => {
      const entry = await db.translationMemory.findFirst({
        where: { shop: SHOP_B, sourceText: "Add to cart" },
      });

      // Shop B never added "Add to cart" — only Shop A did
      expect(entry).toBeNull();
    });

    it("count respects shop boundary", async () => {
      const countA = await db.translationMemory.count({ where: { shop: SHOP_A } });
      const countB = await db.translationMemory.count({ where: { shop: SHOP_B } });
      const countC = await db.translationMemory.count({ where: { shop: SHOP_C } });

      expect(countA).toBe(2);
      expect(countB).toBe(1);
      expect(countC).toBe(0);
    });
  });

  // =========================================================================
  // UPDATE ISOLATION
  // =========================================================================
  describe("Update Isolation", () => {
    it("updating Shop A's entry does not affect Shop B", async () => {
      await db.translationMemory.updateMany({
        where: { shop: SHOP_A, sourceText: "Welcome to our store" },
        data: { translatedText: "مرحباً - تم التحديث" },
      });

      // Shop A's entry is updated
      const entryA = await db.translationMemory.findFirst({
        where: { shop: SHOP_A, sourceText: "Welcome to our store" },
      });
      expect(entryA?.translatedText).toBe("مرحباً - تم التحديث");

      // Shop B's entry is UNCHANGED
      const entryB = await db.translationMemory.findFirst({
        where: { shop: SHOP_B, sourceText: "Welcome to our store" },
      });
      expect(entryB?.translatedText).toBe("أهلاً وسهلاً في متجرنا");
    });
  });

  // =========================================================================
  // DELETE ISOLATION
  // =========================================================================
  describe("Delete Isolation", () => {
    it("deleting Shop A's data does not affect Shop B", async () => {
      const deletedCount = await db.translationMemory.deleteMany({
        where: { shop: SHOP_A },
      });

      expect(deletedCount.count).toBe(2);

      // Shop B's data still intact
      const shopBEntries = await db.translationMemory.findMany({
        where: { shop: SHOP_B },
      });
      expect(shopBEntries).toHaveLength(1);
      expect(shopBEntries[0].translatedText).toBe("أهلاً وسهلاً في متجرنا");
    });
  });

  // =========================================================================
  // GLOSSARY ISOLATION
  // =========================================================================
  describe("Glossary Isolation", () => {
    it("glossary terms are shop-scoped", async () => {
      await db.glossaryEntry.create({
        data: {
          shop: SHOP_A,
          sourceLocale: "en",
          targetLocale: "ar",
          sourceTerm: "Abaya",
          translatedTerm: "عباية فاخرة", // Shop A's custom translation
        },
      });

      await db.glossaryEntry.create({
        data: {
          shop: SHOP_B,
          sourceLocale: "en",
          targetLocale: "ar",
          sourceTerm: "Abaya",
          translatedTerm: "عباية عصرية", // Shop B's different translation
        },
      });

      const glossaryA = await db.glossaryEntry.findMany({ where: { shop: SHOP_A } });
      const glossaryB = await db.glossaryEntry.findMany({ where: { shop: SHOP_B } });

      expect(glossaryA).toHaveLength(1);
      expect(glossaryA[0].translatedTerm).toBe("عباية فاخرة");
      expect(glossaryB).toHaveLength(1);
      expect(glossaryB[0].translatedTerm).toBe("عباية عصرية");

      // Same source term, different translations per shop
      expect(glossaryA[0].translatedTerm).not.toBe(glossaryB[0].translatedTerm);
    });
  });

  // =========================================================================
  // TRANSLATION CACHE ISOLATION
  // =========================================================================
  describe("Translation Cache Isolation", () => {
    it("cache entries are shop-scoped", async () => {
      const futureDate = new Date(Date.now() + 86400000);

      await db.translationCache.create({
        data: {
          cacheKey: `${SHOP_A}:en:ar:hello`,
          shop: SHOP_A,
          provider: "openai",
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Hello",
          translatedText: "مرحباً",
          expiresAt: futureDate,
        },
      });

      await db.translationCache.create({
        data: {
          cacheKey: `${SHOP_B}:en:ar:hello`,
          shop: SHOP_B,
          provider: "deepl",
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Hello",
          translatedText: "أهلاً",
          expiresAt: futureDate,
        },
      });

      const cacheA = await db.translationCache.findMany({ where: { shop: SHOP_A } });
      const cacheB = await db.translationCache.findMany({ where: { shop: SHOP_B } });

      expect(cacheA).toHaveLength(1);
      expect(cacheA[0].provider).toBe("openai");
      expect(cacheB).toHaveLength(1);
      expect(cacheB[0].provider).toBe("deepl");
    });
  });

  // =========================================================================
  // USAGE TRACKING ISOLATION
  // =========================================================================
  describe("Usage Tracking Isolation", () => {
    it("usage records are shop-scoped", async () => {
      await db.translationUsage.create({
        data: {
          shop: SHOP_A,
          provider: "openai",
          characters: 5000,
          words: 800,
          costCents: 15,
          costPer1kChars: 3.0,
          sourceLocale: "en",
          targetLocale: "ar",
        },
      });

      await db.translationUsage.create({
        data: {
          shop: SHOP_B,
          provider: "deepl",
          characters: 10000,
          words: 1600,
          costCents: 25,
          costPer1kChars: 2.5,
          sourceLocale: "en",
          targetLocale: "he",
        },
      });

      const usageA = await db.translationUsage.findMany({ where: { shop: SHOP_A } });
      const usageB = await db.translationUsage.findMany({ where: { shop: SHOP_B } });

      expect(usageA).toHaveLength(1);
      expect(usageA[0].characters).toBe(5000);
      expect(usageA[0].costCents).toBe(15);

      expect(usageB).toHaveLength(1);
      expect(usageB[0].characters).toBe(10000);
      expect(usageB[0].costCents).toBe(25);

      // Shop A's total cost must not include Shop B's
      const totalCostA = usageA.reduce((sum, u) => sum + u.costCents, 0);
      expect(totalCostA).toBe(15);
    });
  });

  // =========================================================================
  // TEAM ISOLATION
  // =========================================================================
  describe("Team Isolation", () => {
    it("team members are shop-scoped", async () => {
      await db.teamMember.create({
        data: {
          shop: SHOP_A,
          userId: "user-a-1",
          email: "alice@shop-a.com",
          role: "admin",
          invitedBy: "owner-a",
        },
      });

      await db.teamMember.create({
        data: {
          shop: SHOP_B,
          userId: "user-b-1",
          email: "bob@shop-b.com",
          role: "translator",
          invitedBy: "owner-b",
        },
      });

      const teamA = await db.teamMember.findMany({ where: { shop: SHOP_A } });
      const teamB = await db.teamMember.findMany({ where: { shop: SHOP_B } });

      expect(teamA).toHaveLength(1);
      expect(teamA[0].email).toBe("alice@shop-a.com");
      expect(teamB).toHaveLength(1);
      expect(teamB[0].email).toBe("bob@shop-b.com");

      // Shop A must not see Shop B's team
      expect(teamA.some((m) => m.email === "bob@shop-b.com")).toBe(false);
    });
  });

  // =========================================================================
  // CONCURRENT MULTI-TENANT OPERATIONS
  // =========================================================================
  describe("Concurrent Multi-Tenant Operations", () => {
    it("parallel inserts across 3 shops don't interfere", async () => {
      await Promise.all([
        db.translationAlert.create({
          data: {
            shop: SHOP_A,
            category: "untranslated",
            severity: "warning",
            title: "Shop A Alert",
            message: "5 products untranslated",
            locale: "ar",
          },
        }),
        db.translationAlert.create({
          data: {
            shop: SHOP_B,
            category: "coverage_drop",
            severity: "critical",
            title: "Shop B Alert",
            message: "Coverage dropped below 50%",
            locale: "he",
          },
        }),
        db.translationAlert.create({
          data: {
            shop: SHOP_C,
            category: "quality",
            severity: "info",
            title: "Shop C Alert",
            message: "Quality review needed",
            locale: "ar",
          },
        }),
      ]);

      const [alertsA, alertsB, alertsC] = await Promise.all([
        db.translationAlert.findMany({ where: { shop: SHOP_A } }),
        db.translationAlert.findMany({ where: { shop: SHOP_B } }),
        db.translationAlert.findMany({ where: { shop: SHOP_C } }),
      ]);

      expect(alertsA).toHaveLength(1);
      expect(alertsA[0].title).toBe("Shop A Alert");
      expect(alertsB).toHaveLength(1);
      expect(alertsB[0].title).toBe("Shop B Alert");
      expect(alertsC).toHaveLength(1);
      expect(alertsC[0].title).toBe("Shop C Alert");
    });
  });

  // =========================================================================
  // GDPR ERASURE ISOLATION — deleting one shop must NOT touch others
  // =========================================================================
  describe("GDPR Erasure Isolation", () => {
    it("deleting Shop A's data leaves Shop B and C intact", async () => {
      // Delete all Shop A data
      await db.$transaction([
        db.translationMemory.deleteMany({ where: { shop: SHOP_A } }),
        db.glossaryEntry.deleteMany({ where: { shop: SHOP_A } }),
        db.translationCache.deleteMany({ where: { shop: SHOP_A } }),
        db.translationUsage.deleteMany({ where: { shop: SHOP_A } }),
        db.translationAlert.deleteMany({ where: { shop: SHOP_A } }),
        db.teamMember.deleteMany({ where: { shop: SHOP_A } }),
        db.shopSettings.deleteMany({ where: { shop: SHOP_A } }),
      ]);

      // Shop A — everything gone
      const [tmA, glossA, cacheA, usageA, alertA, teamA, settingsA] = await Promise.all([
        db.translationMemory.count({ where: { shop: SHOP_A } }),
        db.glossaryEntry.count({ where: { shop: SHOP_A } }),
        db.translationCache.count({ where: { shop: SHOP_A } }),
        db.translationUsage.count({ where: { shop: SHOP_A } }),
        db.translationAlert.count({ where: { shop: SHOP_A } }),
        db.teamMember.count({ where: { shop: SHOP_A } }),
        db.shopSettings.count({ where: { shop: SHOP_A } }),
      ]);
      expect(tmA + glossA + cacheA + usageA + alertA + teamA + settingsA).toBe(0);

      // Shop B — everything still there
      const [tmB, glossB, cacheB, usageB, alertB, teamB, settingsB] = await Promise.all([
        db.translationMemory.count({ where: { shop: SHOP_B } }),
        db.glossaryEntry.count({ where: { shop: SHOP_B } }),
        db.translationCache.count({ where: { shop: SHOP_B } }),
        db.translationUsage.count({ where: { shop: SHOP_B } }),
        db.translationAlert.count({ where: { shop: SHOP_B } }),
        db.teamMember.count({ where: { shop: SHOP_B } }),
        db.shopSettings.count({ where: { shop: SHOP_B } }),
      ]);
      expect(tmB).toBe(1);
      expect(glossB).toBe(1);
      expect(cacheB).toBe(1);
      expect(usageB).toBe(1);
      expect(alertB).toBe(1);
      expect(teamB).toBe(1);
      expect(settingsB).toBe(1);

      // Shop C — also still there
      const alertC = await db.translationAlert.count({ where: { shop: SHOP_C } });
      expect(alertC).toBe(1);
    });
  });
});
