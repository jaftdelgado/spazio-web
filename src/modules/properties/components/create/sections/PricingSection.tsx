"use client";

import { Input } from "@heroui/react";

import {
  CreateFormField,
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export function PricingSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection
      hint={t("create.sections.pricingDetails.hint")}
      title={t("create.sections.pricingDetails.title")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <CreateFormField
          htmlFor="property-sale-price"
          label={t("create.fields.salePrice.label")}
        >
          <Input
            fullWidth
            id="property-sale-price"
            placeholder={t("create.fields.salePrice.placeholder")}
            type="number"
            value={form.salePrice}
            onChange={(event) => patchForm({ salePrice: event.target.value })}
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-rent-price"
          label={t("create.fields.rentPrice.label")}
        >
          <Input
            fullWidth
            id="property-rent-price"
            placeholder={t("create.fields.rentPrice.placeholder")}
            type="number"
            value={form.rentPrice}
            onChange={(event) => patchForm({ rentPrice: event.target.value })}
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-maintenance-fee"
          hint={t("create.fields.maintenanceFee.hint")}
          label={t("create.fields.maintenanceFee.label")}
        >
          <Input
            fullWidth
            id="property-maintenance-fee"
            placeholder={t("create.fields.maintenanceFee.placeholder")}
            type="number"
            value={form.maintenanceFee}
            onChange={(event) =>
              patchForm({ maintenanceFee: event.target.value })
            }
          />
        </CreateFormField>
      </div>
    </CreateFormSection>
  );
}
