// ---------------------------------------------------------------------------
// Visual In-Context Editor & Manual Translation Entry (T0019 + T0026)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldStatus = "translated" | "draft" | "untranslated";

export interface EditorField {
  key: string;
  sourceText: string;
  translatedText: string;
  locale: string;
  resourceType: string;
  resourceId: string;
  status: FieldStatus;
}

export interface EditorContext {
  shop: string;
  sourceLocale: string;
  targetLocale: string;
  resourceType: string;
  resourceId: string;
  fields: EditorField[];
}

export interface SideBySideView {
  left: { locale: string; text: string };
  right: { locale: string; text: string; editable: boolean };
}

export interface FieldHistoryEntry {
  text: string;
  savedAt: Date;
  savedBy: string;
}

export interface CompletionStats {
  total: number;
  translated: number;
  draft: number;
  untranslated: number;
  percent: number;
}

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------

// Stores saved translations: Map<compositeKey, EditorField>
const savedFields = new Map<string, EditorField>();

// Stores field edit history: Map<compositeKey, FieldHistoryEntry[]>
const fieldHistory = new Map<string, FieldHistoryEntry[]>();

function compositeKey(shop: string, key: string, locale: string): string {
  return `${shop}::${key}::${locale}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create an editor context for a specific resource.
 * Loads any previously saved fields from in-memory storage.
 */
export function createEditorContext(
  shop: string,
  sourceLocale: string,
  targetLocale: string,
  resourceType: string,
  resourceId: string,
): EditorContext {
  // Collect any previously saved fields for this resource
  const fields: EditorField[] = [];
  savedFields.forEach((field) => {
    if (
      field.resourceType === resourceType &&
      field.resourceId === resourceId &&
      field.locale === targetLocale
    ) {
      fields.push({ ...field });
    }
  });

  return {
    shop,
    sourceLocale,
    targetLocale,
    resourceType,
    resourceId,
    fields,
  };
}

/**
 * Update a single field's translated text within an editor context.
 * Returns a new context with the updated field.
 */
export function updateField(
  context: EditorContext,
  key: string,
  translatedText: string,
): EditorContext {
  const updatedFields = context.fields.map((field) => {
    if (field.key === key) {
      return {
        ...field,
        translatedText,
        status: (translatedText.trim() ? "draft" : "untranslated") as FieldStatus,
      };
    }
    return field;
  });

  // If field doesn't exist yet, add it
  const exists = context.fields.some((f) => f.key === key);
  if (!exists) {
    updatedFields.push({
      key,
      sourceText: "",
      translatedText,
      locale: context.targetLocale,
      resourceType: context.resourceType,
      resourceId: context.resourceId,
      status: translatedText.trim() ? "draft" : "untranslated",
    });
  }

  return { ...context, fields: updatedFields };
}

/**
 * Save all modified (draft) fields to in-memory storage.
 * Returns the count of saved fields and any errors.
 */
export function saveAllFields(
  context: EditorContext,
): { saved: number; errors: string[] } {
  let saved = 0;
  const errors: string[] = [];

  for (const field of context.fields) {
    if (field.status === "untranslated") {
      continue;
    }

    try {
      const ck = compositeKey(context.shop, field.key, field.locale);

      // Save the field
      const savedField: EditorField = {
        ...field,
        status: "translated",
      };
      savedFields.set(ck, savedField);

      // Append to history
      const history = fieldHistory.get(ck) || [];
      history.push({
        text: field.translatedText,
        savedAt: new Date(),
        savedBy: context.shop,
      });
      fieldHistory.set(ck, history);

      saved++;
    } catch (err) {
      errors.push(`Failed to save field "${field.key}": ${String(err)}`);
    }
  }

  return { saved, errors };
}

/**
 * Get completion statistics for an editor context.
 */
export function getCompletionStats(context: EditorContext): CompletionStats {
  const total = context.fields.length;
  let translated = 0;
  let draft = 0;
  let untranslated = 0;

  for (const field of context.fields) {
    switch (field.status) {
      case "translated":
        translated++;
        break;
      case "draft":
        draft++;
        break;
      case "untranslated":
        untranslated++;
        break;
    }
  }

  const percent = total > 0 ? Math.round((translated / total) * 100) : 0;

  return { total, translated, draft, untranslated, percent };
}

/**
 * Build a side-by-side view for comparing source and translated text.
 */
export function buildSideBySideView(
  sourceText: string,
  translatedText: string,
  sourceLocale: string,
  targetLocale: string,
): SideBySideView {
  return {
    left: { locale: sourceLocale, text: sourceText },
    right: { locale: targetLocale, text: translatedText, editable: true },
  };
}

/**
 * Get the edit history for a specific field.
 */
export function getFieldHistory(
  shop: string,
  key: string,
  locale: string,
): FieldHistoryEntry[] {
  const ck = compositeKey(shop, key, locale);
  return fieldHistory.get(ck) || [];
}

/**
 * Suggest a translation for source text.
 * Stub implementation that returns the source text unchanged.
 * Intended to be wired to an AI provider at the route level.
 */
export function suggestTranslation(
  sourceText: string,
  _sourceLocale: string,
  _targetLocale: string,
): string {
  return sourceText;
}
