"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { serviceHttpAdapter } from "@services/infra/service.http-adapter";

type UseServicesParams = {
  q?: string;
  categoryId?: number;
  page?: number;
  pageSize?: number;
};

export const useServices = (params?: UseServicesParams) => {
  return useQuery({
    queryKey: [
      "services",
      params?.q?.trim() ?? "",
      params?.categoryId ?? "",
      params?.page ?? "",
      params?.pageSize ?? "",
    ],
    queryFn: () => serviceHttpAdapter.listServices(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useInfiniteServices = (
  q?: string,
  pageSize = 10,
  categoryId?: number,
) => {
  return useInfiniteQuery({
    queryKey: [
      "services",
      "infinite",
      q?.trim() ?? "",
      pageSize,
      categoryId ?? "",
    ],
    queryFn: ({ pageParam }) =>
      serviceHttpAdapter.listServices({
        q,
        categoryId,
        page: pageParam,
        pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    placeholderData: (previousData) => previousData,
  });
};
