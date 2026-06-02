"use client";

import { useQuery } from "@tanstack/react-query";

import { serviceHttpAdapter } from "@services/infra/service.http-adapter";

export const useServices = (params?: { q?: string; limit?: number }) => {
  return useQuery({
    queryKey: ["services", params?.q ?? "", params?.limit ?? ""],
    queryFn: () => serviceHttpAdapter.listServices(params),
  });
};
