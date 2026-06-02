"use client";

import type {
  City,
  Country,
  ListCitiesMeta,
  State,
} from "./location.entity";

export interface ListCitiesResult {
  data: City[];
  meta: ListCitiesMeta;
}

export interface LocationRepository {
  listCountries(): Promise<Country[]>;
  listStates(countryId: number, search?: string): Promise<State[]>;
  listCities(
    stateId: number,
    search?: string,
    page?: number,
    pageSize?: number,
  ): Promise<ListCitiesResult>;
}
