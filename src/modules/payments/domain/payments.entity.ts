export interface PaymentListItem {
  paymentUuid: string;
  contractId: number;
  propertyId: number;
  billingPeriod: string;
  dueDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  gateway: string;
  status: string;
  paymentDate: string | null;
}

export interface PaymentDetail extends PaymentListItem {
  transactionId: number;
  transactionType: string;
  agreedAmount: number;
  clientId?: number;
  agentId?: number;
}

export interface PaymentListMeta {
  total: number;
  shown: number;
}

export interface PaymentListResponse {
  data: PaymentListItem[];
  meta: PaymentListMeta;
}

export interface PaymentListFilters {
  propertyId?: number;
  statusId?: number;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface RegisterPaymentInput {
  contractId: number;
  paymentMethodId: number;
  gatewayId: number;
  amount: number; // in cents
  currency: string;
  token?: string;
  gatewayMethodId?: string;
  issuerId?: string;
  installments?: number;
  payerEmail: string;
}

export interface PaymentResponse {
  paymentUuid: string;
  status: string;
  statusId: number;
  amount: number; // in cents
  paymentDate?: string | null;
  gatewayPaymentId?: string;
  referenceNumber?: string | null;
}

/**
 * Context passed to CheckoutPaymentModal directly after rental confirmation.
 * This avoids searching for an existing payment record (which doesn't exist yet).
 */
export interface CheckoutContext {
  contractId: number;
  contractUuid: string;
  currency: string;
  /** Amount in decimal format (e.g. 15000.00) */
  amount: number;
  periodName?: string;
  existingPaymentUuid?: string;
  existingPaymentMethod?: string;
}
