import {
  countCharacters,
  MonthlyQuotaTracker,
  normalizeLocale,
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

interface AmazonOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

/**
 * Amazon Translate provider using the TranslateText REST API.
 * Requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION.
 */
export class AmazonTranslationProvider implements TranslationProvider {
  readonly name = "amazon" as const;
  private readonly env: TranslationServiceEnv;
  private readonly fetchImpl: typeof fetch;
  private readonly quotaTracker: MonthlyQuotaTracker;

  constructor(options: AmazonOptions = {}) {
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.fetchImpl = options.fetch ?? fetch;
    this.quotaTracker = new MonthlyQuotaTracker(
      this.name,
      parseNumericEnv(this.env.AMAZON_MONTHLY_REQUEST_QUOTA, 50_000),
      parseNumericEnv(this.env.AMAZON_MONTHLY_CHARACTER_QUOTA, 2_000_000),
      options.now ?? (() => new Date()),
    );
  }

  isConfigured(): boolean {
    return Boolean(
      this.env.AWS_ACCESS_KEY_ID &&
      this.env.AWS_SECRET_ACCESS_KEY &&
      this.env.AWS_REGION,
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
        "AWS credentials are not configured",
        this.name,
      );
    }

    const region = this.env.AWS_REGION!;
    const endpoint = `https://translate.${region}.amazonaws.com`;
    const body = JSON.stringify({
      SourceLanguageCode: getBaseLocale(input.sourceLocale),
      TargetLanguageCode: getBaseLocale(input.targetLocale),
      Text: input.text,
      Settings: input.format === "html"
        ? { Formality: "FORMAL", Brevity: "OFF" }
        : undefined,
    });

    // AWS Signature V4 — use a simplified approach with pre-signed headers
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);

    // For production, use proper AWS SDK or SigV4 signing.
    // Here we use the simpler approach with access key in headers.
    const { createHmac, createHash } = await import("node:crypto");

    const host = `translate.${region}.amazonaws.com`;
    const service = "translate";
    const method = "POST";
    const canonicalUri = "/";
    const contentType = "application/x-amz-json-1.1";
    const target = "AWSShineFrontendService_20170701.TranslateText";

    const payloadHash = createHash("sha256").update(body).digest("hex");

    const canonicalHeaders = [
      `content-type:${contentType}`,
      `host:${host}`,
      `x-amz-date:${amzDate}`,
      `x-amz-target:${target}`,
    ].join("\n") + "\n";

    const signedHeaders = "content-type;host;x-amz-date;x-amz-target";

    const canonicalRequest = [
      method,
      canonicalUri,
      "", // query string
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    const sign = (key: Buffer | string, msg: string) =>
      createHmac("sha256", key).update(msg).digest();

    const kDate = sign(`AWS4${this.env.AWS_SECRET_ACCESS_KEY}`, dateStamp);
    const kRegion = sign(kDate, region);
    const kService = sign(kRegion, service);
    const kSigning = sign(kService, "aws4_request");
    const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authHeader = `AWS4-HMAC-SHA256 Credential=${this.env.AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await this.fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "X-Amz-Date": amzDate,
        "X-Amz-Target": target,
        Authorization: authHeader,
      },
      body,
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.message ?? payload?.Message ?? "Amazon Translate request failed";
      throw new TranslationProviderError(message, this.name, response.status);
    }

    const translatedText = payload?.TranslatedText;

    if (!translatedText) {
      throw new TranslationProviderError(
        "Amazon Translate returned an empty translation",
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
        payload?.SourceLanguageCode ?? normalizeLocale(input.sourceLocale),
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

export function createAmazonProvider(options?: AmazonOptions) {
  return new AmazonTranslationProvider(options);
}
