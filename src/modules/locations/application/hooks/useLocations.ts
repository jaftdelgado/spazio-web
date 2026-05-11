"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { locationsHttpAdapter } from "../../infra/locations.http-adapter";

export function useLocations() {
  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsHttpAdapter.list(),
  });

  const createLocationsMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    locationsQuery,
    createLocationsMutation,
  };
}
