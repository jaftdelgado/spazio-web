"use client";

import { Input } from "@heroui/react";

import { PropertyLocationMapPicker } from "@properties/components/create/shared/PropertyLocationMapPicker";
import {
  CreateFormField,
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export function LocationSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection
      hint={t("create.sections.locationDetails.hint")}
      title={t("create.sections.locationDetails.title")}
    >
      <CreateFormField
        hint={t("create.fields.locationMap.selectionHint")}
        htmlFor="property-location-map"
        label={t("create.fields.locationMap.label")}
      >
        <PropertyLocationMapPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={({ latitude, longitude }) =>
            patchForm({ latitude, longitude })
          }
        />
      </CreateFormField>

      <div className="grid gap-5 md:grid-cols-2">
        <CreateFormField
          htmlFor="property-city"
          label={t("create.fields.city.label")}
        >
          <Input
            id="property-city"
            value={form.city}
            onChange={(event) => patchForm({ city: event.target.value })}
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-neighborhood"
          label={t("create.fields.neighborhood.label")}
        >
          <Input
            id="property-neighborhood"
            placeholder={t("create.fields.neighborhood.placeholder")}
            value={form.neighborhood}
            onChange={(event) =>
              patchForm({ neighborhood: event.target.value })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-street"
          label={t("create.fields.street.label")}
        >
          <Input
            id="property-street"
            placeholder={t("create.fields.street.placeholder")}
            value={form.street}
            onChange={(event) => patchForm({ street: event.target.value })}
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-exterior"
          label={t("create.fields.exteriorNumber.label")}
        >
          <Input
            id="property-exterior"
            placeholder={t("create.fields.exteriorNumber.placeholder")}
            value={form.exteriorNumber}
            onChange={(event) =>
              patchForm({ exteriorNumber: event.target.value })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-postal-code"
          label={t("create.fields.postalCode.label")}
        >
          <Input
            id="property-postal-code"
            placeholder={t("create.fields.postalCode.placeholder")}
            value={form.postalCode}
            onChange={(event) => patchForm({ postalCode: event.target.value })}
          />
        </CreateFormField>
      </div>
    </CreateFormSection>
  );
}
