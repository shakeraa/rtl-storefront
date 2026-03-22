import { describe, it, expect } from 'vitest';
import {
  translateCrossSellWidget,
  getCrossSellLabels,
  formatBundleOffer,
  getFrequentlyBoughtTogetherLabel,
  getCompleteTheLookLabels,
  getWidgetLabels,
  formatRTLProductArrangement,
  getDiscountBadge,
  calculateBundlePricing,
  isRTLLocale,
} from '../../app/services/integrations/cross-sell';
import type {
  CrossSellWidgetContent,
  CrossSellItem,
  BundleProduct,
  BundleDiscount,
} from '../../app/services/integrations/cross-sell';

describe('Cross-sell Integration Service', () => {
  describe('isRTLLocale', () => {
    it('returns true for Arabic locale', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('ar-SA')).toBe(true);
      expect(isRTLLocale('ar-EG')).toBe(true);
    });

    it('returns true for Hebrew locale', () => {
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('he-IL')).toBe(true);
    });

    it('returns false for English locale', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('en-US')).toBe(false);
      expect(isRTLLocale('en-GB')).toBe(false);
    });

    it('returns true for Persian and Urdu locales', () => {
      expect(isRTLLocale('fa')).toBe(true);
      expect(isRTLLocale('fa-IR')).toBe(true);
      expect(isRTLLocale('ur')).toBe(true);
      expect(isRTLLocale('ur-PK')).toBe(true);
    });
  });

  describe('translateCrossSellWidget', () => {
    it('translates frequently bought together widget to Arabic', () => {
      const content: CrossSellWidgetContent = {
        widgetId: 'widget-1',
        type: 'frequentlyBoughtTogether',
        title: 'Frequently Bought Together',
        items: [
          { productId: 'p1', title: 'Product 1', price: 100 },
          { productId: 'p2', title: 'Product 2', price: 50 },
        ],
      };

      const result = translateCrossSellWidget(content, 'ar');
      expect(result.title).toBe('اشترى العملاء أيضاً');
      expect(result.items).toHaveLength(2);
    });

    it('translates complete the look widget to Hebrew', () => {
      const content: CrossSellWidgetContent = {
        widgetId: 'widget-2',
        type: 'completeTheLook',
        title: 'Complete the Look',
        items: [
          { productId: 'p1', title: 'Shirt', price: 80 },
          { productId: 'p2', title: 'Pants', price: 120 },
        ],
      };

      const result = translateCrossSellWidget(content, 'he');
      expect(result.title).toBe('השלם את המראה');
    });

    it('preserves item metadata during translation', () => {
      const content: CrossSellWidgetContent = {
        widgetId: 'widget-3',
        type: 'productBundles',
        title: 'Bundle Deal',
        items: [
          { 
            productId: 'p1', 
            title: 'Main Product', 
            price: 100, 
            isMainProduct: true,
            quantity: 2,
            imageUrl: 'https://example.com/image.jpg',
          },
        ],
        metadata: {
          discount: { type: 'percentage', value: 20 },
          layout: 'horizontal',
          maxItems: 4,
        },
      };

      const result = translateCrossSellWidget(content, 'ar');
      expect(result.items[0].isMainProduct).toBe(true);
      expect(result.items[0].quantity).toBe(2);
      expect(result.items[0].imageUrl).toBe('https://example.com/image.jpg');
      expect(result.metadata?.maxItems).toBe(4);
    });

    it('falls back to English for unsupported locale', () => {
      const content: CrossSellWidgetContent = {
        widgetId: 'widget-4',
        type: 'relatedProducts',
        title: 'Related Products',
        items: [],
      };

      const result = translateCrossSellWidget(content, 'fr');
      expect(result.title).toBe('Related Products');
    });

    it('handles all widget types', () => {
      const types: CrossSellWidgetContent['type'][] = [
        'frequentlyBoughtTogether',
        'completeTheLook',
        'relatedProducts',
        'youMayAlsoLike',
        'productBundles',
        'upsellPopup',
      ];

      types.forEach(type => {
        const content: CrossSellWidgetContent = {
          widgetId: `widget-${type}`,
          type,
          title: 'Title',
          items: [],
        };

        const result = translateCrossSellWidget(content, 'ar');
        expect(result.type).toBe(type);
        expect(result.title).toBeTruthy();
      });
    });
  });

  describe('getCrossSellLabels', () => {
    it('returns Arabic labels with RTL markers', () => {
      const labels = getCrossSellLabels('ar');
      expect(labels.addToCart).toContain('أضف إلى السلة');
      expect(labels.bundleDeal).toContain('عرض الحزمة');
      expect(labels.completeTheLook).toContain('أكمل إطلالتك');
    });

    it('returns Hebrew labels with RTL markers', () => {
      const labels = getCrossSellLabels('he');
      expect(labels.addToCart).toContain('הוסף לסל');
      expect(labels.youSave).toContain('חיסכון של');
    });

    it('returns English labels without RTL markers', () => {
      const labels = getCrossSellLabels('en');
      expect(labels.addToCart).toBe('Add to Cart');
      expect(labels.totalPrice).toBe('Total Price');
      expect(labels.bundleDeal).toBe('Bundle Deal');
    });

    it('includes all required label keys', () => {
      const labels = getCrossSellLabels('en');
      expect(labels).toHaveProperty('widgetTitle');
      expect(labels).toHaveProperty('addToCart');
      expect(labels).toHaveProperty('totalPrice');
      expect(labels).toHaveProperty('youSave');
      expect(labels).toHaveProperty('bundleDeal');
      expect(labels).toHaveProperty('addAllToCart');
    });

    it('handles region-specific locales', () => {
      const arSALabels = getCrossSellLabels('ar-SA');
      const arEGLabels = getCrossSellLabels('ar-EG');
      expect(arSALabels.addToCart).toBe(arEGLabels.addToCart);
    });
  });

  describe('formatBundleOffer', () => {
    it('formats percentage discount bundle correctly', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'Product 1', price: 100 },
        { id: 'p2', title: 'Product 2', price: 50 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 20 };

      const result = formatBundleOffer(products, discount, 'en');
      expect(result.totalOriginal).toBe(150);
      expect(result.savingsAmount).toBe(30);
      expect(result.totalDiscounted).toBe(120);
      expect(result.savingsPercent).toBe(20);
      expect(result.direction).toBe('ltr');
    });

    it('formats fixed amount discount bundle correctly', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'Product 1', price: 200 },
        { id: 'p2', title: 'Product 2', price: 100 },
      ];
      const discount: BundleDiscount = { type: 'fixed', value: 50 };

      const result = formatBundleOffer(products, discount, 'en');
      expect(result.totalOriginal).toBe(300);
      expect(result.savingsAmount).toBe(50);
      expect(result.totalDiscounted).toBe(250);
    });

    it('formats buy X get Y bundle correctly', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'Product 1', price: 100 },
        { id: 'p2', title: 'Product 2', price: 50 },
        { id: 'p3', title: 'Product 3', price: 30 },
      ];
      const discount: BundleDiscount = { type: 'buyXgetY', value: 1 };

      const result = formatBundleOffer(products, discount, 'en');
      expect(result.totalOriginal).toBe(180);
      expect(result.savingsAmount).toBe(30);
      expect(result.totalDiscounted).toBe(150);
    });

    it('returns RTL direction for Arabic locale', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'Product 1', price: 100 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 10 };

      const result = formatBundleOffer(products, discount, 'ar');
      expect(result.direction).toBe('rtl');
    });

    it('returns RTL direction for Hebrew locale', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'Product 1', price: 100 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 10 };

      const result = formatBundleOffer(products, discount, 'he');
      expect(result.direction).toBe('rtl');
    });

    it('generates correct discount label for percentage', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'Product 1', price: 100 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 25 };

      const result = formatBundleOffer(products, discount, 'en');
      expect(result.discountLabel).toContain('25');
    });

    it('reverses product order for RTL locales', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'First', price: 100 },
        { id: 'p2', title: 'Second', price: 50 },
        { id: 'p3', title: 'Third', price: 30 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 10 };

      const ltrResult = formatBundleOffer(products, discount, 'en');
      const rtlResult = formatBundleOffer(products, discount, 'ar');

      // In RTL, first item should have highest position
      expect(ltrResult.formattedProducts[0].id).toBe('p1');
      expect(rtlResult.formattedProducts[rtlResult.formattedProducts.length - 1].id).toBe('p1');
    });

    it('handles empty product list', () => {
      const products: BundleProduct[] = [];
      const discount: BundleDiscount = { type: 'percentage', value: 10 };

      const result = formatBundleOffer(products, discount, 'en');
      expect(result.totalOriginal).toBe(0);
      expect(result.totalDiscounted).toBe(0);
      expect(result.formattedProducts).toHaveLength(0);
    });

    it('generates bundle label with item count', () => {
      const products: BundleProduct[] = [
        { id: 'p1', title: 'Product 1', price: 100 },
        { id: 'p2', title: 'Product 2', price: 50 },
        { id: 'p3', title: 'Product 3', price: 30 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 10 };

      const enResult = formatBundleOffer(products, discount, 'en');
      const arResult = formatBundleOffer(products, discount, 'ar');

      expect(enResult.bundleLabel).toContain('3');
      expect(arResult.bundleLabel).toContain('٣');
    });
  });

  describe('getFrequentlyBoughtTogetherLabel', () => {
    it('returns English labels with correct item count', () => {
      const result = getFrequentlyBoughtTogetherLabel(3, 'en');
      expect(result.title).toBe('Frequently Bought Together');
      expect(result.direction).toBe('ltr');
      expect(result.itemCount).toBe(3);
    });

    it('returns Arabic labels with RTL direction', () => {
      const result = getFrequentlyBoughtTogetherLabel(4, 'ar');
      expect(result.title).toBe('اشترى العملاء أيضاً');
      expect(result.direction).toBe('rtl');
      expect(result.itemCount).toBe(4);
    });

    it('returns Hebrew labels with RTL direction', () => {
      const result = getFrequentlyBoughtTogetherLabel(2, 'he');
      expect(result.title).toBe('נרכשו יחד לעיתים קרובות');
      expect(result.direction).toBe('rtl');
    });

    it('uses singular form for single item', () => {
      const enResult = getFrequentlyBoughtTogetherLabel(1, 'en');
      expect(enResult.itemLabel).toBe('item');

      const arResult = getFrequentlyBoughtTogetherLabel(1, 'ar');
      expect(arResult.itemLabel).toBe('منتج');
    });

    it('uses plural form for multiple items', () => {
      const enResult = getFrequentlyBoughtTogetherLabel(5, 'en');
      expect(enResult.itemLabel).toBe('items');

      const arResult = getFrequentlyBoughtTogetherLabel(5, 'ar');
      expect(arResult.itemLabel).toBe('منتجات');
    });

    it('handles region-specific locales', () => {
      const result = getFrequentlyBoughtTogetherLabel(3, 'ar-SA');
      expect(result.direction).toBe('rtl');
      expect(result.title).toBe('اشترى العملاء أيضاً');
    });
  });

  describe('getCompleteTheLookLabels', () => {
    it('returns English labels', () => {
      const result = getCompleteTheLookLabels('en');
      expect(result.title).toBe('Complete the Look');
      expect(result.addAllLabel).toBe('Add All to Cart');
      expect(result.direction).toBe('ltr');
    });

    it('returns Arabic labels with RTL direction', () => {
      const result = getCompleteTheLookLabels('ar');
      expect(result.title).toBe('أكمل إطلالتك');
      expect(result.addAllLabel).toBe('أضف الكل إلى السلة');
      expect(result.direction).toBe('rtl');
    });

    it('returns Hebrew labels with RTL direction', () => {
      const result = getCompleteTheLookLabels('he');
      expect(result.title).toBe('השלם את המראה');
      expect(result.direction).toBe('rtl');
    });

    it('includes item count in subtitle when provided', () => {
      const enResult = getCompleteTheLookLabels('en', 5);
      expect(enResult.subtitle).toContain('5');

      const arResult = getCompleteTheLookLabels('ar', 3);
      expect(arResult.subtitle).toContain('٣');
    });

    it('uses default subtitle when item count not provided', () => {
      const enResult = getCompleteTheLookLabels('en');
      expect(enResult.subtitle).toBe('Buy Together');

      const arResult = getCompleteTheLookLabels('ar');
      expect(arResult.subtitle).toBe('اشتري معاً');
    });
  });

  describe('getWidgetLabels', () => {
    it('returns correct labels for each widget type in English', () => {
      const types: Array<{ type: CrossSellWidgetContent['type']; expectedTitle: string }> = [
        { type: 'frequentlyBoughtTogether', expectedTitle: 'Frequently Bought Together' },
        { type: 'completeTheLook', expectedTitle: 'Complete the Look' },
        { type: 'relatedProducts', expectedTitle: 'Related Products' },
        { type: 'youMayAlsoLike', expectedTitle: 'You May Also Like' },
        { type: 'productBundles', expectedTitle: 'Bundle & Save' },
        { type: 'upsellPopup', expectedTitle: 'Upgrade Your Selection' },
      ];

      types.forEach(({ type, expectedTitle }) => {
        const result = getWidgetLabels(type, 'en');
        expect(result.title).toBe(expectedTitle);
      });
    });

    it('returns RTL direction for Arabic locale', () => {
      const result = getWidgetLabels('relatedProducts', 'ar');
      expect(result.direction).toBe('rtl');
    });

    it('returns appropriate CTA labels', () => {
      const bundleResult = getWidgetLabels('productBundles', 'en');
      expect(bundleResult.ctaLabel).toBe('Add All to Cart');

      const relatedResult = getWidgetLabels('relatedProducts', 'en');
      expect(relatedResult.ctaLabel).toBe('Add to Cart');
    });
  });

  describe('formatRTLProductArrangement', () => {
    it('maintains original order for LTR locales', () => {
      const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const result = formatRTLProductArrangement(items, 'en');
      
      expect(result[0].id).toBe('a');
      expect(result[0].displayOrder).toBe(0);
      expect(result[0].isFirst).toBe(true);
      expect(result[0].isLast).toBe(false);
      
      expect(result[2].id).toBe('c');
      expect(result[2].isLast).toBe(true);
    });

    it('reverses order for RTL locales', () => {
      const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const result = formatRTLProductArrangement(items, 'ar');
      
      // First item in array should be last visually
      expect(result[0].id).toBe('c');
      expect(result[0].displayOrder).toBe(0);
      expect(result[0].isFirst).toBe(true);
      
      expect(result[2].id).toBe('a');
      expect(result[2].isLast).toBe(true);
    });

    it('marks single item as both first and last', () => {
      const items = [{ id: 'a' }];
      const result = formatRTLProductArrangement(items, 'en');
      
      expect(result[0].isFirst).toBe(true);
      expect(result[0].isLast).toBe(true);
    });

    it('handles empty array', () => {
      const items: Array<{ id: string }> = [];
      const result = formatRTLProductArrangement(items, 'ar');
      expect(result).toHaveLength(0);
    });

    it('preserves item properties', () => {
      const items = [
        { id: 'a', name: 'Product A', price: 100 },
        { id: 'b', name: 'Product B', price: 200 },
      ];
      const result = formatRTLProductArrangement(items, 'he');
      
      expect(result[0].name).toBe('Product B');
      expect(result[0].price).toBe(200);
    });
  });

  describe('getDiscountBadge', () => {
    it('formats percentage discount badge', () => {
      const discount: BundleDiscount = { type: 'percentage', value: 25 };
      const result = getDiscountBadge(discount, 'en');
      
      expect(result.text).toContain('25');
      expect(result.ariaLabel).toContain('25%');
    });

    it('formats fixed amount discount badge', () => {
      const discount: BundleDiscount = { type: 'fixed', value: 50 };
      const result = getDiscountBadge(discount, 'en');
      
      expect(result.text).toContain('50');
      expect(result.ariaLabel).toContain('50');
    });

    it('formats buy X get Y discount badge', () => {
      const discount: BundleDiscount = { type: 'buyXgetY', value: 1 };
      const result = getDiscountBadge(discount, 'en');
      
      expect(result.text).toBe('Bundle Deal');
      expect(result.ariaLabel).toBe('Special bundle deal');
    });

    it('returns localized text', () => {
      const discount: BundleDiscount = { type: 'percentage', value: 20 };
      const enResult = getDiscountBadge(discount, 'en');
      const arResult = getDiscountBadge(discount, 'ar');
      
      expect(enResult.text).toContain('Save');
      expect(arResult.text).toContain('وفر');
    });
  });

  describe('calculateBundlePricing', () => {
    it('calculates percentage discount correctly', () => {
      const items: CrossSellItem[] = [
        { productId: 'p1', title: 'Item 1', price: 100, quantity: 1 },
        { productId: 'p2', title: 'Item 2', price: 50, quantity: 2 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 20 };
      
      const result = calculateBundlePricing(items, discount, 'en');
      expect(result.originalTotal).toBe('200.00');
      expect(result.savings).toBe('40.00');
      expect(result.discountedTotal).toBe('160.00');
      expect(result.savingsPercent).toBe(20);
    });

    it('calculates fixed discount correctly', () => {
      const items: CrossSellItem[] = [
        { productId: 'p1', title: 'Item 1', price: 100, quantity: 1 },
      ];
      const discount: BundleDiscount = { type: 'fixed', value: 30 };
      
      const result = calculateBundlePricing(items, discount, 'en');
      expect(result.savings).toBe('30.00');
      expect(result.discountedTotal).toBe('70.00');
    });

    it('calculates buy X get Y discount correctly', () => {
      const items: CrossSellItem[] = [
        { productId: 'p1', title: 'Item 1', price: 100, quantity: 1 },
        { productId: 'p2', title: 'Item 2', price: 50, quantity: 1 },
        { productId: 'p3', title: 'Item 3', price: 30, quantity: 1 },
      ];
      const discount: BundleDiscount = { type: 'buyXgetY', value: 1 };
      
      const result = calculateBundlePricing(items, discount, 'en');
      expect(result.savings).toBe('30.00'); // cheapest item
      expect(result.discountedTotal).toBe('150.00');
    });

    it('handles originalPrice when different from price', () => {
      const items: CrossSellItem[] = [
        { productId: 'p1', title: 'Item 1', price: 80, originalPrice: 100, quantity: 1 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 10 };
      
      const result = calculateBundlePricing(items, discount, 'en');
      expect(result.originalTotal).toBe('100.00');
    });

    it('calculates per-item price correctly', () => {
      const items: CrossSellItem[] = [
        { productId: 'p1', title: 'Item 1', price: 100, quantity: 2 },
        { productId: 'p2', title: 'Item 2', price: 50, quantity: 1 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 0 };
      
      const result = calculateBundlePricing(items, discount, 'en');
      // Total 250, no discount, 3 items = 83.33 per item
      expect(result.perItemPrice).toBe('83.33');
    });

    it('handles empty items list', () => {
      const items: CrossSellItem[] = [];
      const discount: BundleDiscount = { type: 'percentage', value: 20 };
      
      const result = calculateBundlePricing(items, discount, 'en');
      expect(result.originalTotal).toBe('0.00');
      expect(result.discountedTotal).toBe('0.00');
      expect(result.savings).toBe('0.00');
    });

    it('formats prices according to locale', () => {
      const items: CrossSellItem[] = [
        { productId: 'p1', title: 'Item 1', price: 1000.50, quantity: 1 },
      ];
      const discount: BundleDiscount = { type: 'percentage', value: 0 };
      
      const enResult = calculateBundlePricing(items, discount, 'en-US');
      expect(enResult.originalTotal).toContain('1,000');
    });
  });
});
