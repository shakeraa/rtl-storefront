import { describe, it, expect } from 'vitest';
import {
  getWhiteFridayTemplate, getCountdownLabels, getPromotionalText,
  createWhiteFridayCampaign, getWhiteFridayCountdown, formatCountdown,
  getSaleBadge, isWhiteFridayActive, getDiscountMessage, getBanner,
  getBadge, getEmailTemplate, getAllBadges, getCampaignStatus,
  WHITEFRIDAY_THEME, WHITEFRIDAY_BADGES, WHITEFRIDAY_BANNERS,
  WHITEFRIDAY_EMAILS, COUNTDOWN_LABELS, PROMOTIONAL_TEXT, TEMPLATES,
  type TemplateType, type Locale,
} from '../../app/services/white-friday/index';

describe('White Friday Service', () => {
  describe('getWhiteFridayTemplate', () => {
    it('returns hero template in English', () => {
      const t = getWhiteFridayTemplate('hero', 'en');
      expect(t.title).toBe('White Friday Sale');
      expect(t.content).toBe('Up to 70% off on everything');
    });

    it('returns hero template in Arabic', () => {
      const t = getWhiteFridayTemplate('hero', 'ar');
      expect(t.title).toBe('تنزيلات الجمعة البيضاء');
      expect(t.content).toBe('خصم يصل إلى 70% على كل شيء');
    });

    it('returns hero template in Hebrew', () => {
      const t = getWhiteFridayTemplate('hero', 'he');
      expect(t.title).toBe('מבצע היום הלבן');
      expect(t.content).toBe('עד 70% הנחה על הכל');
    });

    it('returns countdown template in all locales', () => {
      expect(getWhiteFridayTemplate('countdown', 'en').title).toBe('Sale Ends In');
      expect(getWhiteFridayTemplate('countdown', 'ar').title).toBe('التنزيلات تنتهي بعد');
      expect(getWhiteFridayTemplate('countdown', 'he').title).toBe('המבצע מסתיים בעוד');
    });

    it('returns sale-badge template in all locales', () => {
      expect(getWhiteFridayTemplate('sale-badge', 'en').title).toBe('Sale Badge');
      expect(getWhiteFridayTemplate('sale-badge', 'ar').title).toBe('شارة التخفيض');
      expect(getWhiteFridayTemplate('sale-badge', 'he').title).toBe('תג מבצע');
    });

    it('returns product-card template in all locales', () => {
      expect(getWhiteFridayTemplate('product-card', 'en').content).toBe('Special White Friday Price');
      expect(getWhiteFridayTemplate('product-card', 'ar').content).toBe('سعر خاص للجمعة البيضاء');
      expect(getWhiteFridayTemplate('product-card', 'he').content).toBe('מחיר מיוחד ליום הלבן');
    });

    it('defaults to English when locale not found', () => {
      expect(getWhiteFridayTemplate('hero', 'fr' as Locale).title).toBe('White Friday Sale');
    });

    it('throws error for invalid template type', () => {
      expect(() => getWhiteFridayTemplate('invalid' as TemplateType, 'en')).toThrow();
    });

    it('returns email templates in all locales', () => {
      expect(getWhiteFridayTemplate('email-announcement', 'en').title).toBe('Sale Announcement Email');
      expect(getWhiteFridayTemplate('email-announcement', 'ar').title).toBe('بريد إعلان التنزيلات');
      expect(getWhiteFridayTemplate('email-announcement', 'he').title).toBe('מייל הכרזה על מבצע');
    });
  });

  describe('getCountdownLabels', () => {
    it('returns English labels', () => {
      const l = getCountdownLabels('en');
      expect(l.days).toBe('Days');
      expect(l.hours).toBe('Hours');
      expect(l.minutes).toBe('Minutes');
      expect(l.seconds).toBe('Seconds');
    });

    it('returns Arabic labels', () => {
      const l = getCountdownLabels('ar');
      expect(l.days).toBe('يوم');
      expect(l.hours).toBe('ساعة');
      expect(l.minutes).toBe('دقيقة');
      expect(l.seconds).toBe('ثانية');
      expect(l.startsIn).toBe('يبدأ خلال');
      expect(l.endsIn).toBe('ينتهي خلال');
    });

    it('returns Hebrew labels', () => {
      const l = getCountdownLabels('he');
      expect(l.days).toBe('ימים');
      expect(l.hours).toBe('שעות');
      expect(l.minutes).toBe('דקות');
      expect(l.seconds).toBe('שניות');
      expect(l.startsIn).toBe('מתחיל בעוד');
      expect(l.endsIn).toBe('מסתיים בעוד');
    });

    it('defaults to English for unknown locale', () => {
      expect(getCountdownLabels('fr' as Locale).days).toBe('Days');
    });
  });

  describe('getPromotionalText', () => {
    it('returns English promotional text', () => {
      expect(getPromotionalText('limitedTime', 'en')).toBe('Limited Time Offer');
      expect(getPromotionalText('freeShipping', 'en')).toBe('Free Shipping on All Orders');
      expect(getPromotionalText('buyNow', 'en')).toBe('Buy Now');
      expect(getPromotionalText('addToCart', 'en')).toBe('Add to Cart');
    });

    it('returns Arabic promotional text', () => {
      expect(getPromotionalText('limitedTime', 'ar')).toBe('عرض لوقت محدود');
      expect(getPromotionalText('freeShipping', 'ar')).toBe('شحن مجاني على جميع الطلبات');
      expect(getPromotionalText('buyNow', 'ar')).toBe('اشترِ الآن');
      expect(getPromotionalText('addToCart', 'ar')).toBe('أضف إلى السلة');
    });

    it('returns Hebrew promotional text', () => {
      expect(getPromotionalText('limitedTime', 'he')).toBe('הצעה לזמן מוגבל');
      expect(getPromotionalText('freeShipping', 'he')).toBe('משלוח חינם על כל ההזמנות');
      expect(getPromotionalText('buyNow', 'he')).toBe('קנה עכשיו');
      expect(getPromotionalText('addToCart', 'he')).toBe('הוסף לסל');
    });

    it('returns saveUpTo with discount parameter', () => {
      expect(getPromotionalText('saveUpTo', 'en', 50)).toBe('Save up to 50%');
      expect(getPromotionalText('saveUpTo', 'ar', 50)).toBe('وفّر حتى 50%');
      expect(getPromotionalText('saveUpTo', 'he', 50)).toBe('חסוך עד 50%');
    });

    it('returns startingFrom with price parameter', () => {
      expect(getPromotionalText('startingFrom', 'en', 99)).toBe('Starting from $99');
      expect(getPromotionalText('startingFrom', 'ar', 99)).toBe('يبدأ من 99$');
      expect(getPromotionalText('startingFrom', 'he', 99)).toBe('החל מ-$99');
    });

    it('defaults to English for unknown locale', () => {
      expect(getPromotionalText('buyNow', 'fr' as Locale)).toBe('Buy Now');
    });
  });

  describe('createWhiteFridayCampaign', () => {
    it('creates campaign for specified year', () => {
      const c = createWhiteFridayCampaign(2025);
      expect(c.id).toBe('white-friday-2025');
      expect(c.name).toBe('White Friday');
      expect(c.nameAr).toBe('الجمعة البيضاء');
      expect(c.nameHe).toBe('היום הלבן');
    });

    it('calculates last Friday of November correctly', () => {
      const c = createWhiteFridayCampaign(2025);
      expect(c.startDate.getDate()).toBe(28);
      expect(c.startDate.getMonth()).toBe(10);
      expect(c.startDate.getFullYear()).toBe(2025);
    });

    it('sets end date to 4 days after start', () => {
      const c = createWhiteFridayCampaign(2025);
      const expectedEnd = new Date(c.startDate);
      expectedEnd.setDate(expectedEnd.getDate() + 4);
      expect(c.endDate.getTime()).toBe(expectedEnd.getTime());
    });

    it('includes default discount of 50%', () => {
      expect(createWhiteFridayCampaign(2025).discount).toBe(50);
    });

    it('includes theme colors', () => {
      const t = createWhiteFridayCampaign(2025).theme;
      expect(t.primaryColor).toBe('#000000');
      expect(t.secondaryColor).toBe('#FFFFFF');
      expect(t.accentColor).toBe('#FFD700');
    });

    it('includes badges', () => {
      const c = createWhiteFridayCampaign(2025);
      expect(c.badges.length).toBeGreaterThan(0);
      expect(c.badges.some(b => b.id === 'white-friday')).toBe(true);
    });

    it('includes banners', () => {
      const c = createWhiteFridayCampaign(2025);
      expect(c.banners.length).toBeGreaterThan(0);
      expect(c.banners.some(b => b.id === 'hero')).toBe(true);
    });

    it('includes email templates', () => {
      const c = createWhiteFridayCampaign(2025);
      expect(c.emailTemplates.length).toBeGreaterThan(0);
      expect(c.emailTemplates.some(e => e.type === 'announcement')).toBe(true);
    });
  });

  describe('getWhiteFridayCountdown', () => {
    it('returns zero values when sale has started', () => {
      const pastYear = new Date().getFullYear() - 1;
      const cd = getWhiteFridayCountdown(pastYear);
      expect(cd.days).toBe(0);
      expect(cd.hours).toBe(0);
      expect(cd.minutes).toBe(0);
    });
  });

  describe('formatCountdown', () => {
    it('formats countdown in English', () => {
      expect(formatCountdown({ days: 5, hours: 3, minutes: 30 }, 'en')).toBe('5d 3h 30m');
    });

    it('formats countdown in Arabic', () => {
      expect(formatCountdown({ days: 5, hours: 3, minutes: 30 }, 'ar')).toBe('5 يوم 3 ساعة 30 دقيقة');
    });

    it('formats countdown in Hebrew', () => {
      expect(formatCountdown({ days: 5, hours: 3, minutes: 30 }, 'he')).toBe('5 ימים 3 שעות 30 דקות');
    });
  });

  describe('getSaleBadge', () => {
    it('returns English badge format', () => {
      expect(getSaleBadge(50, 'en')).toBe('50% OFF');
      expect(getSaleBadge(70, 'en')).toBe('70% OFF');
    });

    it('returns Arabic badge format', () => {
      expect(getSaleBadge(50, 'ar')).toBe('خصم 50%');
      expect(getSaleBadge(70, 'ar')).toBe('خصم 70%');
    });

    it('returns Hebrew badge format', () => {
      expect(getSaleBadge(50, 'he')).toBe('50% הנחה');
      expect(getSaleBadge(70, 'he')).toBe('70% הנחה');
    });
  });

  describe('getDiscountMessage', () => {
    it('returns English discount message', () => {
      expect(getDiscountMessage(50, 'en')).toBe('Save 50% on everything');
    });

    it('returns Arabic discount message', () => {
      expect(getDiscountMessage(50, 'ar')).toBe('وفّر 50% على كل شيء');
    });

    it('returns Hebrew discount message', () => {
      expect(getDiscountMessage(50, 'he')).toBe('50% הנחה על הכל');
    });
  });

  describe('getBanner', () => {
    it('returns banner in English', () => {
      const b = getBanner('hero', 'en');
      expect(b).not.toBeNull();
      expect(b?.headline).toBe('White Friday Sale');
      expect(b?.ctaText).toBe('Shop Now');
    });

    it('returns banner in Arabic', () => {
      const b = getBanner('hero', 'ar');
      expect(b).not.toBeNull();
      expect(b?.headline).toBe('تنزيلات الجمعة البيضاء');
      expect(b?.ctaText).toBe('تسوق الآن');
    });

    it('returns banner in Hebrew', () => {
      const b = getBanner('hero', 'he');
      expect(b).not.toBeNull();
      expect(b?.headline).toBe('מבצע היום הלבן');
      expect(b?.ctaText).toBe('קנה עכשיו');
    });

    it('returns null for non-existent banner', () => {
      expect(getBanner('non-existent', 'en')).toBeNull();
    });
  });

  describe('getBadge', () => {
    it('returns badge in English', () => {
      const b = getBadge('50-off', 'en');
      expect(b).not.toBeNull();
      expect(b?.text).toBe('50% OFF');
    });

    it('returns badge in Arabic', () => {
      expect(getBadge('50-off', 'ar')?.text).toBe('خصم 50%');
    });

    it('returns badge in Hebrew', () => {
      expect(getBadge('50-off', 'he')?.text).toBe('50% הנחה');
    });

    it('returns null for non-existent badge', () => {
      expect(getBadge('non-existent', 'en')).toBeNull();
    });
  });

  describe('getEmailTemplate', () => {
    it('returns email template in English', () => {
      const t = getEmailTemplate('announcement', 'en');
      expect(t).not.toBeNull();
      expect(t?.subject).toBe('White Friday Sale is Here!');
    });

    it('returns email template in Arabic', () => {
      expect(getEmailTemplate('announcement', 'ar')?.subject).toBe('تنزيلات الجمعة البيضاء بدأت!');
    });

    it('returns email template in Hebrew', () => {
      expect(getEmailTemplate('announcement', 'he')?.subject).toBe('מבצע היום הלבן כאן!');
    });

    it('returns exclusive email template', () => {
      expect(getEmailTemplate('exclusive', 'en')?.subject).toContain('Exclusive');
      expect(getEmailTemplate('exclusive', 'ar')?.subject).toContain('حصري');
    });

    it('returns null for non-existent template type', () => {
      expect(getEmailTemplate('non-existent' as any, 'en')).toBeNull();
    });
  });

  describe('getAllBadges', () => {
    it('returns all badges in English', () => {
      const badges = getAllBadges('en');
      expect(badges.length).toBe(WHITEFRIDAY_BADGES.length);
      expect(badges.some(b => b.text === 'White Friday')).toBe(true);
    });

    it('returns all badges in Arabic', () => {
      const badges = getAllBadges('ar');
      expect(badges.length).toBe(WHITEFRIDAY_BADGES.length);
      expect(badges.some(b => b.text === 'الجمعة البيضاء')).toBe(true);
    });

    it('returns all badges in Hebrew', () => {
      const badges = getAllBadges('he');
      expect(badges.length).toBe(WHITEFRIDAY_BADGES.length);
      expect(badges.some(b => b.text === 'היום הלבן')).toBe(true);
    });
  });

  describe('getCampaignStatus', () => {
    it('returns ended for past year', () => {
      expect(getCampaignStatus(2020)).toBe('ended');
    });
  });

  describe('Constants', () => {
    it('WHITEFRIDAY_THEME has correct colors', () => {
      expect(WHITEFRIDAY_THEME.primaryColor).toBe('#000000');
      expect(WHITEFRIDAY_THEME.secondaryColor).toBe('#FFFFFF');
      expect(WHITEFRIDAY_THEME.backgroundColor).toBe('#F5F5F5');
      expect(WHITEFRIDAY_THEME.accentColor).toBe('#FFD700');
    });

    it('WHITEFRIDAY_BADGES includes required badges', () => {
      const required = ['sale', 'white-friday', 'flash', 'bogo', '50-off', 'new'];
      required.forEach(id => expect(WHITEFRIDAY_BADGES.some(b => b.id === id)).toBe(true));
    });

    it('WHITEFRIDAY_BADGES have Arabic and Hebrew translations', () => {
      WHITEFRIDAY_BADGES.forEach(b => {
        expect(b.textAr).toBeDefined();
        expect(b.textAr.length).toBeGreaterThan(0);
        expect(b.textHe).toBeDefined();
        expect(b.textHe.length).toBeGreaterThan(0);
      });
    });

    it('WHITEFRIDAY_BANNERS have all locale translations', () => {
      WHITEFRIDAY_BANNERS.forEach(b => {
        expect(b.headlineAr).toBeDefined();
        expect(b.headlineHe).toBeDefined();
        expect(b.subheadlineAr).toBeDefined();
        expect(b.subheadlineHe).toBeDefined();
        expect(b.ctaTextAr).toBeDefined();
        expect(b.ctaTextHe).toBeDefined();
      });
    });

    it('WHITEFRIDAY_EMAILS have all locale translations', () => {
      WHITEFRIDAY_EMAILS.forEach(e => {
        expect(e.subjectAr).toBeDefined();
        expect(e.subjectHe).toBeDefined();
        expect(e.previewAr).toBeDefined();
        expect(e.previewHe).toBeDefined();
      });
    });

    it('COUNTDOWN_LABELS has all required keys for all locales', () => {
      const keys = ['days', 'hours', 'minutes', 'seconds', 'startsIn', 'endsIn', 'ended', 'startsSoon'];
      const locales: Locale[] = ['en', 'ar', 'he'];
      locales.forEach(l => keys.forEach(k => expect(COUNTDOWN_LABELS[l][k as keyof typeof COUNTDOWN_LABELS.en]).toBeDefined()));
    });

    it('PROMOTIONAL_TEXT has all offers for all locales', () => {
      const offers = ['saveUpTo', 'startingFrom', 'limitedTime', 'freeShipping', 'buyNow', 'addToCart', 'whileSuppliesLast', 'exclusiveDeal', 'vipEarlyAccess', 'lowestPrice'];
      const locales: Locale[] = ['en', 'ar', 'he'];
      locales.forEach(l => offers.forEach(o => expect(PROMOTIONAL_TEXT[l][o as keyof typeof PROMOTIONAL_TEXT.en]).toBeDefined()));
    });

    it('TEMPLATES includes all required template types', () => {
      const types: TemplateType[] = ['hero', 'countdown', 'sale-badge', 'product-card', 'email-announcement', 'email-reminder', 'email-last-chance'];
      types.forEach(t => expect(TEMPLATES[t]).toBeDefined());
    });
  });
});
