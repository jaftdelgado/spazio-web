"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { FormalizeSaleInput } from "../../domain/sales.entity";
import { salesHttpAdapter } from "../../infra/sales.http-adapter";

export const useFormalizeSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FormalizeSaleInput) => salesHttpAdapter.formalize(input),
    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({
        queryKey: ["properties", "detail", input.propertyUuid],
      });
      void queryClient.invalidateQueries({
        queryKey: ["properties", "prices", input.propertyUuid],
      });
      void queryClient.invalidateQueries({
        queryKey: ["properties", "history", input.propertyUuid],
      });
      void queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
      void queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
};
