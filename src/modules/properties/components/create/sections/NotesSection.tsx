"use client";

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
        <textarea
          className="min-h-44 w-full resize-none rounded-3xl border border-input bg-background px-4 py-3 text-[15px] outline-none transition-[color,box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
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
