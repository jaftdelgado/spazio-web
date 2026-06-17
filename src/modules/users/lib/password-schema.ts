"use client";

import { z } from "zod";

export const createStrongPasswordSchema = (t: (key: string) => string) =>
  z
    .string()
    .min(1, t("auth.signUp.password.validation.required"))
    .min(8, t("auth.signUp.password.validation.minLength"))
    .max(32, t("auth.signUp.password.validation.maxLength"))
    .regex(/[A-Z]/, t("auth.signUp.password.validation.uppercase"))
    .regex(/[0-9]/, t("auth.signUp.password.validation.number"))
    .regex(
      /[^A-Za-z0-9]/,
      t("auth.signUp.password.validation.specialCharacter"),
    );
