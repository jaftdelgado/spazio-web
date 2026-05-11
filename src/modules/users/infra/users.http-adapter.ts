import type { UsersEntity } from "../domain/users.entity";
import type { UsersRepository } from "../domain/users.repository";

export const usersHttpAdapter = {
  list: async () => Promise.resolve([] as UsersEntity[]),
  getById: async () => Promise.resolve({} as UsersEntity),
} satisfies UsersRepository;
