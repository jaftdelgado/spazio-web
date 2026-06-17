"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  RentalConfirmInput,
  RentalPreviewInput,
} from "../../domain/rentals.entity";
import { rentalsHttpAdapter } from "../../infra/rentals.http-adapter";

export const useRentalPreview = (
  input: RentalPreviewInput,
  enabled = true,
) => {
  return useQuery({
    queryKey: [
      "rentals",
      "preview",
      input.propertyUuid,
      input.periodId,
      input.startDate,
      input.endDate,
    ],
    queryFn: () => rentalsHttpAdapter.preview(input),
    enabled,
    retry: false,
  });
};

export const useConfirmRental = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RentalConfirmInput) => rentalsHttpAdapter.confirm(input),
    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({ queryKey: ["rentals", "preview"] });
      void queryClient.invalidateQueries({
        queryKey: ["properties", "detail", input.propertyUuid],
      });
      void queryClient.invalidateQueries({
        queryKey: ["properties", "prices", input.propertyUuid],
      });
      void queryClient.invalidateQueries({ queryKey: ["properties", "list"] });
    },
  });
};
