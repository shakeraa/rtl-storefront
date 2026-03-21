import {
  countCharacters,
  MonthlyQuotaTracker,
  normalizeLocale,
  parseNumericEnv,
  TranslationProviderError,
} from "./shared";
import type {
  ProviderTranslationResult,
  TranslationProvider,
  TranslationRequest,
  TranslationServiceEnv,
} from "../types";

interface GoogleOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

export class GoogleTranslationProvider implements TranslationProvider {
  readonly name = "google" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;

  constructor(options: GoogleOptions = {}) {
    this.env = options.env ?? process.env;
    this.fetchImpl = options.fetch ?? fetch;
    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.GOOGLE_MONTHLY_REQUEST_QUOTA, 50_000),
      parseNumericEnv(this.env.GOOGLE_MONTHLY_CHARACTER_QUOTA, 5_000_000),
      options.now ?? (() => new Date()),
    );
  }

  isConfigured(): boolean {
    return Boolean(
      this.env.GOOGLE_TRANSLATE_ACCESS_TOKEN && this.env.GOOGLE_CLOUD_PROJECT_ID,
    );
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
        "Google Translate credentials are not configured",
        this.name,
      );
    }

    const projectId = this.env.GOOGLE_CLOUD_PROJECT_ID!;
    const location = this.env.GOOGLE_TRANSLATE_LOCATION ?? "global";
    const model = `projects/${projectId}/locations/${location}/models/general/nmt`;
    const endpoint = `https://translation.googleapis.com/v3/projects/${projectId}/locations/${location}:translateText`;

    const response = await this.fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.env.GOOGLE_TRANSLATE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        contents: [input.text],
        mimeType: input.format === "html" ? "text/html" : "text/plain",
        sourceLanguageCode: normalizeLocale(input.sourceLocale),
        targetLanguageCode: normalizeLocale(input.targetLocale),
        model,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message ?? payload?.message ?? "Google translation failed";

      throw new TranslationProviderError(message, this.name, response.status);
    }

    const translation = payload?.translations?.[0];

    if (!translation?.translatedText) {
      throw new TranslationProviderError(
        "Google returned an empty translation",
        this.name,
        response.status,
      );
    }

    this.quotaTracker.record(countCharacters(input.text));
    const quota = this.getQuotaStatus();

    return {
      provider: this.name,
      translatedText: translation.translatedText,
      detectedSourceLocale:
        translation.detectedLanguageCode ?? normalizeLocale(input.sourceLocale),
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
        model: translation.model ?? model,
      },
    };
  }
}

export function createGoogleProvider(options?: GoogleOptions) {
  return new GoogleTranslationProvider(options);
}
