/**
 * Market Research Service for Translation
 * T0340: Translation - Market Research
 */

export type MENAMarket = 'SA' | 'AE' | 'EG' | 'QA' | 'KW' | 'BH' | 'OM' | 'JO' | 'LB' | 'IQ' | 'MA' | 'DZ' | 'TN' | 'LY';
export type Industry = 'fashion' | 'electronics' | 'food' | 'beauty' | 'home' | 'sports' | 'toys' | 'health';
export type Formality = 'formal' | 'semi-formal' | 'casual';

export interface RegionalTerm {
  term: string;
  arabic: string;
  market: MENAMarket;
  industry: Industry;
  alternativeTerms: string[];
  usage: 'common' | 'formal' | 'colloquial' | 'technical';
  popularity: number;
  seasonality?: string[];
}

export interface CompetitorKeyword {
  keyword: string;
  arabicTranslation: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  trending: boolean;
  markets: MENAMarket[];
  suggestedTranslations: string[];
}

export interface MarketInsight {
  market: MENAMarket;
  marketName: string;
  language: string;
  dialect: string;
  population: number;
  ecommerceGrowth: number;
  preferredPayment: string[];
  topCategories: string[];
  shoppingPeakTimes: string[];
  culturalConsiderations: string[];
  translationPreferences: {
    formality: Formality;
    religiousReferences: boolean;
    emojiUsage: boolean;
    numbersStyle: 'arabic' | 'hindi';
    dateFormat: string;
  };
}

export interface CulturalPreference {
  market: MENAMarket;
  colors: {
    preferred: string[];
    avoided: string[];
    symbolic: Record<string, string>;
  };
  imagery: {
    preferred: string[];
    avoided: string[];
  };
  messaging: {
    tone: string;
    values: string[];
    taboos: string[];
  };
  seasonalEvents: Array<{
    name: string;
    arabicName: string;
    month: string;
    translationFocus: string[];
  }>;
}

// Regional terminology database with MENA-specific terms
export const REGIONAL_TERMINOLOGY: RegionalTerm[] = [
  // Saudi Arabia (SA)
  { term: 'discount', arabic: 'خصم', market: 'SA', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات'], usage: 'common', popularity: 95 },
  { term: 'sale', arabic: 'تنزيلات', market: 'SA', industry: 'fashion', alternativeTerms: ['تخفيضات', 'عروض'], usage: 'common', popularity: 98 },
  { term: 'free shipping', arabic: 'شحن مجاني', market: 'SA', industry: 'fashion', alternativeTerms: ['توصيل مجاني'], usage: 'common', popularity: 92 },
  { term: 'cash on delivery', arabic: 'الدفع عند الاستلام', market: 'SA', industry: 'fashion', alternativeTerms: ['الدفع عند التسليم'], usage: 'formal', popularity: 88 },
  { term: 'new arrival', arabic: 'وصل حديثاً', market: 'SA', industry: 'fashion', alternativeTerms: ['جديد', 'وصول جديد'], usage: 'common', popularity: 85 },
  { term: 'best seller', arabic: 'الأكثر مبيعاً', market: 'SA', industry: 'fashion', alternativeTerms: ['الأكثر طلباً'], usage: 'common', popularity: 90 },
  { term: 'limited edition', arabic: 'إصدار محدود', market: 'SA', industry: 'fashion', alternativeTerms: ['كمية محدودة'], usage: 'formal', popularity: 75 },
  { term: 'premium quality', arabic: 'جودة ممتازة', market: 'SA', industry: 'fashion', alternativeTerms: ['جودة عالية', 'فاخر'], usage: 'formal', popularity: 82 },
  { term: 'smartphone', arabic: 'هاتف ذكي', market: 'SA', industry: 'electronics', alternativeTerms: ['جوال', 'موبايل'], usage: 'technical', popularity: 96 },
  { term: 'laptop', arabic: 'حاسوب محمول', market: 'SA', industry: 'electronics', alternativeTerms: ['لابتوب', 'جهاز محمول'], usage: 'common', popularity: 94 },
  { term: 'wireless', arabic: 'لاسلكي', market: 'SA', industry: 'electronics', alternativeTerms: ['وايرلس', 'بدون أسلاك'], usage: 'common', popularity: 88 },
  { term: 'warranty', arabic: 'ضمان', market: 'SA', industry: 'electronics', alternativeTerms: ['كفالة'], usage: 'formal', popularity: 91 },
  { term: 'original', arabic: 'أصلي', market: 'SA', industry: 'electronics', alternativeTerms: ['حقيقي', 'مضمون'], usage: 'common', popularity: 93 },
  // UAE (AE)
  { term: 'discount', arabic: 'خصم', market: 'AE', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات', 'عرض'], usage: 'common', popularity: 94 },
  { term: 'sale', arabic: 'تنزيلات', market: 'AE', industry: 'fashion', alternativeTerms: ['تخفيضات', 'عروض خاصة'], usage: 'common', popularity: 96 },
  { term: 'luxury', arabic: 'فاخر', market: 'AE', industry: 'fashion', alternativeTerms: ['راقي', 'ثمين'], usage: 'formal', popularity: 90 },
  { term: 'exclusive', arabic: 'حصري', market: 'AE', industry: 'fashion', alternativeTerms: ['مميز', 'فريد'], usage: 'formal', popularity: 87 },
  { term: 'latest model', arabic: 'أحدث موديل', market: 'AE', industry: 'electronics', alternativeTerms: ['آخر إصدار', 'جديد'], usage: 'common', popularity: 92 },
  { term: 'refurbished', arabic: 'مجدد', market: 'AE', industry: 'electronics', alternativeTerms: ['مستعمل نظيف', 'مُنعش'], usage: 'technical', popularity: 78 },
  // Egypt (EG)
  { term: 'discount', arabic: 'خصم', market: 'EG', industry: 'fashion', alternativeTerms: ['تخفيض', 'ريحة'], usage: 'common', popularity: 92 },
  { term: 'sale', arabic: 'تخفيضات', market: 'EG', industry: 'fashion', alternativeTerms: ['تنزيلات', 'عروض'], usage: 'common', popularity: 95 },
  { term: 'cheap', arabic: 'رخيص', market: 'EG', industry: 'fashion', alternativeTerms: ['سعره حلو', 'مش غالي'], usage: 'colloquial', popularity: 88 },
  { term: 'good quality', arabic: 'جودة كويسة', market: 'EG', industry: 'fashion', alternativeTerms: ['كويس', 'ممتاز'], usage: 'colloquial', popularity: 86 },
  { term: 'installment', arabic: 'تقسيط', market: 'EG', industry: 'fashion', alternativeTerms: ['بدفعات'], usage: 'common', popularity: 91 },
  { term: 'fresh', arabic: 'طازج', market: 'EG', industry: 'food', alternativeTerms: ['فريش', 'جديد'], usage: 'common', popularity: 94 },
  { term: 'organic', arabic: 'عضوي', market: 'EG', industry: 'food', alternativeTerms: ['طبيعي', 'صحي'], usage: 'common', popularity: 82 },
  { term: 'homemade', arabic: 'بلدي', market: 'EG', industry: 'food', alternativeTerms: ['من البيت', 'تقليدي'], usage: 'colloquial', popularity: 89 },
  { term: 'delicious', arabic: 'لذيذ', market: 'EG', industry: 'food', alternativeTerms: ['طيب', 'حلو'], usage: 'common', popularity: 93 },
  // Qatar (QA)
  { term: 'discount', arabic: 'خصم', market: 'QA', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات'], usage: 'common', popularity: 88 },
  { term: 'luxury', arabic: 'فاخر', market: 'QA', industry: 'fashion', alternativeTerms: ['راقي', 'فخم'], usage: 'formal', popularity: 92 },
  { term: 'boutique', arabic: 'بوتيك', market: 'QA', industry: 'fashion', alternativeTerms: ['متجر خاص', 'محل حصري'], usage: 'common', popularity: 84 },
  // Kuwait (KW)
  { term: 'sale', arabic: 'تنزيلات', market: 'KW', industry: 'fashion', alternativeTerms: ['تخفيضات', 'عروض'], usage: 'common', popularity: 91 },
  { term: 'original', arabic: 'أصلي', market: 'KW', industry: 'electronics', alternativeTerms: ['حقيقي', 'مضمون'], usage: 'common', popularity: 94 },
  { term: 'branded', arabic: 'ماركة', market: 'KW', industry: 'fashion', alternativeTerms: ['علامة تجارية', 'فراند'], usage: 'common', popularity: 89 },
  // Bahrain (BH)
  { term: 'discount', arabic: 'خصم', market: 'BH', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات'], usage: 'common', popularity: 86 },
  { term: 'value', arabic: 'قيمة', market: 'BH', industry: 'fashion', alternativeTerms: ['سعر مناسب', 'جدوى'], usage: 'formal', popularity: 80 },
  // Oman (OM)
  { term: 'traditional', arabic: 'تقليدي', market: 'OM', industry: 'fashion', alternativeTerms: ['تراثي', 'أصيل'], usage: 'formal', popularity: 88 },
  { term: 'handcrafted', arabic: 'مصنوع يدوياً', market: 'OM', industry: 'fashion', alternativeTerms: ['حرفي', 'يدوي'], usage: 'formal', popularity: 85 },
  // Jordan (JO)
  { term: 'discount', arabic: 'خصم', market: 'JO', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات'], usage: 'common', popularity: 89 },
  { term: 'quality', arabic: 'جودة', market: 'JO', industry: 'fashion', alternativeTerms: ['مستوى', 'كفاءة'], usage: 'common', popularity: 87 },
  // Lebanon (LB)
  { term: 'fashionable', arabic: 'موضة', market: 'LB', industry: 'fashion', alternativeTerms: ['أنيق', 'شيك'], usage: 'common', popularity: 92 },
  { term: 'trendy', arabic: 'عصري', market: 'LB', industry: 'fashion', alternativeTerms: ['مودرن', 'حديث'], usage: 'common', popularity: 90 },
  { term: 'elegant', arabic: 'أنيق', market: 'LB', industry: 'fashion', alternativeTerms: ['راقي', 'شيك'], usage: 'common', popularity: 91 },
  // Iraq (IQ)
  { term: 'discount', arabic: 'خصم', market: 'IQ', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات'], usage: 'common', popularity: 84 },
  { term: 'wholesale', arabic: 'جملة', market: 'IQ', industry: 'fashion', alternativeTerms: ['كميات كبيرة', 'بالجملة'], usage: 'common', popularity: 88 },
  // Morocco (MA)
  { term: 'traditional', arabic: 'تقليدي', market: 'MA', industry: 'fashion', alternativeTerms: ['تراثي', 'أصيل'], usage: 'common', popularity: 91 },
  { term: 'artisan', arabic: 'حرفي', market: 'MA', industry: 'fashion', alternativeTerms: ['مشغول يدوياً', 'تقليدي'], usage: 'formal', popularity: 86 },
  // Algeria (DZ)
  { term: 'discount', arabic: 'خصم', market: 'DZ', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات', 'ريحة'], usage: 'common', popularity: 87 },
  { term: 'local', arabic: 'محلي', market: 'DZ', industry: 'fashion', alternativeTerms: ['بلدي', 'وطني'], usage: 'common', popularity: 83 },
  // Tunisia (TN)
  { term: 'handmade', arabic: 'مصنوع يدوياً', market: 'TN', industry: 'fashion', alternativeTerms: ['يدوي', 'حرفي'], usage: 'common', popularity: 88 },
  { term: 'authentic', arabic: 'أصيل', market: 'TN', industry: 'fashion', alternativeTerms: ['حقيقي', 'تقليدي'], usage: 'formal', popularity: 84 },
  // Libya (LY)
  { term: 'discount', arabic: 'خصم', market: 'LY', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات'], usage: 'common', popularity: 82 },
  { term: 'original', arabic: 'أصلي', market: 'LY', industry: 'electronics', alternativeTerms: ['حقيقي', 'مضمون'], usage: 'common', popularity: 87 },
];

// Competitor keyword analysis database
export const COMPETITOR_KEYWORDS: CompetitorKeyword[] = [
  { keyword: 'white friday', arabicTranslation: 'الجمعة البيضاء', searchVolume: 500000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW'], suggestedTranslations: ['الجمعة البيضاء', 'أوفر وايت فرايدي', 'تخفيضات الجمعة البيضاء'] },
  { keyword: 'ramadan offers', arabicTranslation: 'عروض رمضان', searchVolume: 450000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB'], suggestedTranslations: ['عروض رمضان', 'تخفيضات رمضان', 'عروض شهر رمضان'] },
  { keyword: 'eid sale', arabicTranslation: 'تخفيضات العيد', searchVolume: 380000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'MA', 'DZ', 'TN'], suggestedTranslations: ['تخفيضات العيد', 'عروض العيد', 'تنزيلات عيد الفطر'] },
  { keyword: 'free delivery', arabicTranslation: 'توصيل مجاني', searchVolume: 320000, competition: 'medium', trending: false, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM'], suggestedTranslations: ['توصيل مجاني', 'شحن مجاني', 'دليفري مجاني'] },
  { keyword: 'cash on delivery', arabicTranslation: 'الدفع عند الاستلام', searchVolume: 290000, competition: 'low', trending: false, markets: ['SA', 'EG', 'JO', 'IQ'], suggestedTranslations: ['الدفع عند الاستلام', 'الدفع عند التسليم', 'كاش عند الاستلام'] },
  { keyword: 'original products', arabicTranslation: 'منتجات أصلية', searchVolume: 250000, competition: 'medium', trending: false, markets: ['SA', 'AE', 'EG', 'QA', 'KW'], suggestedTranslations: ['منتجات أصلية', 'بضاعة أصلية', 'سلع أصلية'] },
  { keyword: 'fast shipping', arabicTranslation: 'شحن سريع', searchVolume: 220000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'QA', 'KW', 'BH'], suggestedTranslations: ['شحن سريع', 'توصيل سريع', 'دليفري سريع'] },
  { keyword: 'discount code', arabicTranslation: 'كود خصم', searchVolume: 200000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW'], suggestedTranslations: ['كود خصم', 'رمز تخفيض', 'كوبون خصم'] },
  { keyword: 'new collection', arabicTranslation: 'تشكيلة جديدة', searchVolume: 180000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'QA', 'KW', 'LB'], suggestedTranslations: ['تشكيلة جديدة', 'مجموعة جديدة', 'كولكشن جديد'] },
  { keyword: 'best price', arabicTranslation: 'أفضل سعر', searchVolume: 175000, competition: 'high', trending: false, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH'], suggestedTranslations: ['أفضل سعر', 'أحسن سعر', 'أقل سعر'] },
  { keyword: 'hijab fashion', arabicTranslation: 'أزياء محجبات', searchVolume: 160000, competition: 'medium', trending: true, markets: ['SA', 'EG', 'QA', 'KW', 'JO'], suggestedTranslations: ['أزياء محجبات', 'موضة المحجبات', 'فساتين محجبات'] },
  { keyword: 'abaya collection', arabicTranslation: 'مجموعة عبايات', searchVolume: 150000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'], suggestedTranslations: ['مجموعة عبايات', 'تشكيلة عبايات', 'عبايات جديدة'] },
  { keyword: 'modest fashion', arabicTranslation: 'أزياء محتشمة', searchVolume: 140000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'QA', 'KW', 'JO', 'LB'], suggestedTranslations: ['أزياء محتشمة', 'ملابس محتشمة', 'فاشون محتشم'] },
  { keyword: 'kids wear', arabicTranslation: 'ملابس أطفال', searchVolume: 135000, competition: 'medium', trending: false, markets: ['SA', 'AE', 'EG', 'QA', 'KW'], suggestedTranslations: ['ملابس أطفال', 'أزياء أطفال', 'ملابس ولادي'] },
  { keyword: 'sports wear', arabicTranslation: 'ملابس رياضية', searchVolume: 130000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH'], suggestedTranslations: ['ملابس رياضية', 'أزياء رياضية', 'سبورت وير'] },
  { keyword: 'skin care', arabicTranslation: 'عناية بالبشرة', searchVolume: 125000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'LB'], suggestedTranslations: ['عناية بالبشرة', 'منتجات البشرة', 'عناية الجلد'] },
  { keyword: 'organic products', arabicTranslation: 'منتجات عضوية', searchVolume: 110000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'QA', 'KW', 'BH'], suggestedTranslations: ['منتجات عضوية', 'منتجات طبيعية', 'أورجانيك'] },
  { keyword: 'smart watch', arabicTranslation: 'ساعة ذكية', searchVolume: 105000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW'], suggestedTranslations: ['ساعة ذكية', 'ساعة سمارت', 'ذكي واتش'] },
  { keyword: 'wireless headphones', arabicTranslation: 'سماعات لاسلكية', searchVolume: 98000, competition: 'high', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH'], suggestedTranslations: ['سماعات لاسلكية', 'سماعات بلوتوث', 'سماعات وايرلس'] },
  { keyword: 'home decoration', arabicTranslation: 'ديكور منزل', searchVolume: 92000, competition: 'medium', trending: false, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'JO'], suggestedTranslations: ['ديكور منزل', 'أثاث منزلي', 'تزيين البيت'] },
  { keyword: 'kitchen appliances', arabicTranslation: 'أدوات مطبخ', searchVolume: 88000, competition: 'medium', trending: false, markets: ['SA', 'AE', 'EG', 'QA', 'KW'], suggestedTranslations: ['أدوات مطبخ', 'معدات مطبخ', 'أجهزة مطبخ'] },
  { keyword: 'back to school', arabicTranslation: 'العودة للمدارس', searchVolume: 85000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM'], suggestedTranslations: ['العودة للمدارس', 'مستلزمات المدرسة', 'قرطاسية'] },
  { keyword: 'gift ideas', arabicTranslation: 'أفكار هدايا', searchVolume: 78000, competition: 'low', trending: true, markets: ['SA', 'AE', 'EG', 'QA', 'KW', 'JO', 'LB'], suggestedTranslations: ['أفكار هدايا', 'اقتراحات هدايا', 'هدايا مناسبات'] },
  { keyword: 'national day sale', arabicTranslation: 'تخفيضات اليوم الوطني', searchVolume: 75000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'], suggestedTranslations: ['تخفيضات اليوم الوطني', 'عروض اليوم الوطني', 'تنزيلات وطنية'] },
  { keyword: 'summer collection', arabicTranslation: 'تشكيلة صيفية', searchVolume: 72000, competition: 'medium', trending: true, markets: ['SA', 'AE', 'QA', 'KW', 'BH', 'LB'], suggestedTranslations: ['تشكيلة صيفية', 'مجموعة صيفية', 'صيف كولكشن'] },
];

// Market insights database
export const MARKET_INSIGHTS: MarketInsight[] = [
  {
    market: 'SA',
    marketName: 'Saudi Arabia',
    language: 'Arabic',
    dialect: 'Gulf Arabic',
    population: 35000000,
    ecommerceGrowth: 25.5,
    preferredPayment: ['Mada', 'Credit Card', 'Cash on Delivery', 'Apple Pay', 'STC Pay'],
    topCategories: ['Fashion', 'Electronics', 'Beauty', 'Home & Garden', 'Sports'],
    shoppingPeakTimes: ['White Friday', 'Ramadan', 'Eid Al-Fitr', 'Eid Al-Adha', 'Saudi National Day'],
    culturalConsiderations: ['Gender-separated shopping preferences', 'Religious observances affect shopping times', 'High preference for luxury brands', 'Strong trust in local payment methods'],
    translationPreferences: { formality: 'formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'hindi', dateFormat: 'Hijri/Gregorian dual' },
  },
  {
    market: 'AE',
    marketName: 'United Arab Emirates',
    language: 'Arabic',
    dialect: 'Gulf Arabic',
    population: 10000000,
    ecommerceGrowth: 22.8,
    preferredPayment: ['Credit Card', 'Apple Pay', 'Google Pay', 'Cash on Delivery', 'Tabby', 'Postpay'],
    topCategories: ['Luxury Fashion', 'Electronics', 'Beauty', 'Gold & Jewelry', 'Home Decor'],
    shoppingPeakTimes: ['White Friday', 'Dubai Shopping Festival', 'Ramadan', 'Eid', 'UAE National Day'],
    culturalConsiderations: ['Cosmopolitan audience', 'High expat population - multilingual needs', 'Luxury market focus', 'Early tech adoption'],
    translationPreferences: { formality: 'semi-formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian with Hijri mention' },
  },
  {
    market: 'EG',
    marketName: 'Egypt',
    language: 'Arabic',
    dialect: 'Egyptian Arabic',
    population: 104000000,
    ecommerceGrowth: 30.2,
    preferredPayment: ['Cash on Delivery', 'Fawry', 'Vodafone Cash', 'Credit Card', 'InstaPay'],
    topCategories: ['Fashion', 'Electronics', 'Home Appliances', 'Beauty', 'Groceries'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Sham El-Nessim', 'Back to School', 'Black Friday'],
    culturalConsiderations: ['Price-sensitive market', 'Strong preference for COD', 'Installment payments popular', 'Local Egyptian Arabic resonates well'],
    translationPreferences: { formality: 'casual', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
  {
    market: 'QA',
    marketName: 'Qatar',
    language: 'Arabic',
    dialect: 'Gulf Arabic',
    population: 2900000,
    ecommerceGrowth: 18.5,
    preferredPayment: ['Credit Card', 'Apple Pay', 'Qatar National Bank', 'Cash on Delivery'],
    topCategories: ['Luxury Goods', 'Electronics', 'Fashion', 'Home & Garden', 'Sports'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Qatar National Day', 'White Friday', 'Summer Sales'],
    culturalConsiderations: ['High disposable income', 'Luxury brand preference', 'Small but affluent population', 'Strong local identity'],
    translationPreferences: { formality: 'formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'hindi', dateFormat: 'Hijri/Gregorian dual' },
  },
  {
    market: 'KW',
    marketName: 'Kuwait',
    language: 'Arabic',
    dialect: 'Gulf Arabic',
    population: 4300000,
    ecommerceGrowth: 20.1,
    preferredPayment: ['KNET', 'Credit Card', 'Cash on Delivery', 'Apple Pay'],
    topCategories: ['Fashion', 'Electronics', 'Beauty', 'Home Decor', 'Toys'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Hala Febrayer', 'White Friday', 'Back to School'],
    culturalConsiderations: ['High purchasing power', 'Brand-conscious consumers', 'Strong family values', 'Preference for quality over price'],
    translationPreferences: { formality: 'formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'hindi', dateFormat: 'Hijri/Gregorian dual' },
  },
  {
    market: 'BH',
    marketName: 'Bahrain',
    language: 'Arabic',
    dialect: 'Gulf Arabic',
    population: 1700000,
    ecommerceGrowth: 19.3,
    preferredPayment: ['BenefitPay', 'Credit Card', 'Cash on Delivery'],
    topCategories: ['Fashion', 'Electronics', 'Beauty', 'Home & Garden', 'Baby Products'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Bahrain National Day', 'White Friday'],
    culturalConsiderations: ['Progressive business environment', 'Mix of traditional and modern', 'Financial hub', 'Small tight-knit community'],
    translationPreferences: { formality: 'semi-formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
  {
    market: 'OM',
    marketName: 'Oman',
    language: 'Arabic',
    dialect: 'Gulf Arabic',
    population: 5100000,
    ecommerceGrowth: 21.5,
    preferredPayment: ['Credit Card', 'Cash on Delivery', 'Apple Pay', 'Local Bank Transfers'],
    topCategories: ['Traditional Crafts', 'Fashion', 'Electronics', 'Home & Garden', 'Automotive'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Oman National Day', 'Muscat Festival', 'White Friday'],
    culturalConsiderations: ['Strong cultural heritage', 'Traditional crafts valued', 'Family-oriented society', 'Respect for tradition important'],
    translationPreferences: { formality: 'formal', religiousReferences: true, emojiUsage: false, numbersStyle: 'hindi', dateFormat: 'Hijri/Gregorian dual' },
  },
  {
    market: 'JO',
    marketName: 'Jordan',
    language: 'Arabic',
    dialect: 'Levantine Arabic',
    population: 11000000,
    ecommerceGrowth: 24.0,
    preferredPayment: ['Cash on Delivery', 'Credit Card', 'eFawateercom', 'Cliq'],
    topCategories: ['Fashion', 'Electronics', 'Home & Garden', 'Beauty', 'Pharmacy'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Independence Day', 'Back to School', 'White Friday'],
    culturalConsiderations: ['Youthful demographic', 'Price-conscious', 'Growing tech adoption', 'Education-focused'],
    translationPreferences: { formality: 'semi-formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
  {
    market: 'LB',
    marketName: 'Lebanon',
    language: 'Arabic',
    dialect: 'Levantine Arabic',
    population: 5500000,
    ecommerceGrowth: 15.8,
    preferredPayment: ['Cash on Delivery', 'Credit Card', 'Bank Transfer', 'OMT', 'Whish'],
    topCategories: ['Fashion', 'Beauty', 'Electronics', 'Home Decor', 'Food'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Christmas', 'Mother\'s Day', 'White Friday'],
    culturalConsiderations: ['Fashion-forward culture', 'Multilingual market', 'Diaspora shopping', 'Cosmopolitan tastes'],
    translationPreferences: { formality: 'casual', religiousReferences: false, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
  {
    market: 'IQ',
    marketName: 'Iraq',
    language: 'Arabic',
    dialect: 'Gulf/Levantine Mix',
    population: 41000000,
    ecommerceGrowth: 35.0,
    preferredPayment: ['Cash on Delivery', 'ZainCash', 'AsiaHawala', 'Credit Card'],
    topCategories: ['Electronics', 'Fashion', 'Home Appliances', 'Mobile Phones', 'Automotive'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Nowruz', 'Back to School'],
    culturalConsiderations: ['Cash-dominant economy', 'Rapid digital growth', 'Youth-majority population', 'Mobile-first market'],
    translationPreferences: { formality: 'casual', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
  {
    market: 'MA',
    marketName: 'Morocco',
    language: 'Arabic',
    dialect: 'Maghrebi Arabic',
    population: 37000000,
    ecommerceGrowth: 28.5,
    preferredPayment: ['Cash on Delivery', 'CMI', 'PayPal', 'Credit Card'],
    topCategories: ['Fashion', 'Electronics', 'Traditional Crafts', 'Beauty', 'Home Decor'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Eid Al-Adha', 'White Friday', 'Back to School'],
    culturalConsiderations: ['French-Arabic bilingual', 'Strong craft tradition', 'Growing middle class', 'Mobile commerce popular'],
    translationPreferences: { formality: 'semi-formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian with Hijri' },
  },
  {
    market: 'DZ',
    marketName: 'Algeria',
    language: 'Arabic',
    dialect: 'Maghrebi Arabic',
    population: 44000000,
    ecommerceGrowth: 26.8,
    preferredPayment: ['Cash on Delivery', 'CCP', 'Credit Card', 'BaridiMob'],
    topCategories: ['Electronics', 'Fashion', 'Home Appliances', 'Beauty', 'Sports'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Independence Day', 'Back to School', 'White Friday'],
    culturalConsiderations: ['Youth-majority population', 'Price-sensitive', 'Local payment methods preferred', 'Growing smartphone use'],
    translationPreferences: { formality: 'semi-formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
  {
    market: 'TN',
    marketName: 'Tunisia',
    language: 'Arabic',
    dialect: 'Maghrebi Arabic',
    population: 12000000,
    ecommerceGrowth: 23.2,
    preferredPayment: ['Cash on Delivery', 'D17', 'Flouci', 'Credit Card'],
    topCategories: ['Fashion', 'Electronics', 'Beauty', 'Handicrafts', 'Home Decor'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Revolution Day', 'Summer Sales', 'White Friday'],
    culturalConsiderations: ['Tech-savvy youth', 'Entrepreneurial culture', 'Tourism influence', 'Craft heritage'],
    translationPreferences: { formality: 'semi-formal', religiousReferences: true, emojiUsage: true, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
  {
    market: 'LY',
    marketName: 'Libya',
    language: 'Arabic',
    dialect: 'Maghrebi Arabic',
    population: 7000000,
    ecommerceGrowth: 18.0,
    preferredPayment: ['Cash on Delivery', 'Bank Transfer', 'Mobile Money'],
    topCategories: ['Electronics', 'Fashion', 'Home Appliances', 'Automotive', 'Food'],
    shoppingPeakTimes: ['Ramadan', 'Eid', 'Independence Day', 'Back to School'],
    culturalConsiderations: ['Cash-based economy', 'Developing e-commerce', 'Family-centered', 'Mobile-first growth'],
    translationPreferences: { formality: 'formal', religiousReferences: true, emojiUsage: false, numbersStyle: 'arabic', dateFormat: 'Gregorian' },
  },
];
