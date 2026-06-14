"use client";

import * as React from "react";
import {
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <CreateFormField
          htmlFor="property-country"
          isRequired
          label={t("create.fields.country.label")}
        >
          <Select
            name="property-country"
            value={selectedCountryKey ?? undefined}
            onValueChange={(value) => {
              patchForm({
                countryId: Number(value),
                stateId: null,
                cityId: null,
                city: "",
              });
              setStateSearch("");
              setMunicipalitySearch("");
            }}
          >
            <SelectTrigger
              className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] text-foreground shadow-none"
              id="property-country"
            >
              <SelectValue
                placeholder={t("create.fields.country.placeholder")}
              />
            </SelectTrigger>
            <SelectContent className="max-h-72 rounded-3xl">
              {countriesQuery.isLoading ? (
                <SelectItem disabled value="countries-loading">
                  {t("create.fields.country.loading")}
                </SelectItem>
              ) : countries.length > 0 ? (
                countries.map((country) => (
                  <SelectItem
                    key={country.countryId}
                    value={String(country.countryId)}
                  >
                    {country.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="countries-empty">
                  {t("create.fields.country.empty")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </CreateFormField>

        <CreateFormField
          htmlFor="property-state"
          isRequired
          label={t("create.fields.state.label")}
        >
          <Select
            disabled={!form.countryId || statesQuery.isLoading}
            name="property-state"
            open={isStateOpen}
            value={selectedStateKey ?? undefined}
            onOpenChange={setIsStateOpen}
            onValueChange={(value) => {
              patchForm({
                stateId: Number(value),
                cityId: null,
                city: "",
              });
              setMunicipalitySearch("");
            }}
          >
            <SelectTrigger
              className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] text-foreground shadow-none"
              id="property-state"
            >
              <SelectValue placeholder={t("create.fields.state.placeholder")} />
            </SelectTrigger>
            <SelectContent className="max-h-80 rounded-3xl">
              <SelectSearchInput
                placeholder={t("create.fields.state.searchPlaceholder")}
                value={stateSearch}
                onChange={setStateSearch}
              />
              {states.length > 0 ? (
                states.map((state) => (
                  <SelectItem
                    key={state.stateId}
                    value={String(state.stateId)}
                  >
                    {state.name}
                  </SelectItem>
                ))
              ) : (
                <SelectEmptyState>
                  {statesQuery.isLoading
                    ? t("create.fields.state.loading")
                    : t("create.fields.state.empty")}
                </SelectEmptyState>
              )}
            </SelectContent>
          </Select>
        </CreateFormField>

        <CreateFormField
          htmlFor="property-municipality"
          isRequired
          label={t("create.fields.municipality.label")}
        >
          <Select
            disabled={!form.stateId || isCitiesPending}
            name="property-municipality"
            open={isMunicipalityOpen}
            value={selectedCityKey ?? undefined}
            onOpenChange={setIsMunicipalityOpen}
            onValueChange={(value) => {
              const nextCityId = Number(value);
              const selectedCity =
                cities.find((city) => city.cityId === nextCityId) ?? null;

              patchForm({
                cityId: nextCityId,
                city: selectedCity?.name ?? "",
              });
              setMunicipalitySearch("");
            }}
          >
            <SelectTrigger
              className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] text-foreground shadow-none"
              id="property-municipality"
            >
              <SelectValue
                placeholder={t("create.fields.municipality.placeholder")}
              />
            </SelectTrigger>
            <SelectContent className="max-h-80 rounded-3xl">
              <SelectSearchInput
                placeholder={t("create.fields.municipality.searchPlaceholder")}
                value={municipalitySearch}
                onChange={setMunicipalitySearch}
              />
              {cities.length > 0 ? (
                cities.map((city) => (
                  <SelectItem
                    key={city.cityId}
                    value={String(city.cityId)}
                  >
                    {city.name}
                  </SelectItem>
                ))
              ) : (
                <SelectEmptyState>
                  {isCitiesPending
                    ? t("create.fields.municipality.loading")
                    : municipalitySearch.trim() !== "" &&
                        isFetchingNextPage &&
                        hasNextPage
                      ? t("create.fields.municipality.searching")
                      : t("create.fields.municipality.empty")}
                </SelectEmptyState>
              )}
              {hasNextPage ? (
                <button
                  className="mt-1 w-full rounded-2xl px-3 py-2 text-center text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  disabled={isFetchingNextPage}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    void fetchNextPage();
                  }}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {t("create.fields.municipality.loadingMore")}
                </button>
              ) : null}
            </SelectContent>
          </Select>
        </CreateFormField>

        <CreateFormField
          htmlFor="property-neighborhood"
          label={t("create.fields.neighborhood.label")}
        >
          <Input
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
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
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
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
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
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
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
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

function SelectSearchInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-popover p-1">
      <div className="relative">
        <HugeiconsIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          icon={Search01Icon}
          size={16}
          strokeWidth={1.8}
        />
        <Input
          className="h-10 rounded-2xl border-input bg-background pl-9 text-sm shadow-none"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
        />
      </div>
    </div>
  );
}

function SelectEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
