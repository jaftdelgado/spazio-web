"use client";

import { Description, Label, Radio, RadioGroup, Skeleton } from "@heroui/react";

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
        <RadioGroup
          aria-label={t("create.sections.modality.label")}
          id="property-modality-radio-group"
          orientation="vertical"
          value={selectedModalityId ? String(selectedModalityId) : undefined}
          onChange={(value) => onChange(Number(value))}
        >
          {modalities.map((modality) => {
            const translationKey = getModalityTranslationKey(modality);
            const descriptionKey =
              getModalityDescriptionTranslationKey(modality);
            const label = translationKey
              ? t(translationKey, { defaultValue: modality.name })
              : modality.name;

            return (
              <Radio
                key={modality.modalityId}
                value={String(modality.modalityId)}
              >
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Radio.Content>
                  <Label>{label}</Label>
                  {descriptionKey ? (
                    <Description>{t(descriptionKey)}</Description>
                  ) : null}
                </Radio.Content>
              </Radio>
            );
          })}
        </RadioGroup>
      ) : null}

      {modalitiesQuery.isError ? (
        <Description className="text-xs text-danger">
          {t("create.sections.modality.error")}
        </Description>
      ) : null}
    </div>
  );
}
