/**
 * Color Name Localization Service
 * T0319: Translation - Color Name Localization
 */

export type SupportedLocale = 'ar' | 'he' | 'en';
export type ColorShade = 'light' | 'dark' | 'pale' | 'deep' | 'bright' | 'muted';

export interface ColorTranslation {
  name: string;
  hex: string;
  shades?: Partial<Record<ColorShade, string>>;
}

export interface ColorSet {
  [colorKey: string]: ColorTranslation;
}

export const ARABIC_COLORS: ColorSet = {
  red: { name: 'أحمر', hex: '#FF0000', shades: { light: 'أحمر فاتح', dark: 'أحمر غامق', pale: 'أحمر باهت', deep: 'أحمر داكن', bright: 'أحمر زاهي' } },
  blue: { name: 'أزرق', hex: '#0000FF', shades: { light: 'أزرق فاتح', dark: 'أزرق غامق', pale: 'أزرق باهت', deep: 'أزرق داكن', bright: 'أزرق زاهي' } },
  green: { name: 'أخضر', hex: '#008000', shades: { light: 'أخضر فاتح', dark: 'أخضر غامق', pale: 'أخضر باهت', deep: 'أخضر داكن', bright: 'أخضر زاهي' } },
  black: { name: 'أسود', hex: '#000000' },
  white: { name: 'أبيض', hex: '#FFFFFF' },
  yellow: { name: 'أصفر', hex: '#FFFF00', shades: { light: 'أصفر فاتح', dark: 'أصفر غامق', pale: 'أصفر باهت', bright: 'أصفر زاهي' } },
  orange: { name: 'برتقالي', hex: '#FFA500', shades: { light: 'برتقالي فاتح', dark: 'برتقالي غامق', pale: 'برتقالي باهت' } },
  purple: { name: 'بنفسجي', hex: '#800080', shades: { light: 'بنفسجي فاتح', dark: 'بنفسجي غامق', deep: 'بنفسجي داكن' } },
  pink: { name: 'وردي', hex: '#FFC0CB', shades: { light: 'وردي فاتح', dark: 'وردي غامق', pale: 'وردي باهت', bright: 'وردي زاهي' } },
  brown: { name: 'بني', hex: '#8B4513', shades: { light: 'بني فاتح', dark: 'بني غامق', pale: 'بني باهت' } },
  gray: { name: 'رمادي', hex: '#808080', shades: { light: 'رمادي فاتح', dark: 'رمادي غامق', pale: 'رمادي باهت' } },
  beige: { name: 'بيج', hex: '#F5F5DC', shades: { light: 'بيج فاتح', dark: 'بيج غامق' } },
  navy: { name: 'كحلي', hex: '#000080', shades: { light: 'كحلي فاتح', dark: 'كحلي غامق' } },
  teal: { name: 'فيروزي', hex: '#008080', shades: { light: 'فيروزي فاتح', dark: 'فيروزي غامق' } },
  cyan: { name: 'سماوي', hex: '#00FFFF', shades: { light: 'سماوي فاتح', dark: 'سماوي غامق' } },
  magenta: { name: 'أرجواني', hex: '#FF00FF', shades: { light: 'أرجواني فاتح', dark: 'أرجواني غامق' } },
  lime: { name: 'ليموني', hex: '#00FF00', shades: { light: 'ليموني فاتح', dark: 'ليموني غامق' } },
  maroon: { name: 'عنابي', hex: '#800000', shades: { light: 'عنابي فاتح', dark: 'عنابي غامق' } },
  olive: { name: 'زيتوني', hex: '#808000', shades: { light: 'زيتوني فاتح', dark: 'زيتوني غامق' } },
  coral: { name: 'مرجاني', hex: '#FF7F50', shades: { light: 'مرجاني فاتح', dark: 'مرجاني غامق' } },
  gold: { name: 'ذهبي', hex: '#FFD700', shades: { light: 'ذهبي فاتح', dark: 'ذهبي غامق' } },
  silver: { name: 'فضي', hex: '#C0C0C0', shades: { light: 'فضي فاتح', dark: 'فضي غامق' } },
  cream: { name: 'كريمي', hex: '#FFFDD0' },
  turquoise: { name: 'تركواز', hex: '#40E0D0', shades: { light: 'تركواز فاتح', dark: 'تركواز غامق' } },
};

export const HEBREW_COLORS: ColorSet = {
  red: { name: 'אדום', hex: '#FF0000', shades: { light: 'אדום בהיר', dark: 'אדום כהה', pale: 'אדום בהה', deep: 'אדום עמוק', bright: 'אדום בוהק' } },
  blue: { name: 'כחול', hex: '#0000FF', shades: { light: 'כחול בהיר', dark: 'כחול כהה', pale: 'כחול בהה', deep: 'כחול עמוק', bright: 'כחול בוהק' } },
  green: { name: 'ירוק', hex: '#008000', shades: { light: 'ירוק בהיר', dark: 'ירוק כהה', pale: 'ירוק בהה', deep: 'ירוק עמוק', bright: 'ירוק בוהק' } },
  black: { name: 'שחור', hex: '#000000' },
  white: { name: 'לבן', hex: '#FFFFFF' },
  yellow: { name: 'צהוב', hex: '#FFFF00', shades: { light: 'צהוב בהיר', dark: 'צהוב כהה', pale: 'צהוב בהה', bright: 'צהוב בוהק' } },
  orange: { name: 'כתום', hex: '#FFA500', shades: { light: 'כתום בהיר', dark: 'כתום כהה', pale: 'כתום בהה' } },
  purple: { name: 'סגול', hex: '#800080', shades: { light: 'סגול בהיר', dark: 'סגול כהה', deep: 'סגול עמוק' } },
  pink: { name: 'ורוד', hex: '#FFC0CB', shades: { light: 'ורוד בהיר', dark: 'ורוד כהה', pale: 'ורוד בהה', bright: 'ורוד בוהק' } },
  brown: { name: 'חום', hex: '#8B4513', shades: { light: 'חום בהיר', dark: 'חום כהה', pale: 'חום בהה' } },
  gray: { name: 'אפור', hex: '#808080', shades: { light: 'אפור בהיר', dark: 'אפור כהה', pale: 'אפור בהה' } },
  beige: { name: 'בז', hex: '#F5F5DC', shades: { light: 'בז בהיר', dark: 'בז כהה' } },
  navy: { name: 'כחול כהה', hex: '#000080', shades: { light: 'כחול כהה בהיר', dark: 'כחול כהה כהה' } },
  teal: { name: 'טורקיז', hex: '#008080', shades: { light: 'טורקיז בהיר', dark: 'טורקיז כהה' } },
  cyan: { name: 'ציאן', hex: '#00FFFF', shades: { light: 'ציאן בהיר', dark: 'ציאן כהה' } },
  magenta: { name: 'מגנטה', hex: '#FF00FF', shades: { light: 'מגנטה בהיר', dark: 'מגנטה כהה' } },
  lime: { name: 'ליים', hex: '#00FF00', shades: { light: 'ליים בהיר', dark: 'ליים כהה' } },
  maroon: { name: 'בורדו', hex: '#800000', shades: { light: 'בורדו בהיר', dark: 'בורדו כהה' } },
  olive: { name: 'זית', hex: '#808000', shades: { light: 'זית בהיר', dark: 'זית כהة' } },
  coral: { name: 'קורל', hex: '#FF7F50', shades: { light: 'קורל בהיר', dark: 'קורל כהה' } },
  gold: { name: 'זהב', hex: '#FFD700', shades: { light: 'זהב בהיר', dark: 'זהב כהה' } },
  silver: { name: 'כסף', hex: '#C0C0C0', shades: { light: 'כסף בהיר', dark: 'כסף כהה' } },
  cream: { name: 'קרם', hex: '#FFFDD0' },
  turquoise: { name: 'טורקיז', hex: '#40E0D0', shades: { light: 'טורקיז בהיר', dark: 'טורקיז כהה' } },
};

export const ENGLISH_COLORS: ColorSet = {
  red: { name: 'Red', hex: '#FF0000', shades: { light: 'Light Red', dark: 'Dark Red', pale: 'Pale Red', deep: 'Deep Red', bright: 'Bright Red', muted: 'Muted Red' } },
  blue: { name: 'Blue', hex: '#0000FF', shades: { light: 'Light Blue', dark: 'Dark Blue', pale: 'Pale Blue', deep: 'Deep Blue', bright: 'Bright Blue', muted: 'Muted Blue' } },
  green: { name: 'Green', hex: '#008000', shades: { light: 'Light Green', dark: 'Dark Green', pale: 'Pale Green', deep: 'Deep Green', bright: 'Bright Green', muted: 'Muted Green' } },
  black: { name: 'Black', hex: '#000000' },
  white: { name: 'White', hex: '#FFFFFF' },
  yellow: { name: 'Yellow', hex: '#FFFF00', shades: { light: 'Light Yellow', dark: 'Dark Yellow', pale: 'Pale Yellow', bright: 'Bright Yellow', muted: 'Muted Yellow' } },
  orange: { name: 'Orange', hex: '#FFA500', shades: { light: 'Light Orange', dark: 'Dark Orange', pale: 'Pale Orange', muted: 'Muted Orange' } },
  purple: { name: 'Purple', hex: '#800080', shades: { light: 'Light Purple', dark: 'Dark Purple', deep: 'Deep Purple', muted: 'Muted Purple' } },
  pink: { name: 'Pink', hex: '#FFC0CB', shades: { light: 'Light Pink', dark: 'Dark Pink', pale: 'Pale Pink', bright: 'Bright Pink', muted: 'Muted Pink' } },
  brown: { name: 'Brown', hex: '#8B4513', shades: { light: 'Light Brown', dark: 'Dark Brown', pale: 'Pale Brown', muted: 'Muted Brown' } },
  gray: { name: 'Gray', hex: '#808080', shades: { light: 'Light Gray', dark: 'Dark Gray', pale: 'Pale Gray', muted: 'Muted Gray' } },
  beige: { name: 'Beige', hex: '#F5F5DC', shades: { light: 'Light Beige', dark: 'Dark Beige' } },
  navy: { name: 'Navy', hex: '#000080', shades: { light: 'Light Navy', dark: 'Dark Navy' } },
  teal: { name: 'Teal', hex: '#008080', shades: { light: 'Light Teal', dark: 'Dark Teal' } },
  cyan: { name: 'Cyan', hex: '#00FFFF', shades: { light: 'Light Cyan', dark: 'Dark Cyan' } },
  magenta: { name: 'Magenta', hex: '#FF00FF', shades: { light: 'Light Magenta', dark: 'Dark Magenta' } },
  lime: { name: 'Lime', hex: '#00FF00', shades: { light: 'Light Lime', dark: 'Dark Lime' } },
  maroon: { name: 'Maroon', hex: '#800000', shades: { light: 'Light Maroon', dark: 'Dark Maroon' } },
  olive: { name: 'Olive', hex: '#808000', shades: { light: 'Light Olive', dark: 'Dark Olive' } },
  coral: { name: 'Coral', hex: '#FF7F50', shades: { light: 'Light Coral', dark: 'Dark Coral' } },
  gold: { name: 'Gold', hex: '#FFD700', shades: { light: 'Light Gold', dark: 'Dark Gold' } },
  silver: { name: 'Silver', hex: '#C0C0C0', shades: { light: 'Light Silver', dark: 'Dark Silver' } },
  cream: { name: 'Cream', hex: '#FFFDD0' },
  turquoise: { name: 'Turquoise', hex: '#40E0D0', shades: { light: 'Light Turquoise', dark: 'Dark Turquoise' } },
};

const COLORS_BY_LOCALE: Record<SupportedLocale, ColorSet> = {
  ar: ARABIC_COLORS,
  he: HEBREW_COLORS,
  en: ENGLISH_COLORS,
};

function normalizeLocale(locale: string): SupportedLocale {
  const baseLocale = locale.split('-')[0]?.toLowerCase() || 'en';
  if (baseLocale === 'ar' || baseLocale === 'he' || baseLocale === 'en') {
    return baseLocale;
  }
  return 'en';
}

export function getColorName(color: string, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const colorSet = COLORS_BY_LOCALE[normalizedLocale];
  const colorKey = color.toLowerCase();
  return colorSet[colorKey]?.name || color;
}

export function getColorNamesList(locale: string): Array<{ key: string; name: string; hex: string; hasShades: boolean }> {
  const normalizedLocale = normalizeLocale(locale);
  const colorSet = COLORS_BY_LOCALE[normalizedLocale];
  return Object.entries(colorSet).map(([key, value]) => ({
    key,
    name: value.name,
    hex: value.hex,
    hasShades: !!value.shades && Object.keys(value.shades).length > 0,
  }));
}

export function getColorWithShade(color: string, shade: ColorShade, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const colorSet = COLORS_BY_LOCALE[normalizedLocale];
  const colorKey = color.toLowerCase();
  const colorData = colorSet[colorKey];
  if (!colorData) return color;
  const shadeName = colorData.shades?.[shade];
  if (shadeName) return shadeName;
  return colorData.name;
}

export function getColorShades(color: string, locale: string): Array<{ shade: ColorShade; name: string }> {
  const normalizedLocale = normalizeLocale(locale);
  const colorSet = COLORS_BY_LOCALE[normalizedLocale];
  const colorKey = color.toLowerCase();
  const colorData = colorSet[colorKey];
  if (!colorData?.shades) return [];
  return Object.entries(colorData.shades).map(([shade, name]) => ({ shade: shade as ColorShade, name }));
}

export function hasShades(color: string): boolean {
  const colorKey = color.toLowerCase();
  const colorData = ENGLISH_COLORS[colorKey];
  return !!colorData?.shades && Object.keys(colorData.shades).length > 0;
}

export function getColorHex(color: string): string | null {
  const colorKey = color.toLowerCase();
  return ENGLISH_COLORS[colorKey]?.hex || null;
}

export function searchColors(query: string, locale: string): Array<{ key: string; name: string; hex: string }> {
  const normalizedLocale = normalizeLocale(locale);
  const colorSet = COLORS_BY_LOCALE[normalizedLocale];
  const searchTerm = query.toLowerCase();
  return Object.entries(colorSet)
    .filter(([_, value]) => value.name.toLowerCase().includes(searchTerm))
    .map(([key, value]) => ({ key, name: value.name, hex: value.hex }));
}

export function getColorsByCategory(locale: string): {
  basic: Array<{ key: string; name: string; hex: string }>;
  bright: Array<{ key: string; name: string; hex: string }>;
  neutral: Array<{ key: string; name: string; hex: string }>;
  metallic: Array<{ key: string; name: string; hex: string }>;
} {
  const normalizedLocale = normalizeLocale(locale);
  const colorSet = COLORS_BY_LOCALE[normalizedLocale];
  const basicColors = ['red', 'blue', 'green', 'yellow'];
  const brightColors = ['orange', 'purple', 'pink', 'cyan', 'magenta', 'lime', 'coral'];
  const neutralColors = ['black', 'white', 'gray', 'brown', 'beige', 'cream'];
  const metallicColors = ['gold', 'silver'];
  const mapColors = (keys: string[]) => keys.filter(key => colorSet[key]).map(key => ({ key, name: colorSet[key].name, hex: colorSet[key].hex }));
  return { basic: mapColors(basicColors), bright: mapColors(brightColors), neutral: mapColors(neutralColors), metallic: mapColors(metallicColors) };
}
