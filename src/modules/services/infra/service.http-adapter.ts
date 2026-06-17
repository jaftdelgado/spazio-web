"use client";

import { httpClient } from "@lib/http/http-client";

import type { ServiceRepository } from "@services/domain/service.repository";
import {
  mapListServicesMeta,
  mapService,
} from "@services/infra/service.mapper";

type ServiceDTO = Parameters<typeof mapService>[0];
type ListServicesMetaDTO = Parameters<typeof mapListServicesMeta>[0];

type ListServicesResponse = {
  data: ServiceDTO[];
  meta: ListServicesMetaDTO;
};

export const serviceHttpAdapter: ServiceRepository = {
  async listServices(params) {
    const searchParams = new URLSearchParams();

    if (params?.q && params.q.trim() !== "") {
      searchParams.set("q", params.q);
    }

    if (params?.categoryId !== undefined) {
      searchParams.set("category_id", String(params.categoryId));
    }

    if (params?.page !== undefined) {
      searchParams.set("page", String(params.page));
    }

    if (params?.pageSize !== undefined) {
      searchParams.set("page_size", String(params.pageSize));
    }

    const queryString = searchParams.toString();
    const response = await httpClient.get<ListServicesResponse>(
      queryString
        ? `/api/v1/services?${queryString}`
        : "/api/v1/services",
    );

    return {
      data: response.data.map(mapService),
      meta: mapListServicesMeta(response.meta),
    };
  },
};
