"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/config/routes";
import {
  useRequestPasswordReset,
  useResetPassword,
  useVerifyPasswordResetCode,
} from "@users/application/hooks/useUsers";
import { PasswordStrengthBar } from "@users/components/sign-up/PasswordStrengthBar";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";
import { AuthShell } from "@users/layouts/AuthShell";
import { createStrongPasswordSchema } from "@users/lib/password-schema";
import { getUserErrorMessage } from "@users/lib/user-errors";

type ForgotPasswordStep = "email" | "otp" | "password";

type ForgotPasswordState = {
  email: string;
  resetToken: string;
  step: ForgotPasswordStep;
};

const STORAGE_KEY = "spazio:forgot-password";

function readStoredState(): ForgotPasswordState | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ForgotPasswordState>;
    if (
      typeof parsed.email === "string" &&
      typeof parsed.resetToken === "string" &&
      (parsed.step === "email" ||
        parsed.step === "otp" ||
        parsed.step === "password")
    ) {
      return {
        email: parsed.email,
        resetToken: parsed.resetToken,
        step: parsed.step,
      };
    }
  } catch {}

  return null;
}

function persistState(state: ForgotPasswordState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearStoredState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

const createEmailSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("auth.login.validation.emailInvalid")),
  });

const createPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: createStrongPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.signUp.password.validation.confirmMismatch"),
      path: ["confirmPassword"],
    });

type EmailFormValues = z.infer<ReturnType<typeof createEmailSchema>>;
type PasswordFormValues = z.infer<ReturnType<typeof createPasswordSchema>>;

function ForgotPasswordEmailStep({
  defaultEmail,
  onSuccess,
}: {
  defaultEmail: string;
  onSuccess: (email: string) => void;
}) {
  const { t } = useUsersTranslation();
  const mutation = useRequestPasswordReset();
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(createEmailSchema(t)),
    defaultValues: { email: defaultEmail },
  });

  const submit = async (values: EmailFormValues) => {
    try {
      await mutation.mutateAsync({ email: values.email });
      onSuccess(values.email);
    } catch (error) {
      form.setError("root", {
        message: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
      <SectionHeader
        className="mb-10"
        title={t("auth.forgotPassword.email.title")}
        description={t("auth.forgotPassword.email.description")}
      />

      <div className="space-y-2">
        <Label htmlFor="forgot-email">{t("auth.common.emailLabel")}</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.common.emailPlaceholder")}
          className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...form.register("email")}
        />
        {form.formState.errors.email?.message ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {t("auth.forgotPassword.email.genericNotice")}
      </div>

      {form.formState.errors.root?.message ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <Button
        className="h-11 w-full rounded-2xl text-[15px]"
        disabled={mutation.isPending}
        type="submit"
      >
        {mutation.isPending ? (
          <HugeiconsIcon
            className="animate-spin"
            icon={Loading03Icon}
            size={18}
          />
        ) : (
          t("auth.forgotPassword.email.submit")
        )}
      </Button>
    </form>
  );
}

function ForgotPasswordOtpStep({
  email,
  onBack,
  onSuccess,
}: {
  email: string;
  onBack: () => void;
  onSuccess: (resetToken: string) => void;
}) {
  const { t } = useUsersTranslation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(45);
  const resendMutation = useRequestPasswordReset();
  const verifyMutation = useVerifyPasswordResetCode();

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timeoutId = window.setTimeout(
      () => setResendSeconds((current) => Math.max(current - 1, 0)),
      1000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [resendSeconds]);

  const submit = async (value: string) => {
    if (value.length !== 6 || verifyMutation.isPending) return;
    setError("");

    try {
      const result = await verifyMutation.mutateAsync({ email, code: value });
      onSuccess(result.resetToken);
    } catch (submitError) {
      setCode("");
      setError(
        getUserErrorMessage(submitError, t("auth.common.unexpectedError")),
      );
    }
  };

  const resend = async () => {
    if (resendSeconds > 0 || resendMutation.isPending) return;
    setError("");
    try {
      await resendMutation.mutateAsync({ email });
      setCode("");
      setResendSeconds(45);
    } catch (submitError) {
      setError(
        getUserErrorMessage(submitError, t("auth.common.unexpectedError")),
      );
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("auth.forgotPassword.otp.title")}
        description={
          <>
            {t("auth.forgotPassword.otp.descriptionPrefix")}{" "}
            <span className="font-medium text-black/75">{email}</span>.{" "}
            {t("auth.forgotPassword.otp.descriptionSuffix")}
          </>
        }
      />

      <div className="space-y-3">
        <InputOTP
          maxLength={6}
          value={code}
          disabled={verifyMutation.isPending}
          onChange={(value) => {
            setCode(value);
            setError("");
          }}
          onComplete={(value) => {
            void submit(value);
          }}
          containerClassName="justify-center gap-2"
        >
          <InputOTPGroup>
            {[0, 1, 2].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
              />
            ))}
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            {[3, 4, 5].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="min-h-5 text-center text-sm">
          {verifyMutation.isPending ? (
            <span className="inline-flex items-center gap-2 text-black/50">
              <HugeiconsIcon
                className="animate-spin"
                icon={Loading03Icon}
                size={16}
              />
              {t("auth.forgotPassword.otp.verifying")}
            </span>
          ) : error ? (
            <span className="text-destructive">{error}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          className="h-9 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          type="button"
          variant="ghost"
          onClick={onBack}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          {t("auth.common.actions.back")}
        </Button>
        <Button
          className="h-9 rounded-full px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
          disabled={resendSeconds > 0 || resendMutation.isPending}
          type="button"
          variant="ghost"
          onClick={() => {
            void resend();
          }}
        >
          {resendMutation.isPending
            ? t("auth.signUp.otp.actions.resending")
            : resendSeconds > 0
              ? t("auth.signUp.otp.actions.resendCountdown", {
                  seconds: resendSeconds,
                })
              : t("auth.signUp.otp.actions.resend")}
        </Button>
      </div>
    </div>
  );
}

function ForgotPasswordResetStep({
  onBack,
  onSuccess,
  resetToken,
}: {
  onBack: () => void;
  onSuccess: () => void;
  resetToken: string;
}) {
  const { t } = useUsersTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const mutation = useResetPassword();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(createPasswordSchema(t)),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue =
    useWatch({ control: form.control, name: "password" }) ?? "";

  const submit = async (values: PasswordFormValues) => {
    try {
      await mutation.mutateAsync({
        resetToken,
        newPassword: values.password,
      });
      onSuccess();
    } catch (error) {
      form.setError("root", {
        message: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  const renderPasswordField = (
    id: string,
    label: string,
    fieldName: "password" | "confirmPassword",
    showValue: boolean,
    onToggle: () => void,
    autoComplete: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
          <HugeiconsIcon icon={LockPasswordIcon} size={17} strokeWidth={1.7} />
        </span>
        <Input
          id={id}
          type={showValue ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={t(
            fieldName === "password"
              ? "auth.signUp.password.fields.password.placeholder"
              : "auth.signUp.password.fields.confirmPassword.placeholder",
          )}
          className="h-11 rounded-2xl border-input bg-background pl-10 pr-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...form.register(fieldName)}
        />
        <button
          aria-label={
            showValue
              ? t("auth.common.hidePassword")
              : t("auth.common.showPassword")
          }
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-black/70"
          type="button"
          onClick={onToggle}
        >
          <HugeiconsIcon
            icon={showValue ? ViewOffSlashIcon : ViewIcon}
            size={17}
            strokeWidth={1.7}
          />
        </button>
      </div>
      {form.formState.errors[fieldName]?.message ? (
        <p className="text-sm text-destructive">
          {form.formState.errors[fieldName]?.message}
        </p>
      ) : null}
    </div>
  );

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
      <SectionHeader
        title={t("auth.forgotPassword.password.title")}
        description={t("auth.forgotPassword.password.description")}
      />

      {renderPasswordField(
        "reset-password",
        t("auth.signUp.password.fields.password.label"),
        "password",
        showPassword,
        () => setShowPassword((value) => !value),
        "new-password",
      )}

      {renderPasswordField(
        "reset-confirm-password",
        t("auth.signUp.password.fields.confirmPassword.label"),
        "confirmPassword",
        showConfirmPassword,
        () => setShowConfirmPassword((value) => !value),
        "new-password",
      )}

      <PasswordStrengthBar password={passwordValue} />

      {form.formState.errors.root?.message ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <div className="flex items-center justify-between pt-1">
        <Button
          className="h-9 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          type="button"
          variant="ghost"
          onClick={onBack}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          {t("auth.common.actions.back")}
        </Button>
        <Button
          className="h-10 min-w-36 px-5 text-[15px]"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? (
            <HugeiconsIcon
              className="animate-spin"
              icon={Loading03Icon}
              size={18}
            />
          ) : (
            t("auth.forgotPassword.password.submit")
          )}
        </Button>
      </div>
    </form>
  );
}

export function ForgotPasswordPageContent() {
  const { t } = useUsersTranslation();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = readStoredState();

      if (stored) {
        if (
          (stored.step === "password" && !stored.resetToken) ||
          (stored.step === "otp" && !stored.email)
        ) {
          clearStoredState();
        } else {
          setEmail(stored.email);
          setResetToken(stored.resetToken);
          setStep(stored.step);
        }
      }

      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    persistState({ email, resetToken, step });
  }, [email, isHydrated, resetToken, step]);

  const header = useMemo(
    () => ({
      navHref: ROUTES.auth.login,
      navLabel: t("auth.shell.navigation.toLogin"),
    }),
    [t],
  );

  if (!isHydrated) {
    return (
      <AuthShell header={header}>
        <div className="flex min-h-40 items-center justify-center">
          <HugeiconsIcon
            className="animate-spin text-muted-foreground"
            icon={Loading03Icon}
            size={22}
          />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell header={header}>
      {step === "email" ? (
        <ForgotPasswordEmailStep
          defaultEmail={email}
          onSuccess={(nextEmail) => {
            setEmail(nextEmail);
            setResetToken("");
            setStep("otp");
          }}
        />
      ) : null}

      {step === "otp" ? (
        <ForgotPasswordOtpStep
          email={email}
          onBack={() => setStep("email")}
          onSuccess={(token) => {
            setResetToken(token);
            setStep("password");
          }}
        />
      ) : null}

      {step === "password" ? (
        <ForgotPasswordResetStep
          resetToken={resetToken}
          onBack={() => setStep("otp")}
          onSuccess={() => {
            clearStoredState();
            toast.success(t("auth.forgotPassword.success.title"), {
              description: t("auth.forgotPassword.success.description"),
            });
            router.replace(ROUTES.auth.login);
          }}
        />
      ) : null}
    </AuthShell>
  );
}
