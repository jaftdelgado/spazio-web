"use client";

import { httpClient } from "@lib/http/http-client";

import type { FormalizeSaleInput } from "../domain/sales.entity";
import { mapSaleFormalization } from "./sales.mapper";

export const salesHttpAdapter = {
  async formalize(input: FormalizeSaleInput) {
    const response = await httpClient.post<unknown>("/api/v1/sales", {
      property_uuid: input.propertyUuid,
      agreed_amount: input.agreedAmount,
    });

    return mapSaleFormalization(
      response as Parameters<typeof mapSaleFormalization>[0],
    );
  },
};
