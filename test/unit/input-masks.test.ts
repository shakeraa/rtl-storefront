import { describe, expect, it } from "vitest";

import {
  applyInputMask,
  getInputMasks,
  normalizeMaskedInput,
} from "../../app/services/input-masks";

describe("input mask service", () => {
  it("returns locale-specific masks", () => {
    expect(getInputMasks("ar")).toEqual([
      { field: "phone", mask: "+966 ## ### ####", placeholder: "+966 55 123 4567" },
      { field: "postalCode", mask: "#####", placeholder: "11564" },
      { field: "taxId", mask: "3##########3", placeholder: "310123456700003" },
    ]);
  });

  it("applies digit masks to raw input", () => {
    expect(applyInputMask("5551234567", "(###) ###-####")).toBe("(555) 123-4567");
    expect(applyInputMask("551234567", "+966 ## ### ####")).toBe("+966 55 123 4567");
  });

  it("normalizes masked values for storage", () => {
    expect(normalizeMaskedInput("(555) 123-4567")).toBe("5551234567");
    expect(normalizeMaskedInput("+966 55 123 4567")).toBe("966551234567");
  });
});
