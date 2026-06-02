"use client";

import type { Key } from "@heroui/react";

import * as React from "react";
import {
  Autocomplete,
  EmptyState,
  Input,
  Label,
  ListBox,
  ListBoxLoadMoreItem,
  SearchField,
  Select,
} from "@heroui/react";

import {
  useCountries,
  useInfiniteCities,
  useStates,
} from "@locations/application/hooks/useLocations";
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
  const [isStateOpen, setIsStateOpen] = React.useState(false);
  const [stateSearch, setStateSearch] = React.useState("");
  const [isMunicipalityOpen, setIsMunicipalityOpen] = React.useState(false);
  const [municipalitySearch, setMunicipalitySearch] = React.useState("");
  const deferredStateSearch = React.useDeferredValue(stateSearch);
  const deferredMunicipalitySearch =
    React.useDeferredValue(municipalitySearch);
  const countriesQuery = useCountries();
  const statesQuery = useStates(form.countryId ?? 0, deferredStateSearch);
  const citiesQuery = useInfiniteCities(
    form.stateId ?? 0,
    deferredMunicipalitySearch,
    100,
  );
  const {
    data: citiesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: isCitiesPending,
  } = citiesQuery;

  const countries = countriesQuery.data ?? [];
  const states = statesQuery.data ?? [];
  const cities = React.useMemo(() => {
    const pages = citiesData?.pages ?? [];
    const cityMap = new Map<number, (typeof pages)[number]["data"][number]>();

    for (const page of pages) {
      for (const city of page.data) {
        cityMap.set(city.cityId, city);
      }
    }

    return Array.from(cityMap.values());
  }, [citiesData]);
  const selectedCountryKey = form.countryId ? String(form.countryId) : null;
  const selectedStateKey = form.stateId ? String(form.stateId) : null;
  const selectedCityKey = form.cityId ? String(form.cityId) : null;

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
        <Select
          fullWidth
          isRequired
          name="property-country"
          placeholder={t("create.fields.country.placeholder")}
          selectedKey={selectedCountryKey}
          onSelectionChange={(key: Key | null) => {
            const nextCountryId =
              typeof key === "string" || typeof key === "number"
                ? Number(key)
                : null;

            patchForm({
              countryId: nextCountryId,
              stateId: null,
              cityId: null,
              city: "",
            });
            setStateSearch("");
            setMunicipalitySearch("");
          }}
        >
          <Label>{t("create.fields.country.label")}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {countriesQuery.isLoading ? (
                <ListBox.Item id="countries-loading" isDisabled textValue={t("create.fields.country.loading")}>
                  {t("create.fields.country.loading")}
                </ListBox.Item>
              ) : countries.length > 0 ? (
                countries.map((country) => (
                  <ListBox.Item
                    key={country.countryId}
                    id={String(country.countryId)}
                    textValue={country.name}
                  >
                    {country.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))
              ) : (
                <ListBox.Item id="countries-empty" isDisabled textValue={t("create.fields.country.empty")}>
                  {t("create.fields.country.empty")}
                </ListBox.Item>
              )}
            </ListBox>
          </Select.Popover>
        </Select>

        <Autocomplete
          allowsEmptyCollection
          fullWidth
          isRequired
          isDisabled={!form.countryId || statesQuery.isLoading}
          isOpen={isStateOpen}
          name="property-state"
          placeholder={t("create.fields.state.placeholder")}
          selectionMode="single"
          selectedKey={selectedStateKey}
          onOpenChange={setIsStateOpen}
          onSelectionChange={(key: Key | null) => {
            const nextStateId =
              typeof key === "string" || typeof key === "number"
                ? Number(key)
                : null;

            patchForm({
              stateId: nextStateId,
              cityId: null,
              city: "",
            });
            setMunicipalitySearch("");
          }}
        >
          <Label>{t("create.fields.state.label")}</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter
              filter={() => true}
              inputValue={stateSearch}
              onInputChange={setStateSearch}
            >
              <SearchField
                autoFocus
                className="sticky top-0 z-10"
                name="state-search"
                variant="secondary"
              >
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input
                    placeholder={t("create.fields.state.searchPlaceholder")}
                  />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                className="max-h-72 overflow-y-auto"
                renderEmptyState={() => (
                  <EmptyState>
                    {statesQuery.isLoading
                      ? t("create.fields.state.loading")
                      : t("create.fields.state.empty")}
                  </EmptyState>
                )}
              >
                {states.map((state) => (
                  <ListBox.Item
                    key={state.stateId}
                    id={String(state.stateId)}
                    textValue={state.name}
                  >
                    {state.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>

        <Autocomplete
          allowsEmptyCollection
          fullWidth
          isRequired
          isDisabled={!form.stateId || isCitiesPending}
          isOpen={isMunicipalityOpen}
          name="property-municipality"
          placeholder={t("create.fields.municipality.placeholder")}
          selectionMode="single"
          selectedKey={selectedCityKey}
          onOpenChange={setIsMunicipalityOpen}
          onSelectionChange={(key: Key | null) => {
            const nextCityId =
              typeof key === "string" || typeof key === "number"
                ? Number(key)
                : null;
            const selectedCity =
              cities.find((city) => city.cityId === nextCityId) ?? null;

            patchForm({
              cityId: nextCityId,
              city: selectedCity?.name ?? "",
            });
            setMunicipalitySearch("");
          }}
        >
          <Label>{t("create.fields.municipality.label")}</Label>
          <Autocomplete.Trigger>
            <Autocomplete.Value />
            <Autocomplete.ClearButton />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <Autocomplete.Filter
              filter={() => true}
              inputValue={municipalitySearch}
              onInputChange={setMunicipalitySearch}
            >
              <SearchField
                autoFocus
                className="sticky top-0 z-10"
                name="municipality-search"
                variant="secondary"
              >
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input
                    placeholder={t("create.fields.municipality.searchPlaceholder")}
                  />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <ListBox
                className="max-h-72 overflow-y-auto"
                renderEmptyState={() => (
                  <EmptyState>
                    {isCitiesPending
                      ? t("create.fields.municipality.loading")
                      : municipalitySearch.trim() !== "" &&
                          isFetchingNextPage &&
                          hasNextPage
                        ? t("create.fields.municipality.searching")
                      : t("create.fields.municipality.empty")}
                  </EmptyState>
                )}
              >
                {cities.map((city) => (
                  <ListBox.Item
                    key={city.cityId}
                    id={String(city.cityId)}
                    textValue={city.name}
                  >
                    {city.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
                {hasNextPage ? (
                  <ListBoxLoadMoreItem
                    isLoading={isFetchingNextPage}
                    onLoadMore={fetchNextPage}
                  >
                    <div className="px-3 py-2 text-center text-sm text-muted">
                      {t("create.fields.municipality.loadingMore")}
                    </div>
                  </ListBoxLoadMoreItem>
                ) : null}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>

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
