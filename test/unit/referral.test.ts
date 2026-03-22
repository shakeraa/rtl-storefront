import { describe, it, expect } from 'vitest';
import {
  // Label constants
  ARABIC_REFERRAL_LABELS,
  HEBREW_REFERRAL_LABELS,
  ENGLISH_REFERRAL_LABELS,
  ARABIC_SHARE_MESSAGES,
  HEBREW_SHARE_MESSAGES,
  ENGLISH_SHARE_MESSAGES,
  // Functions
  getReferralLabels,
  getShareMessageTemplate,
  formatShareMessage,
  getInviteLabels,
  formatCreditMessage,
  getReferralStatus,
  getRewardTypeLabel,
  getReferrerDashboard,
  getCreditInfoLabels,
  getShareChannels,
  formatReferralInvite,
  // Types
  type ReferralStatus,
  type RewardType,
  type ShareChannel,
} from '../../app/services/integrations/referral';

describe('Referral Apps Integration - T0222', () => {
  describe('getReferralLabels', () => {
    it('should return Arabic labels for ar locale', () => {
      const labels = getReferralLabels('ar');
      expect(labels.programTitle).toBe('برنامج الإحالة');
      expect(labels.inviteFriends).toBe('ادعُ أصدقاءك');
      expect(labels.earnRewards).toBe('اكسب المكافآت');
      expect(labels.yourReferralCode).toBe('رمز الإحالة الخاص بك');
      expect(labels.copyCode).toBe('نسخ الرمز');
    });

    it('should return Hebrew labels for he locale', () => {
      const labels = getReferralLabels('he');
      expect(labels.programTitle).toBe('תוכנית החברים מביאים חברים');
      expect(labels.inviteFriends).toBe('הזמן חברים');
      expect(labels.earnRewards).toBe('קבל תגמולים');
      expect(labels.yourReferralCode).toBe('קוד ההפניה שלך');
      expect(labels.copyCode).toBe('העתק קוד');
    });

    it('should return English labels for en locale', () => {
      const labels = getReferralLabels('en');
      expect(labels.programTitle).toBe('Referral Program');
      expect(labels.inviteFriends).toBe('Invite Friends');
      expect(labels.earnRewards).toBe('Earn Rewards');
      expect(labels.yourReferralCode).toBe('Your Referral Code');
      expect(labels.copyCode).toBe('Copy Code');
    });

    it('should handle locale with region code', () => {
      const labelsAr = getReferralLabels('ar-SA');
      expect(labelsAr.programTitle).toBe('برنامج الإحالة');
      
      const labelsHe = getReferralLabels('he-IL');
      expect(labelsHe.programTitle).toBe('תוכנית החברים מביאים חברים');
      
      const labelsEn = getReferralLabels('en-US');
      expect(labelsEn.programTitle).toBe('Referral Program');
    });

    it('should default to English for unknown locale', () => {
      const labels = getReferralLabels('fr');
      expect(labels.programTitle).toBe('Referral Program');
      expect(labels.shareYourCode).toBe('Share Your Referral Code');
    });

    it('should default to English for empty locale', () => {
      const labels = getReferralLabels('');
      expect(labels.programTitle).toBe('Referral Program');
    });
  });

  describe('getShareMessageTemplate', () => {
    it('should return Arabic email template', () => {
      const template = getShareMessageTemplate('email', 'ar');
      expect(template.subject).toContain('ادعوك');
      expect(template.body).toContain('مرحباً');
      expect(template.preview).toContain('خصم');
    });

    it('should return Hebrew WhatsApp template', () => {
      const template = getShareMessageTemplate('whatsapp', 'he');
      expect(template.body).toContain('היי');
      expect(template.preview).toContain('הנחה');
    });

    it('should return English Facebook template', () => {
      const template = getShareMessageTemplate('facebook', 'en');
      expect(template.body).toContain('discovered');
      expect(template.preview).toContain('Smart shopping');
    });

    it('should return Twitter template for all locales', () => {
      const arTemplate = getShareMessageTemplate('twitter', 'ar');
      const heTemplate = getShareMessageTemplate('twitter', 'he');
      const enTemplate = getShareMessageTemplate('twitter', 'en');
      
      expect(arTemplate.body).toBeDefined();
      expect(heTemplate.body).toBeDefined();
      expect(enTemplate.body).toBeDefined();
    });

    it('should handle copy_link channel', () => {
      const template = getShareMessageTemplate('copy_link', 'en');
      expect(template.body).toContain('link');
      expect(template.preview).toContain('referral');
    });

    it('should handle sms channel', () => {
      const template = getShareMessageTemplate('sms', 'ar');
      expect(template.body).toContain('رمز');
    });
  });

  describe('formatShareMessage', () => {
    it('should format Arabic share message with code and reward', () => {
      const message = formatShareMessage('REF123', 'خصم 20%', 'ar');
      expect(message).toContain('REF123');
      expect(message).toContain('خصم 20%');
      expect(message).toContain('رمز الإحالة الخاص بك');
    });

    it('should format Hebrew share message with code and reward', () => {
      const message = formatShareMessage('REF456', '20% הנחה', 'he');
      expect(message).toContain('REF456');
      expect(message).toContain('20% הנחה');
      expect(message).toContain('קוד ההפניה שלך');
    });

    it('should format English share message with code and reward', () => {
      const message = formatShareMessage('REF789', '$10 Off', 'en');
      expect(message).toContain('REF789');
      expect(message).toContain('$10 Off');
      expect(message).toContain('Your Referral Code');
    });

    it('should format message for different channels', () => {
      const emailMsg = formatShareMessage('CODE1', 'Reward', 'en', 'email');
      const whatsappMsg = formatShareMessage('CODE1', 'Reward', 'en', 'whatsapp');
      
      expect(emailMsg).toContain('CODE1');
      expect(whatsappMsg).toContain('CODE1');
    });

    it('should default to copy_link channel when not specified', () => {
      const message = formatShareMessage('CODE1', 'Reward', 'en');
      expect(message).toContain('CODE1');
    });
  });

  describe('getInviteLabels', () => {
    it('should return Arabic invite labels', () => {
      const labels = getInviteLabels('ar');
      expect(labels.subject).toBe('لديك دعوة خاصة!');
      expect(labels.message).toBe('انضم إليّ واحصل على خصم خاص');
      expect(labels.personalMessage).toBe('رسالة شخصية');
      expect(labels.sendInvite).toBe('إرسال الدعوة');
    });

    it('should return Hebrew invite labels', () => {
      const labels = getInviteLabels('he');
      expect(labels.subject).toBe('יש לך הזמנה מיוחדת!');
      expect(labels.message).toBe('הצטרף אליי וקבל הנחה מיוחדת');
      expect(labels.personalMessage).toBe('הודעה אישית');
      expect(labels.sendInvite).toBe('שלח הזמנה');
    });

    it('should return English invite labels', () => {
      const labels = getInviteLabels('en');
      expect(labels.subject).toBe('You have a special invitation!');
      expect(labels.message).toBe('Join me and get a special discount');
      expect(labels.personalMessage).toBe('Personal Message');
      expect(labels.sendInvite).toBe('Send Invite');
    });
  });

  describe('formatCreditMessage', () => {
    it('should format Arabic credit message with SAR currency', () => {
      const message = formatCreditMessage(150.5, 'ar');
      expect(message).toContain('رصيدك');
      // Arabic locale uses Eastern Arabic numerals (١٥٠٫٥٠)
      expect(message).toContain('ر.س.'); // SAR currency symbol
    });

    it('should format Hebrew credit message with ILS currency', () => {
      const message = formatCreditMessage(200, 'he');
      expect(message).toContain('יתרת הזיכוי שלך');
      expect(message).toContain('200');
    });

    it('should format English credit message with USD currency', () => {
      const message = formatCreditMessage(100, 'en');
      expect(message).toContain('Your Credit Balance');
      expect(message).toContain('100');
    });

    it('should use custom currency when provided', () => {
      const message = formatCreditMessage(50, 'en', 'EUR');
      expect(message).toContain('€'); // Euro symbol
      expect(message).toContain('50');
    });

    it('should handle zero amount', () => {
      const message = formatCreditMessage(0, 'ar');
      expect(message).toContain('رصيدك');
      expect(message).toContain('ر.س.');
      // Arabic locale uses Eastern Arabic numerals (٠٫٠٠ for 0.00)
    });
  });

  describe('getReferralStatus', () => {
    it('should return Arabic status labels', () => {
      expect(getReferralStatus('pending', 'ar')).toBe('معلق');
      expect(getReferralStatus('successful', 'ar')).toBe('ناجح');
      expect(getReferralStatus('rewarded', 'ar')).toBe('تم الصرف');
      expect(getReferralStatus('expired', 'ar')).toBe('منتهي الصلاحية');
      expect(getReferralStatus('cancelled', 'ar')).toBe('ملغى');
    });

    it('should return Hebrew status labels', () => {
      expect(getReferralStatus('pending', 'he')).toBe('ממתין');
      expect(getReferralStatus('successful', 'he')).toBe('הצלחה');
      expect(getReferralStatus('rewarded', 'he')).toBe('שולם');
      expect(getReferralStatus('expired', 'he')).toBe('פג תוקף');
      expect(getReferralStatus('cancelled', 'he')).toBe('בוטל');
    });

    it('should return English status labels', () => {
      expect(getReferralStatus('pending', 'en')).toBe('Pending');
      expect(getReferralStatus('successful', 'en')).toBe('Successful');
      expect(getReferralStatus('rewarded', 'en')).toBe('Rewarded');
      expect(getReferralStatus('expired', 'en')).toBe('Expired');
      expect(getReferralStatus('cancelled', 'en')).toBe('Cancelled');
    });
  });

  describe('getRewardTypeLabel', () => {
    it('should return Arabic reward type labels', () => {
      expect(getRewardTypeLabel('discount', 'ar')).toBe('خصم');
      expect(getRewardTypeLabel('credit', 'ar')).toBe('رصيد');
      expect(getRewardTypeLabel('cash', 'ar')).toBe('نقدي');
      expect(getRewardTypeLabel('points', 'ar')).toBe('نقاط');
      expect(getRewardTypeLabel('free_shipping', 'ar')).toBe('شحن مجاني');
    });

    it('should return Hebrew reward type labels', () => {
      expect(getRewardTypeLabel('discount', 'he')).toBe('הנחה');
      expect(getRewardTypeLabel('credit', 'he')).toBe('זיכוי');
      expect(getRewardTypeLabel('cash', 'he')).toBe('מזומן');
      expect(getRewardTypeLabel('points', 'he')).toBe('נקודות');
      expect(getRewardTypeLabel('free_shipping', 'he')).toBe('משלוח חינם');
    });

    it('should return English reward type labels', () => {
      expect(getRewardTypeLabel('discount', 'en')).toBe('Discount');
      expect(getRewardTypeLabel('credit', 'en')).toBe('Credit');
      expect(getRewardTypeLabel('cash', 'en')).toBe('Cash');
      expect(getRewardTypeLabel('points', 'en')).toBe('Points');
      expect(getRewardTypeLabel('free_shipping', 'en')).toBe('Free Shipping');
    });
  });

  describe('getReferrerDashboard', () => {
    it('should return Arabic dashboard structure', () => {
      const dashboard = getReferrerDashboard('ar');
      expect(dashboard.title).toBe('برنامج الإحالة');
      expect(dashboard.stats.totalLabel).toBe('إجمالي الإحالات');
      expect(dashboard.stats.successfulLabel).toBe('الإحالات الناجحة');
      expect(dashboard.stats.pendingLabel).toBe('الإحالات المعلقة');
      expect(dashboard.stats.earningsLabel).toBe('إجمالي الأرباح');
      expect(dashboard.actions.shareLabel).toBe('شارك رمز الإحالة الخاص بك');
      expect(dashboard.actions.viewHistoryLabel).toBe('سجل الإحالات');
      expect(dashboard.actions.withdrawLabel).toBe('استخدام الرصيد');
    });

    it('should return Hebrew dashboard structure', () => {
      const dashboard = getReferrerDashboard('he');
      expect(dashboard.title).toBe('תוכנית החברים מביאים חברים');
      expect(dashboard.stats.totalLabel).toBe('סה"כ הפניות');
      expect(dashboard.actions.shareLabel).toBe('שתף את קוד ההפניה שלך');
    });

    it('should return English dashboard structure', () => {
      const dashboard = getReferrerDashboard('en');
      expect(dashboard.title).toBe('Referral Program');
      expect(dashboard.stats.totalLabel).toBe('Total Referrals');
      expect(dashboard.actions.shareLabel).toBe('Share Your Referral Code');
    });
  });

  describe('getCreditInfoLabels', () => {
    it('should return Arabic credit info labels', () => {
      const info = getCreditInfoLabels('ar');
      expect(info.balanceLabel).toBe('رصيدك');
      expect(info.earnedLabel).toBe('الرصيد المكتسب');
      expect(info.usedLabel).toBe('الرصيد المستخدم');
      expect(info.availableLabel).toBe('الرصيد المتاح');
    });

    it('should return Hebrew credit info labels', () => {
      const info = getCreditInfoLabels('he');
      expect(info.balanceLabel).toBe('יתרת הזיכוי שלך');
      expect(info.earnedLabel).toBe('זיכוי שהושג');
      expect(info.usedLabel).toBe('זיכוי שנוצל');
    });

    it('should return English credit info labels', () => {
      const info = getCreditInfoLabels('en');
      expect(info.balanceLabel).toBe('Your Credit Balance');
      expect(info.earnedLabel).toBe('Credit Earned');
      expect(info.usedLabel).toBe('Credit Used');
    });
  });

  describe('getShareChannels', () => {
    it('should return all 6 share channels for Arabic', () => {
      const channels = getShareChannels('ar');
      expect(channels).toHaveLength(6);
      expect(channels.map(c => c.channel)).toContain('email');
      expect(channels.map(c => c.channel)).toContain('whatsapp');
      expect(channels.map(c => c.channel)).toContain('facebook');
      expect(channels.map(c => c.channel)).toContain('twitter');
      expect(channels.map(c => c.channel)).toContain('copy_link');
      expect(channels.map(c => c.channel)).toContain('sms');
    });

    it('should include proper Arabic aria labels', () => {
      const channels = getShareChannels('ar');
      const whatsapp = channels.find(c => c.channel === 'whatsapp');
      expect(whatsapp?.ariaLabel).toContain('شارك');
    });

    it('should include proper Hebrew aria labels', () => {
      const channels = getShareChannels('he');
      const email = channels.find(c => c.channel === 'email');
      expect(email?.ariaLabel).toContain('שתף');
    });
  });

  describe('formatReferralInvite', () => {
    it('should format Arabic referral invite with personal note', () => {
      const message = formatReferralInvite('أحمد', 'REF123', 'خصم 20%', 'ar', 'جرب هذا المتجر الرائع!');
      expect(message).toContain('أحمد');
      expect(message).toContain('REF123');
      expect(message).toContain('خصم 20%');
      expect(message).toContain('جرب هذا المتجر الرائع!');
      expect(message).toContain('ملاحظة شخصية');
    });

    it('should format Hebrew referral invite with personal note', () => {
      const message = formatReferralInvite('דוד', 'REF456', '20% הנחה', 'he', 'חנות מדהימה!');
      expect(message).toContain('דוד');
      expect(message).toContain('REF456');
      expect(message).toContain('20% הנחה');
      expect(message).toContain('חנות מדהימה!');
      expect(message).toContain('הערה אישית');
    });

    it('should format English referral invite with personal note', () => {
      const message = formatReferralInvite('John', 'REF789', '$10 Off', 'en', 'Great store!');
      expect(message).toContain('John');
      expect(message).toContain('REF789');
      expect(message).toContain('$10 Off');
      expect(message).toContain('Great store!');
      expect(message).toContain('Personal note');
    });

    it('should format referral invite without personal note', () => {
      const message = formatReferralInvite('User', 'CODE1', 'Reward', 'en');
      expect(message).toContain('User');
      expect(message).toContain('CODE1');
      expect(message).not.toContain('Personal note');
    });
  });

  describe('Exported Label Constants', () => {
    it('should have all required keys in Arabic labels', () => {
      expect(ARABIC_REFERRAL_LABELS.programTitle).toBeDefined();
      expect(ARABIC_REFERRAL_LABELS.inviteFriends).toBeDefined();
      expect(ARABIC_REFERRAL_LABELS.yourRewards).toBeDefined();
      expect(ARABIC_REFERRAL_LABELS.creditBalance).toBeDefined();
      expect(ARABIC_REFERRAL_LABELS.statusPending).toBeDefined();
    });

    it('should have all required keys in Hebrew labels', () => {
      expect(HEBREW_REFERRAL_LABELS.programTitle).toBeDefined();
      expect(HEBREW_REFERRAL_LABELS.inviteFriends).toBeDefined();
      expect(HEBREW_REFERRAL_LABELS.yourRewards).toBeDefined();
      expect(HEBREW_REFERRAL_LABELS.creditBalance).toBeDefined();
    });

    it('should have all required keys in English labels', () => {
      expect(ENGLISH_REFERRAL_LABELS.programTitle).toBeDefined();
      expect(ENGLISH_REFERRAL_LABELS.inviteFriends).toBeDefined();
      expect(ENGLISH_REFERRAL_LABELS.yourRewards).toBeDefined();
      expect(ENGLISH_REFERRAL_LABELS.creditBalance).toBeDefined();
    });

    it('should have Arabic text (not English) in Arabic labels', () => {
      expect(ARABIC_REFERRAL_LABELS.programTitle).not.toBe('Referral Program');
      expect(ARABIC_REFERRAL_LABELS.inviteFriends).not.toBe('Invite Friends');
    });

    it('should have Hebrew text (not English) in Hebrew labels', () => {
      expect(HEBREW_REFERRAL_LABELS.programTitle).not.toBe('Referral Program');
      expect(HEBREW_REFERRAL_LABELS.inviteFriends).not.toBe('Invite Friends');
    });
  });

  describe('Exported Message Constants', () => {
    it('should have all share channels defined in Arabic', () => {
      expect(ARABIC_SHARE_MESSAGES.email).toBeDefined();
      expect(ARABIC_SHARE_MESSAGES.whatsapp).toBeDefined();
      expect(ARABIC_SHARE_MESSAGES.facebook).toBeDefined();
      expect(ARABIC_SHARE_MESSAGES.twitter).toBeDefined();
      expect(ARABIC_SHARE_MESSAGES.copy_link).toBeDefined();
      expect(ARABIC_SHARE_MESSAGES.sms).toBeDefined();
    });

    it('should have all share channels defined in Hebrew', () => {
      expect(HEBREW_SHARE_MESSAGES.email).toBeDefined();
      expect(HEBREW_SHARE_MESSAGES.whatsapp).toBeDefined();
      expect(HEBREW_SHARE_MESSAGES.facebook).toBeDefined();
      expect(HEBREW_SHARE_MESSAGES.twitter).toBeDefined();
      expect(HEBREW_SHARE_MESSAGES.copy_link).toBeDefined();
      expect(HEBREW_SHARE_MESSAGES.sms).toBeDefined();
    });

    it('should have all share channels defined in English', () => {
      expect(ENGLISH_SHARE_MESSAGES.email).toBeDefined();
      expect(ENGLISH_SHARE_MESSAGES.whatsapp).toBeDefined();
      expect(ENGLISH_SHARE_MESSAGES.facebook).toBeDefined();
      expect(ENGLISH_SHARE_MESSAGES.twitter).toBeDefined();
      expect(ENGLISH_SHARE_MESSAGES.copy_link).toBeDefined();
      expect(ENGLISH_SHARE_MESSAGES.sms).toBeDefined();
    });
  });

  describe('Locale normalization edge cases', () => {
    it('should handle uppercase locale codes', () => {
      const labels = getReferralLabels('AR');
      expect(labels.programTitle).toBe('برنامج الإحالة');
    });

    it('should handle mixed case locale codes', () => {
      const labels = getReferralLabels('Ar-Sa');
      expect(labels.programTitle).toBe('برنامج الإحالة');
    });

    it('should handle locale with multiple dashes', () => {
      const labels = getReferralLabels('en-US-x-posix');
      expect(labels.programTitle).toBe('Referral Program');
    });
  });
});
