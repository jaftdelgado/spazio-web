"use client";

import { Input, InputGroup } from "@heroui/react";

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
            id="property-title"
            placeholder={t("create.fields.title.placeholder")}
            onChange={(event) => patchForm({ title: event.target.value })}
          />
        </CreateFormField>
        <CreateFormField
          htmlFor="property-description"
          label={t("create.sections.description.label")}
        >
          <InputGroup
            fullWidth
            className="property-description-group gap-2 rounded-3xl py-2"
          >
            <InputGroup.TextArea
              className="w-full resize-none px-3.5 py-0"
              id="property-description"
              maxLength={descriptionCharacterLimit}
              placeholder={t("create.sections.description.placeholder")}
              rows={6}
              value={form.description}
              onChange={(event) =>
                patchForm({ description: event.target.value })
              }
            />
            <InputGroup.Suffix className="flex w-full justify-end px-3 py-0 text-xs tabular-nums text-muted">
              {descriptionCharactersUsed}/{descriptionCharacterLimit}
            </InputGroup.Suffix>
          </InputGroup>
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
