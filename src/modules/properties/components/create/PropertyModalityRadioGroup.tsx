"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useModalities } from "@catalogs/application/hooks/useCatalogs";
import type { Modality } from "@catalogs/domain/catalog.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

function getModalityTranslationKey(modality: Modality) {
  const normalizedName = modality.name.trim().toLowerCase();

  if (normalizedName === "sale") {
    return "create.modalities.sale";
  }

  if (normalizedName === "rent") {
    return "create.modalities.rent";
  }

  if (normalizedName === "mixed") {
    return "create.modalities.mixed";
  }

  return null;
}

function getModalityDescriptionTranslationKey(modality: Modality) {
  const normalizedName = modality.name.trim().toLowerCase();

  if (normalizedName === "sale") {
    return "create.modalitiesDescriptions.sale";
  }

  if (normalizedName === "rent") {
    return "create.modalitiesDescriptions.rent";
  }

  if (normalizedName === "mixed") {
    return "create.modalitiesDescriptions.mixed";
  }

  return null;
}

export function PropertyModalityRadioGroup({
  selectedModalityId,
  onChange,
}: {
  selectedModalityId: number | null;
  onChange: (modalityId: number) => void;
}) {
  const { t } = usePropertiesTranslation();
  const modalitiesQuery = useModalities();
  const modalities = modalitiesQuery.data ?? [];

  return (
    <div className="flex w-full flex-col gap-3">
      <span className="sr-only">{t("create.sections.modality.label")}</span>

      {modalitiesQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      ) : null}

      {!modalitiesQuery.isLoading ? (
        <RadioGroup
          aria-label={t("create.sections.modality.label")}
          className="grid gap-4"
          value={selectedModalityId ? String(selectedModalityId) : ""}
          onValueChange={(value) => onChange(Number(value))}
        >
          {modalities.map((modality) => {
            const translationKey = getModalityTranslationKey(modality);
            const descriptionKey =
              getModalityDescriptionTranslationKey(modality);
            const label = translationKey
              ? t(translationKey, { defaultValue: modality.name })
              : modality.name;

            return (
              <div
                key={modality.modalityId}
                className="flex items-start gap-3"
              >
                <RadioGroupItem
                  className="mt-0.5"
                  id={`property-modality-${modality.modalityId}`}
                  value={String(modality.modalityId)}
                />
                <Label
                  className="grid gap-1 font-normal"
                  htmlFor={`property-modality-${modality.modalityId}`}
                >
                  <span className="text-sm font-medium leading-none text-foreground">
                    {label}
                  </span>
                  {descriptionKey ? (
                    <span className="text-sm leading-5 text-muted-foreground">
                      {t(descriptionKey)}
                    </span>
                  ) : null}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      ) : null}

      {modalitiesQuery.isError ? (
        <p className="text-xs text-destructive">
          {t("create.sections.modality.error")}
        </p>
      ) : null}
    </div>
  );
}
