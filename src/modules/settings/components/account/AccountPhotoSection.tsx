"use client";

import { Camera01Icon, Cancel01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";
import {
  getInitials,
  validateProfilePhoto,
} from "@/modules/settings/components/account/account-settings.shared";

type AccountPhotoSectionProps = {
  displayPhotoUrl: string | null;
  email?: string;
  firstName?: string;
  isUploading: boolean;
  lastName?: string;
  onClear: () => void;
  onPhotoSelect: (file: File | null, nextPreviewUrl: string | null) => void;
  onSubmit: () => void;
  photoError: string | null;
  previewUrl: string | null;
  selectedPhoto: File | null;
  setPhotoError: (value: string | null) => void;
  t: (key: string) => string;
};

export function AccountPhotoSection({
  displayPhotoUrl,
  email,
  firstName,
  isUploading,
  lastName,
  onClear,
  onPhotoSelect,
  onSubmit,
  photoError,
  previewUrl,
  selectedPhoto,
  setPhotoError,
  t,
}: AccountPhotoSectionProps) {
  return (
    <SettingsSection
      title={t("profile.photo.title")}
      hint={t("profile.photo.hint")}
    >
      <div className="flex flex-col gap-5 rounded-3xl border bg-card p-5 md:flex-row md:items-center">
        <Avatar className="size-22">
          {displayPhotoUrl ? (
            <AvatarImage alt={t("profile.photo.previewAlt")} src={displayPhotoUrl} />
          ) : null}
          <AvatarFallback>{getInitials(firstName, lastName, email)}</AvatarFallback>
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
                    onPhotoSelect(null, null);
                    setPhotoError(validationError);
                    event.target.value = "";
                    return;
                  }

                  setPhotoError(null);
                  onPhotoSelect(nextFile, nextFile ? URL.createObjectURL(nextFile) : null);
                }}
              />
            </label>
            <Button disabled={!selectedPhoto || isUploading} type="button" onClick={onSubmit}>
              {isUploading ? (
                <>
                  <HugeiconsIcon className="animate-spin" icon={Loading03Icon} size={16} />
                  <span>{t("profile.photo.uploading")}</span>
                </>
              ) : (
                t("profile.photo.upload")
              )}
            </Button>
            {selectedPhoto ? (
              <Button type="button" variant="ghost" onClick={onClear}>
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                <span>{t("profile.photo.clear")}</span>
              </Button>
            ) : null}
          </div>
          {photoError ? <p className="text-sm text-destructive">{photoError}</p> : null}
        </div>
      </div>
    </SettingsSection>
  );
}
