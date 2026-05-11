"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { servicesHttpAdapter } from "../../infra/services.http-adapter";

export function useServices() {
  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesHttpAdapter.list(),
  });

  const createServicesMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    servicesQuery,
    createServicesMutation,
  };
}
