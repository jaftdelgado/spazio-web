"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { SectionHeader } from "@/components/ui/section-header";
import { HttpError } from "@lib/http/http-errors";
import { usePreRegister, useVerifyEmail } from "@users/application/hooks/useUsers";

type OtpStepProps = {
  email: string;
  onSuccess: (verificationToken: string) => void;
  onBack: () => void;
};

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

export function OtpStep({ email, onSuccess, onBack }: OtpStepProps) {
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(45);

  const resendMutation = usePreRegister();
  const verifyEmailMutation = useVerifyEmail();

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendSeconds]);

  const submitOtp = async (code: string) => {
    if (verifyEmailMutation.isPending || code.length !== 6) {
      return;
    }

    setOtpError("");

    try {
      const result = await verifyEmailMutation.mutateAsync({ email, code });
      onSuccess(result.verificationToken);
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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Verifica tu correo"
        description={
          <>
            Enviamos un código de 6 dígitos a{" "}
            <span className="font-medium text-black/75">{email}</span>. Revisa
            también tu carpeta de spam.
          </>
        }
      />

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
          className="h-9 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={onBack}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
          Volver
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={resendSeconds > 0 || resendMutation.isPending}
          className="h-9 rounded-full px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
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
}
