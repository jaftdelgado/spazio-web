import { z } from "zod";

import { createStrongPasswordSchema } from "@users/lib/password-schema";

export const profilePhotoMaxSizeBytes = 5 * 1024 * 1024;
export const supportedProfilePhotoTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const profileSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, t("profile.personal.validation.firstName")),
    lastName: z
      .string()
      .trim()
      .min(1, t("profile.personal.validation.lastName")),
    phone: z.string().optional(),
  });

export const requestEmailSchema = (t: (key: string) => string) =>
  z.object({
    newEmail: z.string().email(t("auth.login.validation.emailInvalid")),
  });

export const verifyEmailChangeSchema = z.object({
  code: z.string().length(6),
});

export const changePasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, t("profile.password.validation.currentRequired")),
      newPassword: createStrongPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.signUp.password.validation.confirmMismatch"),
      path: ["confirmPassword"],
    });

export function getInitials(firstName?: string, lastName?: string, email?: string) {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  const source = fullName || email || "SP";

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function validateProfilePhoto(
  file: File | null,
  t: (key: string) => string,
) {
  if (!file) {
    return t("profile.photo.validation.required");
  }

  if (!supportedProfilePhotoTypes.includes(file.type)) {
    return t("profile.photo.validation.format");
  }

  if (file.size > profilePhotoMaxSizeBytes) {
    return t("profile.photo.validation.size");
  }

  return null;
}

export type PostChangeDialogState = {
  description: string;
  open: boolean;
  title: string;
};
