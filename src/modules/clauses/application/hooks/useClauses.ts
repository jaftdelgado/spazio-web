"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { clausesHttpAdapter } from "../../infra/clauses.http-adapter";

export function useClauses() {
  const clausesQuery = useQuery({
    queryKey: ["clauses"],
    queryFn: () => clausesHttpAdapter.list(),
  });

  const createClausesMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    clausesQuery,
    createClausesMutation,
  };
}
