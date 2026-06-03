"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft01Icon,
  Loading03Icon,
  LockPasswordIcon,
  Mail01Icon,
  MailSecure01Icon,
  SmartPhone01Icon,
  UserIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { HttpError } from "@lib/http/http-errors";
import {
  useCompleteRegister,
  usePreRegister,
  useVerifyEmail,
} from "@users/application/hooks/useUsers";

type Step = "email" | "otp" | "profile" | "password";

const steps = ["email", "otp", "profile", "password"] as const;

const inputClassName =
  "h-11 rounded-2xl border-black/10 bg-[#f5f5f7] px-4 text-[15px] shadow-none focus-visible:border-black/25 focus-visible:ring-black/10";

const inputWithIconClassName =
  "h-11 rounded-2xl border-black/10 bg-[#f5f5f7] pl-10 pr-10 text-[15px] shadow-none focus-visible:border-black/25 focus-visible:ring-black/10";

const emailSchema = z.object({
  email: z.string().email("Correo invalido"),
});

const profileSchema = z.object({
  firstName: z.string().min(2, "Minimo 2 caracteres"),
  lastName: z.string().min(2, "Minimo 2 caracteres"),
  phone: z.string().optional().refine(
    (value) => !value || value.replace(/\D/g, "").length >= 7,
    { message: "Telefono invalido" },
  ),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimo 8 caracteres")
      .max(32, "Maximo 32 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una mayuscula")
      .regex(/[0-9]/, "Debe incluir al menos un numero")
      .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un caracter especial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const strengthColors = [
  "bg-black/10",
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-green-500",
];

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

const getStepLabel = (step: Step) => {
  return `${steps.indexOf(step) + 1} / ${steps.length}`;
};

const getPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return score;
};

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const preRegisterMutation = usePreRegister();
  const resendMutation = usePreRegister();
  const verifyEmailMutation = useVerifyEmail();
  const completeRegisterMutation = useCompleteRegister();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

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
  const passwordStrength = getPasswordStrength(watchedPassword);

  useEffect(() => {
    if (step !== "otp" || resendSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendSeconds, step]);

  const submitEmail = async (values: EmailFormValues) => {
    setEmailError("");

    try {
      await preRegisterMutation.mutateAsync({ email: values.email });
      setEmail(values.email);
      setOtpCode("");
      setOtpError("");
      setVerificationToken("");
      setResendSeconds(45);
      setStep("otp");
    } catch (error) {
      setEmailError(getErrorMessage(error));
    }
  };

  const submitOtp = async (code: string) => {
    if (verifyEmailMutation.isPending || code.length !== 6) {
      return;
    }

    setOtpError("");

    try {
      const result = await verifyEmailMutation.mutateAsync({ email, code });
      setVerificationToken(result.verificationToken);
      setStep("profile");
    } catch (error) {
      setOtpCode("");
      setOtpError(getErrorMessage(error));
    }
  };

  const resendCode = async () => {
    if (resendSeconds > 0 || resendMutation.isPending) {
      return;
    }

    setOtpError("");

    try {
      await resendMutation.mutateAsync({ email });
      setOtpCode("");
      setResendSeconds(45);
    } catch (error) {
      setOtpError(getErrorMessage(error));
    }
  };

  const submitProfile = (values: ProfileFormValues) => {
    setFirstName(values.firstName);
    setLastName(values.lastName);
    setPhone(values.phone ?? "");
    setRegisterError("");
    setRegisterSuccess("");
    setStep("password");
  };

  const submitPassword = async (values: PasswordFormValues) => {
    setRegisterError("");
    setRegisterSuccess("");

    try {
      await completeRegisterMutation.mutateAsync({
        verificationToken,
        firstName,
        lastName,
        phone: phone || undefined,
        password: values.password,
      });
      setRegisterSuccess("Cuenta creada");
    } catch (error) {
      setRegisterError(getErrorMessage(error));
    }
  };

  const renderStepDots = () => {
    const currentStepIndex = steps.indexOf(step);

    return steps.map((currentStep, index) => (
      <span
        key={currentStep}
        className={
          currentStep === step
            ? "size-1.5 rounded-full bg-black"
            : currentStepIndex > index
              ? "size-1.5 rounded-full bg-black/70"
              : "size-1.5 rounded-full bg-black/15"
        }
      />
    ));
  };

  const renderEmailStep = () => (
    <form className="space-y-5" onSubmit={emailForm.handleSubmit(submitEmail)}>
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <HugeiconsIcon icon={Mail01Icon} size={17} strokeWidth={1.7} />
          Correo electronico
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          aria-invalid={
            Boolean(emailForm.formState.errors.email) || Boolean(emailError)
          }
          className={inputClassName}
          {...emailForm.register("email")}
        />
        {emailForm.formState.errors.email?.message ? (
          <p className="text-sm text-red-600">
            {emailForm.formState.errors.email.message}
          </p>
        ) : null}
        {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
      </div>

      <Button
        type="submit"
        disabled={preRegisterMutation.isPending}
        className="h-11 w-full rounded-2xl bg-black text-[15px] font-medium text-white hover:bg-black/85"
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

  const renderOtpStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <HugeiconsIcon icon={MailSecure01Icon} size={17} strokeWidth={1.7} />
          Codigo
        </div>
        <p className="text-sm leading-6 text-black/55">
          Enviado a <span className="text-black">{email}</span>
        </p>
      </div>

      <div className="space-y-3">
        <InputOTP
          maxLength={6}
          value={otpCode}
          disabled={verifyEmailMutation.isPending}
          onChange={(value) => {
            setOtpCode(value);
            setOtpError("");
          }}
          onComplete={(value) => {
            void submitOtp(value);
          }}
          containerClassName="justify-center gap-2"
        >
          <InputOTPGroup>
            <InputOTPSlot
              index={0}
              className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
            />
            <InputOTPSlot
              index={1}
              className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
            />
            <InputOTPSlot
              index={2}
              className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
            />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot
              index={3}
              className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
            />
            <InputOTPSlot
              index={4}
              className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
            />
            <InputOTPSlot
              index={5}
              className="size-11 border-black/10 bg-[#f5f5f7] text-base data-[active=true]:border-black/25 data-[active=true]:ring-black/10"
            />
          </InputOTPGroup>
        </InputOTP>

        <div className="min-h-5 text-center text-sm">
          {verifyEmailMutation.isPending ? (
            <span className="inline-flex items-center gap-2 text-black/50">
              <HugeiconsIcon
                icon={Loading03Icon}
                size={16}
                className="animate-spin"
              />
              Verificando
            </span>
          ) : otpError ? (
            <span className="text-red-600">{otpError}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full px-2 text-black/60 hover:bg-black/[0.04] hover:text-black"
          onClick={() => {
            setStep("email");
            setOtpCode("");
            setOtpError("");
          }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          Volver
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={resendSeconds > 0 || resendMutation.isPending}
          className="h-9 rounded-full px-3 text-black/60 hover:bg-black/[0.04] hover:text-black"
          onClick={() => {
            void resendCode();
          }}
        >
          {resendMutation.isPending
            ? "Enviando"
            : resendSeconds > 0
              ? `Reenviar ${resendSeconds}s`
              : "Reenviar"}
        </Button>
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <form
      className="space-y-5"
      onSubmit={profileForm.handleSubmit(submitProfile)}
    >
      <div className="space-y-2">
        <Label
          htmlFor="firstName"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <HugeiconsIcon icon={UserIcon} size={17} strokeWidth={1.7} />
          Nombre
        </Label>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          placeholder="Nombre"
          aria-invalid={Boolean(profileForm.formState.errors.firstName)}
          className={inputClassName}
          {...profileForm.register("firstName")}
        />
        {profileForm.formState.errors.firstName?.message ? (
          <p className="text-sm text-red-600">
            {profileForm.formState.errors.firstName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="lastName"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <HugeiconsIcon icon={UserIcon} size={17} strokeWidth={1.7} />
          Apellidos
        </Label>
        <Input
          id="lastName"
          type="text"
          autoComplete="family-name"
          placeholder="Apellidos"
          aria-invalid={Boolean(profileForm.formState.errors.lastName)}
          className={inputClassName}
          {...profileForm.register("lastName")}
        />
        {profileForm.formState.errors.lastName?.message ? (
          <p className="text-sm text-red-600">
            {profileForm.formState.errors.lastName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="phone"
          className="flex items-center gap-2 text-sm font-medium"
        >
          Telefono
        </Label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
            <HugeiconsIcon
              icon={SmartPhone01Icon}
              size={17}
              strokeWidth={1.7}
            />
          </span>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="10 digitos"
            aria-invalid={Boolean(profileForm.formState.errors.phone)}
            className={inputWithIconClassName}
            {...profileForm.register("phone")}
          />
        </div>
        {profileForm.formState.errors.phone?.message ? (
          <p className="text-sm text-red-600">
            {profileForm.formState.errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full px-2 text-black/60 hover:bg-black/[0.04] hover:text-black"
          onClick={() => setStep("otp")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          Volver
        </Button>
        <Button
          type="submit"
          className="h-11 min-w-32 rounded-2xl bg-black px-5 text-[15px] font-medium text-white hover:bg-black/85"
        >
          Continuar
        </Button>
      </div>
    </form>
  );

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
      <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        <HugeiconsIcon icon={LockPasswordIcon} size={17} strokeWidth={1.7} />
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
          <HugeiconsIcon icon={LockPasswordIcon} size={17} strokeWidth={1.7} />
        </span>
        <Input
          id={id}
          type={showValue ? "text" : "password"}
          autoComplete={fieldName === "password" ? "new-password" : "off"}
          aria-invalid={Boolean(error)}
          className={inputWithIconClassName}
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );

  const renderPasswordStep = () => (
    <form
      className="space-y-5"
      onSubmit={passwordForm.handleSubmit(submitPassword)}
    >
      <div className="space-y-3">
        {renderPasswordInput({
          id: "password",
          label: "Contrasena",
          fieldName: "password",
          showValue: showPassword,
          onToggle: () => setShowPassword((value) => !value),
          error: passwordForm.formState.errors.password?.message,
        })}
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                index < passwordStrength
                  ? strengthColors[passwordStrength]
                  : "bg-black/10"
              }`}
            />
          ))}
        </div>
      </div>

      {renderPasswordInput({
        id: "confirmPassword",
        label: "Confirmar contrasena",
        fieldName: "confirmPassword",
        showValue: showConfirm,
        onToggle: () => setShowConfirm((value) => !value),
        error: passwordForm.formState.errors.confirmPassword?.message,
      })}

      {registerError ? (
        <p className="text-sm text-red-600">{registerError}</p>
      ) : null}
      {registerSuccess ? (
        <p className="text-sm text-black/55">{registerSuccess}</p>
      ) : null}

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-full px-2 text-black/60 hover:bg-black/[0.04] hover:text-black"
          onClick={() => {
            setRegisterError("");
            setRegisterSuccess("");
            setStep("profile");
          }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          Volver
        </Button>
        <Button
          type="submit"
          disabled={completeRegisterMutation.isPending || Boolean(registerSuccess)}
          className="h-11 min-w-32 rounded-2xl bg-black px-5 text-[15px] font-medium text-white hover:bg-black/85"
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

  const renderCurrentStep = () => {
    switch (step) {
      case "email":
        return renderEmailStep();
      case "otp":
        return renderOtpStep();
      case "profile":
        return renderProfileStep();
      case "password":
        return renderPasswordStep();
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-white px-6 py-10 text-[#1d1d1f]">
      <section className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <p className="text-[28px] font-semibold tracking-tight">Spazio</p>
        </div>

        <Card className="rounded-[28px] border-black/[0.08] bg-white py-0 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <CardContent className="px-6 py-7 sm:px-7">
            <div className="mb-7 flex items-center justify-between">
              <span className="text-xs font-medium text-black/45">
                {getStepLabel(step)}
              </span>
              <div className="flex gap-1.5">{renderStepDots()}</div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
