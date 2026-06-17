"use client";

import { useMemo } from "react";
import { useAppLocale } from "@/app/i18n/useAppLocale";
import es from "./es.json";
import en from "./en.json";

const translations = {
  es,
  en,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKeys = NestedKeyOf<typeof es>;

function getNestedValue(obj: unknown, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((accumulator, part) => {
    if (typeof accumulator !== "object" || accumulator === null) {
      return undefined;
    }

    return (accumulator as Record<string, unknown>)[part];
  }, obj);

  return typeof value === "string" ? value : undefined;
}

export function useVisitsTranslation() {
  const { locale } = useAppLocale();

  const t = useMemo(() => {
    const dictionary = translations[locale as keyof typeof translations] || translations.es;

    return (key: TranslationKeys, params?: Record<string, string>) => {
      let text = getNestedValue(dictionary, key) || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{{${k}}}`, v);
        });
      }
      return text;
    };
  }, [locale]);

  return { t };
}
