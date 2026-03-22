/**
 * Islamic Geometric Pattern Library
 * 
 * Provides traditional Islamic geometric patterns for RTL fashion sections.
 * Includes patterns like arabesque, girih, star polygons, and more.
 * 
 * @module mena-design/islamic-patterns
 */

export interface PatternOptions {
  /** Primary color of the pattern */
  primaryColor?: string;
  /** Secondary color for multi-color patterns */
  secondaryColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Pattern opacity (0-1) */
  opacity?: number;
  /** Pattern scale/size */
  scale?: number;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Stroke width for line-based patterns */
  strokeWidth?: number;
}

export interface PatternMetadata {
  /** Pattern identifier */
  name: string;
  /** English display name */
  nameEn: string;
  /** Arabic display name */
  nameAr: string;
  /** Pattern description */
  description: string;
  /** Category: geometric, floral, calligraphic, etc. */
  category: 'geometric' | 'floral' | 'calligraphic' | 'interlaced';
  /** Origin/region of the pattern */
  origin: string;
  /** Complexity level (1-5) */
  complexity: number;
  /** Whether pattern supports color customization */
  supportsColor: boolean;
  /** Whether pattern supports opacity control */
  supportsOpacity: boolean;
  /** Default dimensions */
  defaultSize: { width: number; height: number };
}

export interface IslamicPattern {
  metadata: PatternMetadata;
  generateSVG: (options?: PatternOptions) => string;
}

// Default color palette for Islamic patterns
const DEFAULT_COLORS = {
  primary: '#1a365d',    // Deep blue
  secondary: '#c53030',  // Islamic red
  background: 'transparent',
  gold: '#d69e2e',       // Traditional gold
  green: '#276749',      // Islamic green
  turquoise: '#38b2ac',  // Persian turquoise
};

// Pattern definitions with metadata
const PATTERN_DEFINITIONS: Record<string, PatternMetadata> = {
  'arabesque': {
    name: 'arabesque',
    nameEn: 'Arabesque',
    nameAr: 'الأرابيسك',
    description: 'Flowing, organic patterns of scrolling and interlacing foliage, tendrils, and geometric shapes',
    category: 'floral',
    origin: 'Abbasid Caliphate',
    complexity: 4,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 200, height: 200 },
  },
  'girih': {
    name: 'girih',
    nameEn: 'Girih',
    nameAr: 'القرية',
    description: 'Geometric star and polygon patterns formed by strapwork',
    category: 'geometric',
    origin: 'Persia',
    complexity: 5,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 300, height: 300 },
  },
  'eight-pointed-star': {
    name: 'eight-pointed-star',
    nameEn: 'Eight-Pointed Star',
    nameAr: 'النجمة الثمانية',
    description: 'The iconic eight-pointed star, symbolizing balance and cosmic order',
    category: 'geometric',
    origin: 'Islamic Golden Age',
    complexity: 3,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 200, height: 200 },
  },
  'six-pointed-star': {
    name: 'six-pointed-star',
    nameEn: 'Six-Pointed Star',
    nameAr: 'النجمة السداسية',
    description: 'Hexagram pattern representing the union of opposites',
    category: 'geometric',
    origin: 'Umayyad Period',
    complexity: 2,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 200, height: 200 },
  },
  'seal-of-solomon': {
    name: 'seal-of-solomon',
    nameEn: 'Seal of Solomon',
    nameAr: 'خاتم سليمان',
    description: 'Interlaced hexagram with symbolic significance in Islamic mysticism',
    category: 'geometric',
    origin: 'Ancient Near East',
    complexity: 3,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 200, height: 200 },
  },
  'rosette': {
    name: 'rosette',
    nameEn: 'Rosette',
    nameAr: 'الوردة',
    description: 'Circular floral medallion pattern found in Islamic architecture',
    category: 'floral',
    origin: 'Mamluk Egypt',
    complexity: 3,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 200, height: 200 },
  },
  'muqarnas': {
    name: 'muqarnas',
    nameEn: 'Muqarnas',
    nameAr: 'المقرنص',
    description: 'Stalactite vaulting pattern used in Islamic architecture',
    category: 'geometric',
    origin: 'Iran/Iraq',
    complexity: 5,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 300, height: 300 },
  },
  'knotwork': {
    name: 'knotwork',
    nameEn: 'Celtic-Inspired Knotwork',
    nameAr: 'العقد المترابطة',
    description: 'Interlacing knot patterns adapted in Islamic art',
    category: 'interlaced',
    origin: 'Seljuk Period',
    complexity: 4,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 200, height: 200 },
  },
  'tessellation': {
    name: 'tessellation',
    nameEn: 'Geometric Tessellation',
    nameAr: 'الفسيفساء الهندسية',
    description: 'Repeating polygonal patterns that tile the plane perfectly',
    category: 'geometric',
    origin: 'Alhambra, Spain',
    complexity: 4,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 300, height: 300 },
  },
  'mandala': {
    name: 'mandala',
    nameEn: 'Islamic Mandala',
    nameAr: 'المندلة الإسلامية',
    description: 'Circular geometric composition representing cosmic order',
    category: 'geometric',
    origin: 'Persian Tradition',
    complexity: 4,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 300, height: 300 },
  },
  'shamsa': {
    name: 'shamsa',
    nameEn: 'Shamsa',
    nameAr: 'الشمسة',
    description: 'Sunburst medallion pattern used in manuscript illumination',
    category: 'geometric',
    origin: 'Persian Miniatures',
    complexity: 3,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 250, height: 250 },
  },
  'calligraphy-border': {
    name: 'calligraphy-border',
    nameEn: 'Calligraphy Border',
    nameAr: 'الإطار الخطي',
    description: 'Decorative border pattern inspired by Arabic calligraphy',
    category: 'calligraphic',
    origin: 'Ottoman Empire',
    complexity: 3,
    supportsColor: true,
    supportsOpacity: true,
    defaultSize: { width: 400, height: 100 },
  },
};

// SVG Generator functions for each pattern
function generateArabesque(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    opacity = 1,
    scale = 1,
    strokeWidth = 2,
  } = options;

  const size = 200 * scale;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>
      <pattern id="arabesque-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M0,50 Q25,25 50,50 T100,50" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M50,0 Q75,25 50,50 T50,100" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <circle cx="50" cy="50" r="8" 
                fill="none" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}" 
                opacity="${opacity}"/>
        <path d="M25,25 Q50,0 75,25 Q50,50 25,25" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#arabesque-pattern)"/>
  </svg>`;
}

function generateGirih(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.secondary,
    opacity = 1,
    scale = 1,
    strokeWidth = 1.5,
  } = options;

  const size = 300 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 300 300">
    <defs>
      <pattern id="girih-pattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
        <!-- Girih tile pattern with decagon and pentagons -->
        <polygon points="75,10 95,35 90,65 60,65 55,35" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <line x1="75" y1="10" x2="75" y2="65" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <line x1="55" y1="35" x2="95" y2="35" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <!-- Interlacing straps -->
        <path d="M0,75 L55,35 M95,35 L150,75" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M0,75 L55,115 M95,115 L150,75" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M75,0 L75,10 M75,140 L75,150" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#girih-pattern)"/>
  </svg>`;
}

function generateEightPointedStar(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.gold,
    secondaryColor = DEFAULT_COLORS.primary,
    opacity = 1,
    scale = 1,
    strokeWidth = 2,
  } = options;

  const size = 200 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>
      <pattern id="eight-star-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <!-- Eight-pointed star -->
        <polygon points="50,5 58,35 88,25 68,50 88,75 58,65 50,95 42,65 12,75 32,50 12,25 42,35" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <!-- Central square -->
        <rect x="40" y="40" width="20" height="20" 
              fill="none" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <!-- Connecting diamonds -->
        <polygon points="50,15 55,25 50,35 45,25" 
                 fill="${secondaryColor}" 
                 opacity="${opacity * 0.5}"/>
        <polygon points="85,50 75,55 65,50 75,45" 
                 fill="${secondaryColor}" 
                 opacity="${opacity * 0.5}"/>
        <polygon points="50,85 45,75 50,65 55,75" 
                 fill="${secondaryColor}" 
                 opacity="${opacity * 0.5}"/>
        <polygon points="15,50 25,45 35,50 25,55" 
                 fill="${secondaryColor}" 
                 opacity="${opacity * 0.5}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#eight-star-pattern)"/>
  </svg>`;
}

function generateSixPointedStar(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.turquoise,
    opacity = 1,
    scale = 1,
    strokeWidth = 2,
  } = options;

  const size = 200 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>
      <pattern id="six-star-pattern" x="0" y="0" width="100" height="86.6" patternUnits="userSpaceOnUse">
        <!-- Six-pointed star (hexagram) -->
        <polygon points="50,10 90,80 10,80" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <polygon points="50,90 90,20 10,20" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <!-- Inner hexagon -->
        <polygon points="50,40 70,55 70,75 50,90 30,75 30,55" 
                 fill="none" 
                 stroke="${secondaryColor}" 
                 stroke-width="${strokeWidth / 2}" 
                 opacity="${opacity}"/>
        <!-- Center point -->
        <circle cx="50" cy="65" r="5" 
                fill="${secondaryColor}" 
                opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#six-star-pattern)"/>
  </svg>`;
}

function generateSealOfSolomon(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.gold,
    opacity = 1,
    scale = 1,
    strokeWidth = 2,
  } = options;

  const size = 200 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>
      <pattern id="solomon-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <!-- Interlaced triangles -->
        <path d="M50,10 L85,70 L15,70 Z" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M50,90 L15,30 L85,30 Z" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <!-- Interlacing effect -->
        <circle cx="50" cy="50" r="12" 
                fill="none" 
                stroke="${secondaryColor}" 
                stroke-width="${strokeWidth}" 
                opacity="${opacity}"/>
        <!-- Small decorative circles at points -->
        <circle cx="50" cy="10" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="85" cy="70" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="15" cy="70" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="50" cy="90" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="15" cy="30" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="85" cy="30" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#solomon-pattern)"/>
  </svg>`;
}

function generateRosette(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.green,
    opacity = 1,
    scale = 1,
    strokeWidth = 1.5,
  } = options;

  const size = 200 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>
      <pattern id="rosette-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <!-- Central medallion -->
        <circle cx="50" cy="50" r="20" 
                fill="none" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}" 
                opacity="${opacity}"/>
        <!-- Petals -->
        <ellipse cx="50" cy="15" rx="8" ry="15" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <ellipse cx="85" cy="50" rx="15" ry="8" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <ellipse cx="50" cy="85" rx="8" ry="15" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <ellipse cx="15" cy="50" rx="15" ry="8" 
                 fill="none" 
                 stroke="${primaryColor}" 
                 stroke-width="${strokeWidth}" 
                 opacity="${opacity}"/>
        <!-- Diagonal petals -->
        <ellipse cx="75" cy="25" rx="6" ry="12" 
                 transform="rotate(45 75 25)"
                 fill="none" 
                 stroke="${secondaryColor}" 
                 stroke-width="${strokeWidth / 2}" 
                 opacity="${opacity}"/>
        <ellipse cx="75" cy="75" rx="6" ry="12" 
                 transform="rotate(135 75 75)"
                 fill="none" 
                 stroke="${secondaryColor}" 
                 stroke-width="${strokeWidth / 2}" 
                 opacity="${opacity}"/>
        <ellipse cx="25" cy="75" rx="6" ry="12" 
                 transform="rotate(225 25 75)"
                 fill="none" 
                 stroke="${secondaryColor}" 
                 stroke-width="${strokeWidth / 2}" 
                 opacity="${opacity}"/>
        <ellipse cx="25" cy="25" rx="6" ry="12" 
                 transform="rotate(315 25 25)"
                 fill="none" 
                 stroke="${secondaryColor}" 
                 stroke-width="${strokeWidth / 2}" 
                 opacity="${opacity}"/>
        <!-- Center -->
        <circle cx="50" cy="50" r="5" fill="${secondaryColor}" opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#rosette-pattern)"/>
  </svg>`;
}

function generateMuqarnas(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.gold,
    opacity = 1,
    scale = 1,
    strokeWidth = 1,
  } = options;

  const size = 300 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 300 300">
    <defs>
      <pattern id="muqarnas-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <!-- Stalactite cell -->
        <path d="M0,0 L30,15 L60,0 L60,30 L30,45 L0,30 Z" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M30,15 L30,45" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <path d="M0,30 L60,30" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <!-- Lower tier -->
        <path d="M15,30 L30,45 L45,30 L45,45 L30,60 L15,45 Z" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#muqarnas-pattern)"/>
  </svg>`;
}

function generateKnotwork(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.gold,
    opacity = 1,
    scale = 1,
    strokeWidth = 3,
  } = options;

  const size = 200 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>
      <pattern id="knotwork-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <!-- Interlacing knot -->
        <path d="M0,25 Q25,25 25,50 Q25,75 50,75 Q75,75 75,50 Q75,25 100,25" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M0,75 Q25,75 25,50 Q25,25 50,25 Q75,25 75,50 Q75,75 100,75" 
              fill="none" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <!-- Vertical strands -->
        <path d="M25,0 Q25,25 50,25 Q75,25 75,0" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M25,100 Q25,75 50,75 Q75,75 75,100" 
              fill="none" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <!-- Over/under indicators -->
        <circle cx="50" cy="50" r="6" fill="${secondaryColor}" opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#knotwork-pattern)"/>
  </svg>`;
}

function generateTessellation(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.turquoise,
    opacity = 1,
    scale = 1,
    strokeWidth = 1.5,
  } = options;

  const size = 300 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 300 300">
    <defs>
      <pattern id="tessellation-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <!-- Square grid with stars -->
        <rect x="25" y="25" width="50" height="50" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <!-- Diamond inside -->
        <polygon points="50,30 70,50 50,70 30,50" 
                 fill="none" 
                 stroke="${secondaryColor}" 
                 stroke-width="${strokeWidth / 2}" 
                 opacity="${opacity}"/>
        <!-- Corner decorations -->
        <path d="M0,25 L25,25 M75,25 L100,25" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <path d="M0,75 L25,75 M75,75 L100,75" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <path d="M25,0 L25,25 M25,75 L25,100" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <path d="M75,0 L75,25 M75,75 L75,100" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <!-- Small circles at intersections -->
        <circle cx="25" cy="25" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="75" cy="25" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="25" cy="75" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="75" cy="75" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#tessellation-pattern)"/>
  </svg>`;
}

function generateMandala(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.gold,
    opacity = 1,
    scale = 1,
    strokeWidth = 1.5,
  } = options;

  const size = 300 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 300 300">
    <defs>
      <pattern id="mandala-pattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
        <!-- Concentric circles -->
        <circle cx="75" cy="75" r="60" 
                fill="none" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}" 
                opacity="${opacity}"/>
        <circle cx="75" cy="75" r="45" 
                fill="none" 
                stroke="${secondaryColor}" 
                stroke-width="${strokeWidth / 2}" 
                opacity="${opacity}"/>
        <circle cx="75" cy="75" r="30" 
                fill="none" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}" 
                opacity="${opacity}"/>
        <!-- Radial divisions -->
        <line x1="75" y1="15" x2="75" y2="0" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <line x1="135" y1="75" x2="150" y2="75" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <line x1="75" y1="135" x2="75" y2="150" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <line x1="15" y1="75" x2="0" y2="75" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <!-- Diagonal lines -->
        <line x1="118" y1="32" x2="128" y2="22" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <line x1="118" y1="118" x2="128" y2="128" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <line x1="32" y1="118" x2="22" y2="128" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <line x1="32" y1="32" x2="22" y2="22" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <!-- Central element -->
        <circle cx="75" cy="75" r="10" fill="${secondaryColor}" opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#mandala-pattern)"/>
  </svg>`;
}

function generateShamsa(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.gold,
    secondaryColor = DEFAULT_COLORS.primary,
    opacity = 1,
    scale = 1,
    strokeWidth = 1.5,
  } = options;

  const size = 250 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 250 250">
    <defs>
      <pattern id="shamsa-pattern" x="0" y="0" width="125" height="125" patternUnits="userSpaceOnUse">
        <!-- Sunburst rays -->
        <g opacity="${opacity}">
          <line x1="62.5" y1="10" x2="62.5" y2="30" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
          <line x1="62.5" y1="95" x2="62.5" y2="115" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
          <line x1="10" y1="62.5" x2="30" y2="62.5" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
          <line x1="95" y1="62.5" x2="115" y2="62.5" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
          <!-- Diagonal rays -->
          <line x1="25.5" y1="25.5" x2="38" y2="38" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
          <line x1="99.5" y1="25.5" x2="87" y2="38" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
          <line x1="25.5" y1="99.5" x2="38" y2="87" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
          <line x1="99.5" y1="99.5" x2="87" y2="87" 
                stroke="${primaryColor}" 
                stroke-width="${strokeWidth}"/>
        </g>
        <!-- Outer ring -->
        <circle cx="62.5" cy="62.5" r="50" 
                fill="none" 
                stroke="${secondaryColor}" 
                stroke-width="${strokeWidth}" 
                opacity="${opacity}"/>
        <!-- Inner ring -->
        <circle cx="62.5" cy="62.5" r="35" 
                fill="none" 
                stroke="${secondaryColor}" 
                stroke-width="${strokeWidth / 2}" 
                opacity="${opacity}"/>
        <!-- Center sun -->
        <circle cx="62.5" cy="62.5" r="12" fill="${primaryColor}" opacity="${opacity}"/>
        <!-- Decorative dots -->
        <circle cx="62.5" cy="12.5" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="112.5" cy="62.5" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="62.5" cy="112.5" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="12.5" cy="62.5" r="3" fill="${secondaryColor}" opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#shamsa-pattern)"/>
  </svg>`;
}

function generateCalligraphyBorder(options: PatternOptions = {}): string {
  const {
    primaryColor = DEFAULT_COLORS.primary,
    secondaryColor = DEFAULT_COLORS.gold,
    opacity = 1,
    scale = 1,
    strokeWidth = 2,
  } = options;

  const sizeW = 400 * scale;
  const sizeH = 100 * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sizeW}" height="${sizeH}" viewBox="0 0 400 100">
    <defs>
      <pattern id="calligraphy-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <!-- Decorative border element inspired by calligraphy -->
        <path d="M10,50 Q25,25 50,50 T90,50" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M10,50 Q25,75 50,50 T90,50" 
              fill="none" 
              stroke="${secondaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <!-- Vertical flourish -->
        <path d="M50,10 Q60,30 50,50 Q40,70 50,90" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth / 2}" 
              opacity="${opacity}"/>
        <!-- Dots (representing Arabic diacritics) -->
        <circle cx="30" cy="40" r="2" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="35" cy="45" r="2" fill="${secondaryColor}" opacity="${opacity}"/>
        <circle cx="40" cy="40" r="2" fill="${secondaryColor}" opacity="${opacity}"/>
        <!-- Corner element -->
        <path d="M0,0 Q15,15 0,30" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
        <path d="M100,0 Q85,15 100,30" 
              fill="none" 
              stroke="${primaryColor}" 
              stroke-width="${strokeWidth}" 
              opacity="${opacity}"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#calligraphy-pattern)"/>
  </svg>`;
}

// Map pattern names to their generator functions
const PATTERN_GENERATORS: Record<string, (options?: PatternOptions) => string> = {
  'arabesque': generateArabesque,
  'girih': generateGirih,
  'eight-pointed-star': generateEightPointedStar,
  'six-pointed-star': generateSixPointedStar,
  'seal-of-solomon': generateSealOfSolomon,
  'rosette': generateRosette,
  'muqarnas': generateMuqarnas,
  'knotwork': generateKnotwork,
  'tessellation': generateTessellation,
  'mandala': generateMandala,
  'shamsa': generateShamsa,
  'calligraphy-border': generateCalligraphyBorder,
};

/**
 * Get an Islamic pattern by name
 * @param name - Pattern identifier
 * @returns IslamicPattern object or null if not found
 */
export function getIslamicPattern(name: string): IslamicPattern | null {
  const metadata = PATTERN_DEFINITIONS[name];
  const generator = PATTERN_GENERATORS[name];

  if (!metadata || !generator) {
    return null;
  }

  return {
    metadata,
    generateSVG: generator,
  };
}

/**
 * Get all available pattern names for a locale
 * @param locale - Locale code (e.g., 'en', 'ar')
 * @returns Array of pattern names with localized labels
 */
export function getPatternNames(locale: string = 'en'): Array<{ id: string; name: string }> {
  const isRTL = ['ar', 'he', 'fa', 'ur'].some(lang => locale.startsWith(lang));
  
  return Object.values(PATTERN_DEFINITIONS).map(pattern => ({
    id: pattern.name,
    name: isRTL ? pattern.nameAr : pattern.nameEn,
  }));
}

/**
 * Generate SVG pattern by name with options
 * @param name - Pattern identifier
 * @param options - Pattern customization options
 * @returns SVG string or null if pattern not found
 */
export function generateSVGPattern(name: string, options: PatternOptions = {}): string | null {
  const generator = PATTERN_GENERATORS[name];
  
  if (!generator) {
    return null;
  }

  return generator(options);
}

/**
 * Get metadata for a specific pattern
 * @param name - Pattern identifier
 * @returns PatternMetadata or null if not found
 */
export function getPatternMetadata(name: string): PatternMetadata | null {
  return PATTERN_DEFINITIONS[name] || null;
}

/**
 * Get all available patterns
 * @returns Array of all pattern metadata
 */
export function getAllPatterns(): PatternMetadata[] {
  return Object.values(PATTERN_DEFINITIONS);
}

/**
 * Get patterns by category
 * @param category - Pattern category filter
 * @returns Array of patterns in the category
 */
export function getPatternsByCategory(category: PatternMetadata['category']): PatternMetadata[] {
  return Object.values(PATTERN_DEFINITIONS).filter(p => p.category === category);
}

/**
 * Check if a pattern exists
 * @param name - Pattern identifier
 * @returns Boolean indicating pattern availability
 */
export function hasPattern(name: string): boolean {
  return name in PATTERN_DEFINITIONS;
}

/**
 * Get patterns suitable for background use
 * @returns Array of pattern metadata for backgrounds
 */
export function getBackgroundPatterns(): PatternMetadata[] {
  return Object.values(PATTERN_DEFINITIONS).filter(p => 
    p.supportsOpacity && p.complexity <= 4
  );
}

/**
 * Get default pattern options
 * @returns Default PatternOptions object
 */
export function getDefaultOptions(): Required<PatternOptions> {
  return {
    primaryColor: DEFAULT_COLORS.primary,
    secondaryColor: DEFAULT_COLORS.secondary,
    backgroundColor: DEFAULT_COLORS.background,
    opacity: 1,
    scale: 1,
    rotation: 0,
    strokeWidth: 2,
  };
}

/**
 * Get patterns by complexity level
 * @param level - Complexity level (1-5)
 * @returns Array of patterns at that complexity
 */
export function getPatternsByComplexity(level: number): PatternMetadata[] {
  return Object.values(PATTERN_DEFINITIONS).filter(p => p.complexity === level);
}

/**
 * Get patterns by origin
 * @param origin - Origin/region name
 * @returns Array of patterns from that origin
 */
export function getPatternsByOrigin(origin: string): PatternMetadata[] {
  return Object.values(PATTERN_DEFINITIONS).filter(p => 
    p.origin.toLowerCase().includes(origin.toLowerCase())
  );
}

// Export constants
export { DEFAULT_COLORS };
export const PATTERN_COUNT = Object.keys(PATTERN_DEFINITIONS).length;
export const PATTERN_CATEGORIES: PatternMetadata['category'][] = ['geometric', 'floral', 'calligraphic', 'interlaced'];
export const AVAILABLE_PATTERN_NAMES = Object.keys(PATTERN_DEFINITIONS);
