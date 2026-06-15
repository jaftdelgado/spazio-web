"use client";

import * as React from "react";

import { useOrientations } from "@catalogs/application/hooks/useCatalogs";
import { CreateFormSection } from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { AddressSubsection } from "./components/AddressSubsection";
import { ExtrasSubsection } from "./components/ExtrasSubsection";
import { MapSubsection } from "./components/MapSubsection";
import { useLocationCatalogOptions } from "./hooks/useLocationCatalogOptions";
import { useMapLocationSync } from "./hooks/useMapLocationSync";

export function LocationSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();
  const [isStateOpen, setIsStateOpen] = React.useState(false);
  const [stateSearch, setStateSearch] = React.useState("");
  const [isMunicipalityOpen, setIsMunicipalityOpen] = React.useState(false);
  const [municipalitySearch, setMunicipalitySearch] = React.useState("");
  const orientationsQuery = useOrientations();
  const {
    cities,
    citiesQuery,
    countries,
    countriesQuery,
    selectedCityKey,
    selectedCountryKey,
    selectedStateKey,
    states,
    statesQuery,
  } = useLocationCatalogOptions({
    cityId: form.cityId,
    cityName: form.city,
    countryId: form.countryId,
    municipalitySearch,
    stateId: form.stateId,
    stateSearch,
  });

  const syncLocationFromMapSelection = useMapLocationSync({
    countries,
    patchForm,
    setMunicipalitySearch,
    setStateSearch,
  });

  return (
    <CreateFormSection
      hideHeader
      title={t("create.sections.locationDetails.title")}
    >
      <MapSubsection
        latitude={form.latitude}
        longitude={form.longitude}
        onChange={({ latitude, longitude, source }) => {
          patchForm({ latitude, longitude });

          if (source === "user") {
            void syncLocationFromMapSelection(latitude, longitude);
          }
        }}
      />

      <AddressSubsection
        cities={cities}
        countries={countries}
        countriesLoading={countriesQuery.isLoading}
        form={form}
        hasNextPage={citiesQuery.hasNextPage}
        isCitiesPending={citiesQuery.isPending}
        isFetchingNextPage={citiesQuery.isFetchingNextPage}
        isMunicipalityOpen={isMunicipalityOpen}
        isStateOpen={isStateOpen}
        municipalitySearch={municipalitySearch}
        patchForm={patchForm}
        selectedCityKey={selectedCityKey}
        selectedCountryKey={selectedCountryKey}
        selectedStateKey={selectedStateKey}
        stateSearch={stateSearch}
        states={states}
        statesLoading={statesQuery.isLoading}
        onFetchNextPage={() => void citiesQuery.fetchNextPage()}
        onMunicipalityOpenChange={setIsMunicipalityOpen}
        onMunicipalitySearchChange={setMunicipalitySearch}
        onStateOpenChange={setIsStateOpen}
        onStateSearchChange={setStateSearch}
      />

      <ExtrasSubsection
        form={form}
        orientations={orientationsQuery.data ?? []}
        orientationsLoading={orientationsQuery.isLoading}
        patchForm={patchForm}
      />
    </CreateFormSection>
  );
}
