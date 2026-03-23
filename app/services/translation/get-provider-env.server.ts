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
  } as TranslationServiceEnv;
}

/**
 * Check which providers are configured for a shop.
 */
export async function getProviderStatus(shop: string) {
  const env = await getProviderEnv(shop);
  return {
    openai: { configured: Boolean(env.OPENAI_API_KEY), name: "OpenAI GPT-4o" },
    deepl: { configured: Boolean(env.DEEPL_API_KEY), name: "DeepL" },
    google: {
      configured: Boolean(env.GOOGLE_TRANSLATE_ACCESS_TOKEN && env.GOOGLE_CLOUD_PROJECT_ID),
      name: "Google Translate",
    },
    anyConfigured: Boolean(
      env.OPENAI_API_KEY || env.DEEPL_API_KEY ||
      (env.GOOGLE_TRANSLATE_ACCESS_TOKEN && env.GOOGLE_CLOUD_PROJECT_ID),
    ),
  };
}
