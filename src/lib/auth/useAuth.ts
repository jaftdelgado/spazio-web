"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { authStorage } from "@lib/auth/auth-storage";
import { HttpError } from "@lib/http/http-errors";
import type { UserProfile } from "@users/domain/users.entity";
import { usersHttpAdapter } from "@users/infra/users.http-adapter";

import { AUTH_SESSION_CHANGED_EVENT } from "./auth";

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
    queryFn: async () => {
      try {
        return await usersHttpAdapter.getProfile();
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          authStorage.clearTokens();
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 1 * 60 * 1000,
  });

  const user: UserProfile | null = data ?? null;

  return {
    user,
    isAuthenticated: user !== null,
    isLoading,
    role: user?.roleId ?? null,
  };
}
