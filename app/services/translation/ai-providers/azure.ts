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

interface AzureOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

export class AzureTranslationProvider implements TranslationProvider {
  readonly name = "azure" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;

  constructor(options: AzureOptions = {}) {
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.fetchImpl = options.fetch ?? fetch;
    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.AZURE_MONTHLY_REQUEST_QUOTA, 50_000),
      parseNumericEnv(this.env.AZURE_MONTHLY_CHARACTER_QUOTA, 2_000_000),
      options.now ?? (() => new Date()),
    );
  }

  isConfigured(): boolean {
    return Boolean(this.env.AZURE_TRANSLATOR_KEY);
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
        "Azure Translator key is not configured",
        this.name,
      );
    }

    const region = this.env.AZURE_TRANSLATOR_REGION ?? "global";
    const endpoint = this.env.AZURE_TRANSLATOR_ENDPOINT ?? "https://api.cognitive.microsofttranslator.com";

    const url = new URL("/translate", endpoint);
    url.searchParams.set("api-version", "3.0");
    url.searchParams.set("from", normalizeLocale(input.sourceLocale));
    url.searchParams.set("to", normalizeLocale(input.targetLocale));
    if (input.format === "html") {
      url.searchParams.set("textType", "html");
    }

    const response = await this.fetchImpl(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": this.env.AZURE_TRANSLATOR_KEY!,
        "Ocp-Apim-Subscription-Region": region,
      },
      body: JSON.stringify([{ Text: input.text }]),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message ?? "Azure Translator request failed";
      throw new TranslationProviderError(message, this.name, response.status);
    }

    const translatedText = payload?.[0]?.translations?.[0]?.text;

    if (!translatedText) {
      throw new TranslationProviderError(
        "Azure Translator returned an empty translation",
        this.name,
        response.status,
      );
    }

    this.quotaTracker.record(countCharacters(input.text));
    const quota = this.getQuotaStatus();

    return {
      provider: this.name,
      translatedText,
      detectedSourceLocale:
        payload?.[0]?.detectedLanguage?.language ?? normalizeLocale(input.sourceLocale),
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
        region,
      },
    };
  }
}

export function createAzureProvider(options?: AzureOptions) {
  return new AzureTranslationProvider(options);
}
