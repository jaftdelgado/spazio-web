export const APP_THEME_STORAGE_KEY = "spazio.theme";

export const SUPPORTED_THEMES = ["system", "light", "dark"] as const;

export type AppTheme = (typeof SUPPORTED_THEMES)[number];

export function isSupportedTheme(
  value: string | null | undefined,
): value is AppTheme {
  return SUPPORTED_THEMES.includes(value as AppTheme);
}

export function normalizeTheme(value: string | null | undefined): AppTheme {
  return isSupportedTheme(value) ? value : "system";
}
