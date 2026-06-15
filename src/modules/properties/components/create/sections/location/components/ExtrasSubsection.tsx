"use client";

import { CreateFormSubsection } from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type ExtrasSubsectionProps = {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
};

export function ExtrasSubsection({
  form: _form,
  patchForm: _patchForm,
}: ExtrasSubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSubsection
      isLast
      hint={t("create.location.extras.hint")}
      title={t("create.location.extras.title")}
    >
      <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-4 text-sm leading-6 text-muted-foreground">
        {t("create.location.extras.description")}
      </div>
    </CreateFormSubsection>
  );
}
