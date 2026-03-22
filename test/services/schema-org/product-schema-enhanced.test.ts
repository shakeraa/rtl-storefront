import { describe, it, expect } from "vitest";
import {
  generateEnhancedProductSchema,
  validateEnhancedProductSchema,
  extractPriceFromSchema,
  extractReviewsFromSchema,
  generateMultipleProductSchemas,
  mergeEnhancedProductSchemas,
} from "../../../app/services/schema-org/product-schema-enhanced";
import type { EnhancedProductData } from "../../../app/services/schema-org/product-schema-enhanced";

describe("Product Schema Enhanced (T0074)", () => {
  const baseProduct: EnhancedProductData = {
    name: "Summer Dress",
    description: "A beautiful summer dress perfect for warm days",
    sku: "DRESS-001",
    price: 99.99,
    currency: "USD",
    availability: "InStock",
    url: "https://example.com/products/summer-dress",
    imageUrl: "https://example.com/images/dress.jpg",
    brand: "Fashion Brand",
  };

  describe("generateEnhancedProductSchema", () => {
    it("should generate valid product schema with required fields", () => {
      const result = generateEnhancedProductSchema(baseProduct, "en");

      expect(result.isValid).toBe(true);
      expect(result.jsonLd["@type"]).toBe("Product");
      expect(result.jsonLd["@context"]).toBe("https://schema.org");
      expect(result.jsonLd.name).toBe("Summer Dress");
      expect(result.jsonLd.description).toBe("A beautiful summer dress perfect for warm days");
      expect(result.jsonLd.sku).toBe("DRESS-001");
      expect(result.jsonLd.inLanguage).toBe("en");
    });

    it("should include offers with price and currency", () => {
      const result = generateEnhancedProductSchema(baseProduct, "en");

      expect(result.jsonLd.offers).toBeDefined();
      const offers = result.jsonLd.offers as Record<string, unknown>;
      expect(offers["@type"]).toBe("Offer");
      expect(offers.price).toBe(99.99);
      expect(offers.priceCurrency).toBe("USD");
      expect(offers.availability).toBe("https://schema.org/InStock");
    });

    it("should handle different availability statuses", () => {
      const statuses: EnhancedProductData["availability"][] = ["InStock", "OutOfStock", "PreOrder", "BackOrder"];
      
      for (const availability of statuses) {
        const result = generateEnhancedProductSchema(
          { ...baseProduct, availability },
          "en",
        );
        const offers = result.jsonLd.offers as Record<string, unknown>;
        expect(offers.availability).toContain(availability);
      }
    });

    it("should include review ratings", () => {
      const productWithReviews: EnhancedProductData = {
        ...baseProduct,
        aggregateRating: {
          ratingValue: 4.5,
          reviewCount: 128,
          bestRating: 5,
          worstRating: 1,
        },
        reviews: [
          {
            author: "John Doe",
            ratingValue: 5,
            reviewBody: "Great dress!",
            datePublished: "2026-03-01",
          },
        ],
      };

      const result = generateEnhancedProductSchema(productWithReviews, "en");

      expect(result.jsonLd.aggregateRating).toBeDefined();
      const rating = result.jsonLd.aggregateRating as Record<string, unknown>;
      expect(rating.ratingValue).toBe(4.5);
      expect(rating.reviewCount).toBe(128);
      expect(rating["@type"]).toBe("AggregateRating");

      expect(result.jsonLd.review).toBeDefined();
      const reviews = result.jsonLd.review as Array<Record<string, unknown>>;
      expect(reviews).toHaveLength(1);
      expect(reviews[0]["@type"]).toBe("Review");
    });

    it("should generate HTML output", () => {
      const result = generateEnhancedProductSchema(baseProduct, "en");

      expect(result.html).toContain('<script type="application/ld+json">');
      expect(result.html).toContain("</script>");
      expect(result.html).toContain("Summer Dress");
    });

    it("should handle RTL locales", () => {
      const arabicProduct: EnhancedProductData = {
        ...baseProduct,
        name: "فستان صيفي",
        description: "فستان صيفي جميل",
      };

      const result = generateEnhancedProductSchema(arabicProduct, "ar");

      expect(result.direction).toBe("rtl");
      expect(result.locale).toBe("ar");
      expect(result.jsonLd.name).toBe("فستان صيفي");
    });

    it("should handle Hebrew locale", () => {
      const hebrewProduct: EnhancedProductData = {
        ...baseProduct,
        name: "שמלת קיץ",
        description: "שמלה יפה לקיץ",
      };

      const result = generateEnhancedProductSchema(hebrewProduct, "he");

      expect(result.direction).toBe("rtl");
      expect(result.locale).toBe("he");
    });

    it("should include product variants", () => {
      const productWithVariants: EnhancedProductData = {
        ...baseProduct,
        hasVariant: [
          { sku: "DRESS-001-S", name: "Summer Dress - Small", price: 99.99, size: "S", color: "Red" },
          { sku: "DRESS-001-M", name: "Summer Dress - Medium", price: 99.99, size: "M", color: "Red" },
        ],
      };

      const result = generateEnhancedProductSchema(productWithVariants, "en");

      expect(result.jsonLd.hasVariant).toBeDefined();
      const variants = result.jsonLd.hasVariant as Array<Record<string, unknown>>;
      expect(variants).toHaveLength(2);
      expect(variants[0].sku).toBe("DRESS-001-S");
      expect(variants[0].size).toBe("S");
      expect(variants[0].color).toBe("Red");
    });

    it("should include brand information", () => {
      const result = generateEnhancedProductSchema(baseProduct, "en");

      expect(result.jsonLd.brand).toBeDefined();
      const brand = result.jsonLd.brand as Record<string, unknown>;
      expect(brand["@type"]).toBe("Brand");
      expect(brand.name).toBe("Fashion Brand");
    });

    it("should include product dimensions and weight", () => {
      const productWithDimensions: EnhancedProductData = {
        ...baseProduct,
        weight: { value: 0.5, unit: "KGM" },
        dimensions: { width: 30, height: 100, depth: 2, unit: "CM" },
      };

      const result = generateEnhancedProductSchema(productWithDimensions, "en");

      expect(result.jsonLd.weight).toBeDefined();
      expect(result.jsonLd.width).toBeDefined();
      expect(result.jsonLd.height).toBeDefined();
      expect(result.jsonLd.depth).toBeDefined();
    });
  });

  describe("validateEnhancedProductSchema", () => {
    it("should validate a valid schema", () => {
      const result = generateEnhancedProductSchema(baseProduct, "en");
      const validation = validateEnhancedProductSchema(result.jsonLd);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect missing name", () => {
      const validation = validateEnhancedProductSchema({
        ...generateEnhancedProductSchema(baseProduct, "en").jsonLd,
        name: "",
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("name"))).toBe(true);
    });

    it("should detect missing offers", () => {
      const validation = validateEnhancedProductSchema({
        ...generateEnhancedProductSchema(baseProduct, "en").jsonLd,
        offers: undefined,
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("offers"))).toBe(true);
    });

    it("should detect invalid @context", () => {
      const validation = validateEnhancedProductSchema({
        ...generateEnhancedProductSchema(baseProduct, "en").jsonLd,
        "@context": "http://wrong-context.org",
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("@context"))).toBe(true);
    });
  });

  describe("extractPriceFromSchema", () => {
    it("should extract price information", () => {
      const result = generateEnhancedProductSchema(baseProduct, "en");
      const priceInfo = extractPriceFromSchema(result.jsonLd);

      expect(priceInfo).toBeDefined();
      expect(priceInfo?.price).toBe(99.99);
      expect(priceInfo?.currency).toBe("USD");
      expect(priceInfo?.availability).toContain("InStock");
    });

    it("should return null for schema without offers", () => {
      const priceInfo = extractPriceFromSchema({ name: "Product" });
      expect(priceInfo).toBeNull();
    });
  });

  describe("extractReviewsFromSchema", () => {
    it("should extract review information", () => {
      const productWithReviews: EnhancedProductData = {
        ...baseProduct,
        aggregateRating: {
          ratingValue: 4.5,
          reviewCount: 10,
        },
        reviews: [
          { author: "User1", ratingValue: 5, reviewBody: "Great!" },
          { author: "User2", ratingValue: 4, reviewBody: "Good" },
        ],
      };

      const result = generateEnhancedProductSchema(productWithReviews, "en");
      const reviewInfo = extractReviewsFromSchema(result.jsonLd);

      expect(reviewInfo).toBeDefined();
      expect(reviewInfo?.ratingValue).toBe(4.5);
      expect(reviewInfo?.reviewCount).toBe(10);
      expect(reviewInfo?.reviews).toHaveLength(2);
    });

    it("should return null for schema without reviews", () => {
      const result = generateEnhancedProductSchema(baseProduct, "en");
      const reviewInfo = extractReviewsFromSchema(result.jsonLd);
      expect(reviewInfo).toBeNull();
    });
  });

  describe("generateMultipleProductSchemas", () => {
    it("should generate schemas for multiple products", () => {
      const products: EnhancedProductData[] = [
        { ...baseProduct, sku: "DRESS-001", name: "Dress 1" },
        { ...baseProduct, sku: "DRESS-002", name: "Dress 2" },
        { ...baseProduct, sku: "DRESS-003", name: "Dress 3" },
      ];

      const results = generateMultipleProductSchemas(products, "en");

      expect(results).toHaveLength(3);
      expect(results[0].jsonLd.name).toBe("Dress 1");
      expect(results[1].jsonLd.name).toBe("Dress 2");
      expect(results[2].jsonLd.name).toBe("Dress 3");
    });
  });

  describe("mergeEnhancedProductSchemas", () => {
    it("should merge multiple schemas into a graph", () => {
      const products: EnhancedProductData[] = [
        { ...baseProduct, sku: "DRESS-001", name: "Dress 1" },
        { ...baseProduct, sku: "DRESS-002", name: "Dress 2" },
      ];

      const results = generateMultipleProductSchemas(products, "en");
      const merged = mergeEnhancedProductSchemas(results);

      expect(merged.jsonLd["@graph"]).toBeDefined();
      expect((merged.jsonLd["@graph"] as unknown[]).length).toBe(2);
      expect(merged.html).toContain("@graph");
    });
  });
});
