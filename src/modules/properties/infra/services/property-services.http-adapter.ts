"use client";

import { httpClient } from "@lib/http/http-client";

import type { UpdatePropertyServicesInput } from "@properties/domain/property.entity";
import type { PropertyRepository } from "@properties/domain/property.repository";
import { mapPropertyServices } from "./property-services.mapper";

export const propertyServicesHttpAdapter: Pick<
  PropertyRepository,
  "getPropertyServices" | "updatePropertyServices"
> = {
  async getPropertyServices(uuid: string) {
    const response = await httpClient.get<unknown>(
      `/api/v1/properties/${uuid}/services`,
    );

    return mapPropertyServices(
      response as Parameters<typeof mapPropertyServices>[0],
    );
  },

  async updatePropertyServices(
    uuid: string,
    input: UpdatePropertyServicesInput,
  ) {
    await httpClient.put<void>(`/api/v1/properties/${uuid}/services`, {
      service_ids: input.serviceIds,
    });
  },
};
