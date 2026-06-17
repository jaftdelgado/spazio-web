"use client";

import { Input } from "@/components/ui/input";

import {
  CreateFormField,
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { DescriptionField } from "./DescriptionField";

type IdentitySubsectionProps = {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
};

export function IdentitySubsection({
  form,
  patchForm,
}: IdentitySubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection
      hint={t("create.sections.identity.hint")}
      title={t("create.sections.identity.title")}
    >
      <CreateFormField
        htmlFor="property-title"
        isRequired
        label={t("create.fields.title.label")}
      >
        <Input
          className="h-11 border-input px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          id="property-title"
          maxLength={128}
          placeholder={t("create.fields.title.placeholder")}
          value={form.title}
          onChange={(event) => patchForm({ title: event.target.value })}
        />
      </CreateFormField>

      <DescriptionField
        value={form.description}
        onChange={(description) => patchForm({ description })}
      />
    </CreateFormSection>
  );
}
