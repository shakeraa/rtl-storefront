import { describe, it, expect } from 'vitest';
import {
  parseCSV,
  generateCSV,
  parseJSON,
  generateJSON,
  validateImportData,
} from '../../app/services/import-export/index';

describe('Import/Export Service', () => {
  describe('CSV Parsing', () => {
    it('should parse CSV content', () => {
      const csv = `key,sourceText,targetText,locale
product.title,Abaya,عباية,ar
collection.name,Dresses,فساتين,ar`;

      const result = parseCSV(csv, { format: 'csv', encoding: 'utf-8', skipHeader: true });
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('product.title');
      expect(result[0].targetText).toBe('عباية');
    });

    it('should handle custom delimiter', () => {
      const csv = `key;sourceText;targetText;locale
product.title;Abaya;عباية;ar`;

      const result = parseCSV(csv, { format: 'csv', delimiter: ';', encoding: 'utf-8', skipHeader: true });
      expect(result).toHaveLength(1);
      expect(result[0].targetText).toBe('عباية');
    });

    it('should skip header when configured', () => {
      const csv = `key,sourceText,targetText,locale
product.title,Abaya,عباية,ar`;

      const result = parseCSV(csv, { format: 'csv', encoding: 'utf-8', skipHeader: true });
      expect(result).toHaveLength(1);
    });
  });

  describe('CSV Generation', () => {
    it('should generate CSV content', () => {
      const rows = [
        {
          key: 'product.title',
          sourceText: 'Abaya',
          translations: { ar: 'عباية', he: 'עבאיה' },
          context: 'product',
          lastUpdated: '2024-01-01',
        },
      ];

      const csv = generateCSV(rows, { format: 'csv', encoding: 'utf-8' });
      expect(csv).toContain('key');
      expect(csv).toContain('product.title');
      expect(csv).toContain('Abaya');
    });
  });

  describe('JSON Parsing', () => {
    it('should parse JSON array', () => {
      const json = JSON.stringify([
        { key: 'product.title', sourceText: 'Abaya', targetText: 'عباية', locale: 'ar' },
      ]);

      const result = parseJSON(json);
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('product.title');
    });

    it('should parse nested JSON object', () => {
      const json = JSON.stringify({
        'product.title': { ar: 'عباية', he: 'עבאיה' },
      });

      const result = parseJSON(json);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for invalid JSON', () => {
      const result = parseJSON('invalid');
      expect(result).toHaveLength(0);
    });
  });

  describe('JSON Generation', () => {
    it('should generate JSON content', () => {
      const rows = [
        {
          key: 'product.title',
          sourceText: 'Abaya',
          translations: { ar: 'عباية' },
          lastUpdated: '2024-01-01',
        },
      ];

      const json = generateJSON(rows);
      const parsed = JSON.parse(json);
      expect(parsed['product.title']).toEqual({ ar: 'عباية' });
    });
  });

  describe('Validation', () => {
    it('should validate correct data', () => {
      const rows = [
        { key: 'product.title', sourceText: 'Abaya', targetText: 'عباية', locale: 'ar' },
      ];

      const result = validateImportData(rows);
      expect(result.valid).toBe(true);
      expect(result.validRows).toHaveLength(1);
    });

    it('should reject rows with missing key', () => {
      const rows = [
        { key: '', sourceText: 'Abaya', targetText: 'عباية', locale: 'ar' },
      ];

      const result = validateImportData(rows);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should reject rows with missing locale', () => {
      const rows = [
        { key: 'product.title', sourceText: 'Abaya', targetText: 'عباية', locale: '' },
      ];

      const result = validateImportData(rows);
      expect(result.valid).toBe(false);
    });
  });
});
