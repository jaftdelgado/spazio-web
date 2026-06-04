"use client";

import type {
  AuthUser,
  LoginResult,
  RefreshResult,
  RegisterResult,
  UpdateProfileResult,
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

type VerifyEmailResultDTO = {
  verification_token: string;
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

export const mapVerifyEmailResult = (
  dto: VerifyEmailResultDTO,
): VerifyEmailResult => {
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
    user: mapAuthUser(dto.user),
  };
};
