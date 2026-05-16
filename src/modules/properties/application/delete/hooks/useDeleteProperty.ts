"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { DeletePropertyInput } from "@properties/domain/property.entity";
import { propertyDeleteHttpAdapter } from "@properties/infra/delete/property-delete.http-adapter";

export const useDeleteProperty = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeletePropertyInput) =>
      propertyDeleteHttpAdapter.deleteProperty(uuid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties", "detail", uuid],
      });
      queryClient.invalidateQueries({
        queryKey: ["properties"],
      });
    },
  });
};
