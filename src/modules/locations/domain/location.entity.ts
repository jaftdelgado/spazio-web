"use client";

export interface Country {
  countryId: number;
  iso2Code: string;
  name: string;
}

export interface State {
  stateId: number;
  isoCode: string | null;
  name: string;
}

export interface City {
  cityId: number;
  name: string;
}

export interface ListCitiesMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
