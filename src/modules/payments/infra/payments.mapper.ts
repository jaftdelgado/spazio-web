import type {
  PaymentDetail,
  PaymentListItem,
  PaymentListMeta,
  PaymentListResponse,
  RegisterPaymentInput,
  PaymentResponse,
} from "../domain/payments.entity";

type PaymentListItemDto = {
  payment_uuid: string;
  contract_id: number;
  property_id: number;
  billing_period: string;
  due_date: string;
  amount: string;
  currency: string;
  payment_method: string;
  gateway: string;
  status: string;
  payment_date: string | null;
};

type PaymentDetailDto = PaymentListItemDto & {
  transaction_id: number;
  transaction_type: string;
  agreed_amount: string;
  client_id?: number;
  agent_id?: number;
};

type PaymentListMetaDto = {
  total: number;
  shown: number;
};

type PaymentListResponseDto = {
  data: PaymentListItemDto[];
  meta: PaymentListMetaDto;
};

function parseAmount(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapPaymentListItem(dto: PaymentListItemDto): PaymentListItem {
  return {
    paymentUuid: dto.payment_uuid,
    contractId: dto.contract_id,
    propertyId: dto.property_id,
    billingPeriod: dto.billing_period,
    dueDate: dto.due_date,
    amount: parseAmount(dto.amount),
    currency: dto.currency,
    paymentMethod: dto.payment_method,
    gateway: dto.gateway,
    status: dto.status,
    paymentDate: dto.payment_date,
  };
}

export function mapPaymentDetail(dto: PaymentDetailDto): PaymentDetail {
  const base = mapPaymentListItem(dto);

  return {
    ...base,
    transactionId: dto.transaction_id,
    transactionType: dto.transaction_type,
    agreedAmount: parseAmount(dto.agreed_amount),
    clientId: dto.client_id,
    agentId: dto.agent_id,
  };
}

export function mapPaymentListMeta(dto: PaymentListMetaDto): PaymentListMeta {
  return {
    total: dto.total,
    shown: dto.shown,
  };
}

export function mapPaymentListResponse(
  dto: PaymentListResponseDto,
): PaymentListResponse {
  return {
    data: dto.data.map(mapPaymentListItem),
    meta: mapPaymentListMeta(dto.meta),
  };
}

export type RegisterPaymentRequestDto = {
  contract_id: number;
  payment_method_id: number;
  gateway_id: number;
  amount: number;
  currency: string;
  token?: string;
  gateway_method_id?: string;
  issuer_id?: string;
  installments?: number;
  payer_email: string;
};

export type PaymentResponseDto = {
  payment_uuid: string;
  status: string;
  status_id: number;
  amount: number;
  payment_date?: string | null;
  gateway_payment_id?: string;
  reference_number?: string | null;
};

export function mapRegisterPaymentInputToDto(
  input: RegisterPaymentInput,
): RegisterPaymentRequestDto {
  return {
    contract_id: input.contractId,
    payment_method_id: input.paymentMethodId,
    gateway_id: input.gatewayId,
    amount: input.amount,
    currency: input.currency,
    token: input.token,
    gateway_method_id: input.gatewayMethodId,
    issuer_id: input.issuerId,
    installments: input.installments,
    payer_email: input.payerEmail,
  };
}

export function mapPaymentResponse(dto: PaymentResponseDto): PaymentResponse {
  return {
    paymentUuid: dto.payment_uuid,
    status: dto.status,
    statusId: dto.status_id,
    amount: dto.amount,
    paymentDate: dto.payment_date,
    gatewayPaymentId: dto.gateway_payment_id,
    referenceNumber: dto.reference_number,
  };
}
