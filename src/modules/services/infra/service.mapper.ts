"use client";

import type {
  ListServicesMeta,
  Service,
} from "@services/domain/service.entity";

type ServiceDTO = {
  service_id: number;
  code: string;
  icon: string;
  category_code: string;
};

type ListServicesMetaDTO = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  query?: string | null;
};

export const mapService = (dto: ServiceDTO): Service => {
  return {
    serviceId: dto.service_id,
    code: dto.code,
    icon: dto.icon,
    categoryCode: dto.category_code,
  };
};

export const mapListServicesMeta = (
  dto: ListServicesMetaDTO,
): ListServicesMeta => {
  return {
    total: dto.total,
    page: dto.page,
    pageSize: dto.page_size,
    totalPages: dto.total_pages,
    query: dto.query ?? null,
  };
};
