import { describe, it, expect } from "vitest";
import {
  extractProductImageAlts,
  extractCollectionImageAlt,
  generateFallbackAltText,
} from "../../app/services/content/image-alt-text.server";

describe("Image Alt-Text Translation Service", () => {
  describe("extractProductImageAlts", () => {
    it("extracts alt texts from product images", () => {
      const product = {
        images: {
          edges: [
            { node: { id: "img1", url: "https://cdn.shopify.com/1.jpg", altText: "Black abaya" } },
            { node: { id: "img2", url: "https://cdn.shopify.com/2.jpg", altText: "Side view" } },
            { node: { id: "img3", url: "https://cdn.shopify.com/3.jpg", altText: "" } },
          ],
        },
      };

      const alts = extractProductImageAlts(product);
      expect(alts).toHaveLength(3);
      expect(alts[0].altText).toBe("Black abaya");
      expect(alts[1].altText).toBe("Side view");
      expect(alts[2].altText).toBe("");
    });

    it("returns empty array for product with no images", () => {
      expect(extractProductImageAlts({})).toEqual([]);
      expect(extractProductImageAlts({ images: {} })).toEqual([]);
    });
  });

  describe("extractCollectionImageAlt", () => {
    it("extracts alt text from collection image", () => {
      const collection = {
        image: { id: "col-img1", url: "https://cdn.shopify.com/col.jpg", altText: "Summer collection" },
      };

      const alts = extractCollectionImageAlt(collection);
      expect(alts).toHaveLength(1);
      expect(alts[0].altText).toBe("Summer collection");
    });

    it("returns empty array for collection with no image", () => {
      expect(extractCollectionImageAlt({})).toEqual([]);
    });
  });

  describe("generateFallbackAltText", () => {
    it("uses product title for first image", () => {
      expect(generateFallbackAltText("Silk Abaya", 0)).toBe("Silk Abaya");
    });

    it("adds image number for subsequent images", () => {
      expect(generateFallbackAltText("Silk Abaya", 1)).toBe("Silk Abaya - Image 2");
      expect(generateFallbackAltText("Silk Abaya", 2)).toBe("Silk Abaya - Image 3");
    });

    it("includes variant when provided", () => {
      expect(generateFallbackAltText("Silk Abaya", 0, "Black / Large")).toBe("Silk Abaya - Black / Large");
    });
  });
});
