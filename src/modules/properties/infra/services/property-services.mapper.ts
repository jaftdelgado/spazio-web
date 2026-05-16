"use client";

import type { PropertyServices } from "@properties/domain/property.entity";

type PropertyServicesDataDTO = {
  service_ids: number[];
};

type GetPropertyServicesDTO = {
  data: PropertyServicesDataDTO;
};

export const mapPropertyServices = (
  dto: GetPropertyServicesDTO,
): PropertyServices => ({
  serviceIds: dto.data.service_ids,
});
