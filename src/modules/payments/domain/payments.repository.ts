import type {
  PaymentDetail,
  PaymentListFilters,
  PaymentListResponse,
  RegisterPaymentInput,
  PaymentResponse,
} from "./payments.entity";

export interface PaymentsRepository {
  list(filters?: PaymentListFilters): Promise<PaymentListResponse>;
  getById(paymentUuid: string): Promise<PaymentDetail>;
  process(input: RegisterPaymentInput): Promise<PaymentResponse>;
}
