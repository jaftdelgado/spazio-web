"use client";

import type {
  Clause,
  ClauseValueTypeCode,
  ListClausesMeta,
} from "@clauses/domain/clause.entity";

type ClauseValueTypeDTO = {
  code: string;
};

type ClauseDTO = {
  clause_id: number;
  code: string;
  value_type: ClauseValueTypeDTO;
  sort_order: number;
};

type ListClausesMetaDTO = {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  query?: string | null;
};

export const mapClause = (dto: ClauseDTO): Clause => {
  return {
    clauseId: dto.clause_id,
    code: dto.code,
    valueType: {
      code: dto.value_type.code.toLowerCase() as ClauseValueTypeCode,
    },
    sortOrder: dto.sort_order,
  };
};

export const mapListClausesMeta = (
  dto: ListClausesMetaDTO,
): ListClausesMeta => {
  return {
    total: dto.total,
    page: dto.page,
    pageSize: dto.page_size,
    totalPages: dto.total_pages,
    query: dto.query ?? null,
  };
};
