"use client";

export type ClauseValueTypeCode = "boolean" | "range" | "integer";

export interface ClauseValueType {
  code: ClauseValueTypeCode;
}

export interface Clause {
  clauseId: number;
  code: string;
  valueType: ClauseValueType;
  sortOrder: number;
}

export type ClauseValue =
  | { type: "boolean"; value: boolean }
  | { type: "range"; min: number | null; max: number | null }
  | { type: "integer"; value: number | null };

export type ClauseEntry = {
  clauseId: number;
  value: ClauseValue;
};

export interface ListClausesMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query?: string | null;
}

export interface ListClausesResult {
  data: Clause[];
  meta: ListClausesMeta;
}
