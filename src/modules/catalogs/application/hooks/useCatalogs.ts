"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { catalogsHttpAdapter } from "../../infra/catalogs.http-adapter";

export function useCatalogs() {
  const catalogsQuery = useQuery({
    queryKey: ["catalogs"],
    queryFn: () => catalogsHttpAdapter.list(),
  });

  const createCatalogsMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    catalogsQuery,
    createCatalogsMutation,
  };
}
