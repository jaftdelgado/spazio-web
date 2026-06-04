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
import { AuthShell } from "@users/layouts/AuthShell";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpError) {
    const body = error.body as { error?: string } | null;

    return body?.error ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLogin();
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitLogin = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      router.push("/explore");
    } catch (error) {
      loginForm.setError("root", { message: getErrorMessage(error) });
    }
  };

  return (
    <>
      <SectionHeader
        className="mb-10"
        title="Iniciar sesión"
        description="Ingresa tus credenciales para continuar"
      />

      <form
        className="space-y-5"
        onSubmit={loginForm.handleSubmit(submitLogin)}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Correo electronico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
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
          <Label htmlFor="password">Contrasena</Label>
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
              placeholder="Tu contraseña"
              aria-invalid={Boolean(loginForm.formState.errors.password)}
              className="h-11 rounded-2xl border-input bg-background pl-10 pr-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
              {...loginForm.register("password")}
            />
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
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
            "Iniciar sesión"
          )}
        </Button>

        <div className="my-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-black/8" />
          <span className="text-xs text-black/40">o</span>
          <div className="h-px flex-1 bg-black/8" />
        </div>

        <p className="text-center text-sm text-black/50">
          ¿No tienes cuenta?{" "}
          <a
            href="/auth/sign-up"
            className="text-black underline-offset-4 hover:underline"
          >
            Regístrate
          </a>
        </p>
      </form>
    </>
  );
}

export function LoginPageContent() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
