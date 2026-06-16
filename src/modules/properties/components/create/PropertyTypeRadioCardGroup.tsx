"use client";

import Image from "next/image";

import apartmentIcon from "@catalogs/assets/webp/apartment_icon.webp";
import commercialIcon from "@catalogs/assets/webp/commercial_icon.webp";
import houseIcon from "@catalogs/assets/webp/house_icon.webp";
import { Skeleton } from "@/components/ui/skeleton";
import { usePropertyTypes } from "@catalogs/application/hooks/useCatalogs";
import type { PropertyType } from "@catalogs/domain/catalog.entity";
import { cn } from "@/lib/utils";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

const propertyTypeIconMap = {
  apartment: apartmentIcon,
  "apartment.webp": apartmentIcon,
  "apartment_icon.webp": apartmentIcon,
  commercial: commercialIcon,
  "commercial.webp": commercialIcon,
  "commercial_icon.webp": commercialIcon,
  house: houseIcon,
  "house.webp": houseIcon,
  "house_icon.webp": houseIcon,
} as const;

function getPropertyTypeIcon(propertyType: PropertyType) {
  if (!propertyType.icon) {
    return null;
  }

  const normalizedIconName =
    propertyType.icon.split("/").pop()?.toLowerCase() ?? propertyType.icon;

  return (
    propertyTypeIconMap[
      normalizedIconName as keyof typeof propertyTypeIconMap
    ] ?? null
  );
}

function getPropertyTypeTranslationKey(propertyType: PropertyType) {
  const normalizedIconName =
    propertyType.icon?.split("/").pop()?.toLowerCase() ?? "";

  if (
    normalizedIconName === "house" ||
    normalizedIconName === "house.webp" ||
    normalizedIconName === "house_icon.webp"
  ) {
    return "create.propertyTypes.house";
  }

  if (
    normalizedIconName === "apartment" ||
    normalizedIconName === "apartment.webp" ||
    normalizedIconName === "apartment_icon.webp"
  ) {
    return "create.propertyTypes.apartment";
  }

  if (
    normalizedIconName === "commercial" ||
    normalizedIconName === "commercial.webp" ||
    normalizedIconName === "commercial_icon.webp"
  ) {
    return "create.propertyTypes.commercial";
  }

  return null;
}

export function PropertyTypeRadioCardGroup({
  selectedPropertyTypeId,
  disabled = false,
  onChange,
}: {
  selectedPropertyTypeId: number | null;
  disabled?: boolean;
  onChange: (propertyTypeId: number) => void;
}) {
  const { t } = usePropertiesTranslation();
  const propertyTypesQuery = usePropertyTypes();
  const propertyTypes = propertyTypesQuery.data ?? [];

  return (
    <div className="flex w-full flex-col items-start gap-3">
      <span className="sr-only">
        {t("create.sections.propertyType.label")}
      </span>

      {propertyTypesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-3 py-4"
            >
              <Skeleton className="size-12 rounded-2xl" />
              <Skeleton className="h-4 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      ) : null}

      {!propertyTypesQuery.isLoading ? (
        <div
          aria-label={t("create.sections.propertyType.label")}
          id="property-type-radio-group"
          className="grid gap-3 sm:grid-cols-3"
          role="radiogroup"
        >
          {propertyTypes.map((propertyType) => {
            const isSelected =
              propertyType.propertyTypeId === selectedPropertyTypeId;
            const iconSrc = getPropertyTypeIcon(propertyType);
            const translationKey = getPropertyTypeTranslationKey(propertyType);
            const label = translationKey
              ? t(translationKey, { defaultValue: propertyType.name })
              : propertyType.name;

            return (
              <button
                key={propertyType.propertyTypeId}
                aria-checked={isSelected}
                disabled={disabled}
                className={cn(
                  "flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border px-3 py-4 text-center transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground ring-3 ring-primary/15"
                    : "border-border bg-card text-muted-foreground shadow-sm hover:border-ring/50 hover:bg-muted/50 hover:text-foreground",
                  disabled && "cursor-not-allowed opacity-65 hover:border-border hover:bg-card hover:text-muted-foreground",
                )}
                role="radio"
                type="button"
                onClick={() => onChange(propertyType.propertyTypeId)}
              >
                {iconSrc ? (
                  <Image
                    alt={label}
                    className="h-12 w-auto object-contain"
                    src={iconSrc}
                  />
                ) : (
                  <div className="size-12 rounded-2xl bg-muted" />
                )}
                <span className="text-sm font-medium leading-tight">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {propertyTypesQuery.isError ? (
        <p className="text-xs text-destructive">
          {t("create.sections.propertyType.error")}
        </p>
      ) : null}
    </div>
  );
}
