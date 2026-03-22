export interface CartTranslationConfig {
  sourceLocale: string;
  targetLocale: string;
  shop: string;
}

export interface CartLineItem {
  id: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: string;
  properties?: Array<{ key: string; value: string }>;
}

export interface CartTranslationInput {
  lineItems: CartLineItem[];
  subtotalLabel?: string;
  totalLabel?: string;
  checkoutButtonLabel?: string;
  shippingLabel?: string;
  discountLabel?: string;
  taxLabel?: string;
  noteLabel?: string;
  emptyCartMessage?: string;
  customLabels?: Record<string, string>;
}

export interface TranslatedCart {
  lineItems: CartLineItem[];
  labels: CartLabels;
  direction: "rtl" | "ltr";
  locale: string;
}

export interface CartLabels {
  subtotal: string;
  total: string;
  checkout: string;
  shipping: string;
  discount: string;
  tax: string;
  note: string;
  emptyCart: string;
  continueShopping: string;
  removeItem: string;
  updateQuantity: string;
  addToCart: string;
  buyNow: string;
  shippingCalculator: string;
  discountCode: string;
  applyDiscount: string;
  giftCard: string;
  applyGiftCard: string;
  estimatedTotal: string;
  freeShipping: string;
}

export interface CheckoutTranslationInput {
  shippingMethods: Array<{ id: string; label: string; price: string }>;
  paymentMethods: Array<{ id: string; label: string; icon?: string }>;
  customLabels?: Record<string, string>;
}

export interface TranslatedCheckout {
  shippingMethods: Array<{ id: string; label: string; price: string }>;
  paymentMethods: Array<{ id: string; label: string; icon?: string }>;
  labels: CheckoutLabels;
  direction: "rtl" | "ltr";
  locale: string;
}

export interface CheckoutLabels {
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: string;
  shippingMethod: string;
  orderSummary: string;
  placeOrder: string;
  termsAndConditions: string;
  returnPolicy: string;
  secureCheckout: string;
  expressCheckout: string;
  orContinueWith: string;
  contactInfo: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  saveInfo: string;
}

export type DynamicPaymentButton = "apple_pay" | "google_pay" | "paypal" | "shop_pay" | "tamara" | "tabby";

export interface DynamicButtonTranslation {
  type: DynamicPaymentButton;
  label: string;
  ariaLabel: string;
}
