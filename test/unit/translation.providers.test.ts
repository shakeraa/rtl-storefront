import { describe, expect, it, vi } from "vitest";
import { createProviderRegistry } from "../../app/services/translation/ai-providers";
import { createDeepLProvider } from "../../app/services/translation/ai-providers/deepl";
import { createGoogleProvider } from "../../app/services/translation/ai-providers/google";
import { createOpenAIProvider } from "../../app/services/translation/ai-providers/openai";

describe("Translation providers", () => {
  it("translates with OpenAI and tracks quota usage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        model: "gpt-4.1-mini",
        choices: [
          {
            message: {
              content: "مرحبا",
            },
          },
        ],
      }),
    );

    const provider = createOpenAIProvider({
      env: {
        OPENAI_API_KEY: "test-key",
        OPENAI_MONTHLY_REQUEST_QUOTA: "5",
        OPENAI_MONTHLY_CHARACTER_QUOTA: "100",
      },
      fetch: fetchMock as typeof fetch,
    });

    const result = await provider.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "ar",
      context: "Product title",
    });

    expect(result.provider).toBe("openai");
    expect(result.translatedText).toBe("مرحبا");
    expect(result.quota.requests).toBe(1);
    expect(result.usage.remainingRequests).toBe(4);

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(requestInit?.body));

    expect(body.model).toBe("gpt-4.1-mini");
    expect(body.messages[1].content).toContain("Context: Product title");
  });

  it("rate limits OpenAI requests", async () => {
    const now = () => new Date("2026-03-22T00:00:00.000Z");
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        model: "gpt-4.1-mini",
        choices: [
          {
            message: {
              content: "Hallo",
            },
          },
        ],
      }),
    );

    const provider = createOpenAIProvider({
      env: {
        OPENAI_API_KEY: "test-key",
        OPENAI_RATE_LIMIT_PER_MINUTE: "1",
      },
      fetch: fetchMock as typeof fetch,
      now,
    });

    await provider.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "de",
    });

    await expect(
      provider.translate({
        text: "Hello again",
        sourceLocale: "en",
        targetLocale: "de",
      }),
    ).rejects.toMatchObject({
      provider: "openai",
      statusCode: 429,
      message: "Rate limit exceeded",
    });
  });

  it("returns DeepL provider errors cleanly", async () => {
    const provider = createDeepLProvider({
      env: {
        DEEPL_API_KEY: "deepl-key",
      },
      fetch: vi.fn().mockResolvedValue(
        jsonResponse(
          {
            message: "Quota exceeded",
          },
          456,
        ),
      ) as typeof fetch,
    });

    await expect(
      provider.translate({
        text: "Hello",
        sourceLocale: "en",
        targetLocale: "fr",
      }),
    ).rejects.toMatchObject({
      provider: "deepl",
      statusCode: 456,
      message: "Quota exceeded",
    });
  });

  it("translates with Google NMT", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        translations: [
          {
            translatedText: "שלום",
            detectedLanguageCode: "en",
          },
        ],
      }),
    );

    const provider = createGoogleProvider({
      env: {
        GOOGLE_TRANSLATE_ACCESS_TOKEN: "access-token",
        GOOGLE_CLOUD_PROJECT_ID: "rtl-project",
      },
      fetch: fetchMock as typeof fetch,
    });

    const result = await provider.translate({
      text: "Hello",
      sourceLocale: "en",
      targetLocale: "he",
      format: "html",
    });

    expect(result.provider).toBe("google");
    expect(result.translatedText).toBe("שלום");

    const [url, requestInit] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(requestInit?.body));

    expect(String(url)).toContain("/projects/rtl-project/locations/global:translateText");
    expect(body.mimeType).toBe("text/html");
    expect(body.model).toContain("/models/general/nmt");
  });

  it("selects providers smartly by language pair", () => {
    const registry = createProviderRegistry({
      env: {
        OPENAI_API_KEY: "openai-key",
        DEEPL_API_KEY: "deepl-key",
        GOOGLE_TRANSLATE_ACCESS_TOKEN: "google-token",
        GOOGLE_CLOUD_PROJECT_ID: "rtl-project",
      },
      fetch: vi.fn() as typeof fetch,
    });

    expect(registry.selectProviderChain("en", "ar")[0]?.name).toBe("openai");
    expect(registry.selectProviderChain("en", "de")[0]?.name).toBe("deepl");
  });
});

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
