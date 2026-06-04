"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type ProfileStepProps = {
  onSuccess: (data: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => void;
  onBack?: () => void;
};

const createProfileSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z
      .string()
      .min(1, t("auth.signUp.profile.validation.firstNameRequired"))
      .min(2, t("auth.signUp.profile.validation.minLength"))
      .max(50, t("auth.signUp.profile.validation.maxLength"))
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/,
        t("auth.signUp.profile.validation.lettersOnly"),
      ),
    lastName: z
      .string()
      .min(1, t("auth.signUp.profile.validation.lastNameRequired"))
      .min(2, t("auth.signUp.profile.validation.minLength"))
      .max(50, t("auth.signUp.profile.validation.maxLength"))
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/,
        t("auth.signUp.profile.validation.lettersOnly"),
      ),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[\d\s\-().]{7,20}$/.test(val),
        t("auth.signUp.profile.validation.phoneInvalid"),
      ),
  });

type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;

export function ProfileStep({ onSuccess, onBack }: ProfileStepProps) {
  const { t } = useUsersTranslation();
  const profileSchema = createProfileSchema(t);
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const submitProfile = (values: ProfileFormValues) => {
    onSuccess({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone ?? "",
    });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={profileForm.handleSubmit(submitProfile)}
    >
      <SectionHeader
        title={t("auth.signUp.profile.title")}
        description={t("auth.signUp.profile.description")}
      />

      <div className="space-y-2">
        <Label htmlFor="firstName">
          {t("auth.signUp.profile.fields.firstName.label")}
        </Label>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          placeholder={t("auth.signUp.profile.fields.firstName.placeholder")}
          aria-invalid={Boolean(profileForm.formState.errors.firstName)}
          className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...profileForm.register("firstName")}
        />
        {profileForm.formState.errors.firstName?.message ? (
          <p className="text-sm text-destructive">
            {profileForm.formState.errors.firstName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">
          {t("auth.signUp.profile.fields.lastName.label")}
        </Label>
        <Input
          id="lastName"
          type="text"
          autoComplete="family-name"
          placeholder={t("auth.signUp.profile.fields.lastName.placeholder")}
          aria-invalid={Boolean(profileForm.formState.errors.lastName)}
          className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...profileForm.register("lastName")}
        />
        {profileForm.formState.errors.lastName?.message ? (
          <p className="text-sm text-destructive">
            {profileForm.formState.errors.lastName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("auth.signUp.profile.fields.phone.label")}</Label>
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
            placeholder={t("auth.signUp.profile.fields.phone.placeholder")}
            aria-invalid={Boolean(profileForm.formState.errors.phone)}
            className="h-11 rounded-2xl border-input bg-background pl-10 pr-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            {...profileForm.register("phone")}
          />
        </div>
        {profileForm.formState.errors.phone?.message ? (
          <p className="text-sm text-destructive">
            {profileForm.formState.errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-1">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            className="h-9 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onBack}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
            {t("auth.common.actions.back")}
          </Button>
        ) : (
          <div />
        )}
        <Button type="submit" className="h-10 w-full text-[15px]">
          {t("auth.common.actions.continue")}
        </Button>
      </div>
    </form>
  );
}
