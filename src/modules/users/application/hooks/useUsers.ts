"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { auth } from "@lib/auth/auth";
import { authSessionQueryKey } from "@lib/auth/useAuth";

import type {
  AdminCreateUserInput,
  ChangePasswordInput,
  CompleteRegisterInput,
  ConfirmEmailChangeInput,
  ForgotPasswordInput,
  LoginInput,
  PreRegisterInput,
  RequestEmailChangeInput,
  ResetPasswordInput,
  UpdateProfileInput,
  UploadProfilePhotoInput,
  VerifyEmailChangeInput,
  VerifyEmailInput,
  VerifyPasswordResetCodeInput,
} from "@users/domain/users.entity";
import { usersHttpAdapter } from "@users/infra/users.http-adapter";

function invalidateAuthSession(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
}

export const useAssignableAgents = () =>
  useQuery({
    queryKey: ["users", "agents"],
    queryFn: () => usersHttpAdapter.listAgents(),
  });

export const usePreRegister = () =>
  useMutation({
    mutationFn: (input: PreRegisterInput) => usersHttpAdapter.preRegister(input),
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (input: VerifyEmailInput) => usersHttpAdapter.verifyEmail(input),
  });

export const useCompleteRegister = () =>
  useMutation({
    mutationFn: (input: CompleteRegisterInput) =>
      usersHttpAdapter.completeRegister(input),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (input: LoginInput) => usersHttpAdapter.login(input),
  });

export const useRefreshToken = () =>
  useMutation({
    mutationFn: () => usersHttpAdapter.refresh(),
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersHttpAdapter.logout(),
    onSettled: () => {
      invalidateAuthSession(queryClient);
    },
  });
};

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      usersHttpAdapter.requestPasswordReset(input),
  });

export const useVerifyPasswordResetCode = () =>
  useMutation({
    mutationFn: (input: VerifyPasswordResetCodeInput) =>
      usersHttpAdapter.verifyPasswordResetCode(input),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      usersHttpAdapter.resetPassword(input),
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      usersHttpAdapter.updateProfile(input),
    onSuccess: () => {
      invalidateAuthSession(queryClient);
    },
  });
};

export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadProfilePhotoInput) =>
      usersHttpAdapter.uploadProfilePhoto(input),
    onSuccess: () => {
      invalidateAuthSession(queryClient);
    },
  });
};

export const useRequestEmailChange = () =>
  useMutation({
    mutationFn: (input: RequestEmailChangeInput) =>
      usersHttpAdapter.requestEmailChange(input),
  });

export const useVerifyEmailChange = () =>
  useMutation({
    mutationFn: (input: VerifyEmailChangeInput) =>
      usersHttpAdapter.verifyEmailChange(input),
  });

export const useConfirmEmailChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfirmEmailChangeInput) =>
      usersHttpAdapter.confirmEmailChange(input),
    onSuccess: () => {
      invalidateAuthSession(queryClient);
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      usersHttpAdapter.changePassword(input),
  });

export const useAdminCreateUser = () =>
  useMutation({
    mutationFn: (input: AdminCreateUserInput) =>
      usersHttpAdapter.adminCreateUser(input),
  });

export const useDeleteAccount = () =>
  useMutation({
    mutationFn: () => usersHttpAdapter.deleteAccount(),
    onSuccess: () => {
      auth.notifySessionChanged();
    },
  });
