import type { ClausesEntity } from "../domain/clauses.entity";
import type { ClausesRepository } from "../domain/clauses.repository";

export const clausesHttpAdapter = {
  list: async () => Promise.resolve([] as ClausesEntity[]),
  getById: async () => Promise.resolve({} as ClausesEntity),
} satisfies ClausesRepository;
