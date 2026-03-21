export const mockShop = {
  id: 'gid://shopify/Shop/1234567890',
  name: 'Test Store',
  email: 'test@example.com',
  primaryDomain: {
    url: 'https://test-store.myshopify.com',
  },
  currencyCode: 'USD',
  ianaTimezone: 'America/New_York',
  weightUnit: 'POUNDS',
  billingAddress: {
    address1: '123 Test St',
    city: 'New York',
    province: 'New York',
    zip: '10001',
    country: 'United States',
  },
};

export const mockShopLanguages = {
  shop: {
    primaryLocale: {
      locale: 'en',
      name: 'English',
    },
    locales: [
      { locale: 'en', name: 'English' },
      { locale: 'ar', name: 'Arabic' },
      { locale: 'he', name: 'Hebrew' },
    ],
  },
};
