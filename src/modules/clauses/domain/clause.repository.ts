"use client";

import type { ListClausesResult } from "@clauses/domain/clause.entity";

export interface ClauseRepository {
  listClauses(params: {
    modalityId: number;
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ListClausesResult>;
}
