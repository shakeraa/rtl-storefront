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

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Get a valid access token, refreshing if expired.
 * Supports three modes (in priority order):
 * 1. Per-shop token (from DB settings) — passed explicitly
 * 2. Service account JSON key (GOOGLE_SERVICE_ACCOUNT_KEY env var) — auto-refreshes
 * 3. Static access token (GOOGLE_TRANSLATE_ACCESS_TOKEN env var) — legacy, will expire
 */
async function getAccessToken(
  env: TranslationServiceEnv,
  shopToken?: string,
): Promise<string> {
  // Per-shop token takes precedence (from DB settings)
  if (shopToken) return shopToken;

  // If we have a cached token that's still valid (with 5-min buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 300000) {
    return tokenCache.accessToken;
  }

  // Try service account key first
  const serviceAccountKey = env.GOOGLE_SERVICE_ACCOUNT_KEY ?? process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const key = JSON.parse(serviceAccountKey);
      const token = await fetchServiceAccountToken(key);
      tokenCache = {
        accessToken: token.access_token,
        expiresAt: Date.now() + (token.expires_in * 1000),
      };
      return tokenCache.accessToken;
    } catch (error) {
      console.error("Google service account token refresh failed:", error);
    }
  }

  // Fallback to static token
  const staticToken = env.GOOGLE_TRANSLATE_ACCESS_TOKEN;
  if (staticToken) {
    return staticToken;
  }

  throw new Error(
    "No Google Translate credentials configured. Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_TRANSLATE_ACCESS_TOKEN.",
  );
}

/**
 * Fetch an access token using a Google service account key.
 * Implements the JWT-based OAuth2 flow without external dependencies.
 */
async function fetchServiceAccountToken(key: {
  client_email: string;
  private_key: string;
  token_uri: string;
}): Promise<{ access_token: string; expires_in: number }> {
  const crypto = await import("crypto");

  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" }),
  ).toString("base64url");

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/cloud-translation",
      aud: key.token_uri || "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");

  const signInput = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = sign.sign(key.private_key, "base64url");

  const jwt = `${signInput}.${signature}`;

  const response = await fetch(
    key.token_uri || "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token request failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export class GoogleTranslationProvider implements TranslationProvider {
  readonly name = "google" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;

  constructor(options: GoogleOptions = {}) {
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.fetchImpl = options.fetch ?? fetch;
    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.GOOGLE_MONTHLY_REQUEST_QUOTA, 50_000),
      parseNumericEnv(this.env.GOOGLE_MONTHLY_CHARACTER_QUOTA, 5_000_000),
      options.now ?? (() => new Date()),
    );
  }

  isConfigured(): boolean {
    const hasProjectId = Boolean(this.env.GOOGLE_CLOUD_PROJECT_ID);
    const hasCredentials = Boolean(
      this.env.GOOGLE_TRANSLATE_ACCESS_TOKEN ||
        this.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    );
    return hasProjectId && hasCredentials;
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

    const accessToken = await getAccessToken(this.env);

    const response = await this.fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
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
