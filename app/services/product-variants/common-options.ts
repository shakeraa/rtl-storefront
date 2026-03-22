/**
 * Pre-built translations for common Shopify product option names and values.
 * Used as a fast-path lookup before falling back to the translation engine.
 */

type LocaleTranslations = Record<string, string>;
type TranslationMap = Record<string, LocaleTranslations>;

// ---------------------------------------------------------------------------
// Option name translations
// ---------------------------------------------------------------------------

const OPTION_NAME_TRANSLATIONS: TranslationMap = {
  Size: {
    en: "Size",
    ar: "المقاس",
    he: "מידה",
    fa: "اندازه",
  },
  Color: {
    en: "Color",
    ar: "اللون",
    he: "צבע",
    fa: "رنگ",
  },
  Material: {
    en: "Material",
    ar: "الخامة",
    he: "חומר",
    fa: "جنس",
  },
  Style: {
    en: "Style",
    ar: "الطراز",
    he: "סגנון",
    fa: "سبک",
  },
  Length: {
    en: "Length",
    ar: "الطول",
    he: "אורך",
    fa: "طول",
  },
  Width: {
    en: "Width",
    ar: "العرض",
    he: "רוחב",
    fa: "عرض",
  },
  Weight: {
    en: "Weight",
    ar: "الوزن",
    he: "משקל",
    fa: "وزن",
  },
};

// ---------------------------------------------------------------------------
// Option value translations
// ---------------------------------------------------------------------------

const SIZE_VALUE_TRANSLATIONS: TranslationMap = {
  XS: {
    en: "XS",
    ar: "XS",
    he: "XS",
    fa: "XS",
  },
  S: {
    en: "S",
    ar: "S",
    he: "S",
    fa: "S",
  },
  M: {
    en: "M",
    ar: "M",
    he: "M",
    fa: "M",
  },
  L: {
    en: "L",
    ar: "L",
    he: "L",
    fa: "L",
  },
  XL: {
    en: "XL",
    ar: "XL",
    he: "XL",
    fa: "XL",
  },
  XXL: {
    en: "XXL",
    ar: "XXL",
    he: "XXL",
    fa: "XXL",
  },
  XXXL: {
    en: "XXXL",
    ar: "XXXL",
    he: "XXXL",
    fa: "XXXL",
  },
  "One Size": {
    en: "One Size",
    ar: "مقاس واحد",
    he: "מידה אחת",
    fa: "سایز واحد",
  },
};

const COLOR_VALUE_TRANSLATIONS: TranslationMap = {
  Black: {
    en: "Black",
    ar: "أسود",
    he: "שחור",
    fa: "مشکی",
  },
  White: {
    en: "White",
    ar: "أبيض",
    he: "לבן",
    fa: "سفید",
  },
  Red: {
    en: "Red",
    ar: "أحمر",
    he: "אדום",
    fa: "قرمز",
  },
  Blue: {
    en: "Blue",
    ar: "أزرق",
    he: "כחול",
    fa: "آبی",
  },
  Green: {
    en: "Green",
    ar: "أخضر",
    he: "ירוק",
    fa: "سبز",
  },
  Yellow: {
    en: "Yellow",
    ar: "أصفر",
    he: "צהוב",
    fa: "زرد",
  },
  Pink: {
    en: "Pink",
    ar: "وردي",
    he: "ורוד",
    fa: "صورتی",
  },
  Purple: {
    en: "Purple",
    ar: "بنفسجي",
    he: "סגול",
    fa: "بنفش",
  },
  Orange: {
    en: "Orange",
    ar: "برتقالي",
    he: "כתום",
    fa: "نارنجی",
  },
  Brown: {
    en: "Brown",
    ar: "بني",
    he: "חום",
    fa: "قهوه‌ای",
  },
  Grey: {
    en: "Grey",
    ar: "رمادي",
    he: "אפור",
    fa: "خاکستری",
  },
  Beige: {
    en: "Beige",
    ar: "بيج",
    he: "בז׳",
    fa: "بژ",
  },
  Navy: {
    en: "Navy",
    ar: "كحلي",
    he: "כחול כהה",
    fa: "سرمه‌ای",
  },
  Gold: {
    en: "Gold",
    ar: "ذهبي",
    he: "זהב",
    fa: "طلایی",
  },
  Silver: {
    en: "Silver",
    ar: "فضي",
    he: "כסף",
    fa: "نقره‌ای",
  },
};

const MATERIAL_VALUE_TRANSLATIONS: TranslationMap = {
  Cotton: {
    en: "Cotton",
    ar: "قطن",
    he: "כותנה",
    fa: "نخی",
  },
  Polyester: {
    en: "Polyester",
    ar: "بوليستر",
    he: "פוליאסטר",
    fa: "پلی‌استر",
  },
  Silk: {
    en: "Silk",
    ar: "حرير",
    he: "משי",
    fa: "ابریشم",
  },
  Wool: {
    en: "Wool",
    ar: "صوف",
    he: "צמר",
    fa: "پشم",
  },
  Linen: {
    en: "Linen",
    ar: "كتان",
    he: "פשתן",
    fa: "کتان",
  },
  Leather: {
    en: "Leather",
    ar: "جلد",
    he: "עור",
    fa: "چرم",
  },
  Denim: {
    en: "Denim",
    ar: "دنيم",
    he: "ג׳ינס",
    fa: "جین",
  },
  Satin: {
    en: "Satin",
    ar: "ساتان",
    he: "סאטן",
    fa: "ساتن",
  },
  Velvet: {
    en: "Velvet",
    ar: "مخمل",
    he: "קטיפה",
    fa: "مخمل",
  },
  Chiffon: {
    en: "Chiffon",
    ar: "شيفون",
    he: "שיפון",
    fa: "شیفون",
  },
};

// ---------------------------------------------------------------------------
// Merged value map for fast lookups
// ---------------------------------------------------------------------------

const ALL_VALUE_TRANSLATIONS: TranslationMap = {
  ...SIZE_VALUE_TRANSLATIONS,
  ...COLOR_VALUE_TRANSLATIONS,
  ...MATERIAL_VALUE_TRANSLATIONS,
};

// ---------------------------------------------------------------------------
// Case-insensitive lookup indexes (built once)
// ---------------------------------------------------------------------------

const OPTION_NAME_INDEX: Map<string, string> = new Map(
  Object.keys(OPTION_NAME_TRANSLATIONS).map((key) => [key.toLowerCase(), key]),
);

const VALUE_INDEX: Map<string, string> = new Map(
  Object.keys(ALL_VALUE_TRANSLATIONS).map((key) => [key.toLowerCase(), key]),
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function normalizeLocale(locale: string): string {
  return locale.split("-")[0]?.toLowerCase() ?? "en";
}

/**
 * Returns the pre-built translation for a common option name,
 * or `null` if the name is not in the dictionary.
 */
export function getOptionNameTranslation(
  name: string,
  locale: string,
): string | null {
  const canonicalKey = OPTION_NAME_INDEX.get(name.toLowerCase());
  if (!canonicalKey) return null;

  const translations = OPTION_NAME_TRANSLATIONS[canonicalKey];
  if (!translations) return null;

  const base = normalizeLocale(locale);
  return translations[base] ?? null;
}

/**
 * Returns the pre-built translation for a common option value,
 * or `null` if the value is not in the dictionary.
 */
export function getOptionValueTranslation(
  value: string,
  locale: string,
): string | null {
  const canonicalKey = VALUE_INDEX.get(value.toLowerCase());
  if (!canonicalKey) return null;

  const translations = ALL_VALUE_TRANSLATIONS[canonicalKey];
  if (!translations) return null;

  const base = normalizeLocale(locale);
  return translations[base] ?? null;
}

/**
 * Returns `true` if the given name matches a known common product option name
 * (case-insensitive).
 */
export function isCommonOption(name: string): boolean {
  return OPTION_NAME_INDEX.has(name.toLowerCase());
}

/**
 * Returns `true` if the given value matches a known common product option value
 * (case-insensitive).
 */
export function isCommonValue(value: string): boolean {
  return VALUE_INDEX.has(value.toLowerCase());
}
