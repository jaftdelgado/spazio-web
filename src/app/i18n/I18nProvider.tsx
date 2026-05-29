"use client";

import * as React from "react";

import i18n from "i18next";
import { I18nextProvider } from "react-i18next";

import { DEFAULT_LOCALE } from "./config";
import initI18n, { resolveInitialLocale } from "./i18n";

type I18nProviderProps = {
  children: React.ReactNode;
};

export function I18nProvider({ children }: I18nProviderProps) {
  React.useEffect(() => {
    let isMounted = true;

    void initI18n(resolveInitialLocale()).then((instance) => {
      if (!isMounted) {
        return;
      }

      document.documentElement.lang =
        instance.resolvedLanguage ?? DEFAULT_LOCALE;
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
