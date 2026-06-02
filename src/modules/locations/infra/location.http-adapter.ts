"use client";

import { httpClient } from "@lib/http/http-client";

import type {
  ListCitiesResult,
  LocationRepository,
} from "@locations/domain/location.repository";
import {
  mapCity,
  mapCountry,
  mapListCitiesMeta,
  mapState,
} from "@locations/infra/location.mapper";

type CollectionResponse<T> = {
  data: T[];
};

type ListCitiesResponse<T, M> = {
  data: T[];
  meta: M;
};

type CountryDTO = Parameters<typeof mapCountry>[0];
type StateDTO = Parameters<typeof mapState>[0];
type CityDTO = Parameters<typeof mapCity>[0];
type ListCitiesMetaDTO = Parameters<typeof mapListCitiesMeta>[0];

const assertPositiveInteger = (value: number, fieldName: string) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
};

const toSearchValue = (value?: string) => {
  const trimmedValue = value?.trim() ?? "";

  return trimmedValue === "" ? null : trimmedValue;
};

export const locationHttpAdapter: LocationRepository = {
  async listCountries() {
    const response = await httpClient.get<CollectionResponse<CountryDTO>>(
      "/api/v1/locations/countries",
    );

    return response.data.map(mapCountry);
  },
  async listStates(countryId, search) {
    assertPositiveInteger(countryId, "countryId");

    const searchParams = new URLSearchParams({
      country_id: String(countryId),
    });
    const searchValue = toSearchValue(search);

    if (searchValue) {
      searchParams.set("search", searchValue);
    }

    const response = await httpClient.get<CollectionResponse<StateDTO>>(
      `/api/v1/locations/states?${searchParams.toString()}`,
    );

    return response.data.map(mapState);
  },
  async listCities(stateId, search, page, pageSize) {
    assertPositiveInteger(stateId, "stateId");

    if (page !== undefined) {
      assertPositiveInteger(page, "page");
    }

    if (pageSize !== undefined) {
      assertPositiveInteger(pageSize, "pageSize");
    }

    const searchParams = new URLSearchParams({
      state_id: String(stateId),
    });
    const searchValue = toSearchValue(search);

    if (searchValue) {
      searchParams.set("search", searchValue);
    }

    if (page !== undefined) {
      searchParams.set("page", String(page));
    }

    if (pageSize !== undefined) {
      searchParams.set("page_size", String(pageSize));
    }

    const response = await httpClient.get<
      ListCitiesResponse<CityDTO, ListCitiesMetaDTO>
    >(`/api/v1/locations/cities?${searchParams.toString()}`);

    return {
      data: response.data.map(mapCity),
      meta: mapListCitiesMeta(response.meta),
    } satisfies ListCitiesResult;
  },
};
