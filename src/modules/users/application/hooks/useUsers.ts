"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auth } from "@lib/auth/auth";

import type {
  CompleteRegisterInput,
  LoginInput,
  PreRegisterInput,
  UpdateProfileInput,
  VerifyEmailInput,
} from "@users/domain/users.entity";
import { usersHttpAdapter } from "@users/infra/users.http-adapter";

const usersMeQueryKey = ["users", "me"] as const;

export const usePreRegister = () => {
  return useMutation({
    mutationFn: (input: PreRegisterInput) => usersHttpAdapter.preRegister(input),
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) => usersHttpAdapter.verifyEmail(input),
  });
};

export const useCompleteRegister = () => {
  return useMutation({
    mutationFn: (input: CompleteRegisterInput) =>
      usersHttpAdapter.completeRegister(input),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (input: LoginInput) => usersHttpAdapter.login(input),
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => usersHttpAdapter.refresh(),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersHttpAdapter.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersMeQueryKey });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      usersHttpAdapter.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersMeQueryKey });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => usersHttpAdapter.deleteAccount(),
    onSuccess: () => {
      auth.notifySessionChanged();
    },
  });
};
