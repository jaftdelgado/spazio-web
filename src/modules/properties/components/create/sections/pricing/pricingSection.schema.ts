"use client";

import { z } from "zod";

import type { PropertyCreateFormState } from "@properties/components/create/types";

type PropertiesTranslationFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export type PricingMode = "sale" | "rent" | "mixed" | null;

function isFilledPrice(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return false;
  }

  const numericValue = Number(trimmed);

  return Number.isFinite(numericValue) && numericValue > 0;
}

export function resolvePricingMode(modalityName?: string | null): PricingMode {
  const normalizedName = modalityName?.trim().toLowerCase() ?? "";

  if (normalizedName === "sale" || normalizedName === "venta") {
    return "sale";
  }

  if (normalizedName === "rent" || normalizedName === "renta") {
    return "rent";
  }

  if (normalizedName === "mixed" || normalizedName === "mixta") {
    return "mixed";
  }

  return null;
}

export function createPricingSectionSchema(
  pricingMode: PricingMode,
  t: PropertiesTranslationFn,
) {
  return z
    .object({
      enabledRentPeriodIds: z.array(z.number().int().positive()),
      rentPricesByPeriod: z.record(z.string(), z.string()),
      salePrice: z.string(),
    })
    .superRefine((value, ctx) => {
      if (pricingMode === "sale" || pricingMode === "mixed") {
        if (!isFilledPrice(value.salePrice)) {
          ctx.addIssue({
            code: "custom",
            message: t("create.validation.pricing.salePriceRequired"),
            path: ["salePrice"],
          });
        }
      }

      if (pricingMode === "rent" || pricingMode === "mixed") {
        if (value.enabledRentPeriodIds.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: t("create.validation.pricing.rentPeriodRequired"),
            path: ["enabledRentPeriodIds"],
          });
          return;
        }

        for (const periodId of value.enabledRentPeriodIds) {
          const periodKey = String(periodId);
          const periodPrice = value.rentPricesByPeriod[periodKey] ?? "";

          if (!isFilledPrice(periodPrice)) {
            ctx.addIssue({
              code: "custom",
              message: t("create.validation.pricing.rentPriceRequired"),
              path: ["rentPricesByPeriod", periodKey],
            });
          }
        }
      }
    });
}

export function validatePricingSection(
  form: PropertyCreateFormState,
  pricingMode: PricingMode,
  t: PropertiesTranslationFn,
) {
  return createPricingSectionSchema(pricingMode, t).safeParse({
    enabledRentPeriodIds: form.enabledRentPeriodIds,
    rentPricesByPeriod: form.rentPricesByPeriod,
    salePrice: form.salePrice,
  });
}
