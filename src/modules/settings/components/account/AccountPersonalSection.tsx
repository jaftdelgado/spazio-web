"use client";

import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SettingsField,
  SettingsSection,
} from "@/modules/settings/components/SettingsSection";
import { profileSchema } from "@/modules/settings/components/account/account-settings.shared";

type ProfileValues = z.infer<ReturnType<typeof profileSchema>>;

type AccountPersonalSectionProps = {
  form: UseFormReturn<ProfileValues>;
  isSubmitting: boolean;
  onSubmit: (values: ProfileValues) => void;
  t: (key: string) => string;
};

export function AccountPersonalSection({
  form,
  isSubmitting,
  onSubmit,
  t,
}: AccountPersonalSectionProps) {
  return (
    <SettingsSection
      title={t("profile.personal.title")}
      hint={t("profile.personal.hint")}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsField
            htmlFor="settings-first-name"
            label={t("profile.personal.firstName")}
          >
            <Input
              id="settings-first-name"
              autoComplete="given-name"
              {...form.register("firstName")}
            />
            {form.formState.errors.firstName?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            ) : null}
          </SettingsField>

          <SettingsField
            htmlFor="settings-last-name"
            label={t("profile.personal.lastName")}
          >
            <Input
              id="settings-last-name"
              autoComplete="family-name"
              {...form.register("lastName")}
            />
            {form.formState.errors.lastName?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            ) : null}
          </SettingsField>
        </div>

        <SettingsField
          htmlFor="settings-phone"
          label={t("profile.personal.phone")}
        >
          <Input id="settings-phone" autoComplete="tel" {...form.register("phone")} />
        </SettingsField>

        {form.formState.errors.root?.message ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? t("profile.common.saving") : t("profile.common.save")}
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
