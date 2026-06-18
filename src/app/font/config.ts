export const APP_FONT_STORAGE_KEY = "spazio.font";

export const SUPPORTED_FONTS = ["default", "dyslexic"] as const;

export type AppFont = (typeof SUPPORTED_FONTS)[number];

export function isSupportedFont(
  value: string | null | undefined,
): value is AppFont {
  return SUPPORTED_FONTS.includes(value as AppFont);
}

export function normalizeFont(value: string | null | undefined): AppFont {
  return isSupportedFont(value) ? value : "default";
}
