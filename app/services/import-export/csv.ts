/**
 * CSV-specific import/export utilities (T0027)
 *
 * Provides proper CSV parsing, generation, validation, delimiter detection,
 * and a translation-specific CSV format converter.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CSVValidationResult {
  valid: boolean;
  errors: string[];
  rowCount: number;
}

export interface TranslationEntry {
  key: string;
  locale: string;
  sourceText: string;
  translatedText: string;
}

// ---------------------------------------------------------------------------
// parseCSV
// ---------------------------------------------------------------------------

/**
 * Parse a CSV string into an array of record objects keyed by header names.
 * Handles quoted fields, commas inside quotes, escaped double-quotes, and
 * newlines within quoted fields.
 */
export function parseCSV(
  content: string,
  delimiter?: string,
): Array<Record<string, string>> {
  const sep = delimiter ?? detectCSVDelimiter(content);
  const rows = splitCSVRows(content);

  if (rows.length < 2) {
    return [];
  }

  const headers = parseCSVRow(rows[0], sep).map((h) => h.trim());
  const results: Array<Record<string, string>> = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.trim().length === 0) continue;

    const values = parseCSVRow(row, sep);
    const record: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = (values[j] ?? "").trim();
    }

    results.push(record);
  }

  return results;
}

// ---------------------------------------------------------------------------
// generateCSV
// ---------------------------------------------------------------------------

/**
 * Generate a CSV string from an array of record objects.
 * If `columns` is provided, only those columns are included (in order).
 * Otherwise, columns are derived from the union of all object keys.
 */
export function generateCSV(
  data: Array<Record<string, string>>,
  columns?: string[],
): string {
  if (data.length === 0) {
    return columns ? columns.map(csvEscape).join(",") : "";
  }

  const cols =
    columns ??
    Array.from(
      data.reduce((set, row) => {
        for (const key of Object.keys(row)) set.add(key);
        return set;
      }, new Set<string>()),
    );

  const header = cols.map(csvEscape).join(",");
  const rows = data.map((row) =>
    cols.map((col) => csvEscape(row[col] ?? "")).join(","),
  );

  return [header, ...rows].join("\n");
}

// ---------------------------------------------------------------------------
// validateCSVStructure
// ---------------------------------------------------------------------------

/**
 * Validate that a CSV string has all required columns and is structurally
 * sound (consistent column count across rows).
 */
export function validateCSVStructure(
  content: string,
  requiredColumns: string[],
): CSVValidationResult {
  const errors: string[] = [];
  const sep = detectCSVDelimiter(content);
  const rows = splitCSVRows(content);

  if (rows.length === 0) {
    return { valid: false, errors: ["CSV content is empty."], rowCount: 0 };
  }

  const headers = parseCSVRow(rows[0], sep).map((h) => h.trim().toLowerCase());

  // Check required columns
  for (const col of requiredColumns) {
    if (!headers.includes(col.toLowerCase())) {
      errors.push(`Missing required column: "${col}".`);
    }
  }

  const expectedColCount = headers.length;
  let dataRowCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.trim().length === 0) continue;

    dataRowCount++;
    const values = parseCSVRow(row, sep);

    if (values.length !== expectedColCount) {
      errors.push(
        `Row ${i + 1}: expected ${expectedColCount} columns but found ${values.length}.`,
      );
    }
  }

  if (dataRowCount === 0) {
    errors.push("CSV contains a header row but no data rows.");
  }

  return {
    valid: errors.length === 0,
    errors,
    rowCount: dataRowCount,
  };
}

// ---------------------------------------------------------------------------
// detectCSVDelimiter
// ---------------------------------------------------------------------------

/**
 * Auto-detect the delimiter of a CSV string by counting occurrences of
 * common delimiters in the first line.
 */
export function detectCSVDelimiter(content: string): "," | ";" | "\t" {
  // Use only the first line for detection
  const firstLine = content.split("\n")[0] ?? "";

  const counts: Record<string, number> = {
    ",": 0,
    ";": 0,
    "\t": 0,
  };

  let inQuotes = false;
  for (const ch of firstLine) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch in counts) {
      counts[ch]++;
    }
  }

  // Return the delimiter with the highest count; default to comma on tie
  if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) return "\t";
  if (counts[";"] > counts[","]) return ";";
  return ",";
}

// ---------------------------------------------------------------------------
// csvToTranslationEntries
// ---------------------------------------------------------------------------

/**
 * Parse a translation-specific CSV format into structured entries.
 *
 * Expected columns: key, locale, sourceText (or source_text), translatedText (or translated_text).
 * Column name matching is case-insensitive.
 */
export function csvToTranslationEntries(csv: string): TranslationEntry[] {
  const records = parseCSV(csv);
  const entries: TranslationEntry[] = [];

  for (const record of records) {
    // Normalize keys to lowercase for flexible matching
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(record)) {
      normalized[k.toLowerCase().replace(/[_\s-]/g, "")] = v;
    }

    const key = normalized["key"] ?? "";
    const locale = normalized["locale"] ?? "";
    const sourceText =
      normalized["sourcetext"] ?? normalized["source"] ?? "";
    const translatedText =
      normalized["translatedtext"] ?? normalized["translated"] ?? normalized["translation"] ?? "";

    if (key && locale) {
      entries.push({ key, locale, sourceText, translatedText });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Split CSV content into logical rows, respecting newlines inside quoted fields.
 */
function splitCSVRows(content: string): string[] {
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "\r") {
      // Skip carriage returns; handle \r\n as a single newline
      continue;
    } else if (ch === "\n" && !inQuotes) {
      rows.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  // Push the last row if non-empty
  if (current.length > 0) {
    rows.push(current);
  }

  return rows;
}

/**
 * Parse a single CSV row into field values, respecting quoted fields.
 */
function parseCSVRow(row: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < row.length && row[i + 1] === '"') {
          // Escaped double-quote
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
      } else if (ch === delimiter) {
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

/**
 * Escape a value for CSV output. Wraps in double-quotes if the value
 * contains the delimiter, a newline, or a double-quote.
 */
function csvEscape(value: string): string {
  if (
    value.includes(",") ||
    value.includes(";") ||
    value.includes("\t") ||
    value.includes('"') ||
    value.includes("\n")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
