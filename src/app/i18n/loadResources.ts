import type { Resource } from "i18next";

import enApp from "@/app/i18n/locales/en.json";
import esApp from "@/app/i18n/locales/es.json";
import enProperties from "@properties/i18n/en.json";
import esProperties from "@properties/i18n/es.json";

export const appResources: Resource = {
  es: {
    app: esApp,
    properties: esProperties,
  },
  en: {
    app: enApp,
    properties: enProperties,
  },
};

export async function loadResources(): Promise<Resource> {
  return appResources;
}
