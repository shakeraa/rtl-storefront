/**
 * Custom RTL CSS Override Service
 * T0055: RTL Custom CSS Override
 */

export interface CSSOverride {
  id: string;
  shopId: string;
  themeId?: string;
  name: string;
  css: string;
  isActive: boolean;
  appliesTo: 'all' | 'rtl' | 'ltr';
  createdAt: Date;
  updatedAt: Date;
}

export interface CSSValidationResult {
  valid: boolean;
  errors: CSSValidationError[];
  warnings: CSSValidationWarning[];
}

export interface CSSValidationError {
  line: number;
  column: number;
  message: string;
}

export interface CSSValidationWarning {
  line: number;
  message: string;
}

// Default RTL CSS template
export const DEFAULT_RTL_CSS = `/* RTL Custom CSS Overrides */

/* Flip layout direction */
[dir="rtl"] .product-grid {
  direction: rtl;
}

/* Adjust margins for RTL */
[dir="rtl"] .product-card {
  margin-right: 0;
  margin-left: 20px;
}

/* Flip icons and arrows */
[dir="rtl"] .icon-arrow-right {
  transform: scaleX(-1);
}

/* Adjust text alignment */
[dir="rtl"] .product-title {
  text-align: right;
}

/* Fix absolute positioning */
[dir="rtl"] .badge {
  right: auto;
  left: 10px;
}
`;

// Storage
const cssOverrides: Map<string, CSSOverride> = new Map();

/**
 * Validate CSS
 */
export function validateCSS(css: string): CSSValidationResult {
  const errors: CSSValidationError[] = [];
  const warnings: CSSValidationWarning[] = [];

  const lines = css.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for unclosed braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    
    // Basic validation (in production, use a proper CSS parser)
    if (line.includes('{') && !line.includes('}')) {
      // Opening brace - OK
    }

    if (line.includes('!important') && line.includes('[dir="rtl"]')) {
      warnings.push({
        line: lineNum,
        message: 'Avoid !important with [dir="rtl"] selectors when possible',
      });
    }

    // Check for common RTL issues
    if (line.includes('float:') && !line.includes('[dir="rtl"]')) {
      warnings.push({
        line: lineNum,
        message: 'Float usage should consider RTL contexts',
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create CSS override
 */
export function createCSSOverride(
  shopId: string,
  name: string,
  css: string,
  options: { themeId?: string; appliesTo?: CSSOverride['appliesTo'] } = {}
): CSSOverride {
  const override: CSSOverride = {
    id: `css_${Date.now()}`,
    shopId,
    themeId: options.themeId,
    name,
    css,
    isActive: true,
    appliesTo: options.appliesTo || 'rtl',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  cssOverrides.set(override.id, override);
  return override;
}

/**
 * Get CSS override
 */
export function getCSSOverride(id: string): CSSOverride | undefined {
  return cssOverrides.get(id);
}

/**
 * Get all overrides for a shop
 */
export function getShopOverrides(shopId: string): CSSOverride[] {
  return Array.from(cssOverrides.values()).filter((o) => o.shopId === shopId);
}

/**
 * Get active overrides for a shop
 */
export function getActiveOverrides(
  shopId: string,
  direction: 'rtl' | 'ltr'
): CSSOverride[] {
  return getShopOverrides(shopId).filter(
    (o) =>
      o.isActive &&
      (o.appliesTo === 'all' || o.appliesTo === direction)
  );
}

/**
 * Update CSS override
 */
export function updateCSSOverride(
  id: string,
  updates: Partial<Pick<CSSOverride, 'name' | 'css' | 'isActive' | 'appliesTo'>>
): CSSOverride | null {
  const override = cssOverrides.get(id);
  if (!override) return null;

  Object.assign(override, updates, { updatedAt: new Date() });
  return override;
}

/**
 * Delete CSS override
 */
export function deleteCSSOverride(id: string): boolean {
  return cssOverrides.delete(id);
}

/**
 * Apply CSS override (merge with existing)
 */
export function applyCSSOverride(
  baseCSS: string,
  override: CSSOverride
): string {
  if (!override.isActive) return baseCSS;

  return `${baseCSS}\n\n/* Override: ${override.name} */\n${override.css}`;
}

/**
 * Reset to defaults
 */
export function resetToDefaults(shopId: string): CSSOverride {
  // Deactivate all existing
  getShopOverrides(shopId).forEach((o) => {
    o.isActive = false;
  });

  // Create default override
  return createCSSOverride(shopId, 'Default RTL Styles', DEFAULT_RTL_CSS);
}

/**
 * Preview CSS (with basic processing)
 */
export function previewCSS(css: string, direction: 'rtl' | 'ltr'): string {
  // Wrap CSS in direction context
  if (direction === 'rtl') {
    return `[dir="rtl"] {\n${css}\n}`;
  }
  return css;
}

/**
 * Format CSS (basic prettification)
 */
export function formatCSS(css: string): string {
  return css
    .replace(/\{/g, ' {\n  ')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n  ')
    .replace(/\n  \n}/g, '\n}')
    .trim();
}

/**
 * Minify CSS
 */
export function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .replace(/;\s*\}/g, '}')          // Remove last semicolon
    .trim();
}

/**
 * Check if CSS contains RTL-specific rules
 */
export function hasRTLRules(css: string): boolean {
  return /\[dir\s*=\s*["']rtl["']\]/.test(css);
}

/**
 * Extract RTL-specific rules
 */
export function extractRTLRules(css: string): string {
  const rtlRules: string[] = [];
  const regex = /\[dir\s*=\s*["']rtl["']\][^{]*\{[^}]*\}/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    rtlRules.push(match[0]);
  }

  return rtlRules.join('\n\n');
}
