"use client";

import { Input } from "@/components/ui/input";

import { PropertyModalityRadioGroup } from "@properties/components/create/PropertyModalityRadioGroup";
import { PropertyTypeRadioCardGroup } from "@properties/components/create/PropertyTypeRadioCardGroup";
import {
  CreateFormField,
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export function GeneralSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();
  const descriptionCharacterLimit = 500;
  const descriptionCharactersUsed = form.description.length;

  return (
    <>
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
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            id="property-title"
            placeholder={t("create.fields.title.placeholder")}
            value={form.title}
            onChange={(event) => patchForm({ title: event.target.value })}
          />
        </CreateFormField>
        <CreateFormField
          htmlFor="property-description"
          label={t("create.sections.description.label")}
        >
          <div className="overflow-hidden rounded-3xl border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
            <textarea
              className="min-h-36 w-full resize-none bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-muted-foreground"
              id="property-description"
              maxLength={descriptionCharacterLimit}
              placeholder={t("create.sections.description.placeholder")}
              rows={6}
              value={form.description}
              onChange={(event) =>
                patchForm({ description: event.target.value })
              }
            />
            <div className="flex justify-end px-4 py-2 text-xs tabular-nums text-muted-foreground">
              {descriptionCharactersUsed}/{descriptionCharacterLimit}
            </div>
          </div>
        </CreateFormField>
      </CreateFormSection>

      <CreateFormSection
        hint={t("create.sections.propertyType.hint")}
        title={t("create.sections.propertyType.label")}
      >
        <PropertyTypeRadioCardGroup
          selectedPropertyTypeId={form.propertyTypeId}
          onChange={(propertyTypeId) => patchForm({ propertyTypeId })}
        />
      </CreateFormSection>

      <CreateFormSection
        hint={t("create.sections.modality.hint")}
        title={t("create.sections.modality.label")}
      >
        <PropertyModalityRadioGroup
          selectedModalityId={form.modalityId}
          onChange={(modalityId) => patchForm({ modalityId })}
        />
      </CreateFormSection>
    </>
  );
}
