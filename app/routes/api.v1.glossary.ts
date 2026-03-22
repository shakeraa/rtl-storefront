/**
 * API v1 — Glossary (T0020)
 *
 * GET    /api/v1/glossary?shop=myshop&locale=ar
 * POST   /api/v1/glossary  { term }
 * DELETE /api/v1/glossary  { id }
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  getAllTerms,
  addTerm,
  deleteTerm,
} from "../services/translation-memory/glossary";

// ---------------------------------------------------------------------------
// GET loader
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? undefined;

  const terms = await getAllTerms(session.shop, locale);

  return json({
    shop: session.shop,
    locale: locale ?? null,
    terms,
    count: terms.length,
  });
}

// ---------------------------------------------------------------------------
// POST / DELETE action
// ---------------------------------------------------------------------------

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const method = request.method.toUpperCase();

  // ------ DELETE ------
  if (method === "DELETE") {
    const body = await request.json();
    const { id } = body as { id?: string };

    if (!id) {
      return json({ error: "Missing required field: id" }, { status: 400 });
    }

    try {
      await deleteTerm(id);
      return json({ success: true, deleted: id });
    } catch (err) {
      return json(
        { error: "Failed to delete glossary term", detail: String(err) },
        { status: 500 },
      );
    }
  }

  // ------ POST ------
  if (method === "POST") {
    const body = await request.json();
    const { term } = body as {
      term?: {
        sourceLocale: string;
        targetLocale: string;
        sourceTerm: string;
        translatedTerm: string;
        neverTranslate?: boolean;
        caseSensitive?: boolean;
        category?: string;
        notes?: string;
      };
    };

    if (
      !term ||
      !term.sourceLocale ||
      !term.targetLocale ||
      !term.sourceTerm ||
      !term.translatedTerm
    ) {
      return json(
        {
          error:
            "Missing required fields: term.sourceLocale, term.targetLocale, term.sourceTerm, term.translatedTerm",
        },
        { status: 400 },
      );
    }

    const created = await addTerm(session.shop, {
      sourceLocale: term.sourceLocale,
      targetLocale: term.targetLocale,
      sourceTerm: term.sourceTerm,
      translatedTerm: term.translatedTerm,
      neverTranslate: term.neverTranslate ?? false,
      caseSensitive: term.caseSensitive ?? false,
      category: term.category,
      notes: term.notes,
    });

    return json({ success: true, term: created }, { status: 201 });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
