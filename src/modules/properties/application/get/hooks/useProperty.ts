"use client";

import { useQuery } from "@tanstack/react-query";

import type { PropertyListFilters } from "@properties/domain/property.repository";
import { propertyGetHttpAdapter } from "@properties/infra/get/property-get.http-adapter";

export const usePropertyList = (
  filters: PropertyListFilters = {},
  enabled = true,
) => {
  return useQuery({
    enabled,
    queryKey: ["properties", "list", filters],
    queryFn: () => propertyGetHttpAdapter.listProperties(filters),
  });
};

export const useProperty = (uuid: string) => {
  return useQuery({
    queryKey: ["properties", "detail", uuid],
    queryFn: () => propertyGetHttpAdapter.getProperty(uuid),
    enabled: uuid.length > 0,
  });
};

export const usePropertyHistory = (uuid: string) => {
  return useQuery({
    queryKey: ["properties", "history", uuid],
    queryFn: () => propertyGetHttpAdapter.getPropertyHistory(uuid),
    enabled: uuid.length > 0,
  });
};

export const usePropertyPricesHistory = (uuid: string) => {
  return useQuery({
    queryKey: ["properties", "prices-history", uuid],
    queryFn: () => propertyGetHttpAdapter.getPropertyPricesHistory(uuid),
    enabled: uuid.length > 0,
  });
};
