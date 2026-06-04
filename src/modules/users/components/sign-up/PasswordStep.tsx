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

type PasswordStepProps = {
  verificationToken: string;
  firstName: string;
  lastName: string;
  phone: string;
  onBack: () => void;
  onError: (message: string) => void;
  onSuccess: () => void;
};

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "Mínimo 8 caracteres")
      .max(32, "Máximo 32 caracteres")
      .regex(/[A-Z]/, "Incluye al menos una letra mayúscula")
      .regex(/[0-9]/, "Incluye al menos un número")
      .regex(/[^A-Za-z0-9]/, "Incluye al menos un carácter especial (!@#$...)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpError) {
    const body = error.body as { error?: string } | null;

    return body?.error ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const completeRegisterMutation = useCompleteRegister();
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
      onError(getErrorMessage(error));
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
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
          <HugeiconsIcon icon={LockPasswordIcon} size={17} strokeWidth={1.7} />
        </span>
        <Input
          id={id}
          type={showValue ? "text" : "password"}
          autoComplete={fieldName === "password" ? "new-password" : "off"}
          placeholder={
            fieldName === "password"
              ? "Crea una contraseña"
              : "Repite tu contraseña"
          }
          aria-invalid={Boolean(error)}
          className="h-11 rounded-2xl border-input bg-background pl-10 pr-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...passwordForm.register(fieldName)}
        />
        <button
          type="button"
          aria-label={showValue ? "Ocultar contrasena" : "Mostrar contrasena"}
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70"
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
        title="Elige una contraseña"
        description="Crea una contraseña segura de 8 a 32 caracteres con mayúsculas, números y símbolos."
      />

      {renderPasswordInput({
        id: "password",
        label: "Contrasena",
        fieldName: "password",
        showValue: showPassword,
        onToggle: () => setShowPassword((value) => !value),
        error: passwordForm.formState.errors.password?.message,
      })}

      {renderPasswordInput({
        id: "confirmPassword",
        label: "Confirmar contrasena",
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
          className="h-9 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onBack}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          Volver
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
            "Crear cuenta"
          )}
        </Button>
      </div>
    </form>
  );
}
