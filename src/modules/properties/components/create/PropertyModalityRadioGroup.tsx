"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useModalities } from "@catalogs/application/hooks/useCatalogs";
import type { Modality } from "@catalogs/domain/catalog.entity";
import { cn } from "@/lib/utils";
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
      <span className="sr-only">
        {t("create.sections.modality.label")}
      </span>

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
        <div
          aria-label={t("create.sections.modality.label")}
          id="property-modality-radio-group"
          className="grid gap-3"
          role="radiogroup"
        >
          {modalities.map((modality) => {
            const translationKey = getModalityTranslationKey(modality);
            const descriptionKey =
              getModalityDescriptionTranslationKey(modality);
            const label = translationKey
              ? t(translationKey, { defaultValue: modality.name })
              : modality.name;

            return (
              <button
                key={modality.modalityId}
                aria-checked={selectedModalityId === modality.modalityId}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                  selectedModalityId === modality.modalityId
                    ? "border-primary bg-primary/10 ring-3 ring-primary/15"
                    : "border-border bg-card hover:bg-muted/50",
                )}
                role="radio"
                type="button"
                onClick={() => onChange(modality.modalityId)}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    selectedModalityId === modality.modalityId
                      ? "border-primary"
                      : "border-muted-foreground/40",
                  )}
                >
                  {selectedModalityId === modality.modalityId ? (
                    <span className="size-2 rounded-full bg-primary" />
                  ) : null}
                </span>
                <span className="grid gap-1">
                  <span className="text-sm font-medium leading-none text-foreground">
                    {label}
                  </span>
                  {descriptionKey ? (
                    <span className="text-sm leading-5 text-muted-foreground">
                      {t(descriptionKey)}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {modalitiesQuery.isError ? (
        <p className="text-xs text-destructive">
          {t("create.sections.modality.error")}
        </p>
      ) : null}
    </div>
  );
}
