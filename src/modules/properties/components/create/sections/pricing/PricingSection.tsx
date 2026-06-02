"use client";

import * as React from "react";

import { useAppLocale } from "@/app/i18n/useAppLocale";
import { useModalities, useRentPeriods } from "@catalogs/application/hooks/useCatalogs";
import { CreateFormSection } from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import {
  PricingSelectableTable,
  type SelectablePriceRow,
} from "./components/PricingSelectableTable";
import { PricingEditor } from "./components/PricingEditor";

type PriceOption = {
  id: string;
  kind: "sale" | "rent";
  label: string;
  periodId?: number;
};

function resolvePricingMode(modalityName?: string | null) {
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

export function PricingSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();
  const { locale } = useAppLocale();
  const modalitiesQuery = useModalities();
  const rentPeriodsQuery = useRentPeriods(form.propertyTypeId ?? 0);
  const [selectedPriceOptionId, setSelectedPriceOptionId] = React.useState<string | null>(
    null,
  );

  const selectedModality = React.useMemo(
    () =>
      (modalitiesQuery.data ?? []).find(
        (modality) => modality.modalityId === form.modalityId,
      ) ?? null,
    [form.modalityId, modalitiesQuery.data],
  );

  const pricingMode = React.useMemo(
    () => resolvePricingMode(selectedModality?.name),
    [selectedModality?.name],
  );

  const rentPeriods = React.useMemo(
    () => rentPeriodsQuery.data ?? [],
    [rentPeriodsQuery.data],
  );

  const numberFlowLocale = locale === "es" ? "es-MX" : "en-US";

  const rentPeriodLabel = React.useCallback(
    (periodName: string) => {
      const normalizedName = periodName.trim().toLowerCase();

      if (normalizedName === "nightly") {
        return t("create.rentPeriods.nightly");
      }

      if (normalizedName === "weekly") {
        return t("create.rentPeriods.weekly");
      }

      if (normalizedName === "monthly") {
        return t("create.rentPeriods.monthly");
      }

      if (normalizedName === "yearly") {
        return t("create.rentPeriods.yearly");
      }

      return periodName;
    },
    [t],
  );

  const priceOptions = React.useMemo(() => {
    const options: PriceOption[] = [];

    if (pricingMode === "sale" || pricingMode === "mixed") {
      options.push({
        id: "sale",
        kind: "sale",
        label: t("create.fields.salePrice.label"),
      });
    }

    if (pricingMode === "rent" || pricingMode === "mixed") {
      for (const rentPeriod of rentPeriods) {
        options.push({
          id: `rent-${rentPeriod.periodId}`,
          kind: "rent",
          label: `${t("create.fields.rentPrice.prefix")} ${rentPeriodLabel(rentPeriod.name).toLowerCase()}`,
          periodId: rentPeriod.periodId,
        });
      }
    }

    return options;
  }, [pricingMode, rentPeriodLabel, rentPeriods, t]);

  const resolvedPriceOptionId =
    selectedPriceOptionId &&
    priceOptions.some((option) => option.id === selectedPriceOptionId)
      ? selectedPriceOptionId
      : (priceOptions[0]?.id ?? null);

  const getPriceSuffix = React.useCallback(
    (option: Pick<PriceOption, "kind" | "label">) =>
      option.kind === "sale"
        ? " MXN"
        : ` MXN / ${option.label
            .replace(/^.*?\s/, "")
            .toLowerCase()
            .replace("mensual", "mes")
            .replace("anual", "año")
            .replace("weekly", "sem")
            .replace("nightly", "noche")}`,
    [],
  );

  const selectablePriceRows = React.useMemo<SelectablePriceRow[]>(
    () =>
      priceOptions.map((option) => ({
        id: option.id,
        label: option.label,
        amount:
          option.kind === "sale"
            ? (form.salePrice.trim() === "" ? null : Number(form.salePrice))
            : ((form.rentPricesByPeriod[String(option.periodId)] ?? "").trim() === ""
                ? null
                : Number(form.rentPricesByPeriod[String(option.periodId)])),
        suffix: getPriceSuffix(option),
      })),
    [form.rentPricesByPeriod, form.salePrice, getPriceSuffix, priceOptions],
  );

  const formatPrice = React.useCallback(
    (amount: number, suffix: string) =>
      new Intl.NumberFormat(numberFlowLocale, {
        maximumFractionDigits: 0,
        useGrouping: true,
      }).format(amount) + suffix,
    [numberFlowLocale],
  );

  const pricingEmptyState = React.useMemo(() => {
    if (!pricingMode) {
      return {
        title: t("create.pricing.emptyStateTitle"),
        description: t("create.pricing.emptyStateDescription"),
      };
    }

    if ((pricingMode === "rent" || pricingMode === "mixed") && !form.propertyTypeId) {
      return {
        title: t("create.pricing.propertyTypeRequiredTitle"),
        description: t("create.pricing.propertyTypeRequiredDescription"),
      };
    }

    if (rentPeriodsQuery.isLoading && (pricingMode === "rent" || pricingMode === "mixed")) {
      return {
        title: t("create.pricing.loadingTitle"),
        description: t("create.pricing.loadingDescription"),
      };
    }

    if (priceOptions.length === 0) {
      return {
        title: t("create.pricing.noPeriodsTitle"),
        description: t("create.pricing.noPeriodsDescription"),
      };
    }

    return null;
  }, [form.propertyTypeId, priceOptions.length, pricingMode, rentPeriodsQuery.isLoading, t]);

  const selectedPriceOption = React.useMemo(
    () =>
      priceOptions.find((option) => option.id === resolvedPriceOptionId) ??
      null,
    [priceOptions, resolvedPriceOptionId],
  );

  const selectedPriceValue =
    selectedPriceOption?.kind === "sale"
      ? form.salePrice
      : selectedPriceOption
        ? (form.rentPricesByPeriod[String(selectedPriceOption.periodId)] ?? "")
        : "";

  const selectedFieldId = selectedPriceOption
    ? `property-price-${selectedPriceOption.id}`
    : "property-price";

  const handleSelectedPriceChange = React.useCallback(
    (nextValue: string) => {
      if (!selectedPriceOption) {
        return;
      }

      if (selectedPriceOption.kind === "sale") {
        patchForm({ salePrice: nextValue });
        return;
      }

      const periodKey = String(selectedPriceOption.periodId);
      const nextRentPricesByPeriod = {
        ...form.rentPricesByPeriod,
        [periodKey]: nextValue,
      };

      if (nextValue.trim() === "") {
        delete nextRentPricesByPeriod[periodKey];
      }

      patchForm({
        rentPricesByPeriod: nextRentPricesByPeriod,
      });
    },
    [form.rentPricesByPeriod, patchForm, selectedPriceOption],
  );

  return (
    <CreateFormSection
      hint={t("create.sections.pricingDetails.hint")}
      title={t("create.sections.pricingDetails.title")}
    >
      <div className="flex flex-col gap-5">
        <PricingEditor
          emptyState={pricingEmptyState ?? undefined}
          fieldId={selectedFieldId}
          hint={t("create.pricing.inputHint")}
          label={selectedPriceOption?.label ?? t("create.fields.salePrice.label")}
          locale={numberFlowLocale}
          suffix={
            selectedPriceOption ? getPriceSuffix(selectedPriceOption) : " MXN"
          }
          value={selectedPriceValue}
          onChange={handleSelectedPriceChange}
        />

        <PricingSelectableTable
          amountColumnLabel={t("create.pricing.tableAmountColumn")}
          emptyState={pricingEmptyState ?? undefined}
          formatPrice={formatPrice}
          hint={t("create.pricing.selectorHint")}
          rows={selectablePriceRows}
          selectedRowId={resolvedPriceOptionId}
          tableAriaLabel={t("create.pricing.tableAriaLabel")}
          title={t("create.pricing.selectorTitle")}
          typeColumnLabel={t("create.pricing.tableTypeColumn")}
          onSelectionChange={setSelectedPriceOptionId}
        />
      </div>
    </CreateFormSection>
  );
}
