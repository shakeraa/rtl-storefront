import { describe, expect, it } from "vitest";
import { generateRTLCSS } from "../../app/services/rtl/css-generator";
import { getComponentTransformRules } from "../../app/services/rtl/component-mapper";
import { flipThemeCss, transformThemeCss } from "../../app/services/rtl-transformer";

describe("RTL transformer", () => {
  it("maps component-aware rules for sliders, mega-menus, and checkout", () => {
    const rules = getComponentTransformRules(["slider", "mega-menu", "checkout"]);

    expect(rules).toHaveLength(3);
    expect(rules[0]?.selectors).toContain('[data-rtl-component="slider"]');
    expect(rules[1]?.declarations.right).toBe("0");
    expect(rules[2]?.declarations["unicode-bidi"]).toBe("isolate");
  });

  it("generates mixed-direction CSS with component selectors and overrides", () => {
    const css = generateRTLCSS({
      mode: "mixed",
      customOverrides: '.merchant-banner { border-radius: 1rem; }',
    });

    expect(css).toContain('html[dir="rtl"] [data-rtl-component="mega-menu"]');
    expect(css).toContain('[lang|="en"]');
    expect(css).toContain('.merchant-banner { border-radius: 1rem; }');
  });

  it("flips directional CSS properties", () => {
    const css = flipThemeCss(`
      .hero {
        margin-left: 2rem;
        padding-right: 1rem;
        text-align: left;
        left: 0;
      }
    `);

    expect(css).toContain("margin-right: 2rem");
    expect(css).toContain("padding-left: 1rem");
    expect(css).toContain("text-align: right");
    expect(css).toContain("right: 0");
  });

  it("builds a full RTL bundle for RTL locales", () => {
    const css = transformThemeCss({
      locale: "ar",
      baseCss: ".hero { margin-left: 1rem; text-align: left; }",
      customOverrides: ".hero { border-radius: 12px; }",
    });

    expect(css).toContain("margin-right: 1rem");
    expect(css).toContain('html[dir="rtl"] .rtl-menu');
    expect(css).toContain(".hero { border-radius: 12px; }");
  });

  it("returns base CSS unchanged for non-RTL locales without mixed mode", () => {
    const css = transformThemeCss({
      locale: "en",
      baseCss: ".hero { margin-left: 1rem; }",
    });

    expect(css.trim()).toBe(".hero { margin-left: 1rem; }");
  });
});
