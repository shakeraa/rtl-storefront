import prisma from "../../db.server";
import { calculateSimilarity } from "./matcher";
import type { TMEntry, TMImportExportFormat, TMSearchResult } from "./types";

const DEFAULT_FUZZY_THRESHOLD = 0.8;

/**
 * Add or update a translation memory entry.
 * If an exact source text already exists for the same shop/locale pair, it is updated.
 */
export async function addEntry(
  shop: string,
  entry: Omit<TMEntry, "id" | "usageCount">,
): Promise<TMEntry> {
  const existing = await prisma.translationMemory.findFirst({
    where: {
      shop,
      sourceLocale: entry.sourceLocale,
      targetLocale: entry.targetLocale,
      sourceText: entry.sourceText,
    },
    select: { id: true },
  });

  const record = existing
    ? await prisma.translationMemory.update({
        where: { id: existing.id },
        data: {
          translatedText: entry.translatedText,
          context: entry.context ?? null,
          category: entry.category ?? null,
          quality: entry.quality,
          lastUsedAt: new Date(),
        },
      })
    : await prisma.translationMemory.create({
        data: {
          shop,
          sourceLocale: entry.sourceLocale,
          targetLocale: entry.targetLocale,
          sourceText: entry.sourceText,
          translatedText: entry.translatedText,
          context: entry.context ?? null,
          category: entry.category ?? null,
          quality: entry.quality,
        },
      });

  return toTMEntry(record);
}

/**
 * Find an exact match in translation memory.
 */
export async function findExact(
  shop: string,
  sourceLocale: string,
  targetLocale: string,
  sourceText: string,
): Promise<TMEntry | null> {
  const record = await prisma.translationMemory.findFirst({
    where: {
      shop,
      sourceLocale,
      targetLocale,
      sourceText,
    },
    orderBy: { quality: "desc" },
  });

  if (!record) return null;

  await prisma.translationMemory.update({
    where: { id: record.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return toTMEntry(record);
}

/**
 * Find fuzzy matches in translation memory using Levenshtein distance.
 */
export async function findFuzzy(
  shop: string,
  sourceLocale: string,
  targetLocale: string,
  sourceText: string,
  threshold: number = DEFAULT_FUZZY_THRESHOLD,
): Promise<TMSearchResult[]> {
  // Pull candidate entries for this shop/locale pair.
  const candidates = await prisma.translationMemory.findMany({
    where: {
      shop,
      sourceLocale,
      targetLocale,
    },
    select: {
      id: true,
      sourceLocale: true,
      targetLocale: true,
      sourceText: true,
      translatedText: true,
      context: true,
      category: true,
      quality: true,
      usageCount: true,
    },
  });

  const results: TMSearchResult[] = [];

  for (const candidate of candidates) {
    const similarity = calculateSimilarity(sourceText, candidate.sourceText);

    if (similarity >= threshold && similarity < 1) {
      results.push({
        entry: toTMEntry(candidate),
        similarity,
        matchType: "fuzzy",
      });
    }
  }

  // Sort by similarity descending, then by quality descending.
  results.sort((a, b) => {
    if (b.similarity !== a.similarity) return b.similarity - a.similarity;
    return b.entry.quality - a.entry.quality;
  });

  return results;
}

/**
 * Search translation memory: returns exact matches first, then fuzzy matches.
 */
export async function search(
  shop: string,
  sourceLocale: string,
  targetLocale: string,
  sourceText: string,
  threshold: number = DEFAULT_FUZZY_THRESHOLD,
): Promise<TMSearchResult[]> {
  const candidates = await prisma.translationMemory.findMany({
    where: {
      shop,
      sourceLocale,
      targetLocale,
    },
    orderBy: { quality: "desc" },
    select: {
      id: true,
      sourceLocale: true,
      targetLocale: true,
      sourceText: true,
      translatedText: true,
      context: true,
      category: true,
      quality: true,
      usageCount: true,
    },
  });

  let exactRecord:
    | {
        id: string;
        sourceLocale: string;
        targetLocale: string;
        sourceText: string;
        translatedText: string;
        context: string | null;
        category: string | null;
        quality: number;
        usageCount: number;
      }
    | null = null;
  const fuzzy: TMSearchResult[] = [];

  for (const candidate of candidates) {
    if (!exactRecord && candidate.sourceText === sourceText) {
      exactRecord = candidate;
      continue;
    }

    const similarity = calculateSimilarity(sourceText, candidate.sourceText);
    if (similarity >= threshold && similarity < 1) {
      fuzzy.push({
        entry: toTMEntry(candidate),
        similarity,
        matchType: "fuzzy",
      });
    }
  }

  fuzzy.sort((a, b) => {
    if (b.similarity !== a.similarity) return b.similarity - a.similarity;
    return b.entry.quality - a.entry.quality;
  });

  if (!exactRecord) {
    return fuzzy;
  }

  const exact = await prisma.translationMemory.update({
    where: { id: exactRecord.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  return [
    {
      entry: toTMEntry(exact),
      similarity: 1,
      matchType: "exact",
    },
    ...fuzzy,
  ];
}

/**
 * Delete a translation memory entry by ID.
 */
export async function deleteEntry(id: string): Promise<void> {
  await prisma.translationMemory.delete({ where: { id } });
}

/**
 * Get statistics about translation memory for a shop.
 */
export async function getStats(shop: string): Promise<{
  totalEntries: number;
  languagePairs: Array<{ sourceLocale: string; targetLocale: string; count: number }>;
}> {
  const [totalEntries, languagePairs] = await Promise.all([
    prisma.translationMemory.count({ where: { shop } }),
    prisma.translationMemory.groupBy({
      by: ["sourceLocale", "targetLocale"],
      where: { shop },
      _count: { _all: true },
      orderBy: [{ sourceLocale: "asc" }, { targetLocale: "asc" }],
    }),
  ]);

  return {
    totalEntries,
    languagePairs: languagePairs.map((pair) => ({
      sourceLocale: pair.sourceLocale,
      targetLocale: pair.targetLocale,
      count: pair._count._all,
    })),
  };
}

/**
 * Export all translation memory entries for a shop.
 */
export async function exportEntries(shop: string): Promise<TMImportExportFormat> {
  const records = await prisma.translationMemory.findMany({ where: { shop } });

  return {
    version: "1.0",
    entries: records.map((record) => ({
      sourceLocale: record.sourceLocale,
      targetLocale: record.targetLocale,
      sourceText: record.sourceText,
      translatedText: record.translatedText,
      context: record.context ?? undefined,
      category: record.category ?? undefined,
    })),
  };
}

/**
 * Import translation memory entries for a shop.
 * Uses upsert logic: existing entries (same source text + locale pair) are updated.
 */
export async function importEntries(
  shop: string,
  data: TMImportExportFormat,
): Promise<{ imported: number; updated: number }> {
  if (data.entries.length === 0) {
    return { imported: 0, updated: 0 };
  }

  const groupedEntries = groupImportEntries(data.entries);
  const existingEntries = await prisma.translationMemory.findMany({
    where: {
      shop,
      OR: groupedEntries.map(({ entry }) => ({
        sourceLocale: entry.sourceLocale,
        targetLocale: entry.targetLocale,
        sourceText: entry.sourceText,
      })),
    },
    select: {
      id: true,
      sourceLocale: true,
      targetLocale: true,
      sourceText: true,
    },
  });
  const existingByKey = new Map(
    existingEntries.map((entry) => [getEntryKey(entry), entry]),
  );

  let imported = 0;
  let updated = 0;
  const operations = groupedEntries.map(({ entry, occurrences }) => {
    const existing = existingByKey.get(getEntryKey(entry));

    if (existing) {
      updated += occurrences;

      return prisma.translationMemory.update({
        where: { id: existing.id },
        data: {
          translatedText: entry.translatedText,
          context: entry.context ?? null,
          category: entry.category ?? null,
        },
      });
    }

    imported += 1;
    updated += occurrences - 1;

    return prisma.translationMemory.create({
      data: {
        shop,
        sourceLocale: entry.sourceLocale,
        targetLocale: entry.targetLocale,
        sourceText: entry.sourceText,
        translatedText: entry.translatedText,
        context: entry.context ?? null,
        category: entry.category ?? null,
      },
    });
  });

  await prisma.$transaction(operations);

  return { imported, updated };
}

function groupImportEntries(entries: TMImportExportFormat["entries"]): Array<{
  entry: TMImportExportFormat["entries"][number];
  occurrences: number;
}> {
  const grouped = new Map<
    string,
    {
      entry: TMImportExportFormat["entries"][number];
      occurrences: number;
    }
  >();

  for (const entry of entries) {
    const key = getEntryKey(entry);
    const existing = grouped.get(key);

    if (existing) {
      existing.entry = entry;
      existing.occurrences += 1;
      continue;
    }

    grouped.set(key, { entry, occurrences: 1 });
  }

  return Array.from(grouped.values());
}

function getEntryKey(entry: {
  sourceLocale: string;
  targetLocale: string;
  sourceText: string;
}): string {
  return `${entry.sourceLocale}\u0000${entry.targetLocale}\u0000${entry.sourceText}`;
}

function toTMEntry(record: {
  id: string;
  sourceLocale: string;
  targetLocale: string;
  sourceText: string;
  translatedText: string;
  context: string | null;
  category: string | null;
  quality: number;
  usageCount: number;
}): TMEntry {
  return {
    id: record.id,
    sourceLocale: record.sourceLocale,
    targetLocale: record.targetLocale,
    sourceText: record.sourceText,
    translatedText: record.translatedText,
    context: record.context ?? undefined,
    category: record.category ?? undefined,
    quality: record.quality,
    usageCount: record.usageCount,
  };
}
