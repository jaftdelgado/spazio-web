import type { VisitsEntity } from "../domain/visits.entity";
import type { VisitsRepository } from "../domain/visits.repository";

export const visitsHttpAdapter = {
  list: async () => Promise.resolve([] as VisitsEntity[]),
  getById: async () => Promise.resolve({} as VisitsEntity),
} satisfies VisitsRepository;
