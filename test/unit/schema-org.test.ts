import { describe, it, expect } from 'vitest';
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  wrapJsonLd,
} from '../../app/services/schema-org/generator';
import type { ProductSchemaInput } from '../../app/services/schema-org/types';

function makeProductInput(overrides: Partial<ProductSchemaInput> = {}): ProductSchemaInput {
  return {
    name: 'Test Product',
    description: 'A great product',
    sku: 'SKU-001',
    price: 99.99,
    currency: 'USD',
    availability: 'InStock',
    url: 'https://example.com/products/test',
    locale: 'en',
    ...overrides,
  };
}

describe('Schema.org - generateProductSchema', () => {
  it('returns jsonLd with @context "https://schema.org" and @type "Product"', () => {
    const result = generateProductSchema(makeProductInput());

    expect(result.jsonLd['@context']).toBe('https://schema.org');
    expect(result.jsonLd['@type']).toBe('Product');
  });

  it('jsonLd contains name, description, and sku', () => {
    const result = generateProductSchema(makeProductInput());

    expect(result.jsonLd.name).toBe('Test Product');
    expect(result.jsonLd.description).toBe('A great product');
    expect(result.jsonLd.sku).toBe('SKU-001');
  });

  it('jsonLd contains offers with price and currency', () => {
    const result = generateProductSchema(makeProductInput());
    const offers = result.jsonLd.offers as Record<string, unknown>;

    expect(offers['@type']).toBe('Offer');
    expect(offers.price).toBe(99.99);
    expect(offers.priceCurrency).toBe('USD');
  });

  it('maps InStock availability to the correct schema.org URL', () => {
    const result = generateProductSchema(makeProductInput({ availability: 'InStock' }));
    const offers = result.jsonLd.offers as Record<string, unknown>;

    expect(offers.availability).toBe('https://schema.org/InStock');
  });

  it('maps OutOfStock availability correctly', () => {
    const result = generateProductSchema(makeProductInput({ availability: 'OutOfStock' }));
    const offers = result.jsonLd.offers as Record<string, unknown>;

    expect(offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('maps PreOrder availability correctly', () => {
    const result = generateProductSchema(makeProductInput({ availability: 'PreOrder' }));
    const offers = result.jsonLd.offers as Record<string, unknown>;

    expect(offers.availability).toBe('https://schema.org/PreOrder');
  });

  it('html output contains <script type="application/ld+json">', () => {
    const result = generateProductSchema(makeProductInput());

    expect(result.html).toContain('<script type="application/ld+json">');
    expect(result.html).toContain('</script>');
  });

  it('includes aggregateRating when ratingValue and reviewCount are provided', () => {
    const result = generateProductSchema(
      makeProductInput({ ratingValue: 4.5, reviewCount: 120 }),
    );
    const rating = result.jsonLd.aggregateRating as Record<string, unknown>;

    expect(rating).toBeDefined();
    expect(rating['@type']).toBe('AggregateRating');
    expect(rating.ratingValue).toBe(4.5);
    expect(rating.reviewCount).toBe(120);
  });

  it('omits aggregateRating when reviewCount is 0', () => {
    const result = generateProductSchema(
      makeProductInput({ ratingValue: 4.5, reviewCount: 0 }),
    );

    expect(result.jsonLd.aggregateRating).toBeUndefined();
  });

  it('includes brand when provided', () => {
    const result = generateProductSchema(makeProductInput({ brand: 'Acme' }));
    const brand = result.jsonLd.brand as Record<string, unknown>;

    expect(brand['@type']).toBe('Brand');
    expect(brand.name).toBe('Acme');
  });

  it('includes image when imageUrl is provided', () => {
    const result = generateProductSchema(
      makeProductInput({ imageUrl: 'https://example.com/img.jpg' }),
    );

    expect(result.jsonLd.image).toBe('https://example.com/img.jpg');
  });
});

describe('Schema.org - generateBreadcrumbSchema', () => {
  it('contains BreadcrumbList @type', () => {
    const html = generateBreadcrumbSchema({
      items: [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Products', url: 'https://example.com/products' },
      ],
      locale: 'en',
    });

    expect(html).toContain('"@type": "BreadcrumbList"');
  });

  it('contains itemListElement with positions starting at 1', () => {
    const html = generateBreadcrumbSchema({
      items: [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Shoes', url: 'https://example.com/shoes' },
      ],
      locale: 'en',
    });

    expect(html).toContain('"position": 1');
    expect(html).toContain('"position": 2');
    expect(html).toContain('"@type": "ListItem"');
  });
});

describe('Schema.org - generateOrganizationSchema', () => {
  it('contains Organization @type', () => {
    const html = generateOrganizationSchema('Acme Corp', 'https://acme.com', 'en');

    expect(html).toContain('"@type": "Organization"');
    expect(html).toContain('"name": "Acme Corp"');
  });

  it('includes inLanguage field', () => {
    const html = generateOrganizationSchema('Acme', 'https://acme.com', 'ar');

    expect(html).toContain('"inLanguage": "ar"');
  });
});

describe('Schema.org - wrapJsonLd', () => {
  it('wraps the schema object in a script tag', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'Thing' };
    const html = wrapJsonLd(schema);

    expect(html).toMatch(/^<script type="application\/ld\+json">/);
    expect(html).toMatch(/<\/script>$/);
    expect(html).toContain('"@type": "Thing"');
  });
});
