"use client";

import { ImageUploadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
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
          className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          id="property-media-label"
          placeholder={t("create.fields.mediaLabel.placeholder")}
          value={form.mediaLabel}
          onChange={(event) => patchForm({ mediaLabel: event.target.value })}
        />
      </CreateFormField>

      <div className="flex items-center gap-3">
        <Button size="sm" type="button" variant="secondary">
          <HugeiconsIcon icon={ImageUploadIcon} size={16} strokeWidth={1.8} />
          {t("create.fields.mediaUpload.action")}
        </Button>
        <p className="text-xs text-muted-foreground">
          {t("create.fields.mediaUpload.hint")}
        </p>
      </div>
    </CreateFormSection>
  );
}
