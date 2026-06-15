"use client";

import { z } from "zod";

import type { PropertyCreateFormState } from "@properties/components/create/types";

type PropertiesTranslationFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;

const exteriorInteriorPattern = /^[A-Za-z0-9#-]{1,8}$/;
const lotAreaPattern = /^\d+(\.\d+)?$/;
const postalCodePattern = /^\d{1,5}$/;

export function createLocationSectionSchema(t: PropertiesTranslationFn) {
  return z.object({
    cityId: z.number().int().positive(t("create.validation.location.cityRequired")),
    countryId: z
      .number()
      .int()
      .positive(t("create.validation.location.countryRequired")),
    exteriorNumber: z
      .string()
      .trim()
      .min(1, t("create.validation.location.exteriorNumberRequired"))
      .regex(
        exteriorInteriorPattern,
        t("create.validation.location.exteriorNumberInvalid"),
      ),
    interiorNumber: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (value) =>
          !value || value === "" || exteriorInteriorPattern.test(value),
        t("create.validation.location.interiorNumberInvalid"),
      ),
    lotArea: z
      .string()
      .trim()
      .min(1, t("create.validation.location.lotAreaRequired"))
      .regex(lotAreaPattern, t("create.validation.location.lotAreaInvalid")),
    neighborhood: z
      .string()
      .trim()
      .min(1, t("create.validation.location.neighborhoodRequired"))
      .max(60, t("create.validation.location.neighborhoodMaxLength")),
    orientationId: z
      .number()
      .int()
      .positive(t("create.validation.location.orientationRequired")),
    postalCode: z
      .string()
      .trim()
      .min(1, t("create.validation.location.postalCodeRequired"))
      .regex(postalCodePattern, t("create.validation.location.postalCodeInvalid")),
    stateId: z.number().int().positive(t("create.validation.location.stateRequired")),
    street: z
      .string()
      .trim()
      .min(1, t("create.validation.location.streetRequired"))
      .max(120, t("create.validation.location.streetMaxLength")),
  });
}

export function validateLocationSection(
  form: PropertyCreateFormState,
  t: PropertiesTranslationFn,
) {
  return createLocationSectionSchema(t).safeParse({
    cityId: form.cityId ?? undefined,
    countryId: form.countryId ?? undefined,
    exteriorNumber: form.exteriorNumber,
    interiorNumber: form.interiorNumber,
    lotArea: form.lotArea,
    neighborhood: form.neighborhood,
    orientationId: form.orientationId ?? undefined,
    postalCode: form.postalCode,
    stateId: form.stateId ?? undefined,
    street: form.street,
  });
}
