import {
  countCharacters,
  MonthlyQuotaTracker,
  getBaseLocale,
  parseNumericEnv,
  TranslationProviderError,
} from "./shared";
import type {
  ProviderTranslationResult,
  TranslationProvider,
  TranslationRequest,
  TranslationServiceEnv,
} from "../types";

const DEFAULT_LIBRETRANSLATE_URL = "https://libretranslate.com";

interface LibreTranslateOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

/**
 * LibreTranslate provider — works with self-hosted or public instances.
 * API key is optional for self-hosted instances without auth.
 */
export class LibreTranslateProvider implements TranslationProvider {
  readonly name = "libre" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;

  constructor(options: LibreTranslateOptions = {}) {
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.fetchImpl = options.fetch ?? fetch;
    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.LIBRE_MONTHLY_REQUEST_QUOTA, 100_000),
      parseNumericEnv(this.env.LIBRE_MONTHLY_CHARACTER_QUOTA, 10_000_000),
      options.now ?? (() => new Date()),
    );
  }

  isConfigured(): boolean {
    return Boolean(this.env.LIBRETRANSLATE_URL);
  }

  supportsLanguagePair(): boolean {
    return this.isConfigured();
  }

  getQuotaStatus() {
    return this.quotaTracker.snapshot(this.isConfigured());
  }

  async translate(input: TranslationRequest): Promise<ProviderTranslationResult> {
    if (!this.isConfigured()) {
      throw new TranslationProviderError(
        "LibreTranslate URL is not configured",
        this.name,
      );
    }

    const baseUrl = this.env.LIBRETRANSLATE_URL ?? DEFAULT_LIBRETRANSLATE_URL;
    const url = `${baseUrl.replace(/\/$/, "")}/translate`;

    const body: Record<string, string> = {
      q: input.text,
      source: getBaseLocale(input.sourceLocale),
      target: getBaseLocale(input.targetLocale),
      format: input.format === "html" ? "html" : "text",
    };

    if (this.env.LIBRETRANSLATE_API_KEY) {
      body.api_key = this.env.LIBRETRANSLATE_API_KEY;
    }

    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error ?? "LibreTranslate request failed";
      throw new TranslationProviderError(message, this.name, response.status);
    }

    const translatedText = payload?.translatedText;

    if (!translatedText) {
      throw new TranslationProviderError(
        "LibreTranslate returned an empty translation",
        this.name,
        response.status,
      );
    }

    this.quotaTracker.record(countCharacters(input.text));
    const quota = this.getQuotaStatus();

    return {
      provider: this.name,
      translatedText,
      detectedSourceLocale: payload?.detectedLanguage?.language ?? getBaseLocale(input.sourceLocale),
      usage: {
        requests: quota.requests,
        characters: quota.characters,
        remainingRequests:
          quota.requestLimit === null ? null : Math.max(quota.requestLimit - quota.requests, 0),
        remainingCharacters:
          quota.characterLimit === null
            ? null
            : Math.max(quota.characterLimit - quota.characters, 0),
      },
      quota,
      metadata: {
        instance: baseUrl,
      },
    };
  }
}

export function createLibreTranslateProvider(options?: LibreTranslateOptions) {
  return new LibreTranslateProvider(options);
}
