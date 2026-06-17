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
