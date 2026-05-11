"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { paymentsHttpAdapter } from "../../infra/payments.http-adapter";

export function usePayments() {
  const paymentsQuery = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentsHttpAdapter.list(),
  });

  const createPaymentsMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    paymentsQuery,
    createPaymentsMutation,
  };
}
