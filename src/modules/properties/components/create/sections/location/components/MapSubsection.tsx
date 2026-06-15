"use client";

import { PropertyLocationMapPicker } from "@properties/components/create/shared/PropertyLocationMapPicker";
import {
  CreateFormField,
  CreateFormSubsection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type MapSubsectionProps = {
  latitude: string;
  longitude: string;
  onChange: (next: {
    latitude: string;
    longitude: string;
    source: "auto" | "user";
  }) => void;
};

export function MapSubsection({
  latitude,
  longitude,
  onChange,
}: MapSubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSubsection
      isFirst
      hint={t("create.location.map.hint")}
      title={t("create.location.map.title")}
    >
      <CreateFormField
        hint={t("create.fields.locationMap.selectionHint")}
        htmlFor="property-location-map"
        label={t("create.fields.locationMap.label")}
      >
        <PropertyLocationMapPicker
          latitude={latitude}
          longitude={longitude}
          onChange={onChange}
        />
      </CreateFormField>
    </CreateFormSubsection>
  );
}
