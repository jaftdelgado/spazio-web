import type { ServicesEntity } from "../domain/services.entity";
import type { ServicesRepository } from "../domain/services.repository";

export const servicesHttpAdapter = {
  list: async () => Promise.resolve([] as ServicesEntity[]),
  getById: async () => Promise.resolve({} as ServicesEntity),
} satisfies ServicesRepository;
