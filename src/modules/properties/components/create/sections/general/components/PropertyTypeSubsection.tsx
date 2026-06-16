"use client";

import { PropertyTypeRadioCardGroup } from "@properties/components/create/PropertyTypeRadioCardGroup";
import { CreateFormSection } from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertyTypeSubsectionProps = {
  form: PropertyCreateFormState;
  disabled?: boolean;
  patchForm: PatchPropertyCreateForm;
};

export function PropertyTypeSubsection({
  form,
  disabled = false,
  patchForm,
}: PropertyTypeSubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection
      hint={t("create.sections.propertyType.hint")}
      title={t("create.sections.propertyType.label")}
    >
      <PropertyTypeRadioCardGroup
        disabled={disabled}
        selectedPropertyTypeId={form.propertyTypeId}
        onChange={(propertyTypeId) => patchForm({ propertyTypeId })}
      />
    </CreateFormSection>
  );
}
