import { httpClient } from "@lib/http/http-client";

import type {
  ContractsEntity,
  ContractListItemEntity,
  ContractListFilters,
} from "../domain/contracts.entity";
import type { ContractsRepository } from "../domain/contracts.repository";
import {
  mapContract,
  mapContractList,
  type ContractListItemDto,
} from "./contracts.mapper";

type ContractDetailDto = Parameters<typeof mapContract>[0];

export const contractsHttpAdapter = {
  async getById(uuid: string): Promise<ContractsEntity> {
    const response = await httpClient.get<ContractDetailDto>(
      `/api/v1/contracts/${uuid}`,
    );
    return mapContract(response);
  },

  async list(filters?: ContractListFilters): Promise<ContractListItemEntity[]> {
    const params = new URLSearchParams();

    if (filters?.page !== undefined) {
      params.set("page", String(filters.page));
    }
    if (filters?.limit !== undefined) {
      params.set("limit", String(filters.limit));
    }
    if (filters?.transactionType) {
      params.set("transaction_type", filters.transactionType);
    }
    if (filters?.statusId !== undefined) {
      params.set("status_id", String(filters.statusId));
    }
    if (filters?.search) {
      params.set("search", filters.search);
    }

    const queryString = params.toString();
    const response = await httpClient.get<ContractListItemDto[]>(
      queryString ? `/api/v1/contracts?${queryString}` : "/api/v1/contracts",
    );

    return mapContractList(response);
  },
} satisfies ContractsRepository;

