export interface InputMaskDefinition {
  field: "phone" | "postalCode" | "taxId";
  mask: string;
  placeholder: string;
}

const MASKS_BY_LOCALE: Record<string, InputMaskDefinition[]> = {
  en: [
    { field: "phone", mask: "(###) ###-####", placeholder: "(555) 123-4567" },
    { field: "postalCode", mask: "#####", placeholder: "94105" },
    { field: "taxId", mask: "##-#######", placeholder: "12-3456789" },
  ],
  ar: [
    { field: "phone", mask: "+966 ## ### ####", placeholder: "+966 55 123 4567" },
    { field: "postalCode", mask: "#####", placeholder: "11564" },
    { field: "taxId", mask: "3##########3", placeholder: "310123456700003" },
  ],
};

export function getInputMasks(locale: string): InputMaskDefinition[] {
  return MASKS_BY_LOCALE[locale] ?? MASKS_BY_LOCALE.en;
}

export function applyInputMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, "");
  let digitIndex = 0;
  let formatted = "";

  for (const char of mask) {
    if (char === "#") {
      if (digitIndex >= digits.length) {
        break;
      }

      formatted += digits[digitIndex];
      digitIndex += 1;
      continue;
    }

    formatted += char;
  }

  return formatted;
}

export function normalizeMaskedInput(value: string): string {
  return value.replace(/[^\dA-Za-z]/g, "");
}
