"use client";

import { Input } from "@/components/ui/input";
import {
  CreateFormField,
  CreateFormSubsection,
  CreateFormSwitchRow,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type CommercialDetailsSubsectionProps = {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
};

function sanitizeInteger(value: string) {
  return value.replace(/\D/g, "");
}

function sanitizeDecimal(value: string) {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = sanitized.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("").slice(0, 2)}`;
}

export function CommercialDetailsSubsection({
  form,
  patchForm,
}: CommercialDetailsSubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSubsection
      isFirst
      isLast
      title={t("create.details.commercial.title")}
      hint={t("create.details.commercial.hint")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <CreateFormField
          htmlFor="property-lot-area"
          isRequired
          label={t("create.fields.lotArea.label")}
        >
          <Input
            id="property-lot-area"
            inputMode="decimal"
            placeholder={t("create.fields.lotArea.placeholder")}
            value={form.lotArea}
            onChange={(event) =>
              patchForm({
                lotArea: sanitizeDecimal(event.target.value),
              })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-ceiling-height"
          isRequired
          label={t("create.fields.ceilingHeight.label")}
        >
          <Input
            id="property-ceiling-height"
            inputMode="decimal"
            placeholder={t("create.fields.ceilingHeight.placeholder")}
            value={form.ceilingHeight}
            onChange={(event) =>
              patchForm({
                ceilingHeight: sanitizeDecimal(event.target.value),
              })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-loading-docks"
          isRequired
          label={t("create.fields.loadingDocks.label")}
        >
          <Input
            id="property-loading-docks"
            inputMode="numeric"
            placeholder={t("create.fields.loadingDocks.placeholder")}
            value={form.loadingDocks}
            onChange={(event) =>
              patchForm({
                loadingDocks: sanitizeInteger(event.target.value),
              })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-internal-offices"
          isRequired
          label={t("create.fields.internalOffices.label")}
        >
          <Input
            id="property-internal-offices"
            inputMode="numeric"
            placeholder={t("create.fields.internalOffices.placeholder")}
            value={form.internalOffices}
            onChange={(event) =>
              patchForm({
                internalOffices: sanitizeInteger(event.target.value),
              })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-land-use"
          isRequired
          label={t("create.fields.landUse.label")}
        >
          <Input
            id="property-land-use"
            maxLength={100}
            placeholder={t("create.fields.landUse.placeholder")}
            value={form.landUse}
            onChange={(event) => patchForm({ landUse: event.target.value })}
          />
        </CreateFormField>
      </div>

      <CreateFormSwitchRow
        title={t("create.fields.threePhasePower.label")}
        description={t("create.fields.threePhasePower.description")}
        isSelected={form.threePhasePower}
        onChange={(threePhasePower) => patchForm({ threePhasePower })}
      />
    </CreateFormSubsection>
  );
}
