"use client";

import {
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthBar } from "@users/components/sign-up/PasswordStrengthBar";
import {
  SettingsField,
  SettingsSection,
} from "@/modules/settings/components/SettingsSection";
import { changePasswordSchema } from "@/modules/settings/components/account/account-settings.shared";

type PasswordValues = z.infer<ReturnType<typeof changePasswordSchema>>;

type PasswordVisibility = {
  confirm: boolean;
  current: boolean;
  next: boolean;
};

type AccountPasswordSectionProps = {
  form: UseFormReturn<PasswordValues>;
  isSubmitting: boolean;
  newPasswordValue: string;
  onSubmit: (values: PasswordValues) => void;
  onToggleVisibility: (field: keyof PasswordVisibility) => void;
  t: (key: string) => string;
  visibility: PasswordVisibility;
};

export function AccountPasswordSection({
  form,
  isSubmitting,
  newPasswordValue,
  onSubmit,
  onToggleVisibility,
  t,
  visibility,
}: AccountPasswordSectionProps) {
  const fields = [
    {
      id: "settings-password-current",
      key: "currentPassword" as const,
      label: t("profile.password.current"),
      autoComplete: "current-password",
      show: visibility.current,
      visibilityKey: "current" as const,
    },
    {
      id: "settings-password-next",
      key: "newPassword" as const,
      label: t("profile.password.new"),
      autoComplete: "new-password",
      show: visibility.next,
      visibilityKey: "next" as const,
    },
    {
      id: "settings-password-confirm",
      key: "confirmPassword" as const,
      label: t("profile.password.confirm"),
      autoComplete: "new-password",
      show: visibility.confirm,
      visibilityKey: "confirm" as const,
    },
  ];

  return (
    <SettingsSection
      title={t("profile.password.title")}
      hint={t("profile.password.hint")}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {fields.map((field) => (
          <SettingsField key={field.id} htmlFor={field.id} label={field.label}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  size={17}
                  strokeWidth={1.7}
                />
              </span>
              <Input
                id={field.id}
                type={field.show ? "text" : "password"}
                autoComplete={field.autoComplete}
                className=" border-input bg-background pl-10 pr-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
                {...form.register(field.key)}
              />
              <button
                aria-label={
                  field.show
                    ? t("auth.common.hidePassword")
                    : t("auth.common.showPassword")
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                type="button"
                onClick={() => onToggleVisibility(field.visibilityKey)}
              >
                <HugeiconsIcon
                  icon={field.show ? ViewOffSlashIcon : ViewIcon}
                  size={17}
                  strokeWidth={1.7}
                />
              </button>
            </div>
            {form.formState.errors[field.key]?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors[field.key]?.message}
              </p>
            ) : null}
          </SettingsField>
        ))}

        <PasswordStrengthBar password={newPasswordValue} />

        {form.formState.errors.root?.message ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? t("profile.common.saving")
              : t("profile.password.submit")}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
