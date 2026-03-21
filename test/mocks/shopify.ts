import { vi } from 'vitest';

// Mock Shopify admin GraphQL client
export const mockAdminGraphQL = vi.fn();

// Mock Shopify REST client
export const mockAdminREST = vi.fn();

// Mock authenticate function
export const mockAuthenticate = {
  admin: vi.fn().mockResolvedValue({
    admin: {
      graphql: mockAdminGraphQL,
      rest: mockAdminREST,
    },
    session: {
      id: 'test-session-id',
      shop: 'test-store.myshopify.com',
      accessToken: 'test-access-token',
    },
  }),
  webhook: vi.fn().mockResolvedValue({
    shop: 'test-store.myshopify.com',
    topic: 'app/uninstalled',
    payload: {},
  }),
};

// Mock shopify server module
export const mockShopifyServer = {
  authenticate: mockAuthenticate,
  api: {
    rest: {
      Product: {
        find: vi.fn(),
        all: vi.fn(),
      },
      Collection: {
        find: vi.fn(),
        all: vi.fn(),
      },
    },
  },
};

// Mock session
export const mockSession = {
  id: 'test-session-id',
  shop: 'test-store.myshopify.com',
  state: 'test-state',
  isOnline: true,
  accessToken: 'test-access-token',
  scope: 'read_products,write_products',
  expires: new Date(Date.now() + 86400000),
};

// Mock GraphQL responses
export const createMockGraphQLResponse = <T>(data: T) => ({
  json: () => Promise.resolve({ data }),
  ok: true,
  status: 200,
  statusText: 'OK',
});

export const createMockGraphQLError = (errors: Array<{ message: string }>) => ({
  json: () => Promise.resolve({ errors }),
  ok: false,
  status: 400,
  statusText: 'Bad Request',
});
