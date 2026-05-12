"use client";

import { useQuery } from "@tanstack/react-query";

import { catalogHttpAdapter } from "@catalogs/infra/catalog.http-adapter";

export const useModalities = () => {
  return useQuery({
    queryKey: ["catalogs", "modalities"],
    queryFn: () => catalogHttpAdapter.listModalities(),
  });
};

export const usePropertyTypes = () => {
  return useQuery({
    queryKey: ["catalogs", "property-types"],
    queryFn: () => catalogHttpAdapter.listPropertyTypes(),
  });
};

export const useRentPeriods = (propertyTypeId: number) => {
  return useQuery({
    queryKey: ["catalogs", "rent-periods", propertyTypeId],
    queryFn: () => catalogHttpAdapter.listRentPeriods(propertyTypeId),
    enabled: propertyTypeId > 0,
  });
};

export const useOrientations = () => {
  return useQuery({
    queryKey: ["catalogs", "orientations"],
    queryFn: () => catalogHttpAdapter.listOrientations(),
  });
};
