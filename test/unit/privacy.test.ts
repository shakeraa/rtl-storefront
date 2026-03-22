import { describe, it, expect } from 'vitest';
import type {
  DataExportResult,
  DeletionResult,
  ConsentInput,
  RetentionPolicyInput,
  ConsentPurpose,
  PrivacyDashboardData,
} from '../../app/services/privacy/types';

describe('Privacy Service Types', () => {
  describe('ConsentPurpose type', () => {
    it('accepts "translation_processing" as a valid purpose', () => {
      const purpose: ConsentPurpose = 'translation_processing';
      expect(purpose).toBe('translation_processing');
    });

    it('accepts "analytics" as a valid purpose', () => {
      const purpose: ConsentPurpose = 'analytics';
      expect(purpose).toBe('analytics');
    });

    it('accepts "marketing" as a valid purpose', () => {
      const purpose: ConsentPurpose = 'marketing';
      expect(purpose).toBe('marketing');
    });

    it('accepts "third_party_sharing" as a valid purpose', () => {
      const purpose: ConsentPurpose = 'third_party_sharing';
      expect(purpose).toBe('third_party_sharing');
    });
  });

  describe('DataExportResult structure', () => {
    it('has the expected shape with shop, exportedAt, and data fields', () => {
      const result: DataExportResult = {
        shop: 'test-shop.myshopify.com',
        exportedAt: '2026-01-01T00:00:00.000Z',
        data: {
          sessions: [],
          translationCache: [],
          consents: [],
          accessLogs: [],
        },
      };

      expect(result.shop).toBe('test-shop.myshopify.com');
      expect(result.exportedAt).toBe('2026-01-01T00:00:00.000Z');
      expect(result.data).toHaveProperty('sessions');
      expect(result.data).toHaveProperty('translationCache');
      expect(result.data).toHaveProperty('consents');
      expect(result.data).toHaveProperty('accessLogs');
      expect(Array.isArray(result.data.sessions)).toBe(true);
      expect(Array.isArray(result.data.translationCache)).toBe(true);
      expect(Array.isArray(result.data.consents)).toBe(true);
      expect(Array.isArray(result.data.accessLogs)).toBe(true);
    });
  });

  describe('DeletionResult structure', () => {
    it('has the expected shape with shop, deletedAt, and deletedCounts', () => {
      const result: DeletionResult = {
        shop: 'test-shop.myshopify.com',
        deletedAt: '2026-01-01T00:00:00.000Z',
        deletedCounts: {
          sessions: 5,
          translationCache: 10,
          consents: 3,
          accessLogs: 20,
        },
      };

      expect(result.shop).toBe('test-shop.myshopify.com');
      expect(result.deletedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.deletedCounts.sessions).toBe(5);
      expect(result.deletedCounts.translationCache).toBe(10);
      expect(result.deletedCounts.consents).toBe(3);
      expect(result.deletedCounts.accessLogs).toBe(20);
    });
  });

  describe('Module exports', () => {
    it('exports all expected functions from the privacy service', async () => {
      const privacyModule = await import('../../app/services/privacy/index');

      expect(typeof privacyModule.exportShopData).toBe('function');
      expect(typeof privacyModule.deleteShopData).toBe('function');
      expect(typeof privacyModule.updateConsent).toBe('function');
      expect(typeof privacyModule.getConsent).toBe('function');
      expect(typeof privacyModule.getAllConsents).toBe('function');
      expect(typeof privacyModule.hasConsent).toBe('function');
      expect(typeof privacyModule.setRetentionPolicy).toBe('function');
      expect(typeof privacyModule.getRetentionPolicies).toBe('function');
      expect(typeof privacyModule.enforceRetention).toBe('function');
      expect(typeof privacyModule.getPrivacyDashboard).toBe('function');
    });
  });
});
