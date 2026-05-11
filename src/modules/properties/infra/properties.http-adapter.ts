import type { PropertiesEntity } from "../domain/properties.entity";
import type { PropertiesRepository } from "../domain/properties.repository";

export const propertiesHttpAdapter = {
  list: async () => Promise.resolve([] as PropertiesEntity[]),
  getById: async () => Promise.resolve({} as PropertiesEntity),
} satisfies PropertiesRepository;
