/**
 * T0292 - Installment Plans
 * BNPL installment plan configuration and calculation for Tamara, Tabby, and Postpay.
 */

export interface InstallmentPlan {
  provider: "tamara" | "tabby" | "postpay";
  installments: number;
  intervalDays: number;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  currency: string;
}

/**
 * Pre-configured installment plans for MENA BNPL providers.
 */
export const INSTALLMENT_PLANS: InstallmentPlan[] = [
  // Tamara - 3 installments (interest-free)
  {
    provider: "tamara",
    installments: 3,
    intervalDays: 30,
    interestRate: 0,
    minAmount: 100,
    maxAmount: 5000,
    currency: "SAR",
  },
  // Tamara - 6 installments (interest-free)
  {
    provider: "tamara",
    installments: 6,
    intervalDays: 30,
    interestRate: 0,
    minAmount: 500,
    maxAmount: 10000,
    currency: "SAR",
  },
  // Tabby - 4 installments (interest-free)
  {
    provider: "tabby",
    installments: 4,
    intervalDays: 14,
    interestRate: 0,
    minAmount: 50,
    maxAmount: 5000,
    currency: "SAR",
  },
  // Postpay - 3 installments (interest-free)
  {
    provider: "postpay",
    installments: 3,
    intervalDays: 30,
    interestRate: 0,
    minAmount: 100,
    maxAmount: 5000,
    currency: "AED",
  },
];

/** Countries supported by each provider */
const PROVIDER_COUNTRIES: Record<string, string[]> = {
  tamara: ["SA", "AE", "KW", "BH"],
  tabby: ["SA", "AE", "KW", "BH", "QA"],
  postpay: ["AE", "SA"],
};

/**
 * Get installment plans available for a given amount, currency, and country.
 */
export function getAvailablePlans(
  amount: number,
  currency: string,
  country: string,
): InstallmentPlan[] {
  const upperCountry = country.toUpperCase();

  return INSTALLMENT_PLANS.filter((plan) => {
    if (plan.currency !== currency) return false;
    if (amount < plan.minAmount || amount > plan.maxAmount) return false;
    const countries = PROVIDER_COUNTRIES[plan.provider];
    if (!countries?.includes(upperCountry)) return false;
    return true;
  });
}

/**
 * Calculate the full installment schedule for a plan and amount.
 */
export function calculateInstallmentSchedule(
  plan: InstallmentPlan,
  amount: number,
): Array<{ installmentNumber: number; amount: number; dueDate: Date }> {
  const totalWithInterest = amount * (1 + plan.interestRate / 100);
  const perInstallment = Math.round((totalWithInterest / plan.installments) * 100) / 100;
  const schedule: Array<{ installmentNumber: number; amount: number; dueDate: Date }> = [];
  let remaining = Math.round(totalWithInterest * 100) / 100;

  for (let i = 1; i <= plan.installments; i++) {
    const dueDate = new Date();
    // First installment is due today (or at checkout), rest are spaced by intervalDays
    if (i > 1) {
      dueDate.setDate(dueDate.getDate() + plan.intervalDays * (i - 1));
    }

    const installmentAmount = i === plan.installments
      ? Math.round(remaining * 100) / 100
      : perInstallment;

    remaining -= installmentAmount;

    schedule.push({
      installmentNumber: i,
      amount: installmentAmount,
      dueDate,
    });
  }

  return schedule;
}

/**
 * Format a human-readable installment label in the specified locale.
 */
export function formatInstallmentLabel(
  plan: InstallmentPlan,
  amount: number,
  locale: string,
): string {
  const perInstallment = Math.round((amount / plan.installments) * 100) / 100;

  if (locale.startsWith("ar")) {
    const currencyLabel = CURRENCY_LABELS_AR[plan.currency] ?? plan.currency;
    return `${plan.installments} \u062f\u0641\u0639\u0627\u062a \u0628\u0642\u064a\u0645\u0629 ${perInstallment} ${currencyLabel}`;
  }

  return `${plan.installments} payments of ${perInstallment} ${plan.currency}`;
}

const CURRENCY_LABELS_AR: Record<string, string> = {
  SAR: "\u0631.\u0633",
  AED: "\u062f.\u0625",
  KWD: "\u062f.\u0643",
  BHD: "\u062f.\u0628",
  QAR: "\u0631.\u0642",
  OMR: "\u0631.\u0639",
  EGP: "\u062c.\u0645",
};

/**
 * Generate a simple installment information widget as HTML + CSS.
 */
export function getInstallmentWidget(
  plans: InstallmentPlan[],
  amount: number,
  locale: string,
): { html: string; css: string } {
  const isArabic = locale.startsWith("ar");
  const dir = isArabic ? "rtl" : "ltr";
  const title = isArabic
    ? "\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u062a\u0642\u0633\u064a\u0637"
    : "Installment Options";
  const interestFreeLabel = isArabic ? "\u0628\u062f\u0648\u0646 \u0641\u0648\u0627\u0626\u062f" : "Interest-free";

  const planItems = plans
    .map((plan) => {
      const label = formatInstallmentLabel(plan, amount, locale);
      const interestTag = plan.interestRate === 0
        ? `<span class="installment-badge">${interestFreeLabel}</span>`
        : "";
      return `<div class="installment-option">
      <span class="installment-provider">${plan.provider}</span>
      <span class="installment-label">${label}</span>
      ${interestTag}
    </div>`;
    })
    .join("\n    ");

  const html = `<div class="installment-widget" dir="${dir}">
    <h4 class="installment-title">${title}</h4>
    ${planItems}
  </div>`;

  const css = `.installment-widget {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  font-family: Arial, sans-serif;
  max-width: 360px;
}
.installment-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.installment-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}
.installment-option:last-child {
  border-bottom: none;
}
.installment-provider {
  font-weight: 600;
  text-transform: capitalize;
  min-width: 60px;
  color: #374151;
}
.installment-label {
  flex: 1;
  color: #4b5563;
}
.installment-badge {
  background: #ecfdf5;
  color: #065f46;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}`;

  return { html, css };
}
