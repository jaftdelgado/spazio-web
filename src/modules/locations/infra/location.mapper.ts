"use client";

import type {
  City,
  Country,
  ListCitiesMeta,
  State,
} from "@locations/domain/location.entity";

type CountryDTO = {
  country_id: number;
  iso2_code: string;
  name: string;
};

type StateDTO = {
  state_id: number;
  iso_code: string | null;
  name: string;
};

type CityDTO = {
  city_id: number;
  name: string;
};

export type ListCitiesMetaDTO = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export const mapCountry = (dto: CountryDTO): Country => {
  return {
    countryId: dto.country_id,
    iso2Code: dto.iso2_code,
    name: dto.name,
  };
};

export const mapState = (dto: StateDTO): State => {
  return {
    stateId: dto.state_id,
    isoCode: dto.iso_code,
    name: dto.name,
  };
};

export const mapCity = (dto: CityDTO): City => {
  return {
    cityId: dto.city_id,
    name: dto.name,
  };
};

export const mapListCitiesMeta = (dto: ListCitiesMetaDTO): ListCitiesMeta => {
  return {
    total: dto.total,
    page: dto.page,
    pageSize: dto.page_size,
    totalPages: dto.total_pages,
  };
};
