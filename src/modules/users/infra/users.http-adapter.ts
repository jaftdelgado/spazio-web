"use client";

import { auth } from "@lib/auth/auth";
import { authStorage } from "@lib/auth/auth-storage";
import { httpClient } from "@lib/http/http-client";
import { HttpError } from "@lib/http/http-errors";

import type { UserRepository } from "@users/domain/users.repository";
import {
  mapAdminCreateUserResult,
  mapEmailChangeVerificationResult,
  mapLoginResult,
  mapPasswordResetVerificationResult,
  mapRefreshResult,
  mapRegisterResult,
  mapUpdateProfileResult,
  mapUserProfile,
  mapVerifyEmailResult,
} from "@users/infra/users.mapper";

type MessageResponse = {
  message: string;
};

type VerifyEmailDTO = Parameters<typeof mapVerifyEmailResult>[0];
type PasswordResetVerificationDTO =
  Parameters<typeof mapPasswordResetVerificationResult>[0];
type EmailChangeVerificationDTO =
  Parameters<typeof mapEmailChangeVerificationResult>[0];
type RegisterDTO = Parameters<typeof mapRegisterResult>[0];
type LoginDTO = Parameters<typeof mapLoginResult>[0];
type RefreshDTO = Parameters<typeof mapRefreshResult>[0];
type UpdateProfileDTO = Parameters<typeof mapUpdateProfileResult>[0];
type UserProfileDTO = Parameters<typeof mapUserProfile>[0];
type AdminCreateUserDTO = Parameters<typeof mapAdminCreateUserResult>[0];

function buildPhotoUploadFormData(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

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

    authStorage.setAccessToken(result.accessToken);
    authStorage.setRefreshToken(result.refreshToken);
    auth.notifySessionChanged();

    return result;
  },

  async refresh() {
    const response = await httpClient.post<RefreshDTO>("/api/v1/users/refresh");
    const result = mapRefreshResult(response);

    authStorage.setAccessToken(result.accessToken);
    authStorage.setRefreshToken(result.refreshToken);
    auth.notifySessionChanged();

    return result;
  },

  async logout() {
    try {
      return await httpClient.post<MessageResponse>("/api/v1/users/logout");
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        return {
          message: "Session already closed",
        };
      }

      throw error;
    } finally {
      authStorage.clearTokens();
      auth.notifySessionChanged();
    }
  },

  async requestPasswordReset(input) {
    return httpClient.post<MessageResponse>("/api/v1/users/forgot-password", {
      email: input.email,
    });
  },

  async verifyPasswordResetCode(input) {
    const response = await httpClient.post<PasswordResetVerificationDTO>(
      "/api/v1/users/forgot-password/verify",
      {
        email: input.email,
        code: input.code,
      },
    );

    return mapPasswordResetVerificationResult(response);
  },

  async resetPassword(input) {
    return httpClient.post<MessageResponse>("/api/v1/users/forgot-password/reset", {
      reset_token: input.resetToken,
      new_password: input.newPassword,
    });
  },

  async getProfile() {
    const response = await httpClient.get<UserProfileDTO>("/api/v1/users/profile");
    return mapUserProfile(response);
  },

  async updateProfile(input) {
    const response = await httpClient.put<UpdateProfileDTO>(
      "/api/v1/users/profile",
      {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      },
    );

    auth.notifySessionChanged();

    return mapUpdateProfileResult(response);
  },

  async uploadProfilePhoto(input) {
    const response = await httpClient.post<UpdateProfileDTO>(
      "/api/v1/users/profile/photo",
      buildPhotoUploadFormData(input.file),
    );

    auth.notifySessionChanged();

    return mapUpdateProfileResult(response);
  },

  async requestEmailChange(input) {
    return httpClient.post<MessageResponse>("/api/v1/users/profile/email/request", {
      new_email: input.newEmail,
    });
  },

  async verifyEmailChange(input) {
    const response = await httpClient.post<EmailChangeVerificationDTO>(
      "/api/v1/users/profile/email/verify",
      {
        new_email: input.newEmail,
        code: input.code,
      },
    );

    return mapEmailChangeVerificationResult(response);
  },

  async confirmEmailChange(input) {
    const response = await httpClient.put<UpdateProfileDTO>(
      "/api/v1/users/profile/email",
      {
        verification_token: input.verificationToken,
      },
    );

    auth.notifySessionChanged();

    return mapUpdateProfileResult(response);
  },

  async changePassword(input) {
    return httpClient.put<MessageResponse>("/api/v1/users/profile/password", {
      current_password: input.currentPassword,
      new_password: input.newPassword,
    });
  },

  async adminCreateUser(input) {
    const response = await httpClient.post<AdminCreateUserDTO>("/api/v1/users/staff", {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      role_id: input.roleId,
    });

    return mapAdminCreateUserResult(response);
  },

  async deleteAccount() {
    const response = await httpClient.delete<MessageResponse>("/api/v1/users/profile");
    authStorage.clearTokens();
    auth.notifySessionChanged();
    return response;
  },
} satisfies UserRepository;
