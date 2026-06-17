import { auth } from "@lib/auth/auth";
import { authStorage } from "@lib/auth/auth-storage";
import { httpClient } from "@lib/http/http-client";
import { HttpError } from "@lib/http/http-errors";

import { usersHttpAdapter } from "./users.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@lib/auth/auth-storage", () => ({
  authStorage: {
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

vi.mock("@lib/auth/auth", () => ({
  auth: {
    notifySessionChanged: vi.fn(),
  },
}));

describe("usersHttpAdapter", () => {
  it("stores tokens after login", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      access_token: "access",
      refresh_token: "refresh",
      user: {
        user_id: 1,
        user_uuid: "user-1",
        email: "ada@example.com",
        role_id: 2,
        role_name: "Agent",
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    const result = await usersHttpAdapter.login({
      email: "ada@example.com",
      password: "Password1!",
    });

    expect(result.accessToken).toBe("access");
    expect(authStorage.setAccessToken).toHaveBeenCalledWith("access");
    expect(authStorage.setRefreshToken).toHaveBeenCalledWith("refresh");
    expect(auth.notifySessionChanged).toHaveBeenCalled();
  });

  it("returns a friendly result when logout receives 401", async () => {
    vi.mocked(httpClient.post).mockRejectedValue(
      new HttpError(401, { error: "Unauthorized" }),
    );

    await expect(usersHttpAdapter.logout()).resolves.toEqual({
      message: "Session already closed",
    });
    expect(authStorage.clearTokens).toHaveBeenCalled();
    expect(auth.notifySessionChanged).toHaveBeenCalled();
  });

  it("uploads a profile photo as form data", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      message: "Updated",
      user: {
        user_id: 1,
        user_uuid: "user-1",
        role_id: 2,
        role_name: "Agent",
        first_name: "Ada",
        last_name: "Lovelace",
        email: "ada@example.com",
        phone: null,
        profile_picture_url: "https://cdn.example.com/photo.webp",
        status_id: 1,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    const file = new File(["image"], "photo.webp", { type: "image/webp" });
    const result = await usersHttpAdapter.uploadProfilePhoto({ file });

    expect(result.user.profilePictureUrl).toBe("https://cdn.example.com/photo.webp");
    expect(httpClient.post).toHaveBeenCalledWith(
      "/api/v1/users/profile/photo",
      expect.any(FormData),
    );
  });

  it("clears tokens after account deletion", async () => {
    vi.mocked(httpClient.delete).mockResolvedValue({ message: "Deleted" });

    await expect(usersHttpAdapter.deleteAccount()).resolves.toEqual({
      message: "Deleted",
    });
    expect(authStorage.clearTokens).toHaveBeenCalled();
  });
});
