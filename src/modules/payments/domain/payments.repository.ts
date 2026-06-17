import type {
  PaymentDetail,
  PaymentListFilters,
  PaymentListResponse,
} from "./payments.entity";

export interface PaymentsRepository {
  list(filters?: PaymentListFilters): Promise<PaymentListResponse>;
  getById(paymentUuid: string): Promise<PaymentDetail>;
}
