import {
  countCharacters,
  FixedWindowRateLimiter,
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

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

interface AnthropicOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

export class AnthropicTranslationProvider implements TranslationProvider {
  readonly name = "anthropic" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;
  private readonly rateLimiter: FixedWindowRateLimiter;

  constructor(options: AnthropicOptions = {}) {
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.fetchImpl = options.fetch ?? fetch;

    const now = options.now ?? (() => new Date());
    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.ANTHROPIC_MONTHLY_REQUEST_QUOTA, 5000),
      parseNumericEnv(this.env.ANTHROPIC_MONTHLY_CHARACTER_QUOTA, 1_000_000),
      now,
    );
    this.rateLimiter = new FixedWindowRateLimiter(
      parseNumericEnv(this.env.ANTHROPIC_RATE_LIMIT_PER_MINUTE, 50) ?? 50,
      60_000,
      () => now().getTime(),
    );
  }

  isConfigured(): boolean {
    return Boolean(this.env.ANTHROPIC_API_KEY);
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
        "Anthropic API key is not configured",
        this.name,
      );
    }

    try {
      this.rateLimiter.consume();
    } catch (error) {
      throw new TranslationProviderError(
        error instanceof Error ? error.message : "Rate limit exceeded",
        this.name,
        429,
      );
    }

    const model = this.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;

    const response = await this.fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: buildSystemPrompt(input),
        messages: [
          {
            role: "user",
            content: buildUserPrompt(input),
          },
        ],
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message ?? "Anthropic translation failed";
      throw new TranslationProviderError(message, this.name, response.status);
    }

    const translatedText = extractText(payload);

    if (!translatedText) {
      throw new TranslationProviderError(
        "Anthropic returned an empty translation",
        this.name,
        response.status,
      );
    }

    this.quotaTracker.record(countCharacters(input.text));
    const quota = this.getQuotaStatus();

    return {
      provider: this.name,
      translatedText,
      detectedSourceLocale: normalizeLocale(input.sourceLocale),
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
        model: payload?.model ?? model,
      },
    };
  }
}

function buildSystemPrompt(input: TranslationRequest): string {
  const directives = [
    "You are a storefront translation engine specializing in accurate, culturally appropriate translations.",
    `Translate from ${normalizeLocale(input.sourceLocale)} to ${normalizeLocale(input.targetLocale)}.`,
    "Return only the translation with no explanation, preamble, or commentary.",
    input.format === "html"
      ? "Preserve all HTML tags, attributes, and entity structure exactly."
      : "Preserve line breaks and punctuation.",
    "For RTL languages, ensure proper grammar, diacritics, and natural phrasing.",
  ];
  return directives.join(" ");
}

function buildUserPrompt(input: TranslationRequest): string {
  return [
    input.context ? `Context: ${input.context}` : null,
    `Text: ${input.text}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function extractText(payload: any): string {
  const content = payload?.content;
  if (Array.isArray(content)) {
    return content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("")
      .trim();
  }
  return "";
}

export function createAnthropicProvider(options?: AnthropicOptions) {
  return new AnthropicTranslationProvider(options);
}
