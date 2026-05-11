"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { propertiesHttpAdapter } from "../../infra/properties.http-adapter";

export function useProperties() {
  const propertiesQuery = useQuery({
    queryKey: ["properties"],
    queryFn: () => propertiesHttpAdapter.list(),
  });

  const createPropertiesMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    propertiesQuery,
    createPropertiesMutation,
  };
}
