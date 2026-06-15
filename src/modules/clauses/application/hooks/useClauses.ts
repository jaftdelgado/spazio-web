"use client";

import { useQuery } from "@tanstack/react-query";

import { clauseHttpAdapter } from "@clauses/infra/clause.http-adapter";

export const useClauses = (params: {
  modalityId: number | null;
  q?: string;
  page?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [
      "clauses",
      params.modalityId ?? "",
      params?.q ?? "",
      params?.page ?? "",
      params?.pageSize ?? "",
    ],
    queryFn: () =>
      clauseHttpAdapter.listClauses({
        modalityId: params.modalityId as number,
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
      }),
    enabled: params.modalityId !== null,
  });
};
