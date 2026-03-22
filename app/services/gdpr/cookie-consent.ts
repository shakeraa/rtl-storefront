/**
 * T0192 — Cookie Consent Service
 *
 * Generates cookie-consent banners with full Arabic / RTL support and
 * parses consent cookies set by the storefront.
 */

import type { CookieConsentConfig, CookieCategory } from "./types";

/**
 * Return the four standard cookie categories used by the storefront.
 */
export function getCookieCategories(): CookieCategory[] {
  return [
    {
      id: "necessary",
      name: "Necessary",
      nameAr: "ضرورية",
      description: "Essential cookies required for the store to function.",
      descriptionAr: "ملفات تعريف الارتباط الأساسية اللازمة لعمل المتجر.",
      required: true,
      defaultEnabled: true,
    },
    {
      id: "analytics",
      name: "Analytics",
      nameAr: "تحليلات",
      description: "Help us understand how visitors interact with the store.",
      descriptionAr:
        "تساعدنا على فهم كيفية تفاعل الزوار مع المتجر.",
      required: false,
      defaultEnabled: false,
    },
    {
      id: "marketing",
      name: "Marketing",
      nameAr: "تسويق",
      description: "Used to deliver relevant advertisements.",
      descriptionAr: "تُستخدم لتقديم إعلانات ذات صلة.",
      required: false,
      defaultEnabled: false,
    },
    {
      id: "third_party",
      name: "Third-Party",
      nameAr: "طرف ثالث",
      description: "Set by external services embedded in the store.",
      descriptionAr:
        "يتم تعيينها بواسطة خدمات خارجية مدمجة في المتجر.",
      required: false,
      defaultEnabled: false,
    },
  ];
}

/**
 * Build a default cookie-consent configuration for a shop, including
 * Arabic translations for all user-facing strings.
 */
export function getDefaultCookieConfig(shop: string): CookieConsentConfig {
  return {
    shop,
    bannerText:
      "We use cookies to improve your experience. You can manage your preferences below.",
    bannerTextAr:
      "نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك إدارة تفضيلاتك أدناه.",
    acceptButtonText: "Accept All",
    acceptButtonTextAr: "قبول الكل",
    rejectButtonText: "Reject All",
    rejectButtonTextAr: "رفض الكل",
    privacyPolicyUrl: `/pages/privacy-policy`,
    cookieCategories: getCookieCategories(),
    position: "bottom",
    style: "banner",
  };
}

/**
 * Generate an HTML snippet for the cookie-consent banner, respecting the
 * requested locale (swaps to Arabic text and RTL layout when `locale`
 * starts with "ar").
 */
export function generateConsentBannerHTML(
  config: CookieConsentConfig,
  locale: string,
): string {
  const isRTL = locale.startsWith("ar");
  const dir = isRTL ? "rtl" : "ltr";
  const lang = isRTL ? "ar" : "en";

  const bannerText = isRTL ? config.bannerTextAr : config.bannerText;
  const acceptText = isRTL
    ? config.acceptButtonTextAr
    : config.acceptButtonText;
  const rejectText = isRTL
    ? config.rejectButtonTextAr
    : config.rejectButtonText;

  const categoryCheckboxes = config.cookieCategories
    .map((cat) => {
      const label = isRTL ? cat.nameAr : cat.name;
      const desc = isRTL ? cat.descriptionAr : cat.description;
      const disabled = cat.required ? ' disabled checked' : "";
      const checked = cat.defaultEnabled && !cat.required ? " checked" : "";
      return `
      <label class="cookie-category">
        <input type="checkbox" name="${cat.id}"${disabled}${checked} />
        <span class="cookie-category-name">${label}</span>
        <span class="cookie-category-desc">${desc}</span>
      </label>`;
    })
    .join("");

  return `<div id="cookie-consent-banner" class="cookie-consent cookie-consent--${config.position} cookie-consent--${config.style}" dir="${dir}" lang="${lang}" role="dialog" aria-label="${isRTL ? "إعدادات ملفات تعريف الارتباط" : "Cookie settings"}">
  <div class="cookie-consent__body">
    <p class="cookie-consent__text">${bannerText}</p>
    <div class="cookie-consent__categories">${categoryCheckboxes}
    </div>
  </div>
  <div class="cookie-consent__actions">
    <button class="cookie-consent__btn cookie-consent__btn--accept" data-action="accept-all">${acceptText}</button>
    <button class="cookie-consent__btn cookie-consent__btn--reject" data-action="reject-all">${rejectText}</button>
    <a class="cookie-consent__link" href="${config.privacyPolicyUrl}">${isRTL ? "سياسة الخصوصية" : "Privacy Policy"}</a>
  </div>
</div>`;
}

/**
 * Parse a consent cookie string of the form
 * `necessary=1;analytics=0;marketing=0;third_party=0` into a map of
 * category-id to boolean.
 */
export function parseConsentCookie(
  cookie: string,
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  if (!cookie) return result;

  const pairs = cookie.split(";");
  for (const pair of pairs) {
    const [key, value] = pair.trim().split("=");
    if (key && value !== undefined) {
      result[key.trim()] = value.trim() === "1" || value.trim() === "true";
    }
  }

  return result;
}
