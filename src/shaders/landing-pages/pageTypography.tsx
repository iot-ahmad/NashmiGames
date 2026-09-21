import type { CSSProperties } from "react";

export type LandingPageCustomization = {
  cssText?: string;
  postMessage?: Record<string, unknown>;
};

export type PageTypographyProps = {
  fontFamily?: string;
  headingFontFamily?: string;
  bodyFontFamily?: string;
  accentColor?: string;
  style?: CSSProperties;
};

export function splitTypographyProps<T extends PageTypographyProps>(
  props: T,
): [PageTypographyProps, Omit<T, keyof PageTypographyProps>] {
  const {
    fontFamily,
    headingFontFamily,
    bodyFontFamily,
    accentColor,
    style,
    ...rest
  } = props;
  return [
    { fontFamily, headingFontFamily, bodyFontFamily, accentColor, style },
    rest as Omit<T, keyof PageTypographyProps>,
  ];
}

export function usePageTypography(
  _recipe: unknown,
  overrides: PageTypographyProps,
): LandingPageCustomization | undefined {
  if (
    !overrides.fontFamily &&
    !overrides.headingFontFamily &&
    !overrides.bodyFontFamily &&
    !overrides.accentColor &&
    !overrides.style
  ) {
    return undefined;
  }
  const rules: string[] = [];
  if (overrides.fontFamily) {
    rules.push(`:root { --threeui-font: ${overrides.fontFamily}; }`);
  }
  if (overrides.headingFontFamily) {
    rules.push(`:root { --threeui-heading-font: ${overrides.headingFontFamily}; }`);
  }
  if (overrides.bodyFontFamily) {
    rules.push(`:root { --threeui-body-font: ${overrides.bodyFontFamily}; }`);
  }
  if (overrides.accentColor) {
    rules.push(`:root { --threeui-accent: ${overrides.accentColor}; }`);
  }
  return rules.length ? { cssText: rules.join("\n") } : undefined;
}

const CUSTOMIZATION_STYLE_ID = "threeui-page-customization";

export function applyPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization,
) {
  const document = frame?.contentDocument;
  if (!document) return;

  document.getElementById(CUSTOMIZATION_STYLE_ID)?.remove();
  if (!customization?.cssText) return;

  const style = document.createElement("style");
  style.id = CUSTOMIZATION_STYLE_ID;
  style.textContent = customization.cssText;
  document.head.appendChild(style);
}

export function postPageCustomization(
  frame: HTMLIFrameElement | null,
  customization?: LandingPageCustomization,
) {
  if (!customization?.postMessage || !frame?.contentWindow) return;
  frame.contentWindow.postMessage(
    { type: "threeui-page-customization", ...customization.postMessage },
    "*",
  );
}
