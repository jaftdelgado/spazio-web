import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { HttpError } from "@lib/http/http-errors";

import { AUTH_SESSION_CHANGED_EVENT } from "./auth";
import { authStorage } from "./auth-storage";
import { authSessionQueryKey, useAuth } from "./useAuth";

const getProfile = vi.fn();
const clearTokens = vi.fn();

vi.mock("@users/infra/users.http-adapter", () => ({
  usersHttpAdapter: {
    getProfile: (...args: unknown[]) => getProfile(...args),
  },
}));

vi.mock("@lib/auth/auth-storage", async () => {
  const actual = await vi.importActual<typeof import("./auth-storage")>(
    "@lib/auth/auth-storage",
  );

  return {
    ...actual,
    authStorage: {
      ...actual.authStorage,
      clearTokens: () => clearTokens(),
    },
  };
});

describe("useAuth", () => {
  it("returns the authenticated user profile", async () => {
    getProfile.mockResolvedValue({
      userId: 1,
      userUuid: "user-1",
      roleId: 2,
      roleName: "Agent",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      statusId: 1,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe(2);
    expect(result.current.user?.email).toBe("ada@example.com");
  });

  it("clears stored tokens after a 401 response", async () => {
    getProfile.mockRejectedValue(new HttpError(401, { error: "Unauthorized" }));

    const { Wrapper } = createQueryClientWrapper();
    renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(clearTokens).toHaveBeenCalledTimes(1);
    });
  });

  it("invalidates the auth query after the session event fires", async () => {
    getProfile.mockResolvedValue({
      userId: 1,
      userUuid: "user-1",
      roleId: 3,
      roleName: "Client",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      statusId: 1,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    });

    const { Wrapper, queryClient } = createQueryClientWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(queryClient.getQueryData(authSessionQueryKey)).toBeDefined();
    });

    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: authSessionQueryKey,
      });
    });
  });
});
