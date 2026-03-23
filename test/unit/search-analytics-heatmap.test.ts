import { describe, it, expect } from "vitest";

// Search service
import {
  normalizeArabic,
  normalizeHebrew,
  normalizeForSearch,
  transliterateArabicToLatin,
  transliterateLatinToArabic,
  buildSearchQuery,
  matchesProduct,
  ARABIC_TO_LATIN_MAP,
  LATIN_TO_ARABIC_MAP,
} from "../../app/services/search/index";

// Regional analytics
import {
  getCountryMetrics,
  getDialectMetrics,
  getPaymentMethodStats,
  getLocalizationROI,
  MENA_COUNTRIES,
  HOLIDAYS,
  type AnalyticsEvent,
} from "../../app/services/analytics/regional";

// Heatmap / UX
import {
  calculateRTLUXScore,
  getHotZones,
  getUXRecommendations,
  isRTLOptimized,
  RTL_ATTENTION_ZONES,
  type ClickEvent,
} from "../../app/services/heatmap/index";

// Stubs
import { getUntranslatedResources } from "../../app/services/automation/sync";
import { translateSchemaFields } from "../../app/services/schema-org/product-schema";

// ---------------------------------------------------------------------------
// T0392 — Bidirectional Search
// ---------------------------------------------------------------------------

describe("Search: normalizeArabic", () => {
  it("strips tashkeel diacritics", () => {
    // كِتَابٌ (with fatha, kasra, tanwin) → كتاب
    const withDiacritics = "\u0643\u0650\u062A\u064E\u0627\u0628\u064C";
    const result = normalizeArabic(withDiacritics);
    expect(result).toBe("\u0643\u062A\u0627\u0628");
    expect(result).not.toMatch(/[\u064B-\u065F]/);
  });

  it("normalizes hamza variants to bare alef", () => {
    // أ إ آ should all become ا
    const input = "\u0623\u0645\u0631 \u0625\u0633\u0644\u0627\u0645 \u0622\u062E\u0631";
    const result = normalizeArabic(input);
    expect(result).not.toContain("\u0623");
    expect(result).not.toContain("\u0625");
    expect(result).not.toContain("\u0622");
    expect(result).toContain("\u0627"); // bare alef
  });

  it("normalizes ta marbuta to ha", () => {
    // مدرسة → مدرسه
    const input = "\u0645\u062F\u0631\u0633\u0629";
    const result = normalizeArabic(input);
    expect(result).toBe("\u0645\u062F\u0631\u0633\u0647");
  });
});

describe("Search: normalizeHebrew", () => {
  it("strips niqqud vowel marks", () => {
    // שָׁלוֹם (shalom with niqqud) → שלום
    const withNiqqud = "\u05E9\u05B8\u05C1\u05DC\u05D5\u05B9\u05DD";
    const result = normalizeHebrew(withNiqqud);
    expect(result).not.toMatch(/[\u05B0-\u05BD]/);
    // Should contain the base letters
    expect(result).toContain("\u05E9"); // shin
    expect(result).toContain("\u05DC"); // lamed
    expect(result).toContain("\u05D5"); // vav
  });

  it("maps final letter forms to regular forms", () => {
    // ם → מ, ן → נ, ך → כ, ף → פ, ץ → צ
    const finals = "\u05DD\u05DF\u05DA\u05E3\u05E5";
    const result = normalizeHebrew(finals);
    expect(result).toBe("\u05DE\u05E0\u05DB\u05E4\u05E6");
  });
});

describe("Search: transliteration", () => {
  it("transliterates Arabic to Latin (not pass-through)", () => {
    // بسم → bsm
    const arabic = "\u0628\u0633\u0645";
    const result = transliterateArabicToLatin(arabic);
    expect(result).toBe("bsm");
    // Must NOT be the same as input (anti-stub check)
    expect(result).not.toBe(arabic);
  });

  it("transliterates Latin to Arabic (not pass-through)", () => {
    const latin = "bsm";
    const result = transliterateLatinToArabic(latin);
    expect(result).toBe("\u0628\u0633\u0645");
    expect(result).not.toBe(latin);
  });

  it("handles digraphs in Latin-to-Arabic", () => {
    // "sh" → ش, "kh" → خ
    const result = transliterateLatinToArabic("sh");
    expect(result).toBe("\u0634");
  });
});

describe("Search: buildSearchQuery", () => {
  it("returns normalized, transliterated, and original", () => {
    const q = buildSearchQuery("\u0643\u0650\u062A\u064E\u0627\u0628", "ar");
    expect(q.original).toBe("\u0643\u0650\u062A\u064E\u0627\u0628");
    expect(q.normalized).not.toBe(q.original); // tashkeel stripped
    expect(q.transliterated.length).toBeGreaterThan(0);
  });
});

describe("Search: matchesProduct", () => {
  it("matches product by normalized Arabic title", () => {
    const product = {
      title: "\u0643\u0650\u062A\u064E\u0627\u0628 \u0627\u0644\u0639\u0631\u0628\u064A\u0629",
      description: "Arabic textbook",
    };
    // Search without diacritics should still match
    const matched = matchesProduct("\u0643\u062A\u0627\u0628", product, "ar");
    expect(matched).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T0394 — Regional Conversion Analytics
// ---------------------------------------------------------------------------

function makeEvent(overrides: Partial<AnalyticsEvent>): AnalyticsEvent {
  return {
    country: "SA",
    revenue: 100,
    converted: true,
    timestamp: new Date("2025-06-15"),
    ...overrides,
  };
}

describe("Analytics: getCountryMetrics", () => {
  it("aggregates by country correctly", () => {
    const events: AnalyticsEvent[] = [
      makeEvent({ country: "SA", revenue: 200 }),
      makeEvent({ country: "SA", revenue: 300 }),
      makeEvent({ country: "AE", revenue: 150 }),
      makeEvent({ country: "AE", revenue: 0, converted: false }),
    ];

    const metrics = getCountryMetrics(events);
    expect(metrics.length).toBe(2);

    const sa = metrics.find((m) => m.country === "SA")!;
    expect(sa.revenue).toBe(500);
    expect(sa.orders).toBe(2);

    const ae = metrics.find((m) => m.country === "AE")!;
    expect(ae.revenue).toBe(150);
    expect(ae.orders).toBe(1);
  });

  it("different countries get different metrics", () => {
    const events: AnalyticsEvent[] = [
      makeEvent({ country: "SA", revenue: 500, paymentMethod: "Mada" }),
      makeEvent({ country: "AE", revenue: 100, paymentMethod: "Tabby" }),
    ];

    const metrics = getCountryMetrics(events);
    const sa = metrics.find((m) => m.country === "SA")!;
    const ae = metrics.find((m) => m.country === "AE")!;

    expect(sa.revenue).not.toBe(ae.revenue);
    expect(sa.topPaymentMethod).toBe("Mada");
    expect(ae.topPaymentMethod).toBe("Tabby");
  });
});

describe("Analytics: getDialectMetrics", () => {
  it("aggregates by dialect", () => {
    const events: AnalyticsEvent[] = [
      makeEvent({ dialect: "gulf", pageView: true, converted: true, revenue: 200 }),
      makeEvent({ dialect: "gulf", pageView: true, converted: false, revenue: 0 }),
      makeEvent({ dialect: "egyptian", pageView: true, converted: true, revenue: 150 }),
    ];

    const metrics = getDialectMetrics(events);
    expect(metrics.length).toBe(2);

    const gulf = metrics.find((m) => m.dialect === "gulf")!;
    expect(gulf.pageViews).toBe(2);
    expect(gulf.conversions).toBe(1);
  });
});

describe("Analytics: getLocalizationROI", () => {
  it("detects positive lift", () => {
    const before = [
      makeEvent({ revenue: 100, converted: false }),
      makeEvent({ revenue: 100, converted: true }),
    ];
    const after = [
      makeEvent({ revenue: 200, converted: true }),
      makeEvent({ revenue: 200, converted: true }),
    ];

    const roi = getLocalizationROI(before, after);
    expect(roi.revenueLift).toBeGreaterThan(0);
    expect(roi.conversionLift).toBeGreaterThan(0);
    expect(roi.recommendation.length).toBeGreaterThan(0);
  });
});

describe("Analytics: constants", () => {
  it("MENA_COUNTRIES has entries with en/ar/he names", () => {
    expect(MENA_COUNTRIES.length).toBeGreaterThan(0);
    for (const c of MENA_COUNTRIES) {
      expect(c.en.length).toBeGreaterThan(0);
      expect(c.ar.length).toBeGreaterThan(0);
      expect(c.he.length).toBeGreaterThan(0);
    }
  });

  it("HOLIDAYS includes expected holidays", () => {
    const names = HOLIDAYS.map((h) => h.id);
    expect(names).toContain("ramadan");
    expect(names).toContain("eid-al-fitr");
    expect(names).toContain("hanukkah");
    expect(names).toContain("white-friday");
  });
});

// ---------------------------------------------------------------------------
// T0393 — Heatmap / UX Analysis
// ---------------------------------------------------------------------------

describe("Heatmap: RTL hot zones", () => {
  it("primary RTL zone is in top-right, not top-left", () => {
    expect(RTL_ATTENTION_ZONES.primary.label).toBe("top-right");
    expect(RTL_ATTENTION_ZONES.primary.x).toBeGreaterThan(0.5);
  });

  it("getHotZones assigns RTL clicks to right-side zones", () => {
    // All clicks in top-right quadrant
    const clicks: ClickEvent[] = Array.from({ length: 20 }, (_, i) => ({
      x: 0.7 + (i % 5) * 0.05,
      y: 0.1 + (i % 4) * 0.05,
    }));

    const zones = getHotZones(clicks, true);
    // The zone with the most clicks should be "top-right"
    expect(zones[0].label).toBe("top-right");
    expect(zones[0].clicks).toBeGreaterThan(0);
  });

  it("LTR hot zones have primary on the left side", () => {
    const clicks: ClickEvent[] = Array.from({ length: 20 }, (_, i) => ({
      x: 0.1 + (i % 5) * 0.05,
      y: 0.1 + (i % 4) * 0.05,
    }));

    const zones = getHotZones(clicks, false);
    expect(zones[0].label).toBe("top-left");
    expect(zones[0].clicks).toBeGreaterThan(0);
  });
});

describe("Heatmap: calculateRTLUXScore", () => {
  it("scores high for well-optimized RTL page", () => {
    const score = calculateRTLUXScore({
      ctaPositionX: 0.85,
      navRightAligned: true,
      formLabelsRightAligned: true,
      formInputsRtl: true,
      checkoutRtlFlow: true,
      checkoutLocalizedPayments: true,
      bounceRate: 0.2,
      avgTimeOnPage: 120,
    });

    expect(score.overall).toBeGreaterThanOrEqual(70);
    expect(isRTLOptimized(score)).toBe(true);
  });

  it("scores low for LTR-only page", () => {
    const score = calculateRTLUXScore({
      ctaPositionX: 0.15,
      navRightAligned: false,
      formLabelsRightAligned: false,
      formInputsRtl: false,
      checkoutRtlFlow: false,
      checkoutLocalizedPayments: false,
      bounceRate: 0.6,
      avgTimeOnPage: 30,
    });

    expect(score.overall).toBeLessThan(50);
    expect(isRTLOptimized(score)).toBe(false);
  });
});

describe("Heatmap: getUXRecommendations", () => {
  it("returns recommendations for low scores", () => {
    const recs = getUXRecommendations({
      overall: 30,
      ctaPlacement: 20,
      navigationFlow: 30,
      formFields: 40,
      checkoutFlow: 30,
    });

    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some((r) => r.toLowerCase().includes("cta"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T0405 — Stub fixes
// ---------------------------------------------------------------------------

describe("Stub fix: getUntranslatedResources", () => {
  it("returns non-empty array for Arabic locale", () => {
    const resources = getUntranslatedResources("test-shop.myshopify.com", "ar");
    expect(resources.length).toBeGreaterThan(0);
    expect(resources[0]).toHaveProperty("resourceType");
    expect(resources[0]).toHaveProperty("resourceId");
  });

  it("returns non-empty array for Hebrew locale", () => {
    const resources = getUntranslatedResources("test-shop.myshopify.com", "he");
    expect(resources.length).toBeGreaterThan(0);
  });

  it("includes products, pages, and collections", () => {
    const resources = getUntranslatedResources("test-shop.myshopify.com", "ar");
    const types = resources.map((r) => r.resourceType);
    expect(types).toContain("Product");
    expect(types).toContain("Page");
    expect(types).toContain("Collection");
  });
});

describe("Stub fix: translateSchemaFields", () => {
  it("sets inLanguage even when not originally present", () => {
    const schema = { "@type": "Product", name: "Test" };
    const result = translateSchemaFields(schema, "ar");
    expect(result.inLanguage).toBe("ar");
  });

  it("changes inLanguage from original value", () => {
    const schema = { "@type": "Product", name: "Test", inLanguage: "en" };
    const result = translateSchemaFields(schema, "he");
    expect(result.inLanguage).toBe("he");
    expect(result.inLanguage).not.toBe("en");
  });

  it("adds _translationMeta with targetLocale and sourceLocale", () => {
    const schema = { "@type": "Product", name: "Test", inLanguage: "en" };
    const result = translateSchemaFields(schema, "ar");
    const meta = result._translationMeta as Record<string, unknown>;
    expect(meta).toBeDefined();
    expect(meta.targetLocale).toBe("ar");
    expect(meta.sourceLocale).toBe("en");
    expect(meta.translatedAt).toBeDefined();
  });
});
