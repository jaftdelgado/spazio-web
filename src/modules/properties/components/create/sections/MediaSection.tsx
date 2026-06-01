"use client";

import { ImageUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Description, Input } from "@heroui/react";

import {
  CreateFormField,
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export function MediaSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection title={t("create.sections.media.title")}>
      <CreateFormField
        hint={t("create.fields.mediaLabel.hint")}
        htmlFor="property-media-label"
        label={t("create.fields.mediaLabel.label")}
      >
        <Input
          fullWidth
          id="property-media-label"
          placeholder={t("create.fields.mediaLabel.placeholder")}
          value={form.mediaLabel}
          onChange={(event) => patchForm({ mediaLabel: event.target.value })}
        />
      </CreateFormField>

      <div className="flex items-center gap-3">
        <Button size="sm" variant="secondary">
          <HugeiconsIcon icon={ImageUploadIcon} size={16} strokeWidth={1.8} />
          {t("create.fields.mediaUpload.action")}
        </Button>
        <Description className="text-xs">
          {t("create.fields.mediaUpload.hint")}
        </Description>
      </div>
    </CreateFormSection>
  );
}
