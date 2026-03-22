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

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

interface OpenAIOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

export class OpenAITranslationProvider implements TranslationProvider {
  readonly name = "openai" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;
  private readonly rateLimiter: FixedWindowRateLimiter;

  constructor(options: OpenAIOptions = {}) {
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.fetchImpl = options.fetch ?? fetch;

    const now = options.now ?? (() => new Date());
    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.OPENAI_MONTHLY_REQUEST_QUOTA, 5000),
      parseNumericEnv(this.env.OPENAI_MONTHLY_CHARACTER_QUOTA, 1_000_000),
      now,
    );
    this.rateLimiter = new FixedWindowRateLimiter(
      parseNumericEnv(this.env.OPENAI_RATE_LIMIT_PER_MINUTE, 60) ?? 60,
      60_000,
      () => now().getTime(),
    );
  }

  isConfigured(): boolean {
    return Boolean(this.env.OPENAI_API_KEY);
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
        "OpenAI API key is not configured",
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

    const response = await this.fetchImpl("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
        temperature: 0.2,
        messages: buildMessages(input),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message ?? payload?.message ?? "OpenAI translation failed";

      throw new TranslationProviderError(message, this.name, response.status);
    }

    const translatedText = extractOpenAIText(payload);

    if (!translatedText) {
      throw new TranslationProviderError(
        "OpenAI returned an empty translation",
        this.name,
        response.status,
      );
    }

    this.quotaTracker.record(countCharacters(input.text));

    return {
      provider: this.name,
      translatedText,
      detectedSourceLocale: normalizeLocale(input.sourceLocale),
      usage: buildUsage(this.getQuotaStatus()),
      quota: this.getQuotaStatus(),
      metadata: {
        model: payload?.model ?? this.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
      },
    };
  }
}

function buildMessages(input: TranslationRequest) {
  const directives = [
    "You are a storefront translation engine.",
    `Translate from ${normalizeLocale(input.sourceLocale)} to ${normalizeLocale(input.targetLocale)}.`,
    "Return only the translation.",
    input.format === "html"
      ? "Preserve all HTML tags, attributes, and entity structure."
      : "Preserve line breaks and punctuation.",
  ];

  return [
    {
      role: "system",
      content: directives.join(" "),
    },
    {
      role: "user",
      content: [
        input.context ? `Context: ${input.context}` : null,
        `Text: ${input.text}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];
}

function extractOpenAIText(payload: any): string {
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}

function buildUsage(quota: ReturnType<OpenAITranslationProvider["getQuotaStatus"]>) {
  return {
    requests: quota.requests,
    characters: quota.characters,
    remainingRequests:
      quota.requestLimit === null ? null : Math.max(quota.requestLimit - quota.requests, 0),
    remainingCharacters:
      quota.characterLimit === null
        ? null
        : Math.max(quota.characterLimit - quota.characters, 0),
  };
}

export function createOpenAIProvider(options?: OpenAIOptions) {
  return new OpenAITranslationProvider(options);
}
