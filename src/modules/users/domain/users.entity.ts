"use client";

export interface AuthUser {
  userId: number;
  userUuid: string;
  email: string;
  roleId: number;
  roleName: string;
  createdAt: Date;
}

export interface PreRegisterInput {
  email: string;
}

export interface VerifyEmailInput {
  email: string;
  code: string;
}

export interface CompleteRegisterInput {
  verificationToken: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  profilePictureUrl?: string;
  roleId?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
}

export interface VerifyEmailResult {
  verificationToken: string;
}

export interface RegisterResult {
  message: string;
  user: AuthUser;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileResult {
  message: string;
  user: AuthUser;
}

export interface MessageResult {
  message: string;
}
