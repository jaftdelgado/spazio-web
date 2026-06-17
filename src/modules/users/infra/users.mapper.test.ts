import {
  mapAdminCreateUserResult,
  mapLoginResult,
  mapPasswordResetVerificationResult,
  mapRefreshResult,
  mapUpdateProfileResult,
  mapUserProfile,
  mapVerifyEmailResult,
} from "./users.mapper";

describe("users.mapper", () => {
  it("maps verification and refresh results", () => {
    expect(
      mapVerifyEmailResult({ verification_token: "verify-token" }),
    ).toEqual({ verificationToken: "verify-token" });
    expect(
      mapPasswordResetVerificationResult({ reset_token: "reset-token" }),
    ).toEqual({ resetToken: "reset-token" });
    expect(
      mapRefreshResult({ access_token: "a", refresh_token: "r" }),
    ).toEqual({ accessToken: "a", refreshToken: "r" });
  });

  it("maps profile and login payloads", () => {
    const profile = mapUserProfile({
      user_id: 1,
      user_uuid: "user-1",
      role_id: 2,
      role_name: "Agent",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@example.com",
      phone: null,
      profile_picture_url: null,
      status_id: 1,
      created_at: "2026-01-01T00:00:00Z",
    });

    expect(profile.firstName).toBe("Ada");
    expect(profile.createdAt).toBeInstanceOf(Date);

    expect(
      mapLoginResult({
        access_token: "a",
        refresh_token: "r",
        user: {
          user_id: 1,
          user_uuid: "user-1",
          email: "ada@example.com",
          role_id: 2,
          role_name: "Agent",
          created_at: "2026-01-01T00:00:00Z",
        },
      }),
    ).toEqual(
      expect.objectContaining({
        accessToken: "a",
        refreshToken: "r",
      }),
    );
  });

  it("maps update profile and admin create payloads", () => {
    expect(
      mapUpdateProfileResult({
        message: "Updated",
        user: {
          user_id: 1,
          user_uuid: "user-1",
          role_id: 2,
          role_name: "Agent",
          first_name: "Ada",
          last_name: "Lovelace",
          email: "ada@example.com",
          phone: "555",
          profile_picture_url: "https://cdn.example.com/photo.webp",
          status_id: 1,
          created_at: "2026-01-01T00:00:00Z",
        },
      }),
    ).toEqual(
      expect.objectContaining({
        message: "Updated",
      }),
    );

    expect(
      mapAdminCreateUserResult({
        message: "Created",
        temporary_password: "temp-123",
        user: {
          user_id: 1,
          user_uuid: "user-1",
          email: "ada@example.com",
          role_id: 1,
          role_name: "Admin",
          created_at: "2026-01-01T00:00:00Z",
        },
      }),
    ).toEqual(
      expect.objectContaining({
        temporaryPassword: "temp-123",
      }),
    );
  });
});
