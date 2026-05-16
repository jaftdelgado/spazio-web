"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreatePropertyInput } from "@properties/domain/property.entity";
import { propertyPostHttpAdapter } from "@properties/infra/post/property-post.http-adapter";

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePropertyInput) =>
      propertyPostHttpAdapter.createProperty(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties", "list"],
      });
    },
  });
};
