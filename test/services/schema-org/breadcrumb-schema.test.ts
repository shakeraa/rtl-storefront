import { describe, it, expect } from "vitest";
import {
  generateBreadcrumbSchema,
  generateProductBreadcrumbSchema,
  generateCollectionBreadcrumbSchema,
  generatePageBreadcrumbSchema,
  validateBreadcrumbSchema,
  extractBreadcrumbItems,
  createBreadcrumbBuilder,
} from "../../../app/services/schema-org/breadcrumb-schema";
import type { BreadcrumbItem } from "../../../app/services/schema-org/breadcrumb-schema";

describe("Breadcrumb Schema (T0075)", () => {
  describe("generateBreadcrumbSchema", () => {
    it("should generate valid breadcrumb schema", () => {
      const items: BreadcrumbItem[] = [
        { name: "Products", url: "/products", type: "WebPage" },
        { name: "Summer Collection", url: "/collections/summer", type: "CollectionPage" },
        { name: "Summer Dress", url: "/products/summer-dress", type: "Product" },
      ];

      const result = generateBreadcrumbSchema(items, "en");

      expect(result.isValid).toBe(true);
      expect(result.jsonLd["@type"]).toBe("BreadcrumbList");
      expect(result.jsonLd["@context"]).toBe("https://schema.org");
      expect(result.itemCount).toBe(4); // + home
      expect(result.locale).toBe("en");
    });

    it("should include home page by default", () => {
      const items: BreadcrumbItem[] = [
        { name: "Products", url: "/products" },
      ];

      const result = generateBreadcrumbSchema(items, "en");
      const extracted = extractBreadcrumbItems(result.jsonLd);

      expect(extracted?.[0].name).toBe("Home");
      expect(extracted?.[0].url).toBe("/");
    });

    it("should handle Arabic locale", () => {
      const items: BreadcrumbItem[] = [
        { name: "المنتجات", url: "/ar/products" },
        { name: "فستان صيفي", url: "/ar/products/summer-dress" },
      ];

      const result = generateBreadcrumbSchema(items, "ar");

      expect(result.direction).toBe("rtl");
      expect(result.locale).toBe("ar");
      const extracted = extractBreadcrumbItems(result.jsonLd);
      expect(extracted?.[0].name).toBe("الرئيسية");
    });

    it("should handle Hebrew locale", () => {
      const items: BreadcrumbItem[] = [
        { name: "מוצרים", url: "/he/products" },
        { name: "שמלת קיץ", url: "/he/products/summer-dress" },
      ];

      const result = generateBreadcrumbSchema(items, "he");

      expect(result.direction).toBe("rtl");
      expect(result.locale).toBe("he");
      const extracted = extractBreadcrumbItems(result.jsonLd);
      expect(extracted?.[0].name).toBe("דף הבית");
    });

    it("should skip home when includeHome is false", () => {
      const items: BreadcrumbItem[] = [
        { name: "Products", url: "/products" },
      ];

      const result = generateBreadcrumbSchema(items, "en", { includeHome: false });
      const extracted = extractBreadcrumbItems(result.jsonLd);

      expect(extracted?.[0].name).toBe("Products");
      expect(result.itemCount).toBe(1);
    });

    it("should generate correct itemListElement structure", () => {
      const items: BreadcrumbItem[] = [
        { name: "Products", url: "/products", type: "WebPage" },
      ];

      const result = generateBreadcrumbSchema(items, "en", { includeHome: false });
      const listItems = result.jsonLd.itemListElement as Array<Record<string, unknown>>;

      expect(listItems[0]["@type"]).toBe("ListItem");
      expect(listItems[0].position).toBe(1);
      expect(listItems[0].name).toBe("Products");
      expect((listItems[0].item as Record<string, unknown>).url).toBe("/products");
    });

    it("should include inLanguage attribute", () => {
      const items: BreadcrumbItem[] = [{ name: "Products", url: "/products" }];
      const result = generateBreadcrumbSchema(items, "en");

      expect(result.jsonLd.inLanguage).toBe("en");
    });
  });

  describe("generateProductBreadcrumbSchema", () => {
    it("should generate breadcrumb for product page", () => {
      const result = generateProductBreadcrumbSchema(
        "Summer Dress",
        "/products/summer-dress",
        "Summer Collection",
        "/collections/summer",
        "en",
      );

      expect(result.isValid).toBe(true);
      const items = extractBreadcrumbItems(result.jsonLd);
      expect(items?.some(i => i.name === "Summer Collection")).toBe(true);
      expect(items?.some(i => i.name === "Summer Dress")).toBe(true);
    });

    it("should generate breadcrumb without collection", () => {
      const result = generateProductBreadcrumbSchema(
        "Summer Dress",
        "/products/summer-dress",
        undefined,
        undefined,
        "en",
      );

      expect(result.isValid).toBe(true);
      const items = extractBreadcrumbItems(result.jsonLd);
      expect(items?.some(i => i.name === "Summer Dress")).toBe(true);
    });
  });

  describe("generateCollectionBreadcrumbSchema", () => {
    it("should generate breadcrumb for collection page", () => {
      const result = generateCollectionBreadcrumbSchema(
        "Summer Collection",
        "/collections/summer",
        undefined,
        undefined,
        "en",
      );

      expect(result.isValid).toBe(true);
      const items = extractBreadcrumbItems(result.jsonLd);
      expect(items?.some(i => i.name === "Summer Collection")).toBe(true);
    });

    it("should generate breadcrumb with parent collection", () => {
      const result = generateCollectionBreadcrumbSchema(
        "Dresses",
        "/collections/dresses",
        "Women's Fashion",
        "/collections/womens-fashion",
        "en",
      );

      const items = extractBreadcrumbItems(result.jsonLd);
      expect(items?.some(i => i.name === "Women's Fashion")).toBe(true);
      expect(items?.some(i => i.name === "Dresses")).toBe(true);
    });
  });

  describe("generatePageBreadcrumbSchema", () => {
    it("should generate breadcrumb for page with parent pages", () => {
      const result = generatePageBreadcrumbSchema(
        "Contact Us",
        "/pages/contact",
        [
          { name: "About", url: "/pages/about" },
          { name: "Company", url: "/pages/company" },
        ],
        "en",
      );

      expect(result.isValid).toBe(true);
      const items = extractBreadcrumbItems(result.jsonLd);
      expect(items?.some(i => i.name === "About")).toBe(true);
      expect(items?.some(i => i.name === "Company")).toBe(true);
      expect(items?.some(i => i.name === "Contact Us")).toBe(true);
    });
  });

  describe("validateBreadcrumbSchema", () => {
    it("should validate a correct schema", () => {
      const items: BreadcrumbItem[] = [{ name: "Products", url: "/products" }];
      const result = generateBreadcrumbSchema(items, "en", { includeHome: false });
      const validation = validateBreadcrumbSchema(result.jsonLd);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect missing @context", () => {
      const validation = validateBreadcrumbSchema({
        "@type": "BreadcrumbList",
        itemListElement: [],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("@context"))).toBe(true);
    });

    it("should detect wrong @type", () => {
      const validation = validateBreadcrumbSchema({
        "@context": "https://schema.org",
        "@type": "Product",
        itemListElement: [],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("@type"))).toBe(true);
    });

    it("should detect empty itemListElement", () => {
      const validation = validateBreadcrumbSchema({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("at least one item"))).toBe(true);
    });

    it("should detect incorrect positions", () => {
      const validation = validateBreadcrumbSchema({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home" },
          { "@type": "ListItem", position: 3, name: "Products" },
        ],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes("position"))).toBe(true);
    });
  });

  describe("extractBreadcrumbItems", () => {
    it("should extract items from schema", () => {
      const items: BreadcrumbItem[] = [
        { name: "Products", url: "/products" },
        { name: "Dresses", url: "/collections/dresses" },
      ];

      const result = generateBreadcrumbSchema(items, "en", { includeHome: false });
      const extracted = extractBreadcrumbItems(result.jsonLd);

      expect(extracted).toHaveLength(2);
      expect(extracted?.[0].name).toBe("Products");
      expect(extracted?.[0].position).toBe(1);
      expect(extracted?.[1].name).toBe("Dresses");
      expect(extracted?.[1].position).toBe(2);
    });

    it("should return null for invalid schema", () => {
      const extracted = extractBreadcrumbItems({ name: "test" });
      expect(extracted).toBeNull();
    });
  });

  describe("createBreadcrumbBuilder", () => {
    it("should build breadcrumbs with fluent API", () => {
      const builder = createBreadcrumbBuilder("en");
      
      const result = builder
        .addHome("/")
        .addCollection("Summer Collection", "/collections/summer")
        .addProduct("Summer Dress", "/products/summer-dress")
        .build();

      expect(result.isValid).toBe(true);
      const items = extractBreadcrumbItems(result.jsonLd);
      expect(items?.some(i => i.name === "Summer Collection")).toBe(true);
      expect(items?.some(i => i.name === "Summer Dress")).toBe(true);
    });

    it("should clear items", () => {
      const builder = createBreadcrumbBuilder("en");
      
      builder.addPage("Page 1", "/page1");
      expect(builder.getItems()).toHaveLength(1);
      
      builder.clear();
      expect(builder.getItems()).toHaveLength(0);
    });

    it("should support custom items", () => {
      const builder = createBreadcrumbBuilder("ar");
      
      const result = builder
        .addItem({ name: "تصنيف مخصص", url: "/custom", type: "WebPage" })
        .build({ includeHome: true });

      const items = extractBreadcrumbItems(result.jsonLd);
      expect(items?.some(i => i.name === "تصنيف مخصص")).toBe(true);
    });
  });
});
