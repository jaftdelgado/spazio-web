"use client";

import { useCallback, useMemo } from "react";
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
  const changeLocale = useCallback(
    async (nextLocale: AppLocale) => {
      document.documentElement.lang = nextLocale;
      persistLocale(nextLocale);
      await i18n.changeLanguage(nextLocale);
    },
    [i18n],
  );

  return useMemo(
    () => ({
      locale,
      supportedLocales: SUPPORTED_LOCALES,
      changeLocale,
    }),
    [changeLocale, locale],
  );
}
