import db from "../../db.server";
import type { TranslationServiceEnv } from "./types";

/**
 * Build a TranslationServiceEnv for a shop by merging DB-stored keys
 * (per-shop, set via Settings UI) with process.env fallbacks.
 */
export async function getProviderEnv(shop: string): Promise<TranslationServiceEnv> {
  const settings = await db.shopSettings.findUnique({
    where: { shop },
    select: {
      openaiApiKey: true,
      deeplApiKey: true,
      googleAccessToken: true,
      googleProjectId: true,
      azureTranslatorKey: true,
      azureTranslatorRegion: true,
      awsAccessKeyId: true,
      awsSecretAccessKey: true,
      awsRegion: true,
      anthropicApiKey: true,
      libreTranslateUrl: true,
      libreTranslateApiKey: true,
    },
  });

  return {
    // DB keys take precedence over env vars
    OPENAI_API_KEY: settings?.openaiApiKey || process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_RATE_LIMIT_PER_MINUTE: process.env.OPENAI_RATE_LIMIT_PER_MINUTE,
    OPENAI_MONTHLY_REQUEST_QUOTA: process.env.OPENAI_MONTHLY_REQUEST_QUOTA,
    OPENAI_MONTHLY_CHARACTER_QUOTA: process.env.OPENAI_MONTHLY_CHARACTER_QUOTA,

    DEEPL_API_KEY: settings?.deeplApiKey || process.env.DEEPL_API_KEY,
    DEEPL_API_URL: process.env.DEEPL_API_URL,
    DEEPL_MONTHLY_REQUEST_QUOTA: process.env.DEEPL_MONTHLY_REQUEST_QUOTA,
    DEEPL_MONTHLY_CHARACTER_QUOTA: process.env.DEEPL_MONTHLY_CHARACTER_QUOTA,

    GOOGLE_TRANSLATE_ACCESS_TOKEN: settings?.googleAccessToken || process.env.GOOGLE_TRANSLATE_ACCESS_TOKEN,
    GOOGLE_CLOUD_PROJECT_ID: settings?.googleProjectId || process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_TRANSLATE_LOCATION: process.env.GOOGLE_TRANSLATE_LOCATION,
    GOOGLE_MONTHLY_REQUEST_QUOTA: process.env.GOOGLE_MONTHLY_REQUEST_QUOTA,
    GOOGLE_MONTHLY_CHARACTER_QUOTA: process.env.GOOGLE_MONTHLY_CHARACTER_QUOTA,

    AZURE_TRANSLATOR_KEY: settings?.azureTranslatorKey || process.env.AZURE_TRANSLATOR_KEY,
    AZURE_TRANSLATOR_REGION: settings?.azureTranslatorRegion || process.env.AZURE_TRANSLATOR_REGION,
    AZURE_TRANSLATOR_ENDPOINT: process.env.AZURE_TRANSLATOR_ENDPOINT,
    AZURE_MONTHLY_REQUEST_QUOTA: process.env.AZURE_MONTHLY_REQUEST_QUOTA,
    AZURE_MONTHLY_CHARACTER_QUOTA: process.env.AZURE_MONTHLY_CHARACTER_QUOTA,

    AWS_ACCESS_KEY_ID: settings?.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: settings?.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: settings?.awsRegion || process.env.AWS_REGION,
    AMAZON_MONTHLY_REQUEST_QUOTA: process.env.AMAZON_MONTHLY_REQUEST_QUOTA,
    AMAZON_MONTHLY_CHARACTER_QUOTA: process.env.AMAZON_MONTHLY_CHARACTER_QUOTA,

    ANTHROPIC_API_KEY: settings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
    ANTHROPIC_RATE_LIMIT_PER_MINUTE: process.env.ANTHROPIC_RATE_LIMIT_PER_MINUTE,
    ANTHROPIC_MONTHLY_REQUEST_QUOTA: process.env.ANTHROPIC_MONTHLY_REQUEST_QUOTA,
    ANTHROPIC_MONTHLY_CHARACTER_QUOTA: process.env.ANTHROPIC_MONTHLY_CHARACTER_QUOTA,

    LIBRETRANSLATE_URL: settings?.libreTranslateUrl || process.env.LIBRETRANSLATE_URL,
    LIBRETRANSLATE_API_KEY: settings?.libreTranslateApiKey || process.env.LIBRETRANSLATE_API_KEY,
    LIBRE_MONTHLY_REQUEST_QUOTA: process.env.LIBRE_MONTHLY_REQUEST_QUOTA,
    LIBRE_MONTHLY_CHARACTER_QUOTA: process.env.LIBRE_MONTHLY_CHARACTER_QUOTA,
  } as TranslationServiceEnv;
}

/**
 * Check which providers are configured for a shop.
 */
export async function getProviderStatus(shop: string) {
  const env = await getProviderEnv(shop);

  const providers = {
    openai: { configured: Boolean(env.OPENAI_API_KEY), name: "OpenAI" },
    anthropic: { configured: Boolean(env.ANTHROPIC_API_KEY), name: "Anthropic Claude" },
    deepl: { configured: Boolean(env.DEEPL_API_KEY), name: "DeepL" },
    google: {
      configured: Boolean(env.GOOGLE_TRANSLATE_ACCESS_TOKEN && env.GOOGLE_CLOUD_PROJECT_ID),
      name: "Google Translate",
    },
    azure: { configured: Boolean(env.AZURE_TRANSLATOR_KEY), name: "Azure Translator" },
    amazon: {
      configured: Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_REGION),
      name: "Amazon Translate",
    },
    libre: { configured: Boolean(env.LIBRETRANSLATE_URL), name: "LibreTranslate" },
  };

  const anyConfigured = Object.values(providers).some((p) => p.configured);

  return { ...providers, anyConfigured };
}
