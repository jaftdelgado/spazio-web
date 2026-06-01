"use client";

import { TextArea } from "@heroui/react";

import {
  CreateFormField,
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export function NotesSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection title={t("create.sections.notes.title")}>
      <CreateFormField
        htmlFor="property-internal-notes"
        label={t("create.fields.internalNotes.label")}
      >
        <TextArea
          fullWidth
          id="property-internal-notes"
          placeholder={t("create.fields.internalNotes.placeholder")}
          rows={8}
          value={form.internalNotes}
          onChange={(event) => patchForm({ internalNotes: event.target.value })}
        />
      </CreateFormField>
    </CreateFormSection>
  );
}
