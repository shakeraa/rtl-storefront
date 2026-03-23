import { createHash } from "node:crypto";
import prisma from "../../db.server";
import { createProviderRegistry, sortProvidersForLanguagePair } from "./ai-providers";
import { normalizeLocale, TranslationProviderError } from "./ai-providers/shared";
import { trackTranslationUsage, getProviderCostRate } from "../analytics/usage-tracker";
import { notifyTranslationComplete, notifyTranslationError, notifyReviewNeeded } from "../notifications/notifier.server";
import type {
  ProviderQuotaStatus,
  TranslationCacheStore,
  TranslationEngineInput,
  TranslationProvider,
  TranslationProviderName,
  TranslationResult,
  TranslationServiceEnv,
} from "./types";

const DEFAULT_CACHE_TTL_HOURS = 24 * 7;

export class TranslationEngineError extends Error {
  constructor(
    message: string,
    readonly attempts: Array<{ provider: TranslationProviderName; message: string }>,
  ) {
    super(message);
    this.name = "TranslationEngineError";
  }
}

interface TranslationEngineOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
  providers?: TranslationProvider[];
  cache?: TranslationCacheStore;
}

export class TranslationEngine {
  private readonly providers: TranslationProvider[];
  private readonly cache: TranslationCacheStore;
  private readonly env: TranslationServiceEnv;
  private readonly now: () => Date;

  constructor(options: TranslationEngineOptions = {}) {
    const registry = options.providers
      ? null
      : createProviderRegistry({
          env: options.env,
          fetch: options.fetch,
          now: options.now,
        });

    this.providers = options.providers ?? registry!.providers;
    this.cache =
      options.cache ??
      createPrismaTranslationCacheStore(
        options.now ?? (() => new Date()),
      );
    this.env = (options.env ?? process.env) as TranslationServiceEnv;
    this.now = options.now ?? (() => new Date());
  }

  async translate(input: TranslationEngineInput): Promise<TranslationResult> {
    const normalizedSource = normalizeLocale(input.sourceLocale);
    const normalizedTarget = normalizeLocale(input.targetLocale);

    if (!input.text.trim()) {
      throw new Error("Text is required");
    }

    if (normalizedSource === normalizedTarget) {
      const provider = input.preferredProvider ?? this.providers[0]?.name ?? "openai";

      return {
        provider,
        translatedText: input.text,
        detectedSourceLocale: normalizedSource,
        cached: false,
        fallbackUsed: false,
        usage: {
          requests: 0,
          characters: 0,
          remainingRequests: null,
          remainingCharacters: null,
        },
        quota: {
          provider,
          configured: false,
          requests: 0,
          requestLimit: null,
          characters: 0,
          characterLimit: null,
          alert: null,
        },
        metadata: {
          skipped: true,
        },
      };
    }

    const cacheKey = buildCacheKey(input);

    if (!input.bypassCache) {
      const cached = await this.cache.get(cacheKey);

      if (cached) {
        // Track cached usage (no cost, but record for analytics)
        void trackTranslationUsage({
          shop: input.shop || "unknown",
          provider: cached.provider,
          characters: input.text.length,
          costPer1kChars: 0,
          sourceLocale: normalizedSource,
          targetLocale: normalizedTarget,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          contentType: input.contentType,
          cached: true,
          glossaryUsed: !!input.glossaryEntries?.length,
        });

        return {
          provider: cached.provider,
          translatedText: cached.translatedText,
          detectedSourceLocale: normalizedSource,
          cached: true,
          fallbackUsed: false,
          usage: {
            requests: 0,
            characters: 0,
            remainingRequests: null,
            remainingCharacters: null,
          },
          quota: getQuotaStatus(this.providers, cached.provider),
          metadata: {
            cacheKey,
          },
        };
      }
    }

    const chain = getProviderChain(this.providers, input);

    if (chain.length === 0) {
      throw new TranslationEngineError(
        "No translation providers are configured for this language pair",
        [],
      );
    }

    const attempts: Array<{ provider: TranslationProviderName; message: string }> = [];

    for (const [index, provider] of chain.entries()) {
      try {
        const startTime = Date.now();
        const result = await provider.translate(input);
        const responseTimeMs = Date.now() - startTime;

        await this.cache.set({
          cacheKey,
          provider: result.provider,
          sourceLocale: normalizedSource,
          targetLocale: normalizedTarget,
          sourceText: input.text,
          translatedText: result.translatedText,
          context: input.context,
          expiresAt: buildCacheExpiry(this.env, this.now),
        });

        // Track actual API usage
        void trackTranslationUsage({
          shop: input.shop || "unknown",
          provider: result.provider,
          model: result.metadata?.model as string | undefined,
          characters: result.usage?.characters || input.text.length,
          costPer1kChars: getProviderCostRate(result.provider),
          responseTimeMs,
          sourceLocale: normalizedSource,
          targetLocale: normalizedTarget,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          contentType: input.contentType,
          qualityScore: result.metadata?.qualityScore as number | undefined,
          cached: false,
          glossaryUsed: !!input.glossaryEntries?.length,
        });

        // Send notification for translation completion
        if (input.shop && input.resourceType && input.resourceId) {
          const qualityScore = result.metadata?.qualityScore as number | undefined;
          
          // Notify completion
          void notifyTranslationComplete({
            shop: input.shop,
            locale: normalizedTarget,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            resourceTitle: input.text.slice(0, 50) + (input.text.length > 50 ? "..." : ""),
            characters: result.usage?.characters || input.text.length,
            provider: result.provider,
          });

          // Notify if quality is low and review needed
          if (qualityScore && qualityScore < 70) {
            void notifyReviewNeeded({
              shop: input.shop,
              locale: normalizedTarget,
              resourceType: input.resourceType,
              resourceId: input.resourceId,
              resourceTitle: input.text.slice(0, 50) + (input.text.length > 50 ? "..." : ""),
              qualityScore,
            });
          }
        }

        return {
          ...result,
          cached: false,
          fallbackUsed: index > 0,
        };
      } catch (error) {
        if (error instanceof TranslationProviderError) {
          attempts.push({
            provider: provider.name,
            message: error.message,
          });
          continue;
        }

        throw error;
      }
    }

    // Notify about translation failure
    if (input.shop && input.resourceType && input.resourceId) {
      void notifyTranslationError({
        shop: input.shop,
        locale: normalizedTarget,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        resourceTitle: input.text.slice(0, 50) + (input.text.length > 50 ? "..." : ""),
        error: attempts.map(a => `${a.provider}: ${a.message}`).join("; "),
      });
    }

    throw new TranslationEngineError("All translation providers failed", attempts);
  }

  getQuotaStatus(): ProviderQuotaStatus[] {
    return this.providers.map((provider) => provider.getQuotaStatus());
  }
}

export function createTranslationEngine(options?: TranslationEngineOptions) {
  return new TranslationEngine(options);
}

/**
 * Create a translation engine that uses per-shop API keys from the database,
 * falling back to environment variables.
 */
export async function createShopTranslationEngine(shop: string): Promise<TranslationEngine> {
  const { getProviderEnv } = await import("./get-provider-env.server");
  const env = await getProviderEnv(shop);
  return new TranslationEngine({ env });
}

export function createPrismaTranslationCacheStore(
  now: () => Date = () => new Date(),
): TranslationCacheStore {
  return {
    async get(cacheKey) {
      const cache = await prisma.translationCache.findUnique({
        where: { cacheKey },
      });

      if (!cache) {
        return null;
      }

      if (cache.expiresAt <= now()) {
        await prisma.translationCache.delete({
          where: { cacheKey },
        });
        return null;
      }

      await prisma.translationCache.update({
        where: { cacheKey },
        data: {
          hits: {
            increment: 1,
          },
          lastUsedAt: now(),
        },
      });

      return {
        cacheKey: cache.cacheKey,
        provider: cache.provider as TranslationProviderName,
        sourceLocale: cache.sourceLocale,
        targetLocale: cache.targetLocale,
        sourceText: cache.sourceText,
        translatedText: cache.translatedText,
        context: cache.context ?? undefined,
        expiresAt: cache.expiresAt,
      };
    },
    async set(entry) {
      await prisma.translationCache.upsert({
        where: { cacheKey: entry.cacheKey },
        create: {
          cacheKey: entry.cacheKey,
          provider: entry.provider,
          sourceLocale: entry.sourceLocale,
          targetLocale: entry.targetLocale,
          sourceText: entry.sourceText,
          translatedText: entry.translatedText,
          context: entry.context,
          expiresAt: entry.expiresAt,
        },
        update: {
          provider: entry.provider,
          sourceLocale: entry.sourceLocale,
          targetLocale: entry.targetLocale,
          sourceText: entry.sourceText,
          translatedText: entry.translatedText,
          context: entry.context,
          expiresAt: entry.expiresAt,
          lastUsedAt: now(),
        },
      });
    },
  };
}

function buildCacheKey(input: TranslationEngineInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        text: input.text,
        sourceLocale: normalizeLocale(input.sourceLocale),
        targetLocale: normalizeLocale(input.targetLocale),
        context: input.context ?? "",
        format: input.format ?? "text",
      }),
    )
    .digest("hex");
}

function buildCacheExpiry(env: TranslationServiceEnv, now: () => Date): Date {
  const parsedTtlHours = Number.parseInt(
    env.TRANSLATION_CACHE_TTL_HOURS ?? String(DEFAULT_CACHE_TTL_HOURS),
    10,
  );
  const ttlHours = Number.isFinite(parsedTtlHours) && parsedTtlHours > 0
    ? parsedTtlHours
    : DEFAULT_CACHE_TTL_HOURS;

  return new Date(now().getTime() + ttlHours * 60 * 60 * 1000);
}

function getProviderChain(
  providers: TranslationProvider[],
  input: TranslationEngineInput,
) {
  const selected = sortProvidersForLanguagePair(
    providers,
    input.sourceLocale,
    input.targetLocale,
  );

  if (input.preferredProvider) {
    return selected.sort((left, right) => {
      if (input.preferredProvider === left.name) {
        return -1;
      }

      if (input.preferredProvider === right.name) {
        return 1;
      }

      const priority = { openai: 3, deepl: 2, google: 1 };
      return priority[right.name] - priority[left.name];
    });
  }

  return selected;
}

function getQuotaStatus(
  providers: TranslationProvider[],
  providerName: TranslationProviderName,
): ProviderQuotaStatus {
  return (
    providers.find((provider) => provider.name === providerName)?.getQuotaStatus() ?? {
      provider: providerName,
      configured: false,
      requests: 0,
      requestLimit: null,
      characters: 0,
      characterLimit: null,
      alert: null,
    }
  );
}
