import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  APP_LOCALE_STORAGE_KEY,
  APP_NAMESPACES,
  DEFAULT_LOCALE,
  normalizeLocale,
  type AppLocale,
} from "./config";
import { appResources, loadResources } from "./loadResources";

let i18nInitPromise: Promise<typeof i18n> | null = null;

function ensureI18nInitialized(locale: AppLocale) {
  if (i18n.isInitialized) {
    return i18n;
  }

  i18n.use(initReactI18next).init({
    resources: appResources,
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    ns: [...APP_NAMESPACES],
    defaultNS: "app",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
}

async function initI18n(locale: AppLocale = DEFAULT_LOCALE) {
  const normalizedLocale = normalizeLocale(locale);
  ensureI18nInitialized(normalizedLocale);

  if (!i18nInitPromise) {
    i18nInitPromise = (async () => {
      await loadResources();
      return i18n;
    })();
  }

  const instance = await i18nInitPromise;

  if (instance.resolvedLanguage !== normalizedLocale) {
    await instance.changeLanguage(normalizedLocale);
  }

  return instance;
}

export function getStoredLocale() {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizeLocale(window.localStorage.getItem(APP_LOCALE_STORAGE_KEY));
}

export function resolveInitialLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const storedLocale = window.localStorage.getItem(APP_LOCALE_STORAGE_KEY);

  if (storedLocale) {
    return normalizeLocale(storedLocale);
  }

  return normalizeLocale(window.navigator.language);
}

export function persistLocale(locale: AppLocale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, locale);
}

ensureI18nInitialized(DEFAULT_LOCALE);

export default initI18n;
