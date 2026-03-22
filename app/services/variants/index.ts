/**
 * Product Variants Service
 * T0014: Product Variants
 * T0016: Product Options
 */

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  options: Record<string, string>;
  images: string[];
  barcode?: string;
  weight?: number;
  weightUnit: 'kg' | 'g' | 'lb' | 'oz';
  requiresShipping: boolean;
  taxable: boolean;
}

export interface ProductOption {
  id: string;
  name: string;
  nameAr?: string;
  position: number;
  values: OptionValue[];
  swatchType?: 'color' | 'image' | 'text';
}

export interface OptionValue {
  id: string;
  value: string;
  valueAr?: string;
  swatch?: string; // Color hex or image URL
  image?: string;
}

// Common options for RTL markets
export const COMMON_OPTIONS: ProductOption[] = [
  {
    id: 'size',
    name: 'Size',
    nameAr: 'المقاس',
    position: 1,
    swatchType: 'text',
    values: [
      { id: 'xs', value: 'XS', valueAr: 'XS' },
      { id: 's', value: 'S', valueAr: 'S' },
      { id: 'm', value: 'M', valueAr: 'M' },
      { id: 'l', value: 'L', valueAr: 'L' },
      { id: 'xl', value: 'XL', valueAr: 'XL' },
      { id: 'xxl', value: '2XL', valueAr: '2XL' },
      { id: 'xxxl', value: '3XL', valueAr: '3XL' },
      { id: 'xxxxl', value: '4XL', valueAr: '4XL' },
    ],
  },
  {
    id: 'color',
    name: 'Color',
    nameAr: 'اللون',
    position: 2,
    swatchType: 'color',
    values: [
      { id: 'black', value: 'Black', valueAr: 'أسود', swatch: '#000000' },
      { id: 'white', value: 'White', valueAr: 'أبيض', swatch: '#FFFFFF' },
      { id: 'navy', value: 'Navy', valueAr: 'كحلي', swatch: '#000080' },
      { id: 'beige', value: 'Beige', valueAr: 'بيج', swatch: '#F5F5DC' },
      { id: 'brown', value: 'Brown', valueAr: 'بني', swatch: '#8B4513' },
      { id: 'grey', value: 'Grey', valueAr: 'رمادي', swatch: '#808080' },
    ],
  },
  {
    id: 'length',
    name: 'Length',
    nameAr: 'الطول',
    position: 3,
    swatchType: 'text',
    values: [
      { id: 'short', value: 'Short', valueAr: 'قصير' },
      { id: 'regular', value: 'Regular', valueAr: 'عادي' },
      { id: 'long', value: 'Long', valueAr: 'طويل' },
      { id: 'maxi', value: 'Maxi', valueAr: 'ماكسي' },
    ],
  },
  {
    id: 'modesty',
    name: 'Modesty Level',
    nameAr: 'مستوى الاحتشام',
    position: 4,
    swatchType: 'text',
    values: [
      { id: 'conservative', value: 'Conservative', valueAr: 'محافظ' },
      { id: 'moderate', value: 'Moderate', valueAr: 'معتدل' },
      { id: 'casual', value: 'Casual', valueAr: 'عصري' },
    ],
  },
];

// Generate variant combinations
export function generateVariants(
  options: ProductOption[]
): Array<Record<string, string>> {
  if (options.length === 0) return [];
  
  const combinations: Array<Record<string, string>> = [];
  
  function combine(
    current: Record<string, string>,
    optionIndex: number
  ): void {
    if (optionIndex === options.length) {
      combinations.push({ ...current });
      return;
    }
    
    const option = options[optionIndex];
    for (const value of option.values) {
      current[option.name] = value.value;
      combine(current, optionIndex + 1);
    }
  }
  
  combine({}, 0);
  return combinations;
}

// Generate SKU from variant
export function generateSKU(
  baseSKU: string,
  options: Record<string, string>
): string {
  const optionCodes = Object.entries(options)
    .map(([key, value]) => {
      const code = value.substring(0, 2).toUpperCase();
      return code;
    })
    .join('-');
  
  return `${baseSKU}-${optionCodes}`;
}

// Select variant by options
export function selectVariant(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>
): ProductVariant | null {
  return variants.find((variant) => {
    return Object.entries(selectedOptions).every(
      ([key, value]) => variant.options[key] === value
    );
  }) || null;
}

// Check if variant is available
export function isVariantAvailable(
  variant: ProductVariant,
  selectedOptions: Record<string, string>
): boolean {
  const matches = Object.entries(selectedOptions).every(
    ([key, value]) => variant.options[key] === value
  );
  
  return matches && variant.inventory > 0;
}

// Get available options for a variant selection
export function getAvailableOptions(
  variants: ProductVariant[],
  selectedOptions: Record<string, string>,
  optionName: string
): string[] {
  const available = new Set<string>();
  
  for (const variant of variants) {
    const matches = Object.entries(selectedOptions).every(
      ([key, value]) => key === optionName || variant.options[key] === value
    );
    
    if (matches && variant.inventory > 0) {
      available.add(variant.options[optionName]);
    }
  }
  
  return Array.from(available);
}

// Price range for variants
export function getPriceRange(
  variants: ProductVariant[]
): { min: number; max: number } | null {
  if (variants.length === 0) return null;
  
  const prices = variants.map((v) => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

// Inventory management
export function getTotalInventory(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + v.inventory, 0);
}

export function isLowStock(variant: ProductVariant, threshold: number = 5): boolean {
  return variant.inventory > 0 && variant.inventory < threshold;
}

export function isOutOfStock(variant: ProductVariant): boolean {
  return variant.inventory === 0;
}

// Swatch helpers
export function getSwatchColor(
  option: ProductOption,
  valueId: string
): string | null {
  const value = option.values.find((v) => v.id === valueId);
  return value?.swatch || null;
}

// Export all
export * from './constants';
