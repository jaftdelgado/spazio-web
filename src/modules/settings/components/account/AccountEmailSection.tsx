"use client";

import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SettingsField,
  SettingsSection,
} from "@/modules/settings/components/SettingsSection";
import {
  requestEmailSchema,
  verifyEmailChangeSchema,
} from "@/modules/settings/components/account/account-settings.shared";

type EmailRequestValues = z.infer<ReturnType<typeof requestEmailSchema>>;
type EmailVerifyValues = z.infer<typeof verifyEmailChangeSchema>;

type AccountEmailSectionProps = {
  currentEmail: string;
  pendingEmail: string;
  requestForm: UseFormReturn<EmailRequestValues>;
  step: "request" | "verify";
  t: (key: string, options?: Record<string, string>) => string;
  verifyForm: UseFormReturn<EmailVerifyValues>;
  isRequestSubmitting: boolean;
  isVerifySubmitting: boolean;
  onBackToRequest: () => void;
  onRequestSubmit: (values: EmailRequestValues) => void;
  onVerifySubmit: (values: EmailVerifyValues) => void;
};

export function AccountEmailSection({
  currentEmail,
  isRequestSubmitting,
  isVerifySubmitting,
  onBackToRequest,
  onRequestSubmit,
  onVerifySubmit,
  pendingEmail,
  requestForm,
  step,
  t,
  verifyForm,
}: AccountEmailSectionProps) {
  return (
    <SettingsSection title={t("profile.email.title")} hint={t("profile.email.hint")}>
      {step === "request" ? (
        <form className="space-y-4" onSubmit={requestForm.handleSubmit(onRequestSubmit)}>
          <SettingsField
            htmlFor="settings-email-current"
            label={t("profile.email.current")}
          >
            <Input disabled id="settings-email-current" value={currentEmail} />
          </SettingsField>

          <SettingsField
            htmlFor="settings-email-next"
            label={t("profile.email.new")}
          >
            <Input
              id="settings-email-next"
              type="email"
              autoComplete="email"
              {...requestForm.register("newEmail")}
            />
          </SettingsField>

          {requestForm.formState.errors.root?.message ? (
            <p className="text-sm text-destructive">
              {requestForm.formState.errors.root.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button disabled={isRequestSubmitting} type="submit">
              {isRequestSubmitting ? t("profile.common.saving") : t("profile.email.requestSubmit")}
            </Button>
          </div>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={verifyForm.handleSubmit(onVerifySubmit)}>
          <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {t("profile.email.verifyNotice", { email: pendingEmail })}
          </div>

          <SettingsField
            htmlFor="settings-email-code"
            label={t("profile.email.code")}
          >
            <Input
              id="settings-email-code"
              inputMode="numeric"
              maxLength={6}
              {...verifyForm.register("code")}
            />
          </SettingsField>

          {verifyForm.formState.errors.root?.message ? (
            <p className="text-sm text-destructive">
              {verifyForm.formState.errors.root.message}
            </p>
          ) : null}

          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={onBackToRequest}>
              {t("auth.common.actions.back")}
            </Button>
            <Button disabled={isVerifySubmitting} type="submit">
              {isVerifySubmitting ? t("profile.common.saving") : t("profile.email.verifySubmit")}
            </Button>
          </div>
        </form>
      )}
    </SettingsSection>
  );
}
