import type {
  ProviderQuotaStatus,
  QuotaAlert,
  TranslationProviderName,
} from "../types";

export class TranslationProviderError extends Error {
  constructor(
    message: string,
    readonly provider: TranslationProviderName,
    readonly statusCode?: number,
  ) {
    super(message);
    this.name = "TranslationProviderError";
  }
}

export function normalizeLocale(locale: string): string {
  return locale.trim().replace(/_/g, "-");
}

export function getBaseLocale(locale: string): string {
  return normalizeLocale(locale).split("-")[0].toLowerCase();
}

export function toDeepLCode(locale: string): string {
  return normalizeLocale(locale).toUpperCase();
}

export function parseNumericEnv(
  value: string | undefined,
  fallback: number | null,
): number | null {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function countCharacters(text: string): number {
  return [...text].length;
}

export class FixedWindowRateLimiter {
  private readonly timestamps: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  constructor(
    limit: number,
    windowMs: number,
    now: () => number = Date.now,
  ) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  consume(): void {
    const cutoff = this.now() - this.windowMs;

    while (this.timestamps.length > 0 && this.timestamps[0] < cutoff) {
      this.timestamps.shift();
    }

    if (this.timestamps.length >= this.limit) {
      throw new Error("Rate limit exceeded");
    }

    this.timestamps.push(this.now());
  }
}

export class MonthlyQuotaTracker {
  private periodKey = "";
  private requests = 0;
  private characters = 0;
  private readonly provider: TranslationProviderName;
  private readonly requestLimit: number | null;
  private readonly characterLimit: number | null;
  private readonly now: () => Date;

  constructor(
    provider: TranslationProviderName,
    requestLimit: number | null,
    characterLimit: number | null,
    now: () => Date = () => new Date(),
  ) {
    this.provider = provider;
    this.requestLimit = requestLimit;
    this.characterLimit = characterLimit;
    this.now = now;
  }

  record(characters: number): void {
    this.resetIfNeeded();
    this.requests += 1;
    this.characters += characters;
  }

  snapshot(configured: boolean): ProviderQuotaStatus {
    this.resetIfNeeded();

    return {
      provider: this.provider,
      configured,
      requests: this.requests,
      requestLimit: this.requestLimit,
      characters: this.characters,
      characterLimit: this.characterLimit,
      alert: buildQuotaAlert(
        this.provider,
        this.requests,
        this.requestLimit,
        this.characters,
        this.characterLimit,
      ),
    };
  }

  private resetIfNeeded(): void {
    const now = this.now();
    const nextKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    if (nextKey === this.periodKey) {
      return;
    }

    this.periodKey = nextKey;
    this.requests = 0;
    this.characters = 0;
  }
}

function buildQuotaAlert(
  provider: TranslationProviderName,
  requests: number,
  requestLimit: number | null,
  characters: number,
  characterLimit: number | null,
): QuotaAlert | null {
  const ratios = [
    requestLimit ? requests / requestLimit : 0,
    characterLimit ? characters / characterLimit : 0,
  ];
  const highest = Math.max(...ratios);

  if (highest >= 1) {
    return {
      level: "critical",
      message: `${provider} quota exhausted`,
    };
  }

  if (highest >= 0.8) {
    return {
      level: "warning",
      message: `${provider} quota above 80%`,
    };
  }

  return null;
}
