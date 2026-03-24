import { describe, it, expect } from 'vitest';
import {
  generateProductSchema,
  translateSchemaFields,
  getSchemaTranslations,
  getLocalizedAvailability,
  extractTranslatableFields,
  wrapProductJsonLd,
  generateProductBreadcrumbSchema,
  validateProductSchema,
  mergeProductSchemas,
  type ProductSchemaData,
  type SupportedSchemaLocale,
} from '../../app/services/schema-org/product-schema';

// Test helper to create product data
function makeProductData(overrides: Partial<ProductSchemaData> = {}): ProductSchemaData {
  return {
    name: 'Test Product',
    description: 'A great product description',
    sku: 'SKU-001',
    price: 99.99,
    currency: 'USD',
    availability: 'InStock',
    url: 'https://example.com/products/test',
    ...overrides,
  };
}

describe('Product Schema - getSchemaTranslations', () => {
  it('returns Arabic translations for ar locale', () => {
    const translations = getSchemaTranslations('ar');
    expect(translations.product).toBe('منتج');
    expect(translations.offer).toBe('عرض');
    expect(translations.availability.inStock).toBe('متوفر في المخزون');
  });

  it('returns Hebrew translations for he locale', () => {
    const translations = getSchemaTranslations('he');
    expect(translations.product).toBe('מוצר');
    expect(translations.offer).toBe('הצעה');
    expect(translations.availability.inStock).toBe('זמין במלאי');
  });

  it('returns English translations for en locale', () => {
    const translations = getSchemaTranslations('en');
    expect(translations.product).toBe('Product');
    expect(translations.offer).toBe('Offer');
    expect(translations.availability.inStock).toBe('In Stock');
  });

  it('defaults to English for unsupported locales', () => {
    const translations = getSchemaTranslations('fr' as SupportedSchemaLocale);
    expect(translations.product).toBe('Product');
  });
});

describe('Product Schema - getLocalizedAvailability', () => {
  it('returns Arabic text for InStock', () => {
    const text = getLocalizedAvailability('InStock', 'ar');
    expect(text).toBe('متوفر في المخزون');
  });

  it('returns Hebrew text for OutOfStock', () => {
    const text = getLocalizedAvailability('OutOfStock', 'he');
    expect(text).toBe('אזל מהמלאי');
  });

  it('returns English text for PreOrder', () => {
    const text = getLocalizedAvailability('PreOrder', 'en');
    expect(text).toBe('Pre-order');
  });

  it('returns English text for BackOrder', () => {
    const text = getLocalizedAvailability('BackOrder', 'en');
    expect(text).toBe('Back Order');
  });
});

describe('Product Schema - generateProductSchema', () => {
  it('generates basic schema with required fields', () => {
    const result = generateProductSchema(makeProductData(), 'en');
    
    expect(result.jsonLd['@context']).toBe('https://schema.org');
    expect(result.jsonLd['@type']).toBe('Product');
    expect(result.jsonLd.name).toBe('Test Product');
    expect(result.jsonLd.description).toBe('A great product description');
    expect(result.jsonLd.sku).toBe('SKU-001');
    expect(result.jsonLd.inLanguage).toBe('en');
  });

  it('includes offers with price and currency', () => {
    const result = generateProductSchema(makeProductData(), 'en');
    const offers = result.jsonLd.offers as Record<string, unknown>;
    
    expect(offers['@type']).toBe('Offer');
    expect(offers.price).toBe(99.99);
    expect(offers.priceCurrency).toBe('USD');
  });

  it('maps availability to schema.org URLs', () => {
    const result = generateProductSchema(makeProductData({ availability: 'InStock' }), 'en');
    const offers = result.jsonLd.offers as Record<string, unknown>;
    
    expect(offers.availability).toBe('https://schema.org/InStock');
  });

  it('handles OutOfStock availability', () => {
    const result = generateProductSchema(makeProductData({ availability: 'OutOfStock' }), 'en');
    const offers = result.jsonLd.offers as Record<string, unknown>;
    
    expect(offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('handles PreOrder availability', () => {
    const result = generateProductSchema(makeProductData({ availability: 'PreOrder' }), 'en');
    const offers = result.jsonLd.offers as Record<string, unknown>;
    
    expect(offers.availability).toBe('https://schema.org/PreOrder');
  });

  it('handles BackOrder availability', () => {
    const result = generateProductSchema(makeProductData({ availability: 'BackOrder' }), 'en');
    const offers = result.jsonLd.offers as Record<string, unknown>;
    
    expect(offers.availability).toBe('https://schema.org/BackOrder');
  });

  it('includes image when provided', () => {
    const result = generateProductSchema(
      makeProductData({ imageUrl: 'https://example.com/image.jpg' }),
      'en'
    );
    
    expect(result.jsonLd.image).toBe('https://example.com/image.jpg');
  });

  it('includes brand when provided', () => {
    const result = generateProductSchema(makeProductData({ brand: 'Acme Corp' }), 'en');
    const brand = result.jsonLd.brand as Record<string, unknown>;
    
    expect(brand['@type']).toBe('Brand');
    expect(brand.name).toBe('Acme Corp');
  });

  it('includes aggregate rating when provided', () => {
    const result = generateProductSchema(
      makeProductData({ ratingValue: 4.5, reviewCount: 128 }),
      'en'
    );
    const rating = result.jsonLd.aggregateRating as Record<string, unknown>;
    
    expect(rating['@type']).toBe('AggregateRating');
    expect(rating.ratingValue).toBe(4.5);
    expect(rating.reviewCount).toBe(128);
    expect(rating.bestRating).toBe(5);
    expect(rating.worstRating).toBe(1);
  });

  it('omits aggregate rating when reviewCount is 0', () => {
    const result = generateProductSchema(
      makeProductData({ ratingValue: 4.5, reviewCount: 0 }),
      'en'
    );
    
    expect(result.jsonLd.aggregateRating).toBeUndefined();
  });

  it('returns RTL direction for Arabic locale', () => {
    const result = generateProductSchema(makeProductData(), 'ar');
    
    expect(result.direction).toBe('rtl');
    expect(result.locale).toBe('ar');
  });

  it('returns RTL direction for Hebrew locale', () => {
    const result = generateProductSchema(makeProductData(), 'he');
    
    expect(result.direction).toBe('rtl');
    expect(result.locale).toBe('he');
  });

  it('returns LTR direction for English locale', () => {
    const result = generateProductSchema(makeProductData(), 'en');
    
    expect(result.direction).toBe('ltr');
    expect(result.locale).toBe('en');
  });

  it('includes category when provided', () => {
    const result = generateProductSchema(makeProductData({ category: 'Electronics' }), 'en');
    
    expect(result.jsonLd.category).toBe('Electronics');
  });

  it('includes condition when provided', () => {
    const result = generateProductSchema(makeProductData({ condition: 'New' }), 'en');
    
    expect(result.jsonLd.itemCondition).toBe('https://schema.org/NewCondition');
  });

  it('includes GTIN when provided', () => {
    const result = generateProductSchema(makeProductData({ gtin: '1234567890123' }), 'en');
    
    expect(result.jsonLd.gtin).toBe('1234567890123');
  });

  it('includes MPN when provided', () => {
    const result = generateProductSchema(makeProductData({ mpn: 'ACME-123' }), 'en');
    
    expect(result.jsonLd.mpn).toBe('ACME-123');
  });

  it('includes color and size when provided', () => {
    const result = generateProductSchema(
      makeProductData({ color: 'Red', size: 'Large' }),
      'en'
    );
    
    expect(result.jsonLd.color).toBe('Red');
    expect(result.jsonLd.size).toBe('Large');
  });

  it('includes material when provided', () => {
    const result = generateProductSchema(makeProductData({ material: 'Cotton' }), 'en');
    
    expect(result.jsonLd.material).toBe('Cotton');
  });

  it('includes weight when provided', () => {
    const result = generateProductSchema(
      makeProductData({ weight: { value: 1.5, unit: 'KGM' } }),
      'en'
    );
    const weight = result.jsonLd.weight as Record<string, unknown>;
    
    expect(weight['@type']).toBe('QuantitativeValue');
    expect(weight.value).toBe(1.5);
    expect(weight.unitCode).toBe('KGM');
  });

  it('includes shipping details when provided', () => {
    const result = generateProductSchema(
      makeProductData({
        shippingDetails: {
          shippingRate: 10,
          shippingCurrency: 'USD',
          handlingTime: '1-2',
          transitTime: '3-5',
        },
      }),
      'en'
    );
    const offers = result.jsonLd.offers as Record<string, unknown>;
    const shipping = offers.shippingDetails as Record<string, unknown>;
    
    expect(shipping['@type']).toBe('OfferShippingDetails');
  });

  it('includes product variants when provided', () => {
    const result = generateProductSchema(
      makeProductData({
        hasVariant: [
          { sku: 'SKU-001-SM', name: 'Small', price: 89.99, size: 'S' },
          { sku: 'SKU-001-LG', name: 'Large', price: 99.99, size: 'L', color: 'Blue' },
        ],
      }),
      'en'
    );
    const variants = result.jsonLd.hasVariant as Array<Record<string, unknown>>;
    
    expect(variants).toHaveLength(2);
    expect(variants[0].sku).toBe('SKU-001-SM');
    expect(variants[1].color).toBe('Blue');
  });
});

describe('Product Schema - translateSchemaFields', () => {
  it('does not add non-standard _translationMeta to schema', () => {
    const schema = { name: 'Test', '@context': 'https://schema.org' };
    const translated = translateSchemaFields(schema, 'ar');

    // _translationMeta was removed to comply with JSON-LD standards
    expect(translated._translationMeta).toBeUndefined();
  });

  it('updates inLanguage field when present', () => {
    const schema = { name: 'Test', inLanguage: 'en' };
    const translated = translateSchemaFields(schema, 'he');
    
    expect(translated.inLanguage).toBe('he');
  });

  it('preserves original schema data', () => {
    const schema = { name: 'Test Product', description: 'Description' };
    const translated = translateSchemaFields(schema, 'ar');
    
    expect(translated.name).toBe('Test Product');
    expect(translated.description).toBe('Description');
  });
});

describe('Product Schema - extractTranslatableFields', () => {
  it('extracts translatable string fields', () => {
    const schema = { name: 'Test', description: 'Desc', price: 10 };
    const fields = extractTranslatableFields(schema);
    
    const nameField = fields.find(f => f.field === 'name');
    expect(nameField?.translatable).toBe(true);
  });

  it('marks non-translatable fields correctly', () => {
    const schema = { price: 10, sku: 'SKU-001' };
    const fields = extractTranslatableFields(schema);
    
    const priceField = fields.find(f => f.field === 'price');
    expect(priceField?.translatable).toBe(false);
  });

  it('extracts nested fields with dot notation', () => {
    const schema = { brand: { name: 'Acme', url: 'https://acme.com' } };
    const fields = extractTranslatableFields(schema);
    
    expect(fields.some(f => f.field.includes('brand.'))).toBe(true);
  });
});

describe('Product Schema - wrapProductJsonLd', () => {
  it('wraps schema in script tag', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'Product' };
    const html = wrapProductJsonLd(schema);
    
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('</script>');
  });

  it('escapes closing script tags for XSS prevention', () => {
    const schema = { description: '</script><script>alert("xss")</script>' };
    const html = wrapProductJsonLd(schema);
    
    expect(html).not.toContain('</script><script>');
    expect(html).toContain('<\\/script>');
  });

  it('formats JSON with indentation', () => {
    const schema = { '@type': 'Product', name: 'Test' };
    const html = wrapProductJsonLd(schema);
    
    expect(html).toContain('\n');
    expect(html).toContain('  ');
  });
});

describe('Product Schema - generateProductBreadcrumbSchema', () => {
  it('generates breadcrumb with product only', () => {
    const html = generateProductBreadcrumbSchema('My Product', '/product', undefined, undefined, 'en');
    
    expect(html).toContain('BreadcrumbList');
    expect(html).toContain('My Product');
    expect(html).toContain('"position": 2');
  });

  it('includes category when provided', () => {
    const html = generateProductBreadcrumbSchema(
      'My Product',
      '/product',
      'Electronics',
      '/electronics',
      'en'
    );
    
    expect(html).toContain('Electronics');
    expect(html).toContain('"position": 3');
  });

  it('uses Arabic home label for ar locale', () => {
    const html = generateProductBreadcrumbSchema('منتج', '/product', undefined, undefined, 'ar');
    
    expect(html).toContain('الرئيسية');
  });

  it('uses Hebrew home label for he locale', () => {
    const html = generateProductBreadcrumbSchema('מוצר', '/product', undefined, undefined, 'he');
    
    expect(html).toContain('דף הבית');
  });
});

describe('Product Schema - validateProductSchema', () => {
  it('validates a complete correct schema', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test',
      description: 'Desc',
      sku: 'SKU-001',
      offers: { price: 10, priceCurrency: 'USD' },
    };
    const result = validateProductSchema(schema);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns error for missing name', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      description: 'Desc',
      sku: 'SKU-001',
      offers: { price: 10, priceCurrency: 'USD' },
    };
    const result = validateProductSchema(schema);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product name is required and must be a string');
  });

  it('returns error for missing description', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test',
      sku: 'SKU-001',
      offers: { price: 10, priceCurrency: 'USD' },
    };
    const result = validateProductSchema(schema);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product description is required and must be a string');
  });

  it('returns error for missing SKU', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test',
      description: 'Desc',
      offers: { price: 10, priceCurrency: 'USD' },
    };
    const result = validateProductSchema(schema);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product SKU is required and must be a string');
  });

  it('returns error for missing offers', () => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test',
      description: 'Desc',
      sku: 'SKU-001',
    };
    const result = validateProductSchema(schema);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Product offers are required');
  });

  it('returns error for wrong @context', () => {
    const schema = {
      '@context': 'http://example.com',
      '@type': 'Product',
      name: 'Test',
      description: 'Desc',
      sku: 'SKU-001',
      offers: { price: 10, priceCurrency: 'USD' },
    };
    const result = validateProductSchema(schema);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Schema must have @context set to https://schema.org');
  });
});

describe('Product Schema - mergeProductSchemas', () => {
  it('merges multiple schemas into @graph structure', () => {
    const schemas = [
      { '@type': 'Product', name: 'Product 1' },
      { '@type': 'Product', name: 'Product 2' },
    ];
    const merged = mergeProductSchemas(schemas);
    
    expect(merged['@context']).toBe('https://schema.org');
    expect(merged['@graph']).toHaveLength(2);
  });

  it('removes individual @context from merged schemas', () => {
    const schemas = [
      { '@context': 'https://schema.org', '@type': 'Product', name: 'Product 1' },
    ];
    const merged = mergeProductSchemas(schemas);
    const graph = merged['@graph'] as Array<Record<string, unknown>>;
    
    expect(graph[0]['@context']).toBeUndefined();
    expect(graph[0].name).toBe('Product 1');
  });
});

describe('Product Schema - HTML output', () => {
  it('generates valid HTML script tag', () => {
    const result = generateProductSchema(makeProductData(), 'en');
    
    expect(result.html).toContain('<script type="application/ld+json">');
    expect(result.html).toContain('</script>');
    expect(result.html).toContain('"@type": "Product"');
    expect(result.html).toContain('"name": "Test Product"');
  });

  it('includes all required fields in HTML output', () => {
    const result = generateProductSchema(makeProductData(), 'en');
    
    expect(result.html).toContain('SKU-001');
    expect(result.html).toContain('99.99');
    expect(result.html).toContain('USD');
  });
});
