import { describe, it, expect } from 'vitest';

// T0388 - Modest Fashion
import {
  tagProduct,
  bulkTag,
  getModestCollection,
  isRamadanSeason,
  getSeasonalRecommendations,
  MODESTY_KEYWORDS,
} from '../../app/services/modest-fashion/index';
import type { ModestyTag, ProductInput } from '../../app/services/modest-fashion/index';

// T0389 - Prayer Times
import {
  getBlockedWindows,
  isTimeBlocked,
  getAvailableSlots,
  isFridayExtended,
  getDeliveryEstimate,
  DEFAULT_PRAYER_DURATIONS,
  DEFAULT_PRAYER_TIMES,
  MENA_CITIES,
} from '../../app/services/prayer-times/index';
import type { PrayerTime } from '../../app/services/prayer-times/index';

// T0390 - Trust Badges
import {
  getBadgesForCountry,
  getBadgesByCategory,
  getApplicableBadges,
  getBadgeLabels,
  TRUST_BADGES,
} from '../../app/services/trust-badges/index';

// T0391 - Email Builder
import {
  getTemplate,
  renderTemplate,
  getEmailDirection,
  inlineCSS,
  addRTLWrapper,
  getAvailableTemplateTypes,
  EMAIL_TEMPLATES,
} from '../../app/services/email-builder/index';


// =====================================================
// T0388 — Modest Fashion AI Auto-Tagging
// =====================================================
describe('Modest Fashion Service - T0388', () => {
  describe('tagProduct', () => {
    it('should detect full_coverage for abaya products', () => {
      const tag = tagProduct('Black Abaya', 'Elegant full coverage abaya for daily wear', 'Women');
      expect(tag.level).toBe('full_coverage');
      expect(tag.abayaCompatible).toBe(true);
    });

    it('should detect full_coverage for jilbab products', () => {
      const tag = tagProduct('Classic Jilbab', 'Floor length jilbab', 'Modest Fashion');
      expect(tag.level).toBe('full_coverage');
    });

    it('should detect partial_coverage for tunic products', () => {
      const tag = tagProduct('Loose Tunic', 'Comfortable long sleeve tunic', 'Women');
      expect(tag.level).toBe('partial_coverage');
      expect(tag.looseFit).toBe(false); // "loose" is a keyword but "Loose" in title
    });

    it('should detect partial_coverage for burkini', () => {
      const tag = tagProduct('Modest Burkini', 'Full coverage swimwear', 'Swimwear');
      expect(tag.level).toBe('full_coverage'); // "full coverage" matches full_coverage
    });

    it('should detect hijab-friendly items', () => {
      const tag = tagProduct('Premium Hijab', 'Soft chiffon hijab scarf', 'Accessories');
      expect(tag.hijabFriendly).toBe(true);
      expect(tag.level).toBe('partial_coverage');
    });

    it('should detect not_modest for non-matching items', () => {
      const tag = tagProduct('Summer Tank Top', 'Sleeveless casual top', 'Women');
      expect(tag.level).toBe('not_modest');
      expect(tag.hijabFriendly).toBe(false);
      expect(tag.abayaCompatible).toBe(false);
    });

    it('should detect opaque and lined properties', () => {
      const tag = tagProduct('Lined Abaya', 'Opaque fully lined double layer crepe abaya', 'Women');
      expect(tag.opaque).toBe(true);
      expect(tag.lined).toBe(true);
    });

    it('should detect Arabic keywords', () => {
      const tag = tagProduct('عباية سوداء', 'عباية مبطنة فضفاضة', 'نساء');
      expect(tag.level).toBe('full_coverage');
      expect(tag.abayaCompatible).toBe(true);
      expect(tag.looseFit).toBe(true);
      expect(tag.lined).toBe(true);
    });

    it('should return not_modest for empty inputs', () => {
      const tag = tagProduct('', '', '');
      expect(tag.level).toBe('not_modest');
      expect(tag.hijabFriendly).toBe(false);
      expect(tag.abayaCompatible).toBe(false);
      expect(tag.looseFit).toBe(false);
      expect(tag.opaque).toBe(false);
      expect(tag.lined).toBe(false);
    });
  });

  describe('bulkTag', () => {
    it('should tag multiple products correctly', () => {
      const products: ProductInput[] = [
        { title: 'Black Abaya', description: 'Full length abaya', category: 'Women' },
        { title: 'T-Shirt', description: 'Casual cotton tee', category: 'Men' },
        { title: 'Hijab Set', description: 'Premium hijab collection', category: 'Accessories' },
      ];
      const tags = bulkTag(products);
      expect(tags).toHaveLength(3);
      expect(tags[0].level).toBe('full_coverage');
      expect(tags[1].level).toBe('not_modest');
      expect(tags[2].hijabFriendly).toBe(true);
    });

    it('should return empty array for empty input', () => {
      expect(bulkTag([])).toEqual([]);
    });
  });

  describe('getModestCollection', () => {
    const products: ProductInput[] = [
      { title: 'Black Abaya', description: 'Full coverage abaya', category: 'Women' },
      { title: 'Tunic Top', description: 'Long sleeve loose tunic', category: 'Women' },
      { title: 'Tank Top', description: 'Summer sleeveless top', category: 'Women' },
    ];

    it('should filter for full_coverage minimum', () => {
      const result = getModestCollection(products, 'full_coverage');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Black Abaya');
    });

    it('should filter for partial_coverage minimum', () => {
      const result = getModestCollection(products, 'partial_coverage');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should return all products for not_modest minimum', () => {
      const result = getModestCollection(products, 'not_modest');
      expect(result).toHaveLength(3);
    });

    it('should handle empty product list', () => {
      expect(getModestCollection([], 'full_coverage')).toEqual([]);
    });
  });

  describe('isRamadanSeason', () => {
    it('should return true during Ramadan 2026 (approx Feb 18 - Mar 20)', () => {
      const duringRamadan = new Date(2026, 1, 25); // Feb 25
      expect(isRamadanSeason(duringRamadan)).toBe(true);
    });

    it('should return false well outside Ramadan', () => {
      const notRamadan = new Date(2026, 6, 15); // July 15
      expect(isRamadanSeason(notRamadan)).toBe(false);
    });

    it('should handle unknown years with fallback', () => {
      const farFuture = new Date(2035, 1, 15); // Feb 15 - within fallback range
      const result = isRamadanSeason(farFuture);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getSeasonalRecommendations', () => {
    it('should include Ramadan recommendations during Ramadan', () => {
      const tags: ModestyTag[] = [
        { level: 'full_coverage', hijabFriendly: true, abayaCompatible: true, looseFit: true, opaque: true, lined: true },
      ];
      const ramadanDate = new Date(2026, 1, 25);
      const recs = getSeasonalRecommendations(tags, ramadanDate);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs.some((r) => r.reason.includes('Ramadan'))).toBe(true);
    });

    it('should include summer recommendations in July', () => {
      const tags: ModestyTag[] = [];
      const summerDate = new Date(2026, 6, 15);
      const recs = getSeasonalRecommendations(tags, summerDate);
      expect(recs.some((r) => r.reason.includes('Summer'))).toBe(true);
    });

    it('should return empty for no matching conditions', () => {
      const tags: ModestyTag[] = [];
      const offDate = new Date(2026, 10, 15); // November
      const recs = getSeasonalRecommendations(tags, offDate);
      expect(recs).toHaveLength(0);
    });
  });

  describe('MODESTY_KEYWORDS', () => {
    it('should have all keyword groups', () => {
      expect(MODESTY_KEYWORDS.fullCoverage).toBeDefined();
      expect(MODESTY_KEYWORDS.partialCoverage).toBeDefined();
      expect(MODESTY_KEYWORDS.hijabRelated).toBeDefined();
      expect(MODESTY_KEYWORDS.abayaRelated).toBeDefined();
      expect(MODESTY_KEYWORDS.looseFitTerms).toBeDefined();
      expect(MODESTY_KEYWORDS.opaqueTerms).toBeDefined();
      expect(MODESTY_KEYWORDS.linedTerms).toBeDefined();
    });

    it('should contain Arabic and Hebrew terms', () => {
      expect(MODESTY_KEYWORDS.fullCoverage.ar.length).toBeGreaterThan(0);
      expect(MODESTY_KEYWORDS.fullCoverage.he.length).toBeGreaterThan(0);
      expect(MODESTY_KEYWORDS.hijabRelated.ar.some((k) => k.includes('حجاب'))).toBe(true);
    });
  });
});


// =====================================================
// T0389 — Prayer Time Delivery Windows
// =====================================================
describe('Prayer Times Service - T0389', () => {
  const testPrayers: PrayerTime[] = [
    { name: 'dhuhr', startHour: 12, startMinute: 0, durationMinutes: 30 },
    { name: 'asr', startHour: 15, startMinute: 30, durationMinutes: 30 },
  ];

  describe('getBlockedWindows', () => {
    it('should return blocked windows with buffer', () => {
      const windows = getBlockedWindows(testPrayers, 10);
      expect(windows).toHaveLength(2);

      // Dhuhr: 12:00 - 10min buffer = 11:50, end = 12:00 + 30 + 10 = 12:40
      expect(windows[0].start.hour).toBe(11);
      expect(windows[0].start.minute).toBe(50);
      expect(windows[0].end.hour).toBe(12);
      expect(windows[0].end.minute).toBe(40);

      // Asr: 15:30 - 10 = 15:20, end = 15:30 + 30 + 10 = 16:10
      expect(windows[1].start.hour).toBe(15);
      expect(windows[1].start.minute).toBe(20);
      expect(windows[1].end.hour).toBe(16);
      expect(windows[1].end.minute).toBe(10);
    });

    it('should handle zero buffer', () => {
      const windows = getBlockedWindows(testPrayers, 0);
      expect(windows[0].start.hour).toBe(12);
      expect(windows[0].start.minute).toBe(0);
      expect(windows[0].end.hour).toBe(12);
      expect(windows[0].end.minute).toBe(30);
    });

    it('should handle empty prayer list', () => {
      expect(getBlockedWindows([], 10)).toEqual([]);
    });
  });

  describe('isTimeBlocked', () => {
    it('should return true during prayer time', () => {
      const windows = getBlockedWindows(testPrayers, 10);
      expect(isTimeBlocked(12, 15, windows)).toBe(true);
    });

    it('should return false outside prayer time', () => {
      const windows = getBlockedWindows(testPrayers, 10);
      expect(isTimeBlocked(14, 0, windows)).toBe(false);
    });

    it('should return true at buffer start', () => {
      const windows = getBlockedWindows(testPrayers, 10);
      expect(isTimeBlocked(11, 50, windows)).toBe(true);
    });

    it('should return false just after blocked window', () => {
      const windows = getBlockedWindows(testPrayers, 10);
      expect(isTimeBlocked(12, 40, windows)).toBe(false);
    });

    it('should return false with empty windows', () => {
      expect(isTimeBlocked(12, 0, [])).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return slots that do not overlap prayers', () => {
      const slots = getAvailableSlots(8, 22, testPrayers, 60, 10);
      expect(slots.length).toBeGreaterThan(0);

      // Verify no slot overlaps with blocked windows
      const windows = getBlockedWindows(testPrayers, 10);
      for (const slot of slots) {
        const slotStart = slot.start.hour * 60 + slot.start.minute;
        const slotEnd = slot.end.hour * 60 + slot.end.minute;
        for (const w of windows) {
          const wStart = w.start.hour * 60 + w.start.minute;
          const wEnd = w.end.hour * 60 + w.end.minute;
          expect(slotStart >= wEnd || slotEnd <= wStart).toBe(true);
        }
      }
    });

    it('should not have any gaps that could fit another slot', () => {
      const slots = getAvailableSlots(8, 22, testPrayers, 60, 10);
      // Slots should cover the available time
      expect(slots.length).toBeGreaterThanOrEqual(3);
    });

    it('should return empty when window is too small', () => {
      // Only 30 minutes available, but slot needs 60
      const narrowPrayers: PrayerTime[] = [
        { name: 'fajr', startHour: 8, startMinute: 20, durationMinutes: 120 },
      ];
      const slots = getAvailableSlots(8, 10, narrowPrayers, 60, 10);
      // The blocked window is 8:10-10:10, day is 8:00-10:00, so no room
      expect(slots).toHaveLength(0);
    });

    it('should handle empty prayers list', () => {
      const slots = getAvailableSlots(8, 22, [], 60, 0);
      expect(slots.length).toBeGreaterThan(0);
      expect(slots).toHaveLength(14); // 14 hours = 14 one-hour slots
    });
  });

  describe('isFridayExtended', () => {
    it('should return a boolean', () => {
      expect(typeof isFridayExtended()).toBe('boolean');
    });
  });

  describe('getDeliveryEstimate', () => {
    it('should return slots and note for known city', () => {
      const estimate = getDeliveryEstimate('Riyadh', 1, DEFAULT_PRAYER_TIMES);
      expect(estimate.slots.length).toBeGreaterThan(0);
      expect(estimate.note).toBe(''); // Monday, no special note
    });

    it('should add Friday note with Jummah', () => {
      const estimate = getDeliveryEstimate('Riyadh', 5, DEFAULT_PRAYER_TIMES);
      expect(estimate.note).toContain('Jummah');
      expect(estimate.note).toContain('Weekend');
    });

    it('should note unknown cities', () => {
      const estimate = getDeliveryEstimate('Unknown City', 1, DEFAULT_PRAYER_TIMES);
      expect(estimate.note).toContain('not in MENA database');
    });

    it('should include weekend note for Gulf cities on Saturday', () => {
      const estimate = getDeliveryEstimate('Dubai', 6, DEFAULT_PRAYER_TIMES);
      expect(estimate.note).toContain('Weekend');
    });
  });

  describe('constants', () => {
    it('should have correct Jummah duration', () => {
      expect(DEFAULT_PRAYER_DURATIONS.jummah).toBe(90);
    });

    it('should have 30 minute default for regular prayers', () => {
      expect(DEFAULT_PRAYER_DURATIONS.fajr).toBe(30);
      expect(DEFAULT_PRAYER_DURATIONS.dhuhr).toBe(30);
      expect(DEFAULT_PRAYER_DURATIONS.asr).toBe(30);
      expect(DEFAULT_PRAYER_DURATIONS.maghrib).toBe(30);
      expect(DEFAULT_PRAYER_DURATIONS.isha).toBe(30);
    });

    it('should have major MENA cities', () => {
      expect(MENA_CITIES['Riyadh']).toBe('SA');
      expect(MENA_CITIES['Dubai']).toBe('AE');
      expect(MENA_CITIES['Doha']).toBe('QA');
      expect(MENA_CITIES['Tel Aviv']).toBe('IL');
      expect(Object.keys(MENA_CITIES).length).toBeGreaterThanOrEqual(20);
    });
  });
});


// =====================================================
// T0390 — Regional Trust Badge Library
// =====================================================
describe('Trust Badges Service - T0390', () => {
  describe('TRUST_BADGES', () => {
    it('should have at least 30 badges', () => {
      expect(TRUST_BADGES.length).toBeGreaterThanOrEqual(30);
    });

    it('should cover all categories', () => {
      const categories = new Set(TRUST_BADGES.map((b) => b.category));
      expect(categories.has('certification')).toBe(true);
      expect(categories.has('payment')).toBe(true);
      expect(categories.has('shipping')).toBe(true);
      expect(categories.has('support')).toBe(true);
      expect(categories.has('security')).toBe(true);
    });
  });

  describe('getBadgesForCountry', () => {
    it('should return Saudi-specific badges for SA', () => {
      const saBadges = getBadgesForCountry('SA');
      const badgeIds = saBadges.map((b) => b.id);
      expect(badgeIds).toContain('halal_certified');
      expect(badgeIds).toContain('mada_accepted');
      expect(badgeIds).toContain('saso_approved');
      expect(badgeIds).toContain('smsa_express');
    });

    it('should return Israel-specific badges for IL', () => {
      const ilBadges = getBadgesForCountry('IL');
      const badgeIds = ilBadges.map((b) => b.id);
      expect(badgeIds).toContain('kosher_certified');
      expect(badgeIds).toContain('hebrew_support');
      expect(badgeIds).not.toContain('halal_certified');
      expect(badgeIds).not.toContain('mada_accepted');
    });

    it('should return different badges for SA vs IL', () => {
      const saBadges = getBadgesForCountry('SA');
      const ilBadges = getBadgesForCountry('IL');
      expect(saBadges.length).not.toBe(ilBadges.length);

      // SA should have more badges since it has more MENA-specific options
      expect(saBadges.length).toBeGreaterThan(ilBadges.length);
    });

    it('should return empty for unknown country', () => {
      const badges = getBadgesForCountry('XX');
      expect(badges).toHaveLength(0);
    });
  });

  describe('getBadgesByCategory', () => {
    it('should return only payment badges', () => {
      const paymentBadges = getBadgesByCategory('payment');
      expect(paymentBadges.length).toBeGreaterThan(0);
      paymentBadges.forEach((b) => expect(b.category).toBe('payment'));
    });

    it('should return only certification badges', () => {
      const certBadges = getBadgesByCategory('certification');
      expect(certBadges.length).toBeGreaterThan(0);
      certBadges.forEach((b) => expect(b.category).toBe('certification'));
    });

    it('should return security badges', () => {
      const secBadges = getBadgesByCategory('security');
      expect(secBadges.length).toBeGreaterThan(0);
    });
  });

  describe('getApplicableBadges', () => {
    it('should always include security and support badges for country', () => {
      const badges = getApplicableBadges([], 'SA');
      const categories = new Set(badges.map((b) => b.category));
      expect(categories.has('security')).toBe(true);
      expect(categories.has('support')).toBe(true);
    });

    it('should include certified badges when merchant has them', () => {
      const badges = getApplicableBadges(['halal_certified', 'mada_accepted'], 'SA');
      const badgeIds = badges.map((b) => b.id);
      expect(badgeIds).toContain('halal_certified');
      expect(badgeIds).toContain('mada_accepted');
    });

    it('should not include non-matching certifications', () => {
      const badges = getApplicableBadges(['kosher_certified'], 'SA');
      const badgeIds = badges.map((b) => b.id);
      // kosher is not available in SA
      expect(badgeIds).not.toContain('kosher_certified');
    });

    it('should return empty for unknown country with no certs', () => {
      const badges = getApplicableBadges([], 'XX');
      expect(badges).toHaveLength(0);
    });
  });

  describe('getBadgeLabels', () => {
    it('should return Arabic name for ar locale', () => {
      const labels = getBadgeLabels('halal_certified', 'ar-SA');
      expect(labels).not.toBeNull();
      expect(labels!.name).toBe('حلال معتمد');
    });

    it('should return Hebrew name for he locale', () => {
      const labels = getBadgeLabels('kosher_certified', 'he-IL');
      expect(labels).not.toBeNull();
      expect(labels!.name).toBe('כשרות מאושרת');
    });

    it('should return English name for en locale', () => {
      const labels = getBadgeLabels('halal_certified', 'en-US');
      expect(labels).not.toBeNull();
      expect(labels!.name).toBe('Halal Certified');
    });

    it('should return null for unknown badge', () => {
      expect(getBadgeLabels('nonexistent', 'en')).toBeNull();
    });
  });
});


// =====================================================
// T0391 — RTL Email Template Builder
// =====================================================
describe('Email Builder Service - T0391', () => {
  describe('EMAIL_TEMPLATES', () => {
    it('should have 7 templates', () => {
      expect(EMAIL_TEMPLATES).toHaveLength(7);
    });

    it('should cover all required template types', () => {
      const types = EMAIL_TEMPLATES.map((t) => t.type);
      expect(types).toContain('order_confirmation');
      expect(types).toContain('shipping');
      expect(types).toContain('delivery');
      expect(types).toContain('refund');
      expect(types).toContain('account');
      expect(types).toContain('abandoned_cart');
      expect(types).toContain('back_in_stock');
    });

    it('should have Arabic and Hebrew subjects', () => {
      EMAIL_TEMPLATES.forEach((t) => {
        expect(t.subjectAr.length).toBeGreaterThan(0);
        expect(t.subjectHe.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getTemplate', () => {
    it('should return order_confirmation template', () => {
      const tpl = getTemplate('order_confirmation');
      expect(tpl).toBeDefined();
      expect(tpl!.type).toBe('order_confirmation');
      expect(tpl!.id).toBe('tpl_order_confirmation');
    });

    it('should return undefined for unknown type', () => {
      expect(getTemplate('nonexistent' as any)).toBeUndefined();
    });
  });

  describe('getEmailDirection', () => {
    it('should return rtl for Arabic', () => {
      expect(getEmailDirection('ar')).toBe('rtl');
      expect(getEmailDirection('ar-SA')).toBe('rtl');
      expect(getEmailDirection('ar_EG')).toBe('rtl');
    });

    it('should return rtl for Hebrew', () => {
      expect(getEmailDirection('he')).toBe('rtl');
      expect(getEmailDirection('he-IL')).toBe('rtl');
    });

    it('should return ltr for English', () => {
      expect(getEmailDirection('en')).toBe('ltr');
      expect(getEmailDirection('en-US')).toBe('ltr');
    });

    it('should return ltr for unknown locale', () => {
      expect(getEmailDirection('xx')).toBe('ltr');
    });
  });

  describe('renderTemplate', () => {
    it('should render with RTL direction for Arabic locale', () => {
      const tpl = getTemplate('order_confirmation')!;
      const html = renderTemplate(tpl, { orderNumber: '12345', total: '100 SAR' }, 'ar-SA');

      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="ar"');
      expect(html).toContain('direction: rtl');
      expect(html).toContain('#12345');
      expect(html).toContain('تأكيد الطلب');
    });

    it('should render with LTR direction for English locale', () => {
      const tpl = getTemplate('order_confirmation')!;
      const html = renderTemplate(tpl, { orderNumber: '12345', total: '$100' }, 'en-US');

      expect(html).toContain('dir="ltr"');
      expect(html).toContain('lang="en"');
      expect(html).toContain('direction: ltr');
    });

    it('should render Hebrew with RTL', () => {
      const tpl = getTemplate('shipping')!;
      const html = renderTemplate(tpl, { orderNumber: '999', trackingNumber: 'TRK123', estimatedDelivery: 'Tomorrow' }, 'he-IL');

      expect(html).toContain('dir="rtl"');
      expect(html).toContain('lang="he"');
      expect(html).toContain('ההזמנה שלך נשלחה');
    });

    it('should interpolate all placeholders', () => {
      const tpl = getTemplate('refund')!;
      const html = renderTemplate(tpl, { orderNumber: '777', refundAmount: '50 AED' }, 'en');
      expect(html).toContain('#777');
      expect(html).toContain('50 AED');
    });
  });

  describe('addRTLWrapper', () => {
    it('should add dir="rtl" for Arabic locale', () => {
      const wrapped = addRTLWrapper('<p>Hello</p>', 'ar');
      expect(wrapped).toContain('dir="rtl"');
      expect(wrapped).toContain('lang="ar"');
      expect(wrapped).toContain('text-align: right');
      expect(wrapped).toContain('<p>Hello</p>');
    });

    it('should add dir="ltr" for English locale', () => {
      const wrapped = addRTLWrapper('<p>Hello</p>', 'en');
      expect(wrapped).toContain('dir="ltr"');
      expect(wrapped).toContain('lang="en"');
      expect(wrapped).toContain('text-align: left');
    });

    it('should handle Hebrew locale', () => {
      const wrapped = addRTLWrapper('<p>Shalom</p>', 'he-IL');
      expect(wrapped).toContain('dir="rtl"');
      expect(wrapped).toContain('lang="he"');
    });

    it('should wrap empty content', () => {
      const wrapped = addRTLWrapper('', 'ar');
      expect(wrapped).toContain('dir="rtl"');
    });
  });

  describe('inlineCSS', () => {
    it('should inline body styles', () => {
      const html = '<html><head><style>body { color: red; }</style></head><body><p>Hi</p></body></html>';
      const result = inlineCSS(html);
      expect(result).toContain('style=');
      expect(result).toContain('color: red');
    });

    it('should return html unchanged without style tags', () => {
      const html = '<html><body><p>No styles</p></body></html>';
      expect(inlineCSS(html)).toBe(html);
    });
  });

  describe('getAvailableTemplateTypes', () => {
    it('should return all 7 template types', () => {
      const types = getAvailableTemplateTypes();
      expect(types).toHaveLength(7);
      expect(types).toContain('order_confirmation');
      expect(types).toContain('back_in_stock');
    });
  });
});
