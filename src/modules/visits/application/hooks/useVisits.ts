"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { visitsHttpAdapter } from "../../infra/visits.http-adapter";

export function useVisits() {
  const visitsQuery = useQuery({
    queryKey: ["visits"],
    queryFn: () => visitsHttpAdapter.list(),
  });

  const createVisitsMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    visitsQuery,
    createVisitsMutation,
  };
}
