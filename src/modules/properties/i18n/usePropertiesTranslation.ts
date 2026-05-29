"use client";

import { useTranslation } from "react-i18next";

import { normalizeLocale, toIntlLocale } from "@/app/i18n/config";

export function usePropertiesTranslation() {
  const translation = useTranslation("properties");
  const locale = normalizeLocale(translation.i18n.resolvedLanguage);

  return {
    ...translation,
    locale,
    intlLocale: toIntlLocale(locale),
  };
}
