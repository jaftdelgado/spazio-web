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
import { resolvePricingMode } from "./pricingSection.schema";

type PriceOption = {
  id: string;
  kind: "sale" | "rent";
  label: string;
  periodId?: number;
  enabled: boolean;
};

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
        enabled: true,
        kind: "sale",
        label: t("create.fields.salePrice.label"),
      });
    }

    if (pricingMode === "rent" || pricingMode === "mixed") {
      for (const rentPeriod of rentPeriods) {
        options.push({
          id: `rent-${rentPeriod.periodId}`,
          enabled: form.enabledRentPeriodIds.includes(rentPeriod.periodId),
          kind: "rent",
          label: `${t("create.fields.rentPrice.prefix")} ${rentPeriodLabel(rentPeriod.name).toLowerCase()}`,
          periodId: rentPeriod.periodId,
        });
      }
    }

    return options;
  }, [form.enabledRentPeriodIds, pricingMode, rentPeriodLabel, rentPeriods, t]);

  const resolvedPriceOptionId =
    selectedPriceOptionId &&
    priceOptions.some((option) => option.id === selectedPriceOptionId)
      ? selectedPriceOptionId
      : (priceOptions[0]?.id ?? null);

  const getPriceSuffix = React.useCallback(
    (option: Pick<PriceOption, "kind" | "label">) =>
      option.kind === "sale"
        ? "MXN"
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
        enabled: option.enabled,
        suffix: getPriceSuffix(option),
        toggleDisabled: option.kind === "sale",
      })),
    [form.rentPricesByPeriod, form.salePrice, getPriceSuffix, priceOptions],
  );

  const formatPrice = React.useCallback(
    (amount: number, suffix: string) =>
      new Intl.NumberFormat(numberFlowLocale, {
        maximumFractionDigits: 2,
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
  const selectedDepositValue =
    selectedPriceOption?.kind === "rent" && selectedPriceOption.periodId !== undefined
      ? (form.rentDepositsByPeriod[String(selectedPriceOption.periodId)] ?? "")
      : "";

  const selectedFieldId = selectedPriceOption
    ? `property-price-${selectedPriceOption.id}`
    : "property-price";
  const selectedDepositFieldId = selectedPriceOption?.kind === "rent"
    ? `property-deposit-${selectedPriceOption.id}`
    : "property-deposit";

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

  const handleSelectedDepositChange = React.useCallback(
    (nextValue: string) => {
      if (
        !selectedPriceOption ||
        selectedPriceOption.kind !== "rent" ||
        selectedPriceOption.periodId === undefined
      ) {
        return;
      }

      const periodKey = String(selectedPriceOption.periodId);
      const nextRentDepositsByPeriod = {
        ...form.rentDepositsByPeriod,
        [periodKey]: nextValue,
      };

      if (nextValue.trim() === "") {
        delete nextRentDepositsByPeriod[periodKey];
      }

      patchForm({
        rentDepositsByPeriod: nextRentDepositsByPeriod,
      });
    },
    [form.rentDepositsByPeriod, patchForm, selectedPriceOption],
  );

  const handleTogglePriceOption = React.useCallback(
    (rowId: string, enabled: boolean) => {
      const option = priceOptions.find((current) => current.id === rowId);

      if (!option || option.kind !== "rent" || option.periodId === undefined) {
        return;
      }

      const nextEnabledPeriodIds = enabled
        ? Array.from(new Set([...form.enabledRentPeriodIds, option.periodId]))
        : form.enabledRentPeriodIds.filter((periodId) => periodId !== option.periodId);

      const nextRentPricesByPeriod = { ...form.rentPricesByPeriod };
      const nextRentDepositsByPeriod = { ...form.rentDepositsByPeriod };

      if (!enabled) {
        delete nextRentPricesByPeriod[String(option.periodId)];
        delete nextRentDepositsByPeriod[String(option.periodId)];
      }

      patchForm({
        enabledRentPeriodIds: nextEnabledPeriodIds,
        rentDepositsByPeriod: nextRentDepositsByPeriod,
        rentPricesByPeriod: nextRentPricesByPeriod,
      });
    },
    [form.enabledRentPeriodIds, form.rentDepositsByPeriod, form.rentPricesByPeriod, patchForm, priceOptions],
  );

  return (
    <>
      <CreateFormSection
        hint={t("create.sections.pricingDetails.hint")}
        title={t("create.sections.pricingDetails.title")}
      >
        <PricingEditor
          emptyState={pricingEmptyState ?? undefined}
          fieldId={selectedFieldId}
          label={selectedPriceOption?.label ?? t("create.fields.salePrice.label")}
          secondaryFieldId={
            selectedPriceOption?.kind === "rent" ? selectedDepositFieldId : undefined
          }
          secondaryLabel={
            selectedPriceOption?.kind === "rent"
              ? t("create.fields.deposit.label")
              : undefined
          }
          secondarySuffix={
            selectedPriceOption?.kind === "rent" ? "MXN" : undefined
          }
          secondaryValue={selectedDepositValue}
          locale={numberFlowLocale}
          maxIntegerDigits={selectedPriceOption?.kind === "sale" ? 9 : 8}
          isNegotiable={form.salePriceIsNegotiable}
          negotiableDescription={t("create.pricing.negotiableDescription")}
          negotiableLabel={t("create.pricing.negotiableLabel")}
          showNegotiable={selectedPriceOption?.kind === "sale"}
          suffix={
            selectedPriceOption ? getPriceSuffix(selectedPriceOption).trim() : "MXN"
          }
          value={selectedPriceValue}
          onChange={handleSelectedPriceChange}
          onSecondaryChange={handleSelectedDepositChange}
          onNegotiableChange={(salePriceIsNegotiable) =>
            patchForm({ salePriceIsNegotiable })
          }
        />
      </CreateFormSection>

      <CreateFormSection
        hint={t("create.pricing.registeredHint")}
        title={t("create.pricing.registeredTitle")}
      >
        <PricingSelectableTable
          activeColumnLabel={t("create.pricing.tableActiveColumn")}
          amountColumnLabel={t("create.pricing.tableAmountColumn")}
          emptyState={pricingEmptyState ?? undefined}
          formatPrice={formatPrice}
          rows={selectablePriceRows}
          selectedRowId={resolvedPriceOptionId}
          tableAriaLabel={t("create.pricing.tableAriaLabel")}
          typeColumnLabel={t("create.pricing.tableTypeColumn")}
          onSelectionChange={setSelectedPriceOptionId}
          onToggleRow={handleTogglePriceOption}
        />
      </CreateFormSection>
    </>
  );
}
