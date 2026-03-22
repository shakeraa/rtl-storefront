import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    translationMemory: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      groupBy: vi.fn(),
      update: vi.fn(),
    },
    glossaryEntry: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../../app/db.server", () => ({
  default: mockPrisma,
}));

const { getStats, importEntries, search } = await import(
  "../../app/services/translation-memory/store"
);
const { importTerms } = await import(
  "../../app/services/translation-memory/glossary"
);

describe("translation-memory query optimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(
      async (operations: Array<Promise<unknown>>) => Promise.all(operations),
    );
  });

  it("uses database grouping for translation-memory stats", async () => {
    mockPrisma.translationMemory.count.mockResolvedValue(4);
    mockPrisma.translationMemory.groupBy.mockResolvedValue([
      {
        sourceLocale: "en",
        targetLocale: "ar",
        _count: { _all: 3 },
      },
      {
        sourceLocale: "en",
        targetLocale: "he",
        _count: { _all: 1 },
      },
    ]);

    const stats = await getStats("shop-one");

    expect(mockPrisma.translationMemory.groupBy).toHaveBeenCalledWith({
      by: ["sourceLocale", "targetLocale"],
      where: { shop: "shop-one" },
      _count: { _all: true },
      orderBy: [{ sourceLocale: "asc" }, { targetLocale: "asc" }],
    });
    expect(mockPrisma.translationMemory.findMany).not.toHaveBeenCalled();
    expect(stats).toEqual({
      totalEntries: 4,
      languagePairs: [
        { sourceLocale: "en", targetLocale: "ar", count: 3 },
        { sourceLocale: "en", targetLocale: "he", count: 1 },
      ],
    });
  });

  it("searches candidates once and updates the exact hit separately", async () => {
    mockPrisma.translationMemory.findMany.mockResolvedValue([
      {
        id: "tm-1",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceText: "Hello",
        translatedText: "مرحبا",
        context: null,
        category: null,
        quality: 100,
        usageCount: 4,
      },
      {
        id: "tm-2",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceText: "Hallo",
        translatedText: "اهلا",
        context: null,
        category: null,
        quality: 90,
        usageCount: 1,
      },
    ]);
    mockPrisma.translationMemory.update.mockResolvedValue({
      id: "tm-1",
      sourceLocale: "en",
      targetLocale: "ar",
      sourceText: "Hello",
      translatedText: "مرحبا",
      context: null,
      category: null,
      quality: 100,
      usageCount: 5,
    });

    const results = await search("shop-one", "en", "ar", "Hello");

    expect(mockPrisma.translationMemory.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.translationMemory.update).toHaveBeenCalledWith({
      where: { id: "tm-1" },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: expect.any(Date),
      },
    });
    expect(results).toEqual([
      {
        entry: {
          id: "tm-1",
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Hello",
          translatedText: "مرحبا",
          quality: 100,
          usageCount: 5,
        },
        similarity: 1,
        matchType: "exact",
      },
      {
        entry: {
          id: "tm-2",
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Hallo",
          translatedText: "اهلا",
          quality: 90,
          usageCount: 1,
        },
        similarity: 0.8,
        matchType: "fuzzy",
      },
    ]);
  });

  it("batch-loads existing translation-memory entries before import", async () => {
    mockPrisma.translationMemory.findMany.mockResolvedValue([
      {
        id: "tm-1",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceText: "Hello",
      },
    ]);
    mockPrisma.translationMemory.update.mockResolvedValue({ id: "tm-1" });
    mockPrisma.translationMemory.create.mockResolvedValue({ id: "tm-2" });

    const result = await importEntries("shop-one", {
      version: "1.0",
      entries: [
        {
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Hello",
          translatedText: "مرحبا",
        },
        {
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Bye",
          translatedText: "مع السلامة",
        },
        {
          sourceLocale: "en",
          targetLocale: "ar",
          sourceText: "Bye",
          translatedText: "وداعا",
        },
      ],
    });

    expect(mockPrisma.translationMemory.findMany).toHaveBeenCalledWith({
      where: {
        shop: "shop-one",
        OR: [
          {
            sourceLocale: "en",
            targetLocale: "ar",
            sourceText: "Hello",
          },
          {
            sourceLocale: "en",
            targetLocale: "ar",
            sourceText: "Bye",
          },
        ],
      },
      select: {
        id: true,
        sourceLocale: true,
        targetLocale: true,
        sourceText: true,
      },
    });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.translationMemory.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.translationMemory.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.translationMemory.create).toHaveBeenCalledWith({
      data: {
        shop: "shop-one",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceText: "Bye",
        translatedText: "وداعا",
        context: null,
        category: null,
      },
    });
    expect(result).toEqual({ imported: 1, updated: 2 });
  });

  it("batch-loads existing glossary terms before import", async () => {
    mockPrisma.glossaryEntry.findMany.mockResolvedValue([
      {
        id: "gl-1",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceTerm: "Shopify",
      },
    ]);
    mockPrisma.glossaryEntry.update.mockResolvedValue({ id: "gl-1" });
    mockPrisma.glossaryEntry.create.mockResolvedValue({ id: "gl-2" });

    const result = await importTerms("shop-one", [
      {
        sourceLocale: "en",
        targetLocale: "ar",
        sourceTerm: "Shopify",
        translatedTerm: "شوبيفاي",
        neverTranslate: true,
        caseSensitive: false,
      },
      {
        sourceLocale: "en",
        targetLocale: "ar",
        sourceTerm: "Storefront",
        translatedTerm: "واجهة المتجر",
        neverTranslate: false,
        caseSensitive: false,
      },
      {
        sourceLocale: "en",
        targetLocale: "ar",
        sourceTerm: "Storefront",
        translatedTerm: "المتجر",
        neverTranslate: false,
        caseSensitive: false,
      },
    ]);

    expect(mockPrisma.glossaryEntry.findMany).toHaveBeenCalledWith({
      where: {
        shop: "shop-one",
        OR: [
          {
            sourceLocale: "en",
            targetLocale: "ar",
            sourceTerm: "Shopify",
          },
          {
            sourceLocale: "en",
            targetLocale: "ar",
            sourceTerm: "Storefront",
          },
        ],
      },
      select: {
        id: true,
        sourceLocale: true,
        targetLocale: true,
        sourceTerm: true,
      },
    });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.glossaryEntry.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.glossaryEntry.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.glossaryEntry.create).toHaveBeenCalledWith({
      data: {
        shop: "shop-one",
        sourceLocale: "en",
        targetLocale: "ar",
        sourceTerm: "Storefront",
        translatedTerm: "المتجر",
        neverTranslate: false,
        caseSensitive: false,
        category: null,
        notes: null,
      },
    });
    expect(result).toEqual({ imported: 1, updated: 2 });
  });
});
