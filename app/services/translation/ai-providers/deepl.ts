import {
  countCharacters,
  getBaseLocale,
  MonthlyQuotaTracker,
  parseNumericEnv,
  toDeepLCode,
  TranslationProviderError,
} from "./shared";
import type {
  ProviderTranslationResult,
  TranslationProvider,
  TranslationRequest,
  TranslationServiceEnv,
} from "../types";

const DEEPL_SUPPORTED_LANGUAGES = new Set([
  "AR",
  "BG",
  "CS",
  "DA",
  "DE",
  "EL",
  "EN",
  "EN-GB",
  "EN-US",
  "ES",
  "ET",
  "FI",
  "FR",
  "HE",
  "HU",
  "ID",
  "IT",
  "JA",
  "KO",
  "LT",
  "LV",
  "NB",
  "NL",
  "PL",
  "PT",
  "PT-BR",
  "PT-PT",
  "RO",
  "RU",
  "SK",
  "SL",
  "SV",
  "TR",
  "UK",
  "ZH",
]);

interface DeepLOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

export class DeepLTranslationProvider implements TranslationProvider {
  readonly name = "deepl" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;

  constructor(options: DeepLOptions = {}) {
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.fetchImpl = options.fetch ?? fetch;

    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.DEEPL_MONTHLY_REQUEST_QUOTA, 20_000),
      parseNumericEnv(this.env.DEEPL_MONTHLY_CHARACTER_QUOTA, 2_000_000),
      options.now ?? (() => new Date()),
    );
  }

  isConfigured(): boolean {
    return Boolean(this.env.DEEPL_API_KEY);
  }

  supportsLanguagePair(sourceLocale: string, targetLocale: string): boolean {
    if (!this.isConfigured()) {
      return false;
    }

    const source = toDeepLCode(sourceLocale);
    const target = toDeepLCode(targetLocale);

    return matchesDeepLCode(source) && matchesDeepLCode(target);
  }

  getQuotaStatus() {
    return this.quotaTracker.snapshot(this.isConfigured());
  }

  async translate(input: TranslationRequest): Promise<ProviderTranslationResult> {
    if (!this.isConfigured()) {
      throw new TranslationProviderError(
        "DeepL API key is not configured",
        this.name,
      );
    }

    const response = await this.fetchImpl(
      this.env.DEEPL_API_URL ?? "https://api.deepl.com/v2/translate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `DeepL-Auth-Key ${this.env.DEEPL_API_KEY}`,
        },
        body: JSON.stringify({
          text: [input.text],
          source_lang: toDeepLCode(input.sourceLocale),
          target_lang: toDeepLCode(input.targetLocale),
          context: input.context,
          tag_handling: input.format === "html" ? "html" : undefined,
        }),
      },
    );

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.message ?? payload?.detail ?? "DeepL translation failed";

      throw new TranslationProviderError(message, this.name, response.status);
    }

    const translation = payload?.translations?.[0];

    if (!translation?.text) {
      throw new TranslationProviderError(
        "DeepL returned an empty translation",
        this.name,
        response.status,
      );
    }

    this.quotaTracker.record(countCharacters(input.text));
    const quota = this.getQuotaStatus();

    return {
      provider: this.name,
      translatedText: translation.text,
      detectedSourceLocale: translation.detected_source_language
        ? getBaseLocale(translation.detected_source_language)
        : getBaseLocale(input.sourceLocale),
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
        billedCharacters: countCharacters(input.text),
      },
    };
  }
}

function matchesDeepLCode(locale: string): boolean {
  return (
    DEEPL_SUPPORTED_LANGUAGES.has(locale) ||
    DEEPL_SUPPORTED_LANGUAGES.has(locale.split("-")[0])
  );
}

export function createDeepLProvider(options?: DeepLOptions) {
  return new DeepLTranslationProvider(options);
}
