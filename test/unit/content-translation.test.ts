import { describe, it, expect } from "vitest";
import {
  getProductTranslatableFields,
  getCollectionTranslatableFields,
  getVendorNameField,
  getProductTypeField,
  getTagFields,
  getCustomFields,
  getTemplateFields,
  getCollectionDescriptionField,
  getAllTranslatableFields,
  TRANSLATABLE_FIELDS,
} from "../../app/services/content-translation";

describe("Content Translation — getProductTranslatableFields (T0008)", () => {
  it("returns expected product fields", () => {
    const fields = getProductTranslatableFields();
    expect(fields).toContain("title");
    expect(fields).toContain("description");
    expect(fields).toContain("seo_title");
    expect(fields).toContain("seo_description");
    expect(fields).toContain("handle");
  });
});

describe("Content Translation — getCollectionTranslatableFields (T0008)", () => {
  it("returns expected collection fields", () => {
    const fields = getCollectionTranslatableFields();
    expect(fields).toContain("title");
    expect(fields).toContain("description");
    expect(fields).toContain("seo_title");
    expect(fields).toContain("seo_description");
  });
});

describe("Content Translation — Vendor Names (T0093)", () => {
  it("returns a vendor field for a product", () => {
    const field = getVendorNameField("prod-123");
    expect(field.key).toBe("vendor");
    expect(field.resourceType).toBe("product");
    expect(field.resourceId).toBe("prod-123");
  });

  it("vendor field is registered in TRANSLATABLE_FIELDS", () => {
    expect(TRANSLATABLE_FIELDS.product).toContain("vendor");
  });
});

describe("Content Translation — Product Types (T0094)", () => {
  it("returns a product_type field", () => {
    const field = getProductTypeField("prod-456");
    expect(field.key).toBe("product_type");
    expect(field.resourceType).toBe("product");
    expect(field.resourceId).toBe("prod-456");
  });

  it("product_type field is registered in TRANSLATABLE_FIELDS", () => {
    expect(TRANSLATABLE_FIELDS.product).toContain("product_type");
  });
});

describe("Content Translation — Tags (T0095)", () => {
  it("returns one field per tag", () => {
    const fields = getTagFields("prod-789", ["sale", "new", "summer"]);
    expect(fields).toHaveLength(3);
    expect(fields[0].key).toBe("tag_0");
    expect(fields[0].value).toBe("sale");
    expect(fields[1].key).toBe("tag_1");
    expect(fields[1].value).toBe("new");
    expect(fields[2].key).toBe("tag_2");
    expect(fields[2].value).toBe("summer");
  });

  it("sets correct resourceType and resourceId", () => {
    const fields = getTagFields("prod-789", ["tag1"]);
    expect(fields[0].resourceType).toBe("product");
    expect(fields[0].resourceId).toBe("prod-789");
  });

  it("returns empty array for empty tags", () => {
    const fields = getTagFields("prod-789", []);
    expect(fields).toHaveLength(0);
  });

  it("tags field is registered in TRANSLATABLE_FIELDS", () => {
    expect(TRANSLATABLE_FIELDS.product).toContain("tags");
  });
});

describe("Content Translation — Custom Fields (T0096)", () => {
  it("returns one field per metafield", () => {
    const fields = getCustomFields("prod-100", [
      { key: "color", value: "Red" },
      { key: "size", value: "Large" },
    ]);
    expect(fields).toHaveLength(2);
    expect(fields[0].key).toBe("metafield_color");
    expect(fields[0].value).toBe("Red");
    expect(fields[1].key).toBe("metafield_size");
    expect(fields[1].value).toBe("Large");
  });
});

describe("Content Translation — Template Fields (T0097)", () => {
  it("returns template_suffix and template_title", () => {
    const fields = getTemplateFields("prod-200");
    expect(fields).toHaveLength(2);
    const keys = fields.map((f) => f.key);
    expect(keys).toContain("template_suffix");
    expect(keys).toContain("template_title");
  });

  it("template fields are registered in TRANSLATABLE_FIELDS", () => {
    expect(TRANSLATABLE_FIELDS.product).toContain("template_suffix");
    expect(TRANSLATABLE_FIELDS.product).toContain("template_title");
  });
});

describe("Content Translation — Collection Description (T0098)", () => {
  it("returns a description field for a collection", () => {
    const field = getCollectionDescriptionField("col-300");
    expect(field.key).toBe("description");
    expect(field.resourceType).toBe("collection");
    expect(field.resourceId).toBe("col-300");
  });
});

describe("Content Translation — getAllTranslatableFields", () => {
  it("returns all fields for product resource type", () => {
    const fields = getAllTranslatableFields("product", "prod-all");
    expect(fields.length).toBe(TRANSLATABLE_FIELDS.product.length);
    expect(fields.every((f) => f.resourceType === "product")).toBe(true);
    expect(fields.every((f) => f.resourceId === "prod-all")).toBe(true);
  });

  it("returns all fields for collection resource type", () => {
    const fields = getAllTranslatableFields("collection", "col-all");
    expect(fields.length).toBe(TRANSLATABLE_FIELDS.collection.length);
  });

  it("returns all fields for page resource type", () => {
    const fields = getAllTranslatableFields("page", "page-1");
    expect(fields.length).toBe(TRANSLATABLE_FIELDS.page.length);
  });

  it("returns all fields for blog resource type", () => {
    const fields = getAllTranslatableFields("blog", "blog-1");
    expect(fields.length).toBe(TRANSLATABLE_FIELDS.blog.length);
  });
});

describe("Content Translation — TRANSLATABLE_FIELDS registry", () => {
  it("has entries for all resource types", () => {
    expect(TRANSLATABLE_FIELDS.product).toBeDefined();
    expect(TRANSLATABLE_FIELDS.collection).toBeDefined();
    expect(TRANSLATABLE_FIELDS.page).toBeDefined();
    expect(TRANSLATABLE_FIELDS.blog).toBeDefined();
    expect(TRANSLATABLE_FIELDS.navigation).toBeDefined();
    expect(TRANSLATABLE_FIELDS.theme).toBeDefined();
  });

  it("product has 10 translatable fields", () => {
    expect(TRANSLATABLE_FIELDS.product).toHaveLength(10);
  });

  it("collection has 4 translatable fields", () => {
    expect(TRANSLATABLE_FIELDS.collection).toHaveLength(4);
  });
});
