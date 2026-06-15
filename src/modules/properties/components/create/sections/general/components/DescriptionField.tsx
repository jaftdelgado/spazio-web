"use client";

import { Textarea } from "@/components/ui/textarea";
import { CreateFormField } from "@properties/components/create/shared/CreateFormPrimitives";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type DescriptionFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

const DESCRIPTION_CHARACTER_LIMIT = 500;

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormField
      htmlFor="property-description"
      label={t("create.sections.description.label")}
    >
      <div className="overflow-hidden rounded-3xl border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <Textarea
          className="min-h-36 rounded-none border-0 bg-transparent px-4 py-3 text-[15px] shadow-none focus-visible:ring-0"
          id="property-description"
          maxLength={DESCRIPTION_CHARACTER_LIMIT}
          placeholder={t("create.sections.description.placeholder")}
          rows={6}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="flex justify-end px-4 py-2 text-xs tabular-nums text-muted-foreground">
          {value.length}/{DESCRIPTION_CHARACTER_LIMIT}
        </div>
      </div>
    </CreateFormField>
  );
}
