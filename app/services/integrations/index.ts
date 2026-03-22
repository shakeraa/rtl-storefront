/**
 * Shopify App Integrations Service
 * T0014: Integrations - Shopify Ecosystem & Third-Party Apps
 */

export interface Integration {
  id: string;
  name: string;
  category: 'page-builder' | 'reviews' | 'email' | 'support' | 'other';
  status: 'available' | 'connected' | 'error';
  config?: Record<string, unknown>;
  webhookUrl?: string;
}

export interface PageBuilderContent {
  pageId: string;
  content: string;
  metadata: Record<string, unknown>;
}

export interface ReviewData {
  reviewId: string;
  productId: string;
  author: string;
  content: string;
  rating: number;
}

export interface SizeChartRow {
  label: string;
  values: string[];
}

export interface SizeChartContent {
  chartId: string;
  title: string;
  measurementUnit: string;
  headers: string[];
  rows: SizeChartRow[];
}

export interface BundleItemContent {
  productId: string;
  title: string;
  quantity?: number;
  label?: string;
}

export interface BundleAppContent {
  bundleId: string;
  title: string;
  description?: string;
  items: BundleItemContent[];
  metadata?: Record<string, unknown>;
}

// Supported integrations registry
export const INTEGRATIONS: Integration[] = [
  {
    id: 'pagefly',
    name: 'PageFly',
    category: 'page-builder',
    status: 'available',
  },
  {
    id: 'gempages',
    name: 'GemPages',
    category: 'page-builder',
    status: 'available',
  },
  {
    id: 'judgeme',
    name: 'Judge.me',
    category: 'reviews',
    status: 'available',
  },
  {
    id: 'loox',
    name: 'Loox',
    category: 'reviews',
    status: 'available',
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    category: 'email',
    status: 'available',
  },
  {
    id: 'omnisend',
    name: 'Omnisend',
    category: 'email',
    status: 'available',
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'support',
    status: 'available',
  },
  {
    id: 'gorgias',
    name: 'Gorgias',
    category: 'support',
    status: 'available',
  },
  {
    id: 'fastbundle',
    name: 'Fast Bundle',
    category: 'other',
    status: 'available',
  },
  {
    id: 'easysize',
    name: 'EasySize',
    category: 'other',
    status: 'available',
  },
];

// PageFly integration
export async function translatePageFlyContent(
  content: PageBuilderContent,
  targetLocale: string
): Promise<string> {
  // Extract translatable text from PageFly HTML/JSON
  const translatableRegex = />([^<]+)</g;
  let translated = content.content;
  
  const matches = [...content.content.matchAll(translatableRegex)];
  for (const match of matches) {
    const original = match[1].trim();
    if (original && original.length > 2) {
      // Would integrate with translation service
      const translatedText = `[${targetLocale}] ${original}`;
      translated = translated.replace(original, translatedText);
    }
  }
  
  return translated;
}

// Judge.me integration
export async function translateJudgeMeReview(
  review: ReviewData,
  targetLocale: string
): Promise<ReviewData> {
  return {
    ...review,
    content: `[${targetLocale}] ${review.content}`,
  };
}

// Klaviyo integration
export async function translateKlaviyoTemplate(
  template: string,
  targetLocale: string
): Promise<string> {
  // Translate email template while preserving template tags
  const templateTagRegex = /{{[^}]+}}/g;
  const tags: string[] = [];
  
  // Extract template tags
  let placeholder = template;
  let match;
  while ((match = templateTagRegex.exec(template)) !== null) {
    tags.push(match[0]);
  }
  
  // Replace tags with placeholders
  let index = 0;
  placeholder = template.replace(templateTagRegex, () => `__TAG_${index++}__`);
  
  // Translate text content (placeholder implementation)
  const translated = `[${targetLocale}] ${placeholder}`;
  
  // Restore template tags
  return tags.reduce(
    (result, tag, i) => result.replace(`__TAG_${i}__`, tag),
    translated
  );
}

// Bundle app integration
export async function translateBundleAppContent(
  bundle: BundleAppContent,
  targetLocale: string
): Promise<BundleAppContent> {
  return {
    ...bundle,
    title: `[${targetLocale}] ${bundle.title}`,
    description: bundle.description
      ? `[${targetLocale}] ${bundle.description}`
      : undefined,
    items: bundle.items.map((item) => ({
      ...item,
      title: `[${targetLocale}] ${item.title}`,
      label: item.label ? `[${targetLocale}] ${item.label}` : undefined,
    })),
  };
}

// Size chart app integration
export async function translateSizeChartContent(
  chart: SizeChartContent,
  targetLocale: string
): Promise<SizeChartContent> {
  return {
    ...chart,
    title: `[${targetLocale}] ${chart.title}`,
    measurementUnit: `[${targetLocale}] ${chart.measurementUnit}`,
    headers: chart.headers.map((header) => `[${targetLocale}] ${header}`),
    rows: chart.rows.map((row) => ({
      ...row,
      label: `[${targetLocale}] ${row.label}`,
      values: row.values.map((value) => `[${targetLocale}] ${value}`),
    })),
  };
}

// Get integration by ID
export function getIntegration(id: string): Integration | undefined {
  return INTEGRATIONS.find((i) => i.id === id);
}

// Get integrations by category
export function getIntegrationsByCategory(
  category: Integration['category']
): Integration[] {
  return INTEGRATIONS.filter((i) => i.category === category);
}

// Check integration health
export async function checkIntegrationHealth(
  integrationId: string
): Promise<{ healthy: boolean; message?: string }> {
  const integration = getIntegration(integrationId);
  if (!integration) {
    return { healthy: false, message: 'Integration not found' };
  }
  
  // Placeholder health check
  return { healthy: true };
}

export * from './constants';
