import type { Resource } from "i18next";

import enApp from "@/app/i18n/locales/en.json";
import esApp from "@/app/i18n/locales/es.json";
import enClauses from "@clauses/i18n/en.json";
import esClauses from "@clauses/i18n/es.json";
import enProperties from "@properties/i18n/en.json";
import esProperties from "@properties/i18n/es.json";
import enPayments from "@payments/i18n/en.json";
import esPayments from "@payments/i18n/es.json";
import enUsers from "@users/i18n/en.json";
import esUsers from "@users/i18n/es.json";
import enContracts from "@contracts/i18n/en.json";
import esContracts from "@contracts/i18n/es.json";

export const appResources: Resource = {
  es: {
    app: esApp,
    clauses: esClauses,
    payments: esPayments,
    properties: esProperties,
    users: esUsers,
    contracts: esContracts,
  },
  en: {
    app: enApp,
    clauses: enClauses,
    payments: enPayments,
    properties: enProperties,
    users: enUsers,
    contracts: enContracts,
  },
};

export async function loadResources(): Promise<Resource> {
  return appResources;
}
