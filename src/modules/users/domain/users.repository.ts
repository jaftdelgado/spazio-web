"use client";

import type {
  CompleteRegisterInput,
  LoginInput,
  LoginResult,
  MessageResult,
  PreRegisterInput,
  RefreshResult,
  RegisterResult,
  UpdateProfileInput,
  UpdateProfileResult,
  VerifyEmailInput,
  VerifyEmailResult,
} from "./users.entity";

export interface UserRepository {
  preRegister(input: PreRegisterInput): Promise<MessageResult>;
  verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResult>;
  completeRegister(input: CompleteRegisterInput): Promise<RegisterResult>;
  login(input: LoginInput): Promise<LoginResult>;
  refresh(): Promise<RefreshResult>;
  logout(): Promise<MessageResult>;
  updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult>;
  deleteAccount(): Promise<MessageResult>;
}
