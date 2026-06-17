"use client";

import type { TFunction } from "i18next";

import type { Clause } from "@clauses/domain/clause.entity";
import type {
  PropertyClause,
  PropertyLocation,
  PropertyPrices,
} from "@properties/domain/property.entity";

export function formatPropertyCurrency(
  amount: number,
  currency: string,
  locale: string,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPropertyArea(
  value: number | null | undefined,
  locale: string,
) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${new Intl.NumberFormat(locale).format(value)} m2`;
}

export function formatPropertyAddress(location: PropertyLocation | null) {
  if (!location) {
    return "";
  }

  const streetLine = [location.street, location.exteriorNumber]
    .filter(Boolean)
    .join(" ");
  const localityLine = [
    location.neighborhood,
    location.cityName,
    location.stateName,
    location.countryName,
  ]
    .filter(Boolean)
    .join(", ");

  return [streetLine, localityLine].filter(Boolean).join(", ");
}

export function formatPriceSummary(
  prices: PropertyPrices,
  locale: string,
  t: TFunction<"properties">,
  rentPeriodNamesById: Map<number, string>,
) {
  const items: { label: string; value: string; note?: string }[] = [];

  if (prices.salePrice) {
    items.push({
      label: t("show.pricing.sale"),
      value: formatPropertyCurrency(
        prices.salePrice.salePrice,
        prices.salePrice.currency,
        locale,
      ),
      note: prices.salePrice.isNegotiable ? t("show.pricing.negotiable") : undefined,
    });
  }

  for (const rentPrice of prices.rentPrices) {
    const periodName =
      rentPeriodNamesById.get(rentPrice.periodId) ?? t("show.pricing.rentPeriod");
    const noteParts = [
      rentPrice.deposit !== null
        ? `${t("show.pricing.deposit")} ${formatPropertyCurrency(
            rentPrice.deposit,
            rentPrice.currency,
            locale,
          )}`
        : null,
      rentPrice.isNegotiable ? t("show.pricing.negotiable") : null,
    ].filter(Boolean);

    items.push({
      label: `${t("show.pricing.rent")} · ${periodName}`,
      value: formatPropertyCurrency(
        rentPrice.rentPrice,
        rentPrice.currency,
        locale,
      ),
      note: noteParts.length > 0 ? noteParts.join(" · ") : undefined,
    });
  }

  return items;
}

export function formatClauseValue(
  clause: PropertyClause,
  definition: Clause | null,
  t: TFunction<"properties">,
) {
  const valueType = definition?.valueType.code;

  if (valueType === "boolean") {
    return clause.booleanValue ? t("show.values.yes") : t("show.values.no");
  }

  if (valueType === "integer") {
    return clause.integerValue?.toString() ?? t("show.values.notAvailable");
  }

  if (valueType === "range") {
    const range = [clause.minValue, clause.maxValue].filter(
      (value) => value !== null && value !== undefined,
    );

    if (range.length === 2) {
      return `${clause.minValue} - ${clause.maxValue}`;
    }

    if (clause.minValue !== null && clause.minValue !== undefined) {
      return `${t("show.values.from")} ${clause.minValue}`;
    }

    if (clause.maxValue !== null && clause.maxValue !== undefined) {
      return `${t("show.values.to")} ${clause.maxValue}`;
    }
  }

  if (clause.booleanValue !== null) {
    return clause.booleanValue ? t("show.values.yes") : t("show.values.no");
  }

  if (clause.integerValue !== null) {
    return clause.integerValue.toString();
  }

  if (clause.minValue !== null || clause.maxValue !== null) {
    const min = clause.minValue ?? t("show.values.notAvailable");
    const max = clause.maxValue ?? t("show.values.notAvailable");

    return `${min} - ${max}`;
  }

  return t("show.values.notAvailable");
}
