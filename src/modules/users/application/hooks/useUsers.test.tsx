import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { auth } from "@lib/auth/auth";
import { authSessionQueryKey } from "@lib/auth/useAuth";
import { usersHttpAdapter } from "@users/infra/users.http-adapter";

import {
  useAdminCreateUser,
  useChangePassword,
  useCompleteRegister,
  useConfirmEmailChange,
  useDeleteAccount,
  useLogin,
  useLogout,
  usePreRegister,
  useRefreshToken,
  useRequestEmailChange,
  useRequestPasswordReset,
  useResetPassword,
  useUpdateProfile,
  useUploadProfilePhoto,
  useVerifyEmail,
  useVerifyEmailChange,
  useVerifyPasswordResetCode,
} from "./useUsers";

vi.mock("@users/infra/users.http-adapter", () => ({
  usersHttpAdapter: {
    preRegister: vi.fn(),
    verifyEmail: vi.fn(),
    completeRegister: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    requestPasswordReset: vi.fn(),
    verifyPasswordResetCode: vi.fn(),
    resetPassword: vi.fn(),
    updateProfile: vi.fn(),
    uploadProfilePhoto: vi.fn(),
    requestEmailChange: vi.fn(),
    verifyEmailChange: vi.fn(),
    confirmEmailChange: vi.fn(),
    changePassword: vi.fn(),
    adminCreateUser: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

vi.mock("@lib/auth/auth", () => ({
  auth: {
    notifySessionChanged: vi.fn(),
  },
}));

describe("useUsers hooks", () => {
  it("executes passive mutations", async () => {
    vi.mocked(usersHttpAdapter.preRegister).mockResolvedValue({ message: "Sent" });
    vi.mocked(usersHttpAdapter.verifyEmail).mockResolvedValue({
      verificationToken: "verify-token",
    });
    vi.mocked(usersHttpAdapter.completeRegister).mockResolvedValue({
      message: "Created",
      user: {
        userId: 1,
        userUuid: "user-1",
        email: "ada@example.com",
        roleId: 3,
        roleName: "Client",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    });
    vi.mocked(usersHttpAdapter.login).mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        userId: 1,
        userUuid: "user-1",
        email: "ada@example.com",
        roleId: 3,
        roleName: "Client",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    });
    vi.mocked(usersHttpAdapter.refresh).mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    });
    vi.mocked(usersHttpAdapter.requestPasswordReset).mockResolvedValue({
      message: "Sent",
    });
    vi.mocked(usersHttpAdapter.verifyPasswordResetCode).mockResolvedValue({
      resetToken: "reset-token",
    });
    vi.mocked(usersHttpAdapter.resetPassword).mockResolvedValue({
      message: "Updated",
    });
    vi.mocked(usersHttpAdapter.requestEmailChange).mockResolvedValue({
      message: "Sent",
    });
    vi.mocked(usersHttpAdapter.verifyEmailChange).mockResolvedValue({
      verificationToken: "email-token",
    });
    vi.mocked(usersHttpAdapter.changePassword).mockResolvedValue({
      message: "Updated",
    });
    vi.mocked(usersHttpAdapter.adminCreateUser).mockResolvedValue({
      message: "Created",
      temporaryPassword: "temp-123",
      user: {
        userId: 1,
        userUuid: "user-1",
        email: "admin@example.com",
        roleId: 1,
        roleName: "Admin",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    });

    const { Wrapper } = createQueryClientWrapper();

    await renderHook(() => usePreRegister(), { wrapper: Wrapper }).result.current.mutateAsync({
      email: "ada@example.com",
    });
    await renderHook(() => useVerifyEmail(), { wrapper: Wrapper }).result.current.mutateAsync({
      email: "ada@example.com",
      code: "123456",
    });
    await renderHook(() => useCompleteRegister(), { wrapper: Wrapper }).result.current.mutateAsync({
      verificationToken: "token",
      firstName: "Ada",
      lastName: "Lovelace",
      password: "Password1!",
    });
    await renderHook(() => useLogin(), { wrapper: Wrapper }).result.current.mutateAsync({
      email: "ada@example.com",
      password: "Password1!",
    });
    await renderHook(() => useRefreshToken(), { wrapper: Wrapper }).result.current.mutateAsync();
    await renderHook(() => useRequestPasswordReset(), { wrapper: Wrapper }).result.current.mutateAsync({
      email: "ada@example.com",
    });
    await renderHook(() => useVerifyPasswordResetCode(), { wrapper: Wrapper }).result.current.mutateAsync({
      email: "ada@example.com",
      code: "123456",
    });
    await renderHook(() => useResetPassword(), { wrapper: Wrapper }).result.current.mutateAsync({
      resetToken: "token",
      newPassword: "Password1!",
    });
    await renderHook(() => useRequestEmailChange(), { wrapper: Wrapper }).result.current.mutateAsync({
      newEmail: "new@example.com",
    });
    await renderHook(() => useVerifyEmailChange(), { wrapper: Wrapper }).result.current.mutateAsync({
      newEmail: "new@example.com",
      code: "123456",
    });
    await renderHook(() => useChangePassword(), { wrapper: Wrapper }).result.current.mutateAsync({
      currentPassword: "Password1!",
      newPassword: "Password2!",
    });
    await renderHook(() => useAdminCreateUser(), { wrapper: Wrapper }).result.current.mutateAsync({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      roleId: 1,
    });

    expect(usersHttpAdapter.preRegister).toHaveBeenCalled();
    expect(usersHttpAdapter.verifyEmail).toHaveBeenCalled();
    expect(usersHttpAdapter.completeRegister).toHaveBeenCalled();
    expect(usersHttpAdapter.login).toHaveBeenCalled();
    expect(usersHttpAdapter.refresh).toHaveBeenCalled();
    expect(usersHttpAdapter.requestPasswordReset).toHaveBeenCalled();
    expect(usersHttpAdapter.verifyPasswordResetCode).toHaveBeenCalled();
    expect(usersHttpAdapter.resetPassword).toHaveBeenCalled();
    expect(usersHttpAdapter.requestEmailChange).toHaveBeenCalled();
    expect(usersHttpAdapter.verifyEmailChange).toHaveBeenCalled();
    expect(usersHttpAdapter.changePassword).toHaveBeenCalled();
    expect(usersHttpAdapter.adminCreateUser).toHaveBeenCalled();
  });

  it("invalidates auth queries after auth-sensitive mutations", async () => {
    vi.mocked(usersHttpAdapter.logout).mockResolvedValue({ message: "Logged out" });
    vi.mocked(usersHttpAdapter.updateProfile).mockResolvedValue({
      message: "Updated",
      user: {
        userId: 1,
        userUuid: "user-1",
        roleId: 3,
        roleName: "Client",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        statusId: 1,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    });
    vi.mocked(usersHttpAdapter.uploadProfilePhoto).mockResolvedValue({
      message: "Updated",
      user: {
        userId: 1,
        userUuid: "user-1",
        roleId: 3,
        roleName: "Client",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        statusId: 1,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    });
    vi.mocked(usersHttpAdapter.confirmEmailChange).mockResolvedValue({
      message: "Updated",
      user: {
        userId: 1,
        userUuid: "user-1",
        roleId: 3,
        roleName: "Client",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "new@example.com",
        statusId: 1,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    });
    vi.mocked(usersHttpAdapter.deleteAccount).mockResolvedValue({
      message: "Deleted",
    });

    const { Wrapper, queryClient } = createQueryClientWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await renderHook(() => useLogout(), { wrapper: Wrapper }).result.current.mutateAsync();
    await renderHook(() => useUpdateProfile(), { wrapper: Wrapper }).result.current.mutateAsync({
      firstName: "Ada",
      lastName: "Lovelace",
    });
    await renderHook(() => useUploadProfilePhoto(), { wrapper: Wrapper }).result.current.mutateAsync({
      file: new File(["image"], "photo.webp", { type: "image/webp" }),
    });
    await renderHook(() => useConfirmEmailChange(), { wrapper: Wrapper }).result.current.mutateAsync({
      verificationToken: "verify-token",
    });
    await renderHook(() => useDeleteAccount(), { wrapper: Wrapper }).result.current.mutateAsync();

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: authSessionQueryKey,
      });
    });
    expect(auth.notifySessionChanged).toHaveBeenCalled();
  });
});
