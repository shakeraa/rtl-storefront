import type { ArabicDialect } from "../cultural-ai/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FashionCategory =
  | "traditional_wear"
  | "modest_fashion"
  | "accessories"
  | "fabrics"
  | "modern_fusion"
  | "bridal"
  | "seasonal"
  | "children";

export interface FashionDBEntry {
  id: string;
  english: string;
  arabic: string;
  category: FashionCategory;
  subcategory?: string;
  dialects?: Partial<Record<ArabicDialect, string>>;
  description?: string;
  searchTerms: string[];
  imageKeywords?: string[];
}

// ---------------------------------------------------------------------------
// Database — 60+ entries
// ---------------------------------------------------------------------------

export const FASHION_DATABASE: FashionDBEntry[] = [
  // ── Abaya variants (6) ──────────────────────────────────────────────
  {
    id: "abaya-classic",
    english: "Classic Abaya",
    arabic: "عباءة كلاسيكية",
    category: "traditional_wear",
    subcategory: "abaya",
    dialects: { gulf: "عباية كلاسيك", egyptian: "عباية كلاسيكية" },
    description: "Traditional full-length black outer garment",
    searchTerms: ["abaya", "classic abaya", "black abaya", "عباءة"],
    imageKeywords: ["abaya", "modest dress", "black cloak"],
  },
  {
    id: "abaya-open-front",
    english: "Open-Front Abaya",
    arabic: "عباءة مفتوحة",
    category: "traditional_wear",
    subcategory: "abaya",
    dialects: { gulf: "عباية مفتوحة من الأمام" },
    description: "Abaya with an open front, worn like a coat",
    searchTerms: ["open front abaya", "coat abaya", "عباءة مفتوحة"],
    imageKeywords: ["open abaya", "coat style abaya"],
  },
  {
    id: "abaya-butterfly",
    english: "Butterfly Abaya",
    arabic: "عباءة فراشة",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Wide-cut abaya with flowing sleeves resembling butterfly wings",
    searchTerms: ["butterfly abaya", "عباءة فراشة", "batwing abaya"],
    imageKeywords: ["butterfly abaya", "batwing sleeves"],
  },
  {
    id: "abaya-kimono",
    english: "Kimono Abaya",
    arabic: "عباءة كيمونو",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Fusion abaya inspired by Japanese kimono silhouette",
    searchTerms: ["kimono abaya", "عباءة كيمونو", "modern abaya"],
    imageKeywords: ["kimono abaya", "modern modest"],
  },
  {
    id: "abaya-embroidered",
    english: "Embroidered Abaya",
    arabic: "عباءة مطرزة",
    category: "traditional_wear",
    subcategory: "abaya",
    dialects: { gulf: "عباية مطرّزة", levantine: "عباءة مقصّبة" },
    description: "Abaya featuring intricate embroidery or bead-work",
    searchTerms: ["embroidered abaya", "عباءة مطرزة", "beaded abaya"],
    imageKeywords: ["embroidered abaya", "luxury abaya"],
  },
  {
    id: "abaya-sports",
    english: "Sports Abaya",
    arabic: "عباءة رياضية",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Lightweight, breathable abaya designed for active wear",
    searchTerms: ["sports abaya", "athletic abaya", "عباءة رياضية"],
    imageKeywords: ["active abaya", "sports modest wear"],
  },

  // ── Hijab styles (6) ────────────────────────────────────────────────
  {
    id: "hijab-square",
    english: "Square Hijab",
    arabic: "حجاب مربع",
    category: "accessories",
    subcategory: "hijab",
    description: "Classic square-shaped hijab scarf",
    searchTerms: ["square hijab", "حجاب مربع", "classic hijab"],
    imageKeywords: ["square scarf", "hijab"],
  },
  {
    id: "hijab-pashmina",
    english: "Pashmina Hijab",
    arabic: "حجاب باشمينا",
    category: "accessories",
    subcategory: "hijab",
    description: "Rectangular pashmina-style hijab",
    searchTerms: ["pashmina hijab", "حجاب باشمينا", "rectangular hijab"],
    imageKeywords: ["pashmina scarf", "hijab wrap"],
  },
  {
    id: "hijab-instant",
    english: "Instant Hijab",
    arabic: "حجاب فوري",
    category: "accessories",
    subcategory: "hijab",
    dialects: { gulf: "حجاب جاهز", egyptian: "طرحة جاهزة" },
    description: "Pre-sewn pull-on hijab requiring no pins",
    searchTerms: ["instant hijab", "slip-on hijab", "حجاب فوري"],
    imageKeywords: ["instant hijab", "easy hijab"],
  },
  {
    id: "hijab-jersey",
    english: "Jersey Hijab",
    arabic: "حجاب جيرسي",
    category: "accessories",
    subcategory: "hijab",
    description: "Stretchy jersey-knit hijab for a snug fit",
    searchTerms: ["jersey hijab", "stretch hijab", "حجاب جيرسي"],
    imageKeywords: ["jersey hijab", "stretchy scarf"],
  },
  {
    id: "hijab-chiffon",
    english: "Chiffon Hijab",
    arabic: "حجاب شيفون",
    category: "accessories",
    subcategory: "hijab",
    description: "Lightweight sheer chiffon hijab",
    searchTerms: ["chiffon hijab", "حجاب شيفون", "light hijab"],
    imageKeywords: ["chiffon scarf", "sheer hijab"],
  },
  {
    id: "hijab-turban",
    english: "Turban Hijab",
    arabic: "حجاب توربان",
    category: "accessories",
    subcategory: "hijab",
    dialects: { egyptian: "توربان", maghreb: "توربان" },
    description: "Turban-style head wrap",
    searchTerms: ["turban hijab", "turban wrap", "حجاب توربان"],
    imageKeywords: ["turban style", "head wrap"],
  },

  // ── Thobe variants (4) ──────────────────────────────────────────────
  {
    id: "thobe-saudi",
    english: "Saudi Thobe",
    arabic: "ثوب سعودي",
    category: "traditional_wear",
    subcategory: "thobe",
    dialects: { gulf: "ثوب سعودي" },
    description: "White ankle-length garment with buttoned cuffs, Saudi style",
    searchTerms: ["saudi thobe", "ثوب سعودي", "white thobe"],
    imageKeywords: ["saudi thobe", "white menswear"],
  },
  {
    id: "thobe-emirati",
    english: "Emirati Kandura",
    arabic: "كندورة إماراتية",
    category: "traditional_wear",
    subcategory: "thobe",
    dialects: { gulf: "كندورة" },
    description: "UAE-style thobe with tassel (tarboosh) at the collar",
    searchTerms: ["kandura", "emirati thobe", "كندورة", "dishdasha"],
    imageKeywords: ["kandura", "emirati menswear"],
  },
  {
    id: "thobe-kuwaiti",
    english: "Kuwaiti Dishdasha",
    arabic: "دشداشة كويتية",
    category: "traditional_wear",
    subcategory: "thobe",
    dialects: { gulf: "دشداشة" },
    description: "Kuwaiti-style dishdasha with a one-button collar",
    searchTerms: ["dishdasha", "kuwaiti thobe", "دشداشة كويتية"],
    imageKeywords: ["dishdasha", "kuwaiti menswear"],
  },
  {
    id: "thobe-moroccan",
    english: "Moroccan Djellaba",
    arabic: "جلابة مغربية",
    category: "traditional_wear",
    subcategory: "thobe",
    dialects: { maghreb: "جلابة" },
    description: "Hooded Moroccan outer robe with pointed hood",
    searchTerms: ["djellaba", "jellaba", "جلابة", "moroccan robe"],
    imageKeywords: ["djellaba", "moroccan robe", "hooded robe"],
  },

  // ── Kaftan types (3) ────────────────────────────────────────────────
  {
    id: "kaftan-moroccan",
    english: "Moroccan Kaftan",
    arabic: "قفطان مغربي",
    category: "traditional_wear",
    subcategory: "kaftan",
    dialects: { maghreb: "قفطان" },
    description: "Ornate two-piece Moroccan kaftan for celebrations",
    searchTerms: ["moroccan kaftan", "قفطان مغربي", "festive kaftan"],
    imageKeywords: ["moroccan kaftan", "luxury robe"],
  },
  {
    id: "kaftan-khaleeji",
    english: "Khaleeji Kaftan",
    arabic: "قفطان خليجي",
    category: "traditional_wear",
    subcategory: "kaftan",
    dialects: { gulf: "دراعة" },
    description: "Gulf-style kaftan (dara'a) often embellished with gold thread",
    searchTerms: ["khaleeji kaftan", "daraa", "قفطان خليجي", "دراعة"],
    imageKeywords: ["gulf kaftan", "gold embroidery robe"],
  },
  {
    id: "kaftan-modern",
    english: "Modern Kaftan",
    arabic: "قفطان عصري",
    category: "traditional_wear",
    subcategory: "kaftan",
    description: "Contemporary kaftan with modern cuts and prints",
    searchTerms: ["modern kaftan", "قفطان عصري", "contemporary kaftan"],
    imageKeywords: ["modern kaftan", "contemporary robe"],
  },

  // ── Bridal wear (5) ─────────────────────────────────────────────────
  {
    id: "bridal-hijab-gown",
    english: "Bridal Hijab Gown",
    arabic: "فستان زفاف محتشم",
    category: "bridal",
    description: "Modest wedding gown designed for hijab-wearing brides",
    searchTerms: ["bridal hijab", "modest wedding dress", "فستان زفاف محتشم"],
    imageKeywords: ["modest bridal gown", "hijab wedding"],
  },
  {
    id: "bridal-kaftan",
    english: "Bridal Kaftan",
    arabic: "قفطان زفاف",
    category: "bridal",
    dialects: { maghreb: "قفطان العروسة" },
    description: "Luxurious embellished kaftan for the wedding ceremony",
    searchTerms: ["bridal kaftan", "wedding kaftan", "قفطان زفاف"],
    imageKeywords: ["bridal kaftan", "wedding kaftan"],
  },
  {
    id: "bridal-thobe-nashal",
    english: "Thobe Al-Nashal",
    arabic: "ثوب النشل",
    category: "bridal",
    dialects: { gulf: "ثوب النشل" },
    description: "Traditional Gulf bridal dress with elaborate gold embroidery",
    searchTerms: ["thobe nashal", "ثوب النشل", "gulf bridal"],
    imageKeywords: ["gulf bridal dress", "gold embroidered gown"],
  },
  {
    id: "bridal-henna-dress",
    english: "Henna Night Dress",
    arabic: "فستان ليلة الحناء",
    category: "bridal",
    description: "Dress worn during the pre-wedding henna celebration",
    searchTerms: ["henna dress", "henna night", "فستان ليلة الحناء"],
    imageKeywords: ["henna night outfit", "pre-wedding dress"],
  },
  {
    id: "bridal-engagement-set",
    english: "Engagement Outfit",
    arabic: "طقم خطوبة",
    category: "bridal",
    description: "Co-ordinated outfit for engagement ceremonies",
    searchTerms: ["engagement dress", "engagement outfit", "طقم خطوبة"],
    imageKeywords: ["engagement outfit", "formal occasion dress"],
  },

  // ── Children's modest wear (4) ──────────────────────────────────────
  {
    id: "children-abaya",
    english: "Children's Abaya",
    arabic: "عباءة أطفال",
    category: "children",
    description: "Mini abaya designed for girls",
    searchTerms: ["kids abaya", "children abaya", "عباءة أطفال", "girls abaya"],
    imageKeywords: ["kids abaya", "children modest wear"],
  },
  {
    id: "children-thobe",
    english: "Children's Thobe",
    arabic: "ثوب أطفال",
    category: "children",
    description: "Scaled-down thobe for boys",
    searchTerms: ["kids thobe", "children thobe", "ثوب أطفال", "boys thobe"],
    imageKeywords: ["kids thobe", "boys traditional wear"],
  },
  {
    id: "children-hijab",
    english: "Children's Hijab",
    arabic: "حجاب أطفال",
    category: "children",
    description: "Lightweight and comfortable hijab for girls",
    searchTerms: ["kids hijab", "girls hijab", "حجاب أطفال"],
    imageKeywords: ["kids hijab", "girls head cover"],
  },
  {
    id: "children-eid-outfit",
    english: "Children's Eid Outfit",
    arabic: "ملابس عيد للأطفال",
    category: "children",
    subcategory: "seasonal",
    description: "Festive outfit for children during Eid celebrations",
    searchTerms: ["kids eid outfit", "eid clothes children", "ملابس عيد للأطفال"],
    imageKeywords: ["kids eid outfit", "children festive wear"],
  },

  // ── Seasonal fashion — Eid, Ramadan (5) ─────────────────────────────
  {
    id: "seasonal-eid-thobe",
    english: "Eid Thobe",
    arabic: "ثوب العيد",
    category: "seasonal",
    subcategory: "eid",
    description: "Premium thobe worn during Eid celebrations",
    searchTerms: ["eid thobe", "ثوب العيد", "festive thobe"],
    imageKeywords: ["eid thobe", "celebration menswear"],
  },
  {
    id: "seasonal-eid-abaya",
    english: "Eid Abaya",
    arabic: "عباءة العيد",
    category: "seasonal",
    subcategory: "eid",
    description: "Festive embellished abaya for Eid",
    searchTerms: ["eid abaya", "عباءة العيد", "festive abaya"],
    imageKeywords: ["eid abaya", "celebration abaya"],
  },
  {
    id: "seasonal-ramadan-collection",
    english: "Ramadan Collection",
    arabic: "مجموعة رمضان",
    category: "seasonal",
    subcategory: "ramadan",
    description: "Curated modest fashion collection for the holy month",
    searchTerms: ["ramadan collection", "مجموعة رمضان", "ramadan fashion"],
    imageKeywords: ["ramadan fashion", "holy month collection"],
  },
  {
    id: "seasonal-taraweeh-outfit",
    english: "Taraweeh Prayer Outfit",
    arabic: "ملابس صلاة التراويح",
    category: "seasonal",
    subcategory: "ramadan",
    description: "Comfortable modest outfit for extended Taraweeh prayers",
    searchTerms: ["taraweeh outfit", "prayer clothes", "ملابس صلاة التراويح"],
    imageKeywords: ["prayer outfit", "taraweeh wear"],
  },
  {
    id: "seasonal-iftar-dress",
    english: "Iftar Gathering Dress",
    arabic: "فستان سهرة إفطار",
    category: "seasonal",
    subcategory: "ramadan",
    description: "Elegant dress suitable for iftar dinner gatherings",
    searchTerms: ["iftar dress", "ramadan evening wear", "فستان سهرة إفطار"],
    imageKeywords: ["iftar outfit", "evening modest dress"],
  },

  // ── Fabrics (6) ─────────────────────────────────────────────────────
  {
    id: "fabric-nida",
    english: "Nida Fabric",
    arabic: "قماش نيدا",
    category: "fabrics",
    description: "Matte crepe-like fabric popular for abayas",
    searchTerms: ["nida", "nida fabric", "قماش نيدا", "abaya fabric"],
    imageKeywords: ["nida fabric", "matte crepe"],
  },
  {
    id: "fabric-korean-nida",
    english: "Korean Nida",
    arabic: "نيدا كوري",
    category: "fabrics",
    description: "Premium quality nida fabric imported from Korea",
    searchTerms: ["korean nida", "نيدا كوري", "premium nida"],
    imageKeywords: ["korean nida", "premium abaya fabric"],
  },
  {
    id: "fabric-zoom",
    english: "Zoom Fabric",
    arabic: "قماش زوم",
    category: "fabrics",
    description: "Lightweight stretchy fabric used in modern abayas",
    searchTerms: ["zoom fabric", "قماش زوم", "stretch abaya fabric"],
    imageKeywords: ["zoom fabric", "stretchy fabric"],
  },
  {
    id: "fabric-linen",
    english: "Linen",
    arabic: "كتان",
    category: "fabrics",
    description: "Natural breathable linen fabric for summer garments",
    searchTerms: ["linen", "كتان", "summer fabric"],
    imageKeywords: ["linen fabric", "natural textile"],
  },
  {
    id: "fabric-organza",
    english: "Organza",
    arabic: "أورجانزا",
    category: "fabrics",
    description: "Sheer, lightweight organza for overlays and details",
    searchTerms: ["organza", "أورجانزا", "sheer fabric"],
    imageKeywords: ["organza fabric", "sheer overlay"],
  },
  {
    id: "fabric-brocade",
    english: "Brocade",
    arabic: "ديباج",
    category: "fabrics",
    dialects: { levantine: "بروكار", egyptian: "بروكاد" },
    description: "Richly decorative woven fabric often used in formal wear",
    searchTerms: ["brocade", "ديباج", "بروكار", "formal fabric"],
    imageKeywords: ["brocade fabric", "decorative textile"],
  },

  // ── Modern modest / fusion (6) ──────────────────────────────────────
  {
    id: "modern-modest-blazer",
    english: "Modest Blazer Set",
    arabic: "طقم بليزر محتشم",
    category: "modern_fusion",
    description: "Co-ordinated blazer and trouser set with modest coverage",
    searchTerms: ["modest blazer", "طقم بليزر محتشم", "formal modest"],
    imageKeywords: ["modest blazer", "work wear modest"],
  },
  {
    id: "modern-modest-jumpsuit",
    english: "Modest Jumpsuit",
    arabic: "جمبسوت محتشم",
    category: "modern_fusion",
    description: "Full-coverage jumpsuit with loose fit",
    searchTerms: ["modest jumpsuit", "جمبسوت محتشم", "covered jumpsuit"],
    imageKeywords: ["modest jumpsuit", "full coverage"],
  },
  {
    id: "modern-burkini",
    english: "Burkini",
    arabic: "بوركيني",
    category: "modern_fusion",
    description: "Full-coverage swimwear for modest swimming",
    searchTerms: ["burkini", "بوركيني", "modest swimwear", "islamic swimwear"],
    imageKeywords: ["burkini", "modest swimwear"],
  },
  {
    id: "modern-sport-hijab",
    english: "Sport Hijab",
    arabic: "حجاب رياضي",
    category: "modern_fusion",
    description: "Performance hijab for athletic activities",
    searchTerms: ["sport hijab", "athletic hijab", "حجاب رياضي"],
    imageKeywords: ["sport hijab", "athletic headwear"],
  },
  {
    id: "modern-maxi-cardigan",
    english: "Maxi Cardigan",
    arabic: "كارديغان طويل",
    category: "modern_fusion",
    description: "Floor-length cardigan used as a casual modest layer",
    searchTerms: ["maxi cardigan", "كارديغان طويل", "long cardigan"],
    imageKeywords: ["maxi cardigan", "long layering piece"],
  },
  {
    id: "modern-co-ord-set",
    english: "Modest Co-Ord Set",
    arabic: "طقم منسّق محتشم",
    category: "modern_fusion",
    description: "Matching top-and-bottom set with full coverage",
    searchTerms: ["co-ord set", "matching set modest", "طقم منسّق محتشم"],
    imageKeywords: ["matching set", "coordinated modest outfit"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Simple fuzzy-match: returns true if `query` tokens all appear somewhere
 * in the `target` string (case-insensitive).
 */
function fuzzyMatch(query: string, target: string): boolean {
  const lowerTarget = target.toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.every((token) => lowerTarget.includes(token));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fuzzy-search across english, arabic and searchTerms fields.
 */
export function searchFashionTerms(query: string): FashionDBEntry[] {
  if (!query.trim()) return [];

  return FASHION_DATABASE.filter((entry) => {
    if (fuzzyMatch(query, entry.english)) return true;
    if (entry.arabic.includes(query)) return true;
    return entry.searchTerms.some((term) => fuzzyMatch(query, term));
  });
}

/**
 * Return all entries belonging to a specific category.
 */
export function getFashionByCategory(category: FashionCategory): FashionDBEntry[] {
  return FASHION_DATABASE.filter((entry) => entry.category === category);
}

/**
 * Look up the Arabic translation for a given English fashion term.
 * If a dialect is specified and the entry has a dialect variant, return that instead.
 */
export function getArabicTranslation(
  english: string,
  dialect?: string,
): string | null {
  const lowerEnglish = english.toLowerCase();
  const entry = FASHION_DATABASE.find(
    (e) => e.english.toLowerCase() === lowerEnglish,
  );
  if (!entry) return null;

  if (dialect && entry.dialects) {
    const dialectTranslation = entry.dialects[dialect as ArabicDialect];
    if (dialectTranslation) return dialectTranslation;
  }

  return entry.arabic;
}
