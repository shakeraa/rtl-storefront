/**
 * Arabic Calligraphy Typography Library
 * Traditional and classical Arabic calligraphy styles for hero sections and promotions
 * 
 * This module provides authentic Arabic calligraphy styles (خطوط عربية)
 * with proper Arabic names, font recommendations, and metadata.
 */

export type CalligraphyStyleId = 
  | 'naskh'
  | 'thuluth'
  | 'diwani'
  | 'ruqaa'
  | 'kufi'
  | 'nastaaliq'
  | 'maghrebi'
  | 'diwani-jali'
  | 'thuluth-jali'
  | 'muhaqqaq';

export type CalligraphyEra = 'classical' | 'ottoman' | 'modern' | 'maghrebi';
export type CalligraphyUseCase = 'hero-section' | 'logo' | 'quran' | 'poetry' | 'decorative' | 'headers' | 'certificates';

export interface CalligraphyStyle {
  id: CalligraphyStyleId;
  name: {
    arabic: string;
    english: string;
    transliteration: string;
  };
  description: {
    arabic: string;
    english: string;
  };
  era: CalligraphyEra;
  origin: string;
  characteristics: string[];
  useCases: CalligraphyUseCase[];
  fonts: CalligraphyFont[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  popularity: 'common' | 'popular' | 'rare' | 'specialized';
  sampleText: string;
}

export interface CalligraphyFont {
  name: string;
  provider: 'google' | 'adobe' | 'local' | 'custom';
  url: string;
  weights: number[];
  recommended: boolean;
  notes?: string;
}

export interface StyleMetadata {
  letterforms: {
    alif: string;
    baa: string;
    jeem: string;
    dal: string;
  };
  proportions: {
    rhombicDot: number; // Relative size of rhombic dot
    letterSpacing: 'tight' | 'normal' | 'wide';
    lineHeight: number;
  };
  decorativeElements: string[];
  rules: string[];
}

// =============================================================================
// CALLIGRAPHY STYLES DATABASE
// =============================================================================

export const CALLIGRAPHY_STYLES: CalligraphyStyle[] = [
  {
    id: 'naskh',
    name: {
      arabic: 'النسخ',
      english: 'Naskh',
      transliteration: 'Nasḫ',
    },
    description: {
      arabic: 'خط النسخ هو أحد أشهر الخطوط العربية وأسهلها قراءة، يُستخدم في كتب القرآن الكريم والمطبوعات',
      english: 'Naskh is one of the most famous and readable Arabic scripts, used in Quran printing and publications',
    },
    era: 'classical',
    origin: 'Baghdad, Iraq (10th century)',
    characteristics: [
      'Clear and highly readable',
      'Balanced proportions',
      'Rounded letterforms',
      'Horizontal baseline',
      'Moderate stroke contrast',
    ],
    useCases: ['quran', 'body-text', 'books', 'general-purpose'],
    fonts: [
      {
        name: 'Amiri',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: true,
        notes: 'Classical Naskh perfect for Quran and traditional texts',
      },
      {
        name: 'Scheherazade New',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: true,
        notes: 'Excellent for Quranic text with full vocalization',
      },
      {
        name: 'Noto Naskh Arabic',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: false,
      },
    ],
    difficulty: 'beginner',
    popularity: 'common',
    sampleText: 'بسم الله الرحمن الرحيم',
  },
  {
    id: 'thuluth',
    name: {
      arabic: 'الثلث',
      english: 'Thuluth',
      transliteration: 'Ṯuluṯ',
    },
    description: {
      arabic: 'خط الثلث هو ملك الخطوط العربية، يتميز بجماله ورشاقته، يُستخدم في الزخارف والعناوين الكبيرة',
      english: 'Thuluth is the king of Arabic scripts, known for its beauty and elegance, used in decorations and large headings',
    },
    era: 'classical',
    origin: 'Baghdad, Iraq (11th century)',
    characteristics: [
      'Tall and elegant verticals',
      'Cursive and flowing',
      'Complex ligatures',
      'Decorative extensions',
      'One-third the height of Alif',
    ],
    useCases: ['hero-section', 'logo', 'decorative', 'headers', 'certificates'],
    fonts: [
      {
        name: 'Reem Kufi',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: false,
        notes: 'Kufi-inspired but works for Thuluth-like headings',
      },
      {
        name: 'Custom Thuluth',
        provider: 'custom',
        url: '/fonts/thuluth.woff2',
        weights: [400, 700],
        recommended: true,
        notes: 'Authentic Thuluth requires specialized calligraphic fonts',
      },
    ],
    difficulty: 'advanced',
    popularity: 'popular',
    sampleText: 'الخط العربي فن إسلامي',
  },
  {
    id: 'diwani',
    name: {
      arabic: 'الديواني',
      english: 'Diwani',
      transliteration: 'Dīwānī',
    },
    description: {
      arabic: 'الخط الديواني نشأ في الدولة العثمانية، يتميز بضم الحروف وتداخلها بشكل فني جميل',
      english: 'Diwani script originated in the Ottoman Empire, characterized by compressed and interlaced letters',
    },
    era: 'ottoman',
    origin: 'Ottoman Turkey (16th century)',
    characteristics: [
      'Slanted baseline (oblique)',
      'Letters compressed together',
      'Decorative overlapping',
      'Dense and compact',
      'Ottoman court style',
    ],
    useCases: ['decorative', 'certificates', 'logo', 'headers'],
    fonts: [
      {
        name: 'Diwani Letter',
        provider: 'custom',
        url: '/fonts/diwani-letter.woff2',
        weights: [400],
        recommended: true,
        notes: 'Standard Diwani for documents',
      },
      {
        name: 'Adobe Arabic',
        provider: 'adobe',
        url: 'https://use.typekit.net/xxxx',
        weights: [400, 700],
        recommended: false,
        notes: 'Professional Adobe font with Diwani influence',
      },
    ],
    difficulty: 'master',
    popularity: 'specialized',
    sampleText: 'حضرة السلطان العادل',
  },
  {
    id: 'ruqaa',
    name: {
      arabic: 'الرقعة',
      english: 'Ruqaa',
      transliteration: 'Ruqʿa',
    },
    description: {
      arabic: 'خط الرقعة هو الخط العثماني الشعبي، سهل وسريع الكتابة، يُستخدم في المراسلات والخط اليدوي',
      english: 'Ruqaa is the popular Ottoman script, easy and fast to write, used in correspondence and handwriting',
    },
    era: 'ottoman',
    origin: 'Ottoman Turkey (18th century)',
    characteristics: [
      'Simple and practical',
      'Flat baseline',
      'Wide horizontal strokes',
      'Connected letters',
      'Everyday handwriting style',
    ],
    useCases: ['general-purpose', 'headers', 'body-text'],
    fonts: [
      {
        name: 'Aref Ruqaa',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: true,
        notes: 'Beautiful Ruqaa style for creative headings',
      },
      {
        name: 'Rakkas',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Rakkas&display=swap',
        weights: [400],
        recommended: true,
        notes: 'Bold Ruqaa-inspired display font',
      },
    ],
    difficulty: 'intermediate',
    popularity: 'common',
    sampleText: 'السلام عليكم ورحمة الله',
  },
  {
    id: 'kufi',
    name: {
      arabic: 'الكوفي',
      english: 'Kufic',
      transliteration: 'Kūfī',
    },
    description: {
      arabic: 'الخط الكوفي هو أقدم الخطوط العربية، يتميز بزواياه الحادة وشكله الهندسي المربع',
      english: 'Kufic is the oldest Arabic script, characterized by sharp angles and square geometric forms',
    },
    era: 'classical',
    origin: 'Kufa, Iraq (7th century)',
    characteristics: [
      'Geometric and angular',
      'Square proportions',
      'Horizontal emphasis',
      'No curves',
      'Ancient mosque inscriptions',
    ],
    useCases: ['hero-section', 'logo', 'decorative', 'headers'],
    fonts: [
      {
        name: 'Reem Kufi',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: true,
        notes: 'Modern Kufic geometric style',
      },
      {
        name: 'Kufam',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Kufam:ital,wght@0,400..900;1,400..900&display=swap',
        weights: [400, 500, 600, 700, 800, 900],
        recommended: true,
        notes: 'Contemporary Kufic with wide range of weights',
      },
      {
        name: 'Noto Kufi Arabic',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap',
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        recommended: false,
      },
    ],
    difficulty: 'intermediate',
    popularity: 'popular',
    sampleText: 'الله أكبر',
  },
  {
    id: 'nastaaliq',
    name: {
      arabic: 'النستعليق',
      english: 'Nastaaliq',
      transliteration: 'Nastaʿlīq',
    },
    description: {
      arabic: 'الخط النستعليق هو خط الفارسية والأردو، يتميز بميلانه إلى اليسار وتراكب الحروف',
      english: 'Nastaaliq is the Persian and Urdu script, characterized by leftward slant and letter stacking',
    },
    era: 'classical',
    origin: 'Persia (14th-15th century)',
    characteristics: [
      'Cursive and flowing',
      'Leftward slant',
      'Letters descend below baseline',
      'Stacked composition',
      'Persian poetry style',
    ],
    useCases: ['poetry', 'decorative', 'headers', 'logo'],
    fonts: [
      {
        name: 'Noto Nastaliq Urdu',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: true,
        notes: 'Authentic Nastaaliq for Persian/Urdu content',
      },
      {
        name: 'Amiri',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: false,
        notes: 'Can approximate Nastaaliq for Arabic text',
      },
    ],
    difficulty: 'master',
    popularity: 'specialized',
    sampleText: 'گلستان سعدی',
  },
  {
    id: 'maghrebi',
    name: {
      arabic: 'المغربي',
      english: 'Maghrebi',
      transliteration: 'Maghribī',
    },
    description: {
      arabic: 'الخط المغربي (الأندلسي) هو خط شمال أفريقيا والأندلس، يتميز بنقاطه المسطحة والحروف المفتوحة',
      english: 'Maghrebi (Andalusi) script is the North African and Andalusian style with flat dots and open letters',
    },
    era: 'maghrebi',
    origin: 'Andalusia & Maghreb (10th century)',
    characteristics: [
      'Flat dots (sukun) instead of rhombic',
      'Open letter forms',
      'Distinctive fa and qaf',
      'Flowing curves',
      'North African heritage',
    ],
    useCases: ['decorative', 'poetry', 'headers'],
    fonts: [
      {
        name: 'Andalus',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Andalus&display=swap',
        weights: [400],
        recommended: true,
        notes: 'Traditional Maghrebi/Andalusi style',
      },
      {
        name: 'Maghrebi Custom',
        provider: 'custom',
        url: '/fonts/maghrebi.woff2',
        weights: [400],
        recommended: false,
      },
    ],
    difficulty: 'advanced',
    popularity: 'rare',
    sampleText: 'أدب الأندلس',
  },
  {
    id: 'diwani-jali',
    name: {
      arabic: 'الديواني الجلي',
      english: 'Diwani Jali',
      transliteration: 'Dīwānī Jālī',
    },
    description: {
      arabic: 'الديواني الجلي هو النوع المزخرف من الديواني، يحتوي على فراغات داخل الحروف وزخارف إضافية',
      english: 'Diwani Jali is the ornate version of Diwani with hollow spaces in letters and additional decorations',
    },
    era: 'ottoman',
    origin: 'Ottoman Turkey (16th century)',
    characteristics: [
      'Hollow spaces within letters',
      'Extremely decorative',
      'Complex interlacing',
      'Royal Ottoman style',
      'Most ornate Arabic script',
    ],
    useCases: ['decorative', 'certificates', 'hero-section'],
    fonts: [
      {
        name: 'Diwani Jali Custom',
        provider: 'custom',
        url: '/fonts/diwani-jali.woff2',
        weights: [400],
        recommended: true,
        notes: 'Ornate Diwani requires specialized calligraphic fonts',
      },
    ],
    difficulty: 'master',
    popularity: 'rare',
    sampleText: 'السلطان محمد الفاتح',
  },
  {
    id: 'thuluth-jali',
    name: {
      arabic: 'الثلث الجلي',
      english: 'Thuluth Jali',
      transliteration: 'Ṯuluṯ Jālī',
    },
    description: {
      arabic: 'الثلث الجلي هو الثلث المزخرف، يستخدم في الزخارف المعمارية والقباب والمحاريب',
      english: 'Thuluth Jali is the ornate Thuluth used in architectural decorations, domes, and mihrabs',
    },
    era: 'classical',
    origin: 'Mamluk Egypt (13th-16th century)',
    characteristics: [
      'Architectural scale',
      'Interlaced letters',
      'Vegetal decorations',
      'Islamic geometric integration',
      'Monumental style',
    ],
    useCases: ['decorative', 'hero-section', 'logo'],
    fonts: [
      {
        name: 'Thuluth Jali Custom',
        provider: 'custom',
        url: '/fonts/thuluth-jali.woff2',
        weights: [400],
        recommended: true,
        notes: 'Architectural Thuluth for large displays',
      },
    ],
    difficulty: 'master',
    popularity: 'specialized',
    sampleText: 'لا إله إلا الله',
  },
  {
    id: 'muhaqqaq',
    name: {
      arabic: 'المحقق',
      english: 'Muhaqqaq',
      transliteration: 'Muḥaqqaq',
    },
    description: {
      arabic: 'خط المحقق من أقدم وأعرض الخطوط، يستخدم في المصاحف الكبيرة والكتب المهمة',
      english: 'Muhaqqaq is one of the oldest and widest scripts, used in large Qurans and important books',
    },
    era: 'classical',
    origin: 'Abbasid Baghdad (9th-10th century)',
    characteristics: [
      'Wide horizontal strokes',
      'Distinguished by alif length',
      'Majestic proportions',
      'Early Quranic script',
      'Bold and commanding',
    ],
    useCases: ['quran', 'hero-section', 'decorative', 'certificates'],
    fonts: [
      {
        name: 'Scheherazade New',
        provider: 'google',
        url: 'https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap',
        weights: [400, 700],
        recommended: true,
        notes: 'Large x-height suitable for Muhaqqaq style',
      },
      {
        name: 'Amiri Quran',
        provider: 'custom',
        url: '/fonts/amiri-quran.woff2',
        weights: [400],
        recommended: true,
        notes: 'Amiri variant optimized for Quranic text',
      },
    ],
    difficulty: 'advanced',
    popularity: 'rare',
    sampleText: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
  },
];

// =============================================================================
// STYLE METADATA DATABASE
// =============================================================================

const STYLE_METADATA: Record<CalligraphyStyleId, StyleMetadata> = {
  naskh: {
    letterforms: {
      alif: 'Straight vertical with slight curve at top',
      baa: 'Rounded bowl below baseline',
      jeem: 'Circular shape with dot inside',
      dal: 'Wide triangular shape',
    },
    proportions: {
      rhombicDot: 1.0,
      letterSpacing: 'normal',
      lineHeight: 1.8,
    },
    decorativeElements: ['simple-dots', 'vowel-marks', 'sukun-marks'],
    rules: [
      'Maintain consistent baseline',
      'Dots placed precisely at 45°',
      'Letters should not touch unnecessarily',
    ],
  },
  thuluth: {
    letterforms: {
      alif: 'Tall vertical with hook',
      baa: 'Open bowl with descending tail',
      jeem: 'Elongated with decorative tail',
      dal: 'Triangular with extended top',
    },
    proportions: {
      rhombicDot: 1.5,
      letterSpacing: 'wide',
      lineHeight: 2.5,
    },
    decorativeElements: ['extended-ascenders', 'flourishes', 'compound-dots'],
    rules: [
      'Alif is one-third the height of composition',
      'Use decorative extensions on final letters',
      'Balance white space throughout',
    ],
  },
  diwani: {
    letterforms: {
      alif: 'Slanted with pronounced curve',
      baa: 'Compressed with overlapping',
      jeem: 'Compact with dense dot placement',
      dal: 'Wide and flattened',
    },
    proportions: {
      rhombicDot: 0.8,
      letterSpacing: 'tight',
      lineHeight: 1.6,
    },
    decorativeElements: ['letter-stacking', 'interlacing', 'crowns'],
    rules: [
      'Baseline slants at 8-10 degrees',
      'Letters should overlap where possible',
      'Use crowns on tall letters',
    ],
  },
  ruqaa: {
    letterforms: {
      alif: 'Short with slight curve',
      baa: 'Wide bowl with flat bottom',
      jeem: 'Open top with single dot',
      dal: 'Wide and flat',
    },
    proportions: {
      rhombicDot: 1.0,
      letterSpacing: 'normal',
      lineHeight: 1.6,
    },
    decorativeElements: ['simple-connectors', 'practical-dots'],
    rules: [
      'Keep all letters on same horizontal level',
      'Minimize pen lifts',
      'Prioritize speed and readability',
    ],
  },
  kufi: {
    letterforms: {
      alif: 'Straight vertical line',
      baa: 'Square bowl shape',
      jeem: 'Angular with square dot',
      dal: 'Geometric triangle',
    },
    proportions: {
      rhombicDot: 1.2,
      letterSpacing: 'normal',
      lineHeight: 2.0,
    },
    decorativeElements: ['geometric-patterns', 'square-knots', 'arabesques'],
    rules: [
      'No curves allowed - only straight lines and angles',
      'Maintain geometric proportions',
      'Use horizontal emphasis',
    ],
  },
  nastaaliq: {
    letterforms: {
      alif: 'Slanted with ball terminal',
      baa: 'Compressed and descending',
      jeem: 'Stacked with three dots',
      dal: 'Curved and flowing',
    },
    proportions: {
      rhombicDot: 0.9,
      letterSpacing: 'tight',
      lineHeight: 2.2,
    },
    decorativeElements: ['descenders', 'shey-kas', 'stacked-letters'],
    rules: [
      'Letters descend below baseline',
      'Maintain leftward slant',
      'Stack letters vertically when possible',
    ],
  },
  maghrebi: {
    letterforms: {
      alif: 'Curved with flat top',
      baa: 'Open with flat dot',
      jeem: 'Wide with three flat dots',
      dal: 'Open and flowing',
    },
    proportions: {
      rhombicDot: 1.0,
      letterSpacing: 'normal',
      lineHeight: 1.8,
    },
    decorativeElements: ['flat-dots', 'open-forms', 'maghrebi-flourishes'],
    rules: [
      'Use flat dots instead of rhombic',
      'Keep letter forms open',
      'Emphasize curved flow',
    ],
  },
  'diwani-jali': {
    letterforms: {
      alif: 'Hollow with decorative fill',
      baa: 'Interlaced with gaps',
      jeem: 'Complex with internal spaces',
      dal: 'Ornate with geometric voids',
    },
    proportions: {
      rhombicDot: 1.0,
      letterSpacing: 'tight',
      lineHeight: 1.8,
    },
    decorativeElements: ['hollow-spaces', 'interlacing', 'crowns', 'flourishes'],
    rules: [
      'Create decorative voids within letters',
      'Maximize interlacing between letters',
      'Use crowns liberally',
    ],
  },
  'thuluth-jali': {
    letterforms: {
      alif: 'Extremely tall with vegetation',
      baa: 'Overlapping with extensions',
      jeem: 'Complex with arabesques',
      dal: 'Decorative with geometric integration',
    },
    proportions: {
      rhombicDot: 2.0,
      letterSpacing: 'wide',
      lineHeight: 3.0,
    },
    decorativeElements: ['arabesques', 'geometric-patterns', 'vegetal-motifs', 'domed-forms'],
    rules: [
      'Integrate geometric Islamic patterns',
      'Use vegetal motifs',
      'Scale for architectural use',
    ],
  },
  muhaqqaq: {
    letterforms: {
      alif: 'Very tall and straight',
      baa: 'Wide and majestic',
      jeem: 'Bold with emphasized dots',
      dal: 'Wide triangular with strong angles',
    },
    proportions: {
      rhombicDot: 1.5,
      letterSpacing: 'wide',
      lineHeight: 2.5,
    },
    decorativeElements: ['bold-strokes', 'majestic-proportions', 'quranic-markers'],
    rules: [
      'Emphasize horizontal width',
      'Make alif exceptionally tall',
      'Use for important religious texts',
    ],
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a specific calligraphy style by ID
 * @param style - The style ID
 * @returns The calligraphy style or undefined if not found
 */
export function getCalligraphyStyle(style: CalligraphyStyleId): CalligraphyStyle | undefined {
  return CALLIGRAPHY_STYLES.find((s) => s.id === style);
}

/**
 * Get all calligraphy styles with optional locale filtering
 * @param locale - Optional locale to filter and sort by relevance
 * @returns Array of calligraphy styles
 */
export function getCalligraphyStyles(locale?: string): CalligraphyStyle[] {
  const styles = [...CALLIGRAPHY_STYLES];
  
  if (locale) {
    // Sort by relevance to locale
    const localeLower = locale.toLowerCase();
    
    // Maghrebi styles more relevant for North African locales
    if (['ar-ma', 'ar-dz', 'ar-tn', 'ar-ly', 'ar-mr'].includes(localeLower)) {
      return styles.sort((a, b) => {
        if (a.id === 'maghrebi') return -1;
        if (b.id === 'maghrebi') return 1;
        return 0;
      });
    }
    
    // Persian/Urdu locales prefer Nastaaliq
    if (['fa', 'ur', 'ps'].includes(localeLower) || localeLower.startsWith('fa')) {
      return styles.sort((a, b) => {
        if (a.id === 'nastaaliq') return -1;
        if (b.id === 'nastaaliq') return 1;
        return 0;
      });
    }
    
    // Turkish locales prefer Diwani (Ottoman heritage)
    if (['tr', 'az', 'ug'].includes(localeLower) || localeLower.startsWith('tr')) {
      return styles.sort((a, b) => {
        if (a.id === 'diwani') return -1;
        if (b.id === 'diwani') return 1;
        return 0;
      });
    }
  }
  
  return styles;
}

/**
 * Get recommended font for a specific calligraphy style
 * @param style - The style ID
 * @returns The recommended font or undefined
 */
export function getFontForStyle(style: CalligraphyStyleId): CalligraphyFont | undefined {
  const calligraphyStyle = getCalligraphyStyle(style);
  if (!calligraphyStyle) return undefined;
  
  return calligraphyStyle.fonts.find((f) => f.recommended) || calligraphyStyle.fonts[0];
}

/**
 * Get all available fonts for a specific calligraphy style
 * @param style - The style ID
 * @returns Array of fonts for the style
 */
export function getAllFontsForStyle(style: CalligraphyStyleId): CalligraphyFont[] {
  const calligraphyStyle = getCalligraphyStyle(style);
  return calligraphyStyle ? calligraphyStyle.fonts : [];
}

/**
 * Get detailed metadata for a calligraphy style
 * @param style - The style ID
 * @returns Style metadata or undefined
 */
export function getStyleMetadata(style: CalligraphyStyleId): StyleMetadata | undefined {
  return STYLE_METADATA[style];
}

/**
 * Get styles filtered by use case
 * @param useCase - The use case to filter by
 * @returns Array of styles suitable for the use case
 */
export function getStylesForUseCase(useCase: CalligraphyUseCase): CalligraphyStyle[] {
  return CALLIGRAPHY_STYLES.filter((style) => 
    style.useCases.includes(useCase as any)
  );
}

/**
 * Get styles by era
 * @param era - The era to filter by
 * @returns Array of styles from that era
 */
export function getStylesByEra(era: CalligraphyEra): CalligraphyStyle[] {
  return CALLIGRAPHY_STYLES.filter((style) => style.era === era);
}

/**
 * Get styles by difficulty level
 * @param difficulty - The difficulty level
 * @returns Array of styles at that difficulty
 */
export function getStylesByDifficulty(
  difficulty: CalligraphyStyle['difficulty']
): CalligraphyStyle[] {
  return CALLIGRAPHY_STYLES.filter((style) => style.difficulty === difficulty);
}

/**
 * Get recommended styles for hero sections
 * @returns Array of styles suitable for hero sections
 */
export function getHeroStyles(): CalligraphyStyle[] {
  return CALLIGRAPHY_STYLES.filter((style) => 
    style.useCases.includes('hero-section')
  );
}

/**
 * Generate CSS font-family string for a style
 * @param style - The style ID
 * @returns CSS font-family value or empty string
 */
export function generateFontFamily(style: CalligraphyStyleId): string {
  const font = getFontForStyle(style);
  if (!font) return '';
  
  const fallback = style === 'nastaaliq' 
    ? '"Noto Nastaliq Urdu", "Traditional Arabic", serif'
    : '"Noto Sans Arabic", "Arial", sans-serif';
    
  return `"${font.name}", ${fallback}`;
}

/**
 * Get style names in both Arabic and English
 * @param style - The style ID
 * @returns Object with name translations or undefined
 */
export function getStyleNames(style: CalligraphyStyleId): 
  | { arabic: string; english: string; transliteration: string }
  | undefined {
  const calligraphyStyle = getCalligraphyStyle(style);
  return calligraphyStyle ? calligraphyStyle.name : undefined;
}

/**
 * Search styles by keyword
 * @param keyword - Search keyword
 * @returns Array of matching styles
 */
export function searchStyles(keyword: string): CalligraphyStyle[] {
  const lowerKeyword = keyword.toLowerCase();
  return CALLIGRAPHY_STYLES.filter((style) =>
    style.name.english.toLowerCase().includes(lowerKeyword) ||
    style.name.arabic.includes(keyword) ||
    style.name.transliteration.toLowerCase().includes(lowerKeyword) ||
    style.description.english.toLowerCase().includes(lowerKeyword) ||
    style.description.arabic.includes(keyword) ||
    style.characteristics.some((c) => c.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Get Google Fonts URL for all recommended fonts
 * @returns Combined Google Fonts URL
 */
export function getAllGoogleFontsUrl(): string {
  const googleFonts = CALLIGRAPHY_STYLES
    .flatMap((s) => s.fonts)
    .filter((f) => f.provider === 'google' && f.recommended);
    
  const families = googleFonts.map((f) => {
    const name = f.name.replace(/\s+/g, '+');
    const weights = f.weights.join(',');
    return `family=${name}:wght@${weights}`;
  });
  
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

/**
 * Check if a style supports a specific locale
 * @param style - The style ID
 * @param locale - The locale to check
 * @returns Whether the style is suitable for the locale
 */
export function isStyleSuitableForLocale(
  style: CalligraphyStyleId, 
  locale: string
): boolean {
  const localeLower = locale.toLowerCase();
  
  // Nastaaliq is specifically for Persian/Urdu
  if (style === 'nastaaliq') {
    return ['fa', 'ur', 'ps'].some((l) => localeLower.startsWith(l));
  }
  
  // Maghrebi is best for North African Arabic
  if (style === 'maghrebi') {
    return ['ar-ma', 'ar-dz', 'ar-tn', 'ar-ly'].some((l) => localeLower.startsWith(l));
  }
  
  // Diwani has Ottoman/Turkish heritage
  if (style === 'diwani' || style === 'diwani-jali') {
    return localeLower.startsWith('tr') || localeLower.startsWith('ar');
  }
  
  return true;
}

// Default export for convenience
export default {
  CALLIGRAPHY_STYLES,
  getCalligraphyStyle,
  getCalligraphyStyles,
  getFontForStyle,
  getAllFontsForStyle,
  getStyleMetadata,
  getStylesForUseCase,
  getStylesByEra,
  getStylesByDifficulty,
  getHeroStyles,
  generateFontFamily,
  getStyleNames,
  searchStyles,
  getAllGoogleFontsUrl,
  isStyleSuitableForLocale,
};
