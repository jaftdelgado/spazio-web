"use client";

import { useTranslation } from "react-i18next";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  normalizeLocale,
  type AppLocale,
} from "./config";
import { persistLocale } from "./i18n";

export function useAppLocale() {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.resolvedLanguage ?? DEFAULT_LOCALE);

  return {
    locale,
    supportedLocales: SUPPORTED_LOCALES,
    async changeLocale(nextLocale: AppLocale) {
      await i18n.changeLanguage(nextLocale);
      persistLocale(nextLocale);
      document.documentElement.lang = nextLocale;
    },
  };
}
