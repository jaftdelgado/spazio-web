"use client";

import { PropertyLocationMapPicker } from "@properties/components/create/shared/PropertyLocationMapPicker";
import {
  CreateFormField,
  CreateFormSubsection,
  CreateFormSwitchRow,
} from "@properties/components/create/shared/CreateFormPrimitives";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type MapSubsectionProps = {
  isPublicAddress: boolean;
  latitude: string;
  longitude: string;
  onPublicAddressChange: (value: boolean) => void;
  onChange: (next: {
    latitude: string;
    longitude: string;
    source: "auto" | "user";
  }) => void;
};

export function MapSubsection({
  isPublicAddress,
  latitude,
  longitude,
  onPublicAddressChange,
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

      <CreateFormSwitchRow
        title={t("create.fields.isPublicAddress.label")}
        description={t("create.fields.isPublicAddress.description")}
        isSelected={isPublicAddress}
        onChange={onPublicAddressChange}
      />
    </CreateFormSubsection>
  );
}
