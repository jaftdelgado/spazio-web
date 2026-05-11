import type { ContractsEntity } from "../domain/contracts.entity";
import type { ContractsRepository } from "../domain/contracts.repository";

export const contractsHttpAdapter = {
  list: async () => Promise.resolve([] as ContractsEntity[]),
  getById: async () => Promise.resolve({} as ContractsEntity),
} satisfies ContractsRepository;
