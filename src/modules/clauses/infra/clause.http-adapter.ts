"use client";

import { httpClient } from "@lib/http/http-client";

import type { ClauseRepository } from "@clauses/domain/clause.repository";
import {
  mapClause,
  mapListClausesMeta,
} from "@clauses/infra/clause.mapper";

type ClauseDTO = Parameters<typeof mapClause>[0];
type ListClausesMetaDTO = Parameters<typeof mapListClausesMeta>[0];

type ListClausesResponse = {
  data: ClauseDTO[];
  meta: ListClausesMetaDTO;
};

export const clauseHttpAdapter: ClauseRepository = {
  async listClauses(params) {
    const searchParams = new URLSearchParams();

    searchParams.set("modality_id", String(params.modalityId));

    if (params.q && params.q.trim() !== "") {
      searchParams.set("q", params.q);
    }

    if (params.page !== undefined) {
      searchParams.set("page", String(params.page));
    }

    if (params.pageSize !== undefined) {
      searchParams.set("page_size", String(params.pageSize));
    }

    const response = await httpClient.get<ListClausesResponse>(
      `/api/v1/clauses?${searchParams.toString()}`,
    );

    return {
      data: response.data.map(mapClause),
      meta: mapListClausesMeta(response.meta),
    };
  },
};
