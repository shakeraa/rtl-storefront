import { generateRTLCSS, type RtlCssGeneratorOptions } from "./rtl/css-generator";
import { isRTLLanguage } from "../utils/rtl";

export interface TransformThemeCssOptions extends RtlCssGeneratorOptions {
  locale: string;
  baseCss?: string;
}

export function transformThemeCss(options: TransformThemeCssOptions): string {
  if (!isRTLLanguage(options.locale) && options.mode !== "mixed") {
    return options.baseCss?.trim() ?? "";
  }

  const flippedCss = options.baseCss ? flipThemeCss(options.baseCss) : "";
  const generatedCss = generateRTLCSS(options);

  return [flippedCss, generatedCss].filter(Boolean).join("\n\n");
}

export function flipThemeCss(css: string): string {
  return css
    .replace(/\bmargin-left\b/g, "__tmp-margin-left__")
    .replace(/\bmargin-right\b/g, "margin-left")
    .replace(/__tmp-margin-left__/g, "margin-right")
    .replace(/\bpadding-left\b/g, "__tmp-padding-left__")
    .replace(/\bpadding-right\b/g, "padding-left")
    .replace(/__tmp-padding-left__/g, "padding-right")
    .replace(/\bborder-left\b/g, "__tmp-border-left__")
    .replace(/\bborder-right\b/g, "border-left")
    .replace(/__tmp-border-left__/g, "border-right")
    .replace(/(^|[\s{;])left(?=\s*:)/gm, "$1__tmp-left-property__")
    .replace(/(^|[\s{;])right(?=\s*:)/gm, "$1left")
    .replace(/__tmp-left-property__/g, "right")
    .replace(/text-align:\s*left/g, "text-align: __tmp-right__")
    .replace(/text-align:\s*right/g, "text-align: left")
    .replace(/text-align:\s*__tmp-right__/g, "text-align: right")
    .replace(/float:\s*left/g, "float: __tmp-right__")
    .replace(/float:\s*right/g, "float: left")
    .replace(/float:\s*__tmp-right__/g, "float: right")
    .replace(/clear:\s*left/g, "clear: __tmp-right__")
    .replace(/clear:\s*right/g, "clear: left")
    .replace(/clear:\s*__tmp-right__/g, "clear: right");
}
