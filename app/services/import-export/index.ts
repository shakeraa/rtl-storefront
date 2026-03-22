/**
 * Import/Export Service
 * T0017: Import Export
 */

export interface ImportConfig {
  format: 'csv' | 'json' | 'xlsx';
  delimiter?: string;
  encoding: string;
  skipHeader?: boolean;
}

export interface ExportConfig {
  format: 'csv' | 'json' | 'xlsx';
  delimiter?: string;
  encoding: string;
  includeHeader?: boolean;
}

export interface TranslationImportRow {
  key: string;
  sourceText: string;
  targetText: string;
  locale: string;
  context?: string;
}

export interface TranslationExportRow {
  key: string;
  sourceText: string;
  translations: Record<string, string>;
  context?: string;
  lastUpdated: string;
}

// Parse CSV content
export function parseCSV(
  content: string,
  config: ImportConfig
): TranslationImportRow[] {
  const delimiter = config.delimiter || ',';
  const lines = content.split('\n').filter((l) => l.trim());
  
  const startIndex = config.skipHeader ? 1 : 0;
  const rows: TranslationImportRow[] = [];
  
  for (let i = startIndex; i < lines.length; i++) {
    const columns = lines[i].split(delimiter);
    if (columns.length >= 4) {
      rows.push({
        key: columns[0].trim(),
        sourceText: columns[1].trim(),
        targetText: columns[2].trim(),
        locale: columns[3].trim(),
        context: columns[4]?.trim(),
      });
    }
  }
  
  return rows;
}

// Generate CSV content
export function generateCSV(
  rows: TranslationExportRow[],
  config: ExportConfig
): string {
  const delimiter = config.delimiter || ',';
  const lines: string[] = [];
  
  // Header
  if (config.includeHeader !== false) {
    lines.push(['key', 'sourceText', 'translations', 'context', 'lastUpdated'].join(delimiter));
  }
  
  // Data rows
  for (const row of rows) {
    const translationStr = JSON.stringify(row.translations).replace(/"/g, '""');
    lines.push([
      row.key,
      `"${row.sourceText.replace(/"/g, '""')}"`,
      `"${translationStr}"`,
      row.context || '',
      row.lastUpdated,
    ].join(delimiter));
  }
  
  return lines.join('\n');
}

// Parse JSON content
export function parseJSON(content: string): TranslationImportRow[] {
  try {
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      return data as TranslationImportRow[];
    }
    
    // Handle nested format
    const rows: TranslationImportRow[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        const v = value as Record<string, string>;
        for (const [locale, text] of Object.entries(v)) {
          rows.push({
            key,
            sourceText: '',
            targetText: text,
            locale,
          });
        }
      }
    }
    
    return rows;
  } catch {
    return [];
  }
}

// Generate JSON content
export function generateJSON(rows: TranslationExportRow[]): string {
  const data: Record<string, Record<string, string>> = {};
  
  for (const row of rows) {
    data[row.key] = row.translations;
  }
  
  return JSON.stringify(data, null, 2);
}

// Validate import data
export function validateImportData(rows: TranslationImportRow[]): {
  valid: boolean;
  errors: string[];
  validRows: TranslationImportRow[];
} {
  const errors: string[] = [];
  const validRows: TranslationImportRow[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowErrors: string[] = [];
    
    if (!row.key) rowErrors.push('Missing key');
    if (!row.locale) rowErrors.push('Missing locale');
    if (!row.targetText) rowErrors.push('Missing target text');
    
    if (rowErrors.length > 0) {
      errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`);
    } else {
      validRows.push(row);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    validRows,
  };
}

// Export all
export * from './constants';
