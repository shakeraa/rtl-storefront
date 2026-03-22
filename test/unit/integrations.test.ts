import { describe, it, expect } from 'vitest';
import {
  INTEGRATIONS,
  getIntegration,
  getIntegrationsByCategory,
  translatePageFlyContent,
  translateJudgeMeReview,
  translateKlaviyoTemplate,
  translateBundleAppContent,
  translateCountdownTimerLabels,
  checkIntegrationHealth,
} from '../../app/services/integrations/index';

describe('Integrations Service', () => {
  describe('Integration Registry', () => {
    it('should have all integrations', () => {
      expect(INTEGRATIONS.length).toBeGreaterThan(0);
      expect(INTEGRATIONS.map((i) => i.id)).toContain('pagefly');
      expect(INTEGRATIONS.map((i) => i.id)).toContain('klaviyo');
      expect(INTEGRATIONS.map((i) => i.id)).toContain('fastbundle');
      expect(INTEGRATIONS.map((i) => i.id)).toContain('hurrify');
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

  describe('Countdown Timer Integration', () => {
    it('should translate countdown timer labels', async () => {
      const labels = {
        appId: 'hurrify',
        heading: 'Flash sale',
        endsInLabel: 'Ends in',
        dayLabel: 'Days',
        hourLabel: 'Hours',
        minuteLabel: 'Minutes',
        secondLabel: 'Seconds',
      };

      const result = await translateCountdownTimerLabels(labels, 'ar');
      expect(result).toEqual({
        appId: 'hurrify',
        heading: '[ar] Flash sale',
        endsInLabel: '[ar] Ends in',
        dayLabel: '[ar] Days',
        hourLabel: '[ar] Hours',
        minuteLabel: '[ar] Minutes',
        secondLabel: '[ar] Seconds',
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
