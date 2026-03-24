import { describe, expect, it, vi } from "vitest";
import { TranslationEngine } from "../../app/services/translation/engine";
import { TranslationProviderError } from "../../app/services/translation/ai-providers/shared";
import type {
  ProviderQuotaStatus,
  ProviderTranslationResult,
  TranslationCacheEntry,
  TranslationCacheStore,
  TranslationProvider,
  TranslationProviderName,
} from "../../app/services/translation/types";
import type { TranslationEngineError } from "../../app/services/translation/engine";

describe("Translation engine", () => {
  it("falls back to the next provider and caches the result", async () => {
    const cache = createMemoryCache();
    const openai = createMockProvider({
      name: "openai",
      translate: vi.fn().mockRejectedValue(
        new TranslationProviderError("OpenAI unavailable", "openai", 400),
      ),
    });
    const google = createMockProvider({
      name: "google",
      translate: vi.fn().mockResolvedValue(
        createProviderResult("google", "مرحبا"),
      ),
    });

    const engine = new TranslationEngine({
      providers: [openai, google],
      cache,
      env: {
        TRANSLATION_CACHE_TTL_HOURS: "1",
      },
    });

    const input = {
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "ar",
    };

    const firstResult = await engine.translate(input);

    expect(firstResult.provider).toBe("google");
    expect(firstResult.fallbackUsed).toBe(true);
    expect(firstResult.cached).toBe(false);
    expect(openai.translate).toHaveBeenCalledTimes(1);
    expect(google.translate).toHaveBeenCalledTimes(1);

    const secondResult = await engine.translate(input);

    expect(secondResult.cached).toBe(true);
    expect(secondResult.translatedText).toBe("مرحبا");
    expect(openai.translate).toHaveBeenCalledTimes(1);
    expect(google.translate).toHaveBeenCalledTimes(1);
  });

  it("respects an explicit preferred provider", async () => {
    const openai = createMockProvider({
      name: "openai",
      translate: vi.fn().mockResolvedValue(
        createProviderResult("openai", "Hallo"),
      ),
    });
    const deepl = createMockProvider({
      name: "deepl",
      translate: vi.fn().mockResolvedValue(
        createProviderResult("deepl", "Hallo von DeepL"),
      ),
    });

    const engine = new TranslationEngine({
      providers: [openai, deepl],
      cache: createMemoryCache(),
    });

    const result = await engine.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "de",
      preferredProvider: "openai",
    });

    expect(result.provider).toBe("openai");
    expect(openai.translate).toHaveBeenCalledTimes(1);
    expect(deepl.translate).not.toHaveBeenCalled();
  });

  it("throws a combined engine error when every provider fails", async () => {
    const openai = createMockProvider({
      name: "openai",
      translate: vi.fn().mockRejectedValue(
        new TranslationProviderError("OpenAI unavailable", "openai", 400),
      ),
    });
    const google = createMockProvider({
      name: "google",
      translate: vi.fn().mockRejectedValue(
        new TranslationProviderError("Google quota exhausted", "google", 401),
      ),
    });

    const engine = new TranslationEngine({
      providers: [openai, google],
      cache: createMemoryCache(),
    });

    await expect(
      engine.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "ar",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<TranslationEngineError>>({
        name: "TranslationEngineError",
        attempts: [
          {
            provider: "openai",
            message: "OpenAI unavailable",
          },
          {
            provider: "google",
            message: "Google quota exhausted",
          },
        ],
      }),
    );
  });
});

function createMemoryCache(): TranslationCacheStore {
  const entries = new Map<string, TranslationCacheEntry>();

  return {
    async get(cacheKey) {
      return entries.get(cacheKey) ?? null;
    },
    async set(entry) {
      entries.set(entry.cacheKey, entry);
    },
  };
}

function createMockProvider({
  name,
  translate,
}: {
  name: TranslationProviderName;
  translate: TranslationProvider["translate"];
}): TranslationProvider & { translate: ReturnType<typeof vi.fn> } {
  return {
    name,
    isConfigured: () => true,
    supportsLanguagePair: () => true,
    translate,
    getQuotaStatus: () => createQuotaStatus(name),
  };
}

function createProviderResult(
  provider: TranslationProviderName,
  translatedText: string,
): ProviderTranslationResult {
  return {
    provider,
    translatedText,
    detectedSourceLocale: "en",
    usage: {
      requests: 1,
      characters: 5,
      remainingRequests: 99,
      remainingCharacters: 995,
    },
    quota: createQuotaStatus(provider),
  };
}

function createQuotaStatus(provider: TranslationProviderName): ProviderQuotaStatus {
  return {
    provider,
    configured: true,
    requests: 1,
    requestLimit: 100,
    characters: 5,
    characterLimit: 1000,
    alert: null,
  };
}
