export const SUPPORTED_LOCALES = ["es", "en"] as const;
export const APP_NAMESPACES = [
  "app",
  "properties",
  "users",
  "clauses",
  "payments",
  "contracts",
] as const;
export const DEFAULT_LOCALE = "es";
export const APP_LOCALE_STORAGE_KEY = "spazio.locale";

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export type AppNamespace = (typeof APP_NAMESPACES)[number];

export function isSupportedLocale(
  value: string | null | undefined,
): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (isSupportedLocale(value)) {
    return value;
  }

  const baseLocale = value?.split("-")[0];

  return isSupportedLocale(baseLocale) ? baseLocale : DEFAULT_LOCALE;
}

export function toIntlLocale(locale: AppLocale) {
  return locale === "en" ? "en-US" : "es-MX";
}
