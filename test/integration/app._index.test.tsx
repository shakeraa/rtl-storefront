import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader } from '../../app/routes/app._index';

// Mock the shopify server module
vi.mock('../../app/shopify.server', () => ({
  authenticate: {
    admin: vi.fn(),
  },
}));

import { authenticate } from '../../app/shopify.server';

describe('App Index Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('returns empty response on successful authentication', async () => {
      const mockRequest = new Request('https://test-store.myshopify.com/app');
      
      vi.mocked(authenticate.admin).mockResolvedValue({
        admin: {
          graphql: vi.fn(),
          rest: {},
        },
        session: {
          id: 'test-session',
          shop: 'test-store.myshopify.com',
          accessToken: 'test-token',
        },
      } as any);

      const response = await loader({ request: mockRequest, params: {}, context: {} });
      
      expect(authenticate.admin).toHaveBeenCalledWith(mockRequest);
      expect(response).toBeNull();
    });

    it('throws on authentication failure', async () => {
      const mockRequest = new Request('https://test-store.myshopify.com/app');
      
      vi.mocked(authenticate.admin).mockRejectedValue(new Error('Authentication failed'));

      await expect(
        loader({ request: mockRequest, params: {}, context: {} })
      ).rejects.toThrow('Authentication failed');
    });
  });
});
