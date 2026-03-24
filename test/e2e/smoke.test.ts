import { describe, it, expect, vi } from "vitest";

// Mock db.server globally since many services import it at module level
vi.mock("../../app/db.server", () => ({
  default: {
    translationCache: {},
    billingPlan: {},
    shopSubscription: {},
    shopUsage: {},
  },
}));

describe("Smoke Test - Service Imports", () => {
  it("imports translation engine", async () => {
    const mod = await import("../../app/services/translation/engine");
    expect(mod.TranslationEngine).toBeDefined();
    expect(mod.createTranslationEngine).toBeDefined();
    expect(mod.TranslationEngineError).toBeDefined();
    expect(typeof mod.createTranslationEngine).toBe("function");
  });

  it("imports translation types", async () => {
    const mod = await import("../../app/services/translation/types");
    // types module primarily exports TypeScript types, but should import cleanly
    expect(mod).toBeDefined();
  });

  it("imports AI provider registry", async () => {
    const mod = await import(
      "../../app/services/translation/ai-providers/index"
    );
    expect(mod.createProviderRegistry).toBeDefined();
    expect(mod.sortProvidersForLanguagePair).toBeDefined();
  });

  it("imports AI provider shared utilities", async () => {
    const mod = await import(
      "../../app/services/translation/ai-providers/shared"
    );
    expect(mod.normalizeLocale).toBeDefined();
    expect(mod.TranslationProviderError).toBeDefined();
  });

  it("imports BiDi preserver", async () => {
    const mod = await import("../../app/services/bidi/index");
    expect(mod.BiDiPreserver).toBeDefined();
    expect(mod.bidiPreserver).toBeDefined();
    expect(mod.BIDI_MARKS).toBeDefined();
  });

  it("imports billing service", async () => {
    const mod = await import("../../app/services/billing/index");
    expect(mod.formatPriceForShopify).toBeDefined();
    expect(mod.getTrialDaysRemaining).toBeDefined();
    expect(mod.isTrialExpired).toBeDefined();
    expect(mod.isGated).toBeDefined();
    expect(mod.isAdmin).toBeDefined();
  });

  it("imports billing types", async () => {
    const mod = await import("../../app/services/billing/types");
    expect(mod.DEFAULT_TRIAL_DAYS).toBe(14);
    expect(mod.SHOPIFY_SUBSCRIPTION_STATUS_MAP).toBeDefined();
  });

  it("imports coverage service", async () => {
    const mod = await import("../../app/services/coverage/index");
    expect(mod.calculateCoverage).toBeDefined();
    expect(mod.getCoverageLevel).toBeDefined();
    expect(mod.getCoverageColor).toBeDefined();
    expect(mod.buildCoverageData).toBeDefined();
    expect(mod.sortByPriority).toBeDefined();
    expect(mod.isGoalMet).toBeDefined();
  });

  it("imports RTL CSS generator", async () => {
    const mod = await import("../../app/services/rtl/css-generator");
    expect(mod.generateRTLCSS).toBeDefined();
    expect(mod.generateRuleBlock).toBeDefined();
    expect(mod.generateMixedDirectionCSS).toBeDefined();
  });

  it("imports RTL component mapper", async () => {
    const mod = await import("../../app/services/rtl/component-mapper");
    expect(mod).toBeDefined();
  });

  it("imports RTL utils", async () => {
    const mod = await import("../../app/utils/rtl");
    expect(mod.isRTLLanguage).toBeDefined();
    expect(mod.getTextDirection).toBeDefined();
    expect(mod.normalizeLocale).toBeDefined();
    expect(mod.flipCSSProperty).toBeDefined();
    expect(mod.wrapBiDi).toBeDefined();
  });

  it("imports currency service", async () => {
    const mod = await import("../../app/services/currency/index");
    expect(mod).toBeDefined();
  });

  it("imports language switcher service", async () => {
    const mod = await import("../../app/services/language-switcher/index");
    expect(mod).toBeDefined();
  });

  it("imports cache service", async () => {
    const mod = await import("../../app/services/cache/memory-store");
    expect(mod.MemoryCacheStore).toBeDefined();
  });

  it("imports onboarding service", async () => {
    const mod = await import("../../app/services/onboarding/index");
    expect(mod).toBeDefined();
  });

  it("imports fonts service", async () => {
    const mod = await import("../../app/services/fonts/index");
    expect(mod).toBeDefined();
  });

  it("imports cultural AI service", async () => {
    const mod = await import("../../app/services/cultural-ai/index");
    expect(mod).toBeDefined();
  });
});

describe("Smoke Test - Key Functions Are Callable", () => {
  it("isRTLLanguage returns boolean", async () => {
    const { isRTLLanguage } = await import("../../app/utils/rtl");
    expect(isRTLLanguage("ar")).toBe(true);
    expect(isRTLLanguage("en")).toBe(false);
    expect(isRTLLanguage("he")).toBe(true);
  });

  it("calculateCoverage returns a number", async () => {
    const { calculateCoverage } = await import(
      "../../app/services/coverage/index"
    );
    const result = calculateCoverage(100, 50);
    expect(typeof result).toBe("number");
    expect(result).toBe(50);
  });

  it("formatPriceForShopify returns a string", async () => {
    const { formatPriceForShopify } = await import(
      "../../app/services/billing/index"
    );
    const result = formatPriceForShopify(999);
    expect(typeof result).toBe("string");
    expect(result).toBe("9.99");
  });

  it("BiDiPreserver can be instantiated and called", async () => {
    const { BiDiPreserver } = await import("../../app/services/bidi/index");
    const preserver = new BiDiPreserver();
    const result = preserver.preserve("test", "en");
    expect(typeof result).toBe("string");
  });

  it("generateRTLCSS returns a CSS string", async () => {
    const { generateRTLCSS } = await import(
      "../../app/services/rtl/css-generator"
    );
    const css = generateRTLCSS();
    expect(typeof css).toBe("string");
    expect(css.length).toBeGreaterThan(0);
  });

  it("normalizeLocale handles common locales", async () => {
    const { normalizeLocale } = await import("../../app/utils/rtl");
    expect(normalizeLocale("en-US")).toBeDefined();
    expect(normalizeLocale("ar")).toBeDefined();
  });
});

describe("Smoke Test - No Circular Dependencies", () => {
  it("can import all core services in sequence without hanging", async () => {
    // If there were a circular dependency, one of these dynamic imports
    // would hang or throw a RangeError (maximum call stack exceeded).
    const modules = await Promise.all([
      import("../../app/services/translation/engine"),
      import("../../app/services/bidi/index"),
      import("../../app/services/billing/index"),
      import("../../app/services/coverage/index"),
      import("../../app/services/rtl/css-generator"),
      import("../../app/services/currency/index"),
      import("../../app/services/language-switcher/index"),
      import("../../app/services/onboarding/index"),
      import("../../app/services/fonts/index"),
    ]);

    // Every module should have resolved to a non-null object
    for (const mod of modules) {
      expect(mod).toBeDefined();
      expect(typeof mod).toBe("object");
    }
  });
});
