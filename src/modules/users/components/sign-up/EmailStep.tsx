"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { HttpError } from "@lib/http/http-errors";
import { usePreRegister } from "@users/application/hooks/useUsers";

type EmailStepProps = {
  onSuccess: (email: string) => void;
};

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .max(254, "El correo es demasiado largo")
    .email("Ingresa un correo electrónico válido")
    .refine(
      (val) => !val.includes(" "),
      "El correo no puede contener espacios",
    ),
});

type EmailFormValues = z.infer<typeof emailSchema>;

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

export function EmailStep({ onSuccess }: EmailStepProps) {
  const preRegisterMutation = usePreRegister();
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const submitEmail = async (values: EmailFormValues) => {
    try {
      await preRegisterMutation.mutateAsync({ email: values.email });
      onSuccess(values.email);
    } catch (error) {
      emailForm.setError("root", {
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={emailForm.handleSubmit(submitEmail)}>
      <SectionHeader
        title="Crea tu cuenta"
        description="Ingresa tu correo electrónico para comenzar. Te enviaremos un código de verificación."
      />

      <div className="space-y-2">
        <Label htmlFor="email">Correo electronico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          aria-invalid={
            Boolean(emailForm.formState.errors.email) ||
            Boolean(emailForm.formState.errors.root?.message)
          }
          className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...emailForm.register("email")}
        />
        {emailForm.formState.errors.email?.message ? (
          <p className="text-sm text-destructive">
            {emailForm.formState.errors.email.message}
          </p>
        ) : null}
        {emailForm.formState.errors.root?.message ? (
          <p className="text-sm text-destructive">
            {emailForm.formState.errors.root.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={preRegisterMutation.isPending}
        className="h-10 w-full text-[15px]"
      >
        {preRegisterMutation.isPending ? (
          <HugeiconsIcon
            icon={Loading03Icon}
            size={18}
            className="animate-spin"
          />
        ) : (
          "Continuar"
        )}
      </Button>
    </form>
  );
}
