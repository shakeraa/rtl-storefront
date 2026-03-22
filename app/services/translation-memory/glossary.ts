import prisma from "../../db.server";
import type { GlossaryTerm } from "./types";

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
  const allTerms = await prisma.glossaryEntry.findMany({
    where: {
      shop,
      sourceLocale,
      targetLocale,
    },
  });

  const matches: GlossaryTerm[] = [];

  for (const term of allTerms) {
    const sourceText = term.caseSensitive ? text : text.toLowerCase();
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
  let imported = 0;
  let updated = 0;

  for (const term of terms) {
    const existing = await prisma.glossaryEntry.findUnique({
      where: {
        shop_sourceLocale_targetLocale_sourceTerm: {
          shop,
          sourceLocale: term.sourceLocale,
          targetLocale: term.targetLocale,
          sourceTerm: term.sourceTerm,
        },
      },
    });

    if (existing) {
      await prisma.glossaryEntry.update({
        where: { id: existing.id },
        data: {
          translatedTerm: term.translatedTerm,
          neverTranslate: term.neverTranslate,
          caseSensitive: term.caseSensitive,
          category: term.category ?? null,
          notes: term.notes ?? null,
        },
      });
      updated++;
    } else {
      await prisma.glossaryEntry.create({
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
      imported++;
    }
  }

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
