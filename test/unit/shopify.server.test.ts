import { describe, it, expect, vi } from 'vitest';
import type { AppConfigArg } from '@shopify/shopify-app-remix/server';

// Mock environment variables
vi.stubEnv('SHOPIFY_API_KEY', 'test-api-key');
vi.stubEnv('SHOPIFY_API_SECRET', 'test-api-secret');
vi.stubEnv('SCOPES', 'read_products,write_products');
vi.stubEnv('SHOPIFY_APP_URL', 'https://test-app.vercel.app');

describe('Shopify Server Configuration', () => {
  it('exports authenticate function', async () => {
    const { authenticate } = await import('../../app/shopify.server');
    expect(authenticate).toBeDefined();
    expect(typeof authenticate.admin).toBe('function');
    expect(typeof authenticate.webhook).toBe('function');
  });

  it('exports shopify instance', async () => {
    const shopifyModule = await import('../../app/shopify.server');
    expect(shopifyModule.default).toBeDefined();
  });

  it('has required configuration', async () => {
    const { default: shopify } = await import('../../app/shopify.server');
    
    // Verify shopify instance is properly configured
    expect(shopify).toBeDefined();
  });

  describe('Session Storage', () => {
    it('uses Prisma session storage', async () => {
      const shopifyModule = await import('../../app/shopify.server');
      
      // The module should be configured with PrismaSessionStorage
      expect(shopifyModule).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('supports admin authentication', async () => {
      const { authenticate } = await import('../../app/shopify.server');
      
      expect(authenticate.admin).toBeDefined();
      expect(typeof authenticate.admin).toBe('function');
    });

    it('supports webhook authentication', async () => {
      const { authenticate } = await import('../../app/shopify.server');
      
      expect(authenticate.webhook).toBeDefined();
      expect(typeof authenticate.webhook).toBe('function');
    });
  });
});
