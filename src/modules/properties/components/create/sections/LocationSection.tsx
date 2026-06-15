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
import type {
  City,
  Country,
  State,
} from "@locations/domain/location.entity";
import { locationHttpAdapter } from "@locations/infra/location.http-adapter";
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

type ReverseGeocodeAddress = {
  city?: string;
  country?: string;
  country_code?: string;
  county?: string;
  house_number?: string;
  municipality?: string;
  neighbourhood?: string;
  postcode?: string;
  region?: string;
  residential?: string;
  road?: string;
  state?: string;
  suburb?: string;
  town?: string;
  village?: string;
};

type ReverseGeocodeResponse = {
  address?: ReverseGeocodeAddress;
};

function normalizeLocationText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function matchesLocationName(candidate: string, target: string) {
  const normalizedCandidate = normalizeLocationText(candidate);
  const normalizedTarget = normalizeLocationText(target);

  if (normalizedCandidate === "" || normalizedTarget === "") {
    return false;
  }

  return (
    normalizedCandidate === normalizedTarget ||
    normalizedCandidate.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedCandidate)
  );
}

function pickStateName(address: ReverseGeocodeAddress | undefined) {
  return (
    address?.state ??
    address?.region ??
    address?.county ??
    ""
  ).trim();
}

function pickCityName(address: ReverseGeocodeAddress | undefined) {
  return (
    address?.city ??
    address?.town ??
    address?.municipality ??
    address?.village ??
    address?.county ??
    ""
  ).trim();
}

function getCityNameCandidates(address: ReverseGeocodeAddress | undefined) {
  return Array.from(
    new Set(
      [
        address?.city,
        address?.town,
        address?.municipality,
        address?.village,
        address?.county,
      ]
        .map((value) => value?.trim() ?? "")
        .filter((value) => value !== ""),
    ),
  );
}

function pickNeighborhood(address: ReverseGeocodeAddress | undefined) {
  return (address?.suburb ?? address?.neighbourhood ?? "").trim();
}

function pickStreet(address: ReverseGeocodeAddress | undefined) {
  return (
    address?.road ??
    address?.residential ??
    ""
  ).trim();
}

function findMatchingCountry(
  countries: Country[],
  address: ReverseGeocodeAddress | undefined,
) {
  const countryCode = normalizeLocationText(address?.country_code);

  if (countryCode !== "") {
    const matchedByCode = countries.find(
      (country) => normalizeLocationText(country.iso2Code) === countryCode,
    );

    if (matchedByCode) {
      return matchedByCode;
    }
  }

  const countryName = address?.country?.trim() ?? "";

  if (countryName === "") {
    return null;
  }

  return (
    countries.find((country) => matchesLocationName(country.name, countryName)) ??
    null
  );
}

function findMatchingState(
  states: State[],
  address: ReverseGeocodeAddress | undefined,
) {
  const stateName = pickStateName(address);

  if (stateName === "") {
    return null;
  }

  return (
    states.find((state) => matchesLocationName(state.name, stateName)) ?? null
  );
}

function findMatchingCity(cities: City[], address: ReverseGeocodeAddress | undefined) {
  const cityCandidates = getCityNameCandidates(address);

  for (const candidate of cityCandidates) {
    const matchedCity =
      cities.find((city) => matchesLocationName(city.name, candidate)) ?? null;

    if (matchedCity) {
      return matchedCity;
    }
  }

  if (cities.length === 1) {
    return cities[0] ?? null;
  }

  return null;
}

async function reverseGeocodeCoordinates(
  latitude: string,
  longitude: string,
) {
  const searchParams = new URLSearchParams({
    addressdetails: "1",
    format: "jsonv2",
    lat: latitude,
    lon: longitude,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }

  return (await response.json()) as ReverseGeocodeResponse;
}

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
  const mapSelectionRequestIdRef = React.useRef(0);
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
  const pagedCities = React.useMemo(() => {
    const pages = citiesData?.pages ?? [];
    const cityMap = new Map<number, (typeof pages)[number]["data"][number]>();

    for (const page of pages) {
      for (const city of page.data) {
        cityMap.set(city.cityId, city);
      }
    }

    return Array.from(cityMap.values());
  }, [citiesData]);
  const cities = React.useMemo(() => {
    if (!form.cityId || form.city.trim() === "") {
      return pagedCities;
    }

    const hasSelectedCity = pagedCities.some(
      (city) => city.cityId === form.cityId,
    );

    if (hasSelectedCity) {
      return pagedCities;
    }

    return [
      {
        cityId: form.cityId,
        name: form.city,
      },
      ...pagedCities,
    ];
  }, [form.city, form.cityId, pagedCities]);
  const selectedCountryKey = form.countryId ? String(form.countryId) : null;
  const selectedStateKey = form.stateId ? String(form.stateId) : null;
  const selectedCityKey = form.cityId ? String(form.cityId) : null;

  const syncLocationFromMapSelection = React.useCallback(
    async (latitude: string, longitude: string) => {
      const requestId = ++mapSelectionRequestIdRef.current;

      try {
        const reverseGeocode = await reverseGeocodeCoordinates(
          latitude,
          longitude,
        );

        if (requestId !== mapSelectionRequestIdRef.current) {
          return;
        }

        const address = reverseGeocode.address;
        const nextNeighborhood = pickNeighborhood(address);
        const nextStreet = pickStreet(address);
        const nextExteriorNumber = (address?.house_number ?? "").trim();
        const nextPostalCode = (address?.postcode ?? "").trim();
        const nextCityName = pickCityName(address);
        const cityCandidates = getCityNameCandidates(address);
        const countries =
          countriesQuery.data ?? (await locationHttpAdapter.listCountries());
        const matchedCountry = findMatchingCountry(countries, address);

        if (requestId !== mapSelectionRequestIdRef.current) {
          return;
        }

        if (!matchedCountry) {
          patchForm({
            city: nextCityName,
            cityId: null,
            countryId: null,
            exteriorNumber: nextExteriorNumber,
            neighborhood: nextNeighborhood,
            postalCode: nextPostalCode,
            stateId: null,
            street: nextStreet,
          });
          setStateSearch("");
          setMunicipalitySearch("");
          return;
        }

        let states = await locationHttpAdapter.listStates(
          matchedCountry.countryId,
          pickStateName(address),
        );

        if (requestId !== mapSelectionRequestIdRef.current) {
          return;
        }

        let matchedState = findMatchingState(states, address);

        if (!matchedState) {
          states = await locationHttpAdapter.listStates(matchedCountry.countryId);

          if (requestId !== mapSelectionRequestIdRef.current) {
            return;
          }

          matchedState = findMatchingState(states, address);
        }
        let matchedCity: City | null = null;

        if (matchedState) {
          for (const candidate of cityCandidates) {
            const cityResult = await locationHttpAdapter.listCities(
              matchedState.stateId,
              candidate,
              1,
              100,
            );

            if (requestId !== mapSelectionRequestIdRef.current) {
              return;
            }

            matchedCity = findMatchingCity(cityResult.data, address);

            if (matchedCity) {
              break;
            }
          }

          if (!matchedCity) {
            const cityResult = await locationHttpAdapter.listCities(
              matchedState.stateId,
              undefined,
              1,
              100,
            );

            if (requestId !== mapSelectionRequestIdRef.current) {
              return;
            }

            matchedCity = findMatchingCity(cityResult.data, address);
          }
        }

        patchForm({
          city: matchedCity?.name ?? nextCityName,
          cityId: matchedCity?.cityId ?? null,
          countryId: matchedCountry.countryId,
          exteriorNumber: nextExteriorNumber,
          neighborhood: nextNeighborhood,
          postalCode: nextPostalCode,
          stateId: matchedState?.stateId ?? null,
          street: nextStreet,
        });
        setStateSearch("");
        setMunicipalitySearch(matchedCity?.name ?? nextCityName);
      } catch {
        if (requestId !== mapSelectionRequestIdRef.current) {
          return;
        }

        setStateSearch("");
        setMunicipalitySearch("");
      }
    },
    [countriesQuery.data, patchForm],
  );

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
          onChange={({ latitude, longitude, source }) => {
            patchForm({ latitude, longitude });

            if (source === "user") {
              void syncLocationFromMapSelection(latitude, longitude);
            }
          }}
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
