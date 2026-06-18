"use client";

export interface AuthUser {
  userId: number;
  userUuid: string;
  email: string;
  roleId: number;
  roleName: string;
  createdAt: Date;
}

export interface UserProfile {
  userId: number;
  userUuid: string;
  roleId: number;
  roleName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePictureUrl?: string;
  statusId: number;
  createdAt: Date;
}

export interface AgentListItem {
  userId: number;
  userUuid: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
}

export interface ListAgentsResponse {
  data: AgentListItem[];
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

export interface RefreshInput {
  refreshToken?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyPasswordResetCodeInput {
  email: string;
  code: string;
}

export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface RequestEmailChangeInput {
  newEmail: string;
}

export interface VerifyEmailChangeInput {
  newEmail: string;
  code: string;
}

export interface ConfirmEmailChangeInput {
  verificationToken: string;
}

export interface UploadProfilePhotoInput {
  file: File;
}

export interface AdminCreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: number;
}

export interface VerifyEmailResult {
  verificationToken: string;
}

export interface PasswordResetVerificationResult {
  resetToken: string;
}

export interface EmailChangeVerificationResult {
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
  user: UserProfile;
}

export interface AdminCreateUserResult {
  message: string;
  temporaryPassword: string;
  user: AuthUser;
}

export interface MessageResult {
  message: string;
}
