"use client";

import { useQuery } from "@tanstack/react-query";

import type { PaymentListFilters } from "../../domain/payments.entity";
import { paymentsHttpAdapter } from "../../infra/payments.http-adapter";

export function usePaymentsList(filters: PaymentListFilters) {
  return useQuery({
    queryKey: ["payments", "list", filters],
    queryFn: () => paymentsHttpAdapter.list(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function usePaymentDetail(paymentUuid: string, enabled = true) {
  return useQuery({
    queryKey: ["payments", "detail", paymentUuid],
    queryFn: () => paymentsHttpAdapter.getById(paymentUuid),
    enabled: enabled && paymentUuid.length > 0,
  });
}
