/**
 * RTL Fashion Service
 * T0006: RTL Fashion Features
 */

export interface ModestyLevel {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  coverage: 'high' | 'medium' | 'low';
}

export interface SizeProfile {
  region: 'GCC' | 'MENA' | 'EU' | 'US' | 'UK';
  size: string;
  measurements: {
    bust?: number;
    waist?: number;
    hips?: number;
    length?: number;
    sleeve?: number;
  };
}

export interface FashionRecommendation {
  id: string;
  category: string;
  items: FashionItem[];
  forOccasion?: string;
  forBodyType?: string;
}

export interface FashionItem {
  id: string;
  name: string;
  category: 'abaya' | 'kaftan' | 'jalabiya' | 'shalwar' | 'kurta' | 'hijab' | 'dress' | 'modest';
  modestyLevel: string;
  sizes: SizeProfile[];
  colors: string[];
  fabrics: string[];
  priceRange: { min: number; max: number };
  images: string[];
  features: string[];
}

// Modesty levels
export const MODESTY_LEVELS: ModestyLevel[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    nameArabic: 'محافظ',
    description: 'Full coverage with loose fit',
    coverage: 'high',
  },
  {
    id: 'moderate',
    name: 'Moderate',
    nameArabic: 'معتدل',
    description: 'Modest coverage with modern style',
    coverage: 'medium',
  },
  {
    id: 'casual',
    name: 'Contemporary',
    nameArabic: 'عصري',
    description: 'Modest elements with casual style',
    coverage: 'low',
  },
];

// Regional size charts
export const REGIONAL_SIZES: Record<string, string[]> = {
  GCC: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  MENA: ['36', '38', '40', '42', '44', '46', '48', '50', '52', '54'],
  EU: ['32', '34', '36', '38', '40', '42', '44', '46', '48'],
  US: ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18'],
  UK: ['4', '6', '8', '10', '12', '14', '16', '18', '20'],
};

// Size conversion
export function convertSize(size: string, from: string, to: string): string | null {
  const conversionTable: Record<string, Record<string, string>> = {
    'US-GCC': { '0': 'XS', '2': 'XS', '4': 'XS', '6': 'S', '8': 'M', '10': 'M', '12': 'L', '14': 'L', '16': 'XL', '18': '2XL' },
    'GCC-US': { 'XS': '0-2', 'S': '4-6', 'M': '8-10', 'L': '12-14', 'XL': '16', '2XL': '18' },
    'EU-GCC': { '32': 'XS', '34': 'XS', '36': 'S', '38': 'S', '40': 'M', '42': 'M', '44': 'L', '46': 'L', '48': 'XL' },
    'GCC-EU': { 'XS': '32-34', 'S': '36-38', 'M': '40-42', 'L': '44-46', 'XL': '48' },
  };
  
  const key = `${from}-${to}`;
  return conversionTable[key]?.[size] || null;
}

// Body type recommendations
export function getRecommendationsForBodyType(
  bodyType: 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted-triangle',
  modestyLevel: string
): FashionRecommendation {
  const recommendations: Record<string, FashionRecommendation> = {
    pear: {
      id: 'pear-modest',
      category: 'Bottom Heavy',
      items: [],
      forBodyType: 'pear',
    },
    apple: {
      id: 'apple-modest',
      category: 'Round',
      items: [],
      forBodyType: 'apple',
    },
    hourglass: {
      id: 'hourglass-modest',
      category: 'Balanced',
      items: [],
      forBodyType: 'hourglass',
    },
    rectangle: {
      id: 'rectangle-modest',
      category: 'Straight',
      items: [],
      forBodyType: 'rectangle',
    },
    'inverted-triangle': {
      id: 'inverted-modest',
      category: 'Top Heavy',
      items: [],
      forBodyType: 'inverted-triangle',
    },
  };
  
  return recommendations[bodyType];
}

// Hijab styling recommendations
export interface HijabStyle {
  id: string;
  name: string;
  nameEn: string;
  fabric: string;
  coverage: 'full' | 'standard' | 'minimal';
  occasions: string[];
  steps: string[];
}

export const HIJAB_STYLES: HijabStyle[] = [
  {
    id: 'classic',
    name: 'الكلاسيكية',
    nameEn: 'Classic',
    fabric: 'cotton',
    coverage: 'full',
    occasions: ['daily', 'work'],
    steps: [
      'Place scarf over head with one side longer',
      'Pin under chin',
      'Wrap longer side around head',
      'Secure with pin',
    ],
  },
  {
    id: 'turban',
    name: 'التوربان',
    nameEn: 'Turban',
    fabric: 'jersey',
    coverage: 'standard',
    occasions: ['casual', 'sport'],
    steps: [
      'Place cap on head',
      'Wrap scarf around cap',
      'Cross at front',
      'Tuck ends at back',
    ],
  },
  {
    id: 'layered',
    name: 'الطبقات',
    nameEn: 'Layered',
    fabric: 'chiffon',
    coverage: 'full',
    occasions: ['formal', 'wedding'],
    steps: [
      'Use volumizing cap',
      'Place first layer',
      'Add second layer draped',
      'Pin decoratively',
    ],
  },
];

// Abaya customization options
export interface AbayaCustomization {
  id: string;
  category: 'fabric' | 'color' | 'embellishment' | 'fit';
  options: {
    id: string;
    name: string;
    price: number;
    image?: string;
  }[];
}

export const ABAYA_CUSTOMIZATIONS: AbayaCustomization[] = [
  {
    id: 'fabric',
    category: 'fabric',
    options: [
      { id: 'crepe', name: 'Crepe', price: 0 },
      { id: 'nida', name: 'Nida', price: 50 },
      { id: 'kashibo', name: 'Kashibo', price: 80 },
      { id: 'silk', name: 'Silk', price: 150 },
    ],
  },
  {
    id: 'color',
    category: 'color',
    options: [
      { id: 'black', name: 'Black', price: 0 },
      { id: 'navy', name: 'Navy', price: 0 },
      { id: 'grey', name: 'Grey', price: 0 },
      { id: 'brown', name: 'Brown', price: 10 },
    ],
  },
  {
    id: 'embellishment',
    category: 'embellishment',
    options: [
      { id: 'plain', name: 'Plain', price: 0 },
      { id: 'embroidery', name: 'Embroidery', price: 100 },
      { id: 'crystals', name: 'Crystals', price: 200 },
      { id: 'beading', name: 'Beading', price: 250 },
    ],
  },
];

// Calculate size based on measurements
export function calculateSize(
  measurements: { bust: number; waist: number; hips: number },
  region: string
): string {
  // This is a simplified calculation
  // Real implementation would use detailed size charts
  
  const bustToWaist = measurements.bust - measurements.waist;
  const hipsToWaist = measurements.hips - measurements.waist;
  
  if (region === 'GCC' || region === 'MENA') {
    if (measurements.bust < 85) return 'S';
    if (measurements.bust < 95) return 'M';
    if (measurements.bust < 105) return 'L';
    return 'XL';
  }
  
  return 'M'; // Default
}

// Virtual fitting room
export interface FittingRoomConfig {
  height: number;
  weight: number;
  bodyType: string;
  preferredFit: 'loose' | 'fitted' | 'oversized';
}

export function getFittingRecommendation(
  item: FashionItem,
  config: FittingRoomConfig
): { recommendedSize: string; notes: string[] } {
  const notes: string[] = [];
  
  // Height-based recommendations
  if (config.height > 170) {
    notes.push('Consider tall/lengthy option for better coverage');
  }
  
  // Fit preference
  if (config.preferredFit === 'loose') {
    notes.push('Size up for looser fit');
  } else if (config.preferredFit === 'fitted') {
    notes.push('True to size for fitted look');
  }
  
  const recommendedSize = calculateSize(
    { bust: 90, waist: 70, hips: 95 }, // Would come from config
    'GCC'
  );
  
  return { recommendedSize, notes };
}

// Export all
export * from './constants';
