"use client";

import { auth } from "@lib/auth/auth";
import { authStorage } from "@lib/auth/auth-storage";
import { httpClient } from "@lib/http/http-client";

import type { UserRepository } from "@users/domain/users.repository";
import {
  mapLoginResult,
  mapRefreshResult,
  mapRegisterResult,
  mapUpdateProfileResult,
  mapVerifyEmailResult,
} from "@users/infra/users.mapper";

type MessageResponse = {
  message: string;
};

type VerifyEmailDTO = Parameters<typeof mapVerifyEmailResult>[0];
type RegisterDTO = Parameters<typeof mapRegisterResult>[0];
type LoginDTO = Parameters<typeof mapLoginResult>[0];
type RefreshDTO = Parameters<typeof mapRefreshResult>[0];
type UpdateProfileDTO = Parameters<typeof mapUpdateProfileResult>[0];

export const usersHttpAdapter = {
  async preRegister(input) {
    return httpClient.post<MessageResponse>("/api/v1/users/pre-register", {
      email: input.email,
    });
  },
  async verifyEmail(input) {
    const response = await httpClient.post<VerifyEmailDTO>(
      "/api/v1/users/verify-email",
      {
        email: input.email,
        code: input.code,
      },
    );

    return mapVerifyEmailResult(response);
  },
  async completeRegister(input) {
    const response = await httpClient.post<RegisterDTO>("/api/v1/users/register", {
      verification_token: input.verificationToken,
      first_name: input.firstName,
      last_name: input.lastName,
      password: input.password,
      phone: input.phone,
      profile_picture_url: input.profilePictureUrl,
      role_id: input.roleId,
    });

    const result = mapRegisterResult(response);
    
    // In some cases register might also log you in automatically
    // If tokens are present in DTO (we should check mapper but assuming it might)
    // Actually, registration in this backend typically redirects to login
    
    auth.notifySessionChanged();

    return result;
  },
  async login(input) {
    const response = await httpClient.post<LoginDTO>("/api/v1/users/login", {
      email: input.email,
      password: input.password,
    });
    const result = mapLoginResult(response);

    authStorage.setAccessToken(result.accessToken);
    authStorage.setRefreshToken(result.refreshToken);

    auth.notifySessionChanged();

    return result;
  },
  async refresh() {
    // For manual token refresh, we might need to send the refresh token in the body
    // if cookies are not working
    const refreshToken = authStorage.getRefreshToken();
    
    const response = await httpClient.post<RefreshDTO>("/api/v1/users/refresh", {
      refresh_token: refreshToken
    });
    const result = mapRefreshResult(response);

    authStorage.setAccessToken(result.accessToken);
    authStorage.setRefreshToken(result.refreshToken);

    auth.notifySessionChanged();

    return result;
  },
  async logout() {
    try {
      const response = await httpClient.post<MessageResponse>("/api/v1/users/logout");
      return response;
    } catch (error) {
      // If 401, it means session is already invalid on server, so just proceed
      return { message: "Logged out locally" };
    } finally {
      authStorage.clearTokens();
      auth.notifySessionChanged();
    }
  },
  async updateProfile(input) {
    const response = await httpClient.put<UpdateProfileDTO>(
      "/api/v1/users/profile",
      {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        profile_picture_url: input.profilePictureUrl,
      },
    );

    return mapUpdateProfileResult(response);
  },
  async deleteAccount() {
    const response = await httpClient.delete<MessageResponse>("/api/v1/users/profile");
    authStorage.clearTokens();
    auth.notifySessionChanged();
    return response;
  },
} satisfies UserRepository;
