"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loading03Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { HttpError } from "@lib/http/http-errors";
import { useLogin } from "@users/application/hooks/useUsers";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";
import { AuthShell } from "@users/layouts/AuthShell";

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("auth.login.validation.emailInvalid")),
    password: z.string().min(1, t("auth.login.validation.passwordRequired")),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

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

function LoginForm() {
  const { t } = useUsersTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();
  const loginSchema = createLoginSchema(t);
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitLogin = async (values: LoginFormValues) => {
    try {
      const result = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      if (result.user.roleId === 1 || result.user.roleId === 2) {
        router.push("/admin");
      } else {
        router.push("/explore");
      }
    } catch (error) {
      loginForm.setError("root", {
        message: getErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  return (
    <>
      <SectionHeader
        className="mb-10"
        title={t("auth.login.title")}
        description={t("auth.login.description")}
      />

      <form
        className="space-y-5"
        onSubmit={loginForm.handleSubmit(submitLogin)}
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.common.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.common.emailPlaceholder")}
            aria-invalid={Boolean(loginForm.formState.errors.email)}
            className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            {...loginForm.register("email")}
          />
          {loginForm.formState.errors.email?.message ? (
            <p className="text-sm text-destructive">
              {loginForm.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.common.passwordLabel")}</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                size={17}
                strokeWidth={1.7}
              />
            </span>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("auth.login.passwordPlaceholder")}
              aria-invalid={Boolean(loginForm.formState.errors.password)}
              className="h-11 rounded-2xl border-input bg-background pl-10 pr-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
              {...loginForm.register("password")}
            />
            <button
              type="button"
              aria-label={
                showPassword
                  ? t("auth.common.hidePassword")
                  : t("auth.common.showPassword")
              }
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                size={17}
                strokeWidth={1.7}
              />
            </button>
          </div>
          {loginForm.formState.errors.password?.message ? (
            <p className="text-sm text-destructive">
              {loginForm.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {loginForm.formState.errors.root?.message ? (
          <p className="text-sm text-destructive">
            {loginForm.formState.errors.root.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-11 w-full rounded-2xl text-[15px]"
        >
          {loginMutation.isPending ? (
            <HugeiconsIcon
              icon={Loading03Icon}
              size={18}
              className="animate-spin"
            />
          ) : (
            t("auth.login.submit")
          )}
        </Button>

        <div className="my-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/8" />
          <span className="text-xs text-black/40">{t("auth.login.divider")}</span>
          <div className="h-px flex-1 bg-black/8" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.login.signupPrompt")}{" "}
          <a
            href="/auth/sign-up"
            className="text-foreground underline-offset-4 hover:underline"
          >
            {t("auth.login.signupLink")}
          </a>
        </p>
      </form>
    </>
  );
}

export function LoginPageContent() {
  const { t } = useUsersTranslation();

  return (
    <AuthShell
      header={{
        navHref: "/auth/sign-up",
        navLabel: t("auth.shell.navigation.toSignUp"),
      }}
    >
      <LoginForm />
    </AuthShell>
  );
}
