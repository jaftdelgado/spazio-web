"use client";

import type {
  City,
  Country,
  State,
} from "@locations/domain/location.entity";

import type { ReverseGeocodeAddress } from "../types/location.types";

export function normalizeLocationText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function matchesLocationName(candidate: string, target: string) {
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

export function pickStateName(address: ReverseGeocodeAddress | undefined) {
  return (address?.state ?? address?.region ?? address?.county ?? "").trim();
}

export function pickCityName(address: ReverseGeocodeAddress | undefined) {
  return (
    address?.city ??
    address?.town ??
    address?.municipality ??
    address?.village ??
    address?.county ??
    ""
  ).trim();
}

export function getCityNameCandidates(
  address: ReverseGeocodeAddress | undefined,
) {
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

export function pickNeighborhood(address: ReverseGeocodeAddress | undefined) {
  return (
    address?.quarter ??
    address?.neighbourhood ??
    address?.suburb ??
    address?.city_district ??
    address?.district ??
    address?.borough ??
    address?.hamlet ??
    ""
  ).trim();
}

export function pickPostalCode(address: ReverseGeocodeAddress | undefined) {
  return (address?.postcode ?? "").trim();
}

export function pickStreet(address: ReverseGeocodeAddress | undefined) {
  return (address?.road ?? address?.residential ?? "").trim();
}

export function findMatchingCountry(
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

export function findMatchingState(
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

export function findMatchingCity(
  cities: City[],
  address: ReverseGeocodeAddress | undefined,
) {
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
