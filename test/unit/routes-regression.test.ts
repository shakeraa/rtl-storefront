/**
 * Regression tests for untested Remix routes.
 *
 * Covers: app.bulk-translate, app.rtl-settings, app.internal.billing,
 *         app.seo-schema, app.seo-sitemap, auth.$
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../app/shopify.server', () => ({
  default: {},
  authenticate: {
    admin: vi.fn(),
  },
}));

vi.mock('../../app/db.server', () => ({
  default: {
    shopSettings: { findUnique: vi.fn(), upsert: vi.fn() },
    billingPlan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../../app/utils/rls.server', () => ({
  setTenantContext: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../app/utils/tenant.server', () => ({
  getTenantDb: vi.fn().mockReturnValue({}),
}));

vi.mock('../../app/services/translation/engine', () => ({
  createShopTranslationEngine: vi.fn().mockResolvedValue({
    translate: vi.fn().mockResolvedValue({ translatedText: 'translated' }),
  }),
}));

vi.mock('../../app/services/translation/get-provider-env.server', () => ({
  getProviderStatus: vi.fn().mockResolvedValue({
    anyConfigured: true,
    openai: true,
    deepl: false,
    google: false,
  }),
}));

vi.mock('../../app/services/language-switcher/options', () => ({
  SUPPORTED_LANGUAGES: {
    ar: { name: 'Arabic', nativeName: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', direction: 'rtl' },
    he: { name: 'Hebrew', nativeName: '\u05E2\u05D1\u05E8\u05D9\u05EA', direction: 'rtl' },
    en: { name: 'English', nativeName: 'English', direction: 'ltr' },
  },
}));

vi.mock('../../app/services/billing/index', () => ({
  getAllPlans: vi.fn().mockResolvedValue([
    {
      id: 'plan-1',
      name: 'Free',
      slug: 'free',
      priceInCents: 0,
      trialDays: 0,
      maxLanguages: 2,
      maxWordsPerMonth: 5000,
      features: ['basic_translation'],
      sortOrder: 10,
      isActive: true,
    },
  ]),
  upsertPlan: vi.fn().mockResolvedValue({}),
  isAdmin: vi.fn().mockImplementation((shop: string) => shop === 'test-shop.myshopify.com'),
}));

vi.mock('../../app/services/schema-org/product-schema', () => ({
  generateProductSchema: vi.fn().mockReturnValue({
    jsonLd: { '@type': 'Product', name: 'Test' },
    html: '<script type="application/ld+json">{}</script>',
    direction: 'ltr',
  }),
  validateProductSchema: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  getSchemaTranslations: vi.fn().mockReturnValue({
    product: 'Product',
    price: 'Price',
    description: 'Description',
    availability: 'Availability',
  }),
  getLocalizedAvailability: vi.fn().mockReturnValue('In Stock'),
}));

vi.mock('../../app/services/seo', () => ({
  getMultilingualSEOConfig: vi.fn().mockReturnValue({
    seoConfig: { locales: ['en', 'ar', 'he'], defaultLocale: 'en' },
    hreflangEnabled: true,
  }),
  validateSEOSetup: vi.fn().mockReturnValue({ valid: true, errors: [] }),
}));

vi.mock('../../app/services/sitemap/generator', () => ({
  generateSitemapXml: vi.fn().mockReturnValue(
    '<urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/ar</loc></url></urlset>',
  ),
}));

vi.mock('@remix-run/react', () => ({
  useLoaderData: vi.fn().mockReturnValue({}),
  useFetcher: vi.fn().mockReturnValue({ state: 'idle', submit: vi.fn(), data: null }),
  useSubmit: vi.fn().mockReturnValue(vi.fn()),
  useNavigation: vi.fn().mockReturnValue({ state: 'idle' }),
  useRouteError: vi.fn().mockReturnValue(new Error('test')),
  isRouteErrorResponse: vi.fn().mockReturnValue(false),
}));

vi.mock('@shopify/app-bridge-react', () => ({
  TitleBar: () => null,
  useAppBridge: vi.fn().mockReturnValue({ toast: { show: vi.fn() } }),
}));

vi.mock('@shopify/polaris', () => {
  const stub = () => null;
  (stub as any).Row = stub;
  (stub as any).Cell = stub;
  (stub as any).Section = stub;
  return {
    Page: stub,
    Layout: stub,
    Card: stub,
    BlockStack: stub,
    InlineStack: stub,
    Text: stub,
    TextField: stub,
    Select: stub,
    Checkbox: stub,
    Badge: stub,
    Button: stub,
    Banner: stub,
    IndexTable: stub,
    ProgressBar: stub,
    Box: stub,
    DataTable: stub,
    useIndexResourceState: vi.fn().mockReturnValue({
      selectedResources: [],
      allResourcesSelected: false,
      handleSelectionChange: vi.fn(),
    }),
  };
});


// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { authenticate } from '../../app/shopify.server';
import { getProviderStatus } from '../../app/services/translation/get-provider-env.server';
import { getAllPlans, upsertPlan, isAdmin } from '../../app/services/billing/index';
import db from '../../app/db.server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockGraphql = vi.fn();

function setupAuth() {
  vi.mocked(authenticate.admin).mockResolvedValue({
    admin: { graphql: mockGraphql },
    session: { id: 'test', shop: 'test-shop.myshopify.com', accessToken: 'token' },
  } as any);
}

function createRequest(url: string, method = 'GET', body?: FormData): Request {
  return new Request(url, { method, body });
}

function jsonBody(response: Response): Promise<any> {
  return response.json();
}

function setupGraphqlResponse(data: any) {
  mockGraphql.mockResolvedValue({
    json: () => Promise.resolve(data),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('app.bulk-translate route', () => {
  let bulkTranslateRoute: typeof import('../../app/routes/app.bulk-translate');

  beforeEach(async () => {
    vi.clearAllMocks();
    setupAuth();
    setupGraphqlResponse({
      data: {
        translatableResources: {
          nodes: [
            {
              resourceId: 'gid://shopify/Product/123',
              translatableContent: [
                { key: 'title', value: 'Test Product', digest: 'abc', locale: 'en' },
                { key: 'body_html', value: '<p>Body</p>', digest: 'def', locale: 'en' },
              ],
            },
          ],
        },
      },
    });
    bulkTranslateRoute = await import('../../app/routes/app.bulk-translate');
  });

  it('loader authenticates the request', async () => {
    const req = createRequest('https://app.test/app/bulk-translate');
    await bulkTranslateRoute.loader({ request: req, params: {}, context: {} });
    expect(authenticate.admin).toHaveBeenCalled();
  });

  it('loader returns resources and providerStatus', async () => {
    const req = createRequest('https://app.test/app/bulk-translate');
    const res = await bulkTranslateRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data).toHaveProperty('resources');
    expect(data).toHaveProperty('providerStatus');
    expect(Array.isArray(data.resources)).toBe(true);
  });

  it('loader defaults resourceType to products', async () => {
    const req = createRequest('https://app.test/app/bulk-translate');
    const res = await bulkTranslateRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.resourceType).toBe('products');
  });

  it('loader handles resourceType query param', async () => {
    const req = createRequest('https://app.test/app/bulk-translate?resourceType=collections');
    const res = await bulkTranslateRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.resourceType).toBe('collections');
  });

  it('loader handles locale query param', async () => {
    const req = createRequest('https://app.test/app/bulk-translate?locale=he');
    const res = await bulkTranslateRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.targetLocale).toBe('he');
  });

  it('loader defaults locale to ar', async () => {
    const req = createRequest('https://app.test/app/bulk-translate');
    const res = await bulkTranslateRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.targetLocale).toBe('ar');
  });

  it('loader maps resources with id, numericId, title, fieldCount', async () => {
    const req = createRequest('https://app.test/app/bulk-translate');
    const res = await bulkTranslateRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.resources[0]).toMatchObject({
      id: 'gid://shopify/Product/123',
      numericId: '123',
      title: 'Test Product',
      fieldCount: 2,
    });
  });

  it('action returns error for invalid intent', async () => {
    const form = new FormData();
    form.set('intent', 'wrong');
    const req = createRequest('https://app.test/app/bulk-translate', 'POST', form);
    const res = await bulkTranslateRoute.action({ request: req, params: {}, context: {} });
    expect(res.status).toBe(400);
    const data = await jsonBody(res);
    expect(data.error).toBe('Invalid intent');
  });

  it('action returns error when targetLocale is missing', async () => {
    const form = new FormData();
    form.set('intent', 'bulk_translate');
    const req = createRequest('https://app.test/app/bulk-translate', 'POST', form);
    const res = await bulkTranslateRoute.action({ request: req, params: {}, context: {} });
    expect(res.status).toBe(400);
    const data = await jsonBody(res);
    expect(data.error).toBe('Missing required fields');
  });

  it('action returns error when resourceIds JSON is invalid', async () => {
    const form = new FormData();
    form.set('intent', 'bulk_translate');
    form.set('locale', 'ar');
    form.set('resourceIds', '{bad json');
    const req = createRequest('https://app.test/app/bulk-translate', 'POST', form);
    const res = await bulkTranslateRoute.action({ request: req, params: {}, context: {} });
    expect(res.status).toBe(400);
    const data = await jsonBody(res);
    expect(data.error).toBe('Invalid data format');
  });

  it('action returns provider error when no provider configured', async () => {
    vi.mocked(getProviderStatus).mockResolvedValueOnce({
      anyConfigured: false,
      openai: false,
      deepl: false,
      google: false,
    } as any);
    const form = new FormData();
    form.set('intent', 'bulk_translate');
    form.set('locale', 'ar');
    form.set('resourceIds', '["gid://shopify/Product/123"]');
    const req = createRequest('https://app.test/app/bulk-translate', 'POST', form);
    const res = await bulkTranslateRoute.action({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.success).toBe(false);
    expect(data.error).toContain('No translation provider configured');
  });

  it('has an ErrorBoundary export', () => {
    expect(bulkTranslateRoute.ErrorBoundary).toBeDefined();
    expect(typeof bulkTranslateRoute.ErrorBoundary).toBe('function');
  });
});

// ---------------------------------------------------------------------------

describe('app.rtl-settings route', () => {
  let rtlSettingsRoute: typeof import('../../app/routes/app.rtl-settings');

  beforeEach(async () => {
    vi.clearAllMocks();
    setupAuth();
    rtlSettingsRoute = await import('../../app/routes/app.rtl-settings');
  });

  it('loader returns shop, availableLanguages, and providers', async () => {
    const req = createRequest('https://app.test/app/rtl-settings');
    const res = await rtlSettingsRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data).toHaveProperty('shop');
    expect(data).toHaveProperty('availableLanguages');
    expect(data).toHaveProperty('providers');
    expect(data.shop).toBe('test-shop.myshopify.com');
  });

  it('loader returns provider configs with configured flags', async () => {
    const req = createRequest('https://app.test/app/rtl-settings');
    const res = await rtlSettingsRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.providers).toHaveProperty('openai');
    expect(data.providers).toHaveProperty('deepl');
    expect(data.providers).toHaveProperty('google');
    expect(data.providers.openai).toHaveProperty('configured');
    expect(data.providers.openai).toHaveProperty('name', 'OpenAI');
  });

  it('loader returns language entries with code, name, nativeName, direction', async () => {
    const req = createRequest('https://app.test/app/rtl-settings');
    const res = await rtlSettingsRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.availableLanguages.length).toBeGreaterThan(0);
    const lang = data.availableLanguages[0];
    expect(lang).toHaveProperty('code');
    expect(lang).toHaveProperty('name');
    expect(lang).toHaveProperty('nativeName');
    expect(lang).toHaveProperty('direction');
  });

  it('action saves settings via db.shopSettings.upsert', async () => {
    const form = new FormData();
    form.set('provider', 'deepl');
    form.set('sourceLocale', 'en');
    form.set('targetLocales', '["ar"]');
    form.set('autoDetectRTL', 'true');
    form.set('arabicFont', 'cairo');
    form.set('hebrewFont', 'rubik');
    form.set('enableTM', 'true');
    form.set('fuzzyThreshold', '90');
    form.set('autoSuggest', 'false');
    const req = createRequest('https://app.test/app/rtl-settings', 'POST', form);
    const res = await rtlSettingsRoute.action({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.success).toBe(true);
    expect(db.shopSettings.upsert).toHaveBeenCalled();
  });

  it('action parses boolean form fields correctly', async () => {
    const form = new FormData();
    form.set('provider', 'openai');
    form.set('autoDetectRTL', 'false');
    form.set('enableTM', 'false');
    form.set('autoSuggest', 'true');
    const req = createRequest('https://app.test/app/rtl-settings', 'POST', form);
    await rtlSettingsRoute.action({ request: req, params: {}, context: {} });
    const upsertCall = vi.mocked(db.shopSettings.upsert).mock.calls[0][0] as any;
    expect(upsertCall.update.autoDetectRTL).toBe(false);
    expect(upsertCall.update.enableTM).toBe(false);
    expect(upsertCall.update.autoSuggest).toBe(true);
  });

  it('action stores openai API key when provider is openai', async () => {
    const form = new FormData();
    form.set('provider', 'openai');
    form.set('apiKey', 'sk-test-key');
    const req = createRequest('https://app.test/app/rtl-settings', 'POST', form);
    await rtlSettingsRoute.action({ request: req, params: {}, context: {} });
    const upsertCall = vi.mocked(db.shopSettings.upsert).mock.calls[0][0] as any;
    expect(upsertCall.update.openaiApiKey).toBe('sk-test-key');
  });

  it('action stores deepl API key when provider is deepl', async () => {
    const form = new FormData();
    form.set('provider', 'deepl');
    form.set('apiKey', 'deepl-key');
    const req = createRequest('https://app.test/app/rtl-settings', 'POST', form);
    await rtlSettingsRoute.action({ request: req, params: {}, context: {} });
    const upsertCall = vi.mocked(db.shopSettings.upsert).mock.calls[0][0] as any;
    expect(upsertCall.update.deeplApiKey).toBe('deepl-key');
  });

  it('action stores google access token when provider is google', async () => {
    const form = new FormData();
    form.set('provider', 'google');
    form.set('apiKey', 'google-token');
    const req = createRequest('https://app.test/app/rtl-settings', 'POST', form);
    await rtlSettingsRoute.action({ request: req, params: {}, context: {} });
    const upsertCall = vi.mocked(db.shopSettings.upsert).mock.calls[0][0] as any;
    expect(upsertCall.update.googleAccessToken).toBe('google-token');
  });

  it('action does not store API key fields when apiKey is empty', async () => {
    const form = new FormData();
    form.set('provider', 'openai');
    form.set('apiKey', '');
    const req = createRequest('https://app.test/app/rtl-settings', 'POST', form);
    await rtlSettingsRoute.action({ request: req, params: {}, context: {} });
    const upsertCall = vi.mocked(db.shopSettings.upsert).mock.calls[0][0] as any;
    expect(upsertCall.update).not.toHaveProperty('openaiApiKey');
  });

  it('has an ErrorBoundary export', () => {
    expect(rtlSettingsRoute.ErrorBoundary).toBeDefined();
    expect(typeof rtlSettingsRoute.ErrorBoundary).toBe('function');
  });
});

// ---------------------------------------------------------------------------

describe('app.internal.billing route', () => {
  let billingRoute: typeof import('../../app/routes/app.internal.billing');

  beforeEach(async () => {
    vi.clearAllMocks();
    setupAuth();
    vi.mocked(isAdmin).mockImplementation((shop: string) => shop === 'test-shop.myshopify.com');
    vi.mocked(getAllPlans).mockResolvedValue([
      {
        id: 'plan-1',
        name: 'Free',
        slug: 'free',
        priceInCents: 0,
        trialDays: 0,
        maxLanguages: 2,
        maxWordsPerMonth: 5000,
        features: ['basic_translation'],
        sortOrder: 10,
        isActive: true,
      },
    ] as any);
    billingRoute = await import('../../app/routes/app.internal.billing');
  });

  it('loader returns billing plans for admin shop', async () => {
    const req = createRequest('https://app.test/app/internal/billing');
    const res = await billingRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data).toHaveProperty('plans');
    expect(data.plans).toHaveLength(1);
    expect(data.plans[0].name).toBe('Free');
  });

  it('loader throws 404 for non-admin shop', async () => {
    vi.mocked(isAdmin).mockReturnValueOnce(false);
    const req = createRequest('https://app.test/app/internal/billing');
    await expect(
      billingRoute.loader({ request: req, params: {}, context: {} }),
    ).rejects.toThrow();
  });

  it('action throws 404 for non-admin shop', async () => {
    vi.mocked(isAdmin).mockReturnValueOnce(false);
    const form = new FormData();
    form.set('intent', 'upsert');
    form.set('features', '[]');
    const req = createRequest('https://app.test/app/internal/billing', 'POST', form);
    await expect(
      billingRoute.action({ request: req, params: {}, context: {} }),
    ).rejects.toThrow();
  });

  it('action upserts a plan with correct data', async () => {
    const form = new FormData();
    form.set('intent', 'upsert');
    form.set('name', 'Pro');
    form.set('slug', 'pro');
    form.set('priceInCents', '2999');
    form.set('trialDays', '14');
    form.set('maxLanguages', '10');
    form.set('maxWordsPerMonth', '50000');
    form.set('features', '["basic_translation","rtl_support"]');
    form.set('sortOrder', '20');
    form.set('isActive', 'true');
    const req = createRequest('https://app.test/app/internal/billing', 'POST', form);
    const res = await billingRoute.action({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.success).toBe(true);
    expect(upsertPlan).toHaveBeenCalledWith(null, expect.objectContaining({
      name: 'Pro',
      slug: 'pro',
      priceInCents: 2999,
    }));
  });

  it('action passes existing plan id for updates', async () => {
    const form = new FormData();
    form.set('intent', 'upsert');
    form.set('id', 'plan-1');
    form.set('name', 'Free Updated');
    form.set('slug', 'free');
    form.set('priceInCents', '0');
    form.set('trialDays', '0');
    form.set('maxLanguages', '3');
    form.set('maxWordsPerMonth', '10000');
    form.set('features', '["basic_translation"]');
    form.set('sortOrder', '10');
    form.set('isActive', 'true');
    const req = createRequest('https://app.test/app/internal/billing', 'POST', form);
    await billingRoute.action({ request: req, params: {}, context: {} });
    expect(upsertPlan).toHaveBeenCalledWith('plan-1', expect.objectContaining({
      name: 'Free Updated',
    }));
  });

  it('action returns error for invalid features JSON', async () => {
    const form = new FormData();
    form.set('intent', 'upsert');
    form.set('features', '{bad}');
    const req = createRequest('https://app.test/app/internal/billing', 'POST', form);
    const res = await billingRoute.action({ request: req, params: {}, context: {} });
    expect(res.status).toBe(400);
    const data = await jsonBody(res);
    expect(data.error).toBe('Invalid features format');
  });

  it('action returns success when intent is not upsert (no-op)', async () => {
    const form = new FormData();
    form.set('intent', 'unknown');
    form.set('features', '[]');
    const req = createRequest('https://app.test/app/internal/billing', 'POST', form);
    const res = await billingRoute.action({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.success).toBe(true);
    expect(upsertPlan).not.toHaveBeenCalled();
  });

  it('has an ErrorBoundary export', () => {
    expect(billingRoute.ErrorBoundary).toBeDefined();
    expect(typeof billingRoute.ErrorBoundary).toBe('function');
  });
});

// ---------------------------------------------------------------------------

describe('app.seo-schema route', () => {
  let seoSchemaRoute: typeof import('../../app/routes/app.seo-schema');

  beforeEach(async () => {
    vi.clearAllMocks();
    setupAuth();
    seoSchemaRoute = await import('../../app/routes/app.seo-schema');
  });

  it('loader authenticates the request', async () => {
    const req = createRequest('https://app.test/app/seo-schema');
    await seoSchemaRoute.loader({ request: req, params: {}, context: {} });
    expect(authenticate.admin).toHaveBeenCalled();
  });

  it('loader returns schema data for all locales', async () => {
    const req = createRequest('https://app.test/app/seo-schema');
    const res = await seoSchemaRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data).toHaveProperty('schemas');
    expect(data.schemas).toHaveLength(3); // en, ar, he
  });

  it('loader schema entries have expected shape', async () => {
    const req = createRequest('https://app.test/app/seo-schema');
    const res = await seoSchemaRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    const schema = data.schemas[0];
    expect(schema).toHaveProperty('locale');
    expect(schema).toHaveProperty('direction');
    expect(schema).toHaveProperty('jsonLd');
    expect(schema).toHaveProperty('validation');
    expect(schema).toHaveProperty('translationSample');
  });

  it('default export is a function (component)', () => {
    expect(typeof seoSchemaRoute.default).toBe('function');
  });

  it('has an ErrorBoundary export', () => {
    expect(seoSchemaRoute.ErrorBoundary).toBeDefined();
    expect(typeof seoSchemaRoute.ErrorBoundary).toBe('function');
  });
});

// ---------------------------------------------------------------------------

describe('app.seo-sitemap route', () => {
  let seoSitemapRoute: typeof import('../../app/routes/app.seo-sitemap');

  beforeEach(async () => {
    vi.clearAllMocks();
    setupAuth();
    seoSitemapRoute = await import('../../app/routes/app.seo-sitemap');
  });

  it('loader authenticates the request', async () => {
    const req = createRequest('https://app.test/app/seo-sitemap');
    await seoSitemapRoute.loader({ request: req, params: {}, context: {} });
    expect(authenticate.admin).toHaveBeenCalled();
  });

  it('loader returns sitemap configuration data', async () => {
    const req = createRequest('https://app.test/app/seo-sitemap');
    const res = await seoSitemapRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data).toHaveProperty('locales');
    expect(data).toHaveProperty('defaultLocale');
    expect(data).toHaveProperty('baseUrl');
    expect(data).toHaveProperty('pages');
    expect(data).toHaveProperty('validation');
    expect(data).toHaveProperty('hreflangEnabled');
    expect(data).toHaveProperty('totalUrls');
  });

  it('loader returns correct locale configuration', async () => {
    const req = createRequest('https://app.test/app/seo-sitemap');
    const res = await seoSitemapRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.locales).toEqual(['en', 'ar', 'he']);
    expect(data.defaultLocale).toBe('en');
  });

  it('loader returns page entries with expected fields', async () => {
    const req = createRequest('https://app.test/app/seo-sitemap');
    const res = await seoSitemapRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(data.pages.length).toBeGreaterThan(0);
    const page = data.pages[0];
    expect(page).toHaveProperty('path');
    expect(page).toHaveProperty('type');
    expect(page).toHaveProperty('priority');
  });

  it('loader returns totalUrls count', async () => {
    const req = createRequest('https://app.test/app/seo-sitemap');
    const res = await seoSitemapRoute.loader({ request: req, params: {}, context: {} });
    const data = await jsonBody(res);
    expect(typeof data.totalUrls).toBe('number');
    expect(data.totalUrls).toBeGreaterThan(0);
  });

  it('default export is a function (component)', () => {
    expect(typeof seoSitemapRoute.default).toBe('function');
  });

  it('has an ErrorBoundary export', () => {
    expect(seoSitemapRoute.ErrorBoundary).toBeDefined();
    expect(typeof seoSitemapRoute.ErrorBoundary).toBe('function');
  });
});

// ---------------------------------------------------------------------------

describe('auth.$ route', () => {
  let authRoute: typeof import('../../app/routes/auth.$');

  beforeEach(async () => {
    vi.clearAllMocks();
    setupAuth();
    authRoute = await import('../../app/routes/auth.$');
  });

  it('loader delegates to authenticate.admin', async () => {
    const req = createRequest('https://app.test/auth/callback');
    await authRoute.loader({ request: req, params: {}, context: {} });
    expect(authenticate.admin).toHaveBeenCalledWith(req);
  });

  it('loader returns null', async () => {
    const req = createRequest('https://app.test/auth/callback');
    const result = await authRoute.loader({ request: req, params: {}, context: {} });
    expect(result).toBeNull();
  });

  it('action delegates to authenticate.admin', async () => {
    const req = createRequest('https://app.test/auth/callback', 'POST');
    await authRoute.action({ request: req, params: {}, context: {} });
    expect(authenticate.admin).toHaveBeenCalledWith(req);
  });

  it('action returns null', async () => {
    const req = createRequest('https://app.test/auth/callback', 'POST');
    const result = await authRoute.action({ request: req, params: {}, context: {} });
    expect(result).toBeNull();
  });
});
