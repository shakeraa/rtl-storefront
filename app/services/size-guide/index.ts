/**
 * Size Guide Service
 * T0012: Size Guide
 */

export interface SizeGuide {
  id: string;
  name: string;
  nameAr: string;
  category: 'clothing' | 'shoes' | 'accessories' | 'hijab';
  unit: 'cm' | 'inch';
  measurements: MeasurementDefinition[];
  sizes: SizeRow[];
  notes?: string;
  notesAr?: string;
}

export interface MeasurementDefinition {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  howToMeasure?: string;
  howToMeasureAr?: string;
}

export interface SizeRow {
  size: string;
  sizeAr: string;
  measurements: Record<string, number>; // measurementId -> value
}

// Standard clothing measurements
export const CLOTHING_MEASUREMENTS: MeasurementDefinition[] = [
  {
    id: 'bust',
    name: 'Bust',
    nameAr: 'الصدر',
    description: 'Measure around the fullest part of your bust',
    descriptionAr: 'قس حول أعرض جزء من صدرك',
    howToMeasure: 'Keep measuring tape parallel to floor',
    howToMeasureAr: 'حافظ على شريط القياس موازياً للأرض',
  },
  {
    id: 'waist',
    name: 'Waist',
    nameAr: 'الخصر',
    description: 'Measure around your natural waistline',
    descriptionAr: 'قس حول خصرك الطبيعي',
    howToMeasure: 'Bend to one side to find natural waist',
    howToMeasureAr: 'انحنِ جانباً للعثور على الخصر الطبيعي',
  },
  {
    id: 'hips',
    name: 'Hips',
    nameAr: 'الأرداف',
    description: 'Measure around the fullest part of your hips',
    descriptionAr: 'قس حول أعرض جزء من أردافك',
    howToMeasure: 'Stand with feet together',
    howToMeasureAr: 'قف معاً القدمين',
  },
  {
    id: 'length',
    name: 'Length',
    nameAr: 'الطول',
    description: 'Measure from shoulder to desired length',
    descriptionAr: 'قس من الكتف إلى الطول المطلوب',
    howToMeasure: 'Start at highest point of shoulder',
    howToMeasureAr: 'ابدأ من أعلى نقطة في الكتف',
  },
  {
    id: 'sleeve',
    name: 'Sleeve Length',
    nameAr: 'طول الكم',
    description: 'Measure from shoulder to wrist',
    descriptionAr: 'قس من الكتف إلى المعصم',
    howToMeasure: 'Arm slightly bent',
    howToMeasureAr: 'الذراع منحنية قليلاً',
  },
  {
    id: 'shoulder',
    name: 'Shoulder Width',
    nameAr: 'عرض الكتف',
    description: 'Measure across back from shoulder to shoulder',
    descriptionAr: 'قس عبر الظهر من كتف لكتف',
  },
];

// Abaya size guide (GCC/MENA sizing)
export const ABAYA_SIZE_GUIDE: SizeGuide = {
  id: 'abaya-gcc',
  name: 'Abaya Size Guide',
  nameAr: 'دليل مقاس العبايات',
  category: 'clothing',
  unit: 'cm',
  measurements: [
    { id: 'bust', name: 'Bust', nameAr: 'الصدر' },
    { id: 'waist', name: 'Waist', nameAr: 'الخصر' },
    { id: 'hips', name: 'Hips', nameAr: 'الأرداف' },
    { id: 'length', name: 'Length', nameAr: 'الطول' },
    { id: 'sleeve', name: 'Sleeve', nameAr: 'الكم' },
  ],
  sizes: [
    { size: 'XS', sizeAr: 'XS', measurements: { bust: 86, waist: 70, hips: 92, length: 138, sleeve: 58 } },
    { size: 'S', sizeAr: 'S', measurements: { bust: 92, waist: 76, hips: 98, length: 140, sleeve: 59 } },
    { size: 'M', sizeAr: 'M', measurements: { bust: 98, waist: 82, hips: 104, length: 142, sleeve: 60 } },
    { size: 'L', sizeAr: 'L', measurements: { bust: 106, waist: 90, hips: 112, length: 144, sleeve: 61 } },
    { size: 'XL', sizeAr: 'XL', measurements: { bust: 114, waist: 98, hips: 120, length: 146, sleeve: 62 } },
    { size: '2XL', sizeAr: '2XL', measurements: { bust: 122, waist: 106, hips: 128, length: 148, sleeve: 63 } },
    { size: '3XL', sizeAr: '3XL', measurements: { bust: 130, waist: 114, hips: 136, length: 150, sleeve: 64 } },
    { size: '4XL', sizeAr: '4XL', measurements: { bust: 138, waist: 122, hips: 144, length: 152, sleeve: 65 } },
  ],
  notes: 'Abayas are designed for loose fit. For modest coverage, size up.',
  notesAr: 'العبايات مصممة للقصة الفضفاضة. للتغطية المحتشمة، اختر مقاساً أكبر.',
};

// Hijab size guide
export const HIJAB_SIZE_GUIDE: SizeGuide = {
  id: 'hijab',
  name: 'Hijab Size Guide',
  nameAr: 'دليل مقاس الحجاب',
  category: 'hijab',
  unit: 'cm',
  measurements: [
    { id: 'length', name: 'Length', nameAr: 'الطول' },
    { id: 'width', name: 'Width', nameAr: 'العرض' },
  ],
  sizes: [
    { size: 'Small', sizeAr: 'صغير', measurements: { length: 110, width: 110 } },
    { size: 'Medium', sizeAr: 'متوسط', measurements: { length: 150, width: 150 } },
    { size: 'Large', sizeAr: 'كبير', measurements: { length: 180, width: 70 } },
    { size: 'Extra Large', sizeAr: 'كبير جداً', measurements: { length: 200, width: 100 } },
  ],
};

// Shoe size conversion
export const SHOE_SIZE_GUIDE: SizeGuide = {
  id: 'shoes',
  name: 'Shoe Size Guide',
  nameAr: 'دليل مقاس الأحذية',
  category: 'shoes',
  unit: 'cm',
  measurements: [
    { id: 'foot_length', name: 'Foot Length', nameAr: 'طول القدم' },
  ],
  sizes: [
    { size: '36', sizeAr: '٣٦', measurements: { foot_length: 23 } },
    { size: '37', sizeAr: '٣٧', measurements: { foot_length: 23.5 } },
    { size: '38', sizeAr: '٣٨', measurements: { foot_length: 24 } },
    { size: '39', sizeAr: '٣٩', measurements: { foot_length: 24.5 } },
    { size: '40', sizeAr: '٤٠', measurements: { foot_length: 25 } },
    { size: '41', sizeAr: '٤١', measurements: { foot_length: 25.5 } },
    { size: '42', sizeAr: '٤٢', measurements: { foot_length: 26 } },
    { size: '43', sizeAr: '٤٣', measurements: { foot_length: 26.5 } },
  ],
};

// Size conversion between regions
export const SIZE_CONVERSION: Record<string, Record<string, string[]>> = {
  'abaya-gcc': {
    GCC: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    US: ['0-2', '4-6', '8-10', '12-14', '16-18', '20-22', '24-26', '28-30'],
    UK: ['4-6', '8-10', '12-14', '16-18', '20-22', '24-26', '28-30', '32-34'],
    EU: ['32-34', '36-38', '40-42', '44-46', '48-50', '52-54', '56-58', '60-62'],
  },
};

// Find size by measurement
export function findSizeByMeasurement(
  guide: SizeGuide,
  measurementId: string,
  value: number,
  tolerance: number = 2
): string | null {
  for (const size of guide.sizes) {
    const sizeValue = size.measurements[measurementId];
    if (sizeValue && Math.abs(sizeValue - value) <= tolerance) {
      return size.size;
    }
  }
  return null;
}

// Recommend size based on measurements
export function recommendSize(
  guide: SizeGuide,
  userMeasurements: Record<string, number>
): { size: string; confidence: 'high' | 'medium' | 'low'; notes: string[] } {
  const notes: string[] = [];
  const matches: Map<string, number> = new Map();
  
  for (const size of guide.sizes) {
    let matchCount = 0;
    let totalChecked = 0;
    
    for (const [measurementId, userValue] of Object.entries(userMeasurements)) {
      const sizeValue = size.measurements[measurementId];
      if (sizeValue !== undefined) {
        totalChecked++;
        // Allow 2cm tolerance
        if (Math.abs(sizeValue - userValue) <= 2) {
          matchCount++;
        }
      }
    }
    
    if (totalChecked > 0) {
      const score = matchCount / totalChecked;
      matches.set(size.size, score);
    }
  }
  
  // Find best match
  let bestSize = '';
  let bestScore = 0;
  
  for (const [size, score] of matches) {
    if (score > bestScore) {
      bestScore = score;
      bestSize = size;
    }
  }
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (bestScore >= 0.8) confidence = 'high';
  else if (bestScore >= 0.5) confidence = 'medium';
  
  if (confidence === 'low') {
    notes.push('Consider measuring again or contacting support for help');
  }
  
  return { size: bestSize, confidence, notes };
}

// Convert measurements
export function convertMeasurement(
  value: number,
  from: 'cm' | 'inch',
  to: 'cm' | 'inch'
): number {
  if (from === to) return value;
  
  if (from === 'cm' && to === 'inch') {
    return Math.round(value * 0.393701 * 10) / 10;
  }
  
  return Math.round(value * 2.54 * 10) / 10;
}

// Get size guide by category
export function getSizeGuideByCategory(category: SizeGuide['category']): SizeGuide[] {
  const guides = [ABAYA_SIZE_GUIDE, HIJAB_SIZE_GUIDE, SHOE_SIZE_GUIDE];
  return guides.filter((g) => g.category === category);
}

// Export all
export * from './constants';
