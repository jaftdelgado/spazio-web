"use client";

import { z } from "zod";

import type { PropertyCreateFormState } from "@properties/components/create/types";

type PropertiesTranslationFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;

const exteriorInteriorPattern = /^[A-Za-z0-9#-]{1,8}$/;
const postalCodePattern = /^\d{1,5}$/;

function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

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
    isPublicAddress: z.boolean(),
    latitude: z
      .number()
      .refine(isValidLatitude, t("create.validation.location.latitudeInvalid")),
    longitude: z
      .number()
      .refine(isValidLongitude, t("create.validation.location.longitudeInvalid")),
    neighborhood: z
      .string()
      .trim()
      .min(1, t("create.validation.location.neighborhoodRequired"))
      .max(60, t("create.validation.location.neighborhoodMaxLength")),
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
    isPublicAddress: form.isPublicAddress,
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    neighborhood: form.neighborhood,
    postalCode: form.postalCode,
    stateId: form.stateId ?? undefined,
    street: form.street,
  });
}
