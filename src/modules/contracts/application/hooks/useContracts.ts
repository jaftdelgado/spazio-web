"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { contractsHttpAdapter } from "../../infra/contracts.http-adapter";

export function useContracts() {
  const contractsQuery = useQuery({
    queryKey: ["contracts"],
    queryFn: () => contractsHttpAdapter.list(),
  });

  const createContractsMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    contractsQuery,
    createContractsMutation,
  };
}
