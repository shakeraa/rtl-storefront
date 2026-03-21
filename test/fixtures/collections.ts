export const mockCollection = {
  id: 'gid://shopify/Collection/111222333',
  title: 'Test Collection',
  description: 'A test collection description',
  handle: 'test-collection',
  products: {
    edges: [
      {
        node: {
          id: 'gid://shopify/Product/123456789',
          title: 'Test Product',
        },
      },
    ],
  },
};

export const mockCollections = [
  mockCollection,
  {
    ...mockCollection,
    id: 'gid://shopify/Collection/444555666',
    title: 'Second Collection',
    handle: 'second-collection',
  },
];
