"use client";

import {
  CreateFormSection,
  CreateFormSwitchRow,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export function SettingsSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection title={t("create.sections.settings.title")}>
      <CreateFormSwitchRow
        description={t("create.fields.isPublicAddress.description")}
        isSelected={form.isPublicAddress}
        title={t("create.fields.isPublicAddress.label")}
        onChange={(value) => patchForm({ isPublicAddress: value })}
      />
      <CreateFormSwitchRow
        description={t("create.fields.isFeatured.description")}
        isSelected={form.isFeatured}
        title={t("create.fields.isFeatured.label")}
        onChange={(value) => patchForm({ isFeatured: value })}
      />
      <CreateFormSwitchRow
        description={t("create.fields.acceptsPets.description")}
        isSelected={form.acceptsPets}
        title={t("create.fields.acceptsPets.label")}
        onChange={(value) => patchForm({ acceptsPets: value })}
      />
    </CreateFormSection>
  );
}
