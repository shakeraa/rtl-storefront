import { createAmazonProvider } from "./amazon";
import { createAnthropicProvider } from "./anthropic";
import { createAzureProvider } from "./azure";
import { createDeepLProvider } from "./deepl";
import { createGoogleProvider } from "./google";
import { createLibreTranslateProvider } from "./libretranslate";
import { createOpenAIProvider } from "./openai";
import { getBaseLocale } from "./shared";
import type {
  TranslationProvider,
  TranslationProviderName,
  TranslationServiceEnv,
} from "../types";

const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur"]);
const DEEPL_STRENGTH_LANGUAGES = new Set([
  "de",
  "en",
  "es",
  "fr",
  "it",
  "nl",
  "pl",
  "pt",
]);

interface ProviderRegistryOptions {
  env?: TranslationServiceEnv;
  fetch?: typeof fetch;
  now?: () => Date;
}

export function createProviderRegistry(options: ProviderRegistryOptions = {}) {
  const providers: TranslationProvider[] = [
    createOpenAIProvider(options),
    createAnthropicProvider(options),
    createDeepLProvider(options),
    createGoogleProvider(options),
    createAzureProvider(options),
    createAmazonProvider(options),
    createLibreTranslateProvider(options),
  ];

  return {
    providers,
    getProvider(name: TranslationProviderName) {
      return providers.find((provider) => provider.name === name);
    },
    getConfiguredProviders() {
      return providers.filter((provider) => provider.isConfigured());
    },
    selectProviderChain(sourceLocale: string, targetLocale: string) {
      return sortProvidersForLanguagePair(providers, sourceLocale, targetLocale);
    },
  };
}

export function sortProvidersForLanguagePair(
  providers: TranslationProvider[],
  sourceLocale: string,
  targetLocale: string,
) {
  const source = getBaseLocale(sourceLocale);
  const target = getBaseLocale(targetLocale);

  return [...providers]
    .filter((provider) => provider.supportsLanguagePair(sourceLocale, targetLocale))
    .sort((left, right) => {
      return (
        scoreProvider(right.name, source, target) -
        scoreProvider(left.name, source, target)
      );
    });
}

function scoreProvider(
  provider: TranslationProviderName,
  sourceLocale: string,
  targetLocale: string,
): number {
  const involvesRTL =
    RTL_LANGUAGES.has(sourceLocale) || RTL_LANGUAGES.has(targetLocale);

  switch (provider) {
    case "openai":
      return 70 + (involvesRTL ? 40 : 0);
    case "anthropic":
      return 75 + (involvesRTL ? 35 : 0);
    case "deepl":
      return (
        60 +
        (DEEPL_STRENGTH_LANGUAGES.has(sourceLocale) ? 20 : 0) +
        (DEEPL_STRENGTH_LANGUAGES.has(targetLocale) ? 20 : 0)
      );
    case "google":
      return 50 + (involvesRTL ? 10 : 15);
    case "azure":
      return 55 + (involvesRTL ? 10 : 10);
    case "amazon":
      return 45 + (involvesRTL ? 5 : 10);
    case "libre":
      return 30;
  }
}

export type ProviderRegistry = ReturnType<typeof createProviderRegistry>;
