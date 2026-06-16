"use client";

import { z } from "zod";

import type { PropertyCreateFormState } from "@properties/components/create/types";

type PropertiesTranslationFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;

export function createGeneralSectionSchema(t: PropertiesTranslationFn) {
  return z.object({
    description: z.string().nullable().optional(),
    modalityId: z
      .number()
      .int()
      .positive(t("create.validation.general.modalityRequired")),
    propertyTypeId: z
      .number()
      .int()
      .positive(t("create.validation.general.propertyTypeRequired")),
    title: z
      .string()
      .trim()
      .min(1, t("create.validation.general.titleRequired"))
      .max(128, t("create.validation.general.titleMaxLength")),
  });
}

export function validateGeneralSection(
  form: PropertyCreateFormState,
  t: PropertiesTranslationFn,
) {
  return createGeneralSectionSchema(t).safeParse({
    description: form.description.trim() === "" ? null : form.description,
    modalityId: form.modalityId ?? undefined,
    propertyTypeId: form.propertyTypeId ?? undefined,
    title: form.title,
  });
}
