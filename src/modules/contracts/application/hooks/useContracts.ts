"use client";

import { useQuery } from "@tanstack/react-query";

import { contractsHttpAdapter } from "../../infra/contracts.http-adapter";

export function useContractDetail(contractUuid: string, enabled = true) {
  return useQuery({
    queryKey: ["contracts", "detail", contractUuid],
    queryFn: () => contractsHttpAdapter.getById(contractUuid),
    enabled: enabled && contractUuid.length > 0,
  });
}

import type { ContractListFilters } from "../../domain/contracts.entity";

export function useContractsList(
  filters?: ContractListFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["contracts", "list", filters],
    queryFn: () => contractsHttpAdapter.list(filters),
    enabled,
  });
}

