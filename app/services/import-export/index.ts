// ---------------------------------------------------------------------------
// Bulk Import/Export for Translations (T0027)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImportFormat = "csv" | "json" | "xliff" | "po";

export interface ImportEntry {
  key: string;
  locale: string;
  text: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

export interface ExportEntry {
  key: string;
  locale: string;
  sourceText: string;
  translatedText: string;
}

export interface ExportResult {
  data: string;
  format: string;
  filename: string;
  recordCount: number;
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

/**
 * Escape a value for CSV output. Wraps in double-quotes if the value
 * contains a comma, newline, or double-quote.
 */
function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parse a single CSV line, respecting quoted fields.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }

  fields.push(current);
  return fields;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a CSV string with header row: key,locale,text
 * Returns an array of import entries.
 */
export function parseCSVImport(csv: string): ImportEntry[] {
  const lines = csv.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return [];
  }

  // Validate header
  const header = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const keyIdx = header.indexOf("key");
  const localeIdx = header.indexOf("locale");
  const textIdx = header.indexOf("text");

  if (keyIdx === -1 || localeIdx === -1 || textIdx === -1) {
    return [];
  }

  const entries: ImportEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length > Math.max(keyIdx, localeIdx, textIdx)) {
      entries.push({
        key: fields[keyIdx].trim(),
        locale: fields[localeIdx].trim(),
        text: fields[textIdx].trim(),
      });
    }
  }

  return entries;
}

/**
 * Parse a JSON string containing an array of { key, locale, text } objects.
 */
export function parseJSONImport(json: string): ImportEntry[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item: unknown) =>
          typeof item === "object" &&
          item !== null &&
          "key" in item &&
          "locale" in item &&
          "text" in item,
      )
      .map((item: Record<string, unknown>) => ({
        key: String(item.key),
        locale: String(item.locale),
        text: String(item.text),
      }));
  } catch {
    return [];
  }
}

/**
 * Validate import data. Returns valid entries and per-row errors.
 */
export function validateImportData(
  data: ImportEntry[],
): { valid: ImportEntry[]; errors: Array<{ row: number; error: string }> } {
  const valid: ImportEntry[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    const row = i + 1;

    if (!entry.key || entry.key.trim().length === 0) {
      errors.push({ row, error: "Missing or empty key" });
      continue;
    }

    if (!entry.locale || entry.locale.trim().length === 0) {
      errors.push({ row, error: "Missing or empty locale" });
      continue;
    }

    // Validate locale format (basic BCP-47 check: 2-3 letter lang code)
    if (!/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/.test(entry.locale)) {
      errors.push({ row, error: `Invalid locale format: "${entry.locale}"` });
      continue;
    }

    if (!entry.text || entry.text.trim().length === 0) {
      errors.push({ row, error: "Missing or empty text" });
      continue;
    }

    valid.push(entry);
  }

  return { valid, errors };
}

/**
 * Export translation entries to CSV format.
 */
export function exportToCSV(entries: ExportEntry[]): string {
  const header = "key,locale,sourceText,translatedText";
  const rows = entries.map(
    (e) =>
      `${csvEscape(e.key)},${csvEscape(e.locale)},${csvEscape(e.sourceText)},${csvEscape(e.translatedText)}`,
  );

  return [header, ...rows].join("\n");
}

/**
 * Export translation entries to formatted JSON.
 */
export function exportToJSON(entries: ExportEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

/**
 * Auto-detect the import format from content.
 */
export function detectFormat(content: string): ImportFormat {
  const trimmed = content.trim();

  // JSON array
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return "json";
  }

  // XLIFF
  if (
    trimmed.includes("<xliff") ||
    trimmed.includes('xmlns:xliff') ||
    trimmed.includes("<trans-unit")
  ) {
    return "xliff";
  }

  // PO (gettext)
  if (trimmed.includes("msgid ") && trimmed.includes("msgstr ")) {
    return "po";
  }

  // Default to CSV
  return "csv";
}
