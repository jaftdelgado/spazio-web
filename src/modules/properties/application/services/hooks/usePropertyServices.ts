"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UpdatePropertyServicesInput } from "@properties/domain/property.entity";
import { propertyServicesHttpAdapter } from "@properties/infra/services/property-services.http-adapter";

export const usePropertyServices = (uuid: string) => {
  return useQuery({
    queryKey: ["properties", "services", uuid],
    queryFn: () => propertyServicesHttpAdapter.getPropertyServices(uuid),
    enabled: uuid.length > 0,
  });
};

export const useUpdatePropertyServices = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePropertyServicesInput) =>
      propertyServicesHttpAdapter.updatePropertyServices(uuid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties", "services", uuid],
      });
    },
  });
};
