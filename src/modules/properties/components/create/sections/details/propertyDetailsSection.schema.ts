"use client";

import { z } from "zod";

import type { PropertyTypeKind } from "@properties/components/create/propertyTypeKind";
import type { PropertyCreateFormState } from "@properties/components/create/types";

type PropertiesTranslationFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;

const integerPattern = /^\d+$/;
const decimalPattern = /^\d+(\.\d{1,2})?$/;

function requiredIntegerField(
  errorRequired: string,
  errorInvalid: string,
  minimum = 0,
) {
  return z
    .string()
    .trim()
    .min(1, errorRequired)
    .regex(integerPattern, errorInvalid)
    .refine((value) => Number(value) >= minimum, errorInvalid);
}

function requiredDecimalField(
  errorRequired: string,
  errorInvalid: string,
  minimum = 0,
) {
  return z
    .string()
    .trim()
    .min(1, errorRequired)
    .regex(decimalPattern, errorInvalid)
    .refine((value) => Number(value) >= minimum, errorInvalid);
}

export function createPropertyDetailsSectionSchema(
  propertyTypeKind: PropertyTypeKind,
  t: PropertiesTranslationFn,
) {
  return z
    .object({
      bathrooms: z.string(),
      bedrooms: z.string(),
      beds: z.string(),
      builtArea: z.string(),
      ceilingHeight: z.string(),
      constructionYear: z.string(),
      floors: z.string(),
      internalOffices: z.string(),
      isFurnished: z.boolean(),
      landUse: z.string(),
      lotArea: z.string(),
      loadingDocks: z.string(),
      orientationId: z.number().int().positive().optional(),
      parkingSpots: z.string(),
      threePhasePower: z.boolean(),
    })
    .superRefine((value, ctx) => {
      if (propertyTypeKind === "residential") {
        const schema = z.object({
          bathrooms: requiredIntegerField(
            t("create.validation.details.bathroomsRequired"),
            t("create.validation.details.bathroomsInvalid"),
          ),
          bedrooms: requiredIntegerField(
            t("create.validation.details.bedroomsRequired"),
            t("create.validation.details.bedroomsInvalid"),
          ),
          beds: requiredIntegerField(
            t("create.validation.details.bedsRequired"),
            t("create.validation.details.bedsInvalid"),
          ),
          lotArea: requiredDecimalField(
            t("create.validation.details.lotAreaRequired"),
            t("create.validation.details.lotAreaInvalid"),
            0.01,
          ),
          builtArea: requiredDecimalField(
            t("create.validation.details.builtAreaRequired"),
            t("create.validation.details.builtAreaInvalid"),
            0.01,
          ),
          constructionYear: requiredIntegerField(
            t("create.validation.details.constructionYearRequired"),
            t("create.validation.details.constructionYearInvalid"),
            1,
          ),
          floors: requiredIntegerField(
            t("create.validation.details.floorsRequired"),
            t("create.validation.details.floorsInvalid"),
          ),
          orientationId: z
            .number()
            .int()
            .positive(t("create.validation.details.orientationRequired")),
          parkingSpots: requiredIntegerField(
            t("create.validation.details.parkingSpotsRequired"),
            t("create.validation.details.parkingSpotsInvalid"),
          ),
        });

        const result = schema.safeParse({
          bathrooms: value.bathrooms,
          bedrooms: value.bedrooms,
          beds: value.beds,
          lotArea: value.lotArea,
          builtArea: value.builtArea,
          constructionYear: value.constructionYear,
          floors: value.floors,
          orientationId: value.orientationId,
          parkingSpots: value.parkingSpots,
        });

        if (!result.success) {
          result.error.issues.forEach((issue) =>
            ctx.addIssue({
              code: "custom",
              message: issue.message,
              path: issue.path,
            }),
          );
        }

        if (
          result.success &&
          Number(value.builtArea) > Number(value.lotArea)
        ) {
          ctx.addIssue({
            code: "custom",
            message: t("create.validation.details.builtAreaExceedsLotArea"),
            path: ["builtArea"],
          });
        }
      }

      if (propertyTypeKind === "commercial") {
        const schema = z.object({
          ceilingHeight: requiredDecimalField(
            t("create.validation.details.ceilingHeightRequired"),
            t("create.validation.details.ceilingHeightInvalid"),
            0.01,
          ),
          internalOffices: requiredIntegerField(
            t("create.validation.details.internalOfficesRequired"),
            t("create.validation.details.internalOfficesInvalid"),
          ),
          landUse: z
            .string()
            .trim()
            .min(1, t("create.validation.details.landUseRequired"))
            .max(100, t("create.validation.details.landUseMaxLength")),
          lotArea: requiredDecimalField(
            t("create.validation.details.lotAreaRequired"),
            t("create.validation.details.lotAreaInvalid"),
            0.01,
          ),
          loadingDocks: requiredIntegerField(
            t("create.validation.details.loadingDocksRequired"),
            t("create.validation.details.loadingDocksInvalid"),
          ),
        });

        const result = schema.safeParse({
          ceilingHeight: value.ceilingHeight,
          internalOffices: value.internalOffices,
          landUse: value.landUse,
          lotArea: value.lotArea,
          loadingDocks: value.loadingDocks,
        });

        if (!result.success) {
          result.error.issues.forEach((issue) =>
            ctx.addIssue({
              code: "custom",
              message: issue.message,
              path: issue.path,
            }),
          );
        }
      }
    });
}

export function validatePropertyDetailsSection(
  form: PropertyCreateFormState,
  propertyTypeKind: PropertyTypeKind,
  t: PropertiesTranslationFn,
) {
  return createPropertyDetailsSectionSchema(propertyTypeKind, t).safeParse({
    bathrooms: form.bathrooms,
    bedrooms: form.bedrooms,
    beds: form.beds,
    builtArea: form.builtArea,
    ceilingHeight: form.ceilingHeight,
    constructionYear: form.constructionYear,
    floors: form.floors,
    internalOffices: form.internalOffices,
    isFurnished: form.isFurnished,
    landUse: form.landUse,
    lotArea: form.lotArea,
    loadingDocks: form.loadingDocks,
    orientationId: form.orientationId ?? undefined,
    parkingSpots: form.parkingSpots,
    threePhasePower: form.threePhasePower,
  });
}
