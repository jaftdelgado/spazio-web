import type {
  ContractsEntity,
  ContractListItemEntity,
  ContractListFilters,
} from "./contracts.entity";

export interface ContractsRepository {
  getById(uuid: string): Promise<ContractsEntity>;
  list(filters?: ContractListFilters): Promise<ContractListItemEntity[]>;
}
