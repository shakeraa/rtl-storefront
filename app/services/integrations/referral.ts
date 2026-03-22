/**
 * Referral Apps Integration Service
 * T0222: Integration - Referral Apps
 * 
 * Provides translated labels, share messages, and dashboard content
 * for referral program integrations supporting Arabic (ar), Hebrew (he),
 * and English (en) locales.
 */

/**
 * Referral program status types
 */
export type ReferralStatus = 'pending' | 'successful' | 'rewarded' | 'expired' | 'cancelled';

/**
 * Referral reward types
 */
export type RewardType = 'discount' | 'credit' | 'cash' | 'points' | 'free_shipping';

/**
 * Referral share channel types
 */
export type ShareChannel = 'email' | 'whatsapp' | 'facebook' | 'twitter' | 'copy_link' | 'sms';

/**
 * Interface for referral program labels
 */
export interface ReferralLabels {
  // Program header labels
  programTitle: string;
  programSubtitle: string;
  howItWorks: string;
  inviteFriends: string;
  earnRewards: string;
  shareAndEarn: string;
  
  // Share section labels
  shareYourCode: string;
  yourReferralCode: string;
  copyCode: string;
  codeCopied: string;
  shareVia: string;
  
  // Invite message labels
  inviteSubject: string;
  inviteMessage: string;
  personalMessage: string;
  sendInvite: string;
  
  // Reward labels
  yourRewards: string;
  rewardEarned: string;
  rewardsHistory: string;
  rewardAmount: string;
  rewardType: string;
  rewardStatus: string;
  
  // Credit labels
  creditBalance: string;
  creditEarned: string;
  creditUsed: string;
  availableCredit: string;
  applyCredit: string;
  
  // Status labels
  statusPending: string;
  statusSuccessful: string;
  statusRewarded: string;
  statusExpired: string;
  statusCancelled: string;
  
  // Dashboard labels
  totalReferrals: string;
  successfulReferrals: string;
  pendingReferrals: string;
  totalEarnings: string;
  referralHistory: string;
  viewDetails: string;
  noReferrals: string;
  startSharing: string;
}

/**
 * Interface for share message templates
 */
export interface ShareMessageTemplate {
  subject: string;
  body: string;
  preview: string;
}

/**
 * Interface for referral dashboard data
 */
export interface ReferralDashboard {
  title: string;
  stats: {
    totalLabel: string;
    successfulLabel: string;
    pendingLabel: string;
    earningsLabel: string;
  };
  actions: {
    shareLabel: string;
    viewHistoryLabel: string;
    withdrawLabel: string;
  };
}

/**
 * Interface for referral credit info
 */
export interface ReferralCreditInfo {
  balanceLabel: string;
  earnedLabel: string;
  usedLabel: string;
  availableLabel: string;
  expiresLabel: string;
}

// Arabic translations
export const ARABIC_REFERRAL_LABELS: ReferralLabels = {
  // Program header labels
  programTitle: 'برنامج الإحالة',
  programSubtitle: 'ادعُ أصدقاءك واكسب مكافآت',
  howItWorks: 'كيف يعمل',
  inviteFriends: 'ادعُ أصدقاءك',
  earnRewards: 'اكسب المكافآت',
  shareAndEarn: 'شارك واكسب',
  
  // Share section labels
  shareYourCode: 'شارك رمز الإحالة الخاص بك',
  yourReferralCode: 'رمز الإحالة الخاص بك',
  copyCode: 'نسخ الرمز',
  codeCopied: 'تم نسخ الرمز!',
  shareVia: 'شارك عبر',
  
  // Invite message labels
  inviteSubject: 'لديك دعوة خاصة!',
  inviteMessage: 'انضم إليّ واحصل على خصم خاص',
  personalMessage: 'رسالة شخصية',
  sendInvite: 'إرسال الدعوة',
  
  // Reward labels
  yourRewards: 'مكافآتك',
  rewardEarned: 'تم الحصول على المكافأة',
  rewardsHistory: 'سجل المكافآت',
  rewardAmount: 'قيمة المكافأة',
  rewardType: 'نوع المكافأة',
  rewardStatus: 'حالة المكافأة',
  
  // Credit labels
  creditBalance: 'رصيدك',
  creditEarned: 'الرصيد المكتسب',
  creditUsed: 'الرصيد المستخدم',
  availableCredit: 'الرصيد المتاح',
  applyCredit: 'استخدام الرصيد',
  
  // Status labels
  statusPending: 'معلق',
  statusSuccessful: 'ناجح',
  statusRewarded: 'تم الصرف',
  statusExpired: 'منتهي الصلاحية',
  statusCancelled: 'ملغى',
  
  // Dashboard labels
  totalReferrals: 'إجمالي الإحالات',
  successfulReferrals: 'الإحالات الناجحة',
  pendingReferrals: 'الإحالات المعلقة',
  totalEarnings: 'إجمالي الأرباح',
  referralHistory: 'سجل الإحالات',
  viewDetails: 'عرض التفاصيل',
  noReferrals: 'لا توجد إحالات بعد',
  startSharing: 'ابدأ المشاركة مع أصدقائك',
};

// Hebrew translations
export const HEBREW_REFERRAL_LABELS: ReferralLabels = {
  // Program header labels
  programTitle: 'תוכנית החברים מביאים חברים',
  programSubtitle: 'הזמן חברים וקבל תגמולים',
  howItWorks: 'איך זה עובד',
  inviteFriends: 'הזמן חברים',
  earnRewards: 'קבל תגמולים',
  shareAndEarn: 'שתף ותרוויח',
  
  // Share section labels
  shareYourCode: 'שתף את קוד ההפניה שלך',
  yourReferralCode: 'קוד ההפניה שלך',
  copyCode: 'העתק קוד',
  codeCopied: 'הקוד הועתק!',
  shareVia: 'שתף דרך',
  
  // Invite message labels
  inviteSubject: 'יש לך הזמנה מיוחדת!',
  inviteMessage: 'הצטרף אליי וקבל הנחה מיוחדת',
  personalMessage: 'הודעה אישית',
  sendInvite: 'שלח הזמנה',
  
  // Reward labels
  yourRewards: 'התגמולים שלך',
  rewardEarned: 'תגמול שהושג',
  rewardsHistory: 'היסטוריית תגמולים',
  rewardAmount: 'סכום התגמול',
  rewardType: 'סוג תגמול',
  rewardStatus: 'סטטוס תגמול',
  
  // Credit labels
  creditBalance: 'יתרת הזיכוי שלך',
  creditEarned: 'זיכוי שהושג',
  creditUsed: 'זיכוי שנוצל',
  availableCredit: 'זיכוי זמין',
  applyCredit: 'החל זיכוי',
  
  // Status labels
  statusPending: 'ממתין',
  statusSuccessful: 'הצלחה',
  statusRewarded: 'שולם',
  statusExpired: 'פג תוקף',
  statusCancelled: 'בוטל',
  
  // Dashboard labels
  totalReferrals: 'סה"כ הפניות',
  successfulReferrals: 'הפניות מוצלחות',
  pendingReferrals: 'הפניות ממתינות',
  totalEarnings: 'סה"כ רווחים',
  referralHistory: 'היסטוריית הפניות',
  viewDetails: 'צפה בפרטים',
  noReferrals: 'עדיין אין הפניות',
  startSharing: 'התחל לשתף עם חברים',
};

// English translations (default)
export const ENGLISH_REFERRAL_LABELS: ReferralLabels = {
  // Program header labels
  programTitle: 'Referral Program',
  programSubtitle: 'Invite friends and earn rewards',
  howItWorks: 'How It Works',
  inviteFriends: 'Invite Friends',
  earnRewards: 'Earn Rewards',
  shareAndEarn: 'Share & Earn',
  
  // Share section labels
  shareYourCode: 'Share Your Referral Code',
  yourReferralCode: 'Your Referral Code',
  copyCode: 'Copy Code',
  codeCopied: 'Code Copied!',
  shareVia: 'Share via',
  
  // Invite message labels
  inviteSubject: 'You have a special invitation!',
  inviteMessage: 'Join me and get a special discount',
  personalMessage: 'Personal Message',
  sendInvite: 'Send Invite',
  
  // Reward labels
  yourRewards: 'Your Rewards',
  rewardEarned: 'Reward Earned',
  rewardsHistory: 'Rewards History',
  rewardAmount: 'Reward Amount',
  rewardType: 'Reward Type',
  rewardStatus: 'Reward Status',
  
  // Credit labels
  creditBalance: 'Your Credit Balance',
  creditEarned: 'Credit Earned',
  creditUsed: 'Credit Used',
  availableCredit: 'Available Credit',
  applyCredit: 'Apply Credit',
  
  // Status labels
  statusPending: 'Pending',
  statusSuccessful: 'Successful',
  statusRewarded: 'Rewarded',
  statusExpired: 'Expired',
  statusCancelled: 'Cancelled',
  
  // Dashboard labels
  totalReferrals: 'Total Referrals',
  successfulReferrals: 'Successful Referrals',
  pendingReferrals: 'Pending Referrals',
  totalEarnings: 'Total Earnings',
  referralHistory: 'Referral History',
  viewDetails: 'View Details',
  noReferrals: 'No referrals yet',
  startSharing: 'Start sharing with friends',
};

// Share message templates in Arabic
export const ARABIC_SHARE_MESSAGES: Record<ShareChannel, ShareMessageTemplate> = {
  email: {
    subject: 'ادعوك للانضمام إليّ - احصل على خصم خاص!',
    body: 'مرحباً! أحببت التسوق من هذا المتجر كثيراً وأريد مشاركته معك. استخدم رمز الإحالة الخاص بي واحصل على خصم مميز على طلبك الأول!',
    preview: 'احصل على خصم خاص مع رمز الإحالة',
  },
  whatsapp: {
    subject: '',
    body: 'مرحباً! 👋 وجدت متجراً رائعاً وأريد مشاركته معك. استخدم رمز الإحالة الخاص بي للحصول على خصم على أول طلب لك! 🎁',
    preview: 'تسوق معي واحصل على خصم! 🎁',
  },
  facebook: {
    subject: '',
    body: 'اكتشفت متجراً رائعاً للتسوق! استخدم رمز الإحالة الخاص بي واحصل على خصم مميز. انضم إليّ الآن! 🛍️✨',
    preview: 'تسوق ذكي مع خصم خاص',
  },
  twitter: {
    subject: '',
    body: 'أحب هذا المتجر! 🛍️ استخدم رمز الإحالة الخاص بي للحصول على خصم على طلبك الأول. #تسوق #خصم',
    preview: 'تسوق بذكاء واحصل على خصم',
  },
  copy_link: {
    subject: '',
    body: 'استخدم هذا الرابط للحصول على خصم خاص على طلبك الأول!',
    preview: 'رابط الإحالة الخاص بي',
  },
  sms: {
    subject: '',
    body: 'مرحباً! أرسل لك رمز إحالة خاص من متجر المفضل لدي. استخدمه للحصول على خصم على أول طلب!',
    preview: 'رمز خصم خاص لك!',
  },
};

// Share message templates in Hebrew
export const HEBREW_SHARE_MESSAGES: Record<ShareChannel, ShareMessageTemplate> = {
  email: {
    subject: 'אני מזמין אותך להצטרף אליי - קבל הנחה מיוחדת!',
    body: 'היי! אני אוהב לקנות בחנות הזו ורוצה לשתף אותה איתך. השתמש בקוד ההפניה שלי וקבל הנחה מיוחדת על ההזמנה הראשונה שלך!',
    preview: 'קבל הנחה מיוחדת עם קוד ההפניה',
  },
  whatsapp: {
    subject: '',
    body: 'היי! 👋 מצאתי חנות מדהימה ואני רוצה לשתף אותה איתך. השתמש בקוד ההפניה שלי כדי לקבל הנחה על ההזמנה הראשונה! 🎁',
    preview: 'קנה איתי וקבל הנחה! 🎁',
  },
  facebook: {
    subject: '',
    body: 'גיליתי חנות קניות נהדרת! השתמש בקוד ההפניה שלי וקבל הנחה מיוחדת. הצטרף אליי עכשיו! 🛍️✨',
    preview: 'קניות חכמות עם הנחה מיוחדת',
  },
  twitter: {
    subject: '',
    body: 'אני אוהב את החנות הזו! 🛍️ השתמש בקוד ההפניה שלי לקבלת הנחה על ההזמנה הראשונה. #קניות #הנחה',
    preview: 'קנה בחוכמה וקבל הנחה',
  },
  copy_link: {
    subject: '',
    body: 'השתמש בקישור הזה כדי לקבל הנחה מיוחדת על ההזמנה הראשונה!',
    preview: 'קישור ההפניה שלי',
  },
  sms: {
    subject: '',
    body: 'היי! שולח לך קוד הפניה מיוחד מהחנות האהובה עלי. השתמש בו כדי לקבל הנחה על ההזמנה הראשונה!',
    preview: 'קוד הנחה מיוחד בשבילך!',
  },
};

// Share message templates in English
export const ENGLISH_SHARE_MESSAGES: Record<ShareChannel, ShareMessageTemplate> = {
  email: {
    subject: 'I invite you to join me - Get a special discount!',
    body: 'Hi! I love shopping at this store and want to share it with you. Use my referral code and get a special discount on your first order!',
    preview: 'Get a special discount with referral code',
  },
  whatsapp: {
    subject: '',
    body: 'Hey! 👋 I found an amazing store and want to share it with you. Use my referral code to get a discount on your first order! 🎁',
    preview: 'Shop with me and get a discount! 🎁',
  },
  facebook: {
    subject: '',
    body: 'I discovered a great shopping store! Use my referral code and get a special discount. Join me now! 🛍️✨',
    preview: 'Smart shopping with special discount',
  },
  twitter: {
    subject: '',
    body: 'I love this store! 🛍️ Use my referral code to get a discount on your first order. #shopping #discount',
    preview: 'Shop smart and save',
  },
  copy_link: {
    subject: '',
    body: 'Use this link to get a special discount on your first order!',
    preview: 'My referral link',
  },
  sms: {
    subject: '',
    body: 'Hi! Sending you a special referral code from my favorite store. Use it to get a discount on your first order!',
    preview: 'Special discount code for you!',
  },
};

// Map of locales to their label sets
const LABELS_BY_LOCALE: Record<string, ReferralLabels> = {
  ar: ARABIC_REFERRAL_LABELS,
  he: HEBREW_REFERRAL_LABELS,
  en: ENGLISH_REFERRAL_LABELS,
};

// Map of locales to their share message templates
const MESSAGES_BY_LOCALE: Record<string, Record<ShareChannel, ShareMessageTemplate>> = {
  ar: ARABIC_SHARE_MESSAGES,
  he: HEBREW_SHARE_MESSAGES,
  en: ENGLISH_SHARE_MESSAGES,
};

// Reward type translations
const REWARD_TYPE_LABELS: Record<string, Record<RewardType, string>> = {
  ar: {
    discount: 'خصم',
    credit: 'رصيد',
    cash: 'نقدي',
    points: 'نقاط',
    free_shipping: 'شحن مجاني',
  },
  he: {
    discount: 'הנחה',
    credit: 'זיכוי',
    cash: 'מזומן',
    points: 'נקודות',
    free_shipping: 'משלוח חינם',
  },
  en: {
    discount: 'Discount',
    credit: 'Credit',
    cash: 'Cash',
    points: 'Points',
    free_shipping: 'Free Shipping',
  },
};

/**
 * Get normalized base locale from full locale string
 * e.g., 'ar-SA' -> 'ar', 'he-IL' -> 'he'
 */
function normalizeLocale(locale: string): string {
  return locale.split('-')[0]?.toLowerCase() || 'en';
}

/**
 * Get all referral labels for a locale
 * @param locale - The locale code (e.g., 'ar', 'he', 'en', 'ar-SA')
 * @returns ReferralLabels with translated labels
 */
export function getReferralLabels(locale: string): ReferralLabels {
  const normalizedLocale = normalizeLocale(locale);
  return LABELS_BY_LOCALE[normalizedLocale] || ENGLISH_REFERRAL_LABELS;
}

/**
 * Get a specific share message template for a channel and locale
 * @param channel - The share channel
 * @param locale - The locale code
 * @returns ShareMessageTemplate with translated content
 */
export function getShareMessageTemplate(
  channel: ShareChannel,
  locale: string
): ShareMessageTemplate {
  const normalizedLocale = normalizeLocale(locale);
  const messages = MESSAGES_BY_LOCALE[normalizedLocale] || ENGLISH_SHARE_MESSAGES;
  return messages[channel];
}

/**
 * Format a share message with referral code and reward info
 * @param code - The referral code
 * @param reward - The reward description
 * @param locale - The locale code
 * @param channel - The share channel (optional, defaults to 'copy_link')
 * @returns Formatted share message string
 */
export function formatShareMessage(
  code: string,
  reward: string,
  locale: string,
  channel: ShareChannel = 'copy_link'
): string {
  const normalizedLocale = normalizeLocale(locale);
  const labels = getReferralLabels(normalizedLocale);
  const template = getShareMessageTemplate(channel, normalizedLocale);
  
  // Base message from template
  let message = template.body;
  
  // Add code and reward info based on locale
  switch (normalizedLocale) {
    case 'ar':
      message += `\n\n${labels.yourReferralCode}: ${code}`;
      message += `\n${labels.rewardEarned}: ${reward}`;
      break;
    case 'he':
      message += `\n\n${labels.yourReferralCode}: ${code}`;
      message += `\n${labels.rewardEarned}: ${reward}`;
      break;
    default:
      message += `\n\n${labels.yourReferralCode}: ${code}`;
      message += `\n${labels.rewardEarned}: ${reward}`;
  }
  
  return message;
}

/**
 * Get invite labels for a locale
 * @param locale - The locale code
 * @returns Object with invite-related labels
 */
export function getInviteLabels(locale: string): {
  subject: string;
  message: string;
  personalMessage: string;
  sendInvite: string;
  inviteSubject: string;
} {
  const labels = getReferralLabels(locale);
  return {
    subject: labels.inviteSubject,
    message: labels.inviteMessage,
    personalMessage: labels.personalMessage,
    sendInvite: labels.sendInvite,
    inviteSubject: labels.inviteSubject,
  };
}

/**
 * Format a credit message with amount
 * @param amount - The credit amount
 * @param locale - The locale code
 * @param currency - The currency code (optional, defaults to locale-appropriate)
 * @returns Formatted credit message string
 */
export function formatCreditMessage(
  amount: number,
  locale: string,
  currency?: string
): string {
  const normalizedLocale = normalizeLocale(locale);
  const labels = getReferralLabels(normalizedLocale);
  
  // Determine currency based on locale if not provided
  const effectiveCurrency = currency || getDefaultCurrency(normalizedLocale);
  
  // Format amount with currency
  const formattedAmount = formatCurrency(amount, normalizedLocale, effectiveCurrency);
  
  switch (normalizedLocale) {
    case 'ar':
      return `${labels.creditBalance}: ${formattedAmount}`;
    case 'he':
      return `${labels.creditBalance}: ${formattedAmount}`;
    default:
      return `${labels.creditBalance}: ${formattedAmount}`;
  }
}

/**
 * Get default currency for a locale
 * @param locale - The normalized locale code
 * @returns Currency code
 */
function getDefaultCurrency(locale: string): string {
  switch (locale) {
    case 'ar':
      return 'SAR'; // Saudi Riyal for Arabic
    case 'he':
      return 'ILS'; // Israeli Shekel for Hebrew
    default:
      return 'USD'; // US Dollar for English/default
  }
}

/**
 * Format currency amount with locale
 * @param amount - The amount
 * @param locale - The locale code
 * @param currency - The currency code
 * @returns Formatted currency string
 */
function formatCurrency(amount: number, locale: string, currency: string): string {
  try {
    const localeString = locale === 'ar' ? 'ar-SA' : locale === 'he' ? 'he-IL' : 'en-US';
    return new Intl.NumberFormat(localeString, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    // Fallback if Intl is not available
    return `${amount} ${currency}`;
  }
}

/**
 * Get referral status label
 * @param status - The referral status
 * @param locale - The locale code
 * @returns Translated status label
 */
export function getReferralStatus(status: ReferralStatus, locale: string): string {
  const labels = getReferralLabels(locale);
  
  switch (status) {
    case 'pending':
      return labels.statusPending;
    case 'successful':
      return labels.statusSuccessful;
    case 'rewarded':
      return labels.statusRewarded;
    case 'expired':
      return labels.statusExpired;
    case 'cancelled':
      return labels.statusCancelled;
    default:
      return labels.statusPending;
  }
}

/**
 * Get reward type label
 * @param type - The reward type
 * @param locale - The locale code
 * @returns Translated reward type label
 */
export function getRewardTypeLabel(type: RewardType, locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const labels = REWARD_TYPE_LABELS[normalizedLocale] || REWARD_TYPE_LABELS.en;
  return labels[type];
}

/**
 * Get referrer dashboard labels
 * @param locale - The locale code
 * @returns ReferralDashboard with translated labels
 */
export function getReferrerDashboard(locale: string): ReferralDashboard {
  const labels = getReferralLabels(locale);
  
  return {
    title: labels.programTitle,
    stats: {
      totalLabel: labels.totalReferrals,
      successfulLabel: labels.successfulReferrals,
      pendingLabel: labels.pendingReferrals,
      earningsLabel: labels.totalEarnings,
    },
    actions: {
      shareLabel: labels.shareYourCode,
      viewHistoryLabel: labels.referralHistory,
      withdrawLabel: labels.applyCredit,
    },
  };
}

/**
 * Get credit info labels
 * @param locale - The locale code
 * @returns ReferralCreditInfo with translated labels
 */
export function getCreditInfoLabels(locale: string): ReferralCreditInfo {
  const labels = getReferralLabels(locale);
  
  return {
    balanceLabel: labels.creditBalance,
    earnedLabel: labels.creditEarned,
    usedLabel: labels.creditUsed,
    availableLabel: labels.availableCredit,
    expiresLabel: labels.statusExpired,
  };
}

/**
 * Get all share channels with labels for a locale
 * @param locale - The locale code
 * @returns Array of share channels with translated labels
 */
export function getShareChannels(locale: string): Array<{
  channel: ShareChannel;
  label: string;
  ariaLabel: string;
}> {
  const labels = getReferralLabels(locale);
  const channelLabels: Record<ShareChannel, string> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
    facebook: 'Facebook',
    twitter: 'Twitter',
    copy_link: labels.copyCode,
    sms: 'SMS',
  };
  
  const channels: ShareChannel[] = ['email', 'whatsapp', 'facebook', 'twitter', 'copy_link', 'sms'];
  
  return channels.map((channel) => ({
    channel,
    label: channelLabels[channel],
    ariaLabel: `${labels.shareVia} ${channelLabels[channel]}`,
  }));
}

/**
 * Format a complete referral invite with personalized message
 * @param referrerName - Name of the referrer
 * @param code - Referral code
 * @param reward - Reward description
 * @param locale - The locale code
 * @param personalNote - Optional personal note
 * @returns Complete formatted invite message
 */
export function formatReferralInvite(
  referrerName: string,
  code: string,
  reward: string,
  locale: string,
  personalNote?: string
): string {
  const normalizedLocale = normalizeLocale(locale);
  const template = getShareMessageTemplate('email', normalizedLocale);
  const labels = getReferralLabels(normalizedLocale);
  
  let message = '';
  
  switch (normalizedLocale) {
    case 'ar':
      message = `مرحباً! أنا ${referrerName}. ${template.body}`;
      if (personalNote) {
        message += `\n\nملاحظة شخصية: ${personalNote}`;
      }
      message += `\n\n${labels.yourReferralCode}: ${code}`;
      message += `\nالمكافأة: ${reward}`;
      break;
    case 'he':
      message = `היי! אני ${referrerName}. ${template.body}`;
      if (personalNote) {
        message += `\n\nהערה אישית: ${personalNote}`;
      }
      message += `\n\n${labels.yourReferralCode}: ${code}`;
      message += `\nהתגמול: ${reward}`;
      break;
    default:
      message = `Hi! I'm ${referrerName}. ${template.body}`;
      if (personalNote) {
        message += `\n\nPersonal note: ${personalNote}`;
      }
      message += `\n\n${labels.yourReferralCode}: ${code}`;
      message += `\nReward: ${reward}`;
  }
  
  return message;
}
