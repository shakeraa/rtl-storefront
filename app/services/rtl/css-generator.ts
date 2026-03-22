import {
  getComponentTransformRules,
  type ComponentTransformRule,
  type RtlComponentType,
} from "./component-mapper";

export interface RtlCssGeneratorOptions {
  scopeSelector?: string;
  mode?: "single" | "mixed";
  components?: RtlComponentType[];
  customOverrides?: string;
}

export function generateRTLCSS(options: RtlCssGeneratorOptions = {}): string {
  const scopeSelector = options.scopeSelector ?? 'html[dir="rtl"]';
  const mode = options.mode ?? "single";
  const rules = getComponentTransformRules(options.components);

  return [
    generateRootRules(scopeSelector),
    mode === "mixed" ? generateMixedDirectionCSS(scopeSelector) : "",
    ...rules.map((rule) => generateRuleBlock(scopeSelector, rule)),
    options.customOverrides?.trim() ? options.customOverrides.trim() : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function generateRuleBlock(
  scopeSelector: string,
  rule: ComponentTransformRule,
): string {
  const selectors = rule.selectors
    .map((selector) => `${scopeSelector} ${selector}`)
    .join(",\n");
  const declarations = Object.entries(rule.declarations)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");

  return `${selectors} {\n${declarations}\n}`;
}

export function generateMixedDirectionCSS(scopeSelector: string): string {
  return [
    `${scopeSelector} [dir="ltr"],`,
    `${scopeSelector} [lang|="en"],`,
    `${scopeSelector} [lang|="fr"],`,
    `${scopeSelector} [lang|="de"] {`,
    "  direction: ltr;",
    "  text-align: left;",
    "  unicode-bidi: isolate;",
    "}",
    "",
    `${scopeSelector} [dir="rtl"] {`,
    "  direction: rtl;",
    "  text-align: right;",
    "  unicode-bidi: isolate;",
    "}",
  ].join("\n");
}

function generateRootRules(scopeSelector: string): string {
  return [
    `${scopeSelector} body,`,
    `${scopeSelector} .app-shell,`,
    `${scopeSelector} .rtl-surface {`,
    "  direction: rtl;",
    "  text-align: right;",
    "}",
    "",
    `${scopeSelector} .rtl-inline-reverse {`,
    "  display: inline-flex;",
    "  flex-direction: row-reverse;",
    "}",
    "",
    `${scopeSelector} .rtl-block-reverse {`,
    "  display: flex;",
    "  flex-direction: column-reverse;",
    "}",
  ].join("\n");
}
