"use client";

import { useMemo } from "react";

import { useAppLocale } from "@/app/i18n/useAppLocale";

import en from "./en.json";
import es from "./es.json";

const translations = {
  es,
  en,
};

type ServiceLabelKey = keyof typeof es.labels;

export function useServicesTranslation() {
  const { locale } = useAppLocale();

  const dictionary =
    translations[locale as keyof typeof translations] ?? translations.es;

  const tService = useMemo(
    () => (code: string) => {
      const translation = dictionary.labels[code as ServiceLabelKey];

      if (translation) {
        return translation;
      }

      return code
        .split(/[_-]/g)
        .filter(Boolean)
        .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
        .join(" ");
    },
    [dictionary.labels],
  );

  return { tService };
}
