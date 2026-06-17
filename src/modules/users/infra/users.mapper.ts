"use client";

import type {
  AdminCreateUserResult,
  AuthUser,
  EmailChangeVerificationResult,
  LoginResult,
  PasswordResetVerificationResult,
  RefreshResult,
  RegisterResult,
  UpdateProfileResult,
  UserProfile,
  VerifyEmailResult,
} from "@users/domain/users.entity";

type AuthUserDTO = {
  user_id: number;
  user_uuid: string;
  email: string;
  role_id: number;
  role_name: string;
  created_at: string;
};

type UserProfileDTO = {
  user_id: number;
  user_uuid: string;
  role_id: number;
  role_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  profile_picture_url?: string | null;
  status_id: number;
  created_at: string;
};

type VerifyEmailResultDTO = {
  verification_token: string;
};

type PasswordResetVerificationResultDTO = {
  reset_token: string;
};

type RegisterResultDTO = {
  message: string;
  user: AuthUserDTO;
};

type LoginResultDTO = {
  access_token: string;
  refresh_token: string;
  user: AuthUserDTO;
};

type RefreshResultDTO = {
  access_token: string;
  refresh_token: string;
};

type UpdateProfileResultDTO = {
  message: string;
  user: UserProfileDTO;
};

type AdminCreateUserResultDTO = {
  message: string;
  temporary_password: string;
  user: AuthUserDTO;
};

export const mapAuthUser = (dto: AuthUserDTO): AuthUser => {
  return {
    userId: dto.user_id,
    userUuid: dto.user_uuid,
    email: dto.email,
    roleId: dto.role_id,
    roleName: dto.role_name,
    createdAt: new Date(dto.created_at),
  };
};

export const mapUserProfile = (dto: UserProfileDTO): UserProfile => {
  return {
    userId: dto.user_id,
    userUuid: dto.user_uuid,
    roleId: dto.role_id,
    roleName: dto.role_name,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    phone: dto.phone ?? undefined,
    profilePictureUrl: dto.profile_picture_url ?? undefined,
    statusId: dto.status_id,
    createdAt: new Date(dto.created_at),
  };
};

export const mapVerifyEmailResult = (
  dto: VerifyEmailResultDTO,
): VerifyEmailResult => {
  return {
    verificationToken: dto.verification_token,
  };
};

export const mapPasswordResetVerificationResult = (
  dto: PasswordResetVerificationResultDTO,
): PasswordResetVerificationResult => {
  return {
    resetToken: dto.reset_token,
  };
};

export const mapEmailChangeVerificationResult = (
  dto: VerifyEmailResultDTO,
): EmailChangeVerificationResult => {
  return {
    verificationToken: dto.verification_token,
  };
};

export const mapRegisterResult = (dto: RegisterResultDTO): RegisterResult => {
  return {
    message: dto.message,
    user: mapAuthUser(dto.user),
  };
};

export const mapLoginResult = (dto: LoginResultDTO): LoginResult => {
  return {
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
    user: mapAuthUser(dto.user),
  };
};

export const mapRefreshResult = (dto: RefreshResultDTO): RefreshResult => {
  return {
    accessToken: dto.access_token,
    refreshToken: dto.refresh_token,
  };
};

export const mapUpdateProfileResult = (
  dto: UpdateProfileResultDTO,
): UpdateProfileResult => {
  return {
    message: dto.message,
    user: mapUserProfile(dto.user),
  };
};

export const mapAdminCreateUserResult = (
  dto: AdminCreateUserResultDTO,
): AdminCreateUserResult => {
  return {
    message: dto.message,
    temporaryPassword: dto.temporary_password,
    user: mapAuthUser(dto.user),
  };
};
