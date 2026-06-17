"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera01Icon,
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
  LockPasswordIcon,
  Mail01Icon,
  ProfileIcon,
  Shield01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@lib/auth/useAuth";
import { ROUTES } from "@/config/routes";
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader";
import {
  SettingsField,
  SettingsSection,
} from "@/modules/settings/components/SettingsSection";
import {
  useChangePassword,
  useConfirmEmailChange,
  useDeleteAccount,
  useLogout,
  useRequestEmailChange,
  useUpdateProfile,
  useUploadProfilePhoto,
  useVerifyEmailChange,
} from "@users/application/hooks/useUsers";
import { PasswordStrengthBar } from "@users/components/sign-up/PasswordStrengthBar";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";
import { createStrongPasswordSchema } from "@users/lib/password-schema";
import { getUserErrorMessage } from "@users/lib/user-errors";

const profilePhotoMaxSizeBytes = 5 * 1024 * 1024;
const supportedProfilePhotoTypes = ["image/jpeg", "image/png", "image/webp"];

const profileSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, t("profile.personal.validation.firstName")),
    lastName: z
      .string()
      .trim()
      .min(1, t("profile.personal.validation.lastName")),
    phone: z.string().optional(),
  });

const requestEmailSchema = (t: (key: string) => string) =>
  z.object({
    newEmail: z.string().email(t("auth.login.validation.emailInvalid")),
  });

const verifyEmailChangeSchema = z.object({
  code: z.string().length(6),
});

const changePasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      currentPassword: z
        .string()
        .min(1, t("profile.password.validation.currentRequired")),
      newPassword: createStrongPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("auth.signUp.password.validation.confirmMismatch"),
      path: ["confirmPassword"],
    });

function getInitials(firstName?: string, lastName?: string, email?: string) {
  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  const source = fullName || email || "SP";

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: typeof ProfileIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border bg-card px-4 py-4">
      <div className="mb-3 flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} size={18} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

type PostChangeDialogState = {
  description: string;
  open: boolean;
  title: string;
};

function validateProfilePhoto(file: File | null, t: (key: string) => string) {
  if (!file) {
    return t("profile.photo.validation.required");
  }

  if (!supportedProfilePhotoTypes.includes(file.type)) {
    return t("profile.photo.validation.format");
  }

  if (file.size > profilePhotoMaxSizeBytes) {
    return t("profile.photo.validation.size");
  }

  return null;
}

export function AccountSettingsPageContent() {
  const router = useRouter();
  const { t } = useUsersTranslation();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const requestEmailChangeMutation = useRequestEmailChange();
  const verifyEmailChangeMutation = useVerifyEmailChange();
  const confirmEmailChangeMutation = useConfirmEmailChange();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();
  const logoutMutation = useLogout();

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [emailChangeStep, setEmailChangeStep] = useState<"request" | "verify">(
    "request",
  );
  const [pendingEmail, setPendingEmail] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [postChangeDialog, setPostChangeDialog] = useState<PostChangeDialogState>({
    open: false,
    title: "",
    description: "",
  });

  const profileForm = useForm<z.infer<ReturnType<typeof profileSchema>>>({
    resolver: zodResolver(profileSchema(t)),
    defaultValues: { firstName: "", lastName: "", phone: "" },
  });

  const emailRequestForm = useForm<z.infer<ReturnType<typeof requestEmailSchema>>>({
    resolver: zodResolver(requestEmailSchema(t)),
    defaultValues: { newEmail: "" },
  });

  const emailVerifyForm = useForm<z.infer<typeof verifyEmailChangeSchema>>({
    resolver: zodResolver(verifyEmailChangeSchema),
    defaultValues: { code: "" },
  });

  const passwordForm = useForm<z.infer<ReturnType<typeof changePasswordSchema>>>({
    resolver: zodResolver(changePasswordSchema(t)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const currentPasswordValue =
    useWatch({
      control: passwordForm.control,
      name: "newPassword",
    }) ?? "";

  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const displayPhotoUrl = previewUrl ?? user?.profilePictureUrl ?? null;

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
    });
  }, [profileForm, user]);

  const roleLabel = useMemo(() => user?.roleName ?? "Cuenta", [user?.roleName]);
  const canDeleteAccount = deleteConfirmation.trim() === "ELIMINAR";

  const closeSessionAfterSensitiveChange = async () => {
    setPostChangeDialog((current) => ({ ...current, open: false }));
    await logoutMutation.mutateAsync();
    router.replace(ROUTES.auth.login);
  };

  const submitProfile = async (
    values: z.infer<ReturnType<typeof profileSchema>>,
  ) => {
    try {
      const result = await updateProfileMutation.mutateAsync(values);
      profileForm.reset({
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone ?? "",
      });
      toast.success(t("profile.personal.successTitle"), {
        description: result.message,
      });
    } catch (error) {
      profileForm.setError("root", {
        message: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  const submitPhoto = async () => {
    const validationError = validateProfilePhoto(selectedPhoto, t);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }

    try {
      setPhotoError(null);
      await uploadPhotoMutation.mutateAsync({ file: selectedPhoto });
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedPhoto(null);
      toast.success(t("profile.photo.successTitle"), {
        description: t("profile.common.save"),
      });
    } catch (error) {
      toast.error(t("profile.photo.errorTitle"), {
        description: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  const submitEmailRequest = async (
    values: z.infer<ReturnType<typeof requestEmailSchema>>,
  ) => {
    try {
      await requestEmailChangeMutation.mutateAsync({ newEmail: values.newEmail });
      setPendingEmail(values.newEmail);
      setEmailChangeStep("verify");
      toast.success(t("profile.email.requestSuccessTitle"), {
        description: t("profile.email.requestSuccessDescription"),
      });
    } catch (error) {
      emailRequestForm.setError("root", {
        message: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  const submitEmailVerification = async (
    values: z.infer<typeof verifyEmailChangeSchema>,
  ) => {
    try {
      const verification = await verifyEmailChangeMutation.mutateAsync({
        newEmail: pendingEmail,
        code: values.code,
      });

      const result = await confirmEmailChangeMutation.mutateAsync({
        verificationToken: verification.verificationToken,
      });

      setEmailChangeStep("request");
      setPendingEmail("");
      emailRequestForm.reset({ newEmail: "" });
      emailVerifyForm.reset({ code: "" });

      setPostChangeDialog({
        open: true,
        title: t("profile.email.sessionDialog.successTitle"),
        description: result.message,
      });
    } catch (error) {
      setPostChangeDialog({
        open: true,
        title: t("profile.email.sessionDialog.errorTitle"),
        description: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  const submitPassword = async (
    values: z.infer<ReturnType<typeof changePasswordSchema>>,
  ) => {
    try {
      const result = await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      setPostChangeDialog({
        open: true,
        title: t("profile.password.sessionDialog.successTitle"),
        description: result.message,
      });
    } catch (error) {
      setPostChangeDialog({
        open: true,
        title: t("profile.password.sessionDialog.errorTitle"),
        description: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    try {
      await deleteAccountMutation.mutateAsync();
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation("");
      router.push(ROUTES.auth.login);
    } catch (error) {
      setDeleteError(getUserErrorMessage(error, t("auth.common.unexpectedError")));
    }
  };

  return (
    <>
      <div>
        <SettingsPageHeader
          title={t("profile.header.title")}
          description={t("profile.header.description")}
        />

        <SettingsSection
          title={t("profile.identity.title")}
          hint={t("profile.identity.hint")}
        >
          <div className="flex items-center gap-4 rounded-3xl border bg-card px-4 py-4">
            <Avatar className="size-14">
              {displayPhotoUrl ? (
                <AvatarImage alt={user?.email ?? "profile"} src={displayPhotoUrl} />
              ) : null}
              <AvatarFallback>
                {getInitials(user?.firstName, user?.lastName, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {user ? `${user.firstName} ${user.lastName}`.trim() : "Spazio"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {user?.email ?? "Cuenta"}
              </p>
            </div>
            <div className="rounded-2xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {roleLabel}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              icon={Mail01Icon}
              label={t("profile.identity.emailLabel")}
              value={user?.email ?? "-"}
            />
            <InfoCard
              icon={Shield01Icon}
              label={t("profile.identity.roleLabel")}
              value={roleLabel}
            />
          </div>
        </SettingsSection>

        <div className="my-10 border-t border-border/60" />

        <SettingsSection
          title={t("profile.personal.title")}
          hint={t("profile.personal.hint")}
        >
          <form className="space-y-4" onSubmit={profileForm.handleSubmit(submitProfile)}>
            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField
                htmlFor="settings-first-name"
                label={t("profile.personal.firstName")}
              >
                <Input
                  id="settings-first-name"
                  autoComplete="given-name"
                  {...profileForm.register("firstName")}
                />
                {profileForm.formState.errors.firstName?.message ? (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.firstName.message}
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
                  {...profileForm.register("lastName")}
                />
                {profileForm.formState.errors.lastName?.message ? (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.lastName.message}
                  </p>
                ) : null}
              </SettingsField>
            </div>

            <SettingsField htmlFor="settings-phone" label={t("profile.personal.phone")}>
              <Input
                id="settings-phone"
                autoComplete="tel"
                {...profileForm.register("phone")}
              />
            </SettingsField>

            {profileForm.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">
                {profileForm.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button disabled={updateProfileMutation.isPending} type="submit">
                {updateProfileMutation.isPending
                  ? t("profile.common.saving")
                  : t("profile.common.save")}
              </Button>
            </div>
          </form>
        </SettingsSection>

        <div className="my-10 border-t border-border/60" />

        <SettingsSection
          title={t("profile.photo.title")}
          hint={t("profile.photo.hint")}
        >
          <div className="flex flex-col gap-5 rounded-3xl border bg-card p-5 md:flex-row md:items-center">
            <Avatar className="size-22">
              {displayPhotoUrl ? (
                <AvatarImage
                  alt={t("profile.photo.previewAlt")}
                  src={displayPhotoUrl}
                />
              ) : null}
              <AvatarFallback>
                {getInitials(user?.firstName, user?.lastName, user?.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("profile.photo.description")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("profile.photo.requirements")}
              </p>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  <HugeiconsIcon icon={Camera01Icon} size={16} />
                  <span>{t("profile.photo.pickFile")}</span>
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    type="file"
                    onChange={(event) => {
                      const files = event.target.files;
                      if (!files || files.length === 0) {
                        setPhotoError(null);
                        return;
                      }

                      if (files.length > 1) {
                        setPhotoError(t("profile.photo.validation.single"));
                        event.target.value = "";
                        return;
                      }

                      const nextFile = files[0] ?? null;
                      const validationError = validateProfilePhoto(nextFile, t);

                      if (validationError) {
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                        }
                        setPreviewUrl(null);
                        setSelectedPhoto(null);
                        setPhotoError(validationError);
                        event.target.value = "";
                        return;
                      }

                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPhotoError(null);
                      setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : null);
                      setSelectedPhoto(nextFile);
                    }}
                  />
                </label>
                <Button
                  disabled={!selectedPhoto || uploadPhotoMutation.isPending}
                  type="button"
                  onClick={() => {
                    void submitPhoto();
                  }}
                >
                  {uploadPhotoMutation.isPending ? (
                    <>
                      <HugeiconsIcon
                        className="animate-spin"
                        icon={Loading03Icon}
                        size={16}
                      />
                      <span>{t("profile.photo.uploading")}</span>
                    </>
                  ) : (
                    t("profile.photo.upload")
                  )}
                </Button>
                {selectedPhoto ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPreviewUrl(null);
                      setSelectedPhoto(null);
                      setPhotoError(null);
                    }}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                    <span>{t("profile.photo.clear")}</span>
                  </Button>
                ) : null}
              </div>
              {photoError ? (
                <p className="text-sm text-destructive">{photoError}</p>
              ) : null}
            </div>
          </div>
        </SettingsSection>

        <div className="my-10 border-t border-border/60" />

        <SettingsSection
          title={t("profile.email.title")}
          hint={t("profile.email.hint")}
        >
          {emailChangeStep === "request" ? (
            <form
              className="space-y-4"
              onSubmit={emailRequestForm.handleSubmit(submitEmailRequest)}
            >
              <SettingsField
                htmlFor="settings-email-current"
                label={t("profile.email.current")}
              >
                <Input disabled id="settings-email-current" value={user?.email ?? ""} />
              </SettingsField>

              <SettingsField
                htmlFor="settings-email-next"
                label={t("profile.email.new")}
              >
                <Input
                  id="settings-email-next"
                  type="email"
                  autoComplete="email"
                  {...emailRequestForm.register("newEmail")}
                />
              </SettingsField>

              {emailRequestForm.formState.errors.root?.message ? (
                <p className="text-sm text-destructive">
                  {emailRequestForm.formState.errors.root.message}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button
                  disabled={requestEmailChangeMutation.isPending}
                  type="submit"
                >
                  {requestEmailChangeMutation.isPending
                    ? t("profile.common.saving")
                    : t("profile.email.requestSubmit")}
                </Button>
              </div>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={emailVerifyForm.handleSubmit(submitEmailVerification)}
            >
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
                  {...emailVerifyForm.register("code")}
                />
              </SettingsField>

              {emailVerifyForm.formState.errors.root?.message ? (
                <p className="text-sm text-destructive">
                  {emailVerifyForm.formState.errors.root.message}
                </p>
              ) : null}

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEmailChangeStep("request");
                    emailVerifyForm.reset({ code: "" });
                  }}
                >
                  {t("auth.common.actions.back")}
                </Button>
                <Button
                  disabled={
                    verifyEmailChangeMutation.isPending ||
                    confirmEmailChangeMutation.isPending
                  }
                  type="submit"
                >
                  {verifyEmailChangeMutation.isPending ||
                  confirmEmailChangeMutation.isPending
                    ? t("profile.common.saving")
                    : t("profile.email.verifySubmit")}
                </Button>
              </div>
            </form>
          )}
        </SettingsSection>

        <div className="my-10 border-t border-border/60" />

        <SettingsSection
          title={t("profile.password.title")}
          hint={t("profile.password.hint")}
        >
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit(submitPassword)}
          >
            {[
              {
                id: "settings-password-current",
                key: "currentPassword" as const,
                label: t("profile.password.current"),
                autoComplete: "current-password",
                show: showPassword.current,
                toggle: () =>
                  setShowPassword((current) => ({
                    ...current,
                    current: !current.current,
                  })),
              },
              {
                id: "settings-password-next",
                key: "newPassword" as const,
                label: t("profile.password.new"),
                autoComplete: "new-password",
                show: showPassword.next,
                toggle: () =>
                  setShowPassword((current) => ({
                    ...current,
                    next: !current.next,
                  })),
              },
              {
                id: "settings-password-confirm",
                key: "confirmPassword" as const,
                label: t("profile.password.confirm"),
                autoComplete: "new-password",
                show: showPassword.confirm,
                toggle: () =>
                  setShowPassword((current) => ({
                    ...current,
                    confirm: !current.confirm,
                  })),
              },
            ].map((field) => (
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
                    className="h-11 rounded-2xl border-input bg-background pl-10 pr-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
                    {...passwordForm.register(field.key)}
                  />
                  <button
                    aria-label={
                      field.show
                        ? t("auth.common.hidePassword")
                        : t("auth.common.showPassword")
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    type="button"
                    onClick={field.toggle}
                  >
                    <HugeiconsIcon
                      icon={field.show ? ViewOffSlashIcon : ViewIcon}
                      size={17}
                      strokeWidth={1.7}
                    />
                  </button>
                </div>
                {passwordForm.formState.errors[field.key]?.message ? (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors[field.key]?.message}
                  </p>
                ) : null}
              </SettingsField>
            ))}

            <PasswordStrengthBar password={currentPasswordValue} />

            {passwordForm.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button disabled={changePasswordMutation.isPending} type="submit">
                {changePasswordMutation.isPending
                  ? t("profile.common.saving")
                  : t("profile.password.submit")}
              </Button>
            </div>
          </form>
        </SettingsSection>

        <div className="my-10 border-t border-border/60" />

        <SettingsSection
          title={t("profile.delete.title")}
          hint={t("profile.delete.hint")}
        >
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-4 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-foreground">
                  {t("profile.delete.cardTitle")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("profile.delete.cardDescription")}
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmation("");
                  setIsDeleteDialogOpen(true);
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
                {t("profile.delete.submit")}
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>

      <AlertDialog
        open={postChangeDialog.open}
        onOpenChange={(open) => {
          if (!open && postChangeDialog.open) {
            void closeSessionAfterSensitiveChange();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{postChangeDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {postChangeDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void closeSessionAfterSensitiveChange();
              }}
            >
              {t("profile.securityDialog.action")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeleteConfirmation("");
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.delete.dialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.delete.dialogDescription")}{" "}
              <span className="font-medium text-foreground">ELIMINAR</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {t("profile.delete.dialogWarning")}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="delete-account-confirmation"
              >
                {t("profile.delete.dialogInput")}
              </label>
              <Input
                aria-invalid={Boolean(deleteError)}
                id="delete-account-confirmation"
                placeholder="ELIMINAR"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
              />
            </div>

            {deleteError ? (
              <p className="text-sm text-destructive">{deleteError}</p>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
              {t("profile.delete.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={!canDeleteAccount || deleteAccountMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (!canDeleteAccount || deleteAccountMutation.isPending) return;
                void handleDeleteAccount();
              }}
            >
              {deleteAccountMutation.isPending
                ? t("profile.delete.deleting")
                : t("profile.delete.submit")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
