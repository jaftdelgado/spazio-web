"use client";

import * as React from "react";

import {
  useCountries,
  useInfiniteCities,
  useStates,
} from "@locations/application/hooks/useLocations";

type UseLocationCatalogOptionsParams = {
  countryId: number | null;
  stateId: number | null;
  cityId: number | null;
  cityName: string;
  stateSearch: string;
  municipalitySearch: string;
};

export function useLocationCatalogOptions({
  countryId,
  stateId,
  cityId,
  cityName,
  stateSearch,
  municipalitySearch,
}: UseLocationCatalogOptionsParams) {
  const deferredStateSearch = React.useDeferredValue(stateSearch);
  const deferredMunicipalitySearch =
    React.useDeferredValue(municipalitySearch);

  const countriesQuery = useCountries();
  const statesQuery = useStates(countryId ?? 0, deferredStateSearch);
  const citiesQuery = useInfiniteCities(
    stateId ?? 0,
    deferredMunicipalitySearch,
    100,
  );

  const { data: citiesData } = citiesQuery;

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
    if (!cityId || cityName.trim() === "") {
      return pagedCities;
    }

    const hasSelectedCity = pagedCities.some((city) => city.cityId === cityId);

    if (hasSelectedCity) {
      return pagedCities;
    }

    return [
      {
        cityId,
        name: cityName,
      },
      ...pagedCities,
    ];
  }, [cityId, cityName, pagedCities]);

  return {
    cities,
    citiesQuery,
    countries: countriesQuery.data ?? [],
    countriesQuery,
    selectedCityKey: cityId ? String(cityId) : null,
    selectedCountryKey: countryId ? String(countryId) : null,
    selectedStateKey: stateId ? String(stateId) : null,
    states: statesQuery.data ?? [],
    statesQuery,
  };
}
