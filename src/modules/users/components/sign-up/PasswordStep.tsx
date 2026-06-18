"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft01Icon,
  Loading03Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { HttpError } from "@lib/http/http-errors";
import { useCompleteRegister } from "@users/application/hooks/useUsers";
import { PasswordStrengthBar } from "@users/components/sign-up/PasswordStrengthBar";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type PasswordStepProps = {
  verificationToken: string;
  firstName: string;
  lastName: string;
  phone: string;
  onBack: () => void;
  onError: (message: string) => void;
  onSuccess: () => void;
};

const createPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z
        .string()
        .min(1, t("auth.signUp.password.validation.required"))
        .min(8, t("auth.signUp.password.validation.minLength"))
        .max(32, t("auth.signUp.password.validation.maxLength"))
        .regex(/[A-Z]/, t("auth.signUp.password.validation.uppercase"))
        .regex(/[0-9]/, t("auth.signUp.password.validation.number"))
        .regex(
          /[^A-Za-z0-9]/,
          t("auth.signUp.password.validation.specialCharacter"),
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.signUp.password.validation.confirmMismatch"),
      path: ["confirmPassword"],
    });

type PasswordFormValues = z.infer<ReturnType<typeof createPasswordSchema>>;

const getErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (error instanceof HttpError) {
    const body = error.body as { error?: string } | null;

    return body?.error ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export function PasswordStep({
  verificationToken,
  firstName,
  lastName,
  phone,
  onBack,
  onError,
  onSuccess,
}: PasswordStepProps) {
  const { t } = useUsersTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const completeRegisterMutation = useCompleteRegister();
  const passwordSchema = createPasswordSchema(t);
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword =
    useWatch({
      control: passwordForm.control,
      name: "password",
    }) ?? "";

  const submitPassword = async (values: PasswordFormValues) => {
    try {
      await completeRegisterMutation.mutateAsync({
        verificationToken,
        firstName,
        lastName,
        phone: phone || undefined,
        password: values.password,
      });
      onSuccess();
    } catch (error) {
      onError(getErrorMessage(error, t("auth.common.unexpectedError")));
    }
  };

  const renderPasswordInput = ({
    id,
    label,
    fieldName,
    showValue,
    onToggle,
    error,
  }: {
    id: string;
    label: string;
    fieldName: "password" | "confirmPassword";
    showValue: boolean;
    onToggle: () => void;
    error?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <HugeiconsIcon icon={LockPasswordIcon} size={17} strokeWidth={1.7} />
        </span>
        <Input
          id={id}
          type={showValue ? "text" : "password"}
          autoComplete={fieldName === "password" ? "new-password" : "off"}
          placeholder={t(
            fieldName === "password"
              ? "auth.signUp.password.fields.password.placeholder"
              : "auth.signUp.password.fields.confirmPassword.placeholder",
          )}
          aria-invalid={Boolean(error)}
          className="h-11 border-input bg-background pl-10 pr-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...passwordForm.register(fieldName)}
        />
        <button
          type="button"
          aria-label={
            showValue
              ? t("auth.common.hidePassword")
              : t("auth.common.showPassword")
          }
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon
            icon={showValue ? ViewOffSlashIcon : ViewIcon}
            size={17}
            strokeWidth={1.7}
          />
        </button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );

  return (
    <form
      className="space-y-5"
      onSubmit={passwordForm.handleSubmit(submitPassword)}
    >
      <SectionHeader
        title={t("auth.signUp.password.title")}
        description={t("auth.signUp.password.description")}
      />

      {renderPasswordInput({
        id: "password",
        label: t("auth.signUp.password.fields.password.label"),
        fieldName: "password",
        showValue: showPassword,
        onToggle: () => setShowPassword((value) => !value),
        error: passwordForm.formState.errors.password?.message,
      })}

      {renderPasswordInput({
        id: "confirmPassword",
        label: t("auth.signUp.password.fields.confirmPassword.label"),
        fieldName: "confirmPassword",
        showValue: showConfirm,
        onToggle: () => setShowConfirm((value) => !value),
        error: passwordForm.formState.errors.confirmPassword?.message,
      })}

      <PasswordStrengthBar password={watchedPassword} />

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onBack}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          {t("auth.common.actions.back")}
        </Button>
        <Button
          type="submit"
          disabled={completeRegisterMutation.isPending}
          className="h-10 min-w-32 px-5 text-[15px]"
        >
          {completeRegisterMutation.isPending ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={18}
              className="animate-spin"
            />
          ) : (
            t("auth.signUp.password.submit")
          )}
        </Button>
      </div>
    </form>
  );
}
