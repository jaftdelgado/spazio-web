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

    if (params?.limit !== undefined) {
      searchParams.set("limit", String(params.limit));
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
