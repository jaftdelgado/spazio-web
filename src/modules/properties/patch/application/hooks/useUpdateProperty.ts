"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdatePropertyInput } from "@properties/domain/property.entity";
import { propertyPatchHttpAdapter } from "@properties/patch/infra/property-patch.http-adapter";

export const useUpdateProperty = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePropertyInput) =>
      propertyPatchHttpAdapter.updateProperty(uuid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties", "detail", uuid],
      });
    },
  });
};
