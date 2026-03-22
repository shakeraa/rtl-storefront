export type RtlComponentType =
  | "slider"
  | "carousel"
  | "menu"
  | "mega-menu"
  | "checkout"
  | "gallery";

export interface ComponentTransformRule {
  component: RtlComponentType;
  selectors: string[];
  declarations: Record<string, string>;
}

const COMPONENT_RULES: Record<RtlComponentType, ComponentTransformRule> = {
  slider: {
    component: "slider",
    selectors: ['[data-rtl-component="slider"]', ".rtl-slider"],
    declarations: {
      direction: "rtl",
      "flex-direction": "row-reverse",
      "transform-origin": "right center",
    },
  },
  carousel: {
    component: "carousel",
    selectors: ['[data-rtl-component="carousel"]', ".rtl-carousel"],
    declarations: {
      direction: "rtl",
      "flex-direction": "row-reverse",
      "scroll-snap-type": "inline mandatory",
    },
  },
  menu: {
    component: "menu",
    selectors: ['[data-rtl-component="menu"]', ".rtl-menu"],
    declarations: {
      direction: "rtl",
      "text-align": "right",
      "justify-content": "flex-end",
    },
  },
  "mega-menu": {
    component: "mega-menu",
    selectors: ['[data-rtl-component="mega-menu"]', ".rtl-mega-menu"],
    declarations: {
      direction: "rtl",
      "text-align": "right",
      right: "0",
      left: "auto",
    },
  },
  checkout: {
    component: "checkout",
    selectors: ['[data-rtl-component="checkout"]', ".rtl-checkout"],
    declarations: {
      direction: "rtl",
      "text-align": "right",
      "unicode-bidi": "isolate",
    },
  },
  gallery: {
    component: "gallery",
    selectors: ['[data-rtl-component="gallery"]', ".rtl-gallery"],
    declarations: {
      direction: "rtl",
      "justify-content": "flex-end",
      "text-align": "right",
    },
  },
};

export function getComponentTransformRule(component: RtlComponentType) {
  return COMPONENT_RULES[component];
}

export function getComponentTransformRules(
  components: RtlComponentType[] = Object.keys(COMPONENT_RULES) as RtlComponentType[],
): ComponentTransformRule[] {
  return components.map((component) => COMPONENT_RULES[component]);
}
