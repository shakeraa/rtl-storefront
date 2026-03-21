export const mockProduct = {
  id: 'gid://shopify/Product/123456789',
  title: 'Test Product',
  description: 'A test product description',
  handle: 'test-product',
  status: 'ACTIVE',
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/987654321',
          title: 'Default Title',
          price: '29.99',
          sku: 'TEST-001',
          inventoryQuantity: 10,
        },
      },
    ],
  },
  images: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ImageSource/111222333',
          url: 'https://cdn.shopify.com/test-image.jpg',
          altText: 'Test product image',
        },
      },
    ],
  },
};

export const mockProducts = [
  mockProduct,
  {
    ...mockProduct,
    id: 'gid://shopify/Product/987654321',
    title: 'Second Test Product',
    handle: 'second-test-product',
  },
];

export const mockProductTranslation = {
  id: 'gid://shopify/Product/123456789',
  title: 'منتج تجريبي',
  description: 'وصف المنتج التجريبي',
  handle: 'test-product-ar',
};
