import type { LocationsEntity } from "../domain/locations.entity";
import type { LocationsRepository } from "../domain/locations.repository";

export const locationsHttpAdapter = {
  list: async () => Promise.resolve([] as LocationsEntity[]),
  getById: async () => Promise.resolve({} as LocationsEntity),
} satisfies LocationsRepository;
