"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { uploadsHttpAdapter } from "../../infra/uploads.http-adapter";

export function useUploads() {
  const uploadsQuery = useQuery({
    queryKey: ["uploads"],
    queryFn: () => uploadsHttpAdapter.list(),
  });

  const createUploadsMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    uploadsQuery,
    createUploadsMutation,
  };
}
