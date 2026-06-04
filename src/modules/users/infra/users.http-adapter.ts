"use client";

import { auth } from "@lib/auth/auth";
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

    auth.notifySessionChanged();

    return mapRegisterResult(response);
  },
  async login(input) {
    const response = await httpClient.post<LoginDTO>("/api/v1/users/login", {
      email: input.email,
      password: input.password,
    });
    const result = mapLoginResult(response);

    auth.notifySessionChanged();

    return result;
  },
  async refresh() {
    const response = await httpClient.post<RefreshDTO>("/api/v1/users/refresh");
    const result = mapRefreshResult(response);

    auth.notifySessionChanged();

    return result;
  },
  async logout() {
    const response = await httpClient.post<MessageResponse>("/api/v1/users/logout");

    auth.notifySessionChanged();

    return response;
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
    return httpClient.delete<MessageResponse>("/api/v1/users/profile");
  },
} satisfies UserRepository;
