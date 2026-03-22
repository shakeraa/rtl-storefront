export interface BotInfo {
  isBot: boolean;
  name: string | null;
  engine: string | null;
  preferredLocale: string | null;
}

export interface BotLanguageConfig {
  defaultLocale: string;
  botLocaleOverrides: Record<string, string>;
  serveLocalizedToBot: boolean;
}

const BOT_PATTERNS: Array<{ pattern: RegExp; name: string; engine: string }> = [
  { pattern: /Googlebot/i, name: "Googlebot", engine: "google" },
  { pattern: /Googlebot-Image/i, name: "Googlebot-Image", engine: "google" },
  { pattern: /Googlebot-Video/i, name: "Googlebot-Video", engine: "google" },
  { pattern: /Googlebot-News/i, name: "Googlebot-News", engine: "google" },
  { pattern: /AdsBot-Google/i, name: "AdsBot-Google", engine: "google" },
  { pattern: /Mediapartners-Google/i, name: "Mediapartners-Google", engine: "google" },
  { pattern: /bingbot/i, name: "Bingbot", engine: "bing" },
  { pattern: /msnbot/i, name: "MSNBot", engine: "bing" },
  { pattern: /Slurp/i, name: "Yahoo Slurp", engine: "yahoo" },
  { pattern: /DuckDuckBot/i, name: "DuckDuckBot", engine: "duckduckgo" },
  { pattern: /Baiduspider/i, name: "Baiduspider", engine: "baidu" },
  { pattern: /YandexBot/i, name: "YandexBot", engine: "yandex" },
  { pattern: /facebot|facebookexternalhit/i, name: "Facebook", engine: "facebook" },
  { pattern: /Twitterbot/i, name: "Twitterbot", engine: "twitter" },
  { pattern: /LinkedInBot/i, name: "LinkedInBot", engine: "linkedin" },
  { pattern: /Applebot/i, name: "Applebot", engine: "apple" },
  { pattern: /PinterestBot/i, name: "PinterestBot", engine: "pinterest" },
  { pattern: /Slackbot/i, name: "Slackbot", engine: "slack" },
  { pattern: /WhatsApp/i, name: "WhatsApp", engine: "whatsapp" },
  { pattern: /TelegramBot/i, name: "TelegramBot", engine: "telegram" },
];

/**
 * Detect if a user-agent string belongs to a known bot/crawler.
 */
export function detectBot(userAgent: string): BotInfo {
  if (!userAgent) {
    return { isBot: false, name: null, engine: null, preferredLocale: null };
  }

  for (const { pattern, name, engine } of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return { isBot: true, name, engine, preferredLocale: null };
    }
  }

  return { isBot: false, name: null, engine: null, preferredLocale: null };
}

/**
 * Determine which locale to serve to a bot based on configuration.
 */
export function getBotLocale(
  botInfo: BotInfo,
  config: BotLanguageConfig,
  requestLocale?: string,
): string {
  if (!botInfo.isBot) {
    return requestLocale ?? config.defaultLocale;
  }

  // Check engine-specific overrides
  if (botInfo.engine && config.botLocaleOverrides[botInfo.engine]) {
    return config.botLocaleOverrides[botInfo.engine];
  }

  // If configured to serve localized content to bots, use the request locale
  if (config.serveLocalizedToBot && requestLocale) {
    return requestLocale;
  }

  return config.defaultLocale;
}

/**
 * Detect bot from a Request object and determine serving locale.
 */
export function handleBotRequest(
  request: Request,
  config: BotLanguageConfig,
): { botInfo: BotInfo; locale: string } {
  const userAgent = request.headers.get("user-agent") ?? "";
  const botInfo = detectBot(userAgent);

  // Try to extract locale from URL path (e.g., /ar/products)
  const url = new URL(request.url);
  const pathLocale = url.pathname.split("/")[1];
  const requestLocale = pathLocale && pathLocale.length === 2 ? pathLocale : undefined;

  const locale = getBotLocale(botInfo, config, requestLocale);

  return { botInfo, locale };
}

export function getDefaultBotConfig(): BotLanguageConfig {
  return {
    defaultLocale: "en",
    botLocaleOverrides: {},
    serveLocalizedToBot: true,
  };
}

export function isSearchEngineBot(botInfo: BotInfo): boolean {
  const searchEngines = new Set(["google", "bing", "yahoo", "duckduckgo", "baidu", "yandex", "apple"]);
  return botInfo.isBot && botInfo.engine !== null && searchEngines.has(botInfo.engine);
}

export function isSocialMediaBot(botInfo: BotInfo): boolean {
  const socialBots = new Set(["facebook", "twitter", "linkedin", "pinterest", "slack", "whatsapp", "telegram"]);
  return botInfo.isBot && botInfo.engine !== null && socialBots.has(botInfo.engine);
}
