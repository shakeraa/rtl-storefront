/**
 * Loyalty Programs Integration Service
 * T0221: Integration - Loyalty Apps
 * 
 * Provides localization and formatting for loyalty program content
 * Supports points-based messaging, VIP tiers, and rewards catalog
 */

// Supported locale codes
export type SupportedLocale = 'en' | 'ar' | 'he' | 'fr' | 'de' | 'es' | 'ja' | 'ko' | 'zh';

// VIP Tier types
export type VipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Reward types
export type RewardType = 'discount' | 'free_shipping' | 'free_product' | 'gift_card' | 'exclusive_access' | 'cashback';

// Points transaction types
export type TransactionType = 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjusted';

// Loyalty program labels interface
export interface LoyaltyLabels {
  programName: string;
  pointsBalance: string;
  pointsLabel: string;
  pointsLabelPlural: string;
  earnPoints: string;
  redeemPoints: string;
  availableRewards: string;
  yourRewards: string;
  tierStatus: string;
  currentTier: string;
  nextTier: string;
  pointsToNextTier: string;
  pointsHistory: string;
  recentActivity: string;
  viewAllRewards: string;
  startEarning: string;
  joinProgram: string;
  memberSince: string;
  pointsExpiringSoon: string;
  expiringPoints: string;
  noPointsYet: string;
  howToEarn: string;
  howToRedeem: string;
  termsAndConditions: string;
  programBenefits: string;
  welcomeBonus: string;
  referralBonus: string;
  birthdayBonus: string;
  signupEarn: string;
  purchaseEarn: string;
  reviewEarn: string;
  socialShareEarn: string;
  perDollarSpent: string;
  freeShipping: string;
}

// Reward item interface
export interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: RewardType;
  value: number;
  currency?: string;
  available: boolean;
  limitedQuantity?: boolean;
  quantityRemaining?: number;
  expiresAt?: Date;
  imageUrl?: string;
  terms?: string;
}

// Tier benefits interface
export interface TierBenefits {
  multiplier: number;
  freeShipping: boolean;
  earlyAccess: boolean;
  exclusiveProducts: boolean;
  birthdayGift: boolean;
  prioritySupport: boolean;
  personalShopper: boolean;
}

// VIP Tier configuration
export interface VipTierConfig {
  id: VipTier;
  name: string;
  color: string;
  minPoints: number;
  maxPoints?: number;
  benefits: TierBenefits;
  description: string;
}

// Points transaction interface
export interface PointsTransaction {
  id: string;
  type: TransactionType;
  points: number;
  description: string;
  date: Date;
  orderId?: string;
  expiresAt?: Date;
}

// Redemption result interface
export interface RedemptionResult {
  success: boolean;
  rewardId: string;
  pointsUsed: number;
  remainingBalance: number;
  code?: string;
  message: string;
  error?: string;
}

// Localization data for all supported locales
const LOYALTY_LOCALIZATION: Record<SupportedLocale, LoyaltyLabels> = {
  en: {
    programName: 'Rewards Program',
    pointsBalance: 'Your Points Balance',
    pointsLabel: 'Point',
    pointsLabelPlural: 'Points',
    earnPoints: 'Earn Points',
    redeemPoints: 'Redeem Points',
    availableRewards: 'Available Rewards',
    yourRewards: 'Your Rewards',
    tierStatus: 'Tier Status',
    currentTier: 'Current Tier',
    nextTier: 'Next Tier',
    pointsToNextTier: 'Points to next tier',
    pointsHistory: 'Points History',
    recentActivity: 'Recent Activity',
    viewAllRewards: 'View All Rewards',
    startEarning: 'Start Earning',
    joinProgram: 'Join Program',
    memberSince: 'Member since',
    pointsExpiringSoon: 'Points expiring soon',
    expiringPoints: 'Expiring points',
    noPointsYet: 'No points yet',
    howToEarn: 'How to Earn',
    howToRedeem: 'How to Redeem',
    termsAndConditions: 'Terms & Conditions',
    programBenefits: 'Program Benefits',
    welcomeBonus: 'Welcome Bonus',
    referralBonus: 'Referral Bonus',
    birthdayBonus: 'Birthday Bonus',
    signupEarn: 'Sign up and earn',
    purchaseEarn: 'Earn per $1 spent',
    reviewEarn: 'Write a review',
    socialShareEarn: 'Share on social media',
    perDollarSpent: 'per $1 spent',
    freeShipping: 'Free Shipping',
  },
  ar: {
    programName: 'برنامج المكافآت',
    pointsBalance: 'رصيد النقاط',
    pointsLabel: 'نقطة',
    pointsLabelPlural: 'نقاط',
    earnPoints: 'اكسب النقاط',
    redeemPoints: 'استبدل النقاط',
    availableRewards: 'المكافآت المتاحة',
    yourRewards: 'مكافآتك',
    tierStatus: 'حالة الفئة',
    currentTier: 'الفئة الحالية',
    nextTier: 'الفئة التالية',
    pointsToNextTier: 'نقاط للفئة التالية',
    pointsHistory: 'سجل النقاط',
    recentActivity: 'النشاط الأخير',
    viewAllRewards: 'عرض جميع المكافآت',
    startEarning: 'ابدأ بالربح',
    joinProgram: 'انضم للبرنامج',
    memberSince: 'عضو منذ',
    pointsExpiringSoon: 'نقاط ستنتهي قريباً',
    expiringPoints: 'نقاط منتهية الصلاحية',
    noPointsYet: 'لا توجد نقاط بعد',
    howToEarn: 'كيفية الربح',
    howToRedeem: 'كيفية الاستبدال',
    termsAndConditions: 'الشروط والأحكام',
    programBenefits: 'مزايا البرنامج',
    welcomeBonus: 'مكافأة الترحيب',
    referralBonus: 'مكافأة الإحالة',
    birthdayBonus: 'مكافأة عيد الميلاد',
    signupEarn: 'سجل واحصل على',
    purchaseEarn: 'اربح مقابل كل $1',
    reviewEarn: 'اكتب تقييماً',
    socialShareEarn: 'شارك على وسائل التواصل',
    perDollarSpent: 'لكل $1 تنفقه',
    freeShipping: 'شحن مجاني',
  },
  he: {
    programName: 'תוכנית המכירות',
    pointsBalance: 'יתרת הנקודות שלך',
    pointsLabel: 'נקודה',
    pointsLabelPlural: 'נקודות',
    earnPoints: 'הרוויחו נקודות',
    redeemPoints: 'ממשו נקודות',
    availableRewards: 'מתנות זמינות',
    yourRewards: 'המתנות שלך',
    tierStatus: 'סטטוס דרגה',
    currentTier: 'דרגה נוכחית',
    nextTier: 'דרגה הבאה',
    pointsToNextTier: 'נקודות לדרגה הבאה',
    pointsHistory: 'היסטוריית נקודות',
    recentActivity: 'פעילות אחרונה',
    viewAllRewards: 'צפה בכל המתנות',
    startEarning: 'התחל להרוויח',
    joinProgram: 'הצטרף לתוכנית',
    memberSince: 'חבר מאז',
    pointsExpiringSoon: 'נקודות שיפוגו בקרוב',
    expiringPoints: 'נקודות שיפוגו',
    noPointsYet: 'אין נקודות עדיין',
    howToEarn: 'איך להרוויח',
    howToRedeem: 'איך לממש',
    termsAndConditions: 'תנאים והגבלות',
    programBenefits: 'יתרונות התוכנית',
    welcomeBonus: 'בונוס ברוכים הבאים',
    referralBonus: 'בונוס המלצה',
    birthdayBonus: 'בונוס יום הולדת',
    signupEarn: 'הירשם והרווח',
    purchaseEarn: 'הרווח לכל $1',
    reviewEarn: 'כתוב ביקורת',
    socialShareEarn: 'שתף ברשתות חברתיות',
    perDollarSpent: 'לכל $1 שהוצא',
    freeShipping: 'משלוח חינם',
  },
  fr: {
    programName: 'Programme de Fidélité',
    pointsBalance: 'Votre Solde de Points',
    pointsLabel: 'Point',
    pointsLabelPlural: 'Points',
    earnPoints: 'Gagner des Points',
    redeemPoints: 'Utiliser les Points',
    availableRewards: 'Récompenses Disponibles',
    yourRewards: 'Vos Récompenses',
    tierStatus: 'Statut du Niveau',
    currentTier: 'Niveau Actuel',
    nextTier: 'Niveau Suivant',
    pointsToNextTier: 'Points pour le niveau suivant',
    pointsHistory: 'Historique des Points',
    recentActivity: 'Activité Récente',
    viewAllRewards: 'Voir Toutes les Récompenses',
    startEarning: 'Commencer à Gagner',
    joinProgram: 'Rejoindre le Programme',
    memberSince: 'Membre depuis',
    pointsExpiringSoon: 'Points expirant bientôt',
    expiringPoints: 'Points expirants',
    noPointsYet: 'Pas encore de points',
    howToEarn: 'Comment Gagner',
    howToRedeem: 'Comment Utiliser',
    termsAndConditions: 'Conditions Générales',
    programBenefits: 'Avantages du Programme',
    welcomeBonus: 'Bonus de Bienvenue',
    referralBonus: 'Bonus de Parrainage',
    birthdayBonus: 'Bonus d\'Anniversaire',
    signupEarn: 'Inscrivez-vous et gagnez',
    purchaseEarn: 'Gagnez par $1 dépensé',
    reviewEarn: 'Écrivez un avis',
    socialShareEarn: 'Partagez sur les réseaux',
    perDollarSpent: 'par $1 dépensé',
    freeShipping: 'Livraison Gratuite',
  },
  de: {
    programName: 'Treueprogramm',
    pointsBalance: 'Ihr Punktestand',
    pointsLabel: 'Punkt',
    pointsLabelPlural: 'Punkte',
    earnPoints: 'Punkte Sammeln',
    redeemPoints: 'Punkte Einlösen',
    availableRewards: 'Verfügbare Prämien',
    yourRewards: 'Ihre Prämien',
    tierStatus: 'Stufenstatus',
    currentTier: 'Aktuelle Stufe',
    nextTier: 'Nächste Stufe',
    pointsToNextTier: 'Punkte zur nächsten Stufe',
    pointsHistory: 'Punkteverlauf',
    recentActivity: 'Letzte Aktivität',
    viewAllRewards: 'Alle Prämien Anzeigen',
    startEarning: 'Jetzt Punkten',
    joinProgram: 'Programm Beitreten',
    memberSince: 'Mitglied seit',
    pointsExpiringSoon: 'Punkte laufen bald ab',
    expiringPoints: 'Abgelaufene Punkte',
    noPointsYet: 'Noch keine Punkte',
    howToEarn: 'So Sammeln Sie',
    howToRedeem: 'So Lösen Sie Ein',
    termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    programBenefits: 'Programmvorteile',
    welcomeBonus: 'Willkommensbonus',
    referralBonus: 'Empfehlungsbonus',
    birthdayBonus: 'Geburtstagsbonus',
    signupEarn: 'Registrieren und erhalten Sie',
    purchaseEarn: 'Pro $1 ausgeben',
    reviewEarn: 'Schreiben Sie eine Bewertung',
    socialShareEarn: 'Auf Social Media teilen',
    perDollarSpent: 'pro $1 ausgegeben',
    freeShipping: 'Kostenloser Versand',
  },
  es: {
    programName: 'Programa de Recompensas',
    pointsBalance: 'Su Saldo de Puntos',
    pointsLabel: 'Punto',
    pointsLabelPlural: 'Puntos',
    earnPoints: 'Ganar Puntos',
    redeemPoints: 'Canjear Puntos',
    availableRewards: 'Recompensas Disponibles',
    yourRewards: 'Sus Recompensas',
    tierStatus: 'Estado del Nivel',
    currentTier: 'Nivel Actual',
    nextTier: 'Próximo Nivel',
    pointsToNextTier: 'Puntos para el siguiente nivel',
    pointsHistory: 'Historial de Puntos',
    recentActivity: 'Actividad Reciente',
    viewAllRewards: 'Ver Todas las Recompensas',
    startEarning: 'Comenzar a Ganar',
    joinProgram: 'Unirse al Programa',
    memberSince: 'Miembro desde',
    pointsExpiringSoon: 'Puntos que expiran pronto',
    expiringPoints: 'Puntos expirando',
    noPointsYet: 'Aún no hay puntos',
    howToEarn: 'Cómo Ganar',
    howToRedeem: 'Cómo Canjear',
    termsAndConditions: 'Términos y Condiciones',
    programBenefits: 'Beneficios del Programa',
    welcomeBonus: 'Bono de Bienvenida',
    referralBonus: 'Bono de Referencia',
    birthdayBonus: 'Bono de Cumpleaños',
    signupEarn: 'Regístrese y gane',
    purchaseEarn: 'Gane por cada $1 gastado',
    reviewEarn: 'Escriba una reseña',
    socialShareEarn: 'Comparta en redes sociales',
    perDollarSpent: 'por cada $1 gastado',
    freeShipping: 'Envío Gratis',
  },
  ja: {
    programName: 'ポイントプログラム',
    pointsBalance: 'ポイント残高',
    pointsLabel: 'ポイント',
    pointsLabelPlural: 'ポイント',
    earnPoints: 'ポイントを貯める',
    redeemPoints: 'ポイントを使う',
    availableRewards: '利用可能な特典',
    yourRewards: 'あなたの特典',
    tierStatus: '会員ステータス',
    currentTier: '現在のステータス',
    nextTier: '次のステータス',
    pointsToNextTier: '次のステータスまで',
    pointsHistory: 'ポイント履歴',
    recentActivity: '最近の活動',
    viewAllRewards: 'すべての特典を見る',
    startEarning: '貯める開始',
    joinProgram: 'プログラムに参加',
    memberSince: '入会日',
    pointsExpiringSoon: 'まもなく失効するポイント',
    expiringPoints: '失効するポイント',
    noPointsYet: 'まだポイントがありません',
    howToEarn: '貯め方',
    howToRedeem: '使い方',
    termsAndConditions: '規約',
    programBenefits: 'プログラム特典',
    welcomeBonus: '入会特典',
    referralBonus: '紹介特典',
    birthdayBonus: '誕生日特典',
    signupEarn: '登録で獲得',
    purchaseEarn: '$1ごとに獲得',
    reviewEarn: 'レビューを書く',
    socialShareEarn: 'SNSでシェア',
    perDollarSpent: '$1につき',
    freeShipping: '送料無料',
  },
  ko: {
    programName: '포인트 프로그램',
    pointsBalance: '포인트 잔액',
    pointsLabel: '포인트',
    pointsLabelPlural: '포인트',
    earnPoints: '포인트 적립',
    redeemPoints: '포인트 사용',
    availableRewards: '사용 가능한 혜택',
    yourRewards: '나의 혜택',
    tierStatus: '등급 상태',
    currentTier: '현재 등급',
    nextTier: '다음 등급',
    pointsToNextTier: '다음 등급까지',
    pointsHistory: '포인트 내역',
    recentActivity: '최근 활동',
    viewAllRewards: '모든 혜택 보기',
    startEarning: '적립 시작',
    joinProgram: '프로그램 가입',
    memberSince: '가입일',
    pointsExpiringSoon: '곧 만료되는 포인트',
    expiringPoints: '만료 예정 포인트',
    noPointsYet: '아직 포인트가 없습니다',
    howToEarn: '적립 방법',
    howToRedeem: '사용 방법',
    termsAndConditions: '약관',
    programBenefits: '프로그램 혜택',
    welcomeBonus: '가입 보너스',
    referralBonus: '추천 보너스',
    birthdayBonus: '생일 보너스',
    signupEarn: '가입하고 받기',
    purchaseEarn: '$1당 적립',
    reviewEarn: '리뷰 작성',
    socialShareEarn: 'SNS 공유',
    perDollarSpent: '$1당',
    freeShipping: '무료 배송',
  },
  zh: {
    programName: '积分计划',
    pointsBalance: '积分余额',
    pointsLabel: '积分',
    pointsLabelPlural: '积分',
    earnPoints: '赚取积分',
    redeemPoints: '兑换积分',
    availableRewards: '可用奖励',
    yourRewards: '您的奖励',
    tierStatus: '等级状态',
    currentTier: '当前等级',
    nextTier: '下一等级',
    pointsToNextTier: '距离下一等级',
    pointsHistory: '积分历史',
    recentActivity: '最近活动',
    viewAllRewards: '查看所有奖励',
    startEarning: '开始赚取',
    joinProgram: '加入计划',
    memberSince: '会员自',
    pointsExpiringSoon: '即将过期的积分',
    expiringPoints: '过期积分',
    noPointsYet: '暂无积分',
    howToEarn: '如何赚取',
    howToRedeem: '如何兑换',
    termsAndConditions: '条款和条件',
    programBenefits: '计划福利',
    welcomeBonus: '欢迎奖励',
    referralBonus: '推荐奖励',
    birthdayBonus: '生日奖励',
    signupEarn: '注册即得',
    purchaseEarn: '每消费$1',
    reviewEarn: '撰写评价',
    socialShareEarn: '社交媒体分享',
    perDollarSpent: '每消费$1',
    freeShipping: '免费配送',
  },
};

// VIP Tier localization
const TIER_LOCALIZATION: Record<VipTier, Record<SupportedLocale, { name: string; description: string }>> = {
  bronze: {
    en: { name: 'Bronze', description: 'Entry level membership with basic benefits' },
    ar: { name: 'برونزية', description: 'عضوية المستوى الأول مع المزايا الأساسية' },
    he: { name: 'ברונזה', description: 'חברות רמת כניסה עם הטבות בסיסיות' },
    fr: { name: 'Bronze', description: 'Adhésion de niveau d\'entrée avec avantages de base' },
    de: { name: 'Bronze', description: 'Einstiegsmitgliedschaft mit Basisleistungen' },
    es: { name: 'Bronce', description: 'Membresía de nivel inicial con beneficios básicos' },
    ja: { name: 'ブロンズ', description: '基本特典付きのエントリーレベル会員' },
    ko: { name: '브론즈', description: '기본 혜택이 있는 입문 등급' },
    zh: { name: '青铜', description: '基础福利的入门级会员' },
  },
  silver: {
    en: { name: 'Silver', description: 'Enhanced benefits and exclusive offers' },
    ar: { name: 'فضية', description: 'مزايا محسّنة وعروض حصرية' },
    he: { name: 'כסף', description: 'הטבות משופרות והצעות בלעדיות' },
    fr: { name: 'Argent', description: 'Avantages améliorés et offres exclusives' },
    de: { name: 'Silber', description: 'Verbesserte Leistungen und exklusive Angebote' },
    es: { name: 'Plata', description: 'Beneficios mejorados y ofertas exclusivas' },
    ja: { name: 'シルバー', description: '特典アップと限定オファー' },
    ko: { name: '실버', description: '향상된 혜택과 특별 제공' },
    zh: { name: '白银', description: '增强福利和独家优惠' },
  },
  gold: {
    en: { name: 'Gold', description: 'Premium benefits and priority service' },
    ar: { name: 'ذهبية', description: 'مزايا مميزة وخدمة أولوية' },
    he: { name: 'זהב', description: 'הטבות פרימיום ושירות עדיפות' },
    fr: { name: 'Or', description: 'Avantages premium et service prioritaire' },
    de: { name: 'Gold', description: 'Premium-Leistungen und Prioritätservice' },
    es: { name: 'Oro', description: 'Beneficios premium y servicio prioritario' },
    ja: { name: 'ゴールド', description: 'プレミアム特典と優先サービス' },
    ko: { name: '골드', description: '프리미엄 혜택과 우선 서비스' },
    zh: { name: '黄金', description: '高级福利和优先服务' },
  },
  platinum: {
    en: { name: 'Platinum', description: 'Ultimate VIP experience with all perks' },
    ar: { name: 'بلاتينية', description: 'تجربة VIP المثالية مع جميع المزايا' },
    he: { name: 'פלטינום', description: 'חוויית VIP אולטימטיבית עם כל ההטבות' },
    fr: { name: 'Platine', description: 'Expérience VIP ultime avec tous les avantages' },
    de: { name: 'Platin', description: 'Ultimative VIP-Erfahrung mit allen Vorteilen' },
    es: { name: 'Platino', description: 'Experiencia VIP definitiva con todos los beneficios' },
    ja: { name: 'プラチナ', description: 'すべての特典を備えた究極のVIP体験' },
    ko: { name: '플래티넘', description: '모든 혜택이 포함된 궁극의 VIP 경험' },
    zh: { name: '铂金', description: '终极VIP体验，享有一切特权' },
  },
};

// Reward type localization
const REWARD_TYPE_LOCALIZATION: Record<RewardType, Record<SupportedLocale, string>> = {
  discount: {
    en: 'Discount',
    ar: 'خصم',
    he: 'הנחה',
    fr: 'Réduction',
    de: 'Rabatt',
    es: 'Descuento',
    ja: '割引',
    ko: '할인',
    zh: '折扣',
  },
  free_shipping: {
    en: 'Free Shipping',
    ar: 'شحن مجاني',
    he: 'משלוח חינם',
    fr: 'Livraison Gratuite',
    de: 'Kostenloser Versand',
    es: 'Envío Gratis',
    ja: '送料無料',
    ko: '무료 배송',
    zh: '免费配送',
  },
  free_product: {
    en: 'Free Product',
    ar: 'منتج مجاني',
    he: 'מוצר חינם',
    fr: 'Produit Gratuit',
    de: 'Gratis Produkt',
    es: 'Producto Gratis',
    ja: '無料商品',
    ko: '무료 제품',
    zh: '免费产品',
  },
  gift_card: {
    en: 'Gift Card',
    ar: 'بطاقة هدايا',
    he: 'כרטיס מתנה',
    fr: 'Carte Cadeau',
    de: 'Geschenkkarte',
    es: 'Tarjeta de Regalo',
    ja: 'ギフトカード',
    ko: '기프트 카드',
    zh: '礼品卡',
  },
  exclusive_access: {
    en: 'Exclusive Access',
    ar: 'وصول حصري',
    he: 'גישה בלעדית',
    fr: 'Accès Exclusif',
    de: 'Exklusiver Zugang',
    es: 'Acceso Exclusivo',
    ja: '限定アクセス',
    ko: '전용 접근',
    zh: '专属访问',
  },
  cashback: {
    en: 'Cashback',
    ar: 'استرداد نقدي',
    he: 'החזר כספי',
    fr: 'Remboursement',
    de: 'Cashback',
    es: 'Reembolso',
    ja: 'キャッシュバック',
    ko: '캐시백',
    zh: '返现',
  },
};

// Transaction type localization
const TRANSACTION_TYPE_LOCALIZATION: Record<TransactionType, Record<SupportedLocale, string>> = {
  earned: {
    en: 'Earned',
    ar: 'تم الربح',
    he: 'הושג',
    fr: 'Gagné',
    de: 'Erhalten',
    es: 'Ganado',
    ja: '獲得',
    ko: '적립됨',
    zh: '已赚取',
  },
  redeemed: {
    en: 'Redeemed',
    ar: 'تم الاستبدال',
    he: 'מומש',
    fr: 'Utilisé',
    de: 'Eingelöst',
    es: 'Canjeado',
    ja: '使用済',
    ko: '사용됨',
    zh: '已兑换',
  },
  expired: {
    en: 'Expired',
    ar: 'منتهي الصلاحية',
    he: 'פג תוקף',
    fr: 'Expiré',
    de: 'Abgelaufen',
    es: 'Expirado',
    ja: '失効',
    ko: '만료됨',
    zh: '已过期',
  },
  bonus: {
    en: 'Bonus',
    ar: 'مكافأة',
    he: 'בונוס',
    fr: 'Bonus',
    de: 'Bonus',
    es: 'Bono',
    ja: 'ボーナス',
    ko: '보너스',
    zh: '奖励',
  },
  adjusted: {
    en: 'Adjusted',
    ar: 'معدل',
    he: 'מותאם',
    fr: 'Ajusté',
    de: 'Angepasst',
    es: 'Ajustado',
    ja: '調整',
    ko: '조정됨',
    zh: '已调整',
  },
};

// Default VIP tier configurations
export const VIP_TIERS: VipTierConfig[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    color: '#CD7F32',
    minPoints: 0,
    maxPoints: 999,
    benefits: {
      multiplier: 1,
      freeShipping: false,
      earlyAccess: false,
      exclusiveProducts: false,
      birthdayGift: false,
      prioritySupport: false,
      personalShopper: false,
    },
    description: 'Entry level membership with basic benefits',
  },
  {
    id: 'silver',
    name: 'Silver',
    color: '#C0C0C0',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: {
      multiplier: 1.25,
      freeShipping: true,
      earlyAccess: true,
      exclusiveProducts: false,
      birthdayGift: true,
      prioritySupport: false,
      personalShopper: false,
    },
    description: 'Enhanced benefits and exclusive offers',
  },
  {
    id: 'gold',
    name: 'Gold',
    color: '#FFD700',
    minPoints: 5000,
    maxPoints: 19999,
    benefits: {
      multiplier: 1.5,
      freeShipping: true,
      earlyAccess: true,
      exclusiveProducts: true,
      birthdayGift: true,
      prioritySupport: true,
      personalShopper: false,
    },
    description: 'Premium benefits and priority service',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    color: '#E5E4E2',
    minPoints: 20000,
    benefits: {
      multiplier: 2,
      freeShipping: true,
      earlyAccess: true,
      exclusiveProducts: true,
      birthdayGift: true,
      prioritySupport: true,
      personalShopper: true,
    },
    description: 'Ultimate VIP experience with all perks',
  },
];

// Default earning rules
export const DEFAULT_EARNING_RULES = {
  signupPoints: 100,
  purchasePointsPerDollar: 1,
  reviewPoints: 50,
  socialSharePoints: 25,
  referralPoints: 200,
  birthdayBonusPoints: 100,
};

/**
 * Get loyalty program labels for a specific locale
 * @param locale - The target locale code
 * @returns LoyaltyLabels object with translated strings
 */
export function getLoyaltyLabels(locale: string): LoyaltyLabels {
  const normalizedLocale = normalizeLocale(locale);
  return LOYALTY_LOCALIZATION[normalizedLocale] || LOYALTY_LOCALIZATION.en;
}

/**
 * Format points balance with locale-appropriate formatting
 * @param points - The points value to format
 * @param locale - The target locale code
 * @returns Formatted points string
 */
export function formatPointsBalance(points: number, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const labels = getLoyaltyLabels(normalizedLocale);
  
  // Use Intl.NumberFormat for proper locale formatting
  const formatter = new Intl.NumberFormat(normalizedLocale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const formattedPoints = formatter.format(points);
  const pointLabel = points === 1 ? labels.pointsLabel : labels.pointsLabelPlural;
  
  // RTL locales (Arabic, Hebrew) need special handling
  if (isRTLLocale(normalizedLocale)) {
    return `${formattedPoints} ${pointLabel}`;
  }
  
  return `${formattedPoints} ${pointLabel}`;
}

/**
 * Get VIP tier label with localized name and description
 * @param tier - The VIP tier identifier
 * @param locale - The target locale code
 * @returns Object with localized name and description
 */
export function getTierLabel(tier: VipTier, locale: string): { name: string; description: string } {
  const normalizedLocale = normalizeLocale(locale);
  const tierData = TIER_LOCALIZATION[tier]?.[normalizedLocale];
  
  if (tierData) {
    return tierData;
  }
  
  // Fallback to English
  return TIER_LOCALIZATION[tier]?.en || { name: tier, description: '' };
}

/**
 * Get all reward type labels for a locale
 * @param locale - The target locale code
 * @returns Record of reward type to localized label
 */
export function getRewardLabels(locale: string): Record<RewardType, string> {
  const normalizedLocale = normalizeLocale(locale);
  const result = {} as Record<RewardType, string>;
  
  for (const type of Object.keys(REWARD_TYPE_LOCALIZATION) as RewardType[]) {
    result[type] = REWARD_TYPE_LOCALIZATION[type][normalizedLocale] || 
                   REWARD_TYPE_LOCALIZATION[type].en;
  }
  
  return result;
}

/**
 * Get transaction type label
 * @param type - The transaction type
 * @param locale - The target locale code
 * @returns Localized transaction type label
 */
export function getTransactionTypeLabel(type: TransactionType, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return TRANSACTION_TYPE_LOCALIZATION[type]?.[normalizedLocale] || 
         TRANSACTION_TYPE_LOCALIZATION[type]?.en || 
         type;
}

/**
 * Format redemption message
 * @param points - Points used for redemption
 * @param reward - The reward being redeemed
 * @param locale - The target locale code
 * @returns Formatted redemption message
 */
export function formatRedemptionMessage(
  points: number,
  reward: RewardItem,
  locale: string
): string {
  const normalizedLocale = normalizeLocale(locale);
  const labels = getLoyaltyLabels(normalizedLocale);
  const rewardLabels = getRewardLabels(normalizedLocale);
  
  const formattedPoints = new Intl.NumberFormat(normalizedLocale).format(points);
  const rewardTypeLabel = rewardLabels[reward.type];
  
  // Build redemption message based on locale
  const templates: Record<SupportedLocale, string> = {
    en: `You redeemed ${formattedPoints} ${labels.pointsLabelPlural} for ${reward.name} (${rewardTypeLabel})`,
    ar: `لقد استبدلت ${formattedPoints} ${labels.pointsLabelPlural} مقابل ${reward.name} (${rewardTypeLabel})`,
    he: `מימשת ${formattedPoints} ${labels.pointsLabelPlural} תמורת ${reward.name} (${rewardTypeLabel})`,
    fr: `Vous avez utilisé ${formattedPoints} ${labels.pointsLabelPlural} pour ${reward.name} (${rewardTypeLabel})`,
    de: `Sie haben ${formattedPoints} ${labels.pointsLabelPlural} für ${reward.name} eingelöst (${rewardTypeLabel})`,
    es: `Has canjeado ${formattedPoints} ${labels.pointsLabelPlural} por ${reward.name} (${rewardTypeLabel})`,
    ja: `${formattedPoints}${labels.pointsLabelPlural}を${reward.name}（${rewardTypeLabel}）に交換しました`,
    ko: `${formattedPoints}${labels.pointsLabelPlural}를 ${reward.name}(${rewardTypeLabel})으로 교환했습니다`,
    zh: `您已兑换 ${formattedPoints} ${labels.pointsLabelPlural} 获取 ${reward.name}（${rewardTypeLabel}）`,
  };
  
  return templates[normalizedLocale] || templates.en;
}

/**
 * Format points earning message
 * @param points - Points earned
 * @param action - The action that earned points
 * @param locale - The target locale code
 * @returns Formatted earning message
 */
export function formatPointsEarnedMessage(
  points: number,
  action: string,
  locale: string
): string {
  const normalizedLocale = normalizeLocale(locale);
  const labels = getLoyaltyLabels(normalizedLocale);
  const formattedPoints = new Intl.NumberFormat(normalizedLocale).format(points);
  
  const templates: Record<SupportedLocale, string> = {
    en: `You earned ${formattedPoints} ${labels.pointsLabelPlural} for ${action}`,
    ar: `لقد ربحت ${formattedPoints} ${labels.pointsLabelPlural} مقابل ${action}`,
    he: `הרווחת ${formattedPoints} ${labels.pointsLabelPlural} עבור ${action}`,
    fr: `Vous avez gagné ${formattedPoints} ${labels.pointsLabelPlural} pour ${action}`,
    de: `Sie haben ${formattedPoints} ${labels.pointsLabelPlural} für ${action} erhalten`,
    es: `Has ganado ${formattedPoints} ${labels.pointsLabelPlural} por ${action}`,
    ja: `${action}で${formattedPoints}${labels.pointsLabelPlural}を獲得しました`,
    ko: `${action}으로 ${formattedPoints}${labels.pointsLabelPlural}를 적립했습니다`,
    zh: `您因 ${action} 赚取了 ${formattedPoints} ${labels.pointsLabelPlural}`,
  };
  
  return templates[normalizedLocale] || templates.en;
}

/**
 * Get progress to next tier
 * @param currentPoints - Current points balance
 * @param currentTier - Current VIP tier
 * @param locale - The target locale code
 * @returns Progress information
 */
export function getTierProgress(
  currentPoints: number,
  currentTier: VipTier,
  locale: string
): {
  currentTier: VipTier;
  nextTier: VipTier | null;
  pointsToNextTier: number;
  progressPercentage: number;
  message: string;
} {
  const normalizedLocale = normalizeLocale(locale);
  const tierOrder: VipTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
  
  const currentTierConfig = VIP_TIERS.find(t => t.id === currentTier);
  const nextTierConfig = nextTier ? VIP_TIERS.find(t => t.id === nextTier) : null;
  
  const pointsToNextTier = nextTierConfig 
    ? Math.max(0, nextTierConfig.minPoints - currentPoints)
    : 0;
  
  // Calculate progress percentage
  let progressPercentage = 100;
  if (nextTierConfig && currentTierConfig) {
    const range = nextTierConfig.minPoints - currentTierConfig.minPoints;
    const progress = currentPoints - currentTierConfig.minPoints;
    progressPercentage = Math.min(100, Math.max(0, (progress / range) * 100));
  }
  
  // Generate localized message
  const labels = getLoyaltyLabels(normalizedLocale);
  let message: string;
  
  if (nextTier) {
    const nextTierLabel = getTierLabel(nextTier, normalizedLocale);
    const formattedPoints = new Intl.NumberFormat(normalizedLocale).format(pointsToNextTier);
    
    const messages: Record<SupportedLocale, string> = {
      en: `${formattedPoints} more ${labels.pointsLabelPlural} to reach ${nextTierLabel.name}`,
      ar: `${formattedPoints} ${labels.pointsLabelPlural} إضافية للوصول إلى ${nextTierLabel.name}`,
      he: `${formattedPoints} ${labels.pointsLabelPlural} נוספים להגעה ל${nextTierLabel.name}`,
      fr: `Encore ${formattedPoints} ${labels.pointsLabelPlural} pour atteindre ${nextTierLabel.name}`,
      de: `Noch ${formattedPoints} ${labels.pointsLabelPlural} bis ${nextTierLabel.name}`,
      es: `${formattedPoints} ${labels.pointsLabelPlural} más para alcanzar ${nextTierLabel.name}`,
      ja: `${nextTierLabel.name}まであと${formattedPoints}${labels.pointsLabelPlural}`,
      ko: `${nextTierLabel.name}까지 ${formattedPoints}${labels.pointsLabelPlural} 남음`,
      zh: `再赚取 ${formattedPoints} ${labels.pointsLabelPlural} 即可达到 ${nextTierLabel.name}`,
    };
    message = messages[normalizedLocale] || messages.en;
  } else {
    const messages: Record<SupportedLocale, string> = {
      en: 'You have reached the highest tier!',
      ar: 'لقد وصلت إلى أعلى فئة!',
      he: 'הגעת לדרגה הגבוהה ביותר!',
      fr: 'Vous avez atteint le niveau le plus élevé !',
      de: 'Sie haben die höchste Stufe erreicht!',
      es: '¡Has alcanzado el nivel más alto!',
      ja: '最高ランクに到達しました！',
      ko: '최고 등급에 도달했습니다!',
      zh: '您已达到最高等级！',
    };
    message = messages[normalizedLocale] || messages.en;
  }
  
  return {
    currentTier,
    nextTier,
    pointsToNextTier,
    progressPercentage,
    message,
  };
}

/**
 * Calculate points value in currency
 * @param points - Points to convert
 * @param pointsPerCurrency - Points needed per currency unit
 * @returns Currency value
 */
export function calculatePointsValue(points: number, pointsPerCurrency: number = 100): number {
  if (pointsPerCurrency <= 0) return 0;
  return Number((points / pointsPerCurrency).toFixed(2));
}

/**
 * Calculate how many points are needed for a currency amount
 * @param amount - Currency amount
 * @param pointsPerCurrency - Points needed per currency unit
 * @returns Points needed
 */
export function calculatePointsForAmount(amount: number, pointsPerCurrency: number = 100): number {
  if (amount <= 0) return 0;
  return Math.ceil(amount * pointsPerCurrency);
}

/**
 * Validate if a reward can be redeemed
 * @param pointsBalance - Current points balance
 * @param reward - The reward to redeem
 * @returns Validation result
 */
export function validateRedemption(
  pointsBalance: number,
  reward: RewardItem
): { valid: boolean; error?: string } {
  if (!reward.available) {
    return { valid: false, error: 'Reward is not available' };
  }
  
  if (reward.limitedQuantity && (reward.quantityRemaining || 0) <= 0) {
    return { valid: false, error: 'Reward is out of stock' };
  }
  
  if (reward.expiresAt && new Date() > reward.expiresAt) {
    return { valid: false, error: 'Reward has expired' };
  }
  
  if (pointsBalance < reward.pointsCost) {
    return { 
      valid: false, 
      error: `Insufficient points. You need ${reward.pointsCost} points.` 
    };
  }
  
  return { valid: true };
}

/**
 * Get tier by points
 * @param points - Current points balance
 * @returns VIP tier configuration
 */
export function getTierByPoints(points: number): VipTierConfig {
  // Sort tiers by minPoints descending to find the highest qualifying tier
  const sortedTiers = [...VIP_TIERS].sort((a, b) => b.minPoints - a.minPoints);
  
  for (const tier of sortedTiers) {
    if (points >= tier.minPoints) {
      return tier;
    }
  }
  
  return VIP_TIERS[0]; // Default to bronze
}

/**
 * Get benefits list for a tier
 * @param tier - The VIP tier
 * @param locale - The target locale code
 * @returns Array of localized benefit descriptions
 */
export function getTierBenefitsList(tier: VipTier, locale: string): string[] {
  const normalizedLocale = normalizeLocale(locale);
  const tierConfig = VIP_TIERS.find(t => t.id === tier);
  
  if (!tierConfig) return [];
  
  const labels = getLoyaltyLabels(normalizedLocale);
  const benefits: string[] = [];
  
  // Points multiplier benefit
  if (tierConfig.benefits.multiplier > 1) {
    const multiplierText: Record<SupportedLocale, string> = {
      en: `${tierConfig.benefits.multiplier}x points on every purchase`,
      ar: `${tierConfig.benefits.multiplier}x نقاط على كل عملية شراء`,
      he: `${tierConfig.benefits.multiplier}x נקודות על כל רכישה`,
      fr: `${tierConfig.benefits.multiplier}x points sur chaque achat`,
      de: `${tierConfig.benefits.multiplier}x Punkte bei jedem Kauf`,
      es: `${tierConfig.benefits.multiplier}x puntos en cada compra`,
      ja: `購入ごとに${tierConfig.benefits.multiplier}倍ポイント`,
      ko: `구매 시 ${tierConfig.benefits.multiplier}배 포인트`,
      zh: `每次购买${tierConfig.benefits.multiplier}倍积分`,
    };
    benefits.push(multiplierText[normalizedLocale] || multiplierText.en);
  }
  
  if (tierConfig.benefits.freeShipping) {
    benefits.push(labels.freeShipping);
  }
  
  if (tierConfig.benefits.earlyAccess) {
    const earlyAccessText: Record<SupportedLocale, string> = {
      en: 'Early access to sales',
      ar: 'وصول مبكر للتخفيضات',
      he: 'גישה מוקדמת למבצעים',
      fr: 'Accès anticipé aux soldes',
      de: 'Früher Zugang zu Angeboten',
      es: 'Acceso anticipado a rebajas',
      ja: 'セールへの早期アクセス',
      ko: '세일 우선 접근',
      zh: '促销优先访问',
    };
    benefits.push(earlyAccessText[normalizedLocale] || earlyAccessText.en);
  }
  
  if (tierConfig.benefits.exclusiveProducts) {
    const exclusiveText: Record<SupportedLocale, string> = {
      en: 'Access to exclusive products',
      ar: 'الوصول إلى منتجات حصرية',
      he: 'גישה למוצרים בלעדיים',
      fr: 'Accès aux produits exclusifs',
      de: 'Zugang zu exklusiven Produkten',
      es: 'Acceso a productos exclusivos',
      ja: '限定商品へのアクセス',
      ko: '전용 제품 접근',
      zh: '专属产品访问权限',
    };
    benefits.push(exclusiveText[normalizedLocale] || exclusiveText.en);
  }
  
  if (tierConfig.benefits.birthdayGift) {
    benefits.push(labels.birthdayBonus);
  }
  
  if (tierConfig.benefits.prioritySupport) {
    const supportText: Record<SupportedLocale, string> = {
      en: 'Priority customer support',
      ar: 'دعم عملاء ذو أولوية',
      he: 'תמיכת לקוחות בעדיפות',
      fr: 'Support client prioritaire',
      de: 'Priorisierter Kundensupport',
      es: 'Soporte prioritario',
      ja: '優先カスタマーサポート',
      ko: '우선 고객 지원',
      zh: '优先客户支持',
    };
    benefits.push(supportText[normalizedLocale] || supportText.en);
  }
  
  if (tierConfig.benefits.personalShopper) {
    const shopperText: Record<SupportedLocale, string> = {
      en: 'Personal shopper service',
      ar: 'خدمة التسوق الشخصي',
      he: 'שירות קניות אישי',
      fr: 'Service de personal shopper',
      de: 'Personal Shopping Service',
      es: 'Servicio de comprador personal',
      ja: 'パーソナルショッパーサービス',
      ko: '개인 쇼핑 서비스',
      zh: '私人购物服务',
    };
    benefits.push(shopperText[normalizedLocale] || shopperText.en);
  }
  
  return benefits;
}

/**
 * Normalize locale code to supported format
 * @param locale - Input locale string
 * @returns Normalized SupportedLocale
 */
function normalizeLocale(locale: string): SupportedLocale {
  const normalized = locale.toLowerCase().split('-')[0];
  
  if (normalized in LOYALTY_LOCALIZATION) {
    return normalized as SupportedLocale;
  }
  
  return 'en';
}

/**
 * Check if locale is RTL
 * @param locale - Locale code
 * @returns True if RTL locale
 */
function isRTLLocale(locale: SupportedLocale): boolean {
  return locale === 'ar' || locale === 'he';
}

// Export all types and constants
export {
  LOYALTY_LOCALIZATION,
  TIER_LOCALIZATION,
  REWARD_TYPE_LOCALIZATION,
  TRANSACTION_TYPE_LOCALIZATION,
};
