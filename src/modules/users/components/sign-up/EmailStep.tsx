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
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type EmailStepProps = {
  onSuccess: (email: string) => void;
};

const createEmailSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("auth.signUp.email.validation.required"))
      .max(254, t("auth.signUp.email.validation.tooLong"))
      .email(t("auth.signUp.email.validation.invalid"))
      .refine(
        (val) => !val.includes(" "),
        t("auth.signUp.email.validation.noSpaces"),
      ),
  });

type EmailFormValues = z.infer<ReturnType<typeof createEmailSchema>>;

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

export function EmailStep({ onSuccess }: EmailStepProps) {
  const { t } = useUsersTranslation();
  const preRegisterMutation = usePreRegister();
  const emailSchema = createEmailSchema(t);
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
        message: getErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={emailForm.handleSubmit(submitEmail)}>
      <SectionHeader
        title={t("auth.signUp.email.title")}
        description={t("auth.signUp.email.description")}
      />

      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.common.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.common.emailPlaceholder")}
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
          t("auth.signUp.email.submit")
        )}
      </Button>
    </form>
  );
}
