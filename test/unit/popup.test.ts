import { describe, it, expect } from "vitest";
import {
  getPopupLabel,
  getModalButtons,
  getPopupContent,
  getPopupLabelKeys,
  getModalTypes,
  requiresConfirmation,
  getPopupDirection,
  type PopupLabelKey,
  type ModalType,
  type ModalButton,
} from "../../app/services/ui-labels/popup";

describe("Popup Labels - getPopupLabel", () => {
  describe("English locale (en)", () => {
    it('returns "Close" for close key in English', () => {
      const result = getPopupLabel("close", "en");
      expect(result).toBe("Close");
    });

    it('returns "Confirm" for confirm key in English', () => {
      const result = getPopupLabel("confirm", "en");
      expect(result).toBe("Confirm");
    });

    it('returns "Not now" for notNow key in English', () => {
      const result = getPopupLabel("notNow", "en");
      expect(result).toBe("Not now");
    });

    it("returns all expected English labels", () => {
      const labels: Record<PopupLabelKey, string> = {
        close: "Close",
        dismiss: "Dismiss",
        accept: "Accept",
        decline: "Decline",
        yes: "Yes",
        no: "No",
        confirm: "Confirm",
        cancel: "Cancel",
        later: "Later",
        notNow: "Not now",
      };

      (Object.keys(labels) as PopupLabelKey[]).forEach((key) => {
        expect(getPopupLabel(key, "en")).toBe(labels[key]);
      });
    });
  });

  describe("Arabic locale (ar)", () => {
    it('returns "إغلاق" for close key in Arabic', () => {
      const result = getPopupLabel("close", "ar");
      expect(result).toBe("إغلاق");
    });

    it('returns "تأكيد" for confirm key in Arabic', () => {
      const result = getPopupLabel("confirm", "ar");
      expect(result).toBe("تأكيد");
    });

    it('returns "ليس الآن" for notNow key in Arabic', () => {
      const result = getPopupLabel("notNow", "ar");
      expect(result).toBe("ليس الآن");
    });

    it("returns Arabic labels with proper RTL characters", () => {
      expect(getPopupLabel("yes", "ar")).toBe("نعم");
      expect(getPopupLabel("no", "ar")).toBe("لا");
      expect(getPopupLabel("accept", "ar")).toBe("قبول");
      expect(getPopupLabel("decline", "ar")).toBe("رفض");
    });
  });

  describe("Hebrew locale (he)", () => {
    it('returns "סגור" for close key in Hebrew', () => {
      const result = getPopupLabel("close", "he");
      expect(result).toBe("סגור");
    });

    it('returns "אשר" for confirm key in Hebrew', () => {
      const result = getPopupLabel("confirm", "he");
      expect(result).toBe("אשר");
    });

    it('returns "לא עכשיו" for notNow key in Hebrew', () => {
      const result = getPopupLabel("notNow", "he");
      expect(result).toBe("לא עכשיו");
    });

    it("returns Hebrew labels with proper RTL characters", () => {
      expect(getPopupLabel("yes", "he")).toBe("כן");
      expect(getPopupLabel("no", "he")).toBe("לא");
      expect(getPopupLabel("accept", "he")).toBe("קבל");
      expect(getPopupLabel("decline", "he")).toBe("דחה");
    });
  });

  describe("Locale variations and fallback", () => {
    it("handles locale with region code (ar-SA)", () => {
      const result = getPopupLabel("close", "ar-SA");
      expect(result).toBe("إغلاق");
    });

    it("handles locale with region code (he-IL)", () => {
      const result = getPopupLabel("close", "he-IL");
      expect(result).toBe("סגור");
    });

    it("handles locale with region code (en-US)", () => {
      const result = getPopupLabel("close", "en-US");
      expect(result).toBe("Close");
    });

    it("falls back to English for unknown locale", () => {
      const result = getPopupLabel("close", "unknown");
      expect(result).toBe("Close");
    });

    it("falls back to English for empty string locale", () => {
      const result = getPopupLabel("close", "");
      expect(result).toBe("Close");
    });
  });
});

describe("Modal Buttons - getModalButtons", () => {
  describe("Welcome modal", () => {
    it("returns accept and decline buttons for welcome modal in English", () => {
      const buttons = getModalButtons("welcome", "en");
      expect(buttons).toHaveLength(2);
      expect(buttons[0].key).toBe("accept");
      expect(buttons[0].label).toBe("Accept");
      expect(buttons[0].variant).toBe("primary");
      expect(buttons[1].key).toBe("decline");
      expect(buttons[1].label).toBe("Decline");
    });

    it("returns Arabic buttons for welcome modal", () => {
      const buttons = getModalButtons("welcome", "ar");
      expect(buttons[0].label).toBe("قبول");
      expect(buttons[1].label).toBe("رفض");
    });

    it("returns Hebrew buttons for welcome modal", () => {
      const buttons = getModalButtons("welcome", "he");
      expect(buttons[0].label).toBe("קבל");
      expect(buttons[1].label).toBe("דחה");
    });
  });

  describe("Exit intent modal", () => {
    it("returns three buttons for exit intent modal", () => {
      const buttons = getModalButtons("exitIntent", "en");
      expect(buttons).toHaveLength(3);
      expect(buttons[0].key).toBe("yes");
      expect(buttons[1].key).toBe("no");
      expect(buttons[2].key).toBe("later");
    });

    it("returns Arabic buttons for exit intent modal", () => {
      const buttons = getModalButtons("exitIntent", "ar");
      expect(buttons[0].label).toBe("نعم");
      expect(buttons[1].label).toBe("لا");
      expect(buttons[2].label).toBe("لاحقاً");
    });

    it("first button is always primary variant", () => {
      const types: ModalType[] = ["welcome", "exitIntent", "promotional", "cookieConsent", "ageVerification"];
      types.forEach((type) => {
        const buttons = getModalButtons(type, "en");
        expect(buttons[0].variant).toBe("primary");
      });
    });
  });

  describe("Promotional modal", () => {
    it("returns three buttons for promotional modal", () => {
      const buttons = getModalButtons("promotional", "en");
      expect(buttons).toHaveLength(3);
      expect(buttons[0].key).toBe("accept");
      expect(buttons[1].key).toBe("decline");
      expect(buttons[2].key).toBe("notNow");
    });

    it("returns Hebrew buttons for promotional modal", () => {
      const buttons = getModalButtons("promotional", "he");
      expect(buttons[0].label).toBe("קבל");
      expect(buttons[1].label).toBe("דחה");
      expect(buttons[2].label).toBe("לא עכשיו");
    });
  });

  describe("Cookie consent modal", () => {
    it("returns accept and decline buttons for cookie consent", () => {
      const buttons = getModalButtons("cookieConsent", "en");
      expect(buttons).toHaveLength(2);
      expect(buttons[0].key).toBe("accept");
      expect(buttons[1].key).toBe("decline");
    });

    it("returns Arabic buttons for cookie consent", () => {
      const buttons = getModalButtons("cookieConsent", "ar");
      expect(buttons[0].label).toBe("قبول");
      expect(buttons[1].label).toBe("رفض");
    });
  });

  describe("Age verification modal", () => {
    it("returns confirm and cancel buttons for age verification", () => {
      const buttons = getModalButtons("ageVerification", "en");
      expect(buttons).toHaveLength(2);
      expect(buttons[0].key).toBe("confirm");
      expect(buttons[1].key).toBe("cancel");
    });

    it("returns Arabic buttons for age verification", () => {
      const buttons = getModalButtons("ageVerification", "ar");
      expect(buttons[0].label).toBe("تأكيد");
      expect(buttons[1].label).toBe("إلغاء");
    });
  });
});

describe("Popup Content - getPopupContent", () => {
  describe("Welcome modal content", () => {
    it("returns complete welcome modal content in English", () => {
      const content = getPopupContent("welcome", "en");
      expect(content.type).toBe("welcome");
      expect(content.title).toBe("Welcome!");
      expect(content.message).toContain("Thank you for visiting");
      expect(content.buttons).toHaveLength(2);
    });

    it("returns Arabic welcome content with RTL title", () => {
      const content = getPopupContent("welcome", "ar");
      expect(content.title).toBe("أهلاً وسهلاً!");
      expect(content.message).toContain("شكراً لزيارتك");
    });

    it("returns Hebrew welcome content with RTL title", () => {
      const content = getPopupContent("welcome", "he");
      expect(content.title).toBe("ברוכים הבאים!");
      expect(content.message).toContain("תודה שביקרת");
    });
  });

  describe("Cookie consent modal content", () => {
    it("returns complete cookie consent content in English", () => {
      const content = getPopupContent("cookieConsent", "en");
      expect(content.type).toBe("cookieConsent");
      expect(content.title).toBe("Cookie Consent");
      expect(content.message).toContain("cookies");
      expect(content.buttons).toHaveLength(2);
    });

    it("returns Arabic cookie consent content", () => {
      const content = getPopupContent("cookieConsent", "ar");
      expect(content.title).toBe("الموافقة على ملفات تعريف الارتباط");
      expect(content.message).toContain("ملفات تعريف الارتباط");
    });

    it("returns Hebrew cookie consent content", () => {
      const content = getPopupContent("cookieConsent", "he");
      expect(content.title).toBe("הסכמה לעוגיות");
      expect(content.message).toContain("עוגיות");
    });
  });

  describe("Exit intent modal content", () => {
    it("returns exit intent content with three buttons", () => {
      const content = getPopupContent("exitIntent", "en");
      expect(content.type).toBe("exitIntent");
      expect(content.title).toBe("Wait! Don't Go Yet");
      expect(content.buttons).toHaveLength(3);
    });

    it("returns Arabic exit intent content", () => {
      const content = getPopupContent("exitIntent", "ar");
      expect(content.title).toBe("انتظر! لا تغادر بعد");
    });
  });

  describe("Promotional modal content", () => {
    it("returns promotional content with offer message", () => {
      const content = getPopupContent("promotional", "en");
      expect(content.type).toBe("promotional");
      expect(content.title).toBe("Special Offer");
      expect(content.message).toContain("20% off");
    });

    it("returns Hebrew promotional content", () => {
      const content = getPopupContent("promotional", "he");
      expect(content.title).toBe("הצעה מיוחדת");
      expect(content.message).toContain("20%");
    });
  });

  describe("Age verification modal content", () => {
    it("returns age verification content in English", () => {
      const content = getPopupContent("ageVerification", "en");
      expect(content.type).toBe("ageVerification");
      expect(content.title).toBe("Age Verification");
      expect(content.message).toContain("18 years");
    });

    it("returns Arabic age verification content", () => {
      const content = getPopupContent("ageVerification", "ar");
      expect(content.title).toBe("التحقق من العمر");
      expect(content.message).toContain("18 عاماً");
    });
  });

  describe("Locale fallback", () => {
    it("falls back to English for unknown locale", () => {
      const content = getPopupContent("welcome", "unknown");
      expect(content.title).toBe("Welcome!");
      expect(content.buttons[0].label).toBe("Accept");
    });

    it("handles locale with region code", () => {
      const content = getPopupContent("welcome", "ar-SA");
      expect(content.title).toBe("أهلاً وسهلاً!");
    });
  });
});

describe("Utility functions", () => {
  describe("getPopupLabelKeys", () => {
    it("returns all 10 popup label keys", () => {
      const keys = getPopupLabelKeys();
      expect(keys).toHaveLength(10);
      expect(keys).toContain("close");
      expect(keys).toContain("accept");
      expect(keys).toContain("decline");
      expect(keys).toContain("confirm");
      expect(keys).toContain("cancel");
    });
  });

  describe("getModalTypes", () => {
    it("returns all 5 modal types", () => {
      const types = getModalTypes();
      expect(types).toHaveLength(5);
      expect(types).toContain("welcome");
      expect(types).toContain("exitIntent");
      expect(types).toContain("promotional");
      expect(types).toContain("cookieConsent");
      expect(types).toContain("ageVerification");
    });
  });

  describe("requiresConfirmation", () => {
    it("returns true for ageVerification", () => {
      expect(requiresConfirmation("ageVerification")).toBe(true);
    });

    it("returns true for cookieConsent", () => {
      expect(requiresConfirmation("cookieConsent")).toBe(true);
    });

    it("returns false for welcome", () => {
      expect(requiresConfirmation("welcome")).toBe(false);
    });

    it("returns false for exitIntent", () => {
      expect(requiresConfirmation("exitIntent")).toBe(false);
    });

    it("returns false for promotional", () => {
      expect(requiresConfirmation("promotional")).toBe(false);
    });
  });

  describe("getPopupDirection", () => {
    it('returns "rtl" for Arabic locale', () => {
      expect(getPopupDirection("ar")).toBe("rtl");
    });

    it('returns "rtl" for Arabic locale with region', () => {
      expect(getPopupDirection("ar-SA")).toBe("rtl");
    });

    it('returns "rtl" for Hebrew locale', () => {
      expect(getPopupDirection("he")).toBe("rtl");
    });

    it('returns "rtl" for Hebrew locale with region', () => {
      expect(getPopupDirection("he-IL")).toBe("rtl");
    });

    it('returns "ltr" for English locale', () => {
      expect(getPopupDirection("en")).toBe("ltr");
    });

    it('returns "ltr" for unknown locale', () => {
      expect(getPopupDirection("unknown")).toBe("ltr");
    });

    it('returns "ltr" for French locale', () => {
      expect(getPopupDirection("fr")).toBe("ltr");
    });
  });
});

describe("Type exports", () => {
  it("exports PopupLabelKey type", () => {
    const key: PopupLabelKey = "close";
    expect(typeof key).toBe("string");
  });

  it("exports ModalType type", () => {
    const type: ModalType = "welcome";
    expect(typeof type).toBe("string");
  });

  it("exports ModalButton interface", () => {
    const button: ModalButton = {
      key: "close",
      label: "Close",
      variant: "primary",
    };
    expect(button.key).toBe("close");
    expect(button.variant).toBe("primary");
  });
});
