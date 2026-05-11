import type { UploadsEntity } from "../domain/uploads.entity";
import type { UploadsRepository } from "../domain/uploads.repository";

export const uploadsHttpAdapter = {
  list: async () => Promise.resolve([] as UploadsEntity[]),
  getById: async () => Promise.resolve({} as UploadsEntity),
} satisfies UploadsRepository;
