"use client";

import type {
  PropertyClause,
  PropertyClauses,
} from "@properties/domain/property.entity";

type PropertyClauseDTO = {
  clause_id: number;
  boolean_value?: boolean | null;
  integer_value?: number | null;
  min_value?: number | null;
  max_value?: number | null;
};

type GetPropertyClausesDTO = {
  data: PropertyClauseDTO[];
};

const mapClause = (dto: PropertyClauseDTO): PropertyClause => ({
  clauseId: dto.clause_id,
  booleanValue: dto.boolean_value ?? null,
  integerValue: dto.integer_value ?? null,
  minValue: dto.min_value ?? null,
  maxValue: dto.max_value ?? null,
});

export const mapPropertyClauses = (
  dto: GetPropertyClausesDTO,
): PropertyClauses => ({
  clauses: dto.data.map(mapClause),
});
