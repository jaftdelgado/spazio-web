"use client";

import * as React from "react";

import type { City } from "@locations/domain/location.entity";
import { locationHttpAdapter } from "@locations/infra/location.http-adapter";
import type { PatchPropertyCreateForm } from "@properties/components/create/types";

import {
  findMatchingCity,
  findMatchingCountry,
  findMatchingState,
  getCityNameCandidates,
  pickCityName,
  pickNeighborhood,
  pickPostalCode,
  pickStateName,
  pickStreet,
} from "../utils/locationMatching";
import { reverseGeocodeCoordinates } from "../utils/reverseGeocoding";

type UseMapLocationSyncParams = {
  countries: Awaited<ReturnType<typeof locationHttpAdapter.listCountries>>;
  patchForm: PatchPropertyCreateForm;
  setMunicipalitySearch: React.Dispatch<React.SetStateAction<string>>;
  setStateSearch: React.Dispatch<React.SetStateAction<string>>;
};

export function useMapLocationSync({
  countries,
  patchForm,
  setMunicipalitySearch,
  setStateSearch,
}: UseMapLocationSyncParams) {
  const mapSelectionRequestIdRef = React.useRef(0);

  return React.useCallback(
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
        const nextPostalCode = pickPostalCode(address);
        const nextCityName = pickCityName(address);
        const cityCandidates = getCityNameCandidates(address);
        const matchedCountry =
          findMatchingCountry(countries, address) ??
          findMatchingCountry(await locationHttpAdapter.listCountries(), address);

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
    [countries, patchForm, setMunicipalitySearch, setStateSearch],
  );
}
