import prisma from "../../db.server";
import { calculateSimilarity, normalizeForMatching } from "./matcher";
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
  });

  if (existing) {
    const updated = await prisma.translationMemory.update({
      where: { id: existing.id },
      data: {
        translatedText: entry.translatedText,
        context: entry.context ?? null,
        category: entry.category ?? null,
        quality: entry.quality,
        lastUsedAt: new Date(),
      },
    });

    return toTMEntry(updated);
  }

  const created = await prisma.translationMemory.create({
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

  return toTMEntry(created);
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
  const results: TMSearchResult[] = [];

  const exact = await findExact(shop, sourceLocale, targetLocale, sourceText);
  if (exact) {
    results.push({
      entry: exact,
      similarity: 1,
      matchType: "exact",
    });
  }

  const fuzzy = await findFuzzy(
    shop,
    sourceLocale,
    targetLocale,
    sourceText,
    threshold,
  );

  return [...results, ...fuzzy];
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
  const totalEntries = await prisma.translationMemory.count({ where: { shop } });

  const entries = await prisma.translationMemory.findMany({
    where: { shop },
    select: { sourceLocale: true, targetLocale: true },
  });

  const pairMap = new Map<string, { sourceLocale: string; targetLocale: string; count: number }>();
  for (const entry of entries) {
    const key = `${entry.sourceLocale}:${entry.targetLocale}`;
    const existing = pairMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      pairMap.set(key, {
        sourceLocale: entry.sourceLocale,
        targetLocale: entry.targetLocale,
        count: 1,
      });
    }
  }

  return {
    totalEntries,
    languagePairs: Array.from(pairMap.values()),
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
  let imported = 0;
  let updated = 0;

  for (const entry of data.entries) {
    const existing = await prisma.translationMemory.findFirst({
      where: {
        shop,
        sourceLocale: entry.sourceLocale,
        targetLocale: entry.targetLocale,
        sourceText: entry.sourceText,
      },
    });

    if (existing) {
      await prisma.translationMemory.update({
        where: { id: existing.id },
        data: {
          translatedText: entry.translatedText,
          context: entry.context ?? null,
          category: entry.category ?? null,
        },
      });
      updated++;
    } else {
      await prisma.translationMemory.create({
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
      imported++;
    }
  }

  return { imported, updated };
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
