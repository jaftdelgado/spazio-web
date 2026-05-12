"use client";

import { httpClient } from "@lib/http/http-client";

import type { CatalogRepository } from "@catalogs/domain/catalog.repository";
import {
  mapModality,
  mapOrientation,
  mapPropertyType,
  mapRentPeriod,
} from "@catalogs/infra/catalog.mapper";

type CollectionResponse<T> = {
  data: T[];
};

type ModalityDTO = Parameters<typeof mapModality>[0];
type PropertyTypeDTO = Parameters<typeof mapPropertyType>[0];
type RentPeriodDTO = Parameters<typeof mapRentPeriod>[0];
type OrientationDTO = Parameters<typeof mapOrientation>[0];

const assertPositiveInteger = (value: number, fieldName: string) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
};

export const catalogHttpAdapter: CatalogRepository = {
  async listModalities() {
    const response = await httpClient.get<CollectionResponse<ModalityDTO>>(
      "/api/v1/catalogs/modalities",
    );

    return response.data.map(mapModality);
  },
  async listPropertyTypes() {
    const response = await httpClient.get<CollectionResponse<PropertyTypeDTO>>(
      "/api/v1/catalogs/property-types",
    );

    return response.data.map(mapPropertyType);
  },
  async listRentPeriods(propertyTypeId) {
    assertPositiveInteger(propertyTypeId, "propertyTypeId");

    const searchParams = new URLSearchParams({
      property_type_id: String(propertyTypeId),
    });
    const response = await httpClient.get<CollectionResponse<RentPeriodDTO>>(
      `/api/v1/catalogs/rent-periods?${searchParams.toString()}`,
    );

    return response.data.map(mapRentPeriod);
  },
  async listOrientations() {
    const response = await httpClient.get<CollectionResponse<OrientationDTO>>(
      "/api/v1/catalogs/orientations",
    );

    return response.data.map(mapOrientation);
  },
};
