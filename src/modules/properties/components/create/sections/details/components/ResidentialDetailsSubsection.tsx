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
  CreateFormSwitchRow,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type ResidentialDetailsSubsectionProps = {
  form: PropertyCreateFormState;
  orientations: { orientationId: number; name: string }[];
  orientationsLoading: boolean;
  patchForm: PatchPropertyCreateForm;
};

function sanitizeInteger(value: string) {
  return value.replace(/\D/g, "");
}

function sanitizeDecimal(value: string) {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = sanitized.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("").slice(0, 2)}`;
}

export function ResidentialDetailsSubsection({
  form,
  orientations,
  orientationsLoading,
  patchForm,
}: ResidentialDetailsSubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSubsection
      isFirst
      title={t("create.details.residential.title")}
      hint={t("create.details.residential.hint")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <CreateFormField
          htmlFor="property-bedrooms"
          isRequired
          label={t("create.fields.bedrooms.label")}
        >
          <Input
            id="property-bedrooms"
            inputMode="numeric"
            placeholder={t("create.fields.bedrooms.placeholder")}
            value={form.bedrooms}
            onChange={(event) =>
              patchForm({ bedrooms: sanitizeInteger(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-bathrooms"
          isRequired
          label={t("create.fields.bathrooms.label")}
        >
          <Input
            id="property-bathrooms"
            inputMode="numeric"
            placeholder={t("create.fields.bathrooms.placeholder")}
            value={form.bathrooms}
            onChange={(event) =>
              patchForm({ bathrooms: sanitizeInteger(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-beds"
          isRequired
          label={t("create.fields.beds.label")}
        >
          <Input
            id="property-beds"
            inputMode="numeric"
            placeholder={t("create.fields.beds.placeholder")}
            value={form.beds}
            onChange={(event) =>
              patchForm({ beds: sanitizeInteger(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-floors"
          isRequired
          label={t("create.fields.floors.label")}
        >
          <Input
            id="property-floors"
            inputMode="numeric"
            placeholder={t("create.fields.floors.placeholder")}
            value={form.floors}
            onChange={(event) =>
              patchForm({ floors: sanitizeInteger(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-parking-spots"
          isRequired
          label={t("create.fields.parkingSpots.label")}
        >
          <Input
            id="property-parking-spots"
            inputMode="numeric"
            placeholder={t("create.fields.parkingSpots.placeholder")}
            value={form.parkingSpots}
            onChange={(event) =>
              patchForm({ parkingSpots: sanitizeInteger(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-lot-area"
          isRequired
          label={t("create.fields.lotArea.label")}
        >
          <Input
            id="property-lot-area"
            inputMode="decimal"
            placeholder={t("create.fields.lotArea.placeholder")}
            value={form.lotArea}
            onChange={(event) =>
              patchForm({ lotArea: sanitizeDecimal(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-built-area"
          isRequired
          label={t("create.fields.builtArea.label")}
        >
          <Input
            id="property-built-area"
            inputMode="decimal"
            placeholder={t("create.fields.builtArea.placeholder")}
            value={form.builtArea}
            onChange={(event) =>
              patchForm({ builtArea: sanitizeDecimal(event.target.value) })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-construction-year"
          isRequired
          label={t("create.fields.constructionYear.label")}
        >
          <Input
            id="property-construction-year"
            inputMode="numeric"
            placeholder={t("create.fields.constructionYear.placeholder")}
            value={form.constructionYear}
            onChange={(event) =>
              patchForm({
                constructionYear: sanitizeInteger(event.target.value).slice(0, 4),
              })
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
            <SelectTrigger id="property-orientation">
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

      <CreateFormSwitchRow
        title={t("create.fields.isFurnished.label")}
        description={t("create.fields.isFurnished.description")}
        isSelected={form.isFurnished}
        onChange={(isFurnished) => patchForm({ isFurnished })}
      />
    </CreateFormSubsection>
  );
}
