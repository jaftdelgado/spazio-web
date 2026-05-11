import type { PaymentsEntity } from "../domain/payments.entity";
import type { PaymentsRepository } from "../domain/payments.repository";

export const paymentsHttpAdapter = {
  list: async () => Promise.resolve([] as PaymentsEntity[]),
  getById: async () => Promise.resolve({} as PaymentsEntity),
} satisfies PaymentsRepository;
