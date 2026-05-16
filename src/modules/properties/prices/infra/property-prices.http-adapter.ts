"use client";

import { httpClient } from "@lib/http/http-client";

import type { UpdatePropertyPricesInput } from "@properties/domain/property.entity";
import type { PropertyRepository } from "@properties/domain/property.repository";
import { mapPropertyPrices } from "./property-prices.mapper";

export const propertyPricesHttpAdapter: Pick<
  PropertyRepository,
  "getPropertyPrices" | "updatePropertyPrices"
> = {
  async getPropertyPrices(uuid: string) {
    const response = await httpClient.get<unknown>(
      `/api/v1/properties/${uuid}/prices`,
    );

    return mapPropertyPrices(response as Parameters<typeof mapPropertyPrices>[0]);
  },

  async updatePropertyPrices(uuid: string, input: UpdatePropertyPricesInput) {
    const body: Record<string, unknown> = {};

    if (input.salePrice !== undefined) {
      body.sale_price = {
        sale_price: input.salePrice.salePrice,
        is_negotiable: input.salePrice.isNegotiable,
      };
    }

    if (input.rentPrices !== undefined) {
      body.rent_prices = input.rentPrices.map((rentPrice) => ({
        period_id: rentPrice.periodId,
        rent_price: rentPrice.rentPrice,
        deposit: rentPrice.deposit,
        is_negotiable: rentPrice.isNegotiable,
      }));
    }

    await httpClient.put<void>(`/api/v1/properties/${uuid}/prices`, body);
  },
};
