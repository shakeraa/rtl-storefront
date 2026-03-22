import { describe, it, expect } from 'vitest';
import {
  INTEGRATIONS,
  getIntegration,
  getIntegrationsByCategory,
  translatePageFlyContent,
  translateJudgeMeReview,
  translateKlaviyoTemplate,
  translateBundleAppContent,
  translateLicenseKeyAppContent,
  checkIntegrationHealth,
} from '../../app/services/integrations/index';

describe('Integrations Service', () => {
  describe('Integration Registry', () => {
    it('should have all integrations', () => {
      expect(INTEGRATIONS.length).toBeGreaterThan(0);
      expect(INTEGRATIONS.map((i) => i.id)).toContain('pagefly');
      expect(INTEGRATIONS.map((i) => i.id)).toContain('klaviyo');
      expect(INTEGRATIONS.map((i) => i.id)).toContain('fastbundle');
    });

    it('should get integration by ID', () => {
      const integration = getIntegration('pagefly');
      expect(integration?.name).toBe('PageFly');
      expect(integration?.category).toBe('page-builder');
    });

    it('should get integrations by category', () => {
      const pageBuilders = getIntegrationsByCategory('page-builder');
      expect(pageBuilders.length).toBeGreaterThan(0);
      expect(pageBuilders.every((i) => i.category === 'page-builder')).toBe(true);
    });
  });

  describe('PageFly Integration', () => {
    it('should translate PageFly content', async () => {
      const content = {
        pageId: 'page-1',
        content: '<div>Hello World</div>',
        metadata: {},
      };
      
      const result = await translatePageFlyContent(content, 'ar');
      expect(result).toContain('[ar]');
    });
  });

  describe('Judge.me Integration', () => {
    it('should translate review content', async () => {
      const review = {
        reviewId: 'r1',
        productId: 'p1',
        author: 'John',
        content: 'Great product!',
        rating: 5,
      };
      
      const result = await translateJudgeMeReview(review, 'ar');
      expect(result.content).toContain('[ar]');
      expect(result.rating).toBe(5); // Unchanged
    });
  });

  describe('Klaviyo Integration', () => {
    it('should translate email template preserving tags', async () => {
      const template = 'Hello {{customer.first_name}}!';
      
      const result = await translateKlaviyoTemplate(template, 'ar');
      expect(result).toContain('[ar]');
      expect(result).toContain('{{customer.first_name}}');
    });
  });

  describe('Bundle App Integration', () => {
    it('should translate bundle content and preserve item metadata', async () => {
      const bundle = {
        bundleId: 'bundle-1',
        title: 'Summer Set',
        description: 'Buy the full look',
        items: [
          {
            productId: 'p1',
            title: 'Linen Shirt',
            quantity: 1,
            label: 'Featured item',
          },
          {
            productId: 'p2',
            title: 'Cotton Pants',
            quantity: 2,
          },
        ],
        metadata: {
          source: 'fastbundle',
        },
      };

      const result = await translateBundleAppContent(bundle, 'ar');
      expect(result.title).toBe('[ar] Summer Set');
      expect(result.description).toBe('[ar] Buy the full look');
      expect(result.items[0]).toEqual({
        productId: 'p1',
        title: '[ar] Linen Shirt',
        quantity: 1,
        label: '[ar] Featured item',
      });
      expect(result.items[1]).toEqual({
        productId: 'p2',
        title: '[ar] Cotton Pants',
        quantity: 2,
        label: undefined,
      });
      expect(result.metadata).toEqual({
        source: 'fastbundle',
      });
    });
  });

  describe('License Key App Integration', () => {
    it('should translate license key content and preserve metadata', async () => {
      const license = {
        licenseId: 'license-1',
        title: 'Software Activation',
        deliveryMessage: 'Your key is ready instantly',
        activationInstructions: 'Paste the key into the desktop app',
        keys: [
          {
            keyId: 'key-1',
            productName: 'Pro Theme Kit',
            activationLabel: 'Activate now',
          },
          {
            keyId: 'key-2',
            productName: 'Addon Pack',
          },
        ],
        metadata: {
          provider: 'license-key-app',
        },
      };

      const result = await translateLicenseKeyAppContent(license, 'ar');
      expect(result.title).toBe('[ar] Software Activation');
      expect(result.deliveryMessage).toBe('[ar] Your key is ready instantly');
      expect(result.activationInstructions).toBe(
        '[ar] Paste the key into the desktop app'
      );
      expect(result.keys[0]).toEqual({
        keyId: 'key-1',
        productName: '[ar] Pro Theme Kit',
        activationLabel: '[ar] Activate now',
      });
      expect(result.keys[1]).toEqual({
        keyId: 'key-2',
        productName: '[ar] Addon Pack',
        activationLabel: undefined,
      });
      expect(result.metadata).toEqual({
        provider: 'license-key-app',
      });
    });
  });

  describe('Health Check', () => {
    it('should return healthy for valid integration', async () => {
      const result = await checkIntegrationHealth('pagefly');
      expect(result.healthy).toBe(true);
    });

    it('should return unhealthy for unknown integration', async () => {
      const result = await checkIntegrationHealth('unknown');
      expect(result.healthy).toBe(false);
    });
  });
});
