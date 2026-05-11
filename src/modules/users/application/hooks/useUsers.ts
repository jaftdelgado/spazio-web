"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { usersHttpAdapter } from "../../infra/users.http-adapter";

export function useUsers() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => usersHttpAdapter.list(),
  });

  const createUsersMutation = useMutation({
    mutationFn: () => Promise.resolve({}),
  });

  return {
    usersQuery,
    createUsersMutation,
  };
}
