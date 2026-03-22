import { describe, it, expect, vi } from 'vitest';
import {
  translateProduct,
  translateCollection,
  bulkTranslateProducts,
  handleProductWebhook,
} from '../../app/services/content/index';

describe('Content Translation Service', () => {
  describe('Product Translation', () => {
    it('should translate product title', async () => {
      const result = await translateProduct(
        'prod-123',
        { title: 'Elegant Abaya' },
        ['ar', 'he']
      );
      
      expect(result.productId).toBe('prod-123');
      expect(result.title).toBeDefined();
      expect(result.title?.ar).toContain('[ar]');
      expect(result.title?.he).toContain('[he]');
      expect(result.status).toBe('translated');
    });

    it('should translate product description', async () => {
      const result = await translateProduct(
        'prod-123',
        { description: 'Beautiful black abaya' },
        ['ar']
      );
      
      expect(result.description).toBeDefined();
      expect(result.description?.ar).toContain('[ar]');
    });

    it('should handle empty fields', async () => {
      const result = await translateProduct('prod-123', {}, ['ar']);
      expect(result.productId).toBe('prod-123');
      expect(result.title).toBeUndefined();
    });
  });

  describe('Collection Translation', () => {
    it('should translate collection fields', async () => {
      const result = await translateCollection(
        'coll-123',
        {
          title: 'Abayas Collection',
          description: 'Our best abayas',
          seoTitle: 'Buy Abayas Online',
          seoDescription: 'Premium abayas',
        },
        ['ar']
      );
      
      expect(result.collectionId).toBe('coll-123');
      expect(result.title?.ar).toContain('[ar]');
      expect(result.description?.ar).toContain('[ar]');
    });
  });

  describe('Bulk Translation', () => {
    it('should translate multiple products', async () => {
      const products = [
        { id: 'p1', title: 'Product 1' },
        { id: 'p2', title: 'Product 2' },
      ];
      
      const results = await bulkTranslateProducts(products, ['ar']);
      
      expect(results).toHaveLength(2);
      expect(results[0].productId).toBe('p1');
      expect(results[1].productId).toBe('p2');
    });
  });

  describe('Webhook Handler', () => {
    it('should handle product create webhook', async () => {
      await expect(
        handleProductWebhook('p1', 'create', { title: 'Test' })
      ).resolves.not.toThrow();
    });

    it('should handle product delete webhook', async () => {
      await expect(
        handleProductWebhook('p1', 'delete', {})
      ).resolves.not.toThrow();
    });
  });
});
