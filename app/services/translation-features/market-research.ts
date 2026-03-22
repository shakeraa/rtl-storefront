/**
 * Market Research Service for Translation
 * T0340: Translation - Market Research
 *
 * Provides market-specific translation research, regional terminology databases,
 * competitor keyword analysis, and cultural preferences for MENA markets.
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
  popularity: number; // 0-100
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
  // Saudi Arabia (SA) - Gulf terminology
  { term: 'discount', arabic: 'خصم', market: 'SA', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات'], usage: 'common', popularity: 95 },
  { term: 'sale', arabic: 'تنزيلات', market: 'SA', industry: 'fashion', alternativeTerms: ['تخفيضات', 'عروض'], usage: 'common', popularity: 98 },
  { term: 'free shipping', arabic: 'شحن مجاني', market: 'SA', industry: 'fashion', alternativeTerms: ['توصيل مجاني'], usage: 'common', popularity: 92 },
  { term: 'cash on delivery', arabic: 'الدفع عند الاستلام', market: 'SA', industry: 'fashion', alternativeTerms: ['الدفع عند التسليم'], usage: 'formal', popularity: 88 },
  { term: 'new arrival', arabic: 'وصل حديثاً', market: 'SA', industry: 'fashion', alternativeTerms: ['جديد', 'وصول جديد'], usage: 'common', popularity: 85 },
  { term: 'best seller', arabic: 'الأكثر مبيعاً', market: 'SA', industry: 'fashion', alternativeTerms: ['الأكثر طلباً'], usage: 'common', popularity: 90 },
  { term: 'limited edition', arabic: 'إصدار محدود', market: 'SA', industry: 'fashion', alternativeTerms: ['كمية محدودة'], usage: 'formal', popularity: 75 },
  { term: 'premium quality', arabic: 'جودة ممتازة', market: 'SA', industry: 'fashion', alternativeTerms: ['جودة عالية', 'فاخر'], usage: 'formal', popularity: 82 },
  
  // Saudi Arabia - Electronics
  { term: 'smartphone', arabic: 'هاتف ذكي', market: 'SA', industry: 'electronics', alternativeTerms: ['جوال', 'موبايل'], usage: 'technical', popularity: 96 },
  { term: 'laptop', arabic: 'حاسوب محمول', market: 'SA', industry: 'electronics', alternativeTerms: ['لابتوب', 'جهاز محمول'], usage: 'common', popularity: 94 },
  { term: 'wireless', arabic: 'لاسلكي', market: 'SA', industry: 'electronics', alternativeTerms: ['وايرلس', 'بدون أسلاك'], usage: 'common', popularity: 88 },
  { term: 'warranty', arabic: 'ضمان', market: 'SA', industry: 'electronics', alternativeTerms: ['كفالة'], usage: 'formal', popularity: 91 },
  { term: 'original', arabic: 'أصلي', market: 'SA', industry: 'electronics', alternativeTerms: ['حقيقي', 'مضمون'], usage: 'common', popularity: 93 },
  
  // UAE (AE) - Mix of Gulf and international terms
  { term: 'discount', arabic: 'خصم', market: 'AE', industry: 'fashion', alternativeTerms: ['تخفيض', 'تنزيلات', 'عرض'], usage: 'common', popularity: 94 },
  { term: 'sale', arabic: 'تنزيلات', market: 'AE', industry: 'fashion', alternativeTerms: ['تخفيضات', 'عروض خاصة'], usage: 'common', popularity: 96 },
  { term: 'luxury', arabic: 'فاخر', market: 'AE', industry: 'fashion', alternativeTerms: ['راقي', 'ثمين'], usage: 'formal', popularity: 90 },
  { term: 'exclusive', arabic: 'حصري', market: 'AE', industry: 'fashion', alternativeTerms: ['مميز', 'فريد'], usage: 'formal', popularity: 87 },
  { term: 'authentic', arabic: 'أصيل', market: 'AE', industry: 'fashion', alternativeTerms: ['حقيقي', 'أصلي'], usage: 'formal', popularity: 85 },
  
  // UAE - Electronics
  { term: 'latest model', arabic: 'أحدث موديل', market: 'AE', industry: 'electronics', alternativeTerms: ['آخر إصدار', 'جديد'], usage: 'common', popularity: 92 },
  { term: 'refurbished', arabic: 'مجدد', market: 'AE', industry: 'electronics', alternativeTerms: ['مستعمل نظيف', 'مُنعش'], usage: 'technical', popularity: 78 },
  { term: 'gadget', arabic: 'جهاز', market: 'AE', industry: 'electronics', alternativeTerms: ['أداة ذكية', 'جهاز إلكتروني'], usage: 'common', popularity: 82 },
  
  // Egypt (EG) - Egyptian Arabic preferences
  { term: 'discount', arabic: 'خصم', market: 'EG', industry: 'fashion', alternativeTerms: ['تخفيض', 'ريحة'], usage: 'common', popularity: 92 },
  { term: 'sale', arabic: 'تخفيضات', market: 'EG', industry: 'fashion', alternativeTerms: ['تنزيلات', 'عروض'], usage: 'common', popularity: 95 },
  { term: 'cheap', arabic: 'رخيص', market: 'EG', industry: 'fashion', alternativeTerms: ['سعره حلو', 'مش غالي'], usage: 'colloquial', popularity: 88 },
  { term: 'good quality', arabic: 'جودة كويسة', market: 'EG', industry: 'fashion', alternativeTerms: ['كويس', 'ممتاز'], usage: 'colloquial', popularity: 86 },
  { term: 'installment', arabic: 'تقسيط', market: 'EG', industry: 'fashion', alternativeTerms: ['بدفعات'], usage: 'common', popularity: 91 },
  
  // Egypt - Food
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
  // High-volume keywords across MENA
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
    translationPreferences: {
      formality: 'formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'hindi',
      dateFormat: 'Hijri/Gregorian dual',
    },
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
    translationPreferences: {
      formality: 'semi-formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian with Hijri mention',
    },
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
    translationPreferences: {
      formality: 'casual',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
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
    translationPreferences: {
      formality: 'formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'hindi',
      dateFormat: 'Hijri/Gregorian dual',
    },
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
    translationPreferences: {
      formality: 'formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'hindi',
      dateFormat: 'Hijri/Gregorian dual',
    },
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
    translationPreferences: {
      formality: 'semi-formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
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
    translationPreferences: {
      formality: 'formal',
      religiousReferences: true,
      emojiUsage: false,
      numbersStyle: 'hindi',
      dateFormat: 'Hijri/Gregorian dual',
    },
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
    translationPreferences: {
      formality: 'semi-formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
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
    translationPreferences: {
      formality: 'casual',
      religiousReferences: false,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
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
    translationPreferences: {
      formality: 'casual',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
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
    translationPreferences: {
      formality: 'semi-formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian with Hijri',
    },
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
    translationPreferences: {
      formality: 'semi-formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
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
    translationPreferences: {
      formality: 'semi-formal',
      religiousReferences: true,
      emojiUsage: true,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
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
    translationPreferences: {
      formality: 'formal',
      religiousReferences: true,
      emojiUsage: false,
      numbersStyle: 'arabic',
      dateFormat: 'Gregorian',
    },
  },
];

// Cultural preferences by market
export const CULTURAL_PREFERENCES: CulturalPreference[] = [
  {
    market: 'SA',
    colors: {
      preferred: ['Green', 'White', 'Gold', 'Navy', 'Black'],
      avoided: ['Rainbow colors (LGBTQ association)'],
      symbolic: {
        green: 'Islam, prosperity, national identity',
        white: 'Purity, peace, national flag color',
        gold: 'Luxury, wealth, quality',
        navy: 'Trust, professionalism',
      },
    },
    imagery: {
      preferred: ['Family values', 'Traditional dress', 'Modern mosques', 'Desert landscapes', 'Dates', 'Coffee (Qahwa)'],
      avoided: ['Women without modest dress', 'Alcohol imagery', 'Pork products', 'Excessive skin exposure', 'Religious symbols from other faiths'],
    },
    messaging: {
      tone: 'Respectful, formal, value-oriented',
      values: ['Family', 'Religion', 'Tradition', 'Quality', 'Trust', 'Generosity'],
      taboos: ['Alcohol references', 'Pork mentions', 'Disrespectful religious content', 'Dating/romance imagery', 'Political criticism'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Iftar', 'Suhoor', 'Prayer times', 'Family gatherings'] },
      { name: 'Eid Al-Fitr', arabicName: 'عيد الفطر', month: 'Variable', translationFocus: ['Celebration', 'Gifts', 'Family', 'New clothes'] },
      { name: 'Eid Al-Adha', arabicName: 'عيد الأضحى', month: 'Variable', translationFocus: ['Sacrifice', 'Charity', 'Family', 'Meat'] },
      { name: 'Saudi National Day', arabicName: 'اليوم الوطني', month: 'September', translationFocus: ['Patriotism', 'Heritage', 'Unity', 'Green'] },
      { name: 'Founding Day', arabicName: 'يوم التأسيس', month: 'February', translationFocus: ['History', 'Heritage', 'Saudi culture', 'Tradition'] },
    ],
  },
  {
    market: 'AE',
    colors: {
      preferred: ['Red', 'Green', 'White', 'Black', 'Gold', 'Silver'],
      avoided: [],
      symbolic: {
        red: 'Courage, national flag color',
        green: 'Prosperity, hope, national flag color',
        white: 'Peace, neutrality, national flag color',
        black: 'Strength, national flag color',
        gold: 'Luxury, premium quality',
      },
    },
    imagery: {
      preferred: ['Modern architecture', 'Luxury lifestyle', 'Diverse cultures', 'Beach/Coastal', 'Shopping', 'Innovation'],
      avoided: ['Political imagery', 'Disrespectful religious content', 'Alcohol focus', 'Overly conservative restrictions'],
    },
    messaging: {
      tone: 'Modern, cosmopolitan, aspirational',
      values: ['Innovation', 'Luxury', 'Diversity', 'Quality', 'Progress', 'Excellence'],
      taboos: ['Political criticism', 'Disrespectful religious content', 'Regional conflicts'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Iftar', 'Night markets', 'Family'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Gifts', 'Shopping', 'Celebration'] },
      { name: 'Dubai Shopping Festival', arabicName: 'مهرجان دبي للتسوق', month: 'January', translationFocus: ['Sales', 'Entertainment', 'Tourism'] },
      { name: 'UAE National Day', arabicName: 'اليوم الوطني', month: 'December', translationFocus: ['Patriotism', 'Heritage', 'Union'] },
    ],
  },
  {
    market: 'EG',
    colors: {
      preferred: ['Red', 'White', 'Black', 'Gold', 'Green'],
      avoided: ['Blue (historical negative association)'],
      symbolic: {
        red: 'Energy, passion, vitality',
        white: 'Purity, simplicity',
        gold: 'Wealth, sun, ancient Egypt',
        green: 'Life, agriculture, Nile',
        black: 'Strength, sophistication',
      },
    },
    imagery: {
      preferred: ['Pyramids', 'Nile River', 'Family gatherings', 'Street life', 'Traditional markets', 'Cairo skyline', 'Ancient Egyptian motifs'],
      avoided: ['Political figures', 'Religious extremism', 'Colonial imagery'],
    },
    messaging: {
      tone: 'Friendly, warm, humorous, relatable',
      values: ['Family', 'Hospitality', 'Humor', 'Intelligence', 'Resilience', 'Community'],
      taboos: ['Religious disrespect', 'Political sensitivity', 'Poverty exploitation'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Kunafa', 'Qatayef', 'Family', 'TV series'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Kahk', 'Celebration', 'Family visits'] },
      { name: 'Sham El-Nessim', arabicName: 'شم النسيم', month: 'April', translationFocus: ['Outdoors', 'Spring', 'Fish', 'Eggs'] },
      { name: 'Revolution Day', arabicName: 'عيد الثورة', month: 'July', translationFocus: ['Patriotism', 'National pride'] },
    ],
  },
  {
    market: 'QA',
    colors: {
      preferred: ['Maroon', 'White', 'Gold', 'Burgundy'],
      avoided: [],
      symbolic: {
        maroon: 'Qatar national color, heritage',
        white: 'Peace, purity',
        gold: 'Luxury, prosperity',
        burgundy: 'Qatar national identity',
      },
    },
    imagery: {
      preferred: ['Pearl diving heritage', 'Modern Doha', 'Falconry', 'Traditional boats (Dhows)', 'Luxury lifestyle', 'Sports (World Cup legacy)'],
      avoided: ['Regional conflicts', 'Political disputes', 'Disrespectful religious content'],
    },
    messaging: {
      tone: 'Prestigious, heritage-focused, modern',
      values: ['Heritage', 'Excellence', 'Hospitality', 'Progress', 'Sports', 'Culture'],
      taboos: ['Disrespect for tradition', 'Regional political issues', 'Religious disrespect'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Garangao', 'Tradition', 'Family'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Family', 'Tradition'] },
      { name: 'Qatar National Day', arabicName: 'اليوم الوطني', month: 'December', translationFocus: ['Maroon color', 'Heritage', 'Founder'] },
      { name: 'Sports Events', arabicName: 'الفعاليات الرياضية', month: 'Year-round', translationFocus: ['Stadiums', 'International', 'Competition'] },
    ],
  },
  {
    market: 'KW',
    colors: {
      preferred: ['Green', 'Red', 'White', 'Black', 'Gold'],
      avoided: [],
      symbolic: {
        green: 'Prosperity, Arab unity',
        red: 'Strength, national flag',
        white: 'Peace, purity',
        black: 'Defeat of enemies',
        gold: 'Wealth, premium quality',
      },
    },
    imagery: {
      preferred: ['Kuwait Towers', 'Traditional dhows', 'Family', 'Sea heritage', 'Modern architecture', 'Pearl diving history'],
      avoided: ['Iraqi invasion references', 'Political disputes', 'Religious disrespect'],
    },
    messaging: {
      tone: 'Family-oriented, proud, hospitable',
      values: ['Family', 'Hospitality', 'Generosity', 'Pride', 'Tradition', 'Progress'],
      taboos: ['Iraqi invasion references', 'Political criticism', 'Religious disrespect'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Ghabga', 'Tradition', 'Family'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Family', 'Gatherings'] },
      { name: 'Hala Febrayer', arabicName: 'هلا فبراير', month: 'February', translationFocus: ['Festivities', 'Liberation', 'National pride'] },
      { name: 'National Day', arabicName: 'اليوم الوطني', month: 'February', translationFocus: ['Independence', 'Heritage', 'Celebration'] },
    ],
  },
  {
    market: 'BH',
    colors: {
      preferred: ['Red', 'White', 'Gold', 'Silver'],
      avoided: [],
      symbolic: {
        red: 'Bahrain flag, Kharijite Islam',
        white: 'Peace, Bahrain flag',
        gold: 'Pearl diving wealth',
        silver: 'Pearls, maritime heritage',
      },
    },
    imagery: {
      preferred: ['Pearl diving', 'Formula 1', 'Financial district', 'Traditional architecture', 'Tree of Life', 'Cosmopolitan lifestyle'],
      avoided: ['Political tensions', 'Religious sectarian content', 'Disrespectful imagery'],
    },
    messaging: {
      tone: 'Business-friendly, cosmopolitan, welcoming',
      values: ['Openness', 'Business', 'Heritage', 'Diversity', 'Progress'],
      taboos: ['Political sectarianism', 'Religious disrespect', 'Regional conflicts'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Tradition', 'Family', 'Iftar'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Family'] },
      { name: 'Bahrain Grand Prix', arabicName: 'جائزة البحرين الكبرى', month: 'March', translationFocus: ['Racing', 'International', 'Entertainment'] },
      { name: 'National Day', arabicName: 'اليوم الوطني', month: 'December', translationFocus: ['Heritage', 'Celebration', 'Unity'] },
    ],
  },
  {
    market: 'OM',
    colors: {
      preferred: ['Red', 'White', 'Green', 'Brown', 'Earth tones'],
      avoided: ['Bright neons'],
      symbolic: {
        red: 'Oman flag, history of empire',
        white: 'Peace, Oman flag',
        green: 'Agriculture, fertility, Oman flag',
        brown: 'Mountains, earth, tradition',
      },
    },
    imagery: {
      preferred: ['Forts and castles', 'Mountains', 'Desert', 'Traditional dress', 'Frankincense', 'Dhows', 'Turtles'],
      avoided: ['Disrespectful modernization', 'Abandoning tradition', 'Religious disrespect'],
    },
    messaging: {
      tone: 'Respectful, traditional, serene',
      values: ['Heritage', 'Peace', 'Hospitality', 'Nature', 'Tradition', 'Respect'],
      taboos: ['Disrespecting tradition', 'Religious criticism', 'Environmental destruction imagery'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Tradition', 'Family', 'Simplicity'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Heritage'] },
      { name: 'National Day', arabicName: 'اليوم الوطني', month: 'November', translationFocus: ['Renaissance', 'Progress', 'Unity'] },
      { name: 'Renaissance Day', arabicName: 'عيد النهضة', month: 'July', translationFocus: ['Development', 'Modernization', 'Progress'] },
    ],
  },
  {
    market: 'JO',
    colors: {
      preferred: ['Red', 'Black', 'White', 'Green', 'Sand tones'],
      avoided: [],
      symbolic: {
        red: 'Hashemite dynasty, Arab revolt',
        black: 'Abbasid dynasty, strength',
        white: 'Umayyad dynasty, peace',
        green: 'Fatimid dynasty, hope',
        sand: 'Desert, Petra',
      },
    },
    imagery: {
      preferred: ['Petra', 'Ancient ruins', 'Desert landscapes', 'Dead Sea', 'Hospitality traditions', 'Youth', 'Education'],
      avoided: ['Political tensions', 'Refugee crisis exploitation', 'Religious disrespect'],
    },
    messaging: {
      tone: 'Hospitable, educated, welcoming',
      values: ['Hospitality', 'History', 'Education', 'Peace', 'Heritage', 'Youth'],
      taboos: ['Political criticism', 'Refugee stereotypes', 'Religious disrespect'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Tradition', 'Family', 'Community'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Family'] },
      { name: 'Independence Day', arabicName: 'عيد الاستقلال', month: 'May', translationFocus: ['Freedom', 'National pride'] },
      { name: 'Army Day', arabicName: 'عيد الجيش', month: 'June', translationFocus: ['Patriotism', 'Service'] },
    ],
  },
  {
    market: 'LB',
    colors: {
      preferred: ['Red', 'White', 'Green', 'Gold', 'Purple'],
      avoided: ['Pale blue (political association)'],
      symbolic: {
        red: 'Cedar tree, vitality',
        white: 'Snow, purity, peace',
        green: 'Cedar tree, nature',
        gold: 'Cedar tree, prosperity',
        purple: 'Phoenician heritage',
      },
    },
    imagery: {
      preferred: ['Cedar trees', 'Beirut cityscape', 'Ancient ruins', 'Sea', 'Mountains', 'Nightlife', 'Fashion', 'Food'],
      avoided: ['War imagery', 'Political factions', 'Sectarian divisions', 'Economic crisis exploitation'],
    },
    messaging: {
      tone: 'Chic, sophisticated, resilient, fun-loving',
      values: ['Beauty', 'Resilience', 'Style', 'Food', 'Culture', 'Joie de vivre'],
      taboos: ['War trauma', 'Political divisions', 'Religious sectarianism', 'Economic hardship exploitation'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Iftar', 'Family', 'Tradition'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Maamoul'] },
      { name: 'Christmas', arabicName: 'عيد الميلاد', month: 'December', translationFocus: ['Trees', 'Family', 'Celebration'] },
      { name: 'Independence Day', arabicName: 'عيد الاستقلال', month: 'November', translationFocus: ['Freedom', 'Cedar', 'Pride'] },
    ],
  },
  {
    market: 'IQ',
    colors: {
      preferred: ['Red', 'White', 'Black', 'Green', 'Gold'],
      avoided: [],
      symbolic: {
        red: 'Courage, national flag',
        white: 'Generosity, national flag',
        black: 'Success in battles, national flag',
        green: 'Islam, agriculture, national flag',
        gold: 'Mesopotamian heritage',
      },
    },
    imagery: {
      preferred: ['Mesopotamian history', 'Tigris and Euphrates', 'Date palms', 'Traditional markets', 'Leptis Magna', 'Berber culture', 'Oil heritage'],
      avoided: ['War imagery', 'Political factions', 'Armed conflict', 'Instability references'],
    },
    messaging: {
      tone: 'Proud, resilient, warm, traditional',
      values: ['History', 'Resilience', 'Hospitality', 'Poetry', 'Heritage', 'Family'],
      taboos: ['War trauma', 'Political factions', 'Instability exploitation', 'Religious extremism'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Tradition', 'Family', 'Community'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Kleicha'] },
      { name: 'Nowruz', arabicName: 'نوروز', month: 'March', translationFocus: ['Spring', 'Kurdish celebration', 'New Year'] },
      { name: 'Independence Day', arabicName: 'عيد الاستقلال', month: 'October', translationFocus: ['Freedom', 'National pride'] },
    ],
  },
  {
    market: 'MA',
    colors: {
      preferred: ['Red', 'Green', 'Gold', 'Blue', 'White'],
      avoided: [],
      symbolic: {
        red: 'Strength, national flag',
        green: 'Hope, Islam, national flag',
        gold: 'Sun, Sahara, wealth',
        blue: 'Sea, sky, Chefchaouen',
        white: 'Peace, purity',
      },
    },
    imagery: {
      preferred: ['Marrakech medina', 'Atlas Mountains', 'Sahara Desert', 'Blue city (Chefchaouen)', 'Traditional crafts', 'Mint tea', 'Ornate architecture'],
      avoided: ['Poverty exploitation', 'Colonial nostalgia', 'Disrespectful religious content'],
    },
    messaging: {
      tone: 'Artisanal, warm, mystical, hospitable',
      values: ['Craftsmanship', 'Hospitality', 'Tradition', 'Beauty', 'Mystery', 'Culture'],
      taboos: ['Colonial stereotypes', 'Religious disrespect', 'Western Sahara political content'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Harira', 'Chebakia', 'Family'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Lamb', 'Family'] },
      { name: 'Eid Al-Adha', arabicName: 'عيد الأضحى', month: 'Variable', translationFocus: ['Sacrifice', 'Mechoui', 'Gathering'] },
      { name: 'Throne Day', arabicName: 'عيد العرش', month: 'July', translationFocus: ['Loyalty', 'Celebration', 'Monarchy'] },
    ],
  },
  {
    market: 'DZ',
    colors: {
      preferred: ['Green', 'White', 'Red', 'Gold', 'Earth tones'],
      avoided: [],
      symbolic: {
        green: 'Islam, prosperity, national flag',
        white: 'Peace, purity, national flag',
        red: 'Strength, national flag',
        gold: 'Desert, sun, heritage',
        earth: 'Atlas Mountains, land',
      },
    },
    imagery: {
      preferred: ['Atlas Mountains', 'Sahara', 'Casbah of Algiers', 'Berber culture', 'Mediterranean coast', 'Dates', 'Traditional dress'],
      avoided: ['Colonial references', 'Political conflict', 'Religious extremism'],
    },
    messaging: {
      tone: 'Proud, resilient, warm, community-focused',
      values: ['Independence', 'Heritage', 'Family', 'Hospitality', 'Strength', 'Culture'],
      taboos: ['Colonial nostalgia', 'Political criticism', 'Religious disrespect', 'Amazigh/Berber marginalization'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Chorba', 'Tradition', 'Family'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Msemen', 'Family'] },
      { name: 'Independence Day', arabicName: 'عيد الاستقلال', month: 'July', translationFocus: ['Freedom', 'Revolution', 'Pride'] },
      { name: 'Amazigh New Year', arabicName: 'يناير الأمازيغي', month: 'January', translationFocus: ['Heritage', 'Tradition', 'Yennayer'] },
    ],
  },
  {
    market: 'TN',
    colors: {
      preferred: ['Red', 'White', 'Blue', 'Gold', 'Green'],
      avoided: [],
      symbolic: {
        red: 'Resistance, national flag',
        white: 'Peace, national flag',
        blue: 'Mediterranean Sea, sky',
        gold: 'Sun, Phoenician heritage',
        green: 'Agriculture, hope',
      },
    },
    imagery: {
      preferred: ['Sidi Bou Said blue/white', 'Carthage ruins', 'Medina of Tunis', 'Beaches', 'Desert oases', 'Traditional crafts', 'Jasmine'],
      avoided: ['Political conflict', 'Revolution trauma', 'Religious extremism'],
    },
    messaging: {
      tone: 'Welcoming, creative, progressive, Mediterranean',
      values: ['Hospitality', 'Creativity', 'Freedom', 'Beauty', 'Culture', 'Education'],
      taboos: ['Political criticism', 'Revolution exploitation', 'Religious disrespect'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Hlou', 'Tradition', 'Family'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Makroudh', 'Family'] },
      { name: 'Revolution Day', arabicName: 'عيد الثورة', month: 'December', translationFocus: ['Freedom', 'Dignity', 'Youth'] },
      { name: 'Jasmine Season', arabicName: 'موسم الياسمين', month: 'Summer', translationFocus: ['Flowers', 'Tourism', 'Beauty'] },
    ],
  },
  {
    market: 'LY',
    colors: {
      preferred: ['Red', 'Black', 'Green', 'White', 'Gold'],
      avoided: [],
      symbolic: {
        red: 'Fezzan, struggle',
        black: 'Cyrenaica, darkness overcome',
        green: 'Tripolitania, agriculture',
        white: 'Peace, purity',
        gold: 'Desert, sun, oil wealth',
      },
    },
    imagery: {
      preferred: ['Roman ruins', 'Sahara Desert', 'Mediterranean coast', 'Traditional markets', 'Leptis Magna', 'Berber culture', 'Oil heritage'],
      avoided: ['Civil war imagery', 'Political factions', 'Armed conflict', 'Instability references'],
    },
    messaging: {
      tone: 'Resilient, traditional, hopeful, warm',
      values: ['Hospitality', 'Resilience', 'Family', 'History', 'Tradition', 'Unity'],
      taboos: ['Civil war references', 'Political factions', 'Instability exploitation', 'Religious extremism'],
    },
    seasonalEvents: [
      { name: 'Ramadan', arabicName: 'رمضان', month: 'Variable', translationFocus: ['Asida', 'Tradition', 'Family'] },
      { name: 'Eid', arabicName: 'العيد', month: 'Variable', translationFocus: ['Celebration', 'Family'] },
      { name: 'Independence Day', arabicName: 'عيد الاستقلال', month: 'December', translationFocus: ['Freedom', 'Unity', 'Kingdom'] },
      { name: 'Revolution Day', arabicName: 'عيد الثورة', month: 'February', translationFocus: ['Change', 'Hope', 'Future'] },
    ],
  },
];

/**
 * Get regional terminology for a specific term and market
 * @param term - The term to look up
 * @param market - The MENA market code (SA, AE, EG, etc.)
 * @returns Matching regional terms or empty array if not found
 */
export function getRegionalTerminology(term: string, market: MENAMarket): RegionalTerm[] {
  const normalizedTerm = term.toLowerCase().trim();
  
  return REGIONAL_TERMINOLOGY.filter(
    (rt) => rt.market === market && 
    (rt.term.toLowerCase() === normalizedTerm || 
     rt.alternativeTerms.some(alt => alt.toLowerCase().includes(normalizedTerm)))
  );
}

/**
 * Get all terminology for a specific market
 * @param market - The MENA market code
 * @param industry - Optional industry filter
 * @returns Array of regional terms for the market
 */
export function getAllTerminologyForMarket(
  market: MENAMarket, 
  industry?: Industry
): RegionalTerm[] {
  if (industry) {
    return REGIONAL_TERMINOLOGY.filter((rt) => rt.market === market && rt.industry === industry);
  }
  return REGIONAL_TERMINOLOGY.filter((rt) => rt.market === market);
}

/**
 * Analyze keywords for a specific market with competition data
 * @param keywords - Array of keywords to analyze
 * @param market - The MENA market code
 * @returns Analyzed keyword data with recommendations
 */
export function analyzeKeywords(
  keywords: string[], 
  market: MENAMarket
): Array<{
  keyword: string;
  found: boolean;
  data?: CompetitorKeyword;
  alternatives: string[];
}> {
  return keywords.map((keyword) => {
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    const found = COMPETITOR_KEYWORDS.find(
      (ck) => ck.keyword.toLowerCase() === normalizedKeyword && ck.markets.includes(market)
    );
    
    // Find alternative keywords with similar search volume
    const alternatives = COMPETITOR_KEYWORDS
      .filter(
        (ck) =>
          ck.markets.includes(market) &&
          ck.keyword.toLowerCase() !== normalizedKeyword &&
          (found ? Math.abs(ck.searchVolume - found.searchVolume) < 50000 : ck.searchVolume > 100000)
      )
      .slice(0, 3)
      .map((ck) => ck.arabicTranslation);
    
    return {
      keyword,
      found: !!found,
      data: found,
      alternatives,
    };
  });
}

/**
 * Get trending keywords for a market
 * @param market - The MENA market code
 * @param limit - Maximum number of results
 * @returns Array of trending competitor keywords
 */
export function getTrendingKeywords(market: MENAMarket, limit: number = 10): CompetitorKeyword[] {
  return COMPETITOR_KEYWORDS
    .filter((ck) => ck.markets.includes(market) && ck.trending)
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, limit);
}

/**
 * Get high-opportunity keywords (high volume, low competition)
 * @param market - The MENA market code
 * @param limit - Maximum number of results
 * @returns Array of competitor keywords with low competition
 */
export function getHighOpportunityKeywords(
  market: MENAMarket, 
  limit: number = 10
): CompetitorKeyword[] {
  return COMPETITOR_KEYWORDS
    .filter((ck) => ck.markets.includes(market) && ck.competition === 'low')
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, limit);
}

/**
 * Get market insights for a specific MENA market
 * @param market - The MENA market code
 * @returns Market insight data or null if not found
 */
export function getMarketInsights(market: MENAMarket): MarketInsight | null {
  return MARKET_INSIGHTS.find((mi) => mi.market === market) || null;
}

/**
 * Get all supported MENA markets
 * @returns Array of market codes
 */
export function getSupportedMarkets(): MENAMarket[] {
  return MARKET_INSIGHTS.map((mi) => mi.market);
}

/**
 * Compare two markets
 * @param marketA - First market code
 * @param marketB - Second market code
 * @returns Comparison data between markets
 */
export function compareMarkets(
  marketA: MENAMarket, 
  marketB: MENAMarket
): {
  marketA: MarketInsight;
  marketB: MarketInsight;
  differences: {
    populationDiff: number;
    growthDiff: number;
    sharedCategories: string[];
    uniqueCategoriesA: string[];
    uniqueCategoriesB: string[];
  };
} | null {
  const insightA = getMarketInsights(marketA);
  const insightB = getMarketInsights(marketB);
  
  if (!insightA || !insightB) {
    return null;
  }
  
  const sharedCategories = insightA.topCategories.filter((cat) =>
    insightB.topCategories.includes(cat)
  );
  
  return {
    marketA: insightA,
    marketB: insightB,
    differences: {
      populationDiff: insightA.population - insightB.population,
      growthDiff: insightA.ecommerceGrowth - insightB.ecommerceGrowth,
      sharedCategories,
      uniqueCategoriesA: insightA.topCategories.filter(
        (cat) => !insightB.topCategories.includes(cat)
      ),
      uniqueCategoriesB: insightB.topCategories.filter(
        (cat) => !insightA.topCategories.includes(cat)
      ),
    },
  };
}

/**
 * Get cultural preferences for a specific market
 * @param market - The MENA market code
 * @returns Cultural preference data or null if not found
 */
export function getCulturalPreferences(market: MENAMarket): CulturalPreference | null {
  return CULTURAL_PREFERENCES.find((cp) => cp.market === market) || null;
}

/**
 * Get color recommendations for a market
 * @param market - The MENA market code
 * @param purpose - The purpose (general, cta, luxury, discount)
 * @returns Recommended colors
 */
export function getColorRecommendations(
  market: MENAMarket, 
  purpose: 'general' | 'cta' | 'luxury' | 'discount' = 'general'
): string[] {
  const prefs = getCulturalPreferences(market);
  if (!prefs) return [];
  
  switch (purpose) {
    case 'cta':
      // Green for positive action, Red for urgency (where culturally appropriate)
      return market === 'LB' ? ['Red', 'Green', 'Gold'] : ['Green', 'Gold', 'White'];
    case 'luxury':
      return ['Gold', 'Black', 'Navy', 'Burgundy'];
    case 'discount':
      return ['Red', 'Orange', 'Yellow'];
    case 'general':
    default:
      return prefs.colors.preferred;
  }
}

/**
 * Get messaging guidelines for a market
 * @param market - The MENA market code
 * @returns Messaging guidelines object
 */
export function getMessagingGuidelines(market: MENAMarket): {
  tone: string;
  values: string[];
  taboos: string[];
  seasonalFocus: string[];
} | null {
  const prefs = getCulturalPreferences(market);
  const insight = getMarketInsights(market);
  
  if (!prefs || !insight) return null;
  
  const currentMonth = new Date().getMonth();
  const seasonalEvents = prefs.seasonalEvents.filter((event) => {
    // Simple seasonal matching - in production would use proper date parsing
    return event.month !== 'Variable';
  });
  
  return {
    tone: prefs.messaging.tone,
    values: prefs.messaging.values,
    taboos: prefs.messaging.taboos,
    seasonalFocus: seasonalEvents.map((e) => e.name),
  };
}

/**
 * Get translation recommendations for a specific market and context
 * @param market - The MENA market code
 * @param context - The context (e-commerce, marketing, support)
 * @returns Translation recommendations
 */
export function getTranslationRecommendations(
  market: MENAMarket,
  context: 'e-commerce' | 'marketing' | 'support' | 'legal' = 'e-commerce'
): {
  formality: Formality;
  useReligiousReferences: boolean;
  numberStyle: 'arabic' | 'hindi';
  emojiUsage: boolean;
  dialectNotes: string;
  preferredTerms: string[];
} | null {
  const insight = getMarketInsights(market);
  if (!insight) return null;
  
  const prefs = getCulturalPreferences(market);
  
  // Adjust based on context
  let formality = insight.translationPreferences.formality;
  if (context === 'legal') formality = 'formal';
  if (context === 'support' && market === 'EG') formality = 'casual';
  
  return {
    formality,
    useReligiousReferences: insight.translationPreferences.religiousReferences,
    numberStyle: insight.translationPreferences.numbersStyle,
    emojiUsage: insight.translationPreferences.emojiUsage,
    dialectNotes: `Use ${insight.dialect} for casual contexts, MSA for formal content`,
    preferredTerms: prefs ? 
      REGIONAL_TERMINOLOGY
        .filter(rt => rt.market === market)
        .map(rt => rt.arabic)
        .slice(0, 5) : [],
  };
}

/**
 * Check if content is culturally appropriate for a market
 * @param content - Content to check
 * @param market - The MENA market code
 * @returns Cultural check result
 */
export function checkCulturalAppropriateness(
  content: string,
  market: MENAMarket
): {
  appropriate: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const prefs = getCulturalPreferences(market);
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (!prefs) {
    return { appropriate: false, warnings: ['Unknown market'], suggestions: [] };
  }
  
  const lowerContent = content.toLowerCase();
  
  // Check for taboos
  for (const taboo of prefs.messaging.taboos) {
    if (lowerContent.includes(taboo.toLowerCase())) {
      warnings.push(`Contains potentially sensitive content: ${taboo}`);
    }
  }
  
  // Check for alcohol references (generally sensitive in MENA)
  if (['alcohol', 'wine', 'beer', 'spirits'].some(word => lowerContent.includes(word))) {
    warnings.push('Content contains alcohol references - verify market appropriateness');
  }
  
  // Check for pork references
  if (['pork', 'bacon', 'ham'].some(word => lowerContent.includes(word))) {
    warnings.push('Content contains pork references - generally inappropriate for MENA markets');
  }
  
  // Suggest values to emphasize
  suggestions.push(`Consider emphasizing: ${prefs.messaging.values.slice(0, 3).join(', ')}`);
  
  return {
    appropriate: warnings.length === 0,
    warnings,
    suggestions,
  };
}

/**
 * Get seasonal translation focus for a market
 * @param market - The MENA market code
 * @param month - Optional month name (defaults to current)
 * @returns Seasonal events and translation focus
 */
export function getSeasonalTranslationFocus(
  market: MENAMarket,
  month?: string
): Array<{
  event: string;
  arabicName: string;
  focusAreas: string[];
}> {
  const prefs = getCulturalPreferences(market);
  if (!prefs) return [];
  
  const targetMonth = month || new Date().toLocaleString('en-US', { month: 'long' });
  
  return prefs.seasonalEvents
    .filter((event) => event.month === 'Variable' || event.month === targetMonth)
    .map((event) => ({
      event: event.name,
      arabicName: event.arabicName,
      focusAreas: event.translationFocus,
    }));
}

/**
 * Get competitor keyword suggestions for translation
 * @param sourceText - Source text to find related keywords
 * @param market - The MENA market code
 * @returns Suggested keywords with translations
 */
export function getKeywordSuggestions(
  sourceText: string,
  market: MENAMarket
): Array<{
  keyword: string;
  arabicTranslation: string;
  relevance: number;
}> {
  const lowerText = sourceText.toLowerCase();
  
  return COMPETITOR_KEYWORDS
    .filter((ck) => ck.markets.includes(market))
    .map((ck) => {
      // Simple relevance scoring based on keyword presence in source text
      let relevance = 0;
      if (lowerText.includes(ck.keyword.toLowerCase())) relevance += 50;
      if (ck.suggestedTranslations.some(st => lowerText.includes(st.toLowerCase()))) relevance += 30;
      
      // Boost by search volume (normalized)
      relevance += Math.min(ck.searchVolume / 10000, 20);
      
      return {
        keyword: ck.keyword,
        arabicTranslation: ck.arabicTranslation,
        relevance,
      };
    })
    .filter((item) => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5);
}
