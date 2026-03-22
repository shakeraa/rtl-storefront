import prisma from "../../db.server";
import type { GlossaryLanguageBucket, GlossaryTerm } from "./types";

/**
 * Add or update a glossary term.
 * Uses the unique constraint (shop, sourceLocale, targetLocale, sourceTerm) for upsert.
 */
export async function addTerm(
  shop: string,
  term: Omit<GlossaryTerm, "id">,
): Promise<GlossaryTerm> {
  const record = await prisma.glossaryEntry.upsert({
    where: {
      shop_sourceLocale_targetLocale_sourceTerm: {
        shop,
        sourceLocale: term.sourceLocale,
        targetLocale: term.targetLocale,
        sourceTerm: term.sourceTerm,
      },
    },
    create: {
      shop,
      sourceLocale: term.sourceLocale,
      targetLocale: term.targetLocale,
      sourceTerm: term.sourceTerm,
      translatedTerm: term.translatedTerm,
      neverTranslate: term.neverTranslate,
      caseSensitive: term.caseSensitive,
      category: term.category ?? null,
      notes: term.notes ?? null,
    },
    update: {
      translatedTerm: term.translatedTerm,
      neverTranslate: term.neverTranslate,
      caseSensitive: term.caseSensitive,
      category: term.category ?? null,
      notes: term.notes ?? null,
    },
  });

  return toGlossaryTerm(record);
}

/**
 * Find glossary terms that appear in the given text.
 */
export async function findTerms(
  shop: string,
  sourceLocale: string,
  targetLocale: string,
  text: string,
): Promise<GlossaryTerm[]> {
  if (text.trim().length === 0) {
    return [];
  }

  const normalizedText = text.toLowerCase();
  const allTerms = await prisma.glossaryEntry.findMany({
    where: {
      shop,
      sourceLocale,
      targetLocale,
    },
    select: {
      id: true,
      sourceLocale: true,
      targetLocale: true,
      sourceTerm: true,
      translatedTerm: true,
      neverTranslate: true,
      caseSensitive: true,
      category: true,
      notes: true,
    },
  });

  const matches: GlossaryTerm[] = [];

  for (const term of allTerms) {
    const sourceText = term.caseSensitive ? text : normalizedText;
    const sourceTerm = term.caseSensitive
      ? term.sourceTerm
      : term.sourceTerm.toLowerCase();

    if (sourceText.includes(sourceTerm)) {
      matches.push(toGlossaryTerm(term));
    }
  }

  return matches;
}

/**
 * Get all terms marked as "never translate" for a given shop and source locale.
 */
export async function getNeverTranslateTerms(
  shop: string,
  sourceLocale: string,
): Promise<GlossaryTerm[]> {
  const records = await prisma.glossaryEntry.findMany({
    where: {
      shop,
      sourceLocale,
      neverTranslate: true,
    },
  });

  return records.map(toGlossaryTerm);
}

/**
 * List all glossary terms for a shop, with optional locale filters.
 */
export async function getAllTerms(
  shop: string,
  sourceLocale?: string,
  targetLocale?: string,
): Promise<GlossaryTerm[]> {
  const where: {
    shop: string;
    sourceLocale?: string;
    targetLocale?: string;
  } = { shop };

  if (sourceLocale) {
    where.sourceLocale = sourceLocale;
  }
  if (targetLocale) {
    where.targetLocale = targetLocale;
  }

  const records = await prisma.glossaryEntry.findMany({
    where,
    orderBy: { sourceTerm: "asc" },
  });

  return records.map(toGlossaryTerm);
}

/**
 * List the target locales that currently have glossary entries.
 */
export async function getGlossaryTargetLocales(
  shop: string,
  sourceLocale?: string,
): Promise<string[]> {
  const records = await prisma.glossaryEntry.findMany({
    where: {
      shop,
      ...(sourceLocale ? { sourceLocale } : {}),
    },
    select: { targetLocale: true },
    distinct: ["targetLocale"],
    orderBy: { targetLocale: "asc" },
  });

  return records.map((record) => record.targetLocale);
}

/**
 * Group glossary terms into separate buckets per target language.
 */
export async function getGlossariesByLanguage(
  shop: string,
  sourceLocale?: string,
): Promise<GlossaryLanguageBucket[]> {
  const records = await prisma.glossaryEntry.findMany({
    where: {
      shop,
      ...(sourceLocale ? { sourceLocale } : {}),
    },
    orderBy: [{ targetLocale: "asc" }, { sourceTerm: "asc" }],
  });

  const buckets = new Map<string, GlossaryLanguageBucket>();

  for (const record of records) {
    const term = toGlossaryTerm(record);
    const key = `${term.sourceLocale}\u0000${term.targetLocale}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.terms.push(term);
      existing.termCount += 1;
      existing.neverTranslateCount += term.neverTranslate ? 1 : 0;
      continue;
    }

    buckets.set(key, {
      sourceLocale: term.sourceLocale,
      targetLocale: term.targetLocale,
      termCount: 1,
      neverTranslateCount: term.neverTranslate ? 1 : 0,
      terms: [term],
    });
  }

  return Array.from(buckets.values());
}

/**
 * Delete a glossary term by ID.
 */
export async function deleteTerm(id: string): Promise<void> {
  await prisma.glossaryEntry.delete({ where: { id } });
}

/**
 * Bulk import glossary terms. Uses upsert logic for each term.
 */
export async function importTerms(
  shop: string,
  terms: Array<Omit<GlossaryTerm, "id">>,
): Promise<{ imported: number; updated: number }> {
  if (terms.length === 0) {
    return { imported: 0, updated: 0 };
  }

  const groupedTerms = groupImportTerms(terms);
  const existingTerms = await prisma.glossaryEntry.findMany({
    where: {
      shop,
      OR: groupedTerms.map(({ term }) => ({
        sourceLocale: term.sourceLocale,
        targetLocale: term.targetLocale,
        sourceTerm: term.sourceTerm,
      })),
    },
    select: {
      id: true,
      sourceLocale: true,
      targetLocale: true,
      sourceTerm: true,
    },
  });
  const existingByKey = new Map(
    existingTerms.map((term) => [getGlossaryKey(term), term]),
  );

  let imported = 0;
  let updated = 0;
  const operations = groupedTerms.map(({ term, occurrences }) => {
    const existing = existingByKey.get(getGlossaryKey(term));

    if (existing) {
      updated += occurrences;

      return prisma.glossaryEntry.update({
        where: { id: existing.id },
        data: {
          translatedTerm: term.translatedTerm,
          neverTranslate: term.neverTranslate,
          caseSensitive: term.caseSensitive,
          category: term.category ?? null,
          notes: term.notes ?? null,
        },
      });
    }

    imported += 1;
    updated += occurrences - 1;

    return prisma.glossaryEntry.create({
      data: {
        shop,
        sourceLocale: term.sourceLocale,
        targetLocale: term.targetLocale,
        sourceTerm: term.sourceTerm,
        translatedTerm: term.translatedTerm,
        neverTranslate: term.neverTranslate,
        caseSensitive: term.caseSensitive,
        category: term.category ?? null,
        notes: term.notes ?? null,
      },
    });
  });

  await prisma.$transaction(operations);

  return { imported, updated };
}

/**
 * Export all glossary terms for a shop.
 */
export async function exportTerms(shop: string): Promise<GlossaryTerm[]> {
  const records = await prisma.glossaryEntry.findMany({
    where: { shop },
    orderBy: { sourceTerm: "asc" },
  });

  return records.map(toGlossaryTerm);
}

/**
 * Export glossary terms grouped by target language.
 */
export async function exportTermsByLanguage(
  shop: string,
  sourceLocale?: string,
): Promise<Record<string, GlossaryTerm[]>> {
  const glossaries = await getGlossariesByLanguage(shop, sourceLocale);

  return Object.fromEntries(
    glossaries.map((glossary) => [glossary.targetLocale, glossary.terms]),
  );
}

function toGlossaryTerm(record: {
  id: string;
  sourceLocale: string;
  targetLocale: string;
  sourceTerm: string;
  translatedTerm: string;
  neverTranslate: boolean;
  caseSensitive: boolean;
  category: string | null;
  notes: string | null;
}): GlossaryTerm {
  return {
    id: record.id,
    sourceLocale: record.sourceLocale,
    targetLocale: record.targetLocale,
    sourceTerm: record.sourceTerm,
    translatedTerm: record.translatedTerm,
    neverTranslate: record.neverTranslate,
    caseSensitive: record.caseSensitive,
    category: record.category ?? undefined,
    notes: record.notes ?? undefined,
  };
}

function groupImportTerms(terms: Array<Omit<GlossaryTerm, "id">>): Array<{
  term: Omit<GlossaryTerm, "id">;
  occurrences: number;
}> {
  const grouped = new Map<
    string,
    {
      term: Omit<GlossaryTerm, "id">;
      occurrences: number;
    }
  >();

  for (const term of terms) {
    const key = getGlossaryKey(term);
    const existing = grouped.get(key);

    if (existing) {
      existing.term = term;
      existing.occurrences += 1;
      continue;
    }

    grouped.set(key, { term, occurrences: 1 });
  }

  return Array.from(grouped.values());
}

function getGlossaryKey(term: {
  sourceLocale: string;
  targetLocale: string;
  sourceTerm: string;
}): string {
  return `${term.sourceLocale}\u0000${term.targetLocale}\u0000${term.sourceTerm}`;
}
