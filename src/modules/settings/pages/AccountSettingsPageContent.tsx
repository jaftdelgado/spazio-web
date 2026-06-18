"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { useAuth } from "@lib/auth/useAuth";
import { ROUTES } from "@/config/routes";
import { AccountDeleteDialog } from "@/modules/settings/components/account/AccountDeleteDialog";
import { AccountDeleteSection } from "@/modules/settings/components/account/AccountDeleteSection";
import { AccountEmailSection } from "@/modules/settings/components/account/AccountEmailSection";
import { AccountIdentitySection } from "@/modules/settings/components/account/AccountIdentitySection";
import { AccountPasswordSection } from "@/modules/settings/components/account/AccountPasswordSection";
import { AccountPersonalSection } from "@/modules/settings/components/account/AccountPersonalSection";
import { AccountPhotoSection } from "@/modules/settings/components/account/AccountPhotoSection";
import { AccountSensitiveChangeDialog } from "@/modules/settings/components/account/AccountSensitiveChangeDialog";
import {
  changePasswordSchema,
  PostChangeDialogState,
  profileSchema,
  requestEmailSchema,
  validateProfilePhoto,
  verifyEmailChangeSchema,
} from "@/modules/settings/components/account/account-settings.shared";
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader";
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
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";
import { getUserErrorMessage } from "@users/lib/user-errors";

type EmailChangeStep = "request" | "verify";
type PasswordVisibility = {
  confirm: boolean;
  current: boolean;
  next: boolean;
};

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
  const [emailChangeStep, setEmailChangeStep] = useState<EmailChangeStep>("request");
  const [pendingEmail, setPendingEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [postChangeDialog, setPostChangeDialog] = useState<PostChangeDialogState>({
    open: false,
    title: "",
    description: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
    current: false,
    next: false,
    confirm: false,
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

  const newPasswordValue =
    useWatch({ control: passwordForm.control, name: "newPassword" }) ?? "";

  const displayPhotoUrl = previewUrl ?? user?.profilePictureUrl ?? null;
  const roleLabel = useMemo(() => user?.roleName ?? "Cuenta", [user?.roleName]);
  const canDeleteAccount = deleteConfirmation.trim() === "ELIMINAR";

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
    });
  }, [profileForm, user]);

  const resetPhotoSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedPhoto(null);
    setPhotoError(null);
  };

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
      await uploadPhotoMutation.mutateAsync({ file: selectedPhoto as File });
      resetPhotoSelection();
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
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
      router.push(ROUTES.auth.login);
    } catch (error) {
      setDeleteError(getUserErrorMessage(error, t("auth.common.unexpectedError")));
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setDeleteConfirmation("");
      setDeleteError(null);
    }
  };

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  return (
    <>
      <div>
        <SettingsPageHeader
          title={t("profile.header.title")}
          description={t("profile.header.description")}
        />

        <AccountIdentitySection
          displayPhotoUrl={displayPhotoUrl}
          email={user?.email ?? "Cuenta"}
          firstName={user?.firstName}
          lastName={user?.lastName}
          roleLabel={roleLabel}
          t={t}
        />

        <div className="my-10 border-t border-border/60" />

        <AccountPersonalSection
          form={profileForm}
          isSubmitting={updateProfileMutation.isPending}
          onSubmit={submitProfile}
          t={t}
        />

        <div className="my-10 border-t border-border/60" />

        <AccountPhotoSection
          displayPhotoUrl={displayPhotoUrl}
          email={user?.email}
          firstName={user?.firstName}
          isUploading={uploadPhotoMutation.isPending}
          lastName={user?.lastName}
          onClear={resetPhotoSelection}
          onPhotoSelect={(file, nextPreviewUrl) => {
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
            setSelectedPhoto(file);
            setPreviewUrl(nextPreviewUrl);
          }}
          onSubmit={() => {
            void submitPhoto();
          }}
          photoError={photoError}
          previewUrl={previewUrl}
          selectedPhoto={selectedPhoto}
          setPhotoError={setPhotoError}
          t={t}
        />

        <div className="my-10 border-t border-border/60" />

        <AccountEmailSection
          currentEmail={user?.email ?? ""}
          pendingEmail={pendingEmail}
          requestForm={emailRequestForm}
          step={emailChangeStep}
          t={t}
          verifyForm={emailVerifyForm}
          isRequestSubmitting={requestEmailChangeMutation.isPending}
          isVerifySubmitting={
            verifyEmailChangeMutation.isPending ||
            confirmEmailChangeMutation.isPending
          }
          onBackToRequest={() => {
            setEmailChangeStep("request");
            emailVerifyForm.reset({ code: "" });
          }}
          onRequestSubmit={submitEmailRequest}
          onVerifySubmit={submitEmailVerification}
        />

        <div className="my-10 border-t border-border/60" />

        <AccountPasswordSection
          form={passwordForm}
          isSubmitting={changePasswordMutation.isPending}
          newPasswordValue={newPasswordValue}
          onSubmit={submitPassword}
          onToggleVisibility={togglePasswordVisibility}
          t={t}
          visibility={passwordVisibility}
        />

        <div className="my-10 border-t border-border/60" />

        <AccountDeleteSection
          onDeleteClick={() => {
            setDeleteError(null);
            setDeleteConfirmation("");
            setDeleteDialogOpen(true);
          }}
          t={t}
        />
      </div>

      <AccountSensitiveChangeDialog
        dialog={postChangeDialog}
        onCloseAndLogout={() => {
          void closeSessionAfterSensitiveChange();
        }}
        t={t}
      />

      <AccountDeleteDialog
        canDelete={canDeleteAccount}
        confirmation={deleteConfirmation}
        error={deleteError}
        isDeleting={deleteAccountMutation.isPending}
        isOpen={deleteDialogOpen}
        onConfirmationChange={setDeleteConfirmation}
        onConfirmDelete={() => {
          void handleDeleteAccount();
        }}
        onOpenChange={handleDeleteDialogChange}
        t={t}
      />
    </>
  );
}
