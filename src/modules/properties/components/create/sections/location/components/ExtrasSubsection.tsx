"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateFormField,
  CreateFormSubsection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type ExtrasSubsectionProps = {
  form: PropertyCreateFormState;
  orientations: { orientationId: number; name: string }[];
  orientationsLoading: boolean;
  patchForm: PatchPropertyCreateForm;
};

function sanitizeLotArea(value: string) {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = sanitized.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("")}`;
}

export function ExtrasSubsection({
  form,
  orientations,
  orientationsLoading,
  patchForm,
}: ExtrasSubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSubsection
      isLast
      hint={t("create.location.extras.hint")}
      title={t("create.location.extras.title")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <CreateFormField
          htmlFor="property-lot-area"
          isRequired
          label={t("create.fields.lotArea.label")}
        >
          <Input
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            id="property-lot-area"
            inputMode="decimal"
            placeholder={t("create.fields.lotArea.placeholder")}
            value={form.lotArea}
            onChange={(event) =>
              patchForm({ lotArea: sanitizeLotArea(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-orientation"
          isRequired
          label={t("create.fields.orientation.label")}
        >
          <Select
            value={form.orientationId ? String(form.orientationId) : undefined}
            onValueChange={(value) =>
              patchForm({ orientationId: Number(value) })
            }
          >
            <SelectTrigger
              className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] text-foreground shadow-none"
              id="property-orientation"
            >
              <SelectValue
                placeholder={t("create.fields.orientation.placeholder")}
              />
            </SelectTrigger>
            <SelectContent className="max-h-72 rounded-3xl">
              {orientationsLoading ? (
                <SelectItem disabled value="orientations-loading">
                  {t("create.fields.orientation.loading")}
                </SelectItem>
              ) : orientations.length > 0 ? (
                orientations.map((orientation) => (
                  <SelectItem
                    key={orientation.orientationId}
                    value={String(orientation.orientationId)}
                  >
                    {orientation.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="orientations-empty">
                  {t("create.fields.orientation.empty")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </CreateFormField>
      </div>
    </CreateFormSubsection>
  );
}
