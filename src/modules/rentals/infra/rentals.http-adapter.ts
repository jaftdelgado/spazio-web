"use client";

import { httpClient } from "@lib/http/http-client";

import type {
  RentalConfirmInput,
  RentalPreviewInput,
} from "../domain/rentals.entity";
import { mapRentalConfirmation, mapRentalPreview } from "./rentals.mapper";

export const rentalsHttpAdapter = {
  async preview(input: RentalPreviewInput) {
    const response = await httpClient.post<unknown>("/api/v1/rentals/preview", {
      property_uuid: input.propertyUuid,
      period_id: input.periodId,
      start_date: input.startDate,
      end_date: input.endDate,
    });

    return mapRentalPreview(response as Parameters<typeof mapRentalPreview>[0]);
  },

  async confirm(input: RentalConfirmInput) {
    const response = await httpClient.post<unknown>("/api/v1/rentals", {
      property_uuid: input.propertyUuid,
      client_uuid: input.clientUuid,
      period_id: input.periodId,
      start_date: input.startDate,
      end_date: input.endDate,
    });

    return mapRentalConfirmation(
      response as Parameters<typeof mapRentalConfirmation>[0],
    );
  },
};
