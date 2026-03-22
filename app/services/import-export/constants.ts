/**
 * Import/Export Service Constants
 */

export const SUPPORTED_FORMATS = ['csv', 'json', 'xlsx'];

export const DEFAULT_IMPORT_CONFIG = {
  format: 'csv' as const,
  delimiter: ',',
  encoding: 'utf-8',
  skipHeader: false,
};

export const DEFAULT_EXPORT_CONFIG = {
  format: 'csv' as const,
  delimiter: ',',
  encoding: 'utf-8',
  includeHeader: true,
};

export const MAX_IMPORT_ROWS = 10000;
