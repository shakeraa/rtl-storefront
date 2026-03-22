import { describe, it, expect } from 'vitest';
import {
  INTEGRATIONS,
  getIntegration,
  getIntegrationsByCategory,
  translatePageFlyContent,
  translateJudgeMeReview,
  translateKlaviyoTemplate,
  checkIntegrationHealth,
} from '../../app/services/integrations/index';

describe('Integrations Service', () => {
  describe('Integration Registry', () => {
    it('should have all integrations', () => {
      expect(INTEGRATIONS.length).toBeGreaterThan(0);
      expect(INTEGRATIONS.map((i) => i.id)).toContain('pagefly');
      expect(INTEGRATIONS.map((i) => i.id)).toContain('klaviyo');
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
