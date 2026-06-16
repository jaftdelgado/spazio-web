"use client";

export type ReverseGeocodeAddress = {
  borough?: string;
  city?: string;
  city_district?: string;
  country?: string;
  country_code?: string;
  county?: string;
  district?: string;
  hamlet?: string;
  house_number?: string;
  municipality?: string;
  neighbourhood?: string;
  postcode?: string;
  quarter?: string;
  region?: string;
  residential?: string;
  road?: string;
  state?: string;
  suburb?: string;
  town?: string;
  village?: string;
};

export type ReverseGeocodeResponse = {
  address?: ReverseGeocodeAddress;
};
