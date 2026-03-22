import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  TranslationProvider,
  TranslationCacheStore,
  TranslationCacheEntry,
  ProviderTranslationResult,
  ProviderQuotaStatus,
} from "../../app/services/translation/types";

// Mock db.server before importing engine (engine imports prisma at module level)
vi.mock("../../app/db.server", () => ({
  default: {},
}));

import {
  TranslationEngine,
  TranslationEngineError,
  createTranslationEngine,
} from "../../app/services/translation/engine";
import {
  NeverTranslateProtector,
  createDefaultConfig,
  addBrandTerms,
} from "../../app/services/never-translate/index";
import { BiDiPreserver } from "../../app/services/bidi/index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQuotaStatus(
  name: "openai" | "deepl" | "google",
): ProviderQuotaStatus {
  return {
    provider: name,
    configured: true,
    requests: 0,
    requestLimit: null,
    characters: 0,
    characterLimit: null,
    alert: null,
  };
}

function makeFakeProvider(
  name: "openai" | "deepl" | "google",
  options?: {
    shouldFail?: boolean;
    translatedText?: string;
  },
): TranslationProvider {
  return {
    name,
    isConfigured: () => true,
    supportsLanguagePair: () => true,
    translate: vi.fn().mockImplementation(async (input) => {
      if (options?.shouldFail) {
        const { TranslationProviderError } = await import(
          "../../app/services/translation/ai-providers/shared"
        );
        throw new TranslationProviderError(name, `${name} failed`);
      }
      return {
        provider: name,
        translatedText: options?.translatedText ?? `[${name}] ${input.text}`,
        detectedSourceLocale: input.sourceLocale,
        usage: {
          requests: 1,
          characters: input.text.length,
          remainingRequests: null,
          remainingCharacters: null,
        },
        quota: makeQuotaStatus(name),
      } satisfies ProviderTranslationResult;
    }),
    getQuotaStatus: () => makeQuotaStatus(name),
  };
}

function makeInMemoryCache(): TranslationCacheStore {
  const store = new Map<string, TranslationCacheEntry>();
  return {
    async get(cacheKey) {
      return store.get(cacheKey) ?? null;
    },
    async set(entry) {
      store.set(entry.cacheKey, entry);
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Translation Flow - Integration", () => {
  describe("TranslationEngine instantiation", () => {
    it("can be instantiated with custom providers and cache", () => {
      const engine = new TranslationEngine({
        providers: [makeFakeProvider("openai")],
        cache: makeInMemoryCache(),
      });
      expect(engine).toBeInstanceOf(TranslationEngine);
    });

    it("can be created via factory function", () => {
      const engine = createTranslationEngine({
        providers: [makeFakeProvider("openai")],
        cache: makeInMemoryCache(),
      });
      expect(engine).toBeInstanceOf(TranslationEngine);
    });
  });

  describe("Cache hit / miss flow", () => {
    let engine: TranslationEngine;
    let cache: TranslationCacheStore;

    beforeEach(() => {
      cache = makeInMemoryCache();
      engine = new TranslationEngine({
        providers: [makeFakeProvider("openai")],
        cache,
      });
    });

    it("returns cached:false on first translation (cache miss)", async () => {
      const result = await engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      });
      expect(result.cached).toBe(false);
      expect(result.translatedText).toContain("Hello");
    });

    it("returns cached:true on second identical translation (cache hit)", async () => {
      await engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      });

      const result = await engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      });
      expect(result.cached).toBe(true);
    });

    it("bypasses cache when bypassCache is true", async () => {
      await engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      });

      const result = await engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
        bypassCache: true,
      });
      expect(result.cached).toBe(false);
    });

    it("returns identical text without calling providers when source === target", async () => {
      const result = await engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "en",
      });
      expect(result.translatedText).toBe("Hello");
      expect(result.cached).toBe(false);
    });
  });

  describe("Provider fallback chain", () => {
    it("falls back to second provider when first fails", async () => {
      const engine = new TranslationEngine({
        providers: [
          makeFakeProvider("openai", { shouldFail: true }),
          makeFakeProvider("deepl"),
        ],
        cache: makeInMemoryCache(),
      });

      const result = await engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      });

      expect(result.provider).toBe("deepl");
      expect(result.fallbackUsed).toBe(true);
    });

    it("throws TranslationEngineError when all providers fail", async () => {
      const engine = new TranslationEngine({
        providers: [
          makeFakeProvider("openai", { shouldFail: true }),
          makeFakeProvider("deepl", { shouldFail: true }),
        ],
        cache: makeInMemoryCache(),
      });

      await expect(
        engine.translate({
          text: "Hello",
          sourceLocale: "en",
          targetLocale: "ar",
        }),
      ).rejects.toThrow(TranslationEngineError);
    });

    it("throws when no providers are available", async () => {
      const engine = new TranslationEngine({
        providers: [],
        cache: makeInMemoryCache(),
      });

      await expect(
        engine.translate({
          text: "Hello",
          sourceLocale: "en",
          targetLocale: "ar",
        }),
      ).rejects.toThrow("No translation providers are configured");
    });

    it("throws on empty text input", async () => {
      const engine = new TranslationEngine({
        providers: [makeFakeProvider("openai")],
        cache: makeInMemoryCache(),
      });

      await expect(
        engine.translate({
          text: "  ",
          sourceLocale: "en",
          targetLocale: "ar",
        }),
      ).rejects.toThrow("Text is required");
    });
  });

  describe("BiDi preservation end-to-end", () => {
    const preserver = new BiDiPreserver();

    it("preserves emails inside RTL text", () => {
      const input = "contact user@example.com for details";
      const result = preserver.preserve(input, "ar");
      // The email should be wrapped in LRI...PDI isolates
      expect(result).toContain("user@example.com");
      expect(result.length).toBeGreaterThan(input.length);
    });

    it("preserves URLs inside RTL text", () => {
      const input = "visit https://shop.com/page today";
      const result = preserver.preserve(input, "ar");
      expect(result).toContain("https://shop.com/page");
      expect(result.length).toBeGreaterThan(input.length);
    });

    it("preserves brand names inside RTL text", () => {
      const rtlText = "\u0645\u0631\u062d\u0628\u0627 Shopify \u0647\u0646\u0627";
      const result = preserver.preserve(rtlText, "ar", {
        neverTranslateTerms: ["Shopify"],
      });
      expect(result).toContain("Shopify");
    });

    it("returns unchanged text for pure-LTR content in LTR locale", () => {
      const input = "Hello World";
      const result = preserver.preserve(input, "en");
      // No numbers, no emails, no URLs, no brand names, no mixed content
      expect(result).toBe(input);
    });

    it("detects mixed bidirectional content", () => {
      const analysis = preserver.detectMixedContent(
        "\u0645\u0631\u062d\u0628\u0627 Hello",
      );
      expect(analysis.isMixed).toBe(true);
      expect(analysis.hasRTL).toBe(true);
      expect(analysis.hasLTR).toBe(true);
    });
  });

  describe("NeverTranslateProtector round-trip", () => {
    it("protects and restores brand terms correctly", () => {
      const config = addBrandTerms(createDefaultConfig(), [
        "Shopify",
        "Nike",
      ]);
      const protector = new NeverTranslateProtector(config);

      const original = "Buy Nike shoes on Shopify store";
      const { protectedText, placeholders } = protector.protect(original);

      // Placeholders should replace brand names
      expect(protectedText).not.toContain("Shopify");
      expect(protectedText).not.toContain("Nike");
      expect(placeholders.size).toBeGreaterThanOrEqual(2);

      // Restoring should bring back originals
      const restored = protector.restore(protectedText, placeholders);
      expect(restored).toBe(original);
    });

    it("protects emails and URLs", () => {
      const config = createDefaultConfig();
      const protector = new NeverTranslateProtector(config);

      const original =
        "Contact support@example.com or visit https://help.shopify.com";
      const { protectedText, placeholders } = protector.protect(original);

      expect(protectedText).not.toContain("support@example.com");
      expect(protectedText).not.toContain("https://help.shopify.com");

      const restored = protector.restore(protectedText, placeholders);
      expect(restored).toBe(original);
    });

    it("protects ALL_CAPS terms when configured", () => {
      const config = createDefaultConfig(); // preserveAllCaps defaults to true
      const protector = new NeverTranslateProtector(config);

      const original = "The SKU is ABC and the brand is XYZ";
      const { protectedText, placeholders } = protector.protect(original);

      expect(protectedText).not.toContain("ABC");
      expect(protectedText).not.toContain("XYZ");

      const restored = protector.restore(protectedText, placeholders);
      expect(restored).toBe(original);
    });

    it("handles empty text gracefully", () => {
      const protector = new NeverTranslateProtector(createDefaultConfig());
      const { protectedText, placeholders } = protector.protect("");
      expect(protectedText).toBe("");
      expect(placeholders.size).toBe(0);
    });
  });
});
