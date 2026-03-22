import { describe, it, expect } from 'vitest';
import {
  getCartLabels,
  getCheckoutLabels,
  getDynamicButtonTranslation,
  getAllDynamicButtonTranslations,
} from '../../app/services/cart-checkout/labels';
import {
  translateCart,
  translateCheckout,
  formatPrice,
  formatShippingCost,
} from '../../app/services/cart-checkout/translator';

describe('Cart & Checkout Labels', () => {
  describe('getCartLabels("en")', () => {
    it('returns English labels with "Checkout"', () => {
      const labels = getCartLabels('en');
      expect(labels.checkout).toBe('Checkout');
    });

    it('returns English labels with "Subtotal"', () => {
      const labels = getCartLabels('en');
      expect(labels.subtotal).toBe('Subtotal');
    });

    it('returns English labels with "Free shipping"', () => {
      const labels = getCartLabels('en');
      expect(labels.freeShipping).toBe('Free shipping');
    });
  });

  describe('getCartLabels("ar")', () => {
    it('returns Arabic checkout label', () => {
      const labels = getCartLabels('ar');
      expect(labels.checkout).toBe('إتمام الشراء');
    });

    it('returns Arabic subtotal label', () => {
      const labels = getCartLabels('ar');
      expect(labels.subtotal).toBe('المجموع الفرعي');
    });

    it('returns Arabic empty cart label', () => {
      const labels = getCartLabels('ar');
      expect(labels.emptyCart).toBe('سلة التسوق فارغة');
    });
  });

  describe('getCartLabels("he")', () => {
    it('returns Hebrew checkout label', () => {
      const labels = getCartLabels('he');
      expect(labels.checkout).toBe('לתשלום');
    });

    it('returns Hebrew subtotal label', () => {
      const labels = getCartLabels('he');
      expect(labels.subtotal).toBe('סכום ביניים');
    });
  });

  describe('getCartLabels fallback', () => {
    it('falls back to English for unknown locale', () => {
      const labels = getCartLabels('unknown');
      expect(labels.checkout).toBe('Checkout');
      expect(labels.subtotal).toBe('Subtotal');
    });

    it('handles locale with region code by extracting base', () => {
      const labels = getCartLabels('ar-SA');
      expect(labels.checkout).toBe('إتمام الشراء');
    });
  });

  describe('getCheckoutLabels("en")', () => {
    it('returns English checkout labels', () => {
      const labels = getCheckoutLabels('en');
      expect(labels.placeOrder).toBe('Place order');
      expect(labels.shippingAddress).toBe('Shipping address');
      expect(labels.paymentMethod).toBe('Payment method');
    });
  });

  describe('getCheckoutLabels("ar")', () => {
    it('returns Arabic checkout labels', () => {
      const labels = getCheckoutLabels('ar');
      expect(labels.placeOrder).toBe('تأكيد الطلب');
      expect(labels.shippingAddress).toBe('عنوان الشحن');
      expect(labels.secureCheckout).toBe('دفع آمن');
    });
  });

  describe('getDynamicButtonTranslation', () => {
    it('returns Arabic Tamara label', () => {
      const translation = getDynamicButtonTranslation('ar', 'tamara');
      expect(translation.label).toBe('تمارا');
      expect(translation.type).toBe('tamara');
    });

    it('returns English Tabby label', () => {
      const translation = getDynamicButtonTranslation('en', 'tabby');
      expect(translation.label).toBe('Tabby');
      expect(translation.ariaLabel).toBe('Split in payments with Tabby');
    });

    it('falls back to English for unknown locale', () => {
      const translation = getDynamicButtonTranslation('unknown', 'apple_pay');
      expect(translation.label).toBe('Apple Pay');
    });
  });

  describe('getAllDynamicButtonTranslations', () => {
    it('returns 6 button translations for English', () => {
      const translations = getAllDynamicButtonTranslations('en');
      expect(translations).toHaveLength(6);
    });

    it('returns 6 button translations for Arabic', () => {
      const translations = getAllDynamicButtonTranslations('ar');
      expect(translations).toHaveLength(6);
    });

    it('each translation has type, label, and ariaLabel', () => {
      const translations = getAllDynamicButtonTranslations('en');
      for (const t of translations) {
        expect(t).toHaveProperty('type');
        expect(t).toHaveProperty('label');
        expect(t).toHaveProperty('ariaLabel');
      }
    });
  });
});

describe('Cart & Checkout Translator', () => {
  describe('translateCart', () => {
    it('returns rtl direction for Arabic locale', () => {
      const result = translateCart(
        { sourceLocale: 'en', targetLocale: 'ar', shop: 'test.myshopify.com' },
        { lineItems: [] },
      );
      expect(result.direction).toBe('rtl');
      expect(result.locale).toBe('ar');
    });

    it('returns ltr direction for English locale', () => {
      const result = translateCart(
        { sourceLocale: 'en', targetLocale: 'en', shop: 'test.myshopify.com' },
        { lineItems: [] },
      );
      expect(result.direction).toBe('ltr');
      expect(result.locale).toBe('en');
    });

    it('returns Arabic labels when target locale is ar', () => {
      const result = translateCart(
        { sourceLocale: 'en', targetLocale: 'ar', shop: 'test.myshopify.com' },
        { lineItems: [] },
      );
      expect(result.labels.checkout).toBe('إتمام الشراء');
    });

    it('preserves line items in the output', () => {
      const lineItems = [
        { id: '1', title: 'Test Product', quantity: 2, price: '10.00' },
      ];
      const result = translateCart(
        { sourceLocale: 'en', targetLocale: 'en', shop: 'test.myshopify.com' },
        { lineItems },
      );
      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0].title).toBe('Test Product');
    });
  });

  describe('translateCheckout', () => {
    it('returns labels and direction for Arabic', () => {
      const result = translateCheckout(
        { sourceLocale: 'en', targetLocale: 'ar', shop: 'test.myshopify.com' },
        { shippingMethods: [], paymentMethods: [] },
      );
      expect(result.direction).toBe('rtl');
      expect(result.labels.placeOrder).toBe('تأكيد الطلب');
    });

    it('returns labels and direction for English', () => {
      const result = translateCheckout(
        { sourceLocale: 'en', targetLocale: 'en', shop: 'test.myshopify.com' },
        { shippingMethods: [], paymentMethods: [] },
      );
      expect(result.direction).toBe('ltr');
      expect(result.labels.placeOrder).toBe('Place order');
    });

    it('preserves shipping and payment methods', () => {
      const shippingMethods = [{ id: 's1', label: 'Standard', price: '5.00' }];
      const paymentMethods = [{ id: 'p1', label: 'Credit Card' }];
      const result = translateCheckout(
        { sourceLocale: 'en', targetLocale: 'en', shop: 'test.myshopify.com' },
        { shippingMethods, paymentMethods },
      );
      expect(result.shippingMethods).toHaveLength(1);
      expect(result.paymentMethods).toHaveLength(1);
    });
  });

  describe('formatPrice', () => {
    it('formats USD correctly for en-US', () => {
      const result = formatPrice(29.99, 'USD', 'en-US');
      expect(result).toContain('29.99');
      expect(result).toContain('$');
    });

    it('formats SAR for Arabic locale', () => {
      const result = formatPrice(100, 'SAR', 'ar-SA');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('falls back gracefully for invalid currency code', () => {
      const result = formatPrice(50, 'INVALID', 'en');
      // Should use the fallback format: "INVALID 50.00"
      expect(result).toContain('INVALID');
      expect(result).toContain('50.00');
    });
  });

  describe('formatShippingCost', () => {
    it('returns "Free shipping" label for amount=0 in English', () => {
      const result = formatShippingCost(0, 'USD', 'en');
      expect(result).toBe('Free shipping');
    });

    it('returns Arabic free shipping label for amount=0', () => {
      const result = formatShippingCost(0, 'SAR', 'ar');
      expect(result).toBe('شحن مجاني');
    });

    it('returns Hebrew free shipping label for amount=0', () => {
      const result = formatShippingCost(0, 'ILS', 'he');
      expect(result).toBe('משלוח חינם');
    });

    it('returns formatted price for non-zero amounts', () => {
      const result = formatShippingCost(9.99, 'USD', 'en-US');
      expect(result).toContain('9.99');
      expect(result).toContain('$');
    });
  });
});
