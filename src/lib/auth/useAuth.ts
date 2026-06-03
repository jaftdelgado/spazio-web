"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { httpClient } from "@lib/http/http-client";

import { AUTH_SESSION_CHANGED_EVENT } from "./auth";

type ProfileResponse = {
  user_id: number;
  user_uuid: string;
  email: string;
  role_id: number;
  role_name: string;
  created_at: string;
};

export const authSessionQueryKey = ["auth", "session"] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => {
      queryClient.setQueryData(authSessionQueryKey, undefined);
      queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handler);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handler);
    };
  }, [queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: () => httpClient.get<ProfileResponse>("/api/v1/users/profile"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = data
    ? {
        userId: data.user_id,
        userUuid: data.user_uuid,
        email: data.email,
        roleId: data.role_id,
        roleName: data.role_name,
        createdAt: new Date(data.created_at),
      }
    : null;

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    role: user?.roleId ?? null,
  };
}
