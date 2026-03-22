/**
 * Language-specific Robots.txt (T0078)
 *
 * Generate robots.txt with language-specific rules and crawl-delay settings.
 * Features:
 * - Dynamic robots.txt generation
 * - Language path rules
 * - Sitemap reference
 * - Crawl-delay settings
 */

import type { SEOConfig } from "../seo-infrastructure";

export interface RobotsTxtConfig {
  /** Default user agent (default: *) */
  userAgent?: string;
  /** Allow rules */
  allow?: string[];
  /** Disallow rules */
  disallow?: string[];
  /** Crawl delay in seconds (default: undefined) */
  crawlDelay?: number;
  /** Host directive (optional) */
  host?: string;
  /** Sitemap URLs */
  sitemaps?: string[];
  /** Language-specific rules */
  languageRules?: Array<{
    locale: string;
    allow?: string[];
    disallow?: string[];
  }>;
}

export interface UserAgentRules {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface GeneratedRobotsTxt {
  content: string;
  userAgents: string[];
  sitemapCount: number;
  hasCrawlDelay: boolean;
  lineCount: number;
}

// Default paths to disallow
const DEFAULT_DISALLOW_PATHS = [
  "/admin",
  "/cart",
  "/checkout",
  "/account",
  "/api",
  "/search",
  "/password",
];

// Default paths to allow
const DEFAULT_ALLOW_PATHS: string[] = [];

/**
 * Generate a language-specific robots.txt
 * @param seoConfig - SEO configuration with locales
 * @param config - Optional robots.txt configuration
 * @returns Generated robots.txt content
 */
export function generateLanguageSpecificRobotsTxt(
  seoConfig: SEOConfig,
  config?: RobotsTxtConfig,
): GeneratedRobotsTxt {
  const normalizedBase = seoConfig.baseUrl.replace(/\/+$/, "");
  
  const rules: UserAgentRules = {
    userAgent: config?.userAgent || "*",
    allow: [...(config?.allow || DEFAULT_ALLOW_PATHS)],
    disallow: [...(config?.disallow || DEFAULT_DISALLOW_PATHS)],
    crawlDelay: config?.crawlDelay,
  };

  // Add language-specific paths to allow
  for (const locale of seoConfig.locales) {
    rules.allow.push(`/${locale}/`);
  }

  // Build the robots.txt content
  const lines: string[] = [];

  // Add User-agent
  lines.push(`User-agent: ${rules.userAgent}`);
  lines.push("");

  // Add Allow rules
  for (const path of rules.allow) {
    lines.push(`Allow: ${path}`);
  }

  // Add Disallow rules
  for (const path of rules.disallow) {
    lines.push(`Disallow: ${path}`);
  }

  // Add Crawl-delay if specified
  if (rules.crawlDelay !== undefined && rules.crawlDelay > 0) {
    lines.push("");
    lines.push(`Crawl-delay: ${rules.crawlDelay}`);
  }

  // Add language-specific rules if provided
  if (config?.languageRules && config.languageRules.length > 0) {
    for (const langRule of config.languageRules) {
      lines.push("");
      lines.push(`# Rules for locale: ${langRule.locale}`);
      
      if (langRule.allow) {
        for (const path of langRule.allow) {
          lines.push(`Allow: /${langRule.locale}${path}`);
        }
      }
      
      if (langRule.disallow) {
        for (const path of langRule.disallow) {
          lines.push(`Disallow: /${langRule.locale}${path}`);
        }
      }
    }
  }

  // Add Host directive if specified
  if (config?.host) {
    lines.push("");
    lines.push(`Host: ${config.host}`);
  }

  // Add Sitemap references
  const sitemaps = config?.sitemaps || seoConfig.locales.map(
    locale => `${normalizedBase}/sitemap-${locale}.xml`
  );

  if (sitemaps.length > 0) {
    lines.push("");
    for (const sitemap of sitemaps) {
      lines.push(`Sitemap: ${sitemap}`);
    }
  }

  const content = lines.join("\n");

  return {
    content,
    userAgents: [rules.userAgent],
    sitemapCount: sitemaps.length,
    hasCrawlDelay: rules.crawlDelay !== undefined,
    lineCount: lines.length,
  };
}

/**
 * Generate robots.txt with multiple user agents
 * @param seoConfig - SEO configuration
 * @param userAgents - Array of user agent rules
 * @param sitemaps - Sitemap URLs
 * @returns Generated robots.txt content
 */
export function generateMultiUserAgentRobotsTxt(
  seoConfig: SEOConfig,
  userAgents: UserAgentRules[],
  sitemaps?: string[],
): GeneratedRobotsTxt {
  const normalizedBase = seoConfig.baseUrl.replace(/\/+$/, "");
  const lines: string[] = [];
  const userAgentNames: string[] = [];

  for (const rules of userAgents) {
    userAgentNames.push(rules.userAgent);

    // Add User-agent
    lines.push(`User-agent: ${rules.userAgent}`);
    lines.push("");

    // Add Allow rules
    for (const path of rules.allow) {
      lines.push(`Allow: ${path}`);
    }

    // Add Disallow rules
    for (const path of rules.disallow) {
      lines.push(`Disallow: ${path}`);
    }

    // Add Crawl-delay if specified
    if (rules.crawlDelay !== undefined && rules.crawlDelay > 0) {
      lines.push("");
      lines.push(`Crawl-delay: ${rules.crawlDelay}`);
    }

    lines.push("");
  }

  // Add Sitemap references
  const finalSitemaps = sitemaps || seoConfig.locales.map(
    locale => `${normalizedBase}/sitemap-${locale}.xml`
  );

  if (finalSitemaps.length > 0) {
    for (const sitemap of finalSitemaps) {
      lines.push(`Sitemap: ${sitemap}`);
    }
  }

  const content = lines.join("\n").trim();

  return {
    content,
    userAgents: userAgentNames,
    sitemapCount: finalSitemaps.length,
    hasCrawlDelay: userAgents.some(ua => ua.crawlDelay !== undefined),
    lineCount: lines.filter(l => l.trim().length > 0).length,
  };
}

/**
 * Generate a simple robots.txt with crawl-delay for specific bots
 * @param seoConfig - SEO configuration
 * @param crawlDelay - Crawl delay in seconds
 * @returns Generated robots.txt content
 */
export function generateRobotsTxtWithCrawlDelay(
  seoConfig: SEOConfig,
  crawlDelay: number,
): GeneratedRobotsTxt {
  return generateLanguageSpecificRobotsTxt(seoConfig, {
    crawlDelay,
  });
}

/**
 * Generate robots.txt with specific bot rules
 * @param seoConfig - SEO configuration
 * @returns Generated robots.txt content
 */
export function generateBotSpecificRobotsTxt(seoConfig: SEOConfig): GeneratedRobotsTxt {
  const userAgents: UserAgentRules[] = [
    {
      userAgent: "*",
      allow: seoConfig.locales.map(l => `/${l}/`),
      disallow: ["/admin", "/cart", "/checkout", "/account", "/api"],
    },
    {
      userAgent: "Googlebot",
      allow: seoConfig.locales.map(l => `/${l}/`),
      disallow: ["/admin", "/cart", "/checkout"],
      crawlDelay: 1,
    },
    {
      userAgent: "Googlebot-Image",
      allow: [...seoConfig.locales.map(l => `/${l}/`), "/cdn/shop/"],
      disallow: [],
    },
    {
      userAgent: "Bingbot",
      allow: seoConfig.locales.map(l => `/${l}/`),
      disallow: ["/admin", "/cart", "/checkout", "/account"],
      crawlDelay: 2,
    },
    {
      userAgent: "AhrefsBot",
      allow: seoConfig.locales.map(l => `/${l}/`),
      disallow: ["/admin", "/cart", "/checkout"],
      crawlDelay: 5,
    },
  ];

  return generateMultiUserAgentRobotsTxt(seoConfig, userAgents);
}

/**
 * Validate a robots.txt content
 * @param content - The robots.txt content to validate
 * @returns Validation result
 */
export function validateRobotsTxt(content: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lines = content.split("\n");
  let hasUserAgent = false;
  let hasSitemap = false;
  let inUserAgentBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith("user-agent:")) {
      hasUserAgent = true;
      inUserAgentBlock = true;
      const userAgent = line.substring("user-agent:".length).trim();
      if (!userAgent) {
        errors.push(`Line ${i + 1}: User-agent directive is empty`);
      }
    } else if (lowerLine.startsWith("allow:")) {
      if (!inUserAgentBlock) {
        warnings.push(`Line ${i + 1}: Allow directive outside of User-agent block`);
      }
      const path = line.substring("allow:".length).trim();
      if (!path.startsWith("/")) {
        warnings.push(`Line ${i + 1}: Allow path should start with "/"`);
      }
    } else if (lowerLine.startsWith("disallow:")) {
      if (!inUserAgentBlock) {
        warnings.push(`Line ${i + 1}: Disallow directive outside of User-agent block`);
      }
      const path = line.substring("disallow:".length).trim();
      if (!path.startsWith("/")) {
        warnings.push(`Line ${i + 1}: Disallow path should start with "/"`);
      }
    } else if (lowerLine.startsWith("crawl-delay:")) {
      if (!inUserAgentBlock) {
        warnings.push(`Line ${i + 1}: Crawl-delay directive outside of User-agent block`);
      }
      const delay = parseFloat(line.substring("crawl-delay:".length).trim());
      if (isNaN(delay) || delay < 0) {
        errors.push(`Line ${i + 1}: Crawl-delay must be a positive number`);
      }
      if (delay > 60) {
        warnings.push(`Line ${i + 1}: Crawl-delay of ${delay}s is very high and may affect indexing`);
      }
    } else if (lowerLine.startsWith("sitemap:")) {
      hasSitemap = true;
      inUserAgentBlock = false;
      const url = line.substring("sitemap:".length).trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errors.push(`Line ${i + 1}: Sitemap URL must be absolute (start with http:// or https://)`);
      }
      if (!url.endsWith(".xml")) {
        warnings.push(`Line ${i + 1}: Sitemap URL should end with .xml`);
      }
    } else if (lowerLine.startsWith("host:")) {
      inUserAgentBlock = false;
      const host = line.substring("host:".length).trim();
      if (!host) {
        errors.push(`Line ${i + 1}: Host directive is empty`);
      }
    }
  }

  if (!hasUserAgent) {
    errors.push("No User-agent directive found");
  }

  if (!hasSitemap) {
    warnings.push("No Sitemap directive found - search engines may have difficulty discovering your sitemaps");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parse a robots.txt content into structured rules
 * @param content - The robots.txt content
 * @returns Parsed rules
 */
export function parseRobotsTxt(content: string): {
  userAgents: UserAgentRules[];
  sitemaps: string[];
  host?: string;
} {
  const userAgents: UserAgentRules[] = [];
  const sitemaps: string[] = [];
  let host: string | undefined;

  const lines = content.split("\n");
  let currentUserAgent: UserAgentRules | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }

    const lowerLine = trimmed.toLowerCase();

    if (lowerLine.startsWith("user-agent:")) {
      // Save previous user agent if exists
      if (currentUserAgent) {
        userAgents.push(currentUserAgent);
      }
      currentUserAgent = {
        userAgent: trimmed.substring("user-agent:".length).trim(),
        allow: [],
        disallow: [],
      };
    } else if (lowerLine.startsWith("allow:") && currentUserAgent) {
      currentUserAgent.allow.push(trimmed.substring("allow:".length).trim());
    } else if (lowerLine.startsWith("disallow:") && currentUserAgent) {
      currentUserAgent.disallow.push(trimmed.substring("disallow:".length).trim());
    } else if (lowerLine.startsWith("crawl-delay:") && currentUserAgent) {
      currentUserAgent.crawlDelay = parseFloat(trimmed.substring("crawl-delay:".length).trim());
    } else if (lowerLine.startsWith("sitemap:")) {
      if (currentUserAgent) {
        userAgents.push(currentUserAgent);
        currentUserAgent = null;
      }
      sitemaps.push(trimmed.substring("sitemap:".length).trim());
    } else if (lowerLine.startsWith("host:")) {
      if (currentUserAgent) {
        userAgents.push(currentUserAgent);
        currentUserAgent = null;
      }
      host = trimmed.substring("host:".length).trim();
    }
  }

  // Don't forget the last user agent
  if (currentUserAgent) {
    userAgents.push(currentUserAgent);
  }

  return { userAgents, sitemaps, host };
}

/**
 * Check if a URL is allowed by the robots.txt rules
 * @param url - The URL to check
 * @param userAgent - The user agent (default: *)
 * @param robotsContent - The robots.txt content
 * @returns Whether the URL is allowed
 */
export function isUrlAllowed(
  url: string,
  userAgent: string,
  robotsContent: string,
): boolean {
  const parsed = parseRobotsTxt(robotsContent);
  
  // Find matching user agent rules
  // First, look for exact match or user agent that contains the target
  let matchingRules = parsed.userAgents.filter(ua => {
    const uaLower = ua.userAgent.toLowerCase();
    const targetLower = userAgent.toLowerCase();
    // Exact match
    if (uaLower === targetLower) return true;
    // User agent in robots.txt is contained in the actual user agent
    // e.g., "Googlebot" should match "Mozilla/5.0 ... Googlebot/2.1"
    if (targetLower.includes(uaLower)) return true;
    return false;
  });

  // If no specific match, fall back to *
  if (matchingRules.length === 0) {
    const wildcard = parsed.userAgents.find(ua => ua.userAgent === "*");
    if (wildcard) matchingRules.push(wildcard);
  }

  // Sort by specificity: longer matches = more specific
  matchingRules.sort((a, b) => b.userAgent.length - a.userAgent.length);

  // Get the most specific rules
  const rules = matchingRules[0];
  if (!rules) return true;

  const pathname = new URL(url, "http://example.com").pathname;

  // Check allow rules first (they take precedence)
  for (const allowPath of rules.allow) {
    if (pathname.startsWith(allowPath)) {
      return true;
    }
  }

  // Check disallow rules
  for (const disallowPath of rules.disallow) {
    if (pathname.startsWith(disallowPath)) {
      return false;
    }
  }

  return true;
}

/**
 * Create a robots.txt builder for fluent API
 * @returns Robots.txt builder
 */
export function createRobotsTxtBuilder() {
  const userAgents: UserAgentRules[] = [];
  const sitemaps: string[] = [];
  let host: string | undefined;

  return {
    /**
     * Add a user agent
     */
    addUserAgent(
      userAgent: string,
      options?: { allow?: string[]; disallow?: string[]; crawlDelay?: number }
    ): typeof this {
      userAgents.push({
        userAgent,
        allow: options?.allow || [],
        disallow: options?.disallow || [],
        crawlDelay: options?.crawlDelay,
      });
      return this;
    },

    /**
     * Add a sitemap
     */
    addSitemap(url: string): typeof this {
      sitemaps.push(url);
      return this;
    },

    /**
     * Set host directive
     */
    setHost(hostname: string): typeof this {
      host = hostname;
      return this;
    },

    /**
     * Build the robots.txt content
     */
    build(): string {
      const lines: string[] = [];

      for (const rules of userAgents) {
        lines.push(`User-agent: ${rules.userAgent}`);
        lines.push("");

        for (const path of rules.allow) {
          lines.push(`Allow: ${path}`);
        }

        for (const path of rules.disallow) {
          lines.push(`Disallow: ${path}`);
        }

        if (rules.crawlDelay !== undefined) {
          lines.push("");
          lines.push(`Crawl-delay: ${rules.crawlDelay}`);
        }

        lines.push("");
      }

      if (host) {
        lines.push(`Host: ${host}`);
        lines.push("");
      }

      for (const sitemap of sitemaps) {
        lines.push(`Sitemap: ${sitemap}`);
      }

      return lines.join("\n").trim();
    },
  };
}
