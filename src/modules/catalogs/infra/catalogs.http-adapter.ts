import type { CatalogsEntity } from "../domain/catalogs.entity";
import type { CatalogsRepository } from "../domain/catalogs.repository";

export const catalogsHttpAdapter = {
  list: async () => Promise.resolve([] as CatalogsEntity[]),
  getById: async () => Promise.resolve({} as CatalogsEntity),
} satisfies CatalogsRepository;
