export const mockTranslation = {
  key: 'product.title',
  value: 'Translated Title',
  locale: 'ar',
  translatableContent: {
    digest: 'abc123',
    locale: 'en',
    value: 'Original Title',
  },
};

export const mockTranslations = [
  mockTranslation,
  {
    key: 'product.description',
    value: 'Translated Description',
    locale: 'ar',
    translatableContent: {
      digest: 'def456',
      locale: 'en',
      value: 'Original Description',
    },
  },
];

export const mockTranslatableResources = {
  translatableResources: {
    edges: [
      {
        node: {
          resourceId: 'gid://shopify/Product/123456789',
          translatableContent: [
            {
              key: 'title',
              value: 'Test Product',
              digest: 'abc123',
              locale: 'en',
            },
            {
              key: 'description',
              value: 'Test Description',
              digest: 'def456',
              locale: 'en',
            },
          ],
        },
      },
    ],
  },
};
