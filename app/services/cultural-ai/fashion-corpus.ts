import type { ArabicDialect, FashionTerm } from "./types";

export const FASHION_TERMS: FashionTerm[] = [
  // Traditional garments
  { english: "abaya", arabic: "عباءة", category: "traditional", notes: "Full-length outer garment" },
  { english: "kaftan", arabic: "قفطان", category: "traditional", notes: "Long, loose garment" },
  { english: "thobe", arabic: "ثوب", category: "traditional", dialect: "gulf", notes: "Ankle-length robe, also called dishdasha" },
  { english: "dishdasha", arabic: "دشداشة", category: "traditional", dialect: "gulf", notes: "Gulf-style thobe" },
  { english: "bisht", arabic: "بشت", category: "traditional", dialect: "gulf", notes: "Cloak worn over thobe for formal occasions" },
  { english: "jalabiya", arabic: "جلابية", category: "traditional", notes: "Loose-fitting robe" },
  { english: "sirwal", arabic: "سروال", category: "traditional", notes: "Loose trousers" },
  { english: "kandura", arabic: "كندورة", category: "traditional", dialect: "gulf", notes: "UAE term for thobe" },
  { english: "farwa", arabic: "فروة", category: "traditional", notes: "Traditional fur-lined cloak" },

  // Modest fashion
  { english: "modest fashion", arabic: "أزياء محتشمة", category: "modest", notes: "Fashion adhering to modesty standards" },
  { english: "long sleeve", arabic: "أكمام طويلة", category: "modest" },
  { english: "full-length", arabic: "طول كامل", category: "modest" },
  { english: "loose-fit", arabic: "قصة واسعة", category: "modest" },
  { english: "maxi dress", arabic: "فستان طويل", category: "modest" },
  { english: "tunic", arabic: "تونيك", category: "modest" },
  { english: "wide-leg pants", arabic: "بنطلون واسع", category: "modest" },

  // Accessories & headwear
  { english: "hijab", arabic: "حجاب", category: "accessories", notes: "Head covering" },
  { english: "niqab", arabic: "نقاب", category: "accessories", notes: "Face veil" },
  { english: "shayla", arabic: "شيلة", category: "accessories", dialect: "gulf", notes: "Long rectangular scarf" },
  { english: "ghutra", arabic: "غترة", category: "accessories", dialect: "gulf", notes: "Traditional men's head cloth" },
  { english: "agal", arabic: "عقال", category: "accessories", dialect: "gulf", notes: "Black cord holding ghutra" },
  { english: "taqiyah", arabic: "طاقية", category: "accessories", notes: "Rounded skullcap" },
  { english: "khimar", arabic: "خمار", category: "accessories", notes: "Cape-like veil" },
  { english: "al-amira", arabic: "الأميرة", category: "accessories", notes: "Two-piece veil" },
  { english: "burqa", arabic: "برقع", category: "accessories", notes: "Full face covering" },

  // Fabrics
  { english: "chiffon", arabic: "شيفون", category: "fabrics" },
  { english: "silk", arabic: "حرير", category: "fabrics" },
  { english: "cotton", arabic: "قطن", category: "fabrics" },
  { english: "linen", arabic: "كتان", category: "fabrics" },
  { english: "crepe", arabic: "كريب", category: "fabrics" },
  { english: "satin", arabic: "ساتان", category: "fabrics" },
  { english: "velvet", arabic: "مخمل", category: "fabrics" },

  // Modern fashion terms
  { english: "streetwear", arabic: "أزياء الشارع", category: "modern" },
  { english: "athleisure", arabic: "أزياء رياضية عصرية", category: "modern" },
  { english: "couture", arabic: "أزياء راقية", category: "modern" },
  { english: "ready-to-wear", arabic: "ملابس جاهزة", category: "modern" },
  { english: "resort wear", arabic: "أزياء المنتجعات", category: "modern" },
  { english: "capsule collection", arabic: "مجموعة كبسولة", category: "modern" },
];

/**
 * Find fashion terms that appear in the given text (case-insensitive).
 */
export function findFashionTerms(text: string): FashionTerm[] {
  const lowerText = text.toLowerCase();
  return FASHION_TERMS.filter(
    (term) =>
      lowerText.includes(term.english.toLowerCase()) ||
      text.includes(term.arabic),
  );
}

/**
 * Get all fashion terms belonging to a specific category.
 */
export function getFashionTermsByCategory(category: string): FashionTerm[] {
  const normalizedCategory = category.toLowerCase();
  return FASHION_TERMS.filter(
    (term) => term.category.toLowerCase() === normalizedCategory,
  );
}

/**
 * Get fashion terms specific to a given Arabic dialect.
 */
export function getFashionTermsByDialect(dialect: ArabicDialect): FashionTerm[] {
  return FASHION_TERMS.filter(
    (term) => !term.dialect || term.dialect === dialect,
  );
}
