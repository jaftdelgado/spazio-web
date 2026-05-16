"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UpdatePropertyPricesInput } from "@properties/domain/property.entity";
import { propertyPricesHttpAdapter } from "@properties/prices/infra/property-prices.http-adapter";

export const usePropertyPrices = (uuid: string) => {
  return useQuery({
    queryKey: ["properties", "prices", uuid],
    queryFn: () => propertyPricesHttpAdapter.getPropertyPrices(uuid),
    enabled: uuid.length > 0,
  });
};

export const useUpdatePropertyPrices = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePropertyPricesInput) =>
      propertyPricesHttpAdapter.updatePropertyPrices(uuid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties", "prices", uuid],
      });
      queryClient.invalidateQueries({
        queryKey: ["properties", "prices-history", uuid],
      });
    },
  });
};
