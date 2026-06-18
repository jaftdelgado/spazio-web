import { httpClient } from "@lib/http/http-client";

import type { PaymentsRepository } from "../domain/payments.repository";
import type {
  PaymentDetail,
  PaymentListFilters,
  PaymentListResponse,
  RegisterPaymentInput,
  PaymentResponse,
} from "../domain/payments.entity";
import {
  mapPaymentDetail,
  mapPaymentListResponse,
  mapRegisterPaymentInputToDto,
  mapPaymentResponse,
  type PaymentResponseDto,
} from "./payments.mapper";

type PaymentListResponseDto = Parameters<typeof mapPaymentListResponse>[0];
type PaymentDetailDto = Parameters<typeof mapPaymentDetail>[0];
const MAX_PAYMENT_LIST_LIMIT = 100;

export const paymentsHttpAdapter = {
  async list(filters?: PaymentListFilters): Promise<PaymentListResponse> {
    const params = new URLSearchParams();

    if (filters?.propertyId !== undefined) {
      params.set("property_id", String(filters.propertyId));
    }

    if (filters?.statusId !== undefined) {
      params.set("status_id", String(filters.statusId));
    }

    if (filters?.dateFrom) {
      params.set("date_from", filters.dateFrom);
    }

    if (filters?.dateTo) {
      params.set("date_to", filters.dateTo);
    }

    if (filters?.limit !== undefined) {
      params.set(
        "limit",
        String(Math.min(filters.limit, MAX_PAYMENT_LIST_LIMIT)),
      );
    }

    if (filters?.offset !== undefined) {
      params.set("offset", String(filters.offset));
    }

    const queryString = params.toString();
    const response = await httpClient.get<PaymentListResponseDto>(
      queryString
        ? `/api/v1/payments?${queryString}`
        : "/api/v1/payments",
    );

    return mapPaymentListResponse(response);
  },

  async getById(paymentUuid: string): Promise<PaymentDetail> {
    const response = await httpClient.get<PaymentDetailDto>(
      `/api/v1/payments/${paymentUuid}`,
    );

    return mapPaymentDetail(response);
  },

  async process(input: RegisterPaymentInput): Promise<PaymentResponse> {
    const dtoInput = mapRegisterPaymentInputToDto(input);
    const response = await httpClient.post<PaymentResponseDto>(
      "/api/v1/payments",
      dtoInput,
    );

    return mapPaymentResponse(response);
  },
} satisfies PaymentsRepository;
