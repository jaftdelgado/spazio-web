"use client";

import { PropertyModalityRadioGroup } from "@properties/components/create/PropertyModalityRadioGroup";
import { CreateFormSection } from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type ModalitySubsectionProps = {
  form: PropertyCreateFormState;
  disabled?: boolean;
  patchForm: PatchPropertyCreateForm;
};

export function ModalitySubsection({
  form,
  disabled = false,
  patchForm,
}: ModalitySubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection
      hint={t("create.sections.modality.hint")}
      title={t("create.sections.modality.label")}
    >
      <PropertyModalityRadioGroup
        disabled={disabled}
        selectedModalityId={form.modalityId}
        onChange={(modalityId) => patchForm({ modalityId })}
      />
    </CreateFormSection>
  );
}
