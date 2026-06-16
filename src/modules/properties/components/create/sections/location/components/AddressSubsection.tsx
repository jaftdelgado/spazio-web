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

import { SelectEmptyState } from "./SelectEmptyState";
import { SelectSearchInput } from "./SelectSearchInput";

function sanitizePostalCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

function sanitizeExteriorInterior(value: string) {
  return value.replace(/[^A-Za-z0-9#-]/g, "").slice(0, 8);
}

type AddressSubsectionProps = {
  cities: { cityId: number; name: string }[];
  countries: { countryId: number; name: string }[];
  countriesLoading: boolean;
  form: PropertyCreateFormState;
  isCitiesPending: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  isMunicipalityOpen: boolean;
  isStateOpen: boolean;
  patchForm: PatchPropertyCreateForm;
  selectedCityKey: string | null;
  selectedCountryKey: string | null;
  selectedStateKey: string | null;
  states: { stateId: number; name: string }[];
  statesLoading: boolean;
  municipalitySearch: string;
  stateSearch: string;
  onFetchNextPage: () => void;
  onMunicipalityOpenChange: (open: boolean) => void;
  onMunicipalitySearchChange: (value: string) => void;
  onStateOpenChange: (open: boolean) => void;
  onStateSearchChange: (value: string) => void;
};

export function AddressSubsection({
  cities,
  countries,
  countriesLoading,
  form,
  hasNextPage,
  isCitiesPending,
  isFetchingNextPage,
  isMunicipalityOpen,
  isStateOpen,
  municipalitySearch,
  onFetchNextPage,
  onMunicipalityOpenChange,
  onMunicipalitySearchChange,
  onStateOpenChange,
  onStateSearchChange,
  patchForm,
  selectedCityKey,
  selectedCountryKey,
  selectedStateKey,
  stateSearch,
  states,
  statesLoading,
}: AddressSubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSubsection
      hint={t("create.location.fields.hint")}
      title={t("create.location.fields.title")}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <CreateFormField
          htmlFor="property-country"
          isRequired
          label={t("create.fields.country.label")}
        >
          <Select
            name="property-country"
            value={selectedCountryKey ?? ""}
            onValueChange={(value) => {
              patchForm({
                countryId: Number(value),
                stateId: null,
                cityId: null,
                city: "",
              });
              onStateSearchChange("");
              onMunicipalitySearchChange("");
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
              {countriesLoading ? (
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
            disabled={!form.countryId || statesLoading}
            name="property-state"
            open={isStateOpen}
            value={selectedStateKey ?? ""}
            onOpenChange={onStateOpenChange}
            onValueChange={(value) => {
              patchForm({
                stateId: Number(value),
                cityId: null,
                city: "",
              });
              onMunicipalitySearchChange("");
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
                onChange={onStateSearchChange}
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
                  {statesLoading
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
            value={selectedCityKey ?? ""}
            onOpenChange={onMunicipalityOpenChange}
            onValueChange={(value) => {
              const nextCityId = Number(value);
              const selectedCity =
                cities.find((city) => city.cityId === nextCityId) ?? null;

              patchForm({
                cityId: nextCityId,
                city: selectedCity?.name ?? "",
              });
              onMunicipalitySearchChange("");
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
                onChange={onMunicipalitySearchChange}
              />
              {cities.length > 0 ? (
                cities.map((city) => (
                  <SelectItem key={city.cityId} value={String(city.cityId)}>
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
                    onFetchNextPage();
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
          htmlFor="property-postal-code"
          isRequired
          label={t("create.fields.postalCode.label")}
        >
          <Input
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            id="property-postal-code"
            inputMode="numeric"
            maxLength={5}
            placeholder={t("create.fields.postalCode.placeholder")}
            value={form.postalCode}
            onChange={(event) =>
              patchForm({
                postalCode: sanitizePostalCode(event.target.value),
              })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-neighborhood"
          isRequired
          label={t("create.fields.neighborhood.label")}
        >
          <Input
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            id="property-neighborhood"
            maxLength={60}
            placeholder={t("create.fields.neighborhood.placeholder")}
            value={form.neighborhood}
            onChange={(event) =>
              patchForm({ neighborhood: event.target.value })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-street"
          isRequired
          label={t("create.fields.street.label")}
        >
          <Input
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            id="property-street"
            maxLength={120}
            placeholder={t("create.fields.street.placeholder")}
            value={form.street}
            onChange={(event) => patchForm({ street: event.target.value })}
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-exterior"
          isRequired
          label={t("create.fields.exteriorNumber.label")}
        >
          <Input
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            id="property-exterior"
            maxLength={8}
            placeholder={t("create.fields.exteriorNumber.placeholder")}
            value={form.exteriorNumber}
            onChange={(event) =>
              patchForm({
                exteriorNumber: sanitizeExteriorInterior(event.target.value),
              })
            }
          />
        </CreateFormField>

        <CreateFormField
          htmlFor="property-interior"
          label={t("create.fields.interiorNumber.label")}
        >
          <Input
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            id="property-interior"
            maxLength={8}
            placeholder={t("create.fields.interiorNumber.placeholder")}
            value={form.interiorNumber}
            onChange={(event) =>
              patchForm({
                interiorNumber: sanitizeExteriorInterior(event.target.value),
              })
            }
          />
        </CreateFormField>
      </div>
    </CreateFormSubsection>
  );
}
