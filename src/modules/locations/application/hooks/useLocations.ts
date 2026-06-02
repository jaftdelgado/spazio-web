"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { locationHttpAdapter } from "@locations/infra/location.http-adapter";

export const useCountries = () => {
  return useQuery({
    queryKey: ["locations", "countries"],
    queryFn: () => locationHttpAdapter.listCountries(),
  });
};

export const useStates = (countryId: number, search?: string) => {
  return useQuery({
    queryKey: ["locations", "states", countryId, search?.trim() ?? ""],
    queryFn: () => locationHttpAdapter.listStates(countryId, search),
    enabled: countryId > 0,
  });
};

export const useCities = (
  stateId: number,
  search?: string,
  page?: number,
  pageSize?: number,
) => {
  return useQuery({
    queryKey: ["locations", "cities", stateId, search?.trim() ?? "", page, pageSize],
    queryFn: () => locationHttpAdapter.listCities(stateId, search, page, pageSize),
    enabled: stateId > 0,
  });
};

export const useInfiniteCities = (
  stateId: number,
  search?: string,
  pageSize = 100,
) => {
  return useInfiniteQuery({
    queryKey: [
      "locations",
      "cities",
      "infinite",
      stateId,
      search?.trim() ?? "",
      pageSize,
    ],
    queryFn: ({ pageParam }) =>
      locationHttpAdapter.listCities(stateId, search, pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    enabled: stateId > 0,
  });
};
