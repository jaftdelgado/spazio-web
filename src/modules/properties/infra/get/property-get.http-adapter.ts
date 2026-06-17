"use client";

import { httpClient } from "@lib/http/http-client";
import type { PropertyRepository } from "@properties/domain/property.repository";
import {
  mapPropertyDetail,
  mapPropertyHistoryList,
  mapPropertyList,
  mapPropertyPricesHistoryList,
} from "./property-get.mapper";

export const propertyGetHttpAdapter: Pick<
  PropertyRepository,
  | "listProperties"
  | "getProperty"
  | "getPropertyHistory"
  | "getPropertyPricesHistory"
> = {
  async listProperties(filters) {
    const params = new URLSearchParams();

    if (filters.page !== undefined) {
      params.set("page", String(filters.page));
    }

    if (filters.pageSize !== undefined) {
      params.set("page_size", String(filters.pageSize));
    }

    if (filters.q) {
      params.set("q", filters.q);
    }

    if (filters.propertyTypeId !== undefined) {
      params.set("property_type_id", String(filters.propertyTypeId));
    }

    if (filters.modalityId !== undefined) {
      params.set("modality_id", String(filters.modalityId));
    }

    if (filters.countryId !== undefined) {
      params.set("country_id", String(filters.countryId));
    }

    if (filters.stateId !== undefined) {
      params.set("state_id", String(filters.stateId));
    }

    if (filters.cityId !== undefined) {
      params.set("city_id", String(filters.cityId));
    }

    if (filters.minPrice !== undefined) {
      params.set("min_price", String(filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      params.set("max_price", String(filters.maxPrice));
    }

    if (filters.minBedrooms !== undefined) {
      params.set("min_bedrooms", String(filters.minBedrooms));
    }

    if (filters.isFeatured !== undefined) {
      params.set("is_featured", String(filters.isFeatured));
    }

    if (filters.minParkingSpots !== undefined) {
      params.set("min_parking_spots", String(filters.minParkingSpots));
    }

    if (filters.petFriendly !== undefined) {
      params.set("pet_friendly", String(filters.petFriendly));
    }

    if (filters.sort) {
      params.set("sort", filters.sort);
    }

    if (filters.order) {
      params.set("order", filters.order);
    }

    filters.statusId?.forEach((id) => {
      params.append("status_id", String(id));
    });

    const query = params.toString();
    const url = query ? `/api/v1/properties?${query}` : "/api/v1/properties";
    const response = await httpClient.get<unknown>(url);

    return mapPropertyList(response as Parameters<typeof mapPropertyList>[0]);
  },

  async getProperty(uuid) {
    const response = await httpClient.get<unknown>(`/api/v1/properties/${uuid}`);

    return mapPropertyDetail(response as Parameters<typeof mapPropertyDetail>[0]);
  },

  async getPropertyHistory(uuid) {
    const response = await httpClient.get<unknown>(
      `/api/v1/properties/${uuid}/history`,
    );

    return mapPropertyHistoryList(
      response as Parameters<typeof mapPropertyHistoryList>[0],
    );
  },

  async getPropertyPricesHistory(uuid) {
    const response = await httpClient.get<unknown>(
      `/api/v1/properties/${uuid}/prices/history`,
    );

    return mapPropertyPricesHistoryList(
      response as Parameters<typeof mapPropertyPricesHistoryList>[0],
    );
  },
};