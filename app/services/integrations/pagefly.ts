/**
 * PageFly Page Builder Integration
 * T0014: Integrations - Shopify Ecosystem & Third-Party Apps
 *
 * Extracts and translates content from PageFly-built pages.
 * PageFly stores page data as structured JSON inside Shopify metafields.
 */

export interface PageFlyElement {
  type: string;
  props?: Record<string, unknown>;
  children?: PageFlyElement[];
  text?: string;
}

export interface PageFlyPage {
  pageId: string;
  handle: string;
  /** Raw HTML or JSON-encoded element tree stored by PageFly */
  content: string;
  metadata?: Record<string, unknown>;
}

export interface TranslatableSegment {
  key: string;
  text: string;
  context?: string;
}

export interface PageFlyTranslationResult {
  pageId: string;
  locale: string;
  segments: TranslatableSegment[];
  translatedContent: string;
}

/**
 * Prop keys that PageFly uses for localizable text within element trees.
 */
const TEXT_PROP_KEYS = new Set([
  'text',
  'content',
  'title',
  'subtitle',
  'label',
  'placeholder',
  'buttonText',
  'description',
  'alt',
  'caption',
]);

function collectSegmentsFromElement(
  element: PageFlyElement,
  segments: TranslatableSegment[],
  path: string
): void {
  if (element.text?.trim()) {
    segments.push({ key: `${path}.text`, text: element.text.trim(), context: element.type });
  }

  if (element.props) {
    for (const [key, value] of Object.entries(element.props)) {
      if (TEXT_PROP_KEYS.has(key) && typeof value === 'string' && value.trim()) {
        segments.push({
          key: `${path}.props.${key}`,
          text: value.trim(),
          context: `${element.type}.${key}`,
        });
      }
    }
  }

  if (Array.isArray(element.children)) {
    element.children.forEach((child, index) => {
      collectSegmentsFromElement(child, segments, `${path}[${index}]`);
    });
  }
}

/**
 * Extract translatable text segments from a PageFly page.
 * Handles both raw HTML and JSON-encoded element trees.
 */
export function extractPageFlyContent(page: PageFlyPage): TranslatableSegment[] {
  const segments: TranslatableSegment[] = [];

  try {
    const parsed = JSON.parse(page.content);
    const root: PageFlyElement = Array.isArray(parsed)
      ? { type: 'root', children: parsed }
      : parsed;
    collectSegmentsFromElement(root, segments, 'root');
    return segments;
  } catch {
    // HTML fallback
  }

  const textNodeRegex = />([^<]+)</g;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = textNodeRegex.exec(page.content)) !== null) {
    const text = match[1].trim();
    if (text.length > 1) {
      segments.push({ key: `html.node.${index++}`, text, context: 'html' });
    }
  }

  return segments;
}

/**
 * Apply translations back into a PageFly page, returning updated content.
 */
export function applyPageFlyTranslations(
  page: PageFlyPage,
  translations: Map<string, string>,
  _locale: string
): string {
  try {
    const parsed = JSON.parse(page.content);

    function applyToElement(element: PageFlyElement, path: string): PageFlyElement {
      const updated: PageFlyElement = { ...element };

      if (element.text?.trim()) {
        updated.text = translations.get(`${path}.text`) ?? element.text;
      }

      if (element.props) {
        const newProps: Record<string, unknown> = { ...element.props };
        for (const key of Object.keys(element.props)) {
          if (TEXT_PROP_KEYS.has(key) && typeof element.props[key] === 'string') {
            newProps[key] = translations.get(`${path}.props.${key}`) ?? element.props[key];
          }
        }
        updated.props = newProps;
      }

      if (Array.isArray(element.children)) {
        updated.children = element.children.map((child, i) =>
          applyToElement(child, `${path}[${i}]`)
        );
      }

      return updated;
    }

    const root = Array.isArray(parsed)
      ? parsed.map((el: PageFlyElement, i: number) => applyToElement(el, `root[${i}]`))
      : applyToElement(parsed, 'root');

    return JSON.stringify(root);
  } catch {
    let result = page.content;
    const segments = extractPageFlyContent(page);
    translations.forEach((translated, key) => {
      const segment = segments.find((s) => s.key === key);
      if (segment) {
        result = result.replace(segment.text, translated);
      }
    });
    return result;
  }
}

/**
 * Translate a PageFly page for a target locale.
 * Replace the placeholder translations with a real translation engine in production.
 */
export async function translatePageFlyPage(
  page: PageFlyPage,
  targetLocale: string
): Promise<PageFlyTranslationResult> {
  const segments = extractPageFlyContent(page);

  const translationMap = new Map<string, string>(
    segments.map((s) => [s.key, `[${targetLocale}] ${s.text}`])
  );

  const translatedContent = applyPageFlyTranslations(page, translationMap, targetLocale);

  return { pageId: page.pageId, locale: targetLocale, segments, translatedContent };
}
