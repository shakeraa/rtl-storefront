export type TranslationProviderName = "openai" | "deepl" | "google";

export interface TranslationRequest {
  text: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
  format?: "text" | "html";
}

export interface ProviderUsage {
  requests: number;
  characters: number;
  remainingRequests: number | null;
  remainingCharacters: number | null;
}

export interface QuotaAlert {
  level: "warning" | "critical";
  message: string;
}

export interface ProviderQuotaStatus {
  provider: TranslationProviderName;
  configured: boolean;
  requests: number;
  requestLimit: number | null;
  characters: number;
  characterLimit: number | null;
  alert: QuotaAlert | null;
}

export interface ProviderTranslationResult {
  provider: TranslationProviderName;
  translatedText: string;
  detectedSourceLocale?: string;
  usage: ProviderUsage;
  quota: ProviderQuotaStatus;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface TranslationResult extends ProviderTranslationResult {
  cached: boolean;
  fallbackUsed: boolean;
}

export interface TranslationProvider {
  readonly name: TranslationProviderName;
  isConfigured(): boolean;
  supportsLanguagePair(sourceLocale: string, targetLocale: string): boolean;
  translate(input: TranslationRequest): Promise<ProviderTranslationResult>;
  getQuotaStatus(): ProviderQuotaStatus;
}

export interface TranslationCacheEntry {
  cacheKey: string;
  provider: TranslationProviderName;
  sourceLocale: string;
  targetLocale: string;
  sourceText: string;
  translatedText: string;
  context?: string;
  expiresAt: Date;
}

export interface TranslationCacheStore {
  get(cacheKey: string): Promise<TranslationCacheEntry | null>;
  set(entry: TranslationCacheEntry): Promise<void>;
}

export interface TranslationEngineInput extends TranslationRequest {
  preferredProvider?: TranslationProviderName;
  bypassCache?: boolean;
}

export interface TranslationServiceEnv {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OPENAI_RATE_LIMIT_PER_MINUTE?: string;
  OPENAI_MONTHLY_REQUEST_QUOTA?: string;
  OPENAI_MONTHLY_CHARACTER_QUOTA?: string;
  DEEPL_API_KEY?: string;
  DEEPL_API_URL?: string;
  DEEPL_MONTHLY_REQUEST_QUOTA?: string;
  DEEPL_MONTHLY_CHARACTER_QUOTA?: string;
  GOOGLE_TRANSLATE_ACCESS_TOKEN?: string;
  GOOGLE_CLOUD_PROJECT_ID?: string;
  GOOGLE_TRANSLATE_LOCATION?: string;
  GOOGLE_MONTHLY_REQUEST_QUOTA?: string;
  GOOGLE_MONTHLY_CHARACTER_QUOTA?: string;
  TRANSLATION_CACHE_TTL_HOURS?: string;
}
