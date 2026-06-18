"use client";

import type {
  AgentListItem,
  AdminCreateUserInput,
  AdminCreateUserResult,
  ChangePasswordInput,
  CompleteRegisterInput,
  ConfirmEmailChangeInput,
  EmailChangeVerificationResult,
  ForgotPasswordInput,
  LoginInput,
  LoginResult,
  MessageResult,
  PasswordResetVerificationResult,
  PreRegisterInput,
  RefreshInput,
  RefreshResult,
  RegisterResult,
  RequestEmailChangeInput,
  ResetPasswordInput,
  UpdateProfileInput,
  UpdateProfileResult,
  UploadProfilePhotoInput,
  UserProfile,
  VerifyEmailChangeInput,
  VerifyEmailInput,
  VerifyEmailResult,
  VerifyPasswordResetCodeInput,
} from "./users.entity";

export interface UserRepository {
  listAgents(): Promise<AgentListItem[]>;
  preRegister(input: PreRegisterInput): Promise<MessageResult>;
  verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResult>;
  completeRegister(input: CompleteRegisterInput): Promise<RegisterResult>;
  login(input: LoginInput): Promise<LoginResult>;
  refresh(input?: RefreshInput): Promise<RefreshResult>;
  logout(input?: RefreshInput): Promise<MessageResult>;
  requestPasswordReset(input: ForgotPasswordInput): Promise<MessageResult>;
  verifyPasswordResetCode(
    input: VerifyPasswordResetCodeInput,
  ): Promise<PasswordResetVerificationResult>;
  resetPassword(input: ResetPasswordInput): Promise<MessageResult>;
  getProfile(): Promise<UserProfile>;
  updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult>;
  uploadProfilePhoto(
    input: UploadProfilePhotoInput,
  ): Promise<UpdateProfileResult>;
  requestEmailChange(input: RequestEmailChangeInput): Promise<MessageResult>;
  verifyEmailChange(
    input: VerifyEmailChangeInput,
  ): Promise<EmailChangeVerificationResult>;
  confirmEmailChange(
    input: ConfirmEmailChangeInput,
  ): Promise<UpdateProfileResult>;
  changePassword(input: ChangePasswordInput): Promise<MessageResult>;
  adminCreateUser(input: AdminCreateUserInput): Promise<AdminCreateUserResult>;
  deleteAccount(): Promise<MessageResult>;
}
