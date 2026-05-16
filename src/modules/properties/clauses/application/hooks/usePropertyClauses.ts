"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UpdatePropertyClausesInput } from "@properties/domain/property.entity";
import { propertyClausesHttpAdapter } from "@properties/clauses/infra/property-clauses.http-adapter";

export const usePropertyClauses = (uuid: string) => {
  return useQuery({
    queryKey: ["properties", "clauses", uuid],
    queryFn: () => propertyClausesHttpAdapter.getPropertyClauses(uuid),
    enabled: uuid.length > 0,
  });
};

export const useUpdatePropertyClauses = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePropertyClausesInput) =>
      propertyClausesHttpAdapter.updatePropertyClauses(uuid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties", "clauses", uuid],
      });
    },
  });
};
