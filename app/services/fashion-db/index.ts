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
  | "children"
  | "colors"
  | "sizes";

export type FashionLocale = "en" | "ar" | "he";

export interface FashionDBEntry {
  id: string;
  english: string;
  arabic: string;
  hebrew: string;
  category: FashionCategory;
  subcategory?: string;
  dialects?: Partial<Record<ArabicDialect, string>>;
  description?: string;
  searchTerms: string[];
  imageKeywords?: string[];
}

export interface FashionTermResult {
  id: string;
  term: string;
  english: string;
  arabic: string;
  hebrew: string;
  category: FashionCategory;
  subcategory?: string;
  description?: string;
}

export interface FashionCategoryResult {
  id: string;
  name: string;
  english: string;
  arabic: string;
  hebrew: string;
  subcategories?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Database — 80+ entries with Arabic and Hebrew translations
// ═══════════════════════════════════════════════════════════════════════════

export const FASHION_DATABASE: FashionDBEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ABAYA TERMINOLOGY (10 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "abaya-classic",
    english: "Classic Abaya",
    arabic: "عباءة كلاسيكية",
    hebrew: "עבאיה קלאסית",
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
    hebrew: "עבאיה פתוחה",
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
    hebrew: "עבאיה פרפר",
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
    hebrew: "עבאיה קימונו",
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
    hebrew: "עבאיה רקומה",
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
    hebrew: "עבאיה ספורטיבית",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Lightweight, breathable abaya designed for active wear",
    searchTerms: ["sports abaya", "athletic abaya", "عباءة رياضية"],
    imageKeywords: ["active abaya", "sports modest wear"],
  },
  {
    id: "abaya-lined",
    english: "Lined Abaya",
    arabic: "عباءة بطانة",
    hebrew: "עבאיה עם בטנה",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Abaya with inner lining for modesty and comfort",
    searchTerms: ["lined abaya", "عباءة بطانة", "double layer abaya"],
    imageKeywords: ["lined abaya", "layered abaya"],
  },
  {
    id: "abaya-belted",
    english: "Belted Abaya",
    arabic: "عباءة بحزام",
    hebrew: "עבאיה עם חגורה",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Abaya with attached or removable belt for waist definition",
    searchTerms: ["belted abaya", "عباءة بحزام", "waist abaya"],
    imageKeywords: ["belted abaya", "waist defined abaya"],
  },
  {
    id: "abaya-zipper",
    english: "Zipper Abaya",
    arabic: "عباءة بسحاب",
    hebrew: "עבאיה עם רוכסן",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Abaya featuring front zipper closure",
    searchTerms: ["zipper abaya", "عباءة بسحاب", "front zip abaya"],
    imageKeywords: ["zipper abaya", "modern closure abaya"],
  },
  {
    id: "abaya-pockets",
    english: "Abaya with Pockets",
    arabic: "عباءة بجيوب",
    hebrew: "עבאיה עם כיסים",
    category: "traditional_wear",
    subcategory: "abaya",
    description: "Practical abaya design with functional side pockets",
    searchTerms: ["pocket abaya", "عباءة بجيوب", "practical abaya"],
    imageKeywords: ["pocket abaya", "functional abaya"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HIJAB TERMINOLOGY (10 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "hijab-square",
    english: "Square Hijab",
    arabic: "حجاب مربع",
    hebrew: "חיג'אב מרובע",
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
    hebrew: "חיג'אב פשמינה",
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
    hebrew: "חיג'אב מוכן",
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
    hebrew: "חיג'אב ג'רזי",
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
    hebrew: "חיג'אב שיפון",
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
    hebrew: "חיג'אב טורבן",
    category: "accessories",
    subcategory: "hijab",
    dialects: { egyptian: "توربان", maghreb: "توربان" },
    description: "Turban-style head wrap",
    searchTerms: ["turban hijab", "turban wrap", "حجاب توربان"],
    imageKeywords: ["turban style", "head wrap"],
  },
  {
    id: "hijab-underscarf",
    english: "Underscarf",
    arabic: "بندانة",
    hebrew: "צעיף פנימי",
    category: "accessories",
    subcategory: "hijab",
    dialects: { gulf: "كاب", egyptian: "طرحة داخلية" },
    description: "Cap worn under hijab for coverage and grip",
    searchTerms: ["underscarf", "bonnet", "بندانة", "cap"],
    imageKeywords: ["underscarf", "hijab cap"],
  },
  {
    id: "hijab-pins",
    english: "Hijab Pins",
    arabic: "دبابيس حجاب",
    hebrew: "סיכות לחיג'אב",
    category: "accessories",
    subcategory: "hijab",
    description: "Straight or decorative pins for securing hijab",
    searchTerms: ["hijab pins", "دبابيس حجاب", "straight pins"],
    imageKeywords: ["hijab pins", "scarf pins"],
  },
  {
    id: "hijab-magnetic",
    english: "Magnetic Hijab Pins",
    arabic: "دبابيس مغناطيسية",
    hebrew: "סיכות מגנטיות לחיג'אב",
    category: "accessories",
    subcategory: "hijab",
    description: "Magnetic closure pins for securing hijab without holes",
    searchTerms: ["magnetic pins", "دبابيس مغناطيسية", "hijab magnets"],
    imageKeywords: ["magnetic pins", "hijab magnets"],
  },
  {
    id: "hijab-silk",
    english: "Silk Hijab",
    arabic: "حجاب حرير",
    hebrew: "חיג'אב משי",
    category: "accessories",
    subcategory: "hijab",
    description: "Luxurious silk hijab with elegant drape",
    searchTerms: ["silk hijab", "حجاب حرير", "luxury hijab"],
    imageKeywords: ["silk scarf", "luxury hijab"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // KAFTAN TERMINOLOGY (8 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "kaftan-moroccan",
    english: "Moroccan Kaftan",
    arabic: "قفطان مغربي",
    hebrew: "קפטן מרוקאי",
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
    hebrew: "קפטן חליג'י",
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
    hebrew: "קפטן מודרני",
    category: "traditional_wear",
    subcategory: "kaftan",
    description: "Contemporary kaftan with modern cuts and prints",
    searchTerms: ["modern kaftan", "قفطان عصري", "contemporary kaftan"],
    imageKeywords: ["modern kaftan", "contemporary robe"],
  },
  {
    id: "kaftan-wedding",
    english: "Wedding Kaftan",
    arabic: "قفطان زفاف",
    hebrew: "קפטן חתונה",
    category: "traditional_wear",
    subcategory: "kaftan",
    dialects: { maghreb: "قفطان العروسة" },
    description: "Luxurious kaftan worn during wedding celebrations",
    searchTerms: ["wedding kaftan", "bridal kaftan", "قفطان زفاف"],
    imageKeywords: ["bridal kaftan", "wedding kaftan"],
  },
  {
    id: "kaftan-evening",
    english: "Evening Kaftan",
    arabic: "قفطان سهرة",
    hebrew: "קפטן ערב",
    category: "traditional_wear",
    subcategory: "kaftan",
    description: "Elegant kaftan for evening occasions and parties",
    searchTerms: ["evening kaftan", "party kaftan", "قفطان سهرة"],
    imageKeywords: ["evening kaftan", "party dress"],
  },
  {
    id: "kaftan-casual",
    english: "Casual Kaftan",
    arabic: "قفطان كاجوال",
    hebrew: "קפטן קז'ואל",
    category: "traditional_wear",
    subcategory: "kaftan",
    description: "Relaxed kaftan for everyday wear",
    searchTerms: ["casual kaftan", "daily kaftan", "قفطان كاجوال"],
    imageKeywords: ["casual kaftan", "daily wear"],
  },
  {
    id: "kaftan-dress",
    english: "Kaftan Dress",
    arabic: "فستان قفطان",
    hebrew: "שמלת קפטן",
    category: "traditional_wear",
    subcategory: "kaftan",
    description: "Dress-style kaftan with defined waist",
    searchTerms: ["kaftan dress", "فستان قفطان", "fitted kaftan"],
    imageKeywords: ["kaftan dress", "fitted kaftan"],
  },
  {
    id: "kaftan-jalabiya",
    english: "Jalabiya",
    arabic: "جلابية",
    hebrew: "ג'לאביה",
    category: "traditional_wear",
    subcategory: "kaftan",
    dialects: { egyptian: "جلابية", gulf: "جلابية" },
    description: "Traditional loose-fitting robe worn in Egypt and Gulf regions",
    searchTerms: ["jalabiya", "جلابية", "egyptian dress"],
    imageKeywords: ["jalabiya", "egyptian traditional"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // THOBE / MEN'S TRADITIONAL WEAR (6 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "thobe-saudi",
    english: "Saudi Thobe",
    arabic: "ثوب سعودي",
    hebrew: "ת'וב סעודי",
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
    hebrew: "קנדורה אמירתית",
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
    hebrew: "דשדאשה כוויתית",
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
    hebrew: "ג'ללבה מרוקאית",
    category: "traditional_wear",
    subcategory: "thobe",
    dialects: { maghreb: "جلابة" },
    description: "Hooded Moroccan outer robe with pointed hood",
    searchTerms: ["djellaba", "jellaba", "جلابة", "moroccan robe"],
    imageKeywords: ["djellaba", "moroccan robe", "hooded robe"],
  },
  {
    id: "thobe-bisht",
    english: "Bisht",
    arabic: "بشت",
    hebrew: "בשת",
    category: "traditional_wear",
    subcategory: "thobe",
    dialects: { gulf: "بشت" },
    description: "Traditional men's cloak worn over thobe for special occasions",
    searchTerms: ["bisht", "بشت", "arab cloak", "mens cloak"],
    imageKeywords: ["bisht", "arabic cloak", "formal cloak"],
  },
  {
    id: "thobe-gutra",
    english: "Gutra",
    arabic: "غترة",
    hebrew: "גוטרה",
    category: "traditional_wear",
    subcategory: "thobe",
    description: "Traditional square headscarf worn with thobe",
    searchTerms: ["gutra", "غترة", "headscarf", "keffiyeh"],
    imageKeywords: ["gutra", "headscarf", "traditional headdress"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FABRICS IN ARABIC & HEBREW (12 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "fabric-nida",
    english: "Nida Fabric",
    arabic: "قماش نيدا",
    hebrew: "בד נידה",
    category: "fabrics",
    description: "Matte crepe-like fabric popular for abayas",
    searchTerms: ["nida", "nida fabric", "قماش نيدا", "abaya fabric"],
    imageKeywords: ["nida fabric", "matte crepe"],
  },
  {
    id: "fabric-korean-nida",
    english: "Korean Nida",
    arabic: "نيدا كوري",
    hebrew: "נידה קוריאנית",
    category: "fabrics",
    description: "Premium quality nida fabric imported from Korea",
    searchTerms: ["korean nida", "نيدا كوري", "premium nida"],
    imageKeywords: ["korean nida", "premium abaya fabric"],
  },
  {
    id: "fabric-zoom",
    english: "Zoom Fabric",
    arabic: "قماش زوم",
    hebrew: "בד זום",
    category: "fabrics",
    description: "Lightweight stretchy fabric used in modern abayas",
    searchTerms: ["zoom fabric", "قماش زوم", "stretch abaya fabric"],
    imageKeywords: ["zoom fabric", "stretchy fabric"],
  },
  {
    id: "fabric-linen",
    english: "Linen",
    arabic: "كتان",
    hebrew: "פשתן",
    category: "fabrics",
    description: "Natural breathable linen fabric for summer garments",
    searchTerms: ["linen", "كتان", "summer fabric"],
    imageKeywords: ["linen fabric", "natural textile"],
  },
  {
    id: "fabric-organza",
    english: "Organza",
    arabic: "أورجانزا",
    hebrew: "אורגנזה",
    category: "fabrics",
    description: "Sheer, lightweight organza for overlays and details",
    searchTerms: ["organza", "أورجانزا", "sheer fabric"],
    imageKeywords: ["organza fabric", "sheer overlay"],
  },
  {
    id: "fabric-brocade",
    english: "Brocade",
    arabic: "ديباج",
    hebrew: "ברוקאד",
    category: "fabrics",
    dialects: { levantine: "بروكار", egyptian: "بروكاد" },
    description: "Richly decorative woven fabric often used in formal wear",
    searchTerms: ["brocade", "ديباج", "بروكار", "formal fabric"],
    imageKeywords: ["brocade fabric", "decorative textile"],
  },
  {
    id: "fabric-silk",
    english: "Silk",
    arabic: "حرير",
    hebrew: "משי",
    category: "fabrics",
    description: "Luxurious natural silk fabric with smooth texture",
    searchTerms: ["silk", "حرير", "silk fabric"],
    imageKeywords: ["silk fabric", "luxury textile"],
  },
  {
    id: "fabric-cotton",
    english: "Cotton",
    arabic: "قطن",
    hebrew: "כותנה",
    category: "fabrics",
    description: "Natural breathable cotton fabric for everyday wear",
    searchTerms: ["cotton", "قطن", "natural cotton"],
    imageKeywords: ["cotton fabric", "natural textile"],
  },
  {
    id: "fabric-crepe",
    english: "Crepe",
    arabic: "كريب",
    hebrew: "קרפ",
    category: "fabrics",
    description: "Textured fabric with crinkled surface for elegant drape",
    searchTerms: ["crepe", "كريب", "crepe fabric"],
    imageKeywords: ["crepe fabric", "textured textile"],
  },
  {
    id: "fabric-chiffon",
    english: "Chiffon Fabric",
    arabic: "قماش شيفون",
    hebrew: "בד שיפון",
    category: "fabrics",
    description: "Sheer lightweight fabric for overlays and scarves",
    searchTerms: ["chiffon fabric", "قماش شيفون", "sheer fabric"],
    imageKeywords: ["chiffon fabric", "sheer textile"],
  },
  {
    id: "fabric-satin",
    english: "Satin",
    arabic: "ساتان",
    hebrew: "סאטן",
    category: "fabrics",
    description: "Smooth glossy fabric with lustrous surface",
    searchTerms: ["satin", "ساتان", "satin fabric"],
    imageKeywords: ["satin fabric", "glossy textile"],
  },
  {
    id: "fabric-velvet",
    english: "Velvet",
    arabic: "مخمل",
    hebrew: "קטיפה",
    category: "fabrics",
    description: "Luxurious plush fabric with soft dense pile",
    searchTerms: ["velvet", "مخمل", "velvet fabric"],
    imageKeywords: ["velvet fabric", "plush textile"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLORS IN ARABIC & HEBREW (10 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "color-black",
    english: "Black",
    arabic: "أسود",
    hebrew: "שחור",
    category: "colors",
    description: "Classic black color for traditional abayas",
    searchTerms: ["black", "أسود", "שחור", "dark"],
    imageKeywords: ["black", "dark color"],
  },
  {
    id: "color-white",
    english: "White",
    arabic: "أبيض",
    hebrew: "לבן",
    category: "colors",
    description: "Pure white for summer and formal wear",
    searchTerms: ["white", "أبيض", "לבן", "light"],
    imageKeywords: ["white", "light color"],
  },
  {
    id: "color-navy",
    english: "Navy Blue",
    arabic: "كحلي",
    hebrew: "כחול כהה",
    category: "colors",
    description: "Deep navy blue for elegant modest wear",
    searchTerms: ["navy", "كحلي", "כחול כהה", "dark blue"],
    imageKeywords: ["navy blue", "dark blue"],
  },
  {
    id: "color-burgundy",
    english: "Burgundy",
    arabic: "عنابي",
    hebrew: "בורדו",
    category: "colors",
    description: "Rich burgundy wine color for special occasions",
    searchTerms: ["burgundy", "عنابي", "בורדו", "wine red"],
    imageKeywords: ["burgundy", "wine color"],
  },
  {
    id: "color-beige",
    english: "Beige",
    arabic: "بيج",
    hebrew: "בז'",
    category: "colors",
    description: "Neutral beige tone for everyday wear",
    searchTerms: ["beige", "بيج", "בז'", "neutral"],
    imageKeywords: ["beige", "neutral tone"],
  },
  {
    id: "color-cream",
    english: "Cream",
    arabic: "كريمي",
    hebrew: "קרם",
    category: "colors",
    description: "Soft cream color for elegant looks",
    searchTerms: ["cream", "كريمي", "קרם", "off-white"],
    imageKeywords: ["cream", "off-white"],
  },
  {
    id: "color-olive",
    english: "Olive Green",
    arabic: "زيتوني",
    hebrew: "ירוק זית",
    category: "colors",
    description: "Earthy olive green for natural look",
    searchTerms: ["olive", "زيتوني", "ירוק זית", "green"],
    imageKeywords: ["olive green", "earthy"],
  },
  {
    id: "color-mauve",
    english: "Mauve",
    arabic: "موف",
    hebrew: "סגלגל-ורוד",
    category: "colors",
    description: "Soft mauve purple-pink tone",
    searchTerms: ["mauve", "موف", "purple", "pink"],
    imageKeywords: ["mauve", "purple pink"],
  },
  {
    id: "color-gold",
    english: "Gold",
    arabic: "ذهبي",
    hebrew: "זהב",
    category: "colors",
    description: "Rich golden color for festive wear",
    searchTerms: ["gold", "ذهبي", "זהב", "golden"],
    imageKeywords: ["gold", "golden"],
  },
  {
    id: "color-silver",
    english: "Silver",
    arabic: "فضي",
    hebrew: "כסף",
    category: "colors",
    description: "Elegant silver tone for modern looks",
    searchTerms: ["silver", "فضي", "כסף", "metallic"],
    imageKeywords: ["silver", "metallic"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SIZE TERMINOLOGY FOR MENA (8 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "size-small",
    english: "Small",
    arabic: "صغير",
    hebrew: "קטן",
    category: "sizes",
    description: "Small size - typically fits US 4-6",
    searchTerms: ["small", "صغير", "קטן", "S", "size S"],
    imageKeywords: ["small size"],
  },
  {
    id: "size-medium",
    english: "Medium",
    arabic: "وسط",
    hebrew: "בינוני",
    category: "sizes",
    description: "Medium size - typically fits US 8-10",
    searchTerms: ["medium", "وسط", "בינוני", "M", "size M"],
    imageKeywords: ["medium size"],
  },
  {
    id: "size-large",
    english: "Large",
    arabic: "كبير",
    hebrew: "גדול",
    category: "sizes",
    description: "Large size - typically fits US 12-14",
    searchTerms: ["large", "كبير", "גדול", "L", "size L"],
    imageKeywords: ["large size"],
  },
  {
    id: "size-xlarge",
    english: "Extra Large",
    arabic: "كبير جداً",
    hebrew: "גדול מאוד",
    category: "sizes",
    description: "Extra large size - typically fits US 16-18",
    searchTerms: ["xlarge", "كبير جداً", "גדול מאוד", "XL", "size XL"],
    imageKeywords: ["extra large"],
  },
  {
    id: "size-plus",
    english: "Plus Size",
    arabic: "مقاسات كبيرة",
    hebrew: "מידות פלוס",
    category: "sizes",
    description: "Plus size range for curvy figures",
    searchTerms: ["plus size", "مقاسات كبيرة", "מידות פלוס", "curvy"],
    imageKeywords: ["plus size"],
  },
  {
    id: "size-free",
    english: "Free Size",
    arabic: "مقاس حر",
    hebrew: "מידה חופשית",
    category: "sizes",
    description: "One-size-fits-most design",
    searchTerms: ["free size", "مقاس حر", "מידה חופשית", "one size"],
    imageKeywords: ["free size"],
  },
  {
    id: "size-length-52",
    english: "52 Inch Length",
    arabic: "طول 52 بوصة",
    hebrew: "אורך 52 אינטש",
    category: "sizes",
    description: "Standard abaya length for average height (52 inches)",
    searchTerms: ["52 inch", "طول 52", "52 אינטש", "standard length"],
    imageKeywords: ["52 inch length"],
  },
  {
    id: "size-length-56",
    english: "56 Inch Length",
    arabic: "طول 56 بوصة",
    hebrew: "אורך 56 אינטש",
    category: "sizes",
    description: "Long abaya length for taller individuals (56 inches)",
    searchTerms: ["56 inch", "طول 56", "56 אינטש", "long length"],
    imageKeywords: ["56 inch length"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODEST FASHION ADDITIONAL TERMS (6 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "modest-niqab",
    english: "Niqab",
    arabic: "نقاب",
    hebrew: "נקאב",
    category: "modest_fashion",
    description: "Face veil covering all except the eyes",
    searchTerms: ["niqab", "نقاب", "נקאב", "face veil"],
    imageKeywords: ["niqab", "face veil"],
  },
  {
    id: "modest-khimar",
    english: "Khimar",
    arabic: "خمار",
    hebrew: "ח'ימאר",
    category: "modest_fashion",
    description: "Long cape-like headscarf covering chest and shoulders",
    searchTerms: ["khimar", "خمار", "ח'ימאר", "long hijab"],
    imageKeywords: ["khimar", "cape hijab"],
  },
  {
    id: "modest-shayla",
    english: "Shayla",
    arabic: "شيلة",
    hebrew: "שיילה",
    category: "modest_fashion",
    description: "Long rectangular wrap worn as headscarf",
    searchTerms: ["shayla", "شيلة", "שיילה", "wrap scarf"],
    imageKeywords: ["shayla", "wrap hijab"],
  },
  {
    id: "modest-amira",
    english: "Amira Style",
    arabic: "أميرة",
    hebrew: "אמירה",
    category: "modest_fashion",
    description: "Two-piece hijab with cap and tube scarf",
    searchTerms: ["amira", "أميرة", "אמירה", "two piece hijab"],
    imageKeywords: ["amira hijab", "two piece"],
  },
  {
    id: "modest-hand-socks",
    english: "Hand Socks",
    arabic: "شرابات اليد",
    hebrew: "גרבי ידיים",
    category: "modest_fashion",
    description: "Fingerless gloves for wrist and forearm coverage",
    searchTerms: ["hand socks", "شرابات اليد", "גרבי ידיים", "arm cover"],
    imageKeywords: ["hand socks", "arm coverage"],
  },
  {
    id: "modest-arm-sleeves",
    english: "Arm Sleeves",
    arabic: "أكمام الذراع",
    hebrew: "שרוולי זרוע",
    category: "modest_fashion",
    description: "Detachable sleeves for additional arm coverage",
    searchTerms: ["arm sleeves", "أكمام الذراع", "שרוולי זרוע", "sleeve cover"],
    imageKeywords: ["arm sleeves", "coverage sleeves"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESSORIES (6 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "accessory-belt",
    english: "Waist Belt",
    arabic: "حزام خصر",
    hebrew: "חגורת מותניים",
    category: "accessories",
    subcategory: "belt",
    description: "Decorative belt for abayas and dresses",
    searchTerms: ["waist belt", "حزام خصر", "חגורת מותניים", "belt"],
    imageKeywords: ["waist belt", "dress belt"],
  },
  {
    id: "accessory-brooch",
    english: "Hijab Brooch",
    arabic: "دبوس الحجاب",
    hebrew: "סיכת חיג'אב",
    category: "accessories",
    subcategory: "jewelry",
    description: "Decorative pin for securing hijab",
    searchTerms: ["brooch", "hijab pin", "دبوس الحجاب", "סיכת חיג'אב"],
    imageKeywords: ["hijab brooch", "decorative pin"],
  },
  {
    id: "accessory-cap",
    english: "Inner Cap",
    arabic: "قبعة داخلية",
    hebrew: "כובע פנימי",
    category: "accessories",
    subcategory: "hijab",
    description: "Cap worn under hijab for coverage and grip",
    searchTerms: ["inner cap", "cap", "قبعة داخلية", "כובע פנימי"],
    imageKeywords: ["inner cap", "under scarf cap"],
  },
  {
    id: "accessory-volumizer",
    english: "Hijab Volumizer",
    arabic: "حشوة الحجاب",
    hebrew: "מנפח חיג'אב",
    category: "accessories",
    subcategory: "hijab",
    description: "Accessory to add volume and shape under hijab",
    searchTerms: ["volumizer", "hijab bun", "حشوة الحجاب", "מנפח חיג'אב"],
    imageKeywords: ["hijab volumizer", "bun accessory"],
  },
  {
    id: "accessory-neck-cover",
    english: "Neck Cover",
    arabic: "غطاء الرقبة",
    hebrew: "כיסוי צוואר",
    category: "accessories",
    subcategory: "hijab",
    description: "Additional piece for neck and chest coverage",
    searchTerms: ["neck cover", "غطاء الرقبة", "כיסוי צוואר", "chest cover"],
    imageKeywords: ["neck cover", "chest coverage"],
  },
  {
    id: "accessory-hijab-liner",
    english: "Hijab Liner",
    arabic: "بطانة الحجاب",
    hebrew: "בטנת חיג'אב",
    category: "accessories",
    subcategory: "hijab",
    description: "Thin inner layer worn under sheer hijabs",
    searchTerms: ["hijab liner", "بطانة الحجاب", "בטנת חיג'אב", "under layer"],
    imageKeywords: ["hijab liner", "inner layer"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BRIDAL WEAR (5 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "bridal-hijab-gown",
    english: "Bridal Hijab Gown",
    arabic: "فستان زفاف محتشم",
    hebrew: "שמלת כלה צנועה",
    category: "bridal",
    description: "Modest wedding gown designed for hijab-wearing brides",
    searchTerms: ["bridal hijab", "modest wedding dress", "فستان زفاف محتشم"],
    imageKeywords: ["modest bridal gown", "hijab wedding"],
  },
  {
    id: "bridal-kaftan",
    english: "Bridal Kaftan",
    arabic: "قفطان زفاف",
    hebrew: "קפטן כלה",
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
    hebrew: "ת'וב אל-נשאל",
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
    hebrew: "שמלת ליל החינה",
    category: "bridal",
    description: "Dress worn during the pre-wedding henna celebration",
    searchTerms: ["henna dress", "henna night", "فستان ليلة الحناء"],
    imageKeywords: ["henna night outfit", "pre-wedding dress"],
  },
  {
    id: "bridal-engagement-set",
    english: "Engagement Outfit",
    arabic: "طقم خطوبة",
    hebrew: "תלבושת אירוסין",
    category: "bridal",
    description: "Co-ordinated outfit for engagement ceremonies",
    searchTerms: ["engagement dress", "engagement outfit", "طقم خطوبة"],
    imageKeywords: ["engagement outfit", "formal occasion dress"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SEASONAL FASHION (5 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "seasonal-eid-thobe",
    english: "Eid Thobe",
    arabic: "ثوب العيد",
    hebrew: "ת'וב חג",
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
    hebrew: "עבאית חג",
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
    hebrew: "קולקציית רמדאן",
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
    hebrew: "תלבושת תרוויח",
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
    hebrew: "שמלת אפטאר",
    category: "seasonal",
    subcategory: "ramadan",
    description: "Elegant dress suitable for iftar dinner gatherings",
    searchTerms: ["iftar dress", "ramadan evening wear", "فستان سهرة إفطار"],
    imageKeywords: ["iftar outfit", "evening modest dress"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHILDREN'S MODEST WEAR (4 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "children-abaya",
    english: "Children's Abaya",
    arabic: "عباءة أطفال",
    hebrew: "עבאית ילדים",
    category: "children",
    description: "Mini abaya designed for girls",
    searchTerms: ["kids abaya", "children abaya", "عباءة أطفال", "girls abaya"],
    imageKeywords: ["kids abaya", "children modest wear"],
  },
  {
    id: "children-thobe",
    english: "Children's Thobe",
    arabic: "ثوب أطفال",
    hebrew: "ת'וב ילדים",
    category: "children",
    description: "Scaled-down thobe for boys",
    searchTerms: ["kids thobe", "children thobe", "ثوب أطفال", "boys thobe"],
    imageKeywords: ["kids thobe", "boys traditional wear"],
  },
  {
    id: "children-hijab",
    english: "Children's Hijab",
    arabic: "حجاب أطفال",
    hebrew: "חיג'אב ילדים",
    category: "children",
    description: "Lightweight and comfortable hijab for girls",
    searchTerms: ["kids hijab", "girls hijab", "حجاب أطفال"],
    imageKeywords: ["kids hijab", "girls head cover"],
  },
  {
    id: "children-eid-outfit",
    english: "Children's Eid Outfit",
    arabic: "ملابس عيد للأطفال",
    hebrew: "תלבושת חג לילדים",
    category: "children",
    subcategory: "seasonal",
    description: "Festive outfit for children during Eid celebrations",
    searchTerms: ["kids eid outfit", "eid clothes children", "ملابس عيد للأطفال"],
    imageKeywords: ["kids eid outfit", "children festive wear"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN FUSION FASHION (6 terms)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "modern-modest-blazer",
    english: "Modest Blazer Set",
    arabic: "طقم بليزر محتشم",
    hebrew: "חליפת בלייזר צנועה",
    category: "modern_fusion",
    description: "Co-ordinated blazer and trouser set with modest coverage",
    searchTerms: ["modest blazer", "طقم بليزر محتشم", "formal modest"],
    imageKeywords: ["modest blazer", "work wear modest"],
  },
  {
    id: "modern-modest-jumpsuit",
    english: "Modest Jumpsuit",
    arabic: "جمبسوت محتشم",
    hebrew: "ג'אמפסוט צנוע",
    category: "modern_fusion",
    description: "Full-coverage jumpsuit with loose fit",
    searchTerms: ["modest jumpsuit", "جمبسوت محتشم", "covered jumpsuit"],
    imageKeywords: ["modest jumpsuit", "full coverage"],
  },
  {
    id: "modern-burkini",
    english: "Burkini",
    arabic: "بوركيني",
    hebrew: "בורקיני",
    category: "modern_fusion",
    description: "Full-coverage swimwear for modest swimming",
    searchTerms: ["burkini", "بوركيني", "modest swimwear", "islamic swimwear"],
    imageKeywords: ["burkini", "modest swimwear"],
  },
  {
    id: "modern-sport-hijab",
    english: "Sport Hijab",
    arabic: "حجاب رياضي",
    hebrew: "חיג'אב ספורטיבי",
    category: "modern_fusion",
    description: "Performance hijab for athletic activities",
    searchTerms: ["sport hijab", "athletic hijab", "حجاب رياضي"],
    imageKeywords: ["sport hijab", "athletic headwear"],
  },
  {
    id: "modern-maxi-cardigan",
    english: "Maxi Cardigan",
    arabic: "كارديغان طويل",
    hebrew: "קרדיגן מקסי",
    category: "modern_fusion",
    description: "Floor-length cardigan used as a casual modest layer",
    searchTerms: ["maxi cardigan", "كارديغان طويل", "long cardigan"],
    imageKeywords: ["maxi cardigan", "long layering piece"],
  },
  {
    id: "modern-co-ord-set",
    english: "Modest Co-Ord Set",
    arabic: "طقم منسّق محتشم",
    hebrew: "סט מתואם צנוע",
    category: "modern_fusion",
    description: "Matching top-and-bottom set with full coverage",
    searchTerms: ["co-ord set", "matching set modest", "طقم منسّق محتشم"],
    imageKeywords: ["matching set", "coordinated modest outfit"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Category metadata with translations
// ═══════════════════════════════════════════════════════════════════════════

export const CATEGORY_METADATA: Record<
  FashionCategory,
  { english: string; arabic: string; hebrew: string }
> = {
  traditional_wear: {
    english: "Traditional Wear",
    arabic: "الملابس التقليدية",
    hebrew: "לבוש מסורתי",
  },
  modest_fashion: {
    english: "Modest Fashion",
    arabic: "الأزياء المحتشمة",
    hebrew: "אופנה צנועה",
  },
  accessories: {
    english: "Accessories",
    arabic: "إكسسوارات",
    hebrew: "אביזרים",
  },
  fabrics: {
    english: "Fabrics",
    arabic: "أقمشة",
    hebrew: "בדים",
  },
  modern_fusion: {
    english: "Modern Fusion",
    arabic: "اندماج عصري",
    hebrew: "פיוז'ן מודרני",
  },
  bridal: {
    english: "Bridal",
    arabic: "أزياء الزفاف",
    hebrew: "כלה",
  },
  seasonal: {
    english: "Seasonal",
    arabic: "أزياء موسمية",
    hebrew: "עונתי",
  },
  children: {
    english: "Children",
    arabic: "أطفال",
    hebrew: "ילדים",
  },
  colors: {
    english: "Colors",
    arabic: "ألوان",
    hebrew: "צבעים",
  },
  sizes: {
    english: "Sizes",
    arabic: "مقاسات",
    hebrew: "מידות",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fuzzyMatch(query: string, target: string): boolean {
  const lowerTarget = target.toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.every((token) => lowerTarget.includes(token));
}

function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0640]/g, "")
    .replace(/[\u0591-\u05C7]/g, "")
    .trim();
}

function getLocalizedTerm(entry: FashionDBEntry, locale: FashionLocale): string {
  switch (locale) {
    case "ar":
      return entry.arabic;
    case "he":
      return entry.hebrew;
    case "en":
    default:
      return entry.english;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getFashionTerm(
  termId: string,
  locale: FashionLocale = "en",
): FashionTermResult | null {
  const entry = FASHION_DATABASE.find((e) => e.id === termId);
  if (!entry) return null;

  return {
    id: entry.id,
    term: getLocalizedTerm(entry, locale),
    english: entry.english,
    arabic: entry.arabic,
    hebrew: entry.hebrew,
    category: entry.category,
    subcategory: entry.subcategory,
    description: entry.description,
  };
}

export function searchFashionTerms(
  query: string,
  locale: FashionLocale = "en",
): FashionTermResult[] {
  if (!query.trim()) return [];

  const normalizedQuery = normalizeSearch(query);
  const results: Array<{ entry: FashionDBEntry; score: number }> = [];

  for (const entry of FASHION_DATABASE) {
    let score = 0;
    const localizedTerm = normalizeSearch(getLocalizedTerm(entry, locale));
    const englishTerm = normalizeSearch(entry.english);
    const arabicTerm = normalizeSearch(entry.arabic);
    const hebrewTerm = normalizeSearch(entry.hebrew);

    if (localizedTerm === normalizedQuery) {
      score = 100;
    } else if (localizedTerm.startsWith(normalizedQuery)) {
      score = 80;
    } else if (localizedTerm.includes(normalizedQuery)) {
      score = 60;
    } else if (englishTerm === normalizedQuery) {
      score = 50;
    } else if (englishTerm.includes(normalizedQuery)) {
      score = 40;
    } else if (
      entry.searchTerms.some((term) =>
        fuzzyMatch(normalizedQuery, normalizeSearch(term)),
      )
    ) {
      score = 30;
    } else if (arabicTerm.includes(normalizedQuery)) {
      score = 25;
    } else if (hebrewTerm.includes(normalizedQuery)) {
      score = 25;
    }

    if (score > 0) {
      results.push({ entry, score });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results.map((r) => ({
    id: r.entry.id,
    term: getLocalizedTerm(r.entry, locale),
    english: r.entry.english,
    arabic: r.entry.arabic,
    hebrew: r.entry.hebrew,
    category: r.entry.category,
    subcategory: r.entry.subcategory,
    description: r.entry.description,
  }));
}

export function getFashionCategories(
  locale: FashionLocale = "en",
): FashionCategoryResult[] {
  const categories = Object.keys(CATEGORY_METADATA) as FashionCategory[];

  return categories.map((cat) => {
    const meta = CATEGORY_METADATA[cat];
    const subcategories = [
      ...new Set(
        FASHION_DATABASE.filter((e) => e.category === cat && e.subcategory)
          .map((e) => e.subcategory!),
      ),
    ];

    return {
      id: cat,
      name: locale === "ar" ? meta.arabic : locale === "he" ? meta.hebrew : meta.english,
      english: meta.english,
      arabic: meta.arabic,
      hebrew: meta.hebrew,
      subcategories: subcategories.length > 0 ? subcategories : undefined,
    };
  });
}

export function getTermsByCategory(
  category: FashionCategory,
  locale: FashionLocale = "en",
): FashionTermResult[] {
  return FASHION_DATABASE.filter((e) => e.category === category).map((entry) => ({
    id: entry.id,
    term: getLocalizedTerm(entry, locale),
    english: entry.english,
    arabic: entry.arabic,
    hebrew: entry.hebrew,
    category: entry.category,
    subcategory: entry.subcategory,
    description: entry.description,
  }));
}

export function getTermsBySubcategory(
  subcategory: string,
  locale: FashionLocale = "en",
): FashionTermResult[] {
  return FASHION_DATABASE.filter((e) => e.subcategory === subcategory).map(
    (entry) => ({
      id: entry.id,
      term: getLocalizedTerm(entry, locale),
      english: entry.english,
      arabic: entry.arabic,
      hebrew: entry.hebrew,
      category: entry.category,
      subcategory: entry.subcategory,
      description: entry.description,
    }),
  );
}

export function getAllTerms(): FashionDBEntry[] {
  return JSON.parse(JSON.stringify(FASHION_DATABASE)) as FashionDBEntry[];
}

export function getTermCount(): number {
  return FASHION_DATABASE.length;
}

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

export function getFashionByCategory(category: FashionCategory): FashionDBEntry[] {
  return FASHION_DATABASE.filter((entry) => entry.category === category);
}
